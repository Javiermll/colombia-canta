-- Panel de uso (admin_maestro, 2026-09-07): tamaño real de la base de datos
-- en bytes, para comparar contra el límite del plan gratuito de Supabase
-- (500MB). PostgREST no expone `pg_database_size()` directamente — se
-- envuelve en una función y se expone como RPC, mismo patrón ya usado para
-- descontar_stock_pedido/restaurar_stock_pedido.
create or replace function get_db_size_bytes()
returns bigint
language sql
security definer
as $$
  select pg_database_size(current_database());
$$;

grant execute on function get_db_size_bytes() to service_role;
