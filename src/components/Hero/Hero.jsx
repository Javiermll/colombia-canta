import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">

      {/* ── Columna izquierda: texto ─────────────────────────────────── */}
      <div className="hero-contenido">
        <span className="hero-badge">Fundación</span>

        <h1 className="hero-titulo">
          Donde el talento colombiano florece
        </h1>

        <p className="hero-subtexto">
          En Medellín, transformamos vidas a través de la música tradicional.
          Únete a una comunidad que celebra nuestra identidad, ritmo y alegría.
        </p>

        <div className="hero-ctas">
          <Link to="/contacto" className="hero-btn-primario">Contáctanos</Link>
          <Link to="/eventos" className="hero-btn-secundario">Ver eventos</Link>
        </div>
      </div>

      {/* ── Columna derecha: video ──────────────────────────────────── */}
      <div className="hero-animacion">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={`${import.meta.env.BASE_URL}ninos.webm`} type="video/webm" />
          <source src={`${import.meta.env.BASE_URL}ninos.mp4`} type="video/mp4" />
        </video>
      </div>

      {/* ── Indicador de scroll ──────────────────────────────────────── */}
      <div className="hero-scroll" aria-hidden="true">
        <span className="hero-scroll-label">Descubre más</span>
        <svg
          className="hero-scroll-chevron"
          width="20" height="20" viewBox="0 0 20 20" fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>

    </section>
  );
}
