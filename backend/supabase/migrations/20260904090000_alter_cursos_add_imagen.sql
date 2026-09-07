-- Pedido del usuario (2026-09-04): revierte parcialmente la decisión de
-- 20260819100000_alter_cursos_icono_a_emoji.sql — ahora sí se quiere una foto
-- real por curso para la tarjeta pública (rediseño de Inscripciones), aunque
-- el cliente es real y esto implica que el staff sí va a subir/mantener esas
-- fotos. `emoji` se deja intacto como respaldo visual para los cursos que
-- todavía no tengan foto cargada (no rompe nada de lo ya existente).
alter table cursos
  add column imagen text;
