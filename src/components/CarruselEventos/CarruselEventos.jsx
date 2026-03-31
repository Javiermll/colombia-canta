import { useState, useRef } from 'react';
import { eventos } from '../../data/eventos';
import EventCard from './EventCard';
import './CarruselEventos.css';

const CARD_WIDTH = 300; // 280 + 20 gap

export default function CarruselEventos() {
  const [offset, setOffset] = useState(0);
  const trackRef = useRef(null);

  const maxOffset = -(eventos.length - 1) * CARD_WIDTH;

  const prev = () => setOffset(o => Math.min(0, o + CARD_WIDTH));
  const next = () => setOffset(o => Math.max(maxOffset, o - CARD_WIDTH));

  return (
    <section className="carrusel-section">
      <div className="carrusel-header">
        <span className="carrusel-titulo">Eventos</span>
        <div className="carrusel-flechas">
          <button className="carrusel-flecha" onClick={prev} aria-label="Anterior">←</button>
          <button className="carrusel-flecha" onClick={next} aria-label="Siguiente">→</button>
        </div>
      </div>
      <div className="carrusel-wrapper">
        <div
          className="carrusel-track"
          ref={trackRef}
          style={{ transform: `translateX(${offset}px)` }}
        >
          {eventos.map(ev => (
            <EventCard key={ev.id} evento={ev} />
          ))}
        </div>
      </div>
    </section>
  );
}
