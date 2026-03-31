import { Link } from 'react-router-dom';
import './Contacto.css';

const aliados = ['Co·Crea', 'Alcaldía de Medellín', 'Medellín Bureau', 'Teleantioquia', 'Teatro Trail'];

export default function ContactoSection() {
  return (
    <div className="contacto-section">
      <div className="container">
        <div className="contacto-grid">
          <div className="contacto-content">
            <span className="label-seccion label-rojo">Únete a nuestra comunidad</span>
            <h2 className="frase-principal">
              La música colombiana que <span>mueve al mundo</span>
            </h2>
            <p className="subtitulo">Centro cultural · Escuela de música · Medellín, Colombia</p>
            <Link to="/contacto" className="btn btn-outline-oscuro">Contáctanos</Link>
          </div>
          <div className="contacto-imagen">
            <div className="contacto-semicirculo" />
            <div className="contacto-imagen-placeholder">🩰</div>
          </div>
        </div>
      </div>
      <div className="aliados-bar">
        <div className="container">
          <div className="aliados-inner">
            <span className="aliados-label">Aliados</span>
            <div className="aliados-lista">
              {aliados.map(a => (
                <span key={a} className="aliado-item">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
