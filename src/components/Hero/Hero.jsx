import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const base = import.meta.env.BASE_URL;

const slides = [
  {
    id: 'bienvenida',
    label: 'Inicio',
    antetitulo: '"La música es el latido de Colombia"',
    titulo: (
      <>Donde el talento<br />colombiano <span className="hero-titulo-acento">florece</span></>
    ),
    descripcion:
      'En Medellín, transformamos vidas a través de la música tradicional. Una comunidad que celebra nuestra identidad, nuestro ritmo y nuestra alegría.',
    ctas: [
      { label: 'Contáctanos',   to: '/contacto', primario: true  },
      { label: 'Descubrir más', to: '/nosotros',  primario: false },
    ],
    imagen: 'hero-slides/bienvenida.webp',
  },
  {
    id: 'quienes-somos',
    label: 'Quiénes somos',
    antetitulo: '"Raíces profundas, vuelo alto"',
    titulo: (
      <>Una fundación nacida<br />del <span className="hero-titulo-acento">corazón</span> andino</>
    ),
    descripcion:
      'Desde Medellín llevamos la música y danza tradicional colombiana al mundo. Más de una década uniendo comunidades a través del arte y la cultura.',
    ctas: [
      { label: 'Nuestra historia',   to: '/nosotros', primario: true  },
      { label: 'Conocer el elenco', to: '/elenco',   primario: false },
    ],
    imagen: 'hero-slides/quienes-somos.webp',
  },
  {
    id: 'eventos',
    label: 'Eventos',
    antetitulo: '"El escenario es nuestro hogar"',
    titulo: (
      <>Vive la magia de<br />nuestros <span className="hero-titulo-acento">eventos</span></>
    ),
    descripcion:
      'Festivales, galas y presentaciones que llevan la esencia de Colombia a los escenarios más importantes del país y el mundo.',
    ctas: [
      { label: 'Ver eventos', to: '/eventos', primario: true },
    ],
    imagen: 'hero-slides/eventos.webp',
  },
  {
    id: 'escuela',
    label: 'Escuela',
    antetitulo: '"El ritmo vive en cada uno de nosotros"',
    titulo: (
      <>Aprende, crece y<br /><span className="hero-titulo-acento">transforma</span> tu vida</>
    ),
    descripcion:
      'Nuestra escuela de música y danza abre las puertas a todas las edades. Guitarra, bandola, tiple, danza folclórica y mucho más.',
    ctas: [
      { label: 'Inscribirse ahora', to: '/inscripciones', primario: true  },
      { label: 'Ver programas',     to: '/inscripciones', primario: false },
    ],
    imagen: 'hero-slides/escuela.webp',
  },
  {
    id: 'tienda',
    label: 'Tienda',
    antetitulo: '"Lleva un pedazo de Colombia contigo"',
    titulo: (
      <>Nuestra cultura,<br />al alcance de tus <span className="hero-titulo-acento">manos</span></>
    ),
    descripcion:
      'Discos, artesanías, indumentaria típica y mucho más. Cada producto lleva el alma de Colombia Canta y Encanta — apoya el arte y la cultura con cada compra.',
    ctas: [
      { label: 'Visitar tienda', to: '/tienda', primario: true },
    ],
    imagen: 'hero-slides/tienda.webp',
  },
  {
    id: 'noticias',
    label: 'Noticias',
    antetitulo: '"Cada logro, una historia que contar"',
    titulo: (
      <>Mantente al día con<br />nuestra <span className="hero-titulo-acento">historia viva</span></>
    ),
    descripcion:
      'Reconocimientos internacionales, giras, nuevos proyectos y la vida detrás del telón. Sigue de cerca todo lo que vibra en Colombia Canta y Encanta.',
    ctas: [
      { label: 'Ver noticias', to: '/noticias', primario: true },
    ],
    imagen: 'hero-slides/noticias.webp',
  },
  {
    id: 'contacto',
    label: 'Contacto',
    antetitulo: '"Cada gran historia comienza con un hola"',
    titulo: (
      <>Hagamos algo<br /><span className="hero-titulo-acento">grande</span> juntos</>
    ),
    descripcion:
      'Alianzas, patrocinios, presentaciones privadas o simplemente para conocernos — estamos listos para colaborar contigo.',
    ctas: [
      { label: 'Escríbenos', to: '/contacto', primario: true },
    ],
    imagen: 'hero-slides/contacto.webp',
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a - 1 + slides.length) % slides.length);
  const next = () => setActive((a) => (a + 1) % slides.length);

  return (
    <section className="hero-carousel">

      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero-slide${active === i ? ' hero-slide--activo' : ''}`}
          aria-hidden={active !== i}
        >
          {/* ── Contenido izquierdo ── */}
          <div className="hero-slide-contenido">
            <p className="hero-antetitulo">{slide.antetitulo}</p>
            <h1 className="hero-titulo">{slide.titulo}</h1>
            <p className="hero-desc">{slide.descripcion}</p>
            <div className="hero-ctas">
              {slide.ctas.map((cta) => (
                <Link
                  key={cta.label}
                  to={cta.to}
                  className={cta.primario ? 'hero-btn-primario' : 'hero-btn-secundario'}
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Imagen derecha con corte diagonal ── */}
          <div className="hero-slide-imagen-wrap">
            <img
              src={`${base}${slide.imagen}`}
              alt={slide.label}
              className={`hero-slide-imagen hero-img--${slide.id}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        </div>
      ))}

      {/* ── Flechas de navegación ── */}
      <div className="hero-arrows">
        <button className="hero-arrow hero-arrow--prev" onClick={prev} aria-label="Sección anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="hero-arrow hero-arrow--next" onClick={next} aria-label="Siguiente sección">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* ── Tabs de navegación ── */}
      <nav className="hero-tabs" aria-label="Secciones del carrusel">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            className={`hero-tab${active === i ? ' hero-tab--activo' : ''}`}
            onClick={() => setActive(i)}
          >
            <span className="hero-tab-barra" aria-hidden="true" />
            <span className="hero-tab-label">{slide.label}</span>
          </button>
        ))}
      </nav>

    </section>
  );
}
