import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./CookieBanner.css";

const CLAVE_CONSENTIMIENTO = "cc_cookies_aceptadas";

// Aviso puramente informativo (decisión del usuario, 2026-09-07): el sitio no
// usa cookies de publicidad ni de analítica, solo las que ponen Spotify y
// Google Maps al cargar sus propios embeds — aceptar/rechazar acá no bloquea
// ni condiciona esos componentes, es solo transparencia + registro del
// consentimiento, no un gate técnico.
export default function CookieBanner() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const esRutaAdmin = location.pathname.startsWith("/admin");

  // ⭐ Hallazgo real (auditoría pre-push, 2026-09-07): con `[]` de dependencias
  // este efecto solo corría una vez, al montar la SPA. Si esa primera carga
  // ocurría en una ruta /admin/*, `esRutaAdmin` era true y el efecto salía
  // sin leer `localStorage` — si luego se navegaba a una página pública sin
  // recargar (routing del lado del cliente), el banner nunca se activaba
  // para el resto de la sesión. Depender de `esRutaAdmin` hace que se
  // re-evalúe cada vez que se cruza esa frontera.
  useEffect(() => {
    if (esRutaAdmin) return;
    let yaAceptado = false;
    try {
      yaAceptado = localStorage.getItem(CLAVE_CONSENTIMIENTO) === "1";
    } catch {
      yaAceptado = false;
    }
    if (!yaAceptado) setVisible(true);
  }, [esRutaAdmin]);

  if (esRutaAdmin || !visible) return null;

  function aceptar() {
    try {
      localStorage.setItem(CLAVE_CONSENTIMIENTO, "1");
    } catch {
      // localStorage puede fallar (modo privado, storage lleno) — no bloquea
      // la interacción, el banner igual se cierra para esta visita.
    }
    setVisible(false);
    setDetalleAbierto(false);
  }

  return (
    <div className="cookie-banner" role="region" aria-label="Aviso de cookies">
      <div className="cookie-banner-contenido">
        <p className="cookie-banner-texto">
          Usamos cookies en nuestra página web para ver cómo interactúas con
          ella. Al aceptarlas, estás de acuerdo con nuestro uso de dichas
          cookies.{" "}
          <Link to="/politica-privacidad" className="cookie-banner-link">
            Política de privacidad
          </Link>
        </p>
        <div className="cookie-banner-acciones">
          <button
            type="button"
            className="cookie-banner-btn-opciones"
            onClick={() => setDetalleAbierto(true)}
          >
            Opciones
          </button>
          <button type="button" className="cookie-banner-btn-aceptar" onClick={aceptar}>
            Aceptar
          </button>
        </div>
      </div>

      {detalleAbierto && (
        <div
          className="cookie-detalle-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetalleAbierto(false);
          }}
        >
          <div className="cookie-detalle-panel" role="dialog" aria-modal="true" aria-label="Detalle de cookies">
            <h3 className="cookie-detalle-titulo">Cookies que usamos</h3>
            <p className="cookie-detalle-desc">
              No usamos cookies de publicidad ni de analítica. Las únicas
              cookies de este sitio vienen de:
            </p>
            <ul className="cookie-detalle-lista">
              <li>
                <strong>Spotify</strong> — el reproductor musical del inicio
                guarda sus propias cookies para funcionar.
              </li>
              <li>
                <strong>Google Maps</strong> — el mapa de la página de
                Contacto guarda sus propias cookies para funcionar.
              </li>
              <li>
                <strong>Sesión del panel</strong> — solo se activa cuando un
                administrador inicia sesión, no afecta a los visitantes del
                sitio.
              </li>
              <li>
                <strong>Mercado Pago</strong> — cuando el pago en línea esté
                disponible, pondrá sus propias cookies durante el proceso de
                compra.
              </li>
            </ul>
            <button type="button" className="cookie-banner-btn-aceptar" onClick={aceptar}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
