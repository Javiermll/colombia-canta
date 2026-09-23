-- ⭐ Hallazgo real (auditoría Fase 6, 2026-09-09): `crear_reserva_con_cupo`
-- solo protege la CREACIÓN de una reserva. El PATCH de admin
-- (routes/reservas.js) permite reactivar una reserva cancelada, o subir su
-- `cantidad`, con un `.update()` directo — sin volver a comprobar cupo. Un
-- evento lleno podía quedar sobrevendido por una edición legítima del admin
-- (reactivar una cancelación vieja, o subir la cantidad de una reserva
-- activa), el mismo tipo de bypass que `crear_reserva_con_cupo` ya evita en
-- la creación.
--
-- Esta función replica el mismo chequeo (mismo lock, misma forma de sumar
-- `cantidad` de reservas activas) pero SOLO para revalidar — no inserta nada,
-- y excluye la propia reserva de la suma (`id <> p_reserva_id`), a
-- diferencia de crear_reserva_con_cupo que siempre inserta una fila nueva.
-- Se llama desde el PATCH de admin únicamente cuando hace falta: al
-- reactivar una reserva cancelada, o al subir su `cantidad` mientras sigue
-- activa.
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
        and id <> p_reserva_id;
    else
      select cupo_total into v_cupo from eventos where id = v_evento_id;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_id = v_evento_id
        and zona_seleccionada is null
        and estado <> 'cancelada'
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
        and id <> p_reserva_id;
    else
      select cupo_total into v_cupo from eventos_fijos where id = v_evento_fijo_id;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_fijo_id = v_evento_fijo_id
        and show_seleccionado is null
        and estado <> 'cancelada'
        and id <> p_reserva_id;
    end if;
  end if;

  if v_cupo is not null and v_reservado + p_nueva_cantidad > v_cupo then
    raise exception 'sin_cupo' using errcode = 'P0001';
  end if;
end;
$$;

grant execute on function revalidar_cupo_reserva(uuid, integer) to service_role;
