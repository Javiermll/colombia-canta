-- QR de entrada (Fase 6, 2026-09-08) — pedido del usuario: cada entrada
-- INDIVIDUAL de una reserva necesita su propio código escaneable por
-- separado (una reserva de 3 entradas = 3 códigos, no uno solo para el
-- grupo) — así el staff de la puerta cuenta personas reales, no confía en
-- que el grupo completo llegue junto.
create table reserva_entradas (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid not null references reservas(id) on delete cascade,
  numero integer not null,
  validado_en timestamptz,
  creado_en timestamptz not null default now(),
  unique (reserva_id, numero)
);

create index reserva_entradas_reserva_id_idx on reserva_entradas(reserva_id);

alter table reserva_entradas enable row level security;
grant select, insert, update on table reserva_entradas to service_role;

-- Código de acceso simple (PIN) para la pantalla de puerta (/puerta, fuera
-- del panel de admin) — el staff de esa noche no necesita cuenta ni MFA,
-- solo este código, generado y regenerado por el admin desde el panel del
-- evento correspondiente. Nullable = todavía no se generó ninguno (la
-- pantalla de puerta rechaza el evento hasta que exista uno).
alter table eventos add column pin_puerta text;
alter table eventos_fijos add column pin_puerta text;

-- `crear_reserva_con_cupo()` se actualiza para crear las N filas de
-- `reserva_entradas` en la MISMA transacción que la reserva — si algo falla
-- después de insertar la reserva, no debe quedar sin sus entradas (ni al
-- revés). El resto de la función es idéntico a la versión ya corregida en
-- 20260908090000_fix_zona_invalida_cupo.sql — no se repite ningún cambio de
-- ese fix, sigue intacto acá.
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

  insert into reserva_entradas (reserva_id, numero)
  select v_nueva.id, gs
  from generate_series(1, p_cantidad) as gs;

  return v_nueva;
end;
$$;

grant execute on function crear_reserva_con_cupo(uuid, uuid, text, text, text, text, text, integer, text, jsonb, jsonb) to service_role;
