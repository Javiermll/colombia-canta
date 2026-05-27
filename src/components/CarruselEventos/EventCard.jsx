import { useNavigate } from 'react-router-dom';

export default function EventCard({ evento, pasado = false }) {
  const navigate = useNavigate();
  const esPago = evento.precio && !['Entrada libre', 'Próximamente'].includes(evento.precio);

  return (
    <div className={`event-card${pasado ? ' event-card-pasado' : ''}`} onClick={() => navigate(`/eventos/${evento.id}`)}>
      <div
        className="event-card-img"
        style={{ background: `linear-gradient(135deg, ${evento.colorHero}, rgba(0,0,0,0.5))` }}
      >
        <span className="chip-fecha">{evento.fecha}</span>
        <span className="chip-tipo">{evento.tipo}</span>
        {pasado && <span className="chip-finalizado">Finalizado</span>}
      </div>
      <div className="event-card-body">
        <div className="event-card-titulo">{evento.titulo}</div>
        <div className="event-card-desc">{evento.descripcion}</div>
        <div className="event-card-meta">
          <span>📍</span>
          <span>{evento.ciudad}</span>
          {evento.hora !== 'Por confirmar' && (
            <>
              <span>·</span>
              <span>{evento.hora}</span>
            </>
          )}
        </div>
        <div className="event-card-divider" />
        <div className="event-card-footer">
          <span className={`event-card-precio${!esPago ? ' libre' : ''}`}>
            {evento.precio}
          </span>
          {esPago ? (
            <button className="event-card-btn primario">{evento.cta}</button>
          ) : (
            <button className="event-card-btn secundario">{evento.cta}</button>
          )}
        </div>
      </div>
    </div>
  );
}
