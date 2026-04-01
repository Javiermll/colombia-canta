import { useState } from 'react';
import Footer from '../components/Footer/Footer';

const cursos = [
  { nombre: 'Bandola', emoji: '🪕', nivel: 'Todos los niveles', horario: 'Mar y Jue · 5:00 PM', desc: 'Aprende a tocar la bandola llanera, instrumento emblema de los Llanos Orientales y la música andina colombiana.' },
  { nombre: 'Tiple', emoji: '🎸', nivel: 'Principiante · Intermedio', horario: 'Lun y Mié · 4:00 PM', desc: 'El tiple es el instrumento nacional de Colombia. Aprende sus técnicas y acordes en un ambiente cálido y familiar.' },
  { nombre: 'Guitarra', emoji: '🎸', nivel: 'Todos los niveles', horario: 'Vie · 3:00 PM y Sáb · 10:00 AM', desc: 'Formación en guitarra clásica y popular, con énfasis en el repertorio colombiano y latinoamericano.' },
  { nombre: 'Canto', emoji: '🎤', nivel: 'Principiante · Intermedio', horario: 'Mar y Jue · 6:00 PM', desc: 'Técnica vocal, repertorio colombiano y canto coral. Para todas las edades con vocación artística.' },
  { nombre: 'Piano', emoji: '🎹', nivel: 'Todos los niveles', horario: 'Lun, Mié y Vie · 3:00 PM', desc: 'Clases de piano desde lectura musical básica hasta interpretación de música colombiana y clásica.' },
];

const pasos = [
  { num: '1', titulo: 'Elige tu curso', desc: 'Revisa los cursos disponibles y selecciona el que más te interese según tu nivel y horario.' },
  { num: '2', titulo: 'Completa el formulario', desc: 'Llena el formulario de inscripción con tus datos personales y el curso elegido.' },
  { num: '3', titulo: 'Realiza el pago', desc: 'Recibe las instrucciones de pago por WhatsApp o email y completa tu matrícula.' },
  { num: '4', titulo: 'Recibe confirmación', desc: 'Te enviamos la confirmación de tu inscripción con los detalles del curso.' },
];

const faqs = [
  { q: '¿Necesito experiencia previa?', r: 'No. Tenemos cursos para todos los niveles, desde principiantes absolutos hasta estudiantes avanzados.' },
  { q: '¿Cuánto duran los cursos?', r: 'Los cursos tienen una duración mínima de 3 meses, con clases de 1 hora 2 o 3 veces por semana.' },
  { q: '¿Cuál es el costo de los cursos?', r: 'El valor varía según el instrumento y el nivel. Escríbenos al WhatsApp para información actualizada.' },
  { q: '¿Hay descuentos para estudiantes?', r: 'Sí, ofrecemos descuentos especiales para estudiantes y para inscripciones de hermanos.' },
  { q: '¿Dónde son las clases?', r: 'En nuestra sede del Sector Estadio, Calle 49 76a 65, Medellín.' },
];

export default function Inscripciones() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main>
      <div className="page-header" style={{ paddingTop: '96px' }}>
        <h1>Inscripciones</h1>
        <p>Únete a la escuela de música más vibrante de Medellín</p>
      </div>

      {/* Cursos */}
      <section id="cursos" style={{ scrollMarginTop: '80px', padding: '72px 0', background: '#fff' }}>
        <div className="container">
          <span className="label-seccion label-rojo" style={{ display: 'block', marginBottom: '8px' }}>Nuestros cursos</span>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: '36px', marginBottom: '40px' }}>
            Elige tu instrumento
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {cursos.map(c => (
              <div key={c.nombre} style={{
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '28px',
                background: '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{c.emoji}</div>
                <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: '22px', marginBottom: '8px' }}>{c.nombre}</h3>
                <p style={{ fontSize: '14px', color: 'var(--texto-secundario)', marginBottom: '12px', lineHeight: '1.6' }}>{c.desc}</p>
                <div style={{ fontSize: '12px', color: 'var(--texto-secundario)', marginBottom: '4px' }}>
                  🕐 {c.horario}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--texto-secundario)', marginBottom: '20px' }}>
                  📊 {c.nivel}
                </div>
                <a href="https://wa.me/573015315119" target="_blank" rel="noopener noreferrer" className="btn btn-azul" style={{ display: 'inline-flex' }}>
                  Inscribirme
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo inscribirse */}
      <section id="como-inscribirse" style={{ scrollMarginTop: '80px', padding: '72px 0', background: 'var(--crema)' }}>
        <div className="container">
          <span className="label-seccion label-rojo" style={{ display: 'block', marginBottom: '8px' }}>Proceso</span>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: '36px', marginBottom: '48px' }}>Cómo inscribirse</h2>
          <div className="grid-4col">
            {pasos.map(p => (
              <div key={p.num} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--azul-oscuro)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-titulo)',
                  margin: '0 auto 16px'
                }}>{p.num}</div>
                <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: '18px', marginBottom: '10px' }}>{p.titulo}</h3>
                <p style={{ fontSize: '14px', color: 'var(--texto-secundario)', lineHeight: '1.7' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ scrollMarginTop: '80px', padding: '72px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <span className="label-seccion label-rojo" style={{ display: 'block', marginBottom: '8px' }}>Preguntas frecuentes</span>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: '36px', marginBottom: '40px' }}>FAQ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '20px 0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-cuerpo)',
                    fontSize: '16px', fontWeight: '600',
                    color: 'var(--texto-principal)'
                  }}
                >
                  {faq.q}
                  <span style={{ fontSize: '20px', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : '', flexShrink: 0, marginLeft: '12px' }}>▾</span>
                </button>
                {openFaq === i && (
                  <p style={{ padding: '0 0 20px', fontSize: '15px', color: 'var(--texto-secundario)', lineHeight: '1.7' }}>
                    {faq.r}
                  </p>
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
