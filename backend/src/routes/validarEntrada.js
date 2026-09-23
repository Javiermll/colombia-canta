import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabaseClient.js';
import { limiterPuerta } from '../middleware/rateLimiters.js';
import { csrfTokensMatch } from '../lib/csrf.js';

const router = Router();

// ⭐ Pedido del usuario (2026-09-10): además del `id` real (lo que trae el
// QR), ahora también se acepta el `codigo_corto` de respaldo que se muestra
// en el correo — el staff lo puede escribir a mano si el QR no escanea. Ya
// no se exige formato uuid acá (antes sí) porque este mismo campo recibe
// cualquiera de los 2; se decide cuál es más abajo, mirando el formato real.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bodySchema = z
  .object({
    entrada_id: z.string().trim().min(1, 'entrada_id es obligatorio'),
    pin: z.string().trim().min(1, 'pin es obligatorio'),
  })
  .strict();

function zodError(result) {
  const err = new Error(result.error.issues.map((i) => i.message).join(', '));
  err.status = 400;
  return err;
}

const pinSchema = z.object({ pin: z.string().trim().min(1, 'pin es obligatorio') }).strict();

// POST /api/validar-entrada/evento — pedido del usuario (2026-09-10): antes,
// el PIN solo se confirmaba contra un evento real al escanear la PRIMERA
// entrada — si el staff lo escribía mal, o usaba el de otra noche, recién se
// enteraba con un escaneo real fallido, ya en medio del evento. Esta ruta
// resuelve a qué evento pertenece un PIN de inmediato, para mostrar
// "vas a validar entradas para: [nombre]" ANTES de dejar pasar a la cámara.
// Mismo límite de intentos que la validación real (`limiterPuerta`) — sin
// esto, cualquiera podría usarla para adivinar PINs por fuerza bruta y
// descubrir nombres de eventos sin ninguna entrada real de por medio.
router.post('/evento', limiterPuerta, async (req, res, next) => {
  const result = pinSchema.safeParse(req.body);
  if (!result.success) return next(zodError(result));
  const { pin } = result.data;

  // Se buscan los 2 tipos de evento en paralelo — un PIN puede pertenecer a
  // cualquiera de las 2 tablas, nunca a ambas a la vez en la práctica (son
  // aleatorios de 6 dígitos, la chance de choque es mínima y no crítica acá:
  // en el caso raro de coincidencia, se prioriza el más próximo por fecha).
  const [{ data: eventos }, { data: fijos }] = await Promise.all([
    supabase.from('eventos').select('titulo, fecha_iso').eq('pin_puerta', pin).eq('activo', true),
    supabase.from('eventos_fijos').select('titulo').eq('pin_puerta', pin).eq('activo', true),
  ]);

  const encontrado = [...(eventos || []), ...(fijos || [])]
    .sort((a, b) => (a.fecha_iso ?? '9999-99-99').localeCompare(b.fecha_iso ?? '9999-99-99'))[0];

  if (!encontrado) {
    const err = new Error('PIN no reconocido — verifica que esté bien escrito.');
    err.status = 404;
    return next(err);
  }

  res.json({ ok: true, data: { evento: encontrado.titulo } });
});

// POST /api/validar-entrada — pantalla de puerta (/puerta, Fase 6, 2026-09-08).
// Sin requireAdmin/CSRF (el staff de esa noche no tiene cuenta de admin) — el
// PIN de puerta es la única autenticación, comparado contra el evento real al
// que pertenece la entrada escaneada (no contra un PIN "global").
router.post('/', limiterPuerta, async (req, res, next) => {
  const result = bodySchema.safeParse(req.body);
  if (!result.success) return next(zodError(result));
  const { pin } = result.data;
  const entradaInput = result.data.entrada_id.trim();

  // El QR manda el `id` real (uuid); la entrada manual del código corto de
  // respaldo manda algo como "AB3X-9KLM" — se distingue por formato, nunca
  // se intenta un `.eq('id', ...)` con algo que no sea un uuid real (Postgres
  // rechaza esa comparación con un error de tipo, no con "0 resultados").
  const selectEntrada = supabase
    .from('reserva_entradas')
    .select('id, numero, validado_en, reservas(id, nombre, estado, evento_id, evento_fijo_id)');
  const { data: entrada, error: entradaError } = UUID_RE.test(entradaInput)
    ? await selectEntrada.eq('id', entradaInput).maybeSingle()
    : await selectEntrada.eq('codigo_corto', entradaInput.toUpperCase()).maybeSingle();

  if (entradaError || !entrada) {
    const err = new Error('Código no válido — no corresponde a ninguna entrada real.');
    err.status = 404;
    return next(err);
  }

  const reserva = entrada.reservas;
  const esEvento = !!reserva.evento_id;
  const tabla = esEvento ? 'eventos' : 'eventos_fijos';
  const idEvento = esEvento ? reserva.evento_id : reserva.evento_fijo_id;

  const { data: evento, error: eventoError } = await supabase
    .from(tabla)
    .select('titulo, pin_puerta')
    .eq('id', idEvento)
    .maybeSingle();

  if (eventoError || !evento) {
    const err = new Error('El evento de esta entrada ya no existe.');
    err.status = 404;
    return next(err);
  }

  if (!evento.pin_puerta || !csrfTokensMatch(pin, evento.pin_puerta)) {
    const err = new Error('PIN incorrecto para este evento.');
    err.status = 401;
    return next(err);
  }

  // Total de entradas de la misma reserva, para mostrar "2 de 3" en el resultado.
  const { count: total } = await supabase
    .from('reserva_entradas')
    .select('*', { count: 'exact', head: true })
    .eq('reserva_id', reserva.id);

  if (reserva.estado === 'cancelada') {
    const err = new Error('Esta reserva fue cancelada — entrada no válida.');
    err.status = 409;
    return next(err);
  }

  // ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): solo se rechazaba
  // 'cancelada' — una entrada de un evento de pago cuya reserva sigue
  // 'pendiente' (el comprador nunca completó el pago, o Mercado Pago todavía
  // no lo confirmó) se dejaba pasar igual si alguien llegaba a conocer su
  // código (ej. el QR de un intento de pago abandonado, reenviado por error).
  // 'libre' sí es válida de entrada (eventos gratuitos no pasan por pago).
  if (reserva.estado === 'pendiente') {
    const err = new Error('Esta entrada corresponde a una reserva que todavía no se ha pagado — no es válida.');
    err.status = 409;
    return next(err);
  }

  if (entrada.validado_en) {
    const err = new Error(`Ya fue usada — validada el ${new Date(entrada.validado_en).toLocaleString('es-CO')}.`);
    err.status = 409;
    return next(err);
  }

  // ⭐ Hallazgo real (auditoría Fase 6, 2026-09-09): el chequeo de arriba
  // (`entrada.validado_en`) lee un estado ya viejo para cuando llega acá —
  // sin el `.is('validado_en', null)` en el UPDATE, 2 escaneos casi
  // simultáneos del mismo QR (2 lectores de puerta, o el mismo reenviado a
  // otra persona) podían pasar los 2 el chequeo antes de que cualquiera
  // terminara de escribir, dejando entrar 2 veces con una sola entrada —
  // mismo tipo de condición de carrera que `crear_reserva_con_cupo` ya
  // resuelve con `pg_advisory_xact_lock` para el cupo, acá resuelto con un
  // UPDATE condicional atómico en su lugar (no hace falta un lock aparte:
  // el propio WHERE de Postgres ya lo hace en una sola operación).
  const { data: actualizada, error: updateError } = await supabase
    .from('reserva_entradas')
    .update({ validado_en: new Date().toISOString() })
    .eq('id', entrada.id)
    .is('validado_en', null)
    .select('validado_en')
    .maybeSingle();

  if (updateError) {
    const err = new Error('No se pudo validar la entrada — intenta de nuevo.');
    err.status = 500;
    return next(err);
  }

  if (!actualizada) {
    const err = new Error('Ya fue usada — validada justo ahora por otro dispositivo.');
    err.status = 409;
    return next(err);
  }

  res.json({
    ok: true,
    data: {
      comprador: reserva.nombre,
      evento: evento.titulo,
      entradaNumero: entrada.numero,
      entradaTotal: total ?? entrada.numero,
      validadoEn: actualizada.validado_en,
    },
  });
});

export default router;
