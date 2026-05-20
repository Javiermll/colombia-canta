import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Historia.css';

const imagenes = [
  { bg: 'linear-gradient(135deg, #A8240E 0%, #E8341A 100%)', label: '🎶' },
  { bg: 'linear-gradient(135deg, #B8960A 0%, #F5C800 100%)', label: '🎺' },
];

export default function Historia() {
  const [activo, setActivo] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivo(i => (i + 2) % imagenes.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!trackRef.current) return;
    const slide = trackRef.current.children[activo];
    if (slide) {
      trackRef.current.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    }
  }, [activo]);

  const handlePrev = () => setActivo(i => Math.max(0, i - 2));
  const handleNext = () => setActivo(i => Math.min(imagenes.length - 1, i + 2));

  return (
    <section className="historia-section">

      {/* Carrusel — izquierda en desktop, arriba en mobile */}
      <div className="historia-carrusel">
        <div className="historia-track" ref={trackRef}>
          {imagenes.map((img, i) => (
            <div key={i} className="historia-slide">
              {img.src
                ? <img src={`${import.meta.env.BASE_URL}${img.src}`} alt={img.alt} className="historia-slide-img" />
                : <div className="historia-slide-ph" style={{ background: img.bg }}><span>{img.label}</span></div>
              }
            </div>
          ))}
        </div>

        <button
          className="historia-arrow historia-arrow--prev"
          onClick={handlePrev}
          disabled={activo === 0}
          aria-label="Anterior"
        >‹</button>
        <button
          className="historia-arrow historia-arrow--next"
          onClick={handleNext}
          disabled={activo === imagenes.length - 1}
          aria-label="Siguiente"
        >›</button>

        <div className="historia-dots">
          {imagenes.map((_, i) => (
            <span
              key={i}
              className={`historia-dot${i === activo ? ' activo' : ''}`}
              onClick={() => setActivo(i)}
            />
          ))}
        </div>
      </div>

      {/* Texto — derecha en desktop, abajo en mobile */}
      <div className="historia-contenido">
        <span className="label-seccion label-rojo">Nuestra Historia</span>
        <h2>Desde Medellín para el <span>mundo</span></h2>
        <p>
          Colombia Canta y Encanta nació en Medellín como un sueño: preservar y difundir la riqueza de la música tradicional colombiana. Durante más de diez años hemos formado a cientos de niños y jóvenes, llevando el bambuco, el pasillo y la cumbia a escenarios de todo el mundo.
        </p>
        <div className="historia-stats">
          <div className="stat-item">
            <span className="stat-numero">+10</span>
            <span className="stat-label">años de historia</span>
          </div>
          <div className="stat-item">
            <span className="stat-numero">+200</span>
            <span className="stat-label">estudiantes formados</span>
          </div>
          <div className="stat-item">
            <span className="stat-numero">5</span>
            <span className="stat-label">países visitados</span>
          </div>
        </div>
        <Link to="/nosotros" className="btn btn-azul">Conocer más →</Link>
      </div>

    </section>
  );
}
