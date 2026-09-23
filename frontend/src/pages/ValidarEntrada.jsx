import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiFetch } from '../utils/api';
import './ValidarEntrada.css';

const ELEMENTO_ESCANER = 'lector-qr-puerta';

// ⭐ Pantalla de puerta (Fase 6, 2026-09-08) — pedido del usuario: pantalla
// aparte del panel de admin, sin cuenta ni MFA, pensada para el celular del
// staff de una noche puntual. El PIN se pide UNA sola vez por sesión (no por
// cada escaneo) — el backend valida cada entrada escaneada contra el evento
// real al que pertenece, el PIN local acá solo se manda junto a cada
// petición (ver validarEntrada.js, backend).
export default function ValidarEntrada() {
  const [paso, setPaso] = useState('pin'); // 'pin' | 'confirmar' | 'escanear'
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [confirmandoPin, setConfirmandoPin] = useState(false);
  const [nombreEvento, setNombreEvento] = useState('');
  const [manualId, setManualId] = useState('');
  const [resultado, setResultado] = useState(null); // { tipo: 'ok'|'error', mensaje, detalle }
  const [procesando, setProcesando] = useState(false);
  const scannerRef = useRef(null);
  const procesandoRef = useRef(false); // evita doble-disparo del propio callback de la cámara
  const tituloRef = useRef(null); // foco explícito en cada cambio de paso/resultado (accesibilidad)
  const audioCtxRef = useRef(null);

  // ⭐ Pedido del usuario (2026-09-10): señal sonora/de vibración en cada
  // validación — en un evento real (oscuro, ruidoso), el staff escaneando
  // rápido a varias personas seguidas puede no alcanzar a mirar la pantalla
  // cada vez. El tono se sintetiza con Web Audio (no hace falta subir ni
  // cargar ningún archivo de audio). Los navegadores exigen que el primer
  // `AudioContext` se cree/reanude durante un gesto real del usuario — se
  // aprovecha el envío del formulario del PIN (un clic real) para eso, así
  // los tonos disparados después por la cámara (que no es un gesto directo)
  // ya no chocan con esa restricción.
  function iniciarAudio() {
    if (audioCtxRef.current) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return; // navegador sin soporte — el resto sigue funcionando igual, solo sin sonido
    audioCtxRef.current = new Ctx();
  }

  function reproducirTono(tipo) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const ahora = ctx.currentTime;
    const frecuencias = tipo === 'ok' ? [880] : [220, 220];
    frecuencias.forEach((frecuencia, i) => {
      const oscilador = ctx.createOscillator();
      const ganancia = ctx.createGain();
      oscilador.frequency.value = frecuencia;
      oscilador.connect(ganancia);
      ganancia.connect(ctx.destination);
      const inicio = ahora + i * 0.18;
      ganancia.gain.setValueAtTime(0.15, inicio);
      ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + 0.15);
      oscilador.start(inicio);
      oscilador.stop(inicio + 0.15);
    });
  }

  // `navigator.vibrate` no existe en iOS Safari — se llama igual, sin
  // chequear soporte de forma explícita, porque no lanza si no existe la
  // función (el `?.` alcanza como guarda).
  function vibrar(tipo) {
    navigator.vibrate?.(tipo === 'ok' ? 80 : [80, 60, 80]);
  }

  async function validar(entradaId) {
    if (procesandoRef.current) return;
    procesandoRef.current = true;
    setProcesando(true);

    // ⭐ Bug real (encontrado por el usuario, 2026-09-10): `pause()` de
    // html5-qrcode LANZA ("Cannot pause, scanner is not scanning.") si se
    // llama cuando la cámara todavía no arrancó de verdad (ej. el permiso de
    // cámara no se otorgó y se validó a mano) o ya está en pausa. Antes esta
    // línea vivía ANTES del try/catch de abajo — ese throw se escapaba sin
    // que nada lo atajara, dejando `procesandoRef`/`procesando` en `true`
    // para siempre (el botón "Validar" quedaba pegado en "Validando…" hasta
    // recargar la página, porque el `finally` de abajo nunca llegaba a
    // ejecutarse). Con esto envuelto en su propio try/catch, un pause() que
    // falla no es un error real — simplemente no había nada que pausar — y
    // el flujo sigue normal hacia la petición real.
    try {
      scannerRef.current?.pause(true);
    } catch {
      // No había una cámara activamente escaneando — nada que hacer acá.
    }

    try {
      const body = await apiFetch('/api/validar-entrada', {
        method: 'POST',
        body: { entrada_id: entradaId.trim(), pin },
      });
      setResultado({ tipo: 'ok', ...body.data });
      reproducirTono('ok');
      vibrar('ok');
    } catch (err) {
      setResultado({ tipo: 'error', mensaje: err.message });
      reproducirTono('error');
      vibrar('error');
    } finally {
      setProcesando(false);
      procesandoRef.current = false;
    }
  }

  // ⭐ Pedido del usuario (2026-09-10): antes el PIN pasaba directo a la
  // cámara sin confirmar nada — un PIN mal escrito (o de otra noche) recién
  // se descubría al fallar el primer escaneo real, ya en medio del evento.
  // Ahora se resuelve a qué evento pertenece ANTES de escanear, y se muestra
  // para que el staff confirme que es el correcto.
  async function confirmarPin(e) {
    e.preventDefault();
    if (!pin.trim()) return;
    iniciarAudio();
    setConfirmandoPin(true);
    setPinError('');
    try {
      const body = await apiFetch('/api/validar-entrada/evento', {
        method: 'POST',
        body: { pin },
      });
      setNombreEvento(body.data.evento);
      setPaso('confirmar');
    } catch (err) {
      setPinError(err.message);
    } finally {
      setConfirmandoPin(false);
    }
  }

  function seguirEscaneando() {
    setResultado(null);
    setManualId('');
    scannerRef.current?.resume();
  }

  function cambiarEvento() {
    scannerRef.current?.clear().catch(() => {});
    scannerRef.current = null;
    setPaso('pin');
    setPin('');
    setPinError('');
    setNombreEvento('');
    setResultado(null);
  }

  // El lector de cámara se monta solo al entrar al paso "escanear" — html5-qrcode
  // pide permiso de cámara apenas se renderiza, no tiene sentido pedirlo antes
  // de que el PIN esté puesto.
  useEffect(() => {
    if (paso !== 'escanear') return;

    const scanner = new Html5QrcodeScanner(
      ELEMENTO_ESCANER,
      { fps: 10, qrbox: 240 },
      /* verbose */ false,
    );
    scanner.render(
      (textoDecodificado) => validar(textoDecodificado),
      () => {}, // errores de "no encontró QR en este frame" — constantes y esperables, se ignoran
    );
    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  // ⭐ Hallazgo real (auditoría de accesibilidad, Fase 6, 2026-09-09): al pasar
  // de "pedir PIN" a "escanear", o al mostrar/limpiar un resultado, el
  // elemento enfocado se desmontaba sin que nada recibiera el foco — un
  // usuario de teclado/lector de pantalla perdía el contexto por completo en
  // cada paso. Se mueve el foco al título de la pantalla de escaneo en cada
  // transición (la pantalla de PIN ya maneja su propio foco inicial con
  // `autoFocus` en el input, no hace falta acá).
  useEffect(() => {
    if (paso === 'escanear' || paso === 'confirmar') tituloRef.current?.focus();
  }, [paso, resultado]);

  if (paso === 'pin') {
    return (
      <div className="puerta-pantalla">
        <div className="puerta-tarjeta">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Colombia Canta y Encanta" className="puerta-logo" />
          <h1 className="puerta-titulo">Validar entradas</h1>
          <p className="puerta-sub" id="puerta-pin-ayuda">Ingresa el código de puerta de esta noche.</p>
          <form onSubmit={confirmarPin}>
            <label htmlFor="puerta-pin" className="puerta-visually-hidden">Código de puerta</label>
            <input
              id="puerta-pin"
              type="text"
              inputMode="numeric"
              className="puerta-input-pin"
              placeholder="000000"
              maxLength={6}
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
              aria-describedby="puerta-pin-ayuda"
              aria-invalid={!!pinError}
              autoFocus
            />
            {pinError && <p className="puerta-pin-error" role="alert">{pinError}</p>}
            <button type="submit" className="puerta-btn" disabled={!pin.trim() || confirmandoPin}>
              {confirmandoPin ? 'Verificando…' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ⭐ Pedido del usuario (2026-09-10): paso intermedio entre el PIN y la
  // cámara — confirma a qué evento corresponde el PIN antes de dejar
  // escanear, para que un PIN equivocado se detecte de inmediato en vez de
  // descubrirse recién con el primer escaneo real fallido.
  if (paso === 'confirmar') {
    return (
      <div className="puerta-pantalla">
        <div className="puerta-tarjeta">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Colombia Canta y Encanta" className="puerta-logo" />
          <h1 className="puerta-titulo puerta-titulo--chico" ref={tituloRef} tabIndex={-1}>Vas a validar entradas para:</h1>
          <p className="puerta-evento-confirmado">{nombreEvento}</p>
          <button type="button" className="puerta-btn" onClick={() => setPaso('escanear')}>
            Confirmar y escanear
          </button>
          <button type="button" className="puerta-link" onClick={cambiarEvento}>
            No es este evento — cambiar código
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="puerta-pantalla">
      <div className="puerta-tarjeta puerta-tarjeta--ancha">
        <div className="puerta-header-escaneo">
          <h1 className="puerta-titulo puerta-titulo--chico" ref={tituloRef} tabIndex={-1}>Escanear entrada</h1>
          <button type="button" className="puerta-link" onClick={cambiarEvento}>Cambiar evento</button>
        </div>

        {resultado ? (
          <div className={`puerta-resultado puerta-resultado--${resultado.tipo}`} role="alert">
            {resultado.tipo === 'ok' ? (
              <>
                <p className="puerta-resultado-icono">✓</p>
                <p className="puerta-resultado-titulo">Entrada válida</p>
                <p className="puerta-resultado-detalle">{resultado.comprador}</p>
                <p className="puerta-resultado-detalle">{resultado.evento}</p>
                <p className="puerta-resultado-chico">Entrada {resultado.entradaNumero} de {resultado.entradaTotal}</p>
              </>
            ) : (
              <>
                <p className="puerta-resultado-icono">✕</p>
                <p className="puerta-resultado-titulo">No válida</p>
                <p className="puerta-resultado-detalle">{resultado.mensaje}</p>
              </>
            )}
            <button type="button" className="puerta-btn" onClick={seguirEscaneando}>
              Escanear otra
            </button>
          </div>
        ) : (
          <>
            <p className="puerta-lector-ayuda">Apunta la cámara al código QR de la entrada.</p>
            <div id={ELEMENTO_ESCANER} className="puerta-lector" />
            {procesando && <p className="puerta-procesando">Validando…</p>}
            <div className="puerta-manual">
              <p className="puerta-manual-label" id="puerta-manual-label">¿No funciona la cámara? Escribe el código:</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualId.trim()) validar(manualId);
                }}
              >
                <label htmlFor="puerta-manual-id" className="puerta-visually-hidden">Código de la entrada</label>
                <input
                  id="puerta-manual-id"
                  type="text"
                  className="puerta-input-manual"
                  placeholder="Código de la entrada"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  aria-describedby="puerta-manual-label"
                />
                <button type="submit" className="puerta-btn puerta-btn--secundario" disabled={!manualId.trim() || procesando}>
                  Validar
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
