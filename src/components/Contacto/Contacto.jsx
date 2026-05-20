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
            <div className="contacto-anillo" />
            <div className="contacto-punto" />
            <img
              src={`${import.meta.env.BASE_URL}Contacto.png`}
              alt="Bailarina de folclor colombiano"
              className="contacto-foto"
            />
          </div>
        </div>
      </div>

      <div className="bandera-colombia">
        <div className="bandera-amarillo" />
        <div className="bandera-azul" />
        <div className="bandera-rojo" />
      </div>

      <div className="aliados-bar">
        <div className="container">
          <div className="aliados-inner">
            <span className="aliados-label">Aliados</span>
            <div className="aliados-overflow">
              <div className="aliados-track">
                {[...aliados, ...aliados].map((a, i) => (
                  <span key={i} className="aliado-item">{a}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
