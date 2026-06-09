import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Historia.css";

const banderas = [
  { code: 'at', pais: 'Austria' },
  { code: 'si', pais: 'Eslovenia' },
  { code: 'it', pais: 'Italia' },
  { code: 'mx', pais: 'México' },
  { code: 'br', pais: 'Brasil' },
  { code: 'us', pais: 'EEUU' },
];

const imagenes = [
  {
    src: "nuestra-historia/dsc03185-6.webp",
    alt: "Colombia Canta y Encanta en escenario",
  },
  {
    src: "nuestra-historia/dsc03897-2.webp",
    alt: "Presentación artística Colombia Canta",
  },
  {
    src: "nuestra-historia/dsc04280-4.webp",
    alt: "Elenco de Colombia Canta y Encanta",
  },
  {
    src: "nuestra-historia/img_78741-2.webp",
    alt: "Artistas de Colombia Canta y Encanta",
  },
];

export default function Historia() {
  const [activo, setActivo] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivo((i) => (i + 2) % imagenes.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!trackRef.current) return;
    const slide = trackRef.current.children[activo];
    if (slide) {
      trackRef.current.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    }
  }, [activo]);

  return (
    <section className="historia-section">
      {/* Header full-width */}
      <span className="historia-seccion-label label-seccion label-rojo">Quiénes Somos</span>
      <div className="historia-header-quote">
        <p className="historia-header-quote-texto">Un sueño nacido en Medellín que hoy late en escenarios de todo el mundo</p>
      </div>

      {/* Carrusel — izquierda en desktop, arriba en mobile */}
      <div className="historia-carrusel">
        <div className="historia-track" ref={trackRef}>
          {imagenes.map((img, i) => (
            <div key={i} className="historia-slide">
              {img.src ? (
                <img
                  src={`${import.meta.env.BASE_URL}${img.src}`}
                  alt={img.alt}
                  className="historia-slide-img"
                />
              ) : (
                <div
                  className="historia-slide-ph"
                  style={{ background: img.bg }}
                >
                  <span>{img.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Texto — derecha en desktop, abajo en mobile */}
      <div className="historia-contenido">
        <h2>
          Desde Medellín para el <span>mundo</span>
        </h2>
        <p>
          Colombia Canta y Encanta nació en Medellín con un sueño: preservar y
          difundir la riqueza de la música tradicional colombiana. Reconocidos
          por el Ministerio de Cultura como{' '}
          <strong className="historia-logro">Mejor Escuela de Música Privada de Colombia</strong>
          , hoy formamos a niños, jóvenes y adultos llevando el bambuco, el
          pasillo y la cumbia a escenarios de todo el mundo.
        </p>
        <div className="historia-stats">
          <div className="stat-item">
            <span className="stat-titulo">Historia</span>
            <span className="stat-numero">+20</span>
            <span className="stat-label">años de trayectoria</span>
          </div>
          <div className="stat-item">
            <span className="stat-titulo">Alumnos</span>
            <span className="stat-numero">+200</span>
            <span className="stat-label">estudiantes formados</span>
          </div>
          <div className="stat-item stat-item--banderas">
            <span className="stat-titulo">Países</span>
            <div className="historia-banderas-wrap">
              <div className="historia-banderas-track">
                {banderas.map((b, i) => (
                  <div key={i} className="historia-bandera-circulo" title={b.pais}>
                    <img
                      src={`https://flagcdn.com/w40/${b.code}.png`}
                      alt={b.pais}
                      className="historia-bandera-img"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Link to="/nosotros" className="btn btn-azul">
          Saber más →
        </Link>
      </div>
    </section>
  );
}
