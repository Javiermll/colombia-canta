import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventosFijos } from '../../data/eventosFijos';
import EventCard from '../CarruselEventos/EventCard';
import ContactoSection from '../Contacto/Contacto';
import Footer from '../Footer/Footer';
import './EventoFijoDetalle.css';
import '../CarruselEventos/CarruselEventos.css';

export default function EventoFijoDetalle({ evento }) {
  const isSalas = evento.slug === 'salas-colombia-canta';
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const otroPrograma = eventosFijos
    .filter(e => e.slug !== evento.slug)
    .map(e => ({
      ...e,
      descripcion: e.descripcionCorta,
      precio: e.pills.find(p => p.texto.toLowerCase().includes('libre'))?.texto ?? 'Consultar',
    }));

  return (
    <>
      {/* ── Hero ── */}
      <div
        className="efd-hero"
        style={evento.img
          ? { backgroundImage: `url(${evento.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: `linear-gradient(135deg, ${evento.color} 0%, ${evento.colorHero} 100%)` }
        }
      >
        <div className="efd-hero-overlay" />
        <div className="efd-hero-content">
          <Link to="/eventos" className="efd-volver">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver a eventos
          </Link>
          <span className="chip-tipo-hero">{evento.tipo}</span>
          <h1>{evento.titulo}</h1>
          <p className="efd-hero-sub">{evento.subtitulo}</p>
          <div className="efd-hero-pills">
            {evento.pills.map(p => (
              <span key={p.texto} className="efd-hero-pill">
                {p.icono} {p.texto}
              </span>
            ))}
          </div>
        </div>
        <div className="franja-bandera" />
      </div>

      {/* ── Sticky bar ── */}
      <div className={`efd-sticky-bar${stickyVisible ? ' visible' : ''}`}>
        <span className="efd-sticky-titulo">{evento.titulo}</span>
        <span className="efd-sticky-meta">{evento.ciudad}</span>
        <a
          href={evento.waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="efd-sticky-btn"
          style={{ background: evento.color }}
        >
          {evento.cta}
        </a>
      </div>

      {/* ── Cuerpo ── */}
      <div className="efd-cuerpo container">

        {/* Columna principal */}
        <div className="efd-col-izq">

          <section className="efd-seccion">
            <h2>Sobre el evento</h2>
            {evento.descripcionLarga.split('\n\n').map((p, i) => (
              <p key={i} className="efd-parrafo">{p}</p>
            ))}
          </section>

          {/* Programación — solo Salas Colombia Canta */}
          {isSalas && evento.programacion && (
            <section className="efd-seccion">
              <h2>Programación · {evento.mes}</h2>
              <div className="efd-prog-grid">
                {evento.programacion.map((ev, i) => (
                  <div key={i} className="efd-prog-card">
                    <div className="efd-prog-fecha">
                      <b>{ev.dia}</b>
                      <span>{ev.hora}</span>
                    </div>
                    <p className="efd-prog-nombre">{ev.nombre}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fases — solo Colombia me Enamoras */}
          {!isSalas && evento.fases && (
            <section className="efd-seccion">
              <h2>¿Cómo es la experiencia?</h2>
              <div className="efd-fases">
                {evento.fases.map((f, i) => (
                  <div key={i} className="efd-fase">
                    <div className="efd-fase-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="efd-fase-ico">{f.icono}</div>
                    <div>
                      <h3 className="efd-fase-titulo">{f.titulo}</h3>
                      <p className="efd-fase-desc">{f.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="efd-visitantes">
                Haz parte del 100% de invitados que llegan de Colombia o del mundo y quedan enamorados con nuestra experiencia cultural.
              </p>
            </section>
          )}

          <section className="efd-seccion">
            <h2>El lugar</h2>
            <div className="efd-lugar">
              <span>📍 {evento.lugar}</span>
              <span>{evento.ciudad}</span>
            </div>
          </section>

          {/* Stats */}
          <section className="efd-seccion">
            <h2>Nuestro impacto</h2>
            <div className="efd-stats">
              <div className="efd-stat">
                <span className="efd-stat-num">+10</span>
                <div className="efd-stat-label">años de historia</div>
              </div>
              <div className="efd-stat">
                <span className="efd-stat-num">+200</span>
                <div className="efd-stat-label">estudiantes formados</div>
              </div>
              <div className="efd-stat">
                <span className="efd-stat-num">5</span>
                <div className="efd-stat-label">países visitados</div>
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar — CTA card */}
        <div className="efd-sidebar">
          <div className="compra-card">
            <div className="compra-card-header">
              <div className="compra-card-chip">
                <span className="chip-tipo-hero">{evento.tipo}</span>
              </div>
              <div className="compra-card-titulo">{evento.titulo}</div>
              {evento.pills.map(p => (
                <div key={p.texto} className="compra-card-meta">
                  <span>{p.icono}</span>
                  <span>{p.texto}</span>
                </div>
              ))}
              <div className="compra-card-meta">
                <span>📍</span>
                <span>{evento.lugar}</span>
              </div>
            </div>
            <div className="compra-card-body">
              <div className="compra-precio">
                {evento.pills.find(p => p.texto.toLowerCase().includes('libre'))
                  ? 'Entrada libre'
                  : 'Reserva tu lugar'}
              </div>
              <a
                href={evento.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="compra-btn"
                style={{ background: evento.color, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              >
                {evento.cta}
              </a>
              <div className="compra-garantias">
                <div className="compra-garantia">
                  <span className="compra-garantia-check">✓</span>
                  <span>Ambiente acogedor</span>
                </div>
                <div className="compra-garantia">
                  <span className="compra-garantia-check">✓</span>
                  <span>Artistas en vivo</span>
                </div>
                <div className="compra-garantia">
                  <span className="compra-garantia-check">✓</span>
                  <span>Tradición colombiana</span>
                </div>
              </div>
            </div>
            <div className="compra-card-footer">
              <p>¿Tienes preguntas?</p>
              <div className="compra-contacto-btns">
                <a href={evento.waLink} target="_blank" rel="noopener noreferrer" className="compra-contacto-btn">
                  💬 WhatsApp
                </a>
                <a href="mailto:hola@colombiacanta.org" className="compra-contacto-btn">
                  ✉️ Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cierre CTA ── */}
      <section className="efd-cierre">
        <div className="franja-bandera efd-cierre-franja" />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <h2 className="efd-cierre-titulo">{evento.cta}</h2>
          <p className="efd-cierre-desc">{evento.descripcionCorta}</p>
          <a
            href={evento.waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="efd-cierre-btn"
            style={{ background: evento.color }}
          >
            {evento.cta} →
          </a>
        </div>
      </section>

      {/* ── Otros programas ── */}
      {otroPrograma.length > 0 && (
        <section className="efd-otros">
          <div className="container">
            <div className="efd-otros-header">
              <span className="label-seccion label-muted">Otros programas</span>
              <Link to="/eventos" className="btn btn-outline-oscuro" style={{ fontSize: '13px', padding: '8px 18px' }}>
                Ver todos →
              </Link>
            </div>
            <div className="efd-otros-grid">
              {otroPrograma.map(ev => (
                <EventCard key={ev.id} evento={ev} permanente />
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactoSection />
      <Footer />
    </>
  );
}
