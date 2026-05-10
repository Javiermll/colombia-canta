import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ContactoSection from '../components/Contacto/Contacto';
import Footer from '../components/Footer/Footer';
import { BASE_URL, OG_IMAGE } from '../utils/seo';

const PAGE_TITLE = 'Tienda | Colombia Canta y Encanta';
const PAGE_DESC = 'Merch oficial de Colombia Canta y Encanta: poleras, hoodies, tote bags y más. Lleva un pedacito de la cultura colombiana contigo.';

const categorias = ['Todos', 'Poleras', 'Hoodies', 'Bags', 'Otros'];

const productos = [
  { id: 1, nombre: 'Polera Colombia Canta', categoria: 'Poleras', precio: '$45.000', emoji: '👕', bg: 'linear-gradient(135deg, #1A56DB, #0F3A9E)' },
  { id: 2, nombre: 'Polera Bambuco', categoria: 'Poleras', precio: '$48.000', emoji: '👕', bg: 'linear-gradient(135deg, #E8341A, #A8240E)' },
  { id: 3, nombre: 'Polera Gira USA 2026', categoria: 'Poleras', precio: '$52.000', emoji: '👕', bg: 'linear-gradient(135deg, #F5C800, #B8960A)' },
  { id: 4, nombre: 'Hoodie Colombia Canta', categoria: 'Hoodies', precio: '$75.000', emoji: '🧥', bg: 'linear-gradient(135deg, #E8341A, #6B21A8)' },
  { id: 5, nombre: 'Hoodie Tricolor', categoria: 'Hoodies', precio: '$80.000', emoji: '🧥', bg: 'linear-gradient(135deg, #0F3A9E, #6B21A8)' },
  { id: 6, nombre: 'Tote Bag Colombia', categoria: 'Bags', precio: '$28.000', emoji: '👜', bg: 'linear-gradient(135deg, #F5C800, #E8341A)' },
  { id: 7, nombre: 'Mochila Artesanal', categoria: 'Bags', precio: '$65.000', emoji: '🎒', bg: 'linear-gradient(135deg, #B8960A, #E8341A)' },
  { id: 8, nombre: 'Termo Colombia Canta', categoria: 'Otros', precio: '$35.000', emoji: '☕', bg: 'linear-gradient(135deg, #16A34A, #1A56DB)' },
  { id: 9, nombre: 'Café Colombia Canta', categoria: 'Otros', precio: '$22.000', emoji: '☕', bg: 'linear-gradient(135deg, #92400E, #B8960A)' },
];

export default function Tienda() {
  const [filtro, setFiltro] = useState('Todos');
  const [carrito, setCarrito] = useState([]);
  const [toast, setToast] = useState(null);

  const filtrados = filtro === 'Todos'
    ? productos
    : productos.filter(p => p.categoria === filtro);

  const agregarAlCarrito = (producto) => {
    setCarrito(c => [...c, producto]);
    setToast(`"${producto.nombre}" agregado al carrito`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <main>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${BASE_URL}/#/tienda`} />
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
        <h1>Tienda</h1>
        <p>Merch oficial de Colombia Canta y Encanta</p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--azul-oscuro)', color: '#fff',
          padding: '14px 28px', borderRadius: '100px',
          fontSize: '14px', fontWeight: '600',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          ✓ {toast}
        </div>
      )}

      <section style={{ padding: '56px 0' }}>
        <div className="container">
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '100px',
                  border: '1.5px solid',
                  borderColor: filtro === cat ? 'var(--azul-oscuro)' : 'var(--border-media)',
                  background: filtro === cat ? 'var(--azul-oscuro)' : 'transparent',
                  color: filtro === cat ? '#fff' : 'var(--texto-principal)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-cuerpo)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {filtrados.map(prod => (
              <div key={prod.id} style={{
                border: '1px solid var(--border-sutil)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                boxShadow: '0 2px 12px var(--sombra-sutil)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{
                  height: '180px',
                  background: prod.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px'
                }}>
                  {prod.emoji}
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ fontFamily: 'var(--font-titulo)', fontSize: '17px', marginBottom: '6px' }}>{prod.nombre}</div>
                  <div style={{ fontSize: '13px', color: 'var(--texto-secundario)', marginBottom: '16px' }}>{prod.categoria}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--azul-oscuro)' }}>{prod.precio}</span>
                    <button
                      onClick={() => agregarAlCarrito(prod)}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: 'var(--azul-oscuro)',
                        color: '#fff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-cuerpo)',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
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
