-- ⭐ Cupones de descuento para la Tienda (pedido del usuario, 2026-09-10) —
-- decisiones de producto ya confirmadas con el usuario: el % de descuento
-- aplica siempre a TODO el pedido (no a productos/colecciones específicas),
-- y cada cupón tiene un límite de usos totales obligatorio (no hay opción
-- de "ilimitado" — si el admin quiere que dure mucho, define un número
-- grande).
create table cupones (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  porcentaje integer not null check (porcentaje > 0 and porcentaje <= 100),
  usos_maximos integer not null check (usos_maximos > 0),
  usos_actuales integer not null default 0 check (usos_actuales >= 0),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table cupones enable row level security;
grant select, insert, update, delete on table cupones to service_role;

-- Snapshot del descuento aplicado a un pedido — igual criterio que el resto
-- del proyecto (zona_seleccionada en reservas, precio/nombre en
-- pedido_items): si el cupón se edita o se borra después, el pedido
-- histórico no debe cambiar. `subtotal` es la suma real de los productos
-- ANTES del descuento; `total` (columna ya existente) queda como el monto
-- final, el que de verdad se cobra por Mercado Pago. Se backfillea
-- `subtotal = total` en los pedidos ya existentes (nunca tuvieron cupón,
-- así que no hay descuento que restar).
alter table pedidos add column subtotal integer;
alter table pedidos add column cupon_codigo text;
alter table pedidos add column descuento_porcentaje integer;
update pedidos set subtotal = total where subtotal is null;
alter table pedidos alter column subtotal set not null;

-- Chequea y CONSUME un uso de cupón en una sola transacción con lock —
-- mismo criterio que `crear_reserva_con_cupo`/`descontar_stock_pedido`: sin
-- esto, 2 compras casi simultáneas con el mismo cupón cerca de su límite
-- podrían las 2 pasar la validación antes de que cualquiera terminara de
-- registrar su uso, dejando el cupón sobre-usado.
create or replace function usar_cupon(p_codigo text, p_subtotal integer)
returns table(cupon_id uuid, porcentaje integer, descuento integer, total integer)
language plpgsql
security definer
as $$
declare
  v_cupon cupones;
begin
  perform pg_advisory_xact_lock(hashtextextended('cupon:' || p_codigo, 0));

  select * into v_cupon from cupones where codigo = p_codigo and activo = true;

  if not found then
    raise exception 'cupon_invalido' using errcode = 'P0001';
  end if;

  if v_cupon.usos_actuales >= v_cupon.usos_maximos then
    raise exception 'cupon_agotado' using errcode = 'P0001';
  end if;

  update cupones set usos_actuales = usos_actuales + 1, actualizado_en = now() where id = v_cupon.id;

  return query select
    v_cupon.id,
    v_cupon.porcentaje,
    (p_subtotal * v_cupon.porcentaje / 100)::integer,
    p_subtotal - (p_subtotal * v_cupon.porcentaje / 100)::integer;
end;
$$;

grant execute on function usar_cupon(text, integer) to service_role;

-- Devuelve un uso de cupón (compensación) — llamada si un pedido falla
-- DESPUÉS de haber consumido el cupón (mismo criterio de compensación que
-- `restaurar_stock_pedido` para el stock).
create or replace function devolver_uso_cupon(p_cupon_id uuid)
returns void
language sql
security definer
as $$
  update cupones set usos_actuales = greatest(0, usos_actuales - 1), actualizado_en = now() where id = p_cupon_id;
$$;

grant execute on function devolver_uso_cupon(uuid) to service_role;
