import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { EMAIL_REGEX } from '../../utils/validacion';
import { formatCOP as formatPrecio } from '../../utils/formato';
import './CompradorModal.css';

function validateField(field, value) {
  if (field === 'nombre') return value.trim().length < 2 ? 'Ingresa tu nombre completo' : '';
  if (field === 'celular') return value.replace(/\D/g, '').length < 7 ? 'Ingresa un número válido' : '';
  if (field === 'email') return EMAIL_REGEX.test(value.trim()) ? '' : 'Ingresa un correo electrónico válido';
  if (field === 'direccion') return value.trim().length < 5 ? 'Ingresa tu dirección de envío' : '';
  if (field === 'ciudad') return value.trim().length < 2 ? 'Ingresa tu ciudad' : '';
  return '';
}

const CAMPOS_REQUERIDOS = ['nombre', 'celular', 'email', 'direccion', 'ciudad'];

// Mismo formato visual que ReservaModal (badge, labels en mayúscula, inputs
// con línea inferior, botón píldora) — ajustado a los campos que requiere
// una compra de productos (dirección de envío, ciudad) en vez de una
// reserva de evento. A diferencia de ReservaModal, no tiene vista de éxito
// propia: al confirmar, Carrito.jsx cierra el modal y muestra su propia
// página de "Pedido recibido".
export default function CompradorModal({ items, subtotal, cupon, onClose, onExito }) {
  const [form, setForm] = useState({
    nombre: '', celular: '', email: '', direccion: '', ciudad: '', direccionAdicional: '',
  });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaEnvios, setAceptaEnvios] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ⭐ Hallazgo real (auditoría de accesibilidad, Fase 6, 2026-09-09): mismo
  // fix ya aplicado en ReservaModal.jsx (auditoría de cierre de Fase 5,
  // 2026-09-08) — sin esto, un usuario de teclado que abre este modal queda
  // con el foco en el botón de fondo, sin ninguna pista de que se abrió un
  // diálogo nuevo.
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose(); };

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (touched[field]) setErrors((e) => ({ ...e, [field]: validateField(field, val) }));
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateField(field, form[field]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(CAMPOS_REQUERIDOS.map((f) => [f, true]));
    const allErrors = Object.fromEntries(CAMPOS_REQUERIDOS.map((f) => [f, validateField(f, form[f])]));
    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;

    // ⭐ Hallazgo real (auditoría de accesibilidad, Fase 6, 2026-09-09) — mismo
    // fix que ReservaModal.jsx: el botón ya no se deshabilita por los 2
    // checkboxes, así siempre es alcanzable con teclado y, si falta aceptar
    // alguno, se explica con un mensaje real en vez de quedar inerte.
    if (!aceptaTerminos || !aceptaEnvios) {
      setErrorEnvio('Debes aceptar los Términos y Condiciones y la Política de Envíos para continuar.');
      return;
    }

    setErrorEnvio(null);
    setLoading(true);

    try {
      const { data } = await apiFetch('/api/pedidos', {
        method: 'POST',
        body: {
          nombre: form.nombre.trim(),
          celular: form.celular.trim(),
          email: form.email.trim(),
          direccion: form.direccion.trim(),
          ciudad: form.ciudad.trim(),
          direccion_adicional: form.direccionAdicional.trim() || null,
          items: items.map((item) => ({ variante_id: item.id, cantidad: item.cantidad })),
          // ⭐ Cupones (2026-09-10) — solo se manda el CÓDIGO; el % y el total
          // descontado se recalculan siempre server-side (ver pedidos.js),
          // nunca se confía en lo que ya mostraba el carrito.
          ...(cupon ? { cupon_codigo: cupon.codigo } : {}),
          acepta_terminos: true,
        },
      });
      // ⭐ Mercado Pago (Fase 6, Sección 2, 2026-09-10) — el pedido ya quedó
      // creado (mismo criterio de siempre, stock ya descontado); reemplaza
      // por completo la coordinación manual de antes: se vacía el carrito y
      // se sale del sitio hacia Checkout Pro en vez de mostrar una pantalla
      // de "te contactaremos". La confirmación real (con el correo de pago)
      // llega por el webhook una vez Mercado Pago aprueba el pago.
      onExito();
      window.location.href = data.initPoint;
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !Object.values(errors).some(Boolean)
    && CAMPOS_REQUERIDOS.every((f) => form[f].trim());

  return (
    <div className="cm-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="cm-modal" role="dialog" aria-modal="true" aria-label="Datos de envío">
        <button className="cm-close" ref={closeBtnRef} onClick={onClose} aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="cm-panel">
          <span className="cm-badge">{items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
          <h2 className="cm-titulo">Datos de envío</h2>
          <p className="cm-subtitulo">Completa tus datos para coordinar el pago y el envío de tu pedido.</p>

          <form className="cm-form" onSubmit={handleSubmit} noValidate>
            <div className="cm-field">
              <label className="cm-label" htmlFor="cm-nombre">Nombre completo</label>
              <input
                id="cm-nombre"
                className={`cm-input${touched.nombre && errors.nombre ? ' cm-input--error' : ''}`}
                type="text" placeholder="Tu nombre" value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)} onBlur={() => handleBlur('nombre')}
                autoComplete="name"
                aria-invalid={touched.nombre && !!errors.nombre}
                aria-describedby={touched.nombre && errors.nombre ? 'cm-nombre-error' : undefined}
              />
              {touched.nombre && errors.nombre && <span className="cm-field-error" id="cm-nombre-error">{errors.nombre}</span>}
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="cm-celular">Número de celular</label>
              <input
                id="cm-celular"
                className={`cm-input${touched.celular && errors.celular ? ' cm-input--error' : ''}`}
                type="tel" placeholder="+57 300 000 0000" value={form.celular}
                onChange={(e) => set('celular', e.target.value)} onBlur={() => handleBlur('celular')}
                autoComplete="tel"
                aria-invalid={touched.celular && !!errors.celular}
                aria-describedby={touched.celular && errors.celular ? 'cm-celular-error' : undefined}
              />
              {touched.celular && errors.celular && <span className="cm-field-error" id="cm-celular-error">{errors.celular}</span>}
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="cm-email">Correo electrónico</label>
              <input
                id="cm-email"
                className={`cm-input${touched.email && errors.email ? ' cm-input--error' : ''}`}
                type="email" placeholder="tu@correo.com" value={form.email}
                onChange={(e) => set('email', e.target.value)} onBlur={() => handleBlur('email')}
                autoComplete="email"
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={touched.email && errors.email ? 'cm-email-error' : 'cm-email-hint'}
              />
              {touched.email && errors.email ? (
                <span className="cm-field-error" id="cm-email-error">{errors.email}</span>
              ) : (
                <span className="cm-field-hint" id="cm-email-hint">Aquí recibirás la confirmación de tu pedido</span>
              )}
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="cm-direccion">Dirección de envío</label>
              <input
                id="cm-direccion"
                className={`cm-input${touched.direccion && errors.direccion ? ' cm-input--error' : ''}`}
                type="text" placeholder="Calle, número" value={form.direccion}
                onChange={(e) => set('direccion', e.target.value)} onBlur={() => handleBlur('direccion')}
                autoComplete="street-address"
                aria-invalid={touched.direccion && !!errors.direccion}
                aria-describedby={touched.direccion && errors.direccion ? 'cm-direccion-error' : undefined}
              />
              {touched.direccion && errors.direccion && <span className="cm-field-error" id="cm-direccion-error">{errors.direccion}</span>}
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="cm-ciudad">Ciudad</label>
              <input
                id="cm-ciudad"
                className={`cm-input${touched.ciudad && errors.ciudad ? ' cm-input--error' : ''}`}
                type="text" placeholder="Medellín" value={form.ciudad}
                onChange={(e) => set('ciudad', e.target.value)} onBlur={() => handleBlur('ciudad')}
                autoComplete="address-level2"
                aria-invalid={touched.ciudad && !!errors.ciudad}
                aria-describedby={touched.ciudad && errors.ciudad ? 'cm-ciudad-error' : undefined}
              />
              {touched.ciudad && errors.ciudad && <span className="cm-field-error" id="cm-ciudad-error">{errors.ciudad}</span>}
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="cm-direccion-adicional">Apto / referencia <span className="cm-opcional">(opcional)</span></label>
              <input
                id="cm-direccion-adicional"
                className="cm-input" type="text" placeholder="Apto 301, torre 2" value={form.direccionAdicional}
                onChange={(e) => set('direccionAdicional', e.target.value)} autoComplete="address-line2"
              />
            </div>

            {cupon && (
              <div className="cm-total cm-total--descuento">
                <span className="cm-total-label">Cupón {cupon.codigo} (-{cupon.porcentaje}%)</span>
                <span className="cm-total-valor">-{formatPrecio(cupon.descuento)}</span>
              </div>
            )}
            <div className="cm-total">
              <span className="cm-total-label">Total del pedido</span>
              <span className="cm-total-valor">{formatPrecio(cupon ? cupon.total : subtotal)}</span>
            </div>

            <label className="cm-checkbox">
              <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
              <span>
                He leído y acepto los{' '}
                <Link to="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer">Términos y Condiciones</Link>.
              </span>
            </label>

            <label className="cm-checkbox">
              <input type="checkbox" checked={aceptaEnvios} onChange={(e) => setAceptaEnvios(e.target.checked)} />
              <span>
                He leído y acepto la{' '}
                <Link to="/politica-envios" target="_blank" rel="noopener noreferrer">Política de Envíos y Entrega</Link>.
              </span>
            </label>

            {errorEnvio && <p className="cm-field-error" role="alert">{errorEnvio}</p>}

            <button type="submit" className="cm-btn-submit" disabled={loading || !canSubmit}>
              {loading ? <span className="cm-spinner" /> : 'Confirmar pedido'}
            </button>
          </form>

          <p className="cm-legal">Tus datos están protegidos y no serán compartidos con terceros.</p>
        </div>
      </div>
    </div>
  );
}
