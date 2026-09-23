-- ⭐ Hallazgo real de seguridad (auditoría de cierre de Fase 5, 2026-09-08),
-- encontrado independientemente por 2 revisiones en paralelo (code-review +
-- auditoría de seguridad dedicada): la versión original de
-- `crear_reserva_con_cupo()` (migración 20260907120000_add_cupos_eventos.sql)
-- no distinguía "esta zona/show existe pero no tiene cupo configurado"
-- (legítimamente sin límite) de "esta zona/show NO EXISTE" — en ambos casos
-- la búsqueda no encontraba fila y `v_cupo` quedaba NULL, así que el chequeo
-- de cupo se saltaba por completo. Cualquiera podía mandar un nombre de zona
-- inventado en `POST /api/reservas` y saltarse el cupo del evento entero, sin
-- necesitar ninguna condición de carrera — un solo request bastaba. Esta
-- migración reemplaza la función con la versión corregida (usa `FOUND`,
-- booleano propio de plpgsql, para distinguir ambos casos) y no repite las
-- columnas/constraints de la migración original (ya aplicadas, `alter table
-- add column` fallaría si se repite). El fix complementario del lado de la
-- ruta (`backend/src/routes/reservas.js`, rechaza cualquier `zona_seleccionada`
-- en un evento 'libre', que nunca tiene zonas de verdad) ya está en el código
-- del backend, no necesita nada en la base.
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
        and estado <> 'cancelada';
    else
      select cupo_total into v_cupo from eventos where id = p_evento_id;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_id = p_evento_id
        and zona_seleccionada is null
        and estado <> 'cancelada';
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
        and estado <> 'cancelada';
    else
      select cupo_total into v_cupo from eventos_fijos where id = p_evento_fijo_id;

      select coalesce(sum(cantidad), 0) into v_reservado
      from reservas
      where evento_fijo_id = p_evento_fijo_id
        and show_seleccionado is null
        and estado <> 'cancelada';
    end if;
  end if;

  if v_cupo is not null and v_reservado + p_cantidad > v_cupo then
    raise exception 'sin_cupo' using errcode = 'P0001';
  end if;

  insert into reservas (evento_id, evento_fijo_id, nombre, celular, email, cantidad, acepta_terminos, estado, zona_seleccionada, show_seleccionado)
  values (p_evento_id, p_evento_fijo_id, p_nombre, p_celular, p_email, p_cantidad, true, p_estado, p_zona_seleccionada, p_show_seleccionado)
  returning * into v_nueva;

  return v_nueva;
end;
$$;

grant execute on function crear_reserva_con_cupo(uuid, uuid, text, text, text, text, text, integer, text, jsonb, jsonb) to service_role;
