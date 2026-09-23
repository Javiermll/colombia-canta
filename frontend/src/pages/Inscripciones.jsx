import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCursos } from "../hooks/useCursos";
import Footer from "../components/Footer/Footer";
import "../styles/main.css";
import { BASE_URL, OG_IMAGE } from "../utils/seo";
import { apiFetch } from "../utils/api";
import { formatCOP } from "../utils/formato";

const PAGE_TITLE = "Inscripciones | Colombia Canta y Encanta";
const PAGE_DESC =
  "Inscríbete en la escuela de música de Colombia Canta y Encanta. Cursos vocales, teatro musical, instrumento personalizado e iniciación musical en Medellín.";

const WHATSAPP_NUMERO = "573015315119";

const pasos = [
  {
    num: "1",
    titulo: "Elige tu curso",
    desc: "Revisa los cursos disponibles y selecciona el que más te interese según tu nivel y horario.",
  },
  {
    num: "2",
    titulo: "Completa el formulario",
    desc: "Llena el formulario de inscripción aquí mismo, paso a paso, con los datos del estudiante.",
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
    r: (
      <>
        <p>Sí, contamos con los siguientes descuentos disponibles:</p>
        <ul className="inscr-faq-descuentos-lista">
          <li>
            <span>Hijos de empleados del <strong>Grupo EPM</strong></span>
            <span className="inscr-faq-descuento-pct">20% de descuento</span>
          </li>
          <li>
            <span>Hijos de empleados de la <strong>Alcaldía de Medellín</strong></span>
            <span className="inscr-faq-descuento-pct">15% de descuento</span>
          </li>
          <li>
            <span>Afiliados a <strong>Comfama</strong></span>
            <span className="inscr-faq-descuento-pct">10% de descuento</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "¿Dónde son las clases?",
    r: "En nuestra sede del Sector Estadio, Calle 49 76a 65, Medellín.",
  },
];

const FORM_DATA_INICIAL = {
  cursoId: "",
  cursoNombre: "",
  estudianteNombre: "",
  estudianteDocumento: "",
  estudianteEdad: "",
  estudianteEmail: "",
  estudianteTelefono: "",
  acudienteNombre: "",
  acudienteContacto: "",
  acudienteParentesco: "",
  acudienteEmail: "",
  horarioPreferencia: "",
  barrio: "",
  aceptaTerminos: false,
};

const WAIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Inscripciones() {
  const { cursos, cargando, error } = useCursos();
  const [openFaq, setOpenFaq] = useState(null);
  const [pasoIdx, setPasoIdx] = useState(0);
  // Carrusel de cursos (≤1024px): 1 tarjeta a la vez en mobile, 2 en tablet
  // — pedido del usuario (2026-09-05), mismo criterio de "detectar el ancho
  // con matchMedia" ya usado en Escuela.jsx/Nosotros.jsx.
  const [cardsPorPagina, setCardsPorPagina] = useState(1);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 600px) and (max-width: 1024px)');
    const actualizar = () => setCardsPorPagina(mq.matches ? 2 : 1);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, []);

  // Pedido del usuario (2026-09-05): en mobile la foto se saca por completo
  // (todas las tarjetas quedan simétricas con el mismo respaldo de emoji,
  // en vez de mezclar tarjetas altas-con-foto y bajas-sin-foto en el mismo
  // carrusel de a 1). Tablet/desktop sí la siguen mostrando.
  const [esMobile, setEsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 599px)');
    const actualizar = () => setEsMobile(mq.matches);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, []);

  const paginasCursos = useMemo(() => {
    const grupos = [];
    for (let i = 0; i < cursos.length; i += cardsPorPagina) grupos.push(cursos.slice(i, i + cardsPorPagina));
    return grupos;
  }, [cursos, cardsPorPagina]);

  const [carruselPaginaIdx, setCarruselPaginaIdx] = useState(0);
  useEffect(() => {
    setCarruselPaginaIdx(0);
  }, [cardsPorPagina]);

  // ── Flujo de inscripción: ver detalles de un curso, o llenar el formulario ──
  const [vistaDetalle, setVistaDetalle] = useState(null);
  const [formInscripcion, setFormInscripcion] = useState(null);
  const [pasoForm, setPasoForm] = useState(1);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [formData, setFormData] = useState(FORM_DATA_INICIAL);

  const esMenor = Number(formData.estudianteEdad) < 18;
  const cursoIdx = vistaDetalle ? cursos.findIndex((c) => c.id === vistaDetalle.id) : -1;

  const manejarVerDetalles = (curso) => {
    setFormInscripcion(null);
    setVistaDetalle(curso);
  };

  const iniciarInscripcion = (curso) => {
    setVistaDetalle(null);
    setFormInscripcion(curso);
    setFormData((prev) => ({ ...prev, cursoId: curso.id, cursoNombre: curso.nombre }));
    setPasoForm(1);
    setEnviado(false);
  };

  const cancelarFormulario = () => {
    setFormInscripcion(null);
    setFormData(FORM_DATA_INICIAL);
    setErrorEnvio(null);
  };

  // Modal (pedido del usuario, 2026-09-06): "Ver detalles"/"Inscribirme" pasan
  // de reemplazar el contenido de "Cómo inscribirse" a flotar como ventana
  // desplegable encima de toda la página — mismo patrón ya usado en
  // ReservaModal (overlay con click-afuera-para-cerrar + Escape + bloqueo de
  // scroll del body, bottom-sheet en mobile vía CSS).
  const modalAbierto = !!(vistaDetalle || formInscripcion);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!modalAbierto) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [modalAbierto]);

  useEffect(() => {
    if (!modalAbierto) return;
    const onKey = (e) => { if (e.key === 'Escape') cerrarModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalAbierto]);

  function cerrarModal() {
    if (formInscripcion) cancelarFormulario();
    else setVistaDetalle(null);
  }

  const manejarClickOverlay = (e) => {
    if (e.target === overlayRef.current) cerrarModal();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const siguientePaso = () => {
    setPasoForm((prev) => (prev === 1 && !esMenor ? 3 : prev + 1));
  };

  const anteriorPaso = () => {
    setPasoForm((prev) => (prev === 3 && !esMenor ? 1 : prev - 1));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorEnvio(null);
    setEnviando(true);

    const payload = {
      curso_id: formData.cursoId,
      estudiante_nombre: formData.estudianteNombre,
      estudiante_documento: formData.estudianteDocumento,
      estudiante_edad: Number(formData.estudianteEdad),
      horario_preferencia: formData.horarioPreferencia,
      acepta_terminos: formData.aceptaTerminos,
    };
    if (formData.estudianteEmail) payload.estudiante_email = formData.estudianteEmail;
    if (formData.estudianteTelefono) payload.estudiante_telefono = formData.estudianteTelefono;
    if (formData.barrio) payload.barrio = formData.barrio;
    if (esMenor) {
      payload.acudiente_nombre = formData.acudienteNombre;
      payload.acudiente_contacto = formData.acudienteContacto;
      payload.acudiente_parentesco = formData.acudienteParentesco;
      if (formData.acudienteEmail) payload.acudiente_email = formData.acudienteEmail;
    }

    try {
      await apiFetch("/api/inscripciones", { method: "POST", body: payload });
      setEnviado(true);
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const urlWhatsAppConsulta = (cursoNombre) => {
    const texto = `¡Hola! Estoy viendo los detalles del curso *${cursoNombre}* en la página web y me gustaría recibir más información sobre horarios y costos.`;
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
  };

  const urlWhatsAppInscripcion = () => {
    const lineas = [
      `¡Hola! Me acabo de inscribir en el curso *${formData.cursoNombre}*.`,
      `Estudiante: ${formData.estudianteNombre} (${formData.estudianteEdad} años)`,
    ];
    if (esMenor) {
      lineas.push(`Acudiente: ${formData.acudienteNombre} · ${formData.acudienteParentesco}`);
    }
    lineas.push(`Horario preferido: ${formData.horarioPreferencia}`);
    if (formData.barrio) lineas.push(`Barrio: ${formData.barrio}`);
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(lineas.join("\n"))}`;
  };

  // Reutilizada por el grid (tablet/desktop) y el carrusel (mobile, <600px) —
  // misma tarjeta, sin duplicar el markup entre los 2 layouts.
  //
  // Rediseño simplificado (pedido del usuario, 2026-09-06): la tarjeta de
  // presentación pasa a ser una tarjeta "de contenido" — sin la lista de
  // instrumentos, el badge "Clases personalizadas" ni la duración (los 3 ya
  // están en "Ver detalles"), sin el emoji en mobile (se saca del todo, ni
  // foto ni emoji ahí — en cambio lleva un acento de color propio arriba,
  // ver `.inscr-card-acento-mobile`), y con la franja tricolor corta entre
  // título y descripción como detalle visual. El tagline pasa de pastilla
  // flotando sobre la foto a un antetítulo simple arriba del título — se
  // sentía desordenado flotando, sobre todo en tablet.
  const renderTarjetaCurso = (c) => {
    const mostrarFoto = !!c.imagen;

    return (
    <div className="inscr-card">
      {/* Acento de color del curso — solo visible en mobile (CSS), donde ya
         no hay foto ni emoji para darle identidad visual a la tarjeta
         (pedido del usuario, 2026-09-06: mobile se veía "simple"). */}
      <div className="inscr-card-acento-mobile" style={{ background: c.color || 'var(--coral)' }} aria-hidden="true" />

      {!esMobile && (
        mostrarFoto ? (
          <div className="inscr-card-foto-wrap">
            <img src={c.imagen} alt="" className="inscr-card-foto" loading="lazy" decoding="async" />
          </div>
        ) : (
          <div
            className="inscr-card-header"
            style={c.color ? { background: `color-mix(in srgb, ${c.color} 14%, transparent)` } : undefined}
          >
            <span className="inscr-card-icono" aria-hidden="true">{c.emoji || "🎵"}</span>
          </div>
        )
      )}

      <div className="inscr-card-body">
        {c.tagline && <span className="inscr-card-tagline">{c.tagline}</span>}
        <h3 className="inscr-card-nombre">{c.nombre}</h3>
        <div className="inscr-card-franja" aria-hidden="true" />
        {c.descripcion && <p className="inscr-card-desc">{c.descripcion}</p>}

        <div className="inscr-card-acciones">
          <button
            type="button"
            className="inscr-card-btn"
            onClick={() => manejarVerDetalles(c)}
          >
            Ver detalles
          </button>
          <button
            type="button"
            className="inscr-card-btn inscr-card-btn-solido"
            onClick={() => iniciarInscripcion(c)}
          >
            Inscribirme
          </button>
        </div>
      </div>
    </div>
    );
  };

  // Franjas reales del curso ya configuradas por el admin, para que el
  // horario sea seleccionable en vez de un texto libre o 3 opciones fijas
  // genéricas (2026-08-19, pedido del usuario). Solo si no hay ninguna franja
  // cargada (personalizado sin horario fijo) queda el texto libre de respaldo.
  const opcionesHorario = (formInscripcion?.horarios || []).map((h) => (h.edad ? `${h.edad} · ${h.dia} · ${h.hora}` : `${h.dia} · ${h.hora}`));

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
          <h2 className="inscr-titulo">Elige tu camino</h2>
          <p className="inscr-subtitulo">
            Formación musical para todas las edades y niveles.
          </p>

          {cargando && <p className="inscr-estado">Cargando cursos…</p>}
          {!cargando && error && <p className="inscr-estado">No se pudieron cargar los cursos. Intenta de nuevo más tarde.</p>}
          {!cargando && !error && cursos.length === 0 && (
            <p className="inscr-estado">Aún no hay cursos publicados. Vuelve pronto.</p>
          )}

          {!cargando && !error && cursos.length > 0 && (
          <>
          {/* Tablet/Desktop: grid */}
          <div className="inscr-cursos-grid">
            {cursos.map((c) => <div key={c.id}>{renderTarjetaCurso(c)}</div>)}
          </div>

          {/* ≤1024px: carrusel paginado — 1 tarjeta a la vez en mobile, 2 en
             tablet (pedido del usuario, 2026-09-05), en vez de la lista larga
             hacia abajo que quedaba en el grid a ese ancho. */}
          <div className="inscr-cursos-carrusel">
            <button
              className="inscr-pasos-nav inscr-pasos-nav-prev"
              onClick={() => setCarruselPaginaIdx((i) => Math.max(0, i - 1))}
              disabled={carruselPaginaIdx === 0}
              aria-label="Cursos anteriores"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            {/* Pedido del usuario (2026-09-05): si la última página queda con
               menos tarjetas que `cardsPorPagina` (ej. 1 sola en un carrusel
               de a 2), no debe estirarse a ocupar toda la fila — se ve
               "gigante" comparada con las demás páginas. */}
            <div className={`inscr-cursos-carrusel-fila${
              cardsPorPagina === 1 ? ' inscr-cursos-carrusel-fila--uno' : ''
            }${
              (paginasCursos[carruselPaginaIdx]?.length || 0) < cardsPorPagina ? ' inscr-cursos-carrusel-fila--incompleta' : ''
            }`}>
              {(paginasCursos[carruselPaginaIdx] || []).map((c) => (
                <div key={c.id}>{renderTarjetaCurso(c)}</div>
              ))}
            </div>

            <button
              className="inscr-pasos-nav inscr-pasos-nav-next"
              onClick={() => setCarruselPaginaIdx((i) => Math.min(paginasCursos.length - 1, i + 1))}
              disabled={carruselPaginaIdx === paginasCursos.length - 1}
              aria-label="Más cursos"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <div className="inscr-pasos-dots">
              {paginasCursos.map((pagina, i) => (
                <button
                  key={pagina[0]?.id ?? i}
                  className={`inscr-pasos-dot${i === carruselPaginaIdx ? ' activo' : ''}`}
                  onClick={() => setCarruselPaginaIdx(i)}
                  aria-label={`Ver página ${i + 1} de cursos`}
                />
              ))}
            </div>
          </div>
          </>
          )}
        </div>
      </section>

      {/* ── Cómo inscribirse — guía / detalle del curso / formulario ── */}
      <section
        id="como-inscribirse"
        className="inscr-seccion inscr-seccion-foto"
        style={{
          backgroundImage: `linear-gradient(rgba(10,15,30,0.62), rgba(10,15,30,0.82)), url(${import.meta.env.BASE_URL}Nuestra_Historia.avif)`,
        }}
      >
        <div className="container">
          {/* Pedido del usuario (2026-09-06): esta guía se queda siempre
             visible — "Ver detalles"/"Inscribirme" ya no la reemplazan
             acá, ahora abren una ventana desplegable flotante (ver el
             overlay más abajo, después de esta sección). */}
          <span className="label-seccion label-rojo">Proceso</span>
          <h2 className="inscr-titulo">Cómo inscribirse</h2>
              <p className="inscr-subtitulo inscr-subtitulo-claro">
                Cuatro pasos simples para comenzar tu formación musical.
              </p>
              {/* Desktop: grid de 4 columnas */}
              <div className="grid-4col inscr-pasos">
                {pasos.map((p) => (
                  <div key={p.num} className="inscr-paso">
                    <div className="inscr-paso-num">{p.num}</div>
                    <h3 className="inscr-paso-titulo">{p.titulo}</h3>
                    <p className="inscr-paso-desc">{p.desc}</p>
                  </div>
                ))}
              </div>

              {/* Tablet/Mobile: carrusel */}
              <div className="inscr-pasos-carrusel">
                <button
                  className="inscr-pasos-nav inscr-pasos-nav-prev"
                  onClick={() => setPasoIdx(i => Math.max(0, i - 1))}
                  disabled={pasoIdx === 0}
                  aria-label="Paso anterior"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>

                <div className="inscr-pasos-card">
                  <div className="inscr-paso-num">{pasos[pasoIdx].num}</div>
                  <h3 className="inscr-paso-titulo">{pasos[pasoIdx].titulo}</h3>
                  <p className="inscr-paso-desc">{pasos[pasoIdx].desc}</p>
                </div>

                <button
                  className="inscr-pasos-nav inscr-pasos-nav-next"
                  onClick={() => setPasoIdx(i => Math.min(pasos.length - 1, i + 1))}
                  disabled={pasoIdx === pasos.length - 1}
                  aria-label="Paso siguiente"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>

                <div className="inscr-pasos-dots">
                  {pasos.map((_, i) => (
                    <button
                      key={i}
                      className={`inscr-pasos-dot${i === pasoIdx ? ' activo' : ''}`}
                      onClick={() => setPasoIdx(i)}
                      aria-label={`Paso ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

          {vistaDetalle && !formInscripcion && (
            <div className="icm-overlay" ref={overlayRef} onClick={manejarClickOverlay}>
            <div className="inscr-detalle-wrapper">
              <button
                className="inscr-nav-curso inscr-nav-lateral"
                onClick={() => setVistaDetalle(cursos[cursoIdx - 1])}
                disabled={cursoIdx <= 0}
                aria-label="Curso anterior"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>

              <div className="inscr-detalle">
                {/* Botón cerrar como hijo directo de la tarjeta (no del
                   header de texto) — flota sobre la esquina superior de la
                   foto. Hallazgo real (pedido del usuario, 2026-09-07): antes
                   vivía dentro de `.inscr-detalle-header`, posicionado
                   relativo a ESE bloque (que empieza justo después de la
                   foto) — en mobile eso coincidía casi exacto con la flecha
                   "siguiente" (centrada al 50% de la altura total de la
                   tarjeta), superponiéndose. Ahora se ancla al borde superior
                   de la tarjeta entera, lejos de esa flecha sin importar
                   cuánto mida el contenido de abajo. */}
                <button
                  className="inscr-detalle-cerrar"
                  onClick={() => setVistaDetalle(null)}
                  aria-label="Cerrar detalle"
                >
                  ✕
                </button>
                {/* Reemplaza el ícono de emoji (pedido del usuario,
                   2026-09-06) — la foto ya es obligatoria en el admin, así
                   que siempre debería haber una para mostrar acá. */}
                {vistaDetalle.imagen && (
                  <div className="inscr-detalle-foto-wrap">
                    <img src={vistaDetalle.imagen} alt="" className="inscr-detalle-foto" />
                  </div>
                )}
                <div className="inscr-detalle-header">
                  <div className="inscr-detalle-header-texto">
                    <span className="inscr-detalle-tagline">{vistaDetalle.tagline}</span>
                    {/* Franja tricolor corta entre antetítulo y título — mismo
                       lenguaje visual que el resto del sitio, pedido del
                       usuario (2026-09-06) para este desplegable en todas
                       las responsividades. */}
                    <div className="inscr-detalle-franja" aria-hidden="true" />
                    <h3 className="inscr-detalle-nombre">{vistaDetalle.nombre}</h3>
                  </div>
                </div>

                <div className="inscr-detalle-body">
                  <p className="inscr-detalle-desc">{vistaDetalle.descripcion}</p>

                  {vistaDetalle.esPersonalizado && (
                    <div className="inscr-detalle-grupo">
                      <span className="inscr-detalle-grupo-label">Profesor</span>
                      <p className="inscr-detalle-profesor">
                        👤 {vistaDetalle.profesorNombre || 'Se coordina al inscribirte'} · clases personalizadas 1 a 1
                      </p>
                    </div>
                  )}

                  {vistaDetalle.instrumentos?.length > 0 && (
                    <div className="inscr-detalle-grupo">
                      <span className="inscr-detalle-grupo-label">Modalidades</span>
                      <div className="inscr-detalle-chips">
                        {vistaDetalle.instrumentos.map((i) => (
                          <span key={i} className="inscr-detalle-chip inscr-detalle-chip-outline">
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="inscr-detalle-grupo inscr-detalle-grupo-niveles">
                    <span className="inscr-detalle-grupo-label">Niveles disponibles</span>
                    <div className="inscr-detalle-chips">
                      {[...vistaDetalle.niveles].sort((a, b) => a.orden - b.orden).map((n) => (
                        <span key={n.id} className="inscr-detalle-chip inscr-detalle-chip-outline">
                          {n.nombre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {vistaDetalle.horarios?.length > 0 && (
                    <div className="inscr-detalle-grupo">
                      <span className="inscr-detalle-grupo-label">Horarios</span>
                      <div className="inscr-detalle-horarios">
                        {vistaDetalle.horarios.map((h, i) => (
                          <div key={i} className="inscr-detalle-horario-fila">
                            {h.edad && <span className="inscr-detalle-edad">{h.edad}</span>}
                            <span className="inscr-detalle-dia">{h.dia}</span>
                            <span className="inscr-detalle-hora">{h.hora}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="inscr-detalle-meta">
                    <div className="inscr-detalle-meta-item">
                      <span className="inscr-detalle-meta-label">Duración</span>
                      <span className="inscr-detalle-meta-valor">{vistaDetalle.duracion}</span>
                    </div>
                    <div className="inscr-detalle-meta-item">
                      <span className="inscr-detalle-meta-label">Inversión</span>
                      <span className="inscr-detalle-meta-valor">{vistaDetalle.precio}</span>
                    </div>
                    {vistaDetalle.matriculaNumerico && (
                      <div className="inscr-detalle-meta-item">
                        <span className="inscr-detalle-meta-label">Matrícula anual</span>
                        <span className="inscr-detalle-meta-valor">{formatCOP(vistaDetalle.matriculaNumerico)}</span>
                      </div>
                    )}
                  </div>

                  <div className="inscr-detalle-acciones">
                    <a
                      href={urlWhatsAppConsulta(vistaDetalle.nombre)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-oscuro"
                    >
                      <WAIcon /> Preguntar por WhatsApp
                    </a>
                    <button
                      type="button"
                      className="btn btn-solido-oscuro"
                      onClick={() => iniciarInscripcion(vistaDetalle)}
                    >
                      Inscribirme ahora →
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="inscr-nav-curso inscr-nav-lateral"
                onClick={() => setVistaDetalle(cursos[cursoIdx + 1])}
                disabled={cursoIdx >= cursos.length - 1}
                aria-label="Siguiente curso"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>

              <div className="inscr-nav-mobile-row">
                <button
                  className="inscr-nav-curso"
                  onClick={() => setVistaDetalle(cursos[cursoIdx - 1])}
                  disabled={cursoIdx <= 0}
                  aria-label="Curso anterior"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                <button
                  className="inscr-nav-curso"
                  onClick={() => setVistaDetalle(cursos[cursoIdx + 1])}
                  disabled={cursoIdx >= cursos.length - 1}
                  aria-label="Siguiente curso"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
            </div>
          )}

          {formInscripcion && (
            <div className="icm-overlay" ref={overlayRef} onClick={manejarClickOverlay}>
            <div className="inscr-form">
              <div className="inscr-form-header">
                <span className="inscr-form-badge">{formInscripcion.nombre}</span>
                {!enviado && (
                  <button type="button" className="inscr-form-cerrar" onClick={cancelarFormulario}>
                    ✕ Cancelar
                  </button>
                )}
              </div>

              {!enviado ? (
                <form onSubmit={manejarEnvio} className="inscr-form-body">
                  <div className="inscr-stepper-progress">
                    <span className={`inscr-step-pill${pasoForm >= 1 ? " activo" : ""}`}>1. Datos</span>
                    {esMenor && (
                      <span className={`inscr-step-pill${pasoForm >= 2 ? " activo" : ""}`}>2. Acudiente</span>
                    )}
                    <span className={`inscr-step-pill${pasoForm >= 3 ? " activo" : ""}`}>
                      {esMenor ? "3" : "2"}. Horario
                    </span>
                  </div>

                  {pasoForm === 1 && (
                    <div className="inscr-form-paso">
                      <h3>Información del estudiante</h3>
                      <div className="inscr-form-grupo">
                        <label htmlFor="insc-estudiante-nombre">Nombre completo *</label>
                        <input
                          id="insc-estudiante-nombre"
                          type="text"
                          name="estudianteNombre"
                          required
                          value={formData.estudianteNombre}
                          onChange={handleChange}
                          placeholder="Ej. Juan Pérez"
                        />
                      </div>
                      <div className="inscr-form-fila">
                        <div className="inscr-form-grupo">
                          <label htmlFor="insc-estudiante-documento">Documento *</label>
                          <input
                            id="insc-estudiante-documento"
                            type="text"
                            name="estudianteDocumento"
                            required
                            value={formData.estudianteDocumento}
                            onChange={handleChange}
                            placeholder="TI / CC"
                          />
                        </div>
                        <div className="inscr-form-grupo">
                          <label htmlFor="insc-estudiante-edad">Edad *</label>
                          <input
                            id="insc-estudiante-edad"
                            type="number"
                            name="estudianteEdad"
                            required
                            min="1"
                            max="120"
                            value={formData.estudianteEdad}
                            onChange={handleChange}
                            placeholder="Años"
                          />
                        </div>
                      </div>
                      <div className="inscr-form-fila">
                        <div className="inscr-form-grupo">
                          <label htmlFor="insc-estudiante-email">Email</label>
                          <input
                            id="insc-estudiante-email"
                            type="email"
                            name="estudianteEmail"
                            value={formData.estudianteEmail}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                        <div className="inscr-form-grupo">
                          <label htmlFor="insc-estudiante-telefono">Teléfono</label>
                          <input
                            id="insc-estudiante-telefono"
                            type="tel"
                            name="estudianteTelefono"
                            value={formData.estudianteTelefono}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="inscr-form-acciones">
                        <button
                          type="button"
                          className="btn btn-solido-oscuro"
                          disabled={!formData.estudianteNombre || !formData.estudianteDocumento || !formData.estudianteEdad}
                          onClick={siguientePaso}
                        >
                          Continuar →
                        </button>
                      </div>
                    </div>
                  )}

                  {pasoForm === 2 && esMenor && (
                    <div className="inscr-form-paso">
                      <h3>Datos del acudiente</h3>
                      <div className="inscr-form-grupo">
                        <label htmlFor="insc-acudiente-nombre">Nombre del acudiente *</label>
                        <input
                          id="insc-acudiente-nombre"
                          type="text"
                          name="acudienteNombre"
                          required
                          value={formData.acudienteNombre}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="inscr-form-fila">
                        <div className="inscr-form-grupo">
                          <label htmlFor="insc-acudiente-contacto">Teléfono *</label>
                          <input
                            id="insc-acudiente-contacto"
                            type="tel"
                            name="acudienteContacto"
                            required
                            value={formData.acudienteContacto}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="inscr-form-grupo">
                          <label htmlFor="insc-acudiente-parentesco">Parentesco *</label>
                          <select
                            id="insc-acudiente-parentesco"
                            name="acudienteParentesco"
                            required
                            value={formData.acudienteParentesco}
                            onChange={handleChange}
                          >
                            <option value="">Selecciona...</option>
                            <option value="Madre">Madre</option>
                            <option value="Padre">Padre</option>
                            <option value="Tutor legal">Tutor legal</option>
                          </select>
                        </div>
                      </div>
                      <div className="inscr-form-grupo">
                        <label htmlFor="insc-acudiente-email">Email del acudiente</label>
                        <input
                          id="insc-acudiente-email"
                          type="email"
                          name="acudienteEmail"
                          value={formData.acudienteEmail}
                          onChange={handleChange}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      <div className="inscr-form-acciones">
                        <button type="button" className="btn btn-outline-oscuro" onClick={anteriorPaso}>
                          ← Atrás
                        </button>
                        <button
                          type="button"
                          className="btn btn-solido-oscuro"
                          disabled={!formData.acudienteNombre || !formData.acudienteContacto || !formData.acudienteParentesco}
                          onClick={siguientePaso}
                        >
                          Continuar →
                        </button>
                      </div>
                    </div>
                  )}

                  {pasoForm === 3 && (
                    <div className="inscr-form-paso">
                      <h3>Preferencias de horario</h3>
                      <div className="inscr-form-fila">
                        <div className="inscr-form-grupo">
                          <label htmlFor="insc-horario">{opcionesHorario.length > 0 ? 'Horario *' : 'Horario a coordinar *'}</label>
                          {opcionesHorario.length > 0 ? (
                            <select
                              id="insc-horario"
                              name="horarioPreferencia"
                              required
                              value={formData.horarioPreferencia}
                              onChange={handleChange}
                            >
                              <option value="">Selecciona una opción...</option>
                              {opcionesHorario.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id="insc-horario"
                              type="text"
                              name="horarioPreferencia"
                              required
                              value={formData.horarioPreferencia}
                              onChange={handleChange}
                              placeholder="Ej. Martes en la tarde, o el horario que te sirva"
                            />
                          )}
                        </div>
                        <div className="inscr-form-grupo">
                          <label htmlFor="insc-barrio">Barrio</label>
                          <input
                            id="insc-barrio"
                            type="text"
                            name="barrio"
                            value={formData.barrio}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <label className="inscr-checkbox-label">
                        <input
                          type="checkbox"
                          name="aceptaTerminos"
                          required
                          checked={formData.aceptaTerminos}
                          onChange={handleChange}
                        />
                        Acepto los{' '}
                        <Link to="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer">términos y condiciones</Link>
                        {' '}y la política de datos personales.
                      </label>

                      {errorEnvio && (
                        <p className="inscr-form-error">{errorEnvio}</p>
                      )}

                      <div className="inscr-form-acciones">
                        <button type="button" className="btn btn-outline-oscuro" onClick={anteriorPaso} disabled={enviando}>
                          ← Atrás
                        </button>
                        {/* ⭐ Hallazgo real (auditoría de accesibilidad, Fase 6,
                           2026-09-09): antes se deshabilitaba también por
                           horario/T&C sin aceptar — un botón `disabled` sale
                           del orden de tabulación, así que un usuario de
                           teclado nunca llegaba a enterarse de qué faltaba.
                           Este formulario SÍ usa validación nativa del
                           navegador (`required`, sin `noValidate` en el
                           `<form>` de arriba) — dejar el botón siempre
                           alcanzable deja que el navegador muestre su propio
                           aviso accesible apuntando al campo real que falta. */}
                        <button
                          type="submit"
                          className="btn btn-solido-oscuro"
                          disabled={enviando}
                        >
                          {enviando ? "Enviando…" : "Finalizar inscripción ✓"}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="inscr-exito">
                  <span className="inscr-exito-icono">🎉</span>
                  <h3>¡Inscripción registrada!</h3>
                  <p>
                    Hola <strong>{formData.estudianteNombre}</strong>, dejamos registrado tu cupo para{" "}
                    <strong>{formData.cursoNombre}</strong>. Para confirmarlo, escríbenos por WhatsApp con
                    un solo clic.
                  </p>
                  <div className="inscr-exito-acciones">
                    <a
                      href={urlWhatsAppInscripcion()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-solido-oscuro"
                    >
                      <WAIcon /> Confirmar por WhatsApp
                    </a>
                    <button type="button" className="btn btn-outline-oscuro" onClick={cancelarFormulario}>
                      Volver a los cursos
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}
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
                  <div className="inscr-faq-respuesta">{faq.r}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
