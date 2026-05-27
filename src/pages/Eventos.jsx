import { useState, useMemo } from 'react';
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

const CATEGORIAS = ['Todos', 'Gira USA', 'Sede', 'Festival'];
const AHORA = new Date();

function clasificar(lista) {
  const proximos = lista
    .filter(e => e.fechaISO && new Date(e.fechaISO) >= AHORA)
    .sort((a, b) => new Date(a.fechaISO) - new Date(b.fechaISO));
  const pasados = lista
    .filter(e => !e.fechaISO || new Date(e.fechaISO) < AHORA)
    .sort((a, b) => new Date(b.fechaISO) - new Date(a.fechaISO));
  return { proximos, pasados };
}

export default function Eventos() {
  const [filtro, setFiltro] = useState('Todos');

  const filtrados = useMemo(() =>
    filtro === 'Todos' ? eventos : eventos.filter(e => e.tipo === filtro),
    [filtro]
  );

  const { proximos, pasados } = useMemo(() => clasificar(filtrados), [filtrados]);

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

      <div className="page-header">
        <div className="container">
          <div className="page-header-inner">
            <span className="page-header-label">Agenda · 2026</span>
            <h1>Eventos</h1>
          </div>
          <div className="page-header-divisor" />
          <p className="page-header-sub">Próximas presentaciones de Colombia Canta y Encanta</p>
        </div>
      </div>

      <section className="eventos-page-section">
        <div className="container">

          {/* Filtros */}
          <div className="eventos-filtros">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                className={`eventos-filtro-btn${filtro === cat ? ' activo' : ''}`}
                onClick={() => setFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Próximos ── */}
          <div className="eventos-bloque">
            <div className="eventos-bloque-header">
              <h2 className="eventos-bloque-titulo">Próximos eventos</h2>
              {proximos.length > 0 && (
                <span className="eventos-bloque-count">{proximos.length}</span>
              )}
            </div>

            {proximos.length > 0 ? (
              <div className="eventos-grid">
                {proximos.map(ev => (
                  <Link to={`/eventos/${ev.id}`} key={ev.id} className="eventos-card-link">
                    <EventCard evento={ev} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="eventos-vacio">
                <p>Pronto anunciaremos nuevas fechas.</p>
                <p className="eventos-vacio-sub">Síguenos en redes para estar al tanto de la agenda.</p>
              </div>
            )}
          </div>

          {/* ── Pasados ── */}
          {pasados.length > 0 && (
            <div className="eventos-bloque eventos-bloque-pasados">
              <div className="eventos-bloque-header">
                <h2 className="eventos-bloque-titulo eventos-bloque-titulo-pasados">Ediciones anteriores</h2>
                <span className="eventos-bloque-count eventos-bloque-count-pasados">{pasados.length}</span>
              </div>
              <div className="eventos-grid">
                {pasados.map(ev => (
                  <Link to={`/eventos/${ev.id}`} key={ev.id} className="eventos-card-link">
                    <EventCard evento={ev} pasado />
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      <ContactoSection />
      <Footer />
    </main>
  );
}
