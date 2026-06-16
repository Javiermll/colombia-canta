
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { cursos } from "../data/cursos";
import Footer from "../components/Footer/Footer";
import "../styles/main.css";
import { BASE_URL, OG_IMAGE } from "../utils/seo";

const PAGE_TITLE = "Inscripciones | Colombia Canta y Encanta";
const PAGE_DESC =
  "Inscríbete en la escuela de música de Colombia Canta y Encanta. Cursos vocales, teatro musical, instrumento personalizado e iniciación musical en Medellín.";

const pasosGuia = [
  {
    num: "1",
    titulo: "Elige tu curso",
    desc: "Revisa los cursos disponibles y selecciona el que más te interese según tu nivel y horario.",
  },
  {
    num: "2",
    titulo: "Completa el formulario",
    desc: "Llena el formulario dinámico paso a paso con los datos del estudiante.",
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
  
  // --- Estados de Visualización y Flujo de Inscripción ---
  const [vistaDetalle, setVistaDetalle] = useState(null); 
  const [formInscripcion, setFormInscripcion] = useState(null);
  const [pasoForm, setPasoForm] = useState(1);
  const [enviado, setEnviado] = useState(false);
  
  const [formData, setFormData] = useState({
    cursoId: "",
    cursoNombre: "",
    estudianteNombre: "",
    estudianteDocumento: "",
    estudianteEdad: "",
    acudienteNombre: "",
    acudienteContacto: "",
    acudienteParentesco: "",
    horarioPreferencia: "",
    barrio: "",
    aceptaTerminos: false
  });

  const manejarVerDetalles = (curso) => {
    setFormInscripcion(null); 
    setVistaDetalle(curso);
    document.getElementById("como-inscribirse").scrollIntoView({ behavior: "smooth" });
  };

  const iniciarInscripcion = (e, curso) => {
    if (e) e.stopPropagation();
    setVistaDetalle(null); 
    setFormInscripcion(curso);
    setFormData((prev) => ({
      ...prev,
      cursoId: curso.id,
      cursoNombre: curso.nombre
    }));
    setPasoForm(1);
    setEnviado(false);

    document.getElementById("como-inscribirse").scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const siguientePaso = () => {
    if (pasoForm === 1 && Number(formData.estudianteEdad) >= 18) {
      setPasoForm(3);
    } else {
      setPasoForm((prev) => prev + 1);
    }
  };

  const anteriorPaso = () => {
    if (pasoForm === 3 && Number(formData.estudianteEdad) >= 18) {
      setPasoForm(1);
    } else {
      setPasoForm((prev) => prev - 1);
    }
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    console.log("Inscripción exitosa:", formData);
    setEnviado(true);
  };

  const urlWhatsApp = () => {
    const texto = `¡Hola! Me acabo de inscribir en el curso *${formData.cursoNombre}*.\nEstudiante: ${formData.estudianteNombre}\nHorario preferido: ${formData.horarioPreferencia}.`;
    return `https://wa.me/573000000000?text=${encodeURIComponent(texto)}`;
  };

  const urlWhatsAppConsulta = (cursoNombre) => {
    const texto = `¡Hola! Estoy viendo los detalles del curso *${cursoNombre}* en la página web y me gustaría recibir más información sobre los horarios y costos.`;
    return `https://wa.me/573000000000?text=${encodeURIComponent(texto)}`;
  };

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
          <span className="label-seccion label-rosado">Nuestros cursos</span>
          <h2 className="inscr-titulo">Elige tu camino</h2>
          <p className="inscr-subtitulo">Formación musical para todas las edades y niveles.</p>

          <div className="inscr-cursos-grid">
            {cursos.map((c) => (
              <div key={c.id} className="inscr-card">
                <div className="inscr-card-header">
                  <span className="inscr-card-emoji">{c.emoji}</span>
                  <span className="inscr-card-tagline">{c.tagline}</span>
                </div>

                <div className="inscr-card-body">
                  <h3 className="inscr-card-nombre">{c.nombre}</h3>
                  <ul className="inscr-card-lista">
                    {c.instrumentos.slice(0, 4).map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                    {c.instrumentos.length > 4 && (
                      <li className="inscr-card-mas">+{c.instrumentos.length - 4} más</li>
                    )}
                  </ul>
                  
                  <div className="inscr-card-actions">
                    <button 
                      className="inscr-card-btn-secundario"
                      onClick={() => manejarVerDetalles(c)}
                    >
                      Ver detalles
                    </button>
                    <button
                      className="inscr-card-btn-principal"
                      onClick={(e) => iniciarInscripcion(e, c)}
                    >
                      Inscribirme
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Zona Dinámica Interactiva: Guía / Detalles Didácticos / Formulario ── */}
      <section
        id="como-inscribirse"
        className="inscr-seccion inscr-seccion-foto"
        style={{
          backgroundImage: `linear-gradient(rgba(10,15,30,0.75), rgba(10,15,30,0.9)), url(${import.meta.env.BASE_URL}Nuestra_Historia.avif)`,
        }}
      >
        <div className="container">
          
          {/* CASO A: Estado inicial - Muestra los 4 pasos guía tradicionales */}
          {!formInscripcion && !vistaDetalle && (
            <>
              <span className="label-seccion label-rosado">Proceso</span>
              <h2 className="inscr-titulo">Cómo inscribirse</h2>
              <p className="inscr-subtitulo inscr-subtitulo-claro">
                Cuatro pasos simples para comenzar tu formación musical.
              </p>
              <div className="grid-4col inscr-pasos">
                {pasosGuia.map((p) => (
                  <div key={p.num} className="inscr-paso">
                    <div className="inscr-paso-num">{p.num}</div>
                    <h3 className="inscr-paso-titulo">{p.titulo}</h3>
                    <p className="inscr-paso-desc">{p.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CASO B: Ver Detalles Didáctico (Mismo estilo estético y paleta que el Formulario) */}
          {vistaDetalle && !formInscripcion && (
            <div className="inscr-form-container">
              <div className="inscr-form-header">
                <span className="inscr-form-badge" style={{ background: 'var(--color-rosado, #ff4a76)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Explorando: {vistaDetalle.nombre} {vistaDetalle.emoji}
                </span>
                <button 
                  className="inscr-form-cancelar"
                  onClick={() => setVistaDetalle(null)}
                >
                  ✕ Cerrar
                </button>
              </div>

              <div className="inscr-form-stepper" style={{ padding: '24px' }}>
                {/* Cabecera interna informativa */}
                <div style={{ marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.4rem' }}>{vistaDetalle.tagline}</h3>
                  <p style={{ color: '#ccc', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{vistaDetalle.descripcion || "Explora el contenido estructurado de este programa musical."}</p>
                </div>

                {/* Grid Dinámico de Información */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }} className="form-step-pane">
                  
                  {/* Bloque Izquierdo: Instrumentos/Áreas */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--color-rosado, #ff4a76)' }}>¿Qué aprenderás?</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {vistaDetalle.instrumentos.map((inst, index) => (
                        <span key={index} style={{ background: 'rgba(255, 74, 118, 0.15)', border: '1px solid rgba(255, 74, 118, 0.3)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                          🎸 {inst}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bloque Derecho: Metodología y Enfoque */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--color-rosado, #ff4a76)' }}>Modalidad e Intensidad</label>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.9rem', color: '#ddd', lineHeight: '1.5' }}>
                      <div><strong>Sede:</strong> Sector Estadio, Medellín.</div>
                      <div><strong>Duración regular:</strong> 6 Meses.</div>
                      <div><strong>Enfoque:</strong> Didáctico, vivencial y de proyección artística.</div>
                    </div>
                  </div>
                </div>

                {/* Acciones de la parte inferior */}
                <div className="form-actions-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button type="button" className="btn-atras" style={{ marginRight: 'auto' }} onClick={() => setVistaDetalle(null)}>
                    Volver a Cursos
                  </button>

                  <a 
                    href={urlWhatsAppConsulta(vistaDetalle.nombre)}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-success-wa"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      textDecoration: 'none', 
                      padding: '11px 22px', 
                      fontSize: '0.9rem',
                      background: '#25D366',
                      color: '#fff',
                      borderRadius: '6px',
                      fontWeight: '600'
                    }}
                  >
                    Preguntar por WhatsApp 💬
                  </a>

                  <button
                    type="button"
                    className="btn-enviar-final"
                    style={{ background: 'var(--color-rosado, #ff4a76)', margin: 0 }}
                    onClick={() => iniciarInscripcion(null, vistaDetalle)}
                  >
                    Inscribirme ya ✓
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASO C: Formulario de Inscripción Dinámico en Pasos */}
          {formInscripcion && (
            <div className="inscr-form-container">
              <div className="inscr-form-header">
                <span className="inscr-form-badge">
                  Curso: {formInscripcion.nombre}
                </span>
                <button 
                  className="inscr-form-cancelar"
                  onClick={() => setFormInscripcion(null)}
                >
                  ✕ Cancelar
                </button>
              </div>

              {!enviado ? (
                <form onSubmit={manejarEnvio} className="inscr-form-stepper">
                  <div className="stepper-progress">
                    <div className={`step-pill ${pasoForm >= 1 ? "activo" : ""}`}>1. Datos</div>
                    {Number(formData.estudianteEdad) < 18 && (
                      <div className={`step-pill ${pasoForm >= 2 ? "activo" : ""}`}>2. Acudiente</div>
                    )}
                    <div className={`step-pill ${pasoForm >= 3 ? "activo" : ""}`}>3. Horario</div>
                  </div>

                  {pasoForm === 1 && (
                    <div className="form-step-pane">
                      <h3>Información del Estudiante</h3>
                      <div className="form-group">
                        <label>Nombre Completo *</label>
                        <input
                          type="text"
                          name="estudianteNombre"
                          required
                          value={formData.estudianteNombre}
                          onChange={handleChange}
                          placeholder="Ej. Juan Pérez"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Documento *</label>
                          <input
                            type="text"
                            name="estudianteDocumento"
                            required
                            value={formData.estudianteDocumento}
                            onChange={handleChange}
                            placeholder="TI / CC"
                          />
                        </div>
                        <div className="form-group">
                          <label>Edad *</label>
                          <input
                            type="number"
                            name="estudianteEdad"
                            required
                            value={formData.estudianteEdad}
                            onChange={handleChange}
                            placeholder="Años"
                          />
                        </div>
                      </div>
                      <div className="form-actions-footer">
                        <button
                          type="button"
                          className="btn-sgte"
                          disabled={!formData.estudianteNombre || !formData.estudianteDocumento || !formData.estudianteEdad}
                          onClick={siguientePaso}
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  )}

                  {pasoForm === 2 && (
                    <div className="form-step-pane">
                      <h3>Datos del Responsable</h3>
                      <div className="form-group">
                        <label>Nombre del Acudiente *</label>
                        <input
                          type="text"
                          name="acudienteNombre"
                          required={Number(formData.estudianteEdad) < 18}
                          value={formData.acudienteNombre}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Teléfono *</label>
                          <input
                            type="tel"
                            name="acudienteContacto"
                            required={Number(formData.estudianteEdad) < 18}
                            value={formData.acudienteContacto}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Parentesco *</label>
                          <select
                            name="acudienteParentesco"
                            required={Number(formData.estudianteEdad) < 18}
                            value={formData.acudienteParentesco}
                            onChange={handleChange}
                          >
                            <option value="">Selecciona...</option>
                            <option value="Madre">Madre</option>
                            <option value="Padre">Padre</option>
                            <option value="Tutor">Tutor Legal</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions-footer">
                        <button type="button" className="btn-atras" onClick={anteriorPaso}>Atrás</button>
                        <button
                          type="button"
                          className="btn-sgte"
                          disabled={!formData.acudienteNombre || !formData.acudienteContacto || !formData.acudienteParentesco}
                          onClick={siguientePaso}
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  )}

                  {pasoForm === 3 && (
                    <div className="form-step-pane">
                      <h3>Preferencias de Horario</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Preferencia Horaria *</label>
                          <select
                            name="horarioPreferencia"
                            required
                            value={formData.horarioPreferencia}
                            onChange={handleChange}
                          >
                            <option value="">Selecciona una opción...</option>
                            <option value="Mañana">Mañana</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Sábados">Sábados</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Barrio</label>
                          <input
                            type="text"
                            name="barrio"
                            value={formData.barrio}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="aceptaTerminos"
                            required
                            checked={formData.aceptaTerminos}
                            onChange={handleChange}
                          />
                          Acepto los términos y la política de datos personales.
                        </label>
                      </div>

                      <div className="form-actions-footer">
                        <button type="button" className="btn-atras" onClick={anteriorPaso}>Atrás</button>
                        <button
                          type="submit"
                          className="btn-enviar-final"
                          disabled={!formData.horarioPreferencia || !formData.aceptaTerminos}
                        >
                          Finalizar Inscripción ✓
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="form-success-pane">
                  <div className="success-icon">🎉</div>
                  <h2>¡Inscripción Iniciada!</h2>
                  <p>Hola <strong>{formData.estudianteNombre}</strong>, registramos tu cupo para <strong>{formData.cursoNombre}</strong>.</p>
                  <div className="success-actions">
                    <a href={urlWhatsApp()} target="_blank" rel="noopener noreferrer" className="btn-success-wa">
                      Acelerar por WhatsApp
                    </a>
                    <button
                      className="btn-success-limpiar"
                      onClick={() => {
                        setFormInscripcion(null);
                        setFormData({
                          cursoId: "", cursoNombre: "", estudianteNombre: "", estudianteDocumento: "",
                          estudianteEdad: "", acudienteNombre: "", acudienteContacto: "",
                          acudienteParentesco: "", horarioPreferencia: "", barrio: "", aceptaTerminos: false
                        });
                      }}
                    >
                      Volver a los cursos
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="inscr-seccion">
        <div className="container inscr-faq-container">
          <span className="label-seccion label-rosado">Preguntas frecuentes</span>
          <h2 className="inscr-titulo">¿Tienes dudas?</h2>
          <p className="inscr-subtitulo">Todo lo que necesitas saber antes de inscribirte.</p>
          <div className="inscr-faq-lista">
            {faqs.map((faq, i) => (
              <div key={i} className="inscr-faq-item">
                <button
                  className="inscr-faq-pregunta"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <span className={`inscr-faq-chevron${openFaq === i ? " abierto" : ""}`}>▾</span>
                </button>
                {openFaq === i && <p className="inscr-faq-respuesta">{faq.r}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
