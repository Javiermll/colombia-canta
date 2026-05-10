import { Helmet } from 'react-helmet-async';
import ContactoSection from '../components/Contacto/Contacto';
import Footer from '../components/Footer/Footer';
import '../styles/main.css';
import { BASE_URL, OG_IMAGE } from '../utils/seo';

const PAGE_TITLE = 'Quiénes Somos | Colombia Canta y Encanta';
const PAGE_DESC = 'Conoce la historia, el elenco artístico y la misión de Colombia Canta y Encanta, centro cultural y escuela de música tradicional en Medellín.';

const elenco = [
  { nombre: 'Leonardo Tamayo', rol: 'Piano · Director musical', emoji: '🎹' },
  { nombre: 'Luciana Obregón', rol: 'Piano · Cantante', emoji: '🎤' },
  { nombre: 'Trío Tritono', rol: 'Conjunto musical', emoji: '🎻' },
  { nombre: 'Artistas Senior', rol: 'Elenco principal', emoji: '🎺' },
  { nombre: 'Elenco Juvenil', rol: 'Formación musical', emoji: '🎸' },
  { nombre: 'Grupo de Danza', rol: 'Danza tradicional', emoji: '💃' },
];

const noticias = [
  { titulo: 'Gira USA 2026: Miami y Disney Springs', fecha: 'Mar 2026', desc: 'Colombia Canta y Encanta anuncia su gira más ambiciosa con presentaciones en Miami y Orlando, Florida.' },
  { titulo: 'Nueva temporada de la Escuela', fecha: 'Feb 2026', desc: 'Abrimos inscripciones para los cursos de Bandola, Tiple, Guitarra, Canto y Piano.' },
  { titulo: 'Festival Nacional 2026', fecha: 'Ene 2026', desc: 'Preparamos el Festival Nacional Colombia Canta, el evento cultural del año en Medellín.' },
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
      <div className="page-header" style={{ paddingTop: '96px' }}>
        <h1>Nosotros</h1>
        <p>Centro cultural y escuela de música tradicional colombiana</p>
      </div>

      {/* Quiénes somos */}
      <section id="quienes-somos" style={{ scrollMarginTop: '80px', padding: '72px 0', background: 'var(--bg-body)' }}>
        <div className="container">
          <div className="grid-2col">
            <div>
              <span className="label-seccion label-rojo">Quiénes somos</span>
              <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: '36px', marginBottom: '20px', lineHeight: '1.2' }}>
                Un proyecto cultural que nació en Medellín
              </h2>
              <p style={{ color: 'var(--texto-secundario)', lineHeight: '1.8', marginBottom: '16px' }}>
                Colombia Canta y Encanta es una organización cultural dedicada a la formación musical de niños y jóvenes en música tradicional colombiana. Con sede en el Sector Estadio de Medellín, llevamos más de diez años preservando y difundiendo el patrimonio musical de nuestra nación.
              </p>
              <p style={{ color: 'var(--texto-secundario)', lineHeight: '1.8' }}>
                Nuestra misión es conectar a las nuevas generaciones con las raíces del bambuco, el pasillo, la cumbia y todos los ritmos que hacen única a la música colombiana, llevando esa riqueza cultural a escenarios de todo el mundo.
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, var(--azul-oscuro), var(--azul))',
              borderRadius: '16px',
              height: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px'
            }}>🇨🇴</div>
          </div>
        </div>
      </section>

      {/* Elenco */}
      <section id="elenco" style={{ scrollMarginTop: '80px', padding: '72px 0', background: 'var(--crema)' }}>
        <div className="container">
          <span className="label-seccion label-rojo" style={{ display: 'block', marginBottom: '8px' }}>Elenco artístico</span>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: '36px', marginBottom: '40px' }}>Nuestros artistas</h2>
          <div className="grid-3col">
            {elenco.map(artista => (
              <div key={artista.nombre} style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: '0 2px 12px var(--sombra-sutil)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{artista.emoji}</div>
                <div style={{ fontFamily: 'var(--font-titulo)', fontSize: '18px', marginBottom: '6px' }}>{artista.nombre}</div>
                <div style={{ fontSize: '13px', color: 'var(--texto-secundario)' }}>{artista.rol}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspiración */}
      <section id="inspiracion" style={{ scrollMarginTop: '80px', padding: '72px 0', background: 'var(--azul-oscuro)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <span className="label-seccion label-amarillo" style={{ display: 'block', marginBottom: '16px' }}>Inspiración y comunidad</span>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: '40px', color: '#fff', marginBottom: '24px' }}>
            La música como puente cultural
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', lineHeight: '1.8' }}>
            Creemos que la música tradicional colombiana es un puente que conecta generaciones, culturas y comunidades. Cada bambuco, cada pasillo, cada tonada guarda la historia de un pueblo y la identidad de una nación. Nuestra labor es asegurarnos de que esa historia siga viva.
          </p>
        </div>
      </section>

      {/* Noticias */}
      <section id="noticias" style={{ scrollMarginTop: '80px', padding: '72px 0', background: 'var(--bg-body)' }}>
        <div className="container">
          <span className="label-seccion label-rojo" style={{ display: 'block', marginBottom: '8px' }}>Noticias</span>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: '36px', marginBottom: '40px' }}>Novedades</h2>
          <div className="grid-3col-gap-24">
            {noticias.map(n => (
              <div key={n.titulo} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-sutil)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'box-shadow 0.2s ease'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--texto-secundario)', marginBottom: '10px', fontWeight: '600' }}>{n.fecha}</div>
                <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: '20px', marginBottom: '12px' }}>{n.titulo}</h3>
                <p style={{ fontSize: '14px', color: 'var(--texto-secundario)', lineHeight: '1.7' }}>{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactoSection />
      <Footer />
    </main>
  );
}
