import { Router } from 'express';
import { obtenerPago } from '../lib/mercadoPago.js';
import { toCamelCase } from '../lib/camelCase.js';

// ⭐ Verificación manual de pagos (pedido del usuario, 2026-09-10): el panel
// permite marcar una reserva/pedido como pagado a mano, escribiendo el ID de
// pago de Mercado Pago en el campo "Referencia de pago" (ver ReservaForm/
// PedidoForm) — pensado para el caso en que el correo automático de
// confirmación todavía no llegó y el admin quiere adelantarse. El hallazgo
// real que motiva esto: el usuario escribió un ID equivocado a mano (de OTRO
// pago) y no había forma de darse cuenta antes de guardar. Esta ruta consulta
// ese ID contra la API real de Mercado Pago (mismo helper `obtenerPago` que
// ya usa el webhook — nunca se confía en un ID a mano sin verificarlo contra
// la fuente) para que el admin vea, ANTES de guardar, a qué pago corresponde
// de verdad: monto, estado, a qué reserva/pedido apunta según Mercado Pago
// (`externalReference`) y el correo de quien pagó — así puede confirmar que
// coincide con el registro que tiene abierto o darse cuenta del error a
// tiempo.
const router = Router();

router.get('/pagos/:id', async (req, res, next) => {
  const { id } = req.params;
  if (!id?.trim()) {
    const err = new Error('Falta el ID de pago a verificar');
    err.status = 400;
    return next(err);
  }

  try {
    const pago = await obtenerPago(id.trim());
    const { status, statusDetail, transactionAmount, currencyId, externalReference, payer, dateApproved } = toCamelCase(pago);
    res.json({
      ok: true,
      data: {
        id: pago.id,
        estado: status,
        estadoDetalle: statusDetail,
        monto: transactionAmount,
        moneda: currencyId,
        externalReference: externalReference || null,
        emailPagador: payer?.email || null,
        fechaAprobado: dateApproved || null,
      },
    });
  } catch (err) {
    // El SDK de Mercado Pago lanza con `status`/`message` propios cuando el
    // ID no existe (404 real de su API) — se traduce a un mensaje claro en
    // vez del genérico "Error interno".
    if (err.status === 404 || err.statusCode === 404) {
      const notFound = new Error('No existe ningún pago de Mercado Pago con ese ID — revisa que esté bien escrito.');
      notFound.status = 404;
      return next(notFound);
    }
    next(err);
  }
});

export default router;
