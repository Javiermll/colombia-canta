import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Historia.css';

const imagenes = [
  { bg: 'linear-gradient(135deg, #0F3A9E 0%, #1A56DB 60%, #B8960A 100%)', label: '🎻' },
  { bg: 'linear-gradient(135deg, #A8240E 0%, #E8341A 100%)', label: '🎶' },
  { bg: 'linear-gradient(135deg, #B8960A 0%, #F5C800 100%)', label: '🎺' },
];

export default function Historia() {
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivo(i => (i + 1) % imagenes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="historia-section">
      {/* Carrusel fade */}
      <div className="historia-carrusel">
        {imagenes.map((img, i) => (
          <div
            key={i}
            className={`historia-slide${i === activo ? ' activo' : ''}`}
            style={{ background: img.bg }}
          >
            <span className="historia-slide-emoji">{img.label}</span>
          </div>
        ))}
        <div className="historia-dots">
          {imagenes.map((_, i) => (
            <span key={i} className={`historia-dot${i === activo ? ' activo' : ''}`} />
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="historia-contenido">
        <span className="label-seccion label-rojo">Nuestra Historia</span>
        <h2>
          Desde Medellín para el <span>mundo</span>
        </h2>
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
