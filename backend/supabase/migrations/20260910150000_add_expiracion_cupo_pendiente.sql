-- ⭐ Mercado Pago, Eventos de pago (Fase 6, Sección 1 del plan, 2026-09-10) —
-- decisión de producto ya tomada con el usuario: el cupo de un evento de
-- pago se reserva apenas alguien INICIA el pago (la reserva se crea en
-- `'pendiente'`, redirigiendo enseguida a Checkout Pro), no solo cuando
-- Mercado Pago confirma el pago por webhook. Eso evita que 2 compradores
-- compitan sin saberlo por el mismo último lugar mientras uno de los 2 está
-- a mitad de pagar.
--
-- El efecto secundario real de esa decisión: una reserva `'pendiente'`
-- abandonada (alguien empieza el checkout y nunca vuelve) quedaría
-- reservando cupo PARA SIEMPRE si no se hace nada — el proyecto no tiene
-- ninguna infraestructura de cron/jobs para limpiarlas activamente. Se
-- resuelve sin necesitar un job aparte: las reservas `'pendiente'` con más
-- de 30 minutos desde `creado_en` simplemente dejan de sumar al cupo en la
-- propia consulta (no se borran — quedan como historial de intentos
-- abandonados, útil para el admin). 30 minutos es más que suficiente para
-- completar un Checkout Pro real, y es la misma ventana que se usa para
-- `expiration_date_to` al crear la preferencia (ver `routes/reservas.js`),
-- así el link de pago y el cupo reservado caducan juntos.
--
-- Se reemplazan `crear_reserva_con_cupo` (última versión real, la de
-- 20260908130000_add_reserva_entradas_y_pin.sql, que ya crea las filas de
-- `reserva_entradas` en la misma transacción) y `revalidar_cupo_reserva`
-- (20260909090000) agregando la misma condición a cada suma de cupo — el
-- resto de ambas funciones queda idéntico, ningún otro cambio de
-- comportamiento.
create or replace function crear_reserva_con_cupo(
  p_evento_id uuid,
  p_evento_fijo_id uuid,
  p_zona_nombre text,
  p_show_fecha_iso text,
  p_nombre text,
  p_celular text,
  p_email text,
  p_cantidad integer,
  p_estado text,
  p_show_seleccionado jsonb,
  p_zona_seleccionada jsonb
) returns reservas
language plpgsql
security definer
as $$
declare
  v_cupo integer;
  v_reservado integer;
  v_lock_key bigint;
  v_nueva reservas;
begin
  v_lock_key := hashtextextended(
    coalesce(p_evento_id::text, '') || '|' || coalesce(p_evento_fijo_id::text, '') || '|' ||
    coalesce(p_zona_nombre, '') || '|' || coalesce(p_show_fecha_iso, ''),
    0
  );
  perform pg_advisory_xact_lock(v_lock_key);

  if p_evento_id is not null then
    if p_zona_nombre is not null then
      select (z->>'cupo')::integer into v_cupo
      from eventos, jsonb_array_elements(coalesce(eventos.zonas, '[]'::jsonb)) z
      where eventos.id = p_evento_id and z->>'nombre' = p_zona_nombre;

      if not found then
        raise exception 'zona_invalida' using errcode = 'P0001';
      end if;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_id = p_evento_id
        and zona_seleccionada->>'nombre' = p_zona_nombre
        and estado <> 'cancelada'
        and not (estado = 'pendiente' and creado_en < now() - interval '30 minutes');
    else
      select cupo_total into v_cupo from eventos where id = p_evento_id;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_id = p_evento_id
        and zona_seleccionada is null
        and estado <> 'cancelada'
        and not (estado = 'pendiente' and creado_en < now() - interval '30 minutes');
    end if;
  else
    if p_show_fecha_iso is not null then
      select (s->>'cupo')::integer into v_cupo
      from eventos_fijos, jsonb_array_elements(coalesce(eventos_fijos.programacion, '[]'::jsonb)) s
      where eventos_fijos.id = p_evento_fijo_id and s->>'fechaISO' = p_show_fecha_iso;

      if not found then
        raise exception 'show_invalido' using errcode = 'P0001';
      end if;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_fijo_id = p_evento_fijo_id
        and show_seleccionado->>'fecha_iso' = p_show_fecha_iso
        and estado <> 'cancelada'
        and not (estado = 'pendiente' and creado_en < now() - interval '30 minutes');
    else
      select cupo_total into v_cupo from eventos_fijos where id = p_evento_fijo_id;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_fijo_id = p_evento_fijo_id
        and show_seleccionado is null
        and estado <> 'cancelada'
        and not (estado = 'pendiente' and creado_en < now() - interval '30 minutes');
    end if;
  end if;

  if v_cupo is not null and v_reservado + p_cantidad > v_cupo then
    raise exception 'sin_cupo' using errcode = 'P0001';
  end if;

  insert into reservas (evento_id, evento_fijo_id, nombre, celular, email, cantidad, acepta_terminos, estado, zona_seleccionada, show_seleccionado)
  values (p_evento_id, p_evento_fijo_id, p_nombre, p_celular, p_email, p_cantidad, true, p_estado, p_zona_seleccionada, p_show_seleccionado)
  returning * into v_nueva;

  insert into reserva_entradas (reserva_id, numero)
  select v_nueva.id, gs
  from generate_series(1, p_cantidad) as gs;

  return v_nueva;
end;
$$;

grant execute on function crear_reserva_con_cupo(uuid, uuid, text, text, text, text, text, integer, text, jsonb, jsonb) to service_role;

create or replace function revalidar_cupo_reserva(
  p_reserva_id uuid,
  p_nueva_cantidad integer
) returns void
language plpgsql
security definer
as $$
declare
  v_evento_id uuid;
  v_evento_fijo_id uuid;
  v_zona_nombre text;
  v_show_fecha_iso text;
  v_cupo integer;
  v_reservado integer;
  v_lock_key bigint;
begin
  select evento_id, evento_fijo_id, zona_seleccionada->>'nombre', show_seleccionado->>'fecha_iso'
  into v_evento_id, v_evento_fijo_id, v_zona_nombre, v_show_fecha_iso
  from reservas
  where id = p_reserva_id;

  if not found then
    raise exception 'reserva_no_encontrada' using errcode = 'P0001';
  end if;

  v_lock_key := hashtextextended(
    coalesce(v_evento_id::text, '') || '|' || coalesce(v_evento_fijo_id::text, '') || '|' ||
    coalesce(v_zona_nombre, '') || '|' || coalesce(v_show_fecha_iso, ''),
    0
  );
  perform pg_advisory_xact_lock(v_lock_key);

  if v_evento_id is not null then
    if v_zona_nombre is not null then
      select (z->>'cupo')::integer into v_cupo
      from eventos, jsonb_array_elements(coalesce(eventos.zonas, '[]'::jsonb)) z
      where eventos.id = v_evento_id and z->>'nombre' = v_zona_nombre;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_id = v_evento_id
        and zona_seleccionada->>'nombre' = v_zona_nombre
        and estado <> 'cancelada'
        and not (estado = 'pendiente' and creado_en < now() - interval '30 minutes')
        and id <> p_reserva_id;
    else
      select cupo_total into v_cupo from eventos where id = v_evento_id;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_id = v_evento_id
        and zona_seleccionada is null
        and estado <> 'cancelada'
        and not (estado = 'pendiente' and creado_en < now() - interval '30 minutes')
        and id <> p_reserva_id;
    end if;
  else
    if v_show_fecha_iso is not null then
      select (s->>'cupo')::integer into v_cupo
      from eventos_fijos, jsonb_array_elements(coalesce(eventos_fijos.programacion, '[]'::jsonb)) s
      where eventos_fijos.id = v_evento_fijo_id and s->>'fechaISO' = v_show_fecha_iso;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_fijo_id = v_evento_fijo_id
        and show_seleccionado->>'fecha_iso' = v_show_fecha_iso
        and estado <> 'cancelada'
        and not (estado = 'pendiente' and creado_en < now() - interval '30 minutes')
        and id <> p_reserva_id;
    else
      select cupo_total into v_cupo from eventos_fijos where id = v_evento_fijo_id;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_fijo_id = v_evento_fijo_id
        and show_seleccionado is null
        and estado <> 'cancelada'
        and not (estado = 'pendiente' and creado_en < now() - interval '30 minutes')
        and id <> p_reserva_id;
    end if;
  end if;

  if v_cupo is not null and v_reservado + p_nueva_cantidad > v_cupo then
    raise exception 'sin_cupo' using errcode = 'P0001';
  end if;
end;
$$;

grant execute on function revalidar_cupo_reserva(uuid, integer) to service_role;
