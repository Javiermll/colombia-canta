import { useState } from 'react';
import Button from './Button';
import HelpTooltip from './HelpTooltip';

// ⭐ PIN de puerta (Fase 6, 2026-09-08) — autentica la pantalla de validación
// de entradas (/puerta) sin pedirle cuenta de admin ni MFA al staff de esa
// noche. Genera uno nuevo cada vez que se hace clic (reemplaza el anterior —
// si alguien de una fecha vieja todavía lo tuviera guardado, deja de servir
// apenas se regenera).
//
// Extraído (auditoría Fase 6, 2026-09-09) — vivía copiado casi carácter por
// carácter en Eventos.jsx y EventosFijos.jsx, solo cambiaba el `endpoint`.
// ⭐ Pedido del usuario (2026-09-10): antes solo se veía el código suelto —
// para pasárselo al staff, el admin tenía que armar el mensaje ("entra a
// tal link y usa este código") a mano cada vez. Ahora el PIN se genera solo
// al crear el evento (ver eventos.js/POST) — esta caja casi siempre va a
// tener algo que mostrar — y un solo botón copia el link + código juntos,
// listos para pegar en WhatsApp.
export default function PinPuerta({ endpoint, pinInicial, adminFetch, onError }) {
  const [pinPuerta, setPinPuerta] = useState(pinInicial || '');
  const [generandoPin, setGenerandoPin] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const linkPuerta = `${window.location.origin}${window.location.pathname}#/puerta`;

  async function generarPinPuerta() {
    setGenerandoPin(true);
    onError?.('');
    try {
      const data = await adminFetch(endpoint, { method: 'POST' });
      setPinPuerta(data.data.pin);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setGenerandoPin(false);
    }
  }

  async function copiarParaStaff() {
    const texto = `Para validar entradas en la puerta: entra a ${linkPuerta} e ingresa este código: ${pinPuerta}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Clipboard API puede fallar sin contexto seguro/permiso — el link y el
      // código igual quedan visibles en pantalla para copiarlos a mano.
    }
  }

  return (
    <div className="eventos-pin-puerta">
      <p className="admin-field-label-texto">
        Código de puerta
        <HelpTooltip texto="Código de acceso para la pantalla que valida las entradas en la puerta (/puerta) — no requiere cuenta de admin, solo este código. Se genera solo al crear el evento; compártelo con el staff de esa noche." />
      </p>
      {pinPuerta ? (
        <>
          <p className="eventos-pin-puerta-valor">{pinPuerta}</p>
          <p className="eventos-pin-puerta-link">
            <a href={linkPuerta} target="_blank" rel="noopener noreferrer">{linkPuerta}</a>
          </p>
          <Button type="button" variant="secundario" onClick={copiarParaStaff}>
            {copiado ? '¡Copiado!' : 'Copiar link + código para el staff'}
          </Button>
        </>
      ) : (
        <p className="eventos-pin-puerta-vacio">Todavía no se generó ningún código.</p>
      )}
      <Button type="button" variant="secundario" onClick={generarPinPuerta} disabled={generandoPin}>
        {generandoPin ? 'Generando…' : pinPuerta ? '↺ Regenerar código' : 'Generar código'}
      </Button>
    </div>
  );
}
