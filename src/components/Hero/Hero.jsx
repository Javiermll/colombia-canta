import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const base = import.meta.env.BASE_URL;

const slides = [
  {
    id: 'bienvenida',
    titulo: (<>Donde Colombia <br />canta, baila y <span className="hero-accent">encanta</span></>),
    descripcion: 'Somos una comunidad artística que preserva y proyecta el folclor colombiano a través de la formación, los escenarios y experiencias que conectan generaciones.',
    ctas: [
      { label: 'Descúbrenos', to: '/nosotros', primario: true },
      { label: 'Contáctanos', to: '/contacto', primario: false },
    ],
    imagen: 'hero-slides/bienvenida.webp',
    badge: 'Comunidad'
  },
  {
    id: 'quienes-somos',
    titulo: (<>Raíces que nos <br />unen al <span className="hero-accent">mundo</span></>),
    descripcion: 'Desde Medellín llevamos la música y danza tradicional colombiana a los escenarios más importantes del mundo, celebrando nuestra identidad.',
    ctas: [{ label: 'Nuestra historia', to: '/nosotros', primario: true }],
    imagen: 'hero-slides/quienes-somos.webp',
    badge: 'Raíces'
  },
  {
    id: 'eventos',
    titulo: (<>Vive la magia de <br />nuestros <span className="hero-accent">eventos</span></>),
    descripcion: 'Festivales, galas y presentaciones que llevan la esencia de Colombia a los escenarios más importantes del país y el mundo.',
    ctas: [{ label: 'Ver cartelera', to: '/eventos', primario: true }],
    imagen: 'hero-slides/eventos.webp',
    badge: 'Magia'
  },
  {
    id: 'escuela',
    titulo: (<>Aprende, crece y <br />transforma tu <span className="hero-accent">vida</span></>),
    descripcion: 'Nuestra escuela de música y danza abre las puertas a todas las edades: guitarra, bandola, tiple y danza folclórica.',
    ctas: [{ label: 'Ver programas', to: '/inscripciones', primario: true }],
    imagen: 'hero-slides/escuela.webp',
    badge: 'Escuela'
  },
  {
    id: 'tienda',
    titulo: (<>Nuestra cultura <br />en tus <span className="hero-accent">manos</span></>),
    descripcion: 'Discos, artesanías e indumentaria típica. Cada producto apoya directamente a nuestros artistas y la difusión de la cultura.',
    ctas: [{ label: 'Visitar tienda', to: '/tienda', primario: true }],
    imagen: 'hero-slides/tienda.webp',
    badge: 'Cultura'
  },
  {
    id: 'noticias',
    titulo: (<>Mantente al día con <br />nuestra <span className="hero-accent">historia</span></>),
    descripcion: 'Giras internacionales, nuevos proyectos y la vida detrás del telón. Sigue de cerca todo lo que vibra en Colombia Canta y Encanta.',
    ctas: [{ label: 'Ver noticias', to: '/noticias', primario: true }],
    imagen: 'hero-slides/noticias.webp',
    badge: 'Historia'
  },
  {
    id: 'contacto',
    titulo: (<>Hagamos algo <br />grande <span className="hero-accent">juntos</span></>),
    descripcion: 'Alianzas, patrocinios o presentaciones privadas. Estamos ready para colaborar y llevar el arte colombiano a nuevos espacios.',
    ctas: [{ label: 'Escríbenos', to: '/contacto', primario: true }],
    imagen: 'hero-slides/contacto.webp',
    badge: 'Unión'
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = () => setActive((a) => (a + 1) % slides.length);
  const prev = () => setActive((a) => (a - 1 + slides.length) % slides.length);
  const goTo = (idx) => setActive(idx);

  useEffect(() => {
    if (isPaused) return;
    const autoPlay = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(autoPlay);
  }, [active, isPaused]);

  const activeSlide = slides[active];

  return (
    <section 
      className="hero-fade-magazine-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* CONTENEDOR FLUIDO EN DOS COLUMNAS */}
      <div className="hero-magazine-container">
        
        {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
        <div className="hero-magazine-text-side">
          <span className="hero-brand-subtitle">Colombia Canta y Encanta — {activeSlide.badge}</span>
          <h1 className="hero-magazine-title">{activeSlide.titulo}</h1>
          <p className="hero-magazine-description">{activeSlide.descripcion}</p>
          
          <div className="hero-magazine-actions">
            {activeSlide.ctas.map((cta) => (
              <Link
                key={cta.label}
                to={cta.to}
                className={cta.primario ? 'hero-btn-pink-flat' : 'hero-btn-text-only'}
              >
                {cta.label}
                {!cta.primario && <span className="hero-heart-icon"> ♥</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: IMAGEN DEGRADADA DIFUMINADA HACIA LOS BORDES */}
        <div className="hero-magazine-visual-side">
          {slides.map((slide, i) => (
            <img
              key={slide.id}
              src={`${base}${slide.imagen}`}
              alt=""
              className={`hero-magazine-fade-img ${active === i ? 'is-visible' : ''}`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}

          {/* Flechas minimalistas flotantes sobre la imagen */}
          <button className="hero-nav-arrow arrow-left" onClick={prev} aria-label="Anterior">
            ‹
          </button>
          <button className="hero-nav-arrow arrow-right" onClick={next} aria-label="Siguiente">
            ›
          </button>
        </div>

      </div>

      {/* COMPONENTES DE CONTROL DE DESPLAZAMIENTO INFERIOR */}
      <div className="hero-magazine-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`hero-magazine-dot ${active === idx ? 'is-active' : ''}`}
            onClick={() => goTo(idx)}
            aria-label={`Ir al slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}