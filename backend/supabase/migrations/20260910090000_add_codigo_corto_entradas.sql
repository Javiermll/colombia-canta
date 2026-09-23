-- ⭐ Pedido del usuario (2026-09-10): respaldo real (no solo decorativo) al
-- QR en el correo de confirmación — un código corto que el staff de la
-- puerta pueda escribir a mano en /puerta si el QR no escanea (cámara rota,
-- pantalla del celular del comprador rayada, etc.). El `id` de
-- `reserva_entradas` ya sirve para esto técnicamente, pero es un UUID de 36
-- caracteres — poco práctico para tipear bajo presión de noche. Nullable +
-- generado bajo demanda (ver obtenerQrsParaReserva en reservas.js) en vez de
-- backfill: no hay ninguna entrada real todavía que necesite uno retroactivo.
alter table reserva_entradas add column codigo_corto text unique;
