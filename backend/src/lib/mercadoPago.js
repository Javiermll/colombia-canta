import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import crypto from 'crypto';

// Cliente centralizado del SDK oficial (`mercadopago`, v3.x — API basada en
// `MercadoPagoConfig` + clases de recurso, confirmada leyendo los
// `.d.ts` del propio paquete instalado, no asumida de memoria). Credenciales
// de PRUEBA (`TEST-...`, app "ENTRADAS-2") verificadas en vivo contra
// `GET /users/me` antes de empezar esta sección — ver
// `.claude/plans` / conversación del 2026-09-10.
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 8000 },
});

// Crea una preferencia de Checkout Pro — el comprador se redirige a
// `initPoint` para pagar. `externalReference` es el identificador propio que
// vuelve tal cual en el webhook (`'reserva:<uuid>'` / `'pedido:<uuid>'`, ver
// reservas.js/pedidos.js) para saber a qué registro corresponde el pago.
// `binary_mode: true` fuerza que el pago quede aprobado o rechazado, nunca
// "pendiente" — sin esto algunos medios (ej. efectivo/PSE) podrían dejar el
// pago en un estado intermedio por días; acá no aporta esperar ese estado
// porque el cupo/stock ya quedan reservados desde que se crea la reserva/
// pedido en `'pendiente'` (ver decisión de cupo con expiración, Fase 6).
export async function crearPreferencia({ items, externalReference, backUrls, notificationUrl, expiraEn }) {
  const preference = new Preference(client);
  const body = {
    items,
    external_reference: externalReference,
    notification_url: notificationUrl,
    binary_mode: true,
    // `auto_return` exige `back_urls.success` (Mercado Pago rechaza la
    // preferencia si se manda uno sin el otro) — solo se agregan juntos.
    ...(backUrls?.success ? { back_urls: backUrls, auto_return: 'approved' } : {}),
    ...(expiraEn ? { expires: true, expiration_date_to: expiraEn } : {}),
  };
  const creada = await preference.create({ body });
  return { id: creada.id, initPoint: creada.init_point ?? creada.sandbox_init_point };
}

// Vuelve a consultar el pago real por ID contra la API de MP — nunca se
// confía en el body que manda el webhook sin verificar contra la fuente
// (mismo principio de "nunca confiar en el cliente" ya aplicado en todo el
// proyecto, ej. el precio de un pedido siempre se recalcula server-side).
export async function obtenerPago(paymentId) {
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}

// Verifica la firma del webhook: header `x-signature`, formato documentado
// por Mercado Pago `ts=<timestamp>,v1=<hash>`, contra el manifest
// `id:<dataId>;request-id:<xRequestId>;ts:<ts>;`, HMAC-SHA256 con
// MERCADOPAGO_WEBHOOK_SECRET (Developers → la app → Webhooks → Configurar
// notificaciones → revelar clave secreta). `timingSafeEqual` para no filtrar
// el hash esperado por temporización, mismo criterio que otras comparaciones
// de secretos del proyecto.
//
// ⭐ Pendiente de verificar contra una entrega real (queda para la Sección 3,
// "Verificación", cuando haya un túnel público — ngrok o similar — para
// recibir un webhook de verdad): el manifest documentado usa `data.id` tal
// como llega en la notificación (querystring `data.id` en las notificaciones
// clásicas, o `data.id` dentro del body JSON en el formato nuevo) — no
// confirmado todavía cuál de las 2 formas usa la cuenta real de este
// proyecto, así que `webhookMercadoPago.js` intenta ambas.
export function verificarFirmaWebhook({ xSignature, xRequestId, dataId }) {
  const secreto = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secreto || !xSignature || !xRequestId || !dataId) return false;

  const partes = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [clave, valor] = p.trim().split('=');
      return [clave?.trim(), valor?.trim()];
    }),
  );
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hashEsperado = crypto.createHmac('sha256', secreto).update(manifest).digest('hex');

  const a = Buffer.from(v1, 'hex');
  const b = Buffer.from(hashEsperado, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
