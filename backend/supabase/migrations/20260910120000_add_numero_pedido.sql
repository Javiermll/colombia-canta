-- ⭐ Pedido del usuario (2026-09-10): número de referencia de compra legible
-- ("Pedido #1001"), útil para trazabilidad y cualquier integración futura
-- que lo necesite (Mercado Pago external_reference, atención al cliente,
-- etc.) — el `id` (uuid) sigue siendo la clave real, esto es solo una
-- referencia corta y ordenada para mostrar/comunicar. `generated always as
-- identity` hace el backfill solo sobre los pedidos ya existentes, en el
-- mismo orden en que se crearon.
alter table pedidos add column numero_pedido integer generated always as identity (start with 1001) unique;
