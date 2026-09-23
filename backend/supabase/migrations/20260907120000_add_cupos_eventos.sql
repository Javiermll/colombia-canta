-- Cupos/aforo — pedido real del usuario (2026-09-07): antes no existía ningún
-- límite de aforo TOTAL para un evento (solo `max_entradas`, que limita cuántas
-- entradas se piden POR RESERVA, no cuántas hay disponibles en total). Sin esto
-- un evento se puede sobrevender sin límite.
--
-- `cupo_total` es nullable a propósito = "sin límite" (comportamiento actual,
-- por defecto, para no romper eventos ya creados).
--
-- Para eventos de pago con zonas, el cupo por zona vive DENTRO del jsonb
-- `zonas` (clave `cupo`, ej. {"nombre":"General","precio":"$45.000","cupo":50})
-- — no hace falta columna aparte, se valida en la app (Eventos.jsx/eventos.js)
-- que la suma de cupos de zona no pase el `cupo_total` del evento.
--
-- Para eventos_fijos (Salas/Enamoras), el cupo por show vive DENTRO de cada
-- objeto de `programacion` (clave `cupo`) — `cupo_total` en la tabla solo
-- aplica al caso "reserva general sin show específico" (show_seleccionado null).
alter table eventos add column cupo_total integer;
alter table eventos add constraint eventos_cupo_total_positivo check (cupo_total is null or cupo_total > 0);

alter table eventos_fijos add column cupo_total integer;
alter table eventos_fijos add constraint eventos_fijos_cupo_total_positivo check (cupo_total is null or cupo_total > 0);

-- Chequeo de cupo + insert en una sola transacción — evita que 2 reservas
-- simultáneas lean "quedan 2 lugares" al mismo tiempo y ambas se inserten
-- (sobreventa por condición de carrera). `pg_advisory_xact_lock` serializa
-- las reservas que compiten por el MISMO cupo (mismo evento+zona, o mismo
-- evento_fijo+show) sin bloquear reservas de otros eventos/zonas/shows.
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
      -- ⭐ Hallazgo real de seguridad (auditoría de cierre de Fase 5, 2026-09-08):
      -- si `p_zona_nombre` no coincide con NINGUNA zona real del evento (ej.
      -- un nombre inventado, o un evento 'libre' que nunca tiene zonas de
      -- verdad), este SELECT no encuentra fila y `v_cupo` queda NULL — antes
      -- eso se interpretaba igual que "esta zona no tiene cupo propio" (NULL =
      -- sin límite), así que el chequeo de abajo se saltaba por completo y
      -- CUALQUIERA podía mandar una zona inventada para saltarse el cupo
      -- entero del evento. `FOUND` (booleano propio de plpgsql, distinto de
      -- que `v_cupo` sea NULL) distingue "la zona existe pero no tiene cupo
      -- configurado" (NULL legítimo, sin límite) de "la zona no existe" (debe
      -- rechazarse, no tratarse como sin límite).
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
      -- Mismo hallazgo que arriba, aplicado al show — defensa adicional acá
      -- aunque `reservas.js` ya valida `show_seleccionado` contra la
      -- `programacion` real ANTES de llegar a esta función (no depender solo
      -- de esa validación de la ruta, la función debe ser segura por sí sola).
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

-- Nota: la disponibilidad para el sitio público (/api/eventos, /api/eventos-fijos)
-- se calcula del lado de Node agregando `reservas` directamente (el cliente del
-- backend ya usa la service_role key, sin necesidad de otra función acá).
