import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import ContactoSection from "../components/Contacto/Contacto";
import Footer from "../components/Footer/Footer";
import "../styles/main.css";
import { BASE_URL, OG_IMAGE } from "../utils/seo";

const PAGE_TITLE = "Quiénes Somos | Colombia Canta y Encanta";
const PAGE_DESC =
  "Conoce la historia de Silvia Zapata y la misión de Colombia Canta y Encanta, centro cultural y escuela de música tradicional en Medellín.";

const stats = [
  { num: "+20", label: "años de historia" },
  { num: "+200", label: "estudiantes formados" },
  { num: "5", label: "ritmos colombianos" },
];

const reconocimientos = [
  "Ministerio de Cultura",
  "Congreso de la República",
  "Gobernación de Antioquia",
  "Concejo de Medellín",
];

const pilares = [
  {
    icono: "🎵",
    titulo: "Formación Musical",
    desc: "Formamos músicos desde la infancia cultivando el talento y el amor por el bambuco, el pasillo, la guabina, la cumbia y el currulao.",
  },
  {
    icono: "🏛️",
    titulo: "Patrimonio Vivo",
    desc: "Preservamos los ritmos que definen la identidad cultural de Colombia y los transmitimos a las nuevas generaciones como un legado vivo.",
  },
  {
    icono: "🌍",
    titulo: "Colombia al Mundo",
    desc: "Reconectamos a los colombianos en el exterior con sus raíces y llevamos nuestra riqueza musical a escenarios de Estados Unidos, Chile y más allá.",
  },
];

export default function Nosotros() {
  return (
    <main>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${BASE_URL}/#/nosotros`} />
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

      {/* Hero */}
      <div className="page-header">
        <div className="container">
          <div className="page-header-inner">
            <span className="page-header-label">
              Cultura · Identidad · Legado
            </span>
            <h1>Nosotros</h1>
          </div>
          <div className="page-header-divisor" />
          <p className="page-header-sub">
            Centro cultural y escuela de música tradicional colombiana
          </p>
        </div>
      </div>

      {/* ── Quiénes somos ─────────────────────────────────────── */}
      <section id="quienes-somos" className="nosotros-seccion">
        <div className="container">
          <div className="nosotros-qs-grid">
            <div className="nosotros-qs-texto">
              <div>
                <span className="label-seccion label-rojo">Quiénes somos</span>
                <h2 className="nosotros-h2">
                  Un proyecto cultural que
                  <br />
                  nació en Medellín
                </h2>
                <p className="nosotros-bajada">
                  Más de veinte años preservando el patrimonio musical de
                  Colombia.
                </p>
                <p className="nosotros-parrafo">
                  Colombia Canta y Encanta es una organización cultural dedicada
                  a la formación musical de niños y jóvenes en música
                  tradicional colombiana. Con sede en el Sector Estadio de
                  Medellín, llevamos más de dos décadas preservando y
                  difundiendo el patrimonio musical de nuestra nación.
                </p>
                <p className="nosotros-parrafo">
                  Nuestra misión es conectar a las nuevas generaciones con las
                  raíces del bambuco, el pasillo, la guabina, la cumbia y el
                  currulao, llevando esa riqueza cultural a escenarios de todo
                  el mundo.
                </p>
              </div>
              <div className="nosotros-qs-stats">
                {stats.map((s, i) => (
                  <div key={s.label} className="nosotros-qs-stat">
                    <div className="nosotros-stat-num">{s.num}</div>
                    <div className="nosotros-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="nosotros-qs-foto-col">
              <img
                src={`${import.meta.env.BASE_URL}escuela-musica/img_5966-3.webp`}
                alt="Colombia Canta y Encanta"
                className="nosotros-qs-foto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Fundadora ──────────────────────────────────────────── */}
      <section id="fundadora" className="nosotros-fundadora-section">
        <div className="container">
          <div className="nosotros-fundadora-grid">
            <div className="nosotros-fundadora-foto-col">
              <img
                src={`${import.meta.env.BASE_URL}silvia-zapata_foto.jpg`}
                alt="Silvia Zapata Durango, fundadora de Colombia Canta y Encanta"
                className="nosotros-fundadora-foto"
              />
            </div>

            <div className="nosotros-fundadora-contenido">
              <span className="label-seccion label-amarillo">
                Nuestra Fundadora
              </span>
              <h2 className="nosotros-fundadora-nombre">
                Silvia Zapata
                <br />
                Durango
              </h2>
              <p className="nosotros-fundadora-rol">
                Cantante · Directora · Visionaria
              </p>

              <blockquote className="nosotros-quote">
                "Yo quería mantener vivo un legado que recibí y que me sirvió
                para todas las áreas de mi vida. Quería sembrar esto en las
                nuevas generaciones, para que pudieran conectar con sus talentos
                al tiempo que abrazan el amor por Colombia y por las historias
                que hay detrás de las músicas folclóricas."
              </blockquote>

              <p className="nosotros-parrafo">
                Hace dos décadas, Silvia Zapata Durango buscó la manera de que
                las nuevas generaciones conocieran el legado de la música
                colombiana y fundó Colombia Canta y Encanta. Hoy, en su vigésimo
                aniversario, la organización lleva los sonidos del bambuco, el
                pasillo y la cumbia a Estados Unidos y Brasil, reconectando a
                los colombianos en el exterior con sus raíces.
              </p>

              <div className="nosotros-reconocimientos">
                <p className="nosotros-reconoc-titulo">Reconocida por</p>
                <div className="nosotros-reconoc-pills">
                  {reconocimientos.map((r) => (
                    <span key={r} className="nosotros-reconoc-chip">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="nosotros-bienal">
                <span className="nosotros-bienal-icono">🏆</span>
                <span>
                  Seleccionada —{" "}
                  <strong>
                    Bienal de los 100 Proyectos Culturales de Interés Nacional
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pilares ────────────────────────────────────────────── */}
      <section id="inspiracion" className="nosotros-pilares-section">
        <div className="container">
          <div className="nosotros-pilares-header">
            <span className="label-seccion label-amarillo">
              Inspiración y comunidad
            </span>
            <h2 className="nosotros-pilares-titulo">
              La música como puente cultural
            </h2>
            <p className="nosotros-pilares-desc">
              Cada bambuco, cada pasillo, cada tonada guarda la historia de un
              pueblo y la identidad de una nación. Nuestra labor es asegurarnos
              de que esa historia siga viva.
            </p>
          </div>

          <div className="grid-3col">
            {pilares.map((p) => (
              <div key={p.titulo} className="nosotros-pilar">
                <div className="nosotros-pilar-icono">{p.icono}</div>
                <h3 className="nosotros-pilar-titulo">{p.titulo}</h3>
                <p className="nosotros-pilar-desc">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="nosotros-pilares-cta">
            <Link to="/elenco" className="btn btn-rojo">
              Conocer el elenco →
            </Link>
          </div>
        </div>
      </section>

      <ContactoSection />
      <Footer />
    </main>
  );
}
