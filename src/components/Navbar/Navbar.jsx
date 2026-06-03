import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useCarrito } from '../../context/CarritoContext';
import { eventos } from '../../data/eventos';
import './Navbar.css';

const eventosDropdown = eventos.slice(0, 4);

const tiendaDropdown = [
  { nombre: "Poleras", precio: "desde $45.000", emoji: "👕", bg: "linear-gradient(135deg, #1A56DB, #0F3A9E)" },
  { nombre: "Hoodies", precio: "desde $75.000", emoji: "🧥", bg: "linear-gradient(135deg, #E8341A, #6B21A8)" },
  { nombre: "Bags", precio: "desde $28.000", emoji: "👜", bg: "linear-gradient(135deg, #F5C800, #E8341A)" },
  { nombre: "Otros", precio: "termos · café", emoji: "☕", bg: "linear-gradient(135deg, #16A34A, #1A56DB)" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { totalItems } = useCarrito();

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [location]);

  let navClass = 'navbar';
  if (isHome) {
    if (scrolled) {
      navClass += ' navbar--white navbar--flotante';
    } else {
      navClass += ' navbar--transparent';
    }
  } else {
    navClass += ' navbar--sticky navbar--flotante';
  }

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleMobile = (section) => {
    setMobileExpanded(prev => prev === section ? null : section);
  };

  return (
    <>
      <nav className={navClass}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Colombia Canta y Encanta" className="logo-img" />
          </Link>

          {/* Desktop links */}
          <div className="navbar-links">
            {/* Nosotros */}
            <div className="nav-group">
              <Link to="/nosotros" className={`nav-link${isActive('/nosotros') ? ' active' : ''}`}>
                Nosotros <span className="nav-chevron">▾</span>
              </Link>
              <div className="dropdown dropdown-simple">
                <Link to="/nosotros#quienes-somos">Quiénes somos</Link>
                <Link to="/elenco">Elenco artístico</Link>
                <Link to="/noticias">Noticias</Link>
                <Link to="/contacto">Contacto</Link>
              </div>
            </div>

            {/* Eventos */}
            <div className="nav-group">
              <Link to="/eventos" className={`nav-link${isActive('/eventos') ? ' active' : ''}`}>
                Eventos <span className="nav-chevron">▾</span>
              </Link>
              <div className="dropdown dropdown-eventos">
                <div className="dropdown-header">
                  <h4>Próximos eventos</h4>
                  <Link to="/eventos" className="dropdown-ver-todos">Ver todos →</Link>
                </div>
                <div className="dropdown-eventos-grid">
                  {eventosDropdown.map(ev => (
                    <Link to={`/eventos/${ev.id}`} className="evento-mini-card" key={ev.id}>
                      <div
                        className="evento-mini-bg"
                        style={ev.img ? {
                          backgroundImage: `linear-gradient(135deg, ${ev.colorHero}cc, rgba(0,0,0,0.55)), url(${ev.img})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        } : {
                          background: `linear-gradient(135deg, ${ev.colorHero}, rgba(0,0,0,0.6))`,
                        }}
                      >
                        <span className="chip-fecha">{ev.fecha}</span>
                        <span className="chip-tipo">{ev.tipo}</span>
                      </div>
                      <div className="evento-mini-info">
                        <div className="evento-mini-titulo">{ev.titulo}</div>
                        <div className="evento-mini-ciudad">{ev.ciudad}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Tienda */}
            <div className="nav-group">
              <Link to="/tienda" className={`nav-link${isActive('/tienda') ? ' active' : ''}`}>
                Tienda <span className="nav-chevron">▾</span>
              </Link>
              <div className="dropdown dropdown-tienda">
                <div className="dropdown-header">
                  <h4>Merch oficial</h4>
                  <Link to="/tienda" className="dropdown-ver-todos">Ver todo →</Link>
                </div>
                <div className="dropdown-tienda-grid">
                  {tiendaDropdown.map(item => (
                    <Link to="/tienda" className="tienda-mini-card" key={item.nombre}>
                      <div className="tienda-mini-bg" style={{ background: item.bg }}>
                        <span>{item.emoji}</span>
                      </div>
                      <div className="tienda-mini-info">
                        <span className="tienda-mini-nombre">{item.nombre}</span>
                        <span className="tienda-mini-precio">{item.precio}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Inscripciones */}
            <div className="nav-group">
              <Link to="/inscripciones" className={`nav-link${isActive('/inscripciones') ? ' active' : ''}`}>
                Inscripciones <span className="nav-chevron">▾</span>
              </Link>
              <div className="dropdown dropdown-simple">
                <Link to="/inscripciones#cursos">Nuestros cursos</Link>
                <Link to="/inscripciones#como-inscribirse">Cómo inscribirse</Link>
                <Link to="/inscripciones#faq">Preguntas frecuentes</Link>
              </div>
            </div>

            <Link to="/contacto" className="btn-contacto">Contacto</Link>
          </div>

          {/* Utilidades: siempre visibles en desktop y mobile */}
          <div className="navbar-utils">
            <button className="btn-tema" onClick={toggle} aria-label="Cambiar tema">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="btn-carrito" onClick={() => navigate('/tienda/carrito')}>
              <img
                src={`${import.meta.env.BASE_URL}${theme === 'dark' ? 'carrito-de-compras.png' : 'carrito-de-compras (1).png'}`}
                alt="Carrito"
                className="carrito-icono-img"
              />
              {totalItems > 0 && <span className="carrito-badge">{totalItems}</span>}
            </button>
          </div>

          {/* Hamburger */}
          <button className="navbar-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menú">
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            {totalItems > 0 && <span className="hamburger-badge">{totalItems}</span>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <Link to="/">Inicio</Link>

        <button className="mobile-link" onClick={() => toggleMobile('nosotros')}>
          Nosotros {mobileExpanded === 'nosotros' ? '▴' : '▾'}
        </button>
        {mobileExpanded === 'nosotros' && (
          <div className="mobile-submenu">
            <Link to="/nosotros#quienes-somos">Quiénes somos</Link>
            <Link to="/elenco">Elenco artístico</Link>
            <Link to="/nosotros#noticias">Noticias</Link>
          </div>
        )}

        <button className="mobile-link" onClick={() => toggleMobile('eventos')}>
          Eventos {mobileExpanded === 'eventos' ? '▴' : '▾'}
        </button>
        {mobileExpanded === 'eventos' && (
          <div className="mobile-submenu">
            {eventosDropdown.map(ev => (
              <Link to={`/eventos/${ev.id}`} key={ev.id}>{ev.titulo}</Link>
            ))}
            <Link to="/eventos">Ver todos →</Link>
          </div>
        )}

        <Link to="/tienda">Tienda</Link>
        <button className="mobile-link mobile-carrito" onClick={() => navigate('/tienda/carrito')}>
          <img
            src={`${import.meta.env.BASE_URL}${theme === 'dark' ? 'carrito-de-compras.png' : 'carrito-de-compras (1).png'}`}
            alt=""
            className="carrito-icono-img"
          />
          Carrito
          {totalItems > 0 && <span className="mobile-carrito-badge">{totalItems}</span>}
        </button>
        <Link to="/inscripciones">Inscripciones</Link>
        <Link to="/contacto">Contacto</Link>
      </div>
    </>
  );
}
