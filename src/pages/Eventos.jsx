import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { eventos } from '../data/eventos';
import EventCard from '../components/CarruselEventos/EventCard';
import ContactoSection from '../components/Contacto/Contacto';
import Footer from '../components/Footer/Footer';
import '../components/CarruselEventos/CarruselEventos.css';
import { BASE_URL, OG_IMAGE } from '../utils/seo';

const PAGE_TITLE = 'Eventos | Colombia Canta y Encanta';
const PAGE_DESC = 'Próximas presentaciones de Colombia Canta y Encanta en Medellín y gira USA 2026. Conciertos, festivales y eventos de música colombiana.';

const categorias = ['Todos', 'Gira USA', 'Sede', 'Festival'];

export default function Eventos() {
  const [filtro, setFiltro] = useState('Todos');

  const filtrados = filtro === 'Todos'
    ? eventos
    : eventos.filter(e => e.tipo === filtro);

  return (
    <main>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${BASE_URL}/#/eventos`} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESC} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:site_name" content="Colombia Canta y Encanta" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>
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
                  borderColor: filtro === cat ? 'var(--azul-oscuro)' : 'var(--border-media)',
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
