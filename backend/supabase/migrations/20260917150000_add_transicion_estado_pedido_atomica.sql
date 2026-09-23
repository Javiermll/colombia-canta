-- ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): el PATCH admin de
-- `pedidos.js` cambiaba el estado hacia/desde 'cancelado' con el patrón
-- "leer estado actual en JS, decidir, después actuar" — 2 peticiones casi
-- simultáneas (2 clics del admin, o 2 pestañas abiertas) podían las 2 leer
-- el mismo estado viejo antes de que cualquiera escribiera, y las 2
-- ejecutar la restauración/reconsumo de stock y cupón — devolviendo o
-- retomando el mismo cupón/stock 2 veces.
--
-- Esta función mueve TODO (leer, bloquear, decidir, compensar stock/cupón, y
-- escribir el nuevo estado) a una sola transacción de Postgres: el
-- `select ... for update` bloquea la fila hasta que la transacción termina,
-- así que una segunda llamada concurrente para el MISMO pedido queda
-- esperando, y cuando le toca el turno ve el estado YA actualizado (no el
-- viejo) — no puede "ganar" la misma transición 2 veces. Si la
-- reactivación falla (sin stock o sin cupón disponible), la excepción
-- deshace TODO lo que esta misma función haya hecho hasta ahí (Postgres
-- revierte la transacción completa de una función que termina con error).
--
-- Solo maneja la transición de `estado` + su compensación de stock/cupón —
-- el resto de los campos del PATCH (nombre, dirección, etc.) se siguen
-- guardando aparte, tal como ya hacía `pedidos.js` (esos campos no tienen
-- ningún efecto secundario que compensar, no hace falta que pasen por acá).
create or replace function actualizar_estado_pedido(
  p_pedido_id uuid,
  p_nuevo_estado text
) returns void
language plpgsql
security definer
as $$
declare
  v_actual pedidos;
  v_items jsonb;
  v_cupon_id uuid;
begin
  select * into v_actual from pedidos where id = p_pedido_id for update;

  if not found then
    raise exception 'pedido_no_encontrado' using errcode = 'P0001';
  end if;

  -- Idempotente: si ya está en ese estado (por ejemplo, una 2da petición que
  -- llegó justo después de que la 1ra ya lo dejó así), no hace nada más.
  if v_actual.estado = p_nuevo_estado then
    return;
  end if;

  if p_nuevo_estado = 'cancelado' then
    select jsonb_agg(jsonb_build_object('variante_id', producto_variante_id, 'cantidad', cantidad))
      into v_items
      from pedido_items
      where pedido_id = p_pedido_id
        and producto_variante_id is not null;

    if v_items is not null then
      perform restaurar_stock_pedido(v_items);
    end if;

    if v_actual.cupon_codigo is not null then
      select id into v_cupon_id from cupones where codigo = v_actual.cupon_codigo;
      if v_cupon_id is not null then
        perform devolver_uso_cupon(v_cupon_id);
      end if;
    end if;

  elsif v_actual.estado = 'cancelado' then
    -- Sale de 'cancelado' hacia cualquier otro estado -> hay que volver a
    -- descontar stock y reconsumir el cupón de verdad, como si se estuviera
    -- comprando otra vez. `descontar_stock_pedido`/`usar_cupon` lanzan
    -- excepción si no alcanza — eso deshace automáticamente TODO lo de esta
    -- función (incluida la fila bloqueada arriba), dejando el pedido
    -- exactamente como estaba si cualquiera de los 2 falla.
    select jsonb_agg(jsonb_build_object('variante_id', producto_variante_id, 'cantidad', cantidad))
      into v_items
      from pedido_items
      where pedido_id = p_pedido_id
        and producto_variante_id is not null;

    if v_items is not null then
      perform descontar_stock_pedido(v_items);
    end if;

    if v_actual.cupon_codigo is not null then
      perform usar_cupon(v_actual.cupon_codigo, v_actual.subtotal);
    end if;
  end if;

  update pedidos set estado = p_nuevo_estado, actualizado_en = now() where id = p_pedido_id;
end;
$$;

grant execute on function actualizar_estado_pedido(uuid, text) to service_role;
