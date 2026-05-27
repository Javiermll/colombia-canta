import { Link } from 'react-router-dom';
import { eventos } from '../../data/eventos';
import './CarruselEventos.css';

export default function CarruselEventos() {
  return (
    <section className="eventos-ac-section">
      <div className="container">
        <div className="eventos-ac-header">
          <div>
            <span className="label-seccion label-rojo">Agenda · 2026</span>
            <h2 className="eventos-ac-titulo-seccion">Próximos Eventos</h2>
          </div>
          <Link to="/eventos" className="eventos-ac-ver-todos">
            Ver todos <span className="eventos-ac-flecha">→</span>
          </Link>
        </div>

        <div className="eventos-ac-acordeon">
          {eventos.map(ev => (
            <Link
              to={`/eventos/${ev.id}`}
              key={ev.id}
              className="evento-ac-card"
              style={{
                background: `linear-gradient(160deg, ${ev.color} 0%, rgba(0,0,0,0.88) 100%)`
              }}
            >
              {/* Estado colapsado */}
              <div className="evento-ac-collapsed">
                <span className="evento-ac-tipo-rotado">{ev.tipo}</span>
                <span className="evento-ac-fecha-chip">
                  {ev.fecha.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>

              {/* Estado expandido */}
              <div className="evento-ac-expanded">
                <span className="evento-ac-chip">{ev.tipo}</span>
                <h3 className="evento-ac-nombre">{ev.titulo}</h3>
                <p className="evento-ac-ciudad">📍 {ev.ciudad}</p>
                <p className="evento-ac-fecha-texto">{ev.fecha}</p>
                <span className="evento-ac-cta">Ver evento →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
