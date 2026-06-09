import { Link } from 'react-router-dom';
import { eventosFijos } from '../../data/eventosFijos';
import './EventosFijosHome.css';

export default function EventosFijosHome() {
  return (
    <div className="efh-grid">
      {eventosFijos.map(ev => (
        <Link
          key={ev.id}
          to={`/eventos/${ev.slug}`}
          className="efh-card"
          style={!ev.img
            ? { background: `linear-gradient(140deg, ${ev.color} 0%, ${ev.colorHero} 100%)` }
            : undefined
          }
        >
          {ev.img && (
            <img
              src={ev.img}
              alt={ev.titulo}
              className="efh-bg-img"
              loading="lazy"
              decoding="async"
            />
          )}

          {!ev.img && <span className="efh-deco">🇨🇴</span>}

          <div className="efh-overlay" />

          <div className="efh-top">
            <span className="efh-chip" style={{ background: `${ev.color}dd` }}>
              {ev.tipo}
            </span>
            {ev.tripadvisorLink && (
              <div
                className="efh-tripadvisor"
                onClick={e => { e.preventDefault(); window.open(ev.tripadvisorLink, '_blank', 'noopener,noreferrer'); }}
                title="Ver reseñas en TripAdvisor"
              >
                <svg className="efh-ta-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <span>Ver reseñas</span>
              </div>
            )}
          </div>

          <div className="efh-bottom">
            <h3 className="efh-titulo">{ev.titulo}</h3>
            <p className="efh-desc">{ev.descripcionCorta}</p>
            <div className="efh-pills">
              {ev.pills.slice(0, 3).map(p => (
                <span key={p.texto} className="efh-pill">
                  {p.icono} {p.texto}
                </span>
              ))}
            </div>
            <span className="efh-cta">
              {ev.cta} <span className="efh-arrow">→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
