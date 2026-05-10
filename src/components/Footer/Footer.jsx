import { Link } from 'react-router-dom';
import './Footer.css';

const cols = [
  {
    titulo: 'Inicio',
    links: [
      { label: 'Página principal', to: '/' },
      { label: 'Próximos eventos', to: '/eventos' },
      { label: 'Escuela de música', to: '/inscripciones' },
    ]
  },
  {
    titulo: 'Nosotros',
    links: [
      { label: 'Quiénes somos', to: '/nosotros#quienes-somos' },
      { label: 'Elenco artístico', to: '/nosotros#elenco' },
      { label: 'Inspiración', to: '/nosotros#inspiracion' },
      { label: 'Noticias', to: '/nosotros#noticias' },
    ]
  },
  {
    titulo: 'Eventos',
    links: [
      { label: 'Todos los eventos', to: '/eventos' },
      { label: 'Gira USA 2026', to: '/eventos/2' },
      { label: 'Sede Medellín', to: '/eventos/3' },
      { label: 'Festival Nacional', to: '/eventos/4' },
    ]
  },
  {
    titulo: 'Tienda',
    links: [
      { label: 'Poleras', to: '/tienda' },
      { label: 'Hoodies', to: '/tienda' },
      { label: 'Bags', to: '/tienda' },
      { label: 'Otros', to: '/tienda' },
    ]
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Marca */}
          <div className="footer-marca">
            <div className="footer-logo">
              <div className="footer-logo-circulo">🎵</div>
              <span className="footer-logo-nombre">Colombia Canta y Encanta</span>
            </div>
            <p className="footer-desc">
              Centro cultural y escuela de música tradicional colombiana con sede en Medellín. Formando artistas desde hace más de 10 años.
            </p>
            <div className="footer-redes">
              <span className="footer-red-pill">📸 Instagram</span>
              <span className="footer-red-pill">💬 WhatsApp</span>
              <span className="footer-red-pill">▶️ YouTube</span>
            </div>
          </div>

          {/* Columnas de links */}
          {cols.map(col => (
            <div className="footer-col" key={col.titulo}>
              <div className="footer-col-titulo">{col.titulo}</div>
              <ul>
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contacto */}
          <div className="footer-col">
            <div className="footer-col-titulo">Contacto</div>
            <div className="footer-contacto-item">
              <span>📍</span>
              <span>Calle 49 76a 65, Sector Estadio, Medellín</span>
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
    </footer>
  );
}
