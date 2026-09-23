import { Router } from 'express';
import { supabase } from '../config/supabaseClient.js';
import { obtenerPago, verificarFirmaWebhook } from '../lib/mercadoPago.js';
import { confirmarPagoReserva } from './reservas.js';
import { confirmarPagoPedido } from './pedidos.js';

// Único punto de entrada de webhooks de Mercado Pago para AMBOS flujos
// (Eventos de pago y Tienda) — se distingue por el prefijo de
// `external_reference` (`'reserva:<uuid>'` / `'pedido:<uuid>'`). Pública a
// propósito (Mercado Pago no manda cookie de sesión ni token CSRF, no pasa
// por `requireCsrf`) — se autentica con la firma `x-signature` en su lugar.
export const webhookMercadoPagoRouter = Router();

// ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): hasta acá, este
// webhook solo confiaba en `status === 'approved'` + `external_reference`
// reales (vueltos a pedir a la API de MP, nunca del body de la notificación)
// — pero nunca comparaba CUÁNTO se pagó de verdad contra el total real que
// debería cobrar esa reserva/pedido. En la práctica no debería poder pasar
// (el monto se lo mandamos nosotros mismos a MP al crear la preferencia),
// pero es la última capa de defensa antes de dar un pago por confirmado — si
// algo llegara a desalinear ambos lados (un bug futuro, una preferencia
// vieja reusada, un pago manipulado), sin esto se confirmaría igual,
// cobrando de menos sin que nadie se entere.
async function montoCoincideConPedido(pedidoId, pago) {
  const { data } = await supabase.from('pedidos').select('total').eq('id', pedidoId).maybeSingle();
  if (!data) return false;
  return pago.currency_id === 'COP' && Math.round(pago.transaction_amount) === data.total;
}

// Las reservas no guardan un `total` propio (a diferencia de `pedidos`) — el
// monto esperado se recalcula igual que `manejarReservaDePago` al crear la
// preferencia: precio × cantidad. `zona_seleccionada.precio` ya queda
// guardado como número real (no el string compuesto "$90.000" de
// `eventos.zonas`) con `moneda` aparte — `manejarReservaDePago` ya hizo ese
// parseo una vez al crear la reserva (ver `parsePrecioCompuesto` ahí), acá
// no hay que repetirlo. Si no hay `zona_seleccionada` (evento 'libre',
// gratuito), esa reserva nunca debió pasar por Mercado Pago — se rechaza.
async function montoCoincideConReserva(reservaId, pago) {
  const { data } = await supabase.from('reservas').select('cantidad, zona_seleccionada').eq('id', reservaId).maybeSingle();
  if (!data?.zona_seleccionada?.precio) return false;
  const { precio, moneda } = data.zona_seleccionada;
  const totalEsperado = precio * data.cantidad;
  return pago.currency_id === 'COP' && moneda === 'COP' && Math.round(pago.transaction_amount) === totalEsperado;
}

// Mercado Pago manda notificaciones de varios `type`/`topic` (payment,
// merchant_order, chargebacks...) — solo procesamos 'payment'. El resto se
// reconoce y se responde 200 sin hacer nada, para que MP no siga
// reintentando algo que nunca vamos a procesar. `dataId` puede llegar por
// querystring (notificaciones clásicas, `?data.id=...`/`?id=...`) o dentro
// del body JSON (formato nuevo, `{ data: { id } }`) — se acepta cualquiera
// de las 2 formas, sin asumir cuál usa la cuenta real de este proyecto
// (pendiente de confirmar con una entrega real, ver Sección 3 del plan).
webhookMercadoPagoRouter.post('/', async (req, res) => {
  const tipo = req.body?.type || req.query.type || req.query.topic;
  const dataId = req.body?.data?.id || req.query['data.id'] || req.query.id;

  if (tipo !== 'payment' || !dataId) {
    return res.sendStatus(200);
  }

  const firmaValida = verificarFirmaWebhook({
    xSignature: req.headers['x-signature'],
    xRequestId: req.headers['x-request-id'],
    dataId,
  });

  if (!firmaValida) {
    console.error('Webhook de Mercado Pago con firma inválida — ignorado', { dataId });
    return res.sendStatus(401);
  }

  try {
    // Nunca se confía en el body de la notificación en sí (ya autenticado
    // por firma, pero igual puede estar desactualizado/incompleto) — se
    // vuelve a pedir el pago real por ID directo a la API de MP antes de
    // actuar, mismo principio de "nunca confiar en el cliente" del resto
    // del proyecto.
    const pago = await obtenerPago(dataId);
    const referencia = pago.external_reference;

    if (pago.status !== 'approved' || !referencia) {
      return res.sendStatus(200);
    }

    if (referencia.startsWith('reserva:')) {
      const reservaId = referencia.slice('reserva:'.length);
      if (!(await montoCoincideConReserva(reservaId, pago))) {
        console.error(
          `Webhook de Mercado Pago: el monto pagado (${pago.transaction_amount} ${pago.currency_id}) no coincide con el total esperado de la reserva ${reservaId} — pago ${pago.id} IGNORADO, requiere revisión manual.`,
        );
        return res.sendStatus(200);
      }
      await confirmarPagoReserva(reservaId, String(pago.id));
    } else if (referencia.startsWith('pedido:')) {
      const pedidoId = referencia.slice('pedido:'.length);
      if (!(await montoCoincideConPedido(pedidoId, pago))) {
        console.error(
          `Webhook de Mercado Pago: el monto pagado (${pago.transaction_amount} ${pago.currency_id}) no coincide con el total esperado del pedido ${pedidoId} — pago ${pago.id} IGNORADO, requiere revisión manual.`,
        );
        return res.sendStatus(200);
      }
      await confirmarPagoPedido(pedidoId, String(pago.id));
    } else {
      console.warn('Webhook de Mercado Pago con external_reference de prefijo desconocido:', referencia);
    }

    res.sendStatus(200);
  } catch (err) {
    // 500 a propósito (no 200) — así Mercado Pago reintenta la notificación
    // más adelante en vez de darla por procesada cuando en realidad falló.
    console.error('Fallo procesando webhook de Mercado Pago:', err);
    res.sendStatus(500);
  }
});
