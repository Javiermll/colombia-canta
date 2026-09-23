-- ⭐ Pedido del usuario (2026-09-17), a raíz de una prueba real de pago
-- rechazado: a diferencia de `reservas` (que expiran solas a los 30 min sin
-- pagar — ver `crear_reserva_con_cupo`/`revalidar_cupo_reserva` — porque su
-- cupo se calcula CONTANDO reservas activas en cada lectura), el stock de
-- `pedidos` se descuenta de verdad y de inmediato al crear el pedido, y el
-- cupón (si se usó uno) se consume de inmediato también. Un pedido que nunca
-- se termina de pagar (rechazado, abandonado, pestaña cerrada) dejaba el
-- stock y el uso de cupón bloqueados PARA SIEMPRE — nada los liberaba salvo
-- que un admin entrara al panel y cancelara el pedido a mano.
--
-- Mismo criterio de "expiración perezosa, sin cron" que ya usan las
-- reservas: no hay ningún job programado en este proyecto — esta función se
-- llama desde el propio código (`pedidos.js`) en los 2 momentos en que tiene
-- sentido que el estado esté al día: justo antes de crear un pedido nuevo
-- (para no bloquear stock real por culpa de un abandono ajeno) y al listar
-- pedidos en el panel admin (para que el admin vea el estado real sin tener
-- que esperar a que alguien más compre).
--
-- Se reutiliza el estado `'cancelado'` que ya existe (no hace falta agregar
-- ninguno nuevo al check constraint de `pedidos.estado`) — semánticamente
-- correcto: el pedido no se completó y quedó cancelado, esta vez por
-- vencimiento en vez de una cancelación manual.
--
-- Seguro ante carreras: el UPDATE de más abajo es lo que decide qué filas
-- "gana" esta llamada (solo las que siguen en 'pendiente' en ese instante
-- exacto) — si un pago real se confirma (`confirmarPagoPedido`, que pone
-- `estado = 'pagado'`) un segundo antes de que esto corra, esa fila ya no
-- aparece en el UPDATE y no se le toca ni el stock ni el cupón. Dos llamadas
-- concurrentes a esta misma función tampoco pueden restaurar el mismo pedido
-- 2 veces: el UPDATE de Postgres solo deja que una de las 2 "gane" cada fila.
create or replace function expirar_pedidos_pendientes()
returns void
language plpgsql
security definer
as $$
declare
  r record;
  v_items jsonb;
  v_cupon_id uuid;
begin
  for r in
    update pedidos
    set estado = 'cancelado', actualizado_en = now()
    where estado = 'pendiente'
      and creado_en < now() - interval '30 minutes'
    returning id, cupon_codigo
  loop
    select jsonb_agg(jsonb_build_object('variante_id', producto_variante_id, 'cantidad', cantidad))
      into v_items
      from pedido_items
      where pedido_id = r.id
        and producto_variante_id is not null;

    if v_items is not null then
      perform restaurar_stock_pedido(v_items);
    end if;

    if r.cupon_codigo is not null then
      select id into v_cupon_id from cupones where codigo = r.cupon_codigo;
      if v_cupon_id is not null then
        perform devolver_uso_cupon(v_cupon_id);
      end if;
    end if;
  end loop;
end;
$$;

grant execute on function expirar_pedidos_pendientes() to service_role;
