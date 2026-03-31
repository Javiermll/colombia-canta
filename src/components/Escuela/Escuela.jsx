import { Link } from 'react-router-dom';
import './Escuela.css';

const cursos = ['Bandola', 'Tiple', 'Guitarra', 'Canto', 'Piano'];

const imagenes = [
  { bg: 'linear-gradient(135deg, #1A56DB 0%, #F5C800 100%)', label: '🎸' },
  { bg: 'linear-gradient(135deg, #0F3A9E 0%, #1A56DB 100%)', label: '🎵' },
  { bg: 'linear-gradient(135deg, #F5C800 0%, #B8960A 100%)', label: '🎤' },
];

export default function Escuela() {
  return (
    <section className="escuela-section">
      {/* Contenido izquierda */}
      <div className="escuela-contenido">
        <span className="label-seccion label-amarillo">Escuela de Música</span>
        <h2>Aprende música tradicional colombiana</h2>
        <p>
          Nuestra escuela ofrece formación musical de calidad para niños, jóvenes y adultos. Desde principiantes hasta niveles avanzados, nuestros maestros te guiarán en el camino de la música tradicional colombiana.
        </p>
        <div className="escuela-pills">
          {cursos.map(c => (
            <span key={c} className="escuela-pill">{c}</span>
          ))}
        </div>
        <Link to="/inscripciones" className="btn btn-amarillo">Ver cursos disponibles →</Link>
      </div>

      {/* Mosaico de imágenes */}
      <div className="escuela-imagenes">
        <div className="escuela-img-grande">
          <div style={{
            background: imagenes[0].bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '64px', height: '100%'
          }}>
            {imagenes[0].label}
          </div>
        </div>
        <div className="escuela-img-chica">
          <div style={{
            background: imagenes[1].bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', height: '100%'
          }}>
            {imagenes[1].label}
          </div>
        </div>
        <div className="escuela-img-chica">
          <div style={{
            background: imagenes[2].bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', height: '100%'
          }}>
            {imagenes[2].label}
          </div>
        </div>
      </div>
    </section>
  );
}
