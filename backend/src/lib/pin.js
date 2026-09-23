import crypto from 'crypto';
import { supabase } from '../config/supabaseClient.js';
import { logAudit } from './auditLog.js';
import { errorGenerico } from './errores.js';

// PIN de puerta (Fase 6, 2026-09-08) — 6 dígitos, fácil de escribir en un
// celular por alguien no técnico esa noche. `crypto.randomInt` (no
// `Math.random`) por el mismo criterio ya usado en el resto del proyecto
// para cualquier valor que funcione como credencial (ver tempPassword.js).
export function generarPin() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// ⭐ Extraído (auditoría Fase 6, 2026-09-09) — el endpoint `POST /:id/pin-puerta`
// vivía copiado casi carácter por carácter en routes/eventos.js y
// routes/eventosFijos.js (solo cambiaba la tabla/entidad). `tabla` es
// 'eventos' o 'eventos_fijos'; `entidad` es el mismo valor para el registro
// de auditoría.
export async function regenerarPinPuerta({ tabla, entidad, id, actor, contexto }) {
  const pin = generarPin();
  const { data, error } = await supabase.from(tabla).update({ pin_puerta: pin }).eq('id', id).select('id, pin_puerta').maybeSingle();
  if (error || !data) {
    return { error: errorGenerico(error, contexto) };
  }

  await logAudit({ actor, accion: 'editar', entidad, entidadId: id, detalle: { pinPuertaRegenerado: true } });

  return { pin: data.pin_puerta };
}
