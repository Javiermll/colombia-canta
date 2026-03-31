import { useState } from 'react';
import { Link } from 'react-router-dom';
import { eventos } from '../data/eventos';
import EventCard from '../components/CarruselEventos/EventCard';
import ContactoSection from '../components/Contacto/Contacto';
import Footer from '../components/Footer/Footer';
import '../components/CarruselEventos/CarruselEventos.css';

const categorias = ['Todos', 'Gira USA', 'Sede', 'Festival'];

export default function Eventos() {
  const [filtro, setFiltro] = useState('Todos');

  const filtrados = filtro === 'Todos'
    ? eventos
    : eventos.filter(e => e.tipo === filtro);

  return (
    <main>
      <div className="page-header" style={{ paddingTop: '96px' }}>
        <h1>Eventos</h1>
        <p>Próximas presentaciones de Colombia Canta y Encanta</p>
      </div>

      <section style={{ padding: '56px 0' }}>
        <div className="container">
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '100px',
                  border: '1.5px solid',
                  borderColor: filtro === cat ? 'var(--azul-oscuro)' : 'rgba(0,0,0,0.15)',
                  background: filtro === cat ? 'var(--azul-oscuro)' : 'transparent',
                  color: filtro === cat ? '#fff' : 'var(--texto-principal)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-cuerpo)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de eventos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {filtrados.map(ev => (
              <Link to={`/eventos/${ev.id}`} key={ev.id} style={{ textDecoration: 'none' }}>
                <EventCard evento={ev} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ContactoSection />
      <Footer />
    </main>
  );
}
