import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { EMAIL_REGEX } from '../../utils/validacion';
import { parsePrecioCompuesto, formatearMonto } from '../../utils/formato';
import './ReservaModal.css';

function validateField(field, value) {
  if (field === 'nombre')  return value.trim().length < 2  ? 'Ingresa tu nombre completo' : '';
  if (field === 'celular') return value.replace(/\D/g, '').length < 7 ? 'Ingresa un número válido' : '';
  if (field === 'email')   return EMAIL_REGEX.test(value.trim()) ? '' : 'Ingresa un correo electrónico válido';
  return '';
}

export default function ReservaModal({ evento, itemSeleccionado, onClose }) {
  const [form, setForm] = useState({ nombre: '', celular: '', email: '', cantidad: 1, categoria: '', portafolio: '' });
  // ⭐ Pedido del usuario (2026-09-10): antes siempre preseleccionaba la
  // primera zona del arreglo — si esa primera zona estaba agotada, todo el
  // modal se mostraba como "Agotado" aunque OTRAS zonas todavía tuvieran
  // cupo real. Se prefiere la primera zona que no esté explícitamente en 0
  // (`cupoDisponible` solo existe para zonas con cupo definido — una zona
  // sin cupo, `undefined`, cuenta como disponible).
  const [zonaSeleccionada, setZonaSeleccionada] = useState(
    () => evento.zonas?.find((z) => z.cupoDisponible !== 0) ?? evento.zonas?.[0] ?? null,
  );
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

  // `accion_tipo` es una columna obligatoria en `eventos` y no existe en absoluto en
  // `eventos_fijos` — así se distingue de forma estructural (no con un truco de texto)
  // cuál de las dos tablas es el origen real de este `evento`.
  const esEventoFijo = evento.accionTipo === undefined;
  const esLibre = evento.accionTipo === 'libre';
  // ⭐ Mercado Pago (Fase 6, Sección 1, 2026-09-10): antes `esPago` se
  // adivinaba del texto de `evento.precio` (por descarte, "si no es libre
  // ni fijo y el precio no es uno de estos 3 textos") — ahora que 'pago' sí
  // tiene su propio flujo real, se usa el mismo campo estructural que ya
  // distingue a 'libre'/'festival' en vez de seguir adivinando por texto
  // (mismo criterio ya preferido en el resto del proyecto, ver `accion_tipo`
  // en CLAUDE.md).
  const esPago = evento.accionTipo === 'pago';
  // ⭐ Pedido del usuario (2026-09-07): una convocatoria no vende "entradas"
  // — no tiene sentido pedir cantidad. Pide en cambio datos propios de una
  // postulación (categoría + portafolio). Sigue siendo simulado (no tiene
  // backend propio — es un formulario externo vía `inscripcion_link`, ver
  // más abajo en `handleSubmit`).
  const esConvocatoria = evento.accionTipo === 'festival';
  // Eventos 'libre', eventos fijos (Salas/Enamoras) y ahora también 'pago'
  // (Mercado Pago) se conectan de verdad a POST /api/reservas — solo
  // 'festival' (convocatoria) sigue con el flujo simulado.
  const puedeReservarDeVerdad = esLibre || esEventoFijo || esPago;

  // Eventos de pago se rigen por su propia política; gratis y Salas/Enamoras
  // (que no tienen concepto de pago en su esquema) caen bajo la de eventos
  // gratuitos.
  const rutaPolitica = esPago ? '/politicas-eventos-pago' : '/politicas-eventos-gratuitos';
  const nombrePolitica = esPago ? 'Políticas de Eventos de Pago' : 'Políticas de Eventos Gratuitos';

  // ⭐ Cupos (pedido del usuario, 2026-09-07; extendido a Eventos de pago,
  // 2026-09-10): `cupoDisponible` viene del backend para 'libre'/eventos
  // fijos con cupo definido, y ahora también por ZONA en eventos 'pago' —
  // para el resto (festival/próximamente, o sin cupo configurado) queda
  // `undefined` y no cambia nada de lo de siempre. Doble chequeo real, no
  // solo de UI: `EventoDetalle` ya evita abrir este modal si está agotado,
  // pero esto cubre la carrera de "se agotó justo mientras el modal ya
  // estaba abierto" (o "esta zona en particular se agotó").
  const cupoDisponible = itemSeleccionado
    ? itemSeleccionado.cupoDisponible
    : (zonaSeleccionada?.cupoDisponible ?? evento.cupoDisponible);
  const agotado = cupoDisponible === 0;
  const maxEntradasBase = evento.maxEntradas ?? 20;
  const maxEntradas = typeof cupoDisponible === 'number' ? Math.max(0, Math.min(maxEntradasBase, cupoDisponible)) : maxEntradasBase;

  // ⭐ Hallazgo real (2026-08-16, corregido en la auditoría de cierre de
  // Fase 5, 2026-09-08): `zonaSeleccionada.precio` es texto compuesto
  // (ej. "$45.000" o "$35 USD", ver Eventos.jsx admin) — antes se sacaban
  // solo los dígitos con `parseInt(...replace(/[^0-9]/g,''))` y el total se
  // formateaba SIEMPRE como pesos colombianos, sin importar la moneda real
  // ("$35 USD" mostraba "$35" como si fueran 35 pesos). Se reusa el mismo
  // parser del panel admin (`parsePrecioCompuesto`) para leer moneda+monto
  // de verdad, y `formatearMonto` para mostrarlo con el sufijo correcto.
  const { monto: montoZona, moneda: monedaZona } = zonaSeleccionada
    ? parsePrecioCompuesto(zonaSeleccionada.precio)
    : { monto: '', moneda: 'COP' };
  const precioNumerico = montoZona ? Number(montoZona) : null;
  const totalStr = precioNumerico
    ? formatearMonto(precioNumerico * form.cantidad, monedaZona)
    : null;

  const priceBadge = zonaSeleccionada
    ? `${zonaSeleccionada.nombre} · ${zonaSeleccionada.precio}`
    : (evento.precio ?? 'Reserva gratuita');
  const eventoNombre = itemSeleccionado ? itemSeleccionado.nombre : evento.titulo;
  const eventoFecha  = itemSeleccionado
    ? `${itemSeleccionado.dia} · ${itemSeleccionado.hora}`
    : (evento.fechaCompleta ?? evento.fecha ?? '');
  const eventoLugar  = evento.lugar ?? evento.ciudad;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ⭐ Hallazgo real (auditoría de cierre de Fase 5, 2026-09-08): el foco
  // nunca se movía al abrir este modal — a diferencia de ConfirmDialog.jsx
  // (mismo criterio ya aplicado ahí desde la auditoría de 5.2), un usuario
  // de teclado que abre "Reservar" queda con el foco en el botón de fondo y
  // tiene que tabular manualmente hasta encontrar el diálogo. Se mueve al
  // botón "Cerrar" (opción segura, sin disparar nada por accidente) al
  // montar — cubre también los estados de éxito/agotado, que reusan el
  // mismo botón.
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOverlay = e => { if (e.target === overlayRef.current) onClose(); };

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (touched[field]) setErrors(e => ({ ...e, [field]: validateField(field, val) }));
  };

  const handleBlur = field => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: validateField(field, form[field]) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const allTouched = { nombre: true, celular: true, email: true };
    const allErrors  = {
      nombre:  validateField('nombre',  form.nombre),
      celular: validateField('celular', form.celular),
      email:   validateField('email',   form.email),
    };
    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;

    // ⭐ Hallazgo real (auditoría de accesibilidad, Fase 6, 2026-09-09): antes
    // el botón quedaba `disabled` sin aceptar los términos — un usuario de
    // teclado/lector de pantalla que llenaba todo el formulario nunca se
    // enteraba de qué faltaba (un elemento disabled sale del orden de
    // tabulación, sin foco ni mensaje que aterrice ahí). Ahora el botón
    // siempre es alcanzable y, si falta aceptar, se explica con el mismo
    // patrón ya usado para errorEnvio (`role="alert"`, visible y anunciado).
    if (!aceptaTerminos) {
      setErrorEnvio('Debes aceptar los Términos y Condiciones para continuar.');
      return;
    }

    setErrorEnvio(null);
    setLoading(true);

    if (!puedeReservarDeVerdad) {
      // Simulación — solo queda acá "Convocatoria" (festival), que no tiene
      // backend propio (formulario externo vía `inscripcion_link`).
      setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
      return;
    }

    const datosComprador = {
      nombre: form.nombre,
      celular: form.celular,
      email: form.email,
      cantidad: form.cantidad,
      acepta_terminos: true,
    };

    const body = esEventoFijo
      ? {
          evento_fijo_id: evento.id,
          show_seleccionado: itemSeleccionado
            ? {
                dia: itemSeleccionado.dia,
                hora: itemSeleccionado.hora,
                nombre: itemSeleccionado.nombre,
                descripcion: itemSeleccionado.descripcion ?? null,
                fecha_iso: itemSeleccionado.fechaISO,
              }
            : null,
          ...datosComprador,
        }
      : {
          evento_id: evento.id,
          zona_seleccionada: zonaSeleccionada
            ? { nombre: zonaSeleccionada.nombre, precio: precioNumerico, moneda: monedaZona }
            : null,
          ...datosComprador,
        };

    try {
      const { data } = await apiFetch('/api/reservas', { method: 'POST', body });
      // ⭐ Mercado Pago (Fase 6, Sección 1, 2026-09-10): para 'pago' el
      // backend NO crea la reserva como confirmada — la deja 'pendiente'
      // (reservando el cupo) y responde con el link de Checkout Pro. Acá se
      // sale del sitio hacia Mercado Pago en vez de mostrar la pantalla de
      // éxito; esa pantalla real (con QR) solo existe una vez que el pago se
      // confirma, por correo — el sitio no vuelve a "reserva recibida" para
      // este camino.
      if (esPago) {
        window.location.href = data.initPoint;
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setLoading(false);
    }
  };

  // `aceptaTerminos` ya NO deshabilita el botón (ver handleSubmit) — así el
  // usuario puede llegar hasta ahí con teclado y recibir el mensaje real en
  // vez de encontrar un botón inerte sin explicación.
  const canSubmit = !Object.values(errors).some(Boolean)
    && form.nombre.trim() && form.celular.trim() && form.email.trim();

  return (
    <div className="rm-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="rm-modal" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="rm-titulo">
        <button className="rm-close" ref={closeBtnRef} onClick={onClose} aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="rm-panel">
          {submitted ? (
            <SuccessView email={form.email} esConvocatoria={esConvocatoria} onClose={onClose} />
          ) : agotado ? (
            <AgotadoView onClose={onClose} />
          ) : (
            <>
              <span className="rm-badge">{priceBadge}</span>
              <h2 className="rm-titulo" id="rm-titulo">{esConvocatoria ? 'Datos de Postulación' : 'Datos de Reserva'}</h2>
              <p className="rm-subtitulo">
                {esConvocatoria
                  ? 'Ingresa tus datos para postularte a esta convocatoria.'
                  : esPago
                    ? 'Ingresa tus datos para continuar con el pago y emitir tu entrada.'
                    : 'Por favor ingresa tus datos para emitir tu entrada digital.'}
              </p>

              {itemSeleccionado && (
                <div className="rm-show-badge">
                  <span className="rm-show-nombre">{itemSeleccionado.nombre}</span>
                  <span className="rm-show-meta">{itemSeleccionado.dia} · {itemSeleccionado.hora}</span>
                </div>
              )}

              {evento.zonas?.length > 0 && (
                <div className="rm-zonas">
                  <span className="rm-zonas-label">Selecciona tu zona</span>
                  <div className="rm-zonas-btns">
                    {evento.zonas.map(z => {
                      // ⭐ Pedido del usuario (2026-09-10): mostrar cupo
                      // disponible por zona — antes solo se sabía si estaba
                      // agotada al intentar comprar. `cupoDisponible` solo
                      // existe si esa zona tiene un límite definido; sin
                      // límite, no se muestra ningún número (no hay nada
                      // real que contar).
                      const zonaAgotada = z.cupoDisponible === 0;
                      return (
                        <button
                          key={z.nombre}
                          type="button"
                          className={`rm-zona-btn${zonaSeleccionada?.nombre === z.nombre ? ' rm-zona-btn--activo' : ''}${zonaAgotada ? ' rm-zona-btn--agotada' : ''}`}
                          onClick={() => setZonaSeleccionada(z)}
                          disabled={zonaAgotada}
                        >
                          {z.nombre} · {z.precio}
                          {zonaAgotada ? (
                            <span className="rm-zona-cupo"> · Agotado</span>
                          ) : typeof z.cupoDisponible === 'number' ? (
                            <span className="rm-zona-cupo"> · {z.cupoDisponible} disponible{z.cupoDisponible === 1 ? '' : 's'}</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <form className="rm-form" onSubmit={handleSubmit} noValidate>
                <div className="rm-field">
                  <label className="rm-label" htmlFor="rm-nombre">Nombre completo</label>
                  <input
                    id="rm-nombre"
                    className={`rm-input${touched.nombre && errors.nombre ? ' rm-input--error' : ''}`}
                    type="text"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={e => set('nombre', e.target.value)}
                    onBlur={() => handleBlur('nombre')}
                    autoComplete="name"
                    aria-invalid={touched.nombre && !!errors.nombre}
                    aria-describedby={touched.nombre && errors.nombre ? 'rm-nombre-error' : undefined}
                  />
                  {touched.nombre && errors.nombre && (
                    <span className="rm-field-error" id="rm-nombre-error">{errors.nombre}</span>
                  )}
                </div>

                <div className="rm-field">
                  <label className="rm-label" htmlFor="rm-celular">Número de celular</label>
                  <input
                    id="rm-celular"
                    className={`rm-input${touched.celular && errors.celular ? ' rm-input--error' : ''}`}
                    type="tel"
                    placeholder="+57 300 000 0000"
                    value={form.celular}
                    onChange={e => set('celular', e.target.value)}
                    onBlur={() => handleBlur('celular')}
                    autoComplete="tel"
                    aria-invalid={touched.celular && !!errors.celular}
                    aria-describedby={touched.celular && errors.celular ? 'rm-celular-error' : undefined}
                  />
                  {touched.celular && errors.celular && (
                    <span className="rm-field-error" id="rm-celular-error">{errors.celular}</span>
                  )}
                </div>

                <div className="rm-field">
                  <label className="rm-label" htmlFor="rm-email">Correo electrónico</label>
                  <input
                    id="rm-email"
                    className={`rm-input${touched.email && errors.email ? ' rm-input--error' : ''}`}
                    type="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    autoComplete="email"
                    aria-invalid={touched.email && !!errors.email}
                    aria-describedby={touched.email && errors.email ? 'rm-email-error' : 'rm-email-hint'}
                  />
                  {touched.email && errors.email ? (
                    <span className="rm-field-error" id="rm-email-error">{errors.email}</span>
                  ) : (
                    <span className="rm-field-hint" id="rm-email-hint">
                      {esConvocatoria ? 'Aquí te avisaremos si tu postulación fue aceptada' : 'Aquí recibirás tu entrada digital'}
                    </span>
                  )}
                </div>

                {esConvocatoria ? (
                  <>
                    <div className="rm-field">
                      <label className="rm-label" htmlFor="rm-categoria">Categoría / disciplina</label>
                      <input
                        id="rm-categoria"
                        className="rm-input"
                        type="text"
                        placeholder="Ej. Danza folclórica, Canto, Instrumental"
                        value={form.categoria}
                        onChange={e => set('categoria', e.target.value)}
                      />
                    </div>
                    <div className="rm-field">
                      <label className="rm-label" htmlFor="rm-portafolio">Portafolio / video (opcional)</label>
                      <input
                        id="rm-portafolio"
                        className="rm-input"
                        type="url"
                        placeholder="Link a YouTube, Instagram, Drive…"
                        value={form.portafolio}
                        onChange={e => set('portafolio', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="rm-field">
                    <label className="rm-label">Cantidad de entradas</label>
                    <div className="rm-stepper">
                      <button
                        type="button"
                        className="rm-stepper-btn"
                        onClick={() => set('cantidad', Math.max(1, form.cantidad - 1))}
                        disabled={form.cantidad <= 1}
                        aria-label="Reducir cantidad"
                      >−</button>
                      <span className="rm-stepper-val">{form.cantidad}</span>
                      <button
                        type="button"
                        className="rm-stepper-btn"
                        onClick={() => set('cantidad', Math.min(maxEntradas, form.cantidad + 1))}
                        disabled={form.cantidad >= maxEntradas}
                        aria-label="Aumentar cantidad"
                      >+</button>
                      {maxEntradas <= 5 && (
                        <span className="rm-stepper-max">máx. {maxEntradas}</span>
                      )}
                    </div>
                    {totalStr && (
                      <div className="rm-total">
                        <span className="rm-total-label">Total estimado</span>
                        <span className="rm-total-valor">{totalStr}</span>
                      </div>
                    )}
                  </div>
                )}

                <label className="rm-checkbox">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                  />
                  <span>
                    He leído y acepto las{' '}
                    <Link to={rutaPolitica} target="_blank" rel="noopener noreferrer">{nombrePolitica}</Link>.
                  </span>
                </label>

                {errorEnvio && (
                  <p className="rm-field-error" role="alert">{errorEnvio}</p>
                )}

                <button
                  type="submit"
                  className="rm-btn-submit"
                  disabled={loading || !canSubmit}
                >
                  {loading
                    ? <span className="rm-spinner" />
                    : esConvocatoria
                      ? 'Enviar postulación'
                      : esPago
                        ? 'Continuar al pago →'
                        : 'Emitir entrada'}
                </button>
              </form>

              <p className="rm-legal">Tus datos están protegidos y no serán compartidos con terceros.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AgotadoView({ onClose }) {
  return (
    <div className="rm-success">
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="Colombia Canta y Encanta"
        className="rm-success-logo"
      />
      <div className="rm-success-ico rm-success-ico--agotado">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      <h3>Ya no quedan cupos</h3>
      <p className="rm-success-sub">
        Justo se agotaron los lugares disponibles para esta selección. Escríbenos por WhatsApp o revisa otras fechas disponibles.
      </p>
      <button className="rm-btn-submit" onClick={onClose}>Cerrar</button>
    </div>
  );
}

function SuccessView({ email, esConvocatoria, onClose }) {
  return (
    <div className="rm-success">
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="Colombia Canta y Encanta"
        className="rm-success-logo"
      />
      <div className="rm-success-ico">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3>{esConvocatoria ? '¡Postulación recibida!' : '¡Reserva recibida!'}</h3>
      <p className="rm-success-lead">Te enviaremos la confirmación a</p>
      <strong className="rm-success-email">{email}</strong>
      <div className="rm-success-divider" />
      <p className="rm-success-sub">
        {esConvocatoria
          ? 'Revisaremos tu postulación y te contactaremos pronto. Revisa también tu carpeta de spam.'
          : 'Recibirás tu entrada digital en breve. Revisa también tu carpeta de spam.'}
      </p>
      <button className="rm-btn-submit" onClick={onClose}>Listo</button>
    </div>
  );
}
