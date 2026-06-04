import { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const navLinks = [
  { label: "Inicio",    to: "/" },
  { label: "Nosotros",  to: "/nosotros" },
  { label: "Eventos",   to: "/eventos" },
  { label: "Escuela",   to: "/inscripciones" },
  { label: "Tienda",    to: "/tienda" },
  { label: "Noticias",  to: "/nosotros#noticias" },
];

const cols = [
  {
    titulo: "Inicio",
    links: [
      { label: "Página principal", to: "/" },
      { label: "Próximos eventos", to: "/eventos" },
      { label: "Escuela de música", to: "/inscripciones" },
    ],
  },
  {
    titulo: "Nosotros",
    links: [
      { label: "Quiénes somos", to: "/nosotros#quienes-somos" },
      { label: "Elenco artístico", to: "/nosotros#elenco" },
      { label: "Inspiración", to: "/nosotros#inspiracion" },
      { label: "Noticias", to: "/nosotros#noticias" },
    ],
  },
  {
    titulo: "Eventos",
    links: [
      { label: "Todos los eventos", to: "/eventos" },
      { label: "Gira USA 2026", to: "/eventos/2" },
      { label: "Sede Medellín", to: "/eventos/3" },
      { label: "Festival Nacional", to: "/eventos/4" },
    ],
  },
  {
    titulo: "Tienda",
    links: [
      { label: "Poleras", to: "/tienda" },
      { label: "Hoodies", to: "/tienda" },
      { label: "Bags", to: "/tienda" },
      { label: "Otros", to: "/tienda" },
    ],
  },
];

const redes = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/colombia_canta",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://web.facebook.com/colombiacanta",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/colcanta",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@colombiacantayencanta",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/colombiacanta",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/573015315119",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "TripAdvisor",
    href: "https://www.tripadvisor.es/Attraction_Review-g297478-d23933011-Reviews-Colombia_Canta_Y_Encanta-Medellin_Antioquia_Department.html",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2a10 10 0 100 20A10 10 0 0012 2zM8 10.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm8 0a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM8 12.75a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm8 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
      </svg>
    ),
  },
];

const aliados = [
  { nombre: 'Co·Crea',               img: 'aliados/aliado-cocrea.webp' },
  { nombre: 'Alcaldía de Medellín',  img: 'aliados/aliado-alcaldia.webp', adaptive: true },
  { nombre: 'Comfama',               img: 'aliados/aliado-comfama.webp' },
  { nombre: 'Ministerio de Cultura', img: 'aliados/aliado-mincultural.webp' },
];

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (titulo) =>
    setOpenSection((prev) => (prev === titulo ? null : titulo));

  return (
    <footer className="footer">

      {/* ── Aliados ── */}
      <div className="footer-aliados">
        <div className="footer-bandera">
          <div className="footer-bandera-amarillo" />
          <div className="footer-bandera-azul" />
          <div className="footer-bandera-rojo" />
        </div>
        <div className="container">
          <p className="aliados-label">Aliados</p>
          <div className="aliados-logos-grid">
            {aliados.map(a => (
              <div key={a.nombre} className="aliado-logo-item">
                <img
                  src={`${import.meta.env.BASE_URL}${a.img}`}
                  alt={a.nombre}
                  className={`aliado-logo-img${a.bright ? ' aliado-logo-bright' : ''}${a.adaptive ? ' aliado-logo-adaptive' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenido principal ── */}
      <div className="footer-contenido">
        <div className="container">

          {/* Banda de marca — full-width centrada */}
          <div className="footer-brand-top">
            <p className="footer-tagline">"Música que une, cultura que trasciende."</p>
            <img
              src={`${import.meta.env.BASE_URL}Fondo_Footer.png`}
              alt="Colombia Canta y Encanta"
              className="footer-logo-img"
            />
            <p className="footer-desc">
              Centro cultural y escuela de música tradicional colombiana con sede en Medellín.
              Formando artistas desde hace más de 20 años.
            </p>
            <div className="footer-redes">
              {redes.map((red) => (
                <a
                  key={red.label}
                  href={red.href}
                  className="footer-red-icono"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={red.label}
                >
                  {red.svg}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-divider" />

          {/* Barra de nav — desktop */}
          <div className="footer-nav-bar">
            <nav className="footer-nav-links">
              {navLinks.map(({ label, to }) => (
                <Link key={label} to={to} className="footer-nav-link">
                  {label}
                </Link>
              ))}
            </nav>
            <span className="footer-nav-bar-sep" aria-hidden="true" />
            <div className="footer-contact-inline">
              <span className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                Sector Estadio, Medellín
              </span>
              <a href="https://wa.me/573015315119" className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                3015315119
              </a>
              <a href="mailto:hola@colombiacanta.org" className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                hola@colombiacanta.org
              </a>
            </div>
          </div>

          {/* Acordeón — mobile */}
          <div className="footer-accordion-a">
            {cols.map((col) => (
              <div className="footer-col-acc" key={col.titulo}>
                <div
                  className="footer-col-acc-titulo"
                  onClick={() => toggleSection(col.titulo)}
                >
                  <span>{col.titulo}</span>
                  <span className="footer-toggle-icon">
                    {openSection === col.titulo ? "−" : "+"}
                  </span>
                </div>
                <ul className={openSection === col.titulo ? "footer-open" : ""}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="footer-col-acc">
              <div
                className="footer-col-acc-titulo"
                onClick={() => toggleSection("contacto")}
              >
                <span>Contacto</span>
                <span className="footer-toggle-icon">
                  {openSection === "contacto" ? "−" : "+"}
                </span>
              </div>
              <div className={`footer-contacto-acc${openSection === "contacto" ? " footer-open" : ""}`}>
                <div className="footer-contacto-item">
                  <span>📍</span>
                  <span>Calle 49 76a-65, Sector Estadio, Medellín</span>
                </div>
                <div className="footer-contacto-item">
                  <span>📱</span>
                  <a href="https://wa.me/573015315119">3015315119</a>
                </div>
                <div className="footer-contacto-item">
                  <span>✉️</span>
                  <a href="mailto:hola@colombiacanta.org">hola@colombiacanta.org</a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <span className="footer-copyright">
              © {new Date().getFullYear()} Colombia Canta y Encanta · Medellín, Colombia
            </span>
            <div className="footer-legal">
              <Link to="#">Términos</Link>
              <Link to="#">Privacidad</Link>
              <Link to="#">Devoluciones</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
