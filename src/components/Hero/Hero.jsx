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

      {/* ── Columna derecha: animación ───────────────────────────────── */}
      <div className="hero-animacion">
        {/*
          ── PLACEHOLDER DE ANIMACIÓN ──────────────────────────────────
          Aquí va la animación de los personajes del folclor colombiano.

          Opciones evaluadas (pendiente de definir con diseñadora UX/UI):
            • Lottie   → <Player src="animacion.json" /> con react-lottie-player
            • CSS/SVG  → keyframes con sprites exportados desde Illustrator
            • Spline   → escena 3D embebida con @splinetool/react-spline
            • GIF/WebP → imagen animada optimizada para web

          Reemplazar el <div className="hero-animacion-placeholder" /> por
          el componente de animación elegido cuando esté disponible.
          ──────────────────────────────────────────────────────────────
        */}
        <div className="hero-animacion-placeholder" aria-hidden="true" />
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
