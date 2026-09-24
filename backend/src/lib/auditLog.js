import { supabase } from '../config/supabaseClient.js';

// ⭐ Hallazgo real (preauditoría de Fase 6, punto 9, 2026-09-23): un pago
// tardío para una reserva/pedido que el admin ya BORRÓ (no canceló) no tenía
// ningún rastro — `confirmarPagoReserva`/`confirmarPagoPedido` ni siquiera
// encontraban la fila para guardarle la `referencia_mp`, solo quedaba un log
// genérico de servidor. En vez de bloquear el borrado (pensado justo para
// limpiar duplicados/errores de carga) o inventar una tabla nueva, se
// reutiliza `audit_log` — el DELETE ya registra ahí quién borró qué y
// cuándo, y esa fila sobrevive aunque la reserva/pedido original ya no
// exista. Esto no revive nada ni marca nada como pagado (no hay fila que
// actualizar) — solo convierte un log mudo en uno con contexto real
// accionable para el admin.
export async function buscarBorradoEnAuditLog(entidad, entidadId) {
  const { data } = await supabase
    .from('audit_log')
    .select('usuario_email, creado_en')
    .eq('entidad', entidad)
    .eq('entidad_id', entidadId)
    .eq('accion', 'borrar')
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function logAudit({ actor, accion, entidad, entidadId, detalle }) {
  const { error } = await supabase.from('audit_log').insert({
    usuario_id: actor.userId,
    usuario_email: actor.email,
    accion,
    entidad,
    entidad_id: entidadId,
    detalle: detalle ?? null,
  });

  if (error) {
    // No bloqueamos la operación principal por un fallo de auditoría, pero sí queda
    // en el log del servidor para no perderlo silenciosamente.
    console.error('logAudit: no se pudo escribir en audit_log -', error.message);
  }
}
