import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import Button from './Button';

const ESTADOS_LABEL = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  in_process: 'En proceso',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  charged_back: 'Contracargo',
};

function formatearMontoMp(monto, moneda) {
  if (monto == null) return '—';
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: moneda || 'COP', maximumFractionDigits: 0 }).format(monto);
  } catch {
    return `${monto} ${moneda || ''}`.trim();
  }
}

function formatearFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

// ⭐ Pedido del usuario (2026-09-10): antes de guardar una reserva/pedido como
// "pagado" a mano con un ID de Mercado Pago escrito a mano, se puede
// verificar ese ID contra la API real de Mercado Pago (mismo helper que ya
// usa el webhook, `obtenerPago` — ver backend/src/lib/mercadoPago.js) — el
// hallazgo real que lo motiva: el usuario escribió el ID equivocado (de otro
// pago) y no había forma de darse cuenta antes de guardar. `externalReference
// Esperada` es lo que ESTE registro debería ver en el pago
// (`reserva:<uuid>`/`pedido:<uuid>`, mismo formato que arma
// `crearPreferencia` al crear el cobro) — si no coincide, se avisa fuerte.
export default function VerificarPagoMp({ referenciaMp, adminFetch, externalReferenceEsperada }) {
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  async function verificar() {
    if (!referenciaMp.trim()) return;
    setVerificando(true);
    setError('');
    setResultado(null);
    try {
      const data = await adminFetch(`/api/admin/mercadopago/pagos/${encodeURIComponent(referenciaMp.trim())}`);
      setResultado(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerificando(false);
    }
  }

  const coincide = resultado && resultado.externalReference === externalReferenceEsperada;
  const sinReferencia = resultado && !resultado.externalReference;
  const noCoincide = resultado && resultado.externalReference && !coincide;

  return (
    <div className="verpago">
      <Button type="button" variant="secundario" onClick={verificar} disabled={!referenciaMp.trim() || verificando}>
        {verificando ? 'Verificando…' : 'Verificar contra Mercado Pago'}
      </Button>

      {error && (
        <p className="verpago-aviso verpago-aviso--error">
          <ShieldAlert size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {resultado && (
        <div className={`verpago-resultado${coincide ? ' verpago-resultado--ok' : noCoincide ? ' verpago-resultado--error' : ' verpago-resultado--alerta'}`}>
          <p className="verpago-resultado-titulo">
            {coincide && <><ShieldCheck size={16} aria-hidden="true" /> Coincide con este registro</>}
            {noCoincide && <><ShieldAlert size={16} aria-hidden="true" /> Este pago NO es de este registro</>}
            {sinReferencia && <><ShieldQuestion size={16} aria-hidden="true" /> Mercado Pago no tiene a qué registro corresponde este pago</>}
          </p>
          <dl className="verpago-datos">
            <div><dt>Monto pagado</dt><dd>{formatearMontoMp(resultado.monto, resultado.moneda)}</dd></div>
            <div><dt>Estado en Mercado Pago</dt><dd>{ESTADOS_LABEL[resultado.estado] || resultado.estado}</dd></div>
            <div><dt>Pagado por</dt><dd>{resultado.emailPagador || '—'}</dd></div>
            <div><dt>Fecha de aprobación</dt><dd>{formatearFecha(resultado.fechaAprobado)}</dd></div>
          </dl>
          {noCoincide && (
            <p className="verpago-detalle">
              Este ID de pago corresponde a otro registro en Mercado Pago (referencia: {resultado.externalReference}) — no lo uses para confirmar este.
            </p>
          )}
          {sinReferencia && (
            <p className="verpago-detalle">
              Puede ser un pago de otro origen o muy antiguo. Antes de guardar, confirma a mano que el monto y el correo de arriba coinciden con lo esperado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
