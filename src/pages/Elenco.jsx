import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { elenco } from '../data/elenco';
import ArtistaModal from '../components/ArtistaModal/ArtistaModal';
import ContactoSection from '../components/Contacto/Contacto';
import Footer from '../components/Footer/Footer';
import '../styles/main.css';
import { BASE_URL, OG_IMAGE } from '../utils/seo';

const PAGE_TITLE = 'Elenco Artístico | Colombia Canta y Encanta';
const PAGE_DESC = 'Conoce a los artistas, músicos y bailarines que conforman el elenco de Colombia Canta y Encanta, llevando la música tradicional colombiana al mundo.';

const FILTROS_ELENCO = ['Todos', 'Voces', 'Instrumental', 'Danza'];

export default function Elenco() {
  const [filtroElenco, setFiltroElenco] = useState('Todos');
  const [artistaSeleccionado, setArtistaSeleccionado] = useState(null);

  const elencoFiltrado = filtroElenco === 'Todos'
    ? elenco
    : elenco.filter(a => a.categoria === filtroElenco);

  return (
    <main>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${BASE_URL}/#/elenco`} />
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
            <span className="page-header-label">Talento · Pasión · Identidad</span>
            <h1>Elenco Artístico</h1>
          </div>
          <div className="page-header-divisor" />
          <p className="page-header-sub">Los artistas que llevan la música y la danza colombiana a escenarios del mundo</p>
        </div>
      </div>

      <section className="elenco-section">
        <div className="container">
          <div className="elenco-filtros">
            {FILTROS_ELENCO.map(f => (
              <button
                key={f}
                className={`elenco-filtro-btn${filtroElenco === f ? ' activo' : ''}`}
                onClick={() => setFiltroElenco(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="elenco-grid">
            {elencoFiltrado.map(artista => (
              <div
                key={artista.id}
                className="elenco-card"
                onClick={() => setArtistaSeleccionado(artista)}
              >
                <div className="elenco-card-img" style={{ background: artista.gradiente }}>
                  {artista.img && (
                    <img
                      src={artista.img}
                      alt={artista.nombre}
                      className="elenco-card-foto"
                    />
                  )}
                  {!artista.img && (
                    <span className="elenco-card-placeholder-emoji">{artista.emoji}</span>
                  )}
                  <span className="elenco-card-chip">{artista.chip}</span>
                  {/* Hover overlay */}
                  <div className="elenco-card-hover-overlay">
                    <span className="elenco-card-ver-perfil">Ver perfil →</span>
                  </div>
                </div>
                <div className="elenco-card-info">
                  <div className="elenco-card-nombre">{artista.nombre}</div>
                  <div className="elenco-card-categoria">{artista.categoria}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {artistaSeleccionado && (
        <ArtistaModal
          artista={artistaSeleccionado}
          onClose={() => setArtistaSeleccionado(null)}
        />
      )}

      <ContactoSection />
      <Footer />
    </main>
  );
}
