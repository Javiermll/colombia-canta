import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { cursos } from "../data/cursos";
import CursoModal from "../components/CursoModal/CursoModal";
import Footer from "../components/Footer/Footer";
import "../styles/main.css";
import { BASE_URL, OG_IMAGE } from "../utils/seo";

const PAGE_TITLE = "Inscripciones | Colombia Canta y Encanta";
const PAGE_DESC =
  "Inscríbete en la escuela de música de Colombia Canta y Encanta. Cursos vocales, teatro musical, instrumento personalizado e iniciación musical en Medellín.";

const pasos = [
  {
    num: "1",
    titulo: "Elige tu curso",
    desc: "Revisa los cursos disponibles y selecciona el que más te interese según tu nivel y horario.",
  },
  {
    num: "2",
    titulo: "Escríbenos",
    desc: "Contáctanos por WhatsApp o completa el formulario de inscripción con tus datos.",
  },
  {
    num: "3",
    titulo: "Realiza el pago",
    desc: "Recibe las instrucciones de pago y completa tu matrícula fácilmente.",
  },
  {
    num: "4",
    titulo: "Recibe confirmación",
    desc: "Te enviamos la confirmación de tu inscripción con todos los detalles del curso.",
  },
];

const faqs = [
  {
    q: "¿Necesito experiencia previa?",
    r: "No. Tenemos cursos para todos los niveles, desde principiantes absolutos hasta estudiantes avanzados.",
  },
  {
    q: "¿Cuánto duran los cursos?",
    r: "Los cursos tienen una duración de 6 meses, con clases de 1 a 2 horas según la modalidad.",
  },
  {
    q: "¿Cuál es el costo de los cursos?",
    r: "El valor varía según el instrumento y el nivel. Escríbenos al WhatsApp para información actualizada.",
  },
  {
    q: "¿Hay descuentos para estudiantes?",
    r: "Sí, ofrecemos descuentos especiales para estudiantes y para inscripciones de hermanos.",
  },
  {
    q: "¿Dónde son las clases?",
    r: "En nuestra sede del Sector Estadio, Calle 49 76a 65, Medellín.",
  },
];

export default function Inscripciones() {
  const [openFaq, setOpenFaq] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  return (
    <main>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${BASE_URL}/#/inscripciones`} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESC} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:site_name" content="Colombia Canta y Encanta" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>

      <div className="page-header">
        <div className="container">
          <div className="page-header-inner">
            <span className="page-header-label">Escuela de Música</span>
            <h1>Inscripciones</h1>
          </div>
          <div className="page-header-divisor" />
        </div>
      </div>

      {/* ── Cursos ── */}
      <section id="cursos" className="inscr-seccion">
        <div className="container">
          <span className="label-seccion label-rojo">Nuestros cursos</span>
          <h2 className="inscr-titulo">Elige tu camino</h2>
          <p className="inscr-subtitulo">
            Formación musical para todas las edades y niveles.
          </p>

          <div className="inscr-cursos-grid">
            {cursos.map((c) => (
              <div
                key={c.id}
                className="inscr-card"
                onClick={() => setCursoSeleccionado(c)}
              >
                {/* Header coloreado */}
                <div
                  className="inscr-card-header"
                  style={{ background: c.color }}
                >
                  <span className="inscr-card-emoji">{c.emoji}</span>
                  <span className="inscr-card-tagline">{c.tagline}</span>
                </div>

                {/* Cuerpo */}
                <div className="inscr-card-body">
                  <h3 className="inscr-card-nombre">{c.nombre}</h3>
                  <ul className="inscr-card-lista">
                    {c.instrumentos.slice(0, 4).map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                    {c.instrumentos.length > 4 && (
                      <li className="inscr-card-mas">
                        +{c.instrumentos.length - 4} más
                      </li>
                    )}
                  </ul>
                  <button
                    className="inscr-card-btn"
                    style={{ "--btn-color": c.color }}
                  >
                    Ver detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo inscribirse ── */}
      <section
        id="como-inscribirse"
        className="inscr-seccion inscr-seccion-foto"
        style={{
          backgroundImage: `linear-gradient(rgba(10,15,30,0.62), rgba(10,15,30,0.82)), url(${import.meta.env.BASE_URL}Nuestra_Historia.avif)`,
        }}
      >
        <div className="container">
          <span className="label-seccion label-rojo">Proceso</span>
          <h2 className="inscr-titulo">Cómo inscribirse</h2>
          <p className="inscr-subtitulo inscr-subtitulo-claro">
            Cuatro pasos simples para comenzar tu formación musical.
          </p>
          <div className="grid-4col inscr-pasos">
            {pasos.map((p) => (
              <div key={p.num} className="inscr-paso">
                <div className="inscr-paso-num">{p.num}</div>
                <h3 className="inscr-paso-titulo">{p.titulo}</h3>
                <p className="inscr-paso-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="inscr-seccion">
        <div className="container inscr-faq-container">
          <span className="label-seccion label-rojo">Preguntas frecuentes</span>
          <h2 className="inscr-titulo">¿Tienes dudas?</h2>
          <p className="inscr-subtitulo">
            Todo lo que necesitas saber antes de inscribirte.
          </p>
          <div className="inscr-faq-lista">
            {faqs.map((faq, i) => (
              <div key={i} className="inscr-faq-item">
                <button
                  className="inscr-faq-pregunta"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <span
                    className={`inscr-faq-chevron${openFaq === i ? " abierto" : ""}`}
                  >
                    ▾
                  </span>
                </button>
                {openFaq === i && (
                  <p className="inscr-faq-respuesta">{faq.r}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {cursoSeleccionado && (
        <CursoModal
          curso={cursoSeleccionado}
          onClose={() => setCursoSeleccionado(null)}
        />
      )}

      <Footer />
    </main>
  );
}
