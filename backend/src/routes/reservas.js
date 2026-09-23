import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabaseClient.js';
import { requireCsrf } from '../middleware/requireCsrf.js';
import { limiterEstricto } from '../middleware/rateLimiters.js';
import { logAudit } from '../lib/auditLog.js';
import { stripUndefined } from '../lib/zodMultipart.js';
import { errorGenerico } from '../lib/errores.js';
import { hoyColombia } from '../lib/fechas.js';
import { paginacionSchema, aplicarRango, empaquetarPagina } from '../lib/paginacion.js';
import { enviarCorreo } from '../lib/resend.js';
import { plantillaCorreo, escaparHtml } from '../lib/emailPlantilla.js';
import { generarQrUrl, generarCodigoCorto } from '../lib/qr.js';
import { crearPreferencia } from '../lib/mercadoPago.js';
import { parsePrecioCompuesto } from '../lib/precio.js';

const ESTADOS = ['pendiente', 'pagada', 'cancelada', 'libre'];

function zodError(result) {
  const err = new Error(result.error.issues.map((i) => i.message).join(', '));
  err.status = 400;
  return err;
}

// 23503 = foreign_key_violation (evento_id/evento_fijo_id inexistente).
// P0001 = excepciones propias de crear_reserva_con_cupo() (ver migración
// 20260907120000_add_cupos_eventos.sql): 'sin_cupo' (ya no hay lugares) o
// 'zona_invalida'/'show_invalido' (la zona/show mandada no existe de verdad
// en el evento — hallazgo real de seguridad, auditoría de cierre de Fase 5,
// 2026-09-08: sin este chequeo dentro de la función, una zona inventada
// hacía que el cupo se leyera como "sin límite" y saltaba la protección
// contra sobreventa por completo).
function traducirError(error) {
  if (error.code === '23503') {
    const err = new Error('El evento indicado no existe');
    err.status = 400;
    return err;
  }
  if (error.message === 'zona_invalida' || error.message === 'show_invalido') {
    const err = new Error('La zona o el show indicado no existe en este evento');
    err.status = 400;
    return err;
  }
  if (error.code === 'P0001' || error.message === 'sin_cupo') {
    const err = new Error('Ya no quedan cupos disponibles para esta selección');
    err.status = 409;
    return err;
  }
  return errorGenerico(error, 'reservas.js traducirError');
}

// ⭐ QR de entrada (Fase 6, 2026-09-08) — pedido del usuario: cada entrada
// individual de la reserva tiene su propio código (creadas ya, dentro de la
// misma transacción que la reserva, por `crear_reserva_con_cupo` — ver
// migración 20260908130000). Se leen acá para generar la imagen de cada una
// y embeberlas en el correo de confirmación.
async function obtenerCodigoCorto(entrada) {
  if (entrada.codigo_corto) return entrada.codigo_corto;

  // Generado bajo demanda, la primera vez que se arma un correo para esta
  // entrada (ver migración 20260910090000) — reintenta una vez si el código
  // al azar choca con uno ya existente (con ~1 billón de combinaciones,
  // prácticamente nunca pasa, pero la columna es `unique` y hay que
  // manejarlo si pasa).
  for (let intento = 0; intento < 2; intento += 1) {
    const codigo = generarCodigoCorto();
    const { error } = await supabase.from('reserva_entradas').update({ codigo_corto: codigo }).eq('id', entrada.id);
    if (!error) return codigo;
  }
  return null;
}

// ⭐ QR de entrada (Fase 6, 2026-09-08) — pedido del usuario: cada entrada
// individual de la reserva tiene su propio código (creadas ya, dentro de la
// misma transacción que la reserva, por `crear_reserva_con_cupo` — ver
// migración 20260908130000). Se leen acá para generar la imagen de cada una
// y embeberlas en el correo de confirmación.
async function obtenerQrsParaReserva(reservaId) {
  const { data: entradas, error } = await supabase
    .from('reserva_entradas')
    .select('id, numero, codigo_corto')
    .eq('reserva_id', reservaId)
    .order('numero');

  if (error || !entradas?.length) return [];

  // ⭐ Hallazgo real (2026-09-10): `generarQrUrl` ahora sube a Storage (antes
  // era puramente local/síncrono con `data:` URIs) — sí puede fallar (red,
  // permisos). Igual criterio que el resto de esta función: un problema acá
  // nunca debe romper la reserva ya guardada, degrada a `[]` (el correo cae
  // a la nota "preséntate por nombre" — ver notaQr más abajo).
  try {
    return await Promise.all(
      entradas.map(async (e) => ({
        numero: e.numero,
        total: entradas.length,
        url: await generarQrUrl(e.id),
        // Respaldo real del QR (pedido del usuario, 2026-09-10) — código
        // corto que el staff puede escribir a mano en /puerta si el QR no
        // escanea. `null` si por lo que sea no se pudo generar/guardar — el
        // correo simplemente no lo muestra, no bloquea nada.
        codigo: await obtenerCodigoCorto(e),
      })),
    );
  } catch (err) {
    console.error('obtenerQrsParaReserva: fallo al generar/subir QR -', err.message);
    return [];
  }
}

// ⭐ Hallazgo real (auditoría Fase 6, 2026-09-09): la nota del correo decía
// "presenta tu código QR" de forma fija, incluso en la ventana en que
// `obtenerQrsParaReserva` devuelve `[]` con gracia (tabla sin migrar, o sin
// filas) — el comprador recibía instrucciones de algo que no venía adjunto.
function notaQr(qrs) {
  return qrs.length > 0
    ? 'Presenta el código QR de cada entrada en la puerta — cada persona del grupo necesita el suyo. Si tienes dudas, escríbenos por Contacto.'
    : 'Presenta tu nombre completo en la puerta para validar tu entrada. Si tienes dudas, escríbenos por Contacto.';
}

async function obtenerReservaCompleta(id) {
  const { data } = await supabase
    .from('reservas')
    .select('*, eventos(titulo, slug, fecha, fecha_iso), eventos_fijos(titulo, slug)')
    .eq('id', id)
    .single();
  return data;
}

// ⭐ Fase 6, Sección 1 (Mercado Pago, 2026-09-10) — flujo real de un evento
// `accion_tipo: 'pago'`. El precio SIEMPRE se recalcula acá a partir de la
// zona real guardada en `eventos.zonas` (nunca del `precio`/`moneda` que
// mande el cliente en `zona_seleccionada` — mismo principio de "nunca
// confiar en el precio del frontend" que ya usa pedidos.js con
// `producto_variantes.precio`). Decisión de producto ya tomada con el
// usuario: el cobro automático solo soporta COP — una zona en USD queda
// fuera de este camino por ahora (se le pide al comprador que escriba para
// coordinar en vez de dejarlo pagar mal).
async function manejarReservaDePago(evento, datos, res, next) {
  const zonaReal = (evento.zonas || []).find((z) => z.nombre === datos.zona_seleccionada?.nombre);
  if (!zonaReal) {
    const err = new Error('La zona seleccionada no existe en este evento');
    err.status = 400;
    return next(err);
  }

  const { monto, moneda } = parsePrecioCompuesto(zonaReal.precio);
  if (moneda !== 'COP' || monto <= 0) {
    const err = new Error('Esta zona todavía no está disponible para pago automático — escríbenos por Contacto para coordinarlo.');
    err.status = 400;
    return next(err);
  }

  // Mismo `crear_reserva_con_cupo` que el camino 'libre' — reserva el cupo
  // de inmediato (con lock, sin condición de carrera) guardando un snapshot
  // real de la zona (nombre/precio/moneda ya verificados, no lo que mandó
  // el cliente). `p_estado: 'pendiente'` es justo lo que hace que este cupo
  // cuente (y expire a los 30 min si no se paga — ver migración
  // 20260910150000_add_expiracion_cupo_pendiente.sql).
  const { data: reserva, error: cupoError } = await supabase.rpc('crear_reserva_con_cupo', {
    p_evento_id: evento.id,
    p_evento_fijo_id: null,
    p_zona_nombre: zonaReal.nombre,
    p_show_fecha_iso: null,
    p_nombre: datos.nombre,
    p_celular: datos.celular,
    p_email: datos.email,
    p_cantidad: datos.cantidad,
    p_estado: 'pendiente',
    p_show_seleccionado: null,
    p_zona_seleccionada: { nombre: zonaReal.nombre, precio: monto, moneda },
  });

  if (cupoError) return next(traducirError(cupoError));

  const primerOrigen = (process.env.FRONTEND_URL || '').split(',').map((s) => s.trim()).filter(Boolean)[0];
  // ⭐ Hallazgo real (2026-09-10, probado en vivo contra la API real de
  // Mercado Pago): con `auto_return`, Mercado Pago RECHAZA la preferencia
  // entera si `back_urls.success` no es una URL pública de verdad —
  // `http://localhost:5173` (FRONTEND_URL en desarrollo, sin túnel) da
  // `400 auto_return invalid`. No hay forma de probar Checkout Pro de punta
  // a punta en local sin un túnel público (ver Sección 3 del plan — ya se
  // sabía que hacía falta uno para el webhook, esto confirma que también
  // hace falta para el propio front). Acá se degrada con gracia en vez de
  // romper la compra: sin una URL https real, se omiten `back_urls`/
  // `auto_return` — la preferencia se sigue creando bien, el comprador
  // simplemente no vuelve solo al sitio tras pagar (puede cerrar la pestaña,
  // el correo de confirmación llega igual por el webhook).
  const backUrls = primerOrigen?.startsWith('https://')
    ? {
        success: `${primerOrigen}/#/confirmacion?evento=${evento.slug}`,
        pending: `${primerOrigen}/#/confirmacion?evento=${evento.slug}`,
        failure: `${primerOrigen}/#/pago-cancelado?evento=${evento.slug}`,
      }
    : undefined;
  const notificationUrl = process.env.BACKEND_PUBLIC_URL
    ? `${process.env.BACKEND_PUBLIC_URL}/api/webhooks/mercadopago`
    : undefined;
  // Mismos 30 min que la expiración de cupo de la migración — el link de
  // pago y el cupo reservado caducan juntos.
  const expiraEn = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  let preferencia;
  try {
    preferencia = await crearPreferencia({
      items: [{
        id: reserva.id,
        title: `${evento.titulo} — ${zonaReal.nombre}`,
        quantity: datos.cantidad,
        currency_id: 'COP',
        unit_price: monto,
      }],
      externalReference: `reserva:${reserva.id}`,
      backUrls,
      notificationUrl,
      expiraEn,
    });
  } catch (err) {
    // La reserva 'pendiente' ya quedó guardada (con su cupo ya reservado) —
    // si Mercado Pago falla al crear la preferencia, hay que liberar ese
    // cupo en vez de dejarlo reservado para un intento de pago que nunca va
    // a existir (mismo criterio de compensación que pedidos.js usa con
    // `restaurar_stock_pedido` cuando falla un paso posterior al stock ya
    // descontado).
    await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', reserva.id);
    return next(errorGenerico(err, 'POST /api/reservas (crear preferencia Mercado Pago)'));
  }

  res.status(201).json({ ok: true, data: { initPoint: preferencia.initPoint } });
}

// ⭐ Fase 6, Sección 1 (Mercado Pago, 2026-09-10) — llamado por
// webhookMercadoPago.js cuando Mercado Pago confirma un pago aprobado para
// una reserva. Idempotente a propósito (mismo criterio que pedidos.js con
// la transición a 'pagado'): si la reserva ya estaba 'pagada' — un
// reintento del webhook, Mercado Pago no garantiza una sola entrega — no
// hace nada, para no mandar el correo de confirmación 2 veces.
export async function confirmarPagoReserva(reservaId, referenciaMp) {
  const { data: actual, error: fetchError } = await supabase
    .from('reservas')
    .select('*, eventos(titulo, fecha, lugar, img)')
    .eq('id', reservaId)
    .maybeSingle();

  if (fetchError || !actual) {
    console.error('confirmarPagoReserva: reserva no encontrada -', reservaId);
    return;
  }

  if (actual.estado === 'pagada') return;

  // ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): una reserva
  // 'pendiente' con más de 30 min desde su creación deja de sumar al cupo
  // (ver `crear_reserva_con_cupo`) — su zona puede haberse vendido YA a otra
  // persona, aunque acá siga apareciendo como 'pendiente' (nada cambia su
  // estado activamente, a diferencia de los pedidos de Tienda). Un pago real
  // que llega tarde para ESTA reserva no puede marcarse 'pagada' a ciegas
  // sin volver a comprobar que el cupo sigue disponible de verdad, o se
  // estaría sobrevendiendo el mismo lugar. Se reusa `revalidar_cupo_reserva`
  // (ya construida para el mismo problema en las ediciones de admin, ver
  // migración 20260909090000) — mismo criterio de 30 min, excluye la propia
  // reserva de la suma.
  const vencida = actual.estado !== 'pendiente' || Date.now() - new Date(actual.creado_en).getTime() > 30 * 60 * 1000;
  if (vencida) {
    const { error: cupoError } = await supabase.rpc('revalidar_cupo_reserva', {
      p_reserva_id: reservaId,
      p_nueva_cantidad: actual.cantidad,
    });
    if (cupoError) {
      // Se guarda igual la referencia real de Mercado Pago aunque no se
      // pueda confirmar del todo — deja un rastro para que el admin lo
      // revise a mano (reembolsar al comprador o reubicarlo en otra
      // zona/función).
      await supabase.from('reservas').update({ referencia_mp: referenciaMp }).eq('id', reservaId);
      console.error(
        `confirmarPagoReserva: pago tardío ${referenciaMp} para la reserva ${reservaId} sin cupo disponible para revivirla — requiere revisión manual (posible reembolso).`,
        cupoError.message,
      );
      return;
    }
  }

  const { error: updateError } = await supabase
    .from('reservas')
    .update({ estado: 'pagada', referencia_mp: referenciaMp })
    .eq('id', reservaId);

  if (updateError) {
    console.error('confirmarPagoReserva: fallo al actualizar estado -', updateError);
    return;
  }

  const evento = actual.eventos;
  const zonaNombre = actual.zona_seleccionada?.nombre;

  // Mismo criterio que el resto del archivo: un fallo generando/subiendo el
  // QR nunca debe impedir avisar del pago confirmado — degrada a `[]`
  // (nota "preséntate por nombre").
  const qrsCorreo = await obtenerQrsParaReserva(reservaId);

  await enviarCorreo({
    to: actual.email,
    subject: `Tu entrada para "${evento?.titulo ?? 'tu evento'}" está confirmada`,
    html: plantillaCorreo({
      titulo: '¡Tu pago fue confirmado!',
      intro: `Ya registramos tu pago para <strong>${escaparHtml(evento?.titulo ?? '')}</strong>. Aquí el resumen:`,
      imagenUrl: evento?.img,
      filas: [
        { etiqueta: 'Evento', valor: escaparHtml(evento?.titulo ?? '') },
        { etiqueta: 'Fecha', valor: escaparHtml(evento?.fecha ?? '') },
        { etiqueta: 'Lugar', valor: escaparHtml(evento?.lugar ?? '') },
        ...(zonaNombre ? [{ etiqueta: 'Zona', valor: escaparHtml(zonaNombre) }] : []),
        { etiqueta: 'Entradas', valor: String(actual.cantidad) },
      ],
      mapaUrl: evento?.lugar ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.lugar)}` : null,
      notaFinal: notaQr(qrsCorreo),
      qrs: qrsCorreo,
    }),
  }).catch((err) => console.error('Fallo al mandar correo de confirmación (reserva de pago):', err));
}

// ── Router público: recepción de reservas desde ReservaModal ──
// Dos formas mutuamente excluyentes (igual que el CHECK de la tabla): evento_id
// (accion_tipo:'libre') o evento_fijo_id+show_seleccionado (Salas/Enamoras, que no
// tienen accion_tipo — sus reservas son siempre gratuitas, no hay campo de precio
// estructurado en su esquema). Eventos de pago quedan fuera de este alcance.
export const reservasPublicRouter = Router();

const datosComprador = {
  nombre: z.string().trim().min(2, 'Ingresa tu nombre completo'),
  celular: z.string().trim().min(7, 'Ingresa un número de celular válido'),
  email: z.string().trim().email('Ingresa un correo electrónico válido'),
  cantidad: z.coerce.number().int('cantidad debe ser un entero').positive('cantidad debe ser mayor a 0'),
  acepta_terminos: z.literal(true, { message: 'Debes aceptar los términos y condiciones' }),
};

const showSeleccionadoSchema = z.object({
  dia: z.string(),
  hora: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  fecha_iso: z.string(),
});

const eventoSchema = z
  .object({
    evento_id: z.string().uuid('evento_id debe ser un uuid válido'),
    // `moneda` opcional por compatibilidad hacia atrás (reservas ya guardadas
    // antes de este campo) — ver hallazgo de la auditoría Fase 6 (2026-09-09):
    // el fix de moneda de ReservaModal calculaba bien el total a MOSTRAR, pero
    // nunca la persistía acá, dejando el mismo bug ("$35 USD" mostrado como
    // "$35") listo para reaparecer en el panel de admin el día que "De pago"
    // se conecte de verdad (hoy esta rama solo acepta eventos 'libre', que
    // nunca tienen zona real — ver el rechazo explícito más abajo).
    zona_seleccionada: z.object({ nombre: z.string(), precio: z.number(), moneda: z.enum(['COP', 'USD']).optional() }).nullable().optional(),
    ...datosComprador,
  })
  .strict();

const eventoFijoSchema = z
  .object({
    evento_fijo_id: z.string().uuid('evento_fijo_id debe ser un uuid válido'),
    show_seleccionado: showSeleccionadoSchema.nullable().optional(),
    ...datosComprador,
  })
  .strict();

const publicSchema = z.union([eventoSchema, eventoFijoSchema]);

// POST / — recepción pública. estado/referencia_mp quedan siempre fuera del alcance
// público (.strict() los rechaza) — estado se fuerza a 'libre' en el servidor.
reservasPublicRouter.post('/', limiterEstricto, async (req, res, next) => {
  const result = publicSchema.safeParse(req.body);
  if (!result.success) {
    return next(zodError(result));
  }

  const datos = result.data;

  if ('evento_id' in datos) {
    // ⭐ Fase 6, Sección 1 (Mercado Pago, 2026-09-10): esta ruta ahora acepta
    // 2 tipos de evento ('libre' y 'pago', antes solo 'libre') — se trae
    // `accion_tipo`/`zonas`/`slug` para poder distinguir y, en el camino de
    // pago, validar la zona real y armar el link de Mercado Pago.
    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .select('id, slug, max_entradas, fecha_iso, titulo, fecha, lugar, img, accion_tipo, zonas')
      .eq('id', datos.evento_id)
      .eq('activo', true)
      .in('accion_tipo', ['libre', 'pago'])
      .maybeSingle();

    if (eventoError || !evento) {
      const err = new Error('El evento indicado no existe, no está activo, o no acepta reservas');
      err.status = 400;
      return next(err);
    }

    // ⭐ Hallazgo real del usuario (2026-08-28): nada impedía reservar para un
    // evento con fecha ya pasada — la UI no lo permitía, pero esta ruta pública
    // nunca lo validaba de verdad. Comparación de strings (no `new Date()`)
    // porque `fecha_iso` ya es `YYYY-MM-DD` — evita el mismo bug de timezone
    // que motivó `fechaLocalDesdeISO` en el frontend.
    if (evento.fecha_iso < hoyColombia()) {
      const err = new Error('Este evento ya pasó y no admite más reservas');
      err.status = 400;
      return next(err);
    }

    const maxEntradas = evento.max_entradas ?? 20;
    if (datos.cantidad > maxEntradas) {
      const err = new Error(`La cantidad máxima de entradas por reserva para este evento es ${maxEntradas}`);
      err.status = 400;
      return next(err);
    }

    // ⭐ Eventos de pago (Fase 6, Sección 1) — flujo real de Mercado Pago,
    // separado del de 'libre' de abajo: crea la reserva en 'pendiente'
    // (reserva el cupo de inmediato, con expiración a los 30 min — ver
    // migración 20260910150000) y responde con el link de Checkout Pro en
    // vez de la reserva completa. El correo de confirmación NO se manda acá
    // — se manda desde el webhook, solo cuando Mercado Pago confirma el pago
    // (ver webhookMercadoPago.js).
    if (evento.accion_tipo === 'pago') {
      return manejarReservaDePago(evento, datos, res, next);
    }

    // ⭐ Hallazgo real de seguridad (auditoría de cierre de Fase 5, 2026-09-08):
    // un evento 'libre' nunca tiene zonas de verdad (zonas es un concepto
    // exclusivo de 'pago'). Antes se dejaba pasar cualquier
    // `zona_seleccionada` igual, sin validar — eso permitía inventar un
    // nombre de zona para que `crear_reserva_con_cupo` no encontrara ninguna
    // coincidencia real y tratara el cupo como "sin límite", saltándose la
    // protección contra sobreventa por completo. Rechazado acá mismo,
    // temprano y con un mensaje claro (la función de base de datos también
    // quedó reforzada como defensa adicional, ver la migración).
    if (datos.zona_seleccionada) {
      const err = new Error('Este evento no tiene zonas — no debe indicarse una zona seleccionada');
      err.status = 400;
      return next(err);
    }

    // ⭐ Cupos (pedido del usuario, 2026-09-07): antes esto era un `.insert()`
    // directo — 2 personas reservando al mismo tiempo el último lugar podían
    // sobrevender el evento, porque cada una leía "todavía hay cupo" antes de
    // que la otra terminara de insertar. `crear_reserva_con_cupo` hace el
    // chequeo + insert en una sola transacción con lock (ver migración
    // 20260907120000_add_cupos_eventos.sql).
    const { data, error } = await supabase.rpc('crear_reserva_con_cupo', {
      p_evento_id: datos.evento_id,
      p_evento_fijo_id: null,
      p_zona_nombre: datos.zona_seleccionada?.nombre ?? null,
      p_show_fecha_iso: null,
      p_nombre: datos.nombre,
      p_celular: datos.celular,
      p_email: datos.email,
      p_cantidad: datos.cantidad,
      p_estado: 'libre',
      p_show_seleccionado: null,
      p_zona_seleccionada: datos.zona_seleccionada ?? null,
    });

    if (error) return next(traducirError(error));

    res.status(201).json({ ok: true, data });

    // ⭐ Correo de confirmación (Fase 6, 2026-09-08; corregido 2026-09-09 para
    // no bloquear la respuesta) — la reserva ya quedó guardada y respondida al
    // comprador antes de esto; generar los QR y llamar a Resend puede tardar
    // varios cientos de ms, y no hay ninguna razón para que el comprador se
    // quede esperando esa latencia. `enviarCorreo` nunca lanza (ver
    // lib/resend.js), pero `obtenerQrsParaReserva`/la generación del QR en sí
    // no están dentro de ese try/catch — el `.catch` de acá es la red de
    // seguridad para que un fallo inesperado ahí no quede como una promesa sin
    // manejar (que puede tumbar el proceso).
    obtenerQrsParaReserva(data.id)
      .then((qrsCorreo) =>
        enviarCorreo({
          to: datos.email,
          subject: `Tu reserva para "${evento.titulo}" está confirmada`,
          html: plantillaCorreo({
            titulo: '¡Tu reserva está confirmada!',
            intro: `Guardamos tu lugar para <strong>${escaparHtml(evento.titulo)}</strong>. Aquí el resumen:`,
            imagenUrl: evento.img,
            filas: [
              { etiqueta: 'Evento', valor: escaparHtml(evento.titulo) },
              { etiqueta: 'Fecha', valor: escaparHtml(evento.fecha) },
              { etiqueta: 'Lugar', valor: escaparHtml(evento.lugar) },
              { etiqueta: 'Entradas', valor: String(datos.cantidad) },
            ],
            mapaUrl: evento.lugar ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.lugar)}` : null,
            notaFinal: notaQr(qrsCorreo),
            qrs: qrsCorreo,
          }),
        }),
      )
      .catch((err) => console.error('Fallo al preparar/mandar correo de confirmación (reserva libre):', err));

    return;
  }

  // evento_fijo_id — Salas/Enamoras.
  const { data: eventoFijo, error: eventoFijoError } = await supabase
    .from('eventos_fijos')
    .select('id, max_entradas, programacion, titulo, img')
    .eq('id', datos.evento_fijo_id)
    .eq('activo', true)
    .maybeSingle();

  if (eventoFijoError || !eventoFijo) {
    const err = new Error('El evento indicado no existe o no está activo');
    err.status = 400;
    return next(err);
  }

  const tieneProgramacion = (eventoFijo.programacion?.length ?? 0) > 0;

  // Si el evento fijo tiene programación (Salas), hay que elegir un show real de esa
  // lista — nunca se confía en el snapshot que manda el cliente sin cruzarlo contra
  // la programación vigente. Si no tiene programación (Enamoras), la reserva es
  // general y no debe traer ningún show.
  // Nota: dentro del jsonb de `programacion` la clave real es `fechaISO` (camelCase),
  // no `fecha_iso` — así quedó sembrada la data real (confirmado contra la base),
  // aunque el contrato público de este endpoint sí usa snake_case como el resto.
  if (tieneProgramacion) {
    const coincide = datos.show_seleccionado && eventoFijo.programacion.some(
      (p) => p.fechaISO === datos.show_seleccionado.fecha_iso && p.nombre === datos.show_seleccionado.nombre
    );
    if (!coincide) {
      const err = new Error('El show seleccionado no existe en la programación actual de este evento');
      err.status = 400;
      return next(err);
    }

    // ⭐ Mismo hallazgo real de arriba, aplicado a Salas: el show puede seguir
    // en `programacion` (no se borran los ya pasados) pero eso no significa
    // que todavía admita reservas.
    if (datos.show_seleccionado.fecha_iso < hoyColombia()) {
      const err = new Error('Esta función ya pasó y no admite más reservas');
      err.status = 400;
      return next(err);
    }
  } else if (datos.show_seleccionado) {
    const err = new Error('Este evento no tiene programación — no debe indicarse un show');
    err.status = 400;
    return next(err);
  }

  const maxEntradas = eventoFijo.max_entradas ?? 20;
  if (datos.cantidad > maxEntradas) {
    const err = new Error(`La cantidad máxima de entradas por reserva para este evento es ${maxEntradas}`);
    err.status = 400;
    return next(err);
  }

  const { data, error } = await supabase.rpc('crear_reserva_con_cupo', {
    p_evento_id: null,
    p_evento_fijo_id: datos.evento_fijo_id,
    p_zona_nombre: null,
    p_show_fecha_iso: datos.show_seleccionado?.fecha_iso ?? null,
    p_nombre: datos.nombre,
    p_celular: datos.celular,
    p_email: datos.email,
    p_cantidad: datos.cantidad,
    p_estado: 'libre',
    p_show_seleccionado: datos.show_seleccionado ?? null,
    p_zona_seleccionada: null,
  });

  if (error) return next(traducirError(error));

  // ⭐ Correo de confirmación (Fase 6, 2026-09-08) — mismo criterio que el
  // camino "Gratis" de arriba. Si hay show puntual seleccionado (Salas), se
  // incluye función/fecha; "Colombia me enamoras" (sin programación) no.
  const filasCorreo = [{ etiqueta: 'Experiencia', valor: escaparHtml(eventoFijo.titulo) }];
  if (datos.show_seleccionado) {
    filasCorreo.push({ etiqueta: 'Función', valor: `${escaparHtml(datos.show_seleccionado.nombre)} · ${escaparHtml(datos.show_seleccionado.dia)} ${escaparHtml(datos.show_seleccionado.hora)}` });
  }
  filasCorreo.push({ etiqueta: 'Entradas', valor: String(datos.cantidad) });

  res.status(201).json({ ok: true, data });

  // Ver nota de "no bloquear la respuesta" en el camino 'libre' de arriba —
  // mismo criterio acá.
  obtenerQrsParaReserva(data.id)
    .then((qrsCorreoFijo) =>
      enviarCorreo({
        to: datos.email,
        subject: `Tu reserva para "${eventoFijo.titulo}" está confirmada`,
        html: plantillaCorreo({
          titulo: '¡Tu reserva está confirmada!',
          intro: `Guardamos tu lugar para <strong>${escaparHtml(eventoFijo.titulo)}</strong>. Aquí el resumen:`,
          imagenUrl: eventoFijo.img,
          filas: filasCorreo,
          notaFinal: notaQr(qrsCorreoFijo),
          qrs: qrsCorreoFijo,
        }),
      }),
    )
    .catch((err) => console.error('Fallo al preparar/mandar correo de confirmación (reserva Salas/Enamoras):', err));
});

// ── Router admin: gestión (montado en /api/admin/reservas con requireAdmin) ──
const router = Router();

const updateSchema = z
  .object({
    nombre: z.string().trim().min(2).optional(),
    celular: z.string().trim().min(7).optional(),
    email: z.string().trim().email().optional(),
    cantidad: z.coerce.number().int().positive().optional(),
    estado: z.enum(ESTADOS).optional(),
    referencia_mp: z.string().trim().nullable().optional(),
  })
  .strict();

// GET / — listar todas las reservas, con el evento ya embebido
// ⭐ Paginación real agregada (auditoría Fase 5, 2026-09-01): igual criterio
// que inscripciones.js — se alimenta de envíos públicos, crece sin límite.
router.get('/', async (req, res, next) => {
  const result = paginacionSchema.safeParse(req.query);
  if (!result.success) {
    return next(zodError(result));
  }
  const { offset, limit } = result.data;

  const query = supabase
    .from('reservas')
    .select('*, eventos(titulo, slug, fecha, fecha_iso), eventos_fijos(titulo, slug), reserva_entradas(numero, validado_en)')
    .order('creado_en', { ascending: false });

  const { data, error } = await aplicarRango(query, offset, limit);

  if (error) {
    return next(errorGenerico(error, 'GET /api/admin/reservas'));
  }

  res.json({ ok: true, ...empaquetarPagina(data, limit) });
});

// PATCH /:id — el admin puede corregir datos del comprador, cambiar estado
// (ej. cancelar) o registrar una referencia de pago manual.
router.patch('/:id', requireCsrf, async (req, res, next) => {
  const { id } = req.params;

  const { data: actual, error: fetchError } = await supabase
    .from('reservas')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !actual) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    return next(err);
  }

  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return next(zodError(result));
  }

  const updates = stripUndefined(result.data);

  // ⭐ Hallazgo real (auditoría Fase 6, 2026-09-09): 3 huecos reales en este
  // PATCH, encontrados por revisión independiente — el `.update()` de abajo
  // aplicaba cualquier cambio de `estado`/`cantidad` directo, sin ninguno de
  // los 3 chequeos que sí protegen la creación de una reserva.
  const estadoResultante = updates.estado ?? actual.estado;

  // 1. Cancelar una reserva con entradas ya validadas en la puerta (alguien
  // ya entró) no debe pasar en silencio — nada avisaba antes de esto.
  if (updates.estado === 'cancelada' && actual.estado !== 'cancelada') {
    const { data: entradasValidadas } = await supabase
      .from('reserva_entradas')
      .select('id')
      .eq('reserva_id', id)
      .not('validado_en', 'is', null)
      .limit(1);

    if (entradasValidadas?.length) {
      const err = new Error('Esta reserva ya tiene entradas validadas en la puerta — no se puede cancelar');
      err.status = 409;
      return next(err);
    }
  }

  // 2. Reactivar una reserva cancelada, o subir la `cantidad` de una activa,
  // nunca volvía a comprobar cupo (a diferencia de crear_reserva_con_cupo,
  // que sí lo hace al crear) — un evento lleno podía sobrevenderse por una
  // edición legítima del admin. `revalidar_cupo_reserva` (mismo lock que
  // crear_reserva_con_cupo, ver migración 20260909090000) excluye la propia
  // reserva de la suma, así que sirve para los 2 casos.
  const reactivando = actual.estado === 'cancelada' && updates.estado !== undefined && updates.estado !== 'cancelada';
  const cambiaCantidad = updates.cantidad !== undefined && updates.cantidad !== actual.cantidad;
  if (estadoResultante !== 'cancelada' && (reactivando || cambiaCantidad)) {
    const { error: errorCupo } = await supabase.rpc('revalidar_cupo_reserva', {
      p_reserva_id: id,
      p_nueva_cantidad: updates.cantidad ?? actual.cantidad,
    });
    if (errorCupo) return next(traducirError(errorCupo));
  }

  // 3. Cambiar `cantidad` no creaba ni borraba filas de `reserva_entradas`
  // (los QR de cada entrada) — quedaban desincronizadas del número real de
  // personas. Nunca se borra una entrada ya validada (alguien ya entró con
  // ese código); si reducir la cantidad implicaría borrar una así, se
  // rechaza el cambio en vez de dejar un estado inconsistente.
  if (cambiaCantidad && estadoResultante !== 'cancelada') {
    const { data: entradasActuales, error: entradasError } = await supabase
      .from('reserva_entradas')
      .select('id, numero, validado_en')
      .eq('reserva_id', id)
      .order('numero');

    // Degrada con gracia (mismo criterio que obtenerQrsParaReserva): si la
    // tabla no tiene filas para esta reserva (reservas de antes de la
    // migración del QR) o falla la consulta, no hay nada que resincronizar.
    if (!entradasError && entradasActuales) {
      const cantidadActualEntradas = entradasActuales.length;
      if (updates.cantidad > cantidadActualEntradas) {
        const nuevasFilas = [];
        for (let n = cantidadActualEntradas + 1; n <= updates.cantidad; n += 1) {
          nuevasFilas.push({ reserva_id: id, numero: n });
        }
        await supabase.from('reserva_entradas').insert(nuevasFilas);
      } else if (updates.cantidad < cantidadActualEntradas) {
        const aEliminar = entradasActuales.filter((e) => e.numero > updates.cantidad);
        if (aEliminar.some((e) => e.validado_en)) {
          const err = new Error('No se puede reducir la cantidad por debajo de las entradas ya validadas en la puerta');
          err.status = 409;
          return next(err);
        }
        await supabase.from('reserva_entradas').delete().in('id', aEliminar.map((e) => e.id));
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('reservas').update(updates).eq('id', id);

    if (error) {
      return next(traducirError(error));
    }

    await logAudit({
      actor: req.admin,
      accion: 'editar',
      entidad: 'reservas',
      entidadId: id,
      detalle: updates,
    });
  }

  res.json({ ok: true, data: await obtenerReservaCompleta(id) });
});

// DELETE /:id — se permite (ej. duplicados o envíos erróneos), igual criterio que
// Inscripciones; para solo cerrar un caso sin perder el registro, usar
// PATCH { estado: 'cancelada' } en su lugar.
router.delete('/:id', requireCsrf, async (req, res, next) => {
  const { id } = req.params;

  const { data: actual, error: fetchError } = await supabase
    .from('reservas')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !actual) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    return next(err);
  }

  const { error } = await supabase.from('reservas').delete().eq('id', id);
  if (error) {
    return next(errorGenerico(error, 'DELETE /api/admin/reservas/:id'));
  }

  await logAudit({
    actor: req.admin,
    accion: 'borrar',
    entidad: 'reservas',
    entidadId: id,
    detalle: { nombre: actual.nombre, evento_id: actual.evento_id, evento_fijo_id: actual.evento_fijo_id },
  });

  res.json({ ok: true });
});

export default router;
