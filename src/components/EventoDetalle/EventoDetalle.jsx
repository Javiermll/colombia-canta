import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventos } from '../../data/eventos';
import EventCard from '../CarruselEventos/EventCard';
import ContactoSection from '../Contacto/Contacto';
import Footer from '../Footer/Footer';
import './EventoDetalle.css';
import '../CarruselEventos/CarruselEventos.css';

export default function EventoDetalle({ evento }) {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const esEntradaLibre = evento.precio === 'Entrada libre';
  const esProximamente = evento.precio === 'Próximamente';
  const ctaColor = 'var(--coral)';

  const waLink = `https://wa.me/573015315119?text=Hola%2C+tengo+una+consulta+sobre+${encodeURIComponent(evento.titulo)}`;

  const otrosEventos = eventos.filter(e => e.id !== evento.id).slice(0, 3);

  return (
    <>
      {/* BLOQUE 1 — HERO */}
      <div
        className="evento-hero"
        style={evento.img ? {
          backgroundImage: `url(${evento.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {
          background: evento.colorHero,
        }}
      >
        <div className="evento-hero-overlay" style={evento.img ? {
          background: `linear-gradient(to bottom, ${evento.colorHero}55 0%, rgba(0,0,0,0.82) 100%)`,
        } : undefined} />
        <div className="evento-hero-content">
          <div className="evento-hero-chip">
            <span className="chip-tipo-hero">{evento.tipo}</span>
          </div>
          <h1>{evento.titulo}</h1>
          <div className="evento-hero-meta">
            <span>{evento.fechaCompleta}</span>
            <span>·</span>
            <span>{evento.hora}</span>
            <span>·</span>
            <span>{evento.ciudad}</span>
          </div>
          <div className="evento-hero-lugar">
            <span>📍</span>
            <span>{evento.lugar}</span>
          </div>
        </div>
        <div className="franja-bandera" />
      </div>

      {/* BLOQUE 2 — STICKY BAR */}
      <div className={`sticky-cta-bar${stickyVisible ? ' visible' : ''}`}>
        <span className="sticky-titulo">{evento.titulo}</span>
        <span className="sticky-meta">{evento.fecha} · {evento.lugar}</span>
        <span className="sticky-precio">{evento.precio}</span>
        <button className="sticky-btn" style={{ background: ctaColor }}>
          {evento.cta}
        </button>
      </div>

      {/* BLOQUE 3 — CUERPO */}
      <div className="evento-cuerpo">
        {/* Columna izquierda */}
        <div className="evento-col-izq">
          <section>
            <h2>Sobre el evento</h2>
            <p className="evento-descripcion">{evento.descripcionLarga}</p>
          </section>

          <section>
            <h2>Programa</h2>
            <div className="programa-pills">
              {evento.programa.map(item => (
                <span key={item} className="programa-pill">🎵 {item}</span>
              ))}
            </div>
          </section>

          <section>
            <h2>El lugar</h2>
            <div className="lugar-grid">
              <div className="lugar-datos">
                <h3>{evento.lugar}</h3>
                <p><span>📍</span> {evento.direccion}</p>
              </div>
              <div className="lugar-mapa-placeholder">
                <span>🗺️</span>
                <span>Ver en el mapa</span>
              </div>
            </div>
          </section>
        </div>

        {/* Columna derecha — card de compra */}
        <div className="compra-card">
          <div className="compra-card-header">
            <div className="compra-card-chip">
              <span className="chip-tipo-hero">{evento.tipo}</span>
            </div>
            <div className="compra-card-titulo">{evento.titulo}</div>
            <div className="compra-card-meta">
              <span>📅</span><span>{evento.fechaCompleta}</span>
            </div>
            <div className="compra-card-meta">
              <span>🕐</span><span>{evento.hora}</span>
            </div>
            <div className="compra-card-meta">
              <span>📍</span><span>{evento.lugar}</span>
            </div>
          </div>
          <div className="compra-card-body">
            <div className="compra-precio">{evento.precio}</div>
            {evento.precioDetalle && (
              <div className="compra-precio-detalle">{evento.precioDetalle}</div>
            )}
            <button className="compra-btn" style={{ background: ctaColor }}>
              {evento.cta}
            </button>
            <div className="compra-garantias">
              <div className="compra-garantia">
                <span className="compra-garantia-check">✓</span>
                <span>Pago seguro</span>
              </div>
              <div className="compra-garantia">
                <span className="compra-garantia-check">✓</span>
                <span>Entradas digitales</span>
              </div>
              <div className="compra-garantia">
                <span className="compra-garantia-check">✓</span>
                <span>Soporte en español</span>
              </div>
            </div>
          </div>
          <div className="compra-card-footer">
            <p>¿Tienes preguntas?</p>
            <div className="compra-contacto-btns">
              <a href={waLink} className="compra-contacto-btn">💬 WhatsApp</a>
              <a href="mailto:hola@colombiacanta.org" className="compra-contacto-btn">✉️ Email</a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA fijo */}
      <div className="mobile-cta-fixed">
        <button className="compra-btn" style={{ background: ctaColor }}>
          {evento.cta} — {evento.precio}
        </button>
      </div>

      {/* BLOQUE 4 — PRUEBA SOCIAL */}
      <section className="prueba-social">
        <div className="container">
          {evento.testimonios.length > 0 && (
            <>
              <span className="label-seccion label-rojo" style={{ marginBottom: '32px', display: 'block' }}>
                Lo que dicen nuestros asistentes
              </span>
              <div className="testimonios-grid">
                {evento.testimonios.map((t, i) => (
                  <div className="testimonio-card" key={i}>
                    <div className="testimonio-comillas">"</div>
                    <p className="testimonio-texto">{t.texto}</p>
                    <span className="testimonio-autor">{t.nombre} · {t.ciudad}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="stats-grid">
            <div>
              <span className="stats-numero">+10</span>
              <div className="stats-label">años de historia</div>
            </div>
            <div>
              <span className="stats-numero">+200</span>
              <div className="stats-label">estudiantes formados</div>
            </div>
            <div>
              <span className="stats-numero">5</span>
              <div className="stats-label">países visitados</div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 5 — CIERRE CTA */}
      <section className="evento-cierre">
        <div className="container" style={{ position: 'relative', paddingTop: '5px' }}>
          <h2>No te quedes sin tu entrada</h2>
          <p className="evento-cierre-sub">
            {evento.titulo} · {evento.lugar} · {evento.fecha}
          </p>
          <button className="evento-cierre-btn">{evento.cta}</button>
          <a href={waLink} className="evento-cierre-link" target="_blank" rel="noopener noreferrer">
            Tengo una pregunta →
          </a>
        </div>
      </section>

      {/* BLOQUE 6 — OTROS EVENTOS */}
      <section className="otros-eventos">
        <div className="container">
          <div className="otros-eventos-header">
            <span className="label-seccion label-muted">Otros eventos</span>
            <Link to="/eventos" className="btn btn-outline-oscuro" style={{ fontSize: '13px', padding: '8px 18px' }}>
              Ver todos →
            </Link>
          </div>
          <div className="otros-eventos-grid">
            {otrosEventos.map(ev => (
              <EventCard key={ev.id} evento={ev} />
            ))}
          </div>
        </div>
      </section>

      <ContactoSection />
      <Footer />
    </>
  );
}
