import { useEffect } from 'react';
import './CursoModal.css';

const WAIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function CursoModal({ curso, onClose }) {
  const waMsg = encodeURIComponent(
    `Hola, estoy interesado/a en el curso de *${curso.nombre}* de Colombia Canta y Encanta. ¿Me pueden dar más información?`
  );
  const waLink = `https://wa.me/573015315119?text=${waMsg}`;

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="curso-overlay" onClick={onClose}>
      <div className="curso-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header coloreado ── */}
        <div className="curso-modal-header" style={{ background: curso.color }}>
          <button className="curso-modal-cerrar" onClick={onClose} aria-label="Cerrar">✕</button>
          <span className="curso-modal-emoji">{curso.emoji}</span>
          <div className="curso-modal-header-texto">
            <span className="curso-modal-tagline">{curso.tagline}</span>
            <h2 className="curso-modal-nombre">{curso.nombre}</h2>
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="curso-modal-body">

          <p className="curso-modal-desc">{curso.descripcion}</p>

          {/* Modalidades / instrumentos */}
          <div className="curso-modal-grupo">
            <span className="curso-modal-grupo-label">Modalidades</span>
            <div className="curso-modal-chips">
              {curso.instrumentos.map(i => (
                <span key={i} className="curso-chip curso-chip-color" style={{ '--chip-color': curso.color }}>
                  {i}
                </span>
              ))}
            </div>
          </div>

          {/* Niveles */}
          <div className="curso-modal-grupo">
            <span className="curso-modal-grupo-label">Niveles disponibles</span>
            <div className="curso-modal-chips">
              {curso.niveles.map(n => (
                <span key={n} className="curso-chip curso-chip-outline">{n}</span>
              ))}
            </div>
          </div>

          {/* Horarios */}
          <div className="curso-modal-grupo">
            <span className="curso-modal-grupo-label">Horarios</span>
            <div className="curso-modal-horarios">
              {curso.horarios.map((h, i) => (
                <div key={i} className="curso-modal-horario-fila">
                  <span className="curso-modal-dia">{h.dia}</span>
                  <span className="curso-modal-hora">{h.hora}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Duración y precio */}
          <div className="curso-modal-meta">
            <div className="curso-modal-meta-item">
              <span className="curso-modal-meta-label">Duración</span>
              <span className="curso-modal-meta-valor">{curso.duracion}</span>
            </div>
            <div className="curso-modal-meta-item">
              <span className="curso-modal-meta-label">Inversión</span>
              <span className="curso-modal-meta-valor">{curso.precio}</span>
            </div>
          </div>

          {/* CTA WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="curso-modal-cta"
            style={{ '--cta-bg': curso.color }}
          >
            <WAIcon /> Inscribirme por WhatsApp
          </a>

        </div>
      </div>
    </div>
  );
}
