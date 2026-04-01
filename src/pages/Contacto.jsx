import { useState } from 'react';
import Footer from '../components/Footer/Footer';

const aliados = ['Co·Crea', 'Alcaldía de Medellín', 'Medellín Bureau', 'Teleantioquia', 'Teatro Trail'];

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <main>
      <div className="page-header" style={{ paddingTop: '96px' }}>
        <h1>Contacto</h1>
        <p>Estamos en Medellín, Colombia · Contáctanos</p>
      </div>

      <section style={{ background: 'var(--crema)', padding: '72px 0 0', overflow: 'hidden' }}>
        <div className="container">
          <div className="grid-2col-contacto">
            {/* Info */}
            <div>
              <span className="label-seccion label-rojo">Únete a nuestra comunidad</span>
              <h2 style={{
                fontFamily: 'var(--font-titulo)', fontSize: '40px',
                lineHeight: '1.2', margin: '16px 0 8px'
              }}>
                La música colombiana que <span style={{ color: 'var(--azul)' }}>mueve al mundo</span>
              </h2>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '15px', marginBottom: '40px' }}>
                Centro cultural · Escuela de música · Medellín, Colombia
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px' }}>
                  <span>📍</span>
                  <span>Calle 49 76a 65, Sector Estadio, Medellín, Colombia</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}>
                  <span>📱</span>
                  <a href="https://wa.me/573015315119" style={{ color: 'var(--azul)', fontWeight: '600' }}>
                    3015315119
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}>
                  <span>✉️</span>
                  <a href="mailto:hola@colombiacanta.org" style={{ color: 'var(--azul)', fontWeight: '600' }}>
                    hola@colombiacanta.org
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['📸 Instagram', '💬 WhatsApp', '▶️ YouTube'].map(r => (
                  <span key={r} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '100px',
                    background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)',
                    fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                  }}>{r}</span>
                ))}
              </div>
            </div>

            {/* Formulario */}
            <div className="contacto-form-card" style={{
              background: '#fff', borderRadius: '20px', padding: '40px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)'
            }}>
              {enviado ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                  <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: '24px', marginBottom: '10px' }}>¡Mensaje enviado!</h3>
                  <p style={{ color: 'var(--texto-secundario)' }}>Nos pondremos en contacto contigo pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: '22px', marginBottom: '4px' }}>Envíanos un mensaje</h3>
                  {[
                    { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Tu nombre completo' },
                    { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com' },
                    { name: 'asunto', label: 'Asunto', type: 'text', placeholder: '¿En qué podemos ayudarte?' },
                  ].map(field => (
                    <div key={field.name}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--texto-secundario)' }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: '10px',
                          border: '1.5px solid rgba(0,0,0,0.12)', fontSize: '15px',
                          fontFamily: 'var(--font-cuerpo)', outline: 'none',
                          transition: 'border-color 0.15s', boxSizing: 'border-box'
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--azul)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--texto-secundario)' }}>
                      Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      placeholder="Cuéntanos más..."
                      required
                      rows={5}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: '10px',
                        border: '1.5px solid rgba(0,0,0,0.12)', fontSize: '15px',
                        fontFamily: 'var(--font-cuerpo)', resize: 'vertical', outline: 'none',
                        transition: 'border-color 0.15s', boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--azul)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                    />
                  </div>
                  <button type="submit" className="btn btn-azul" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                    Enviar mensaje
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Aliados */}
        <div className="aliados-bar" style={{ marginTop: '64px' }}>
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
      </section>

      <Footer />
    </main>
  );
}
