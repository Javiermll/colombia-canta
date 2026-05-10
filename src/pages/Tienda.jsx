import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ProductoModal from '../components/ProductoModal/ProductoModal';
import ContactoSection from '../components/Contacto/Contacto';
import Footer from '../components/Footer/Footer';
import { BASE_URL, OG_IMAGE } from '../utils/seo';
import './Tienda.css';

const PAGE_TITLE = 'Tienda | Colombia Canta y Encanta';
const PAGE_DESC = 'Merch oficial de Colombia Canta y Encanta: poleras, hoodies, tote bags y más. Lleva un pedacito de la cultura colombiana contigo.';

const categorias = ['Todos', 'Poleras', 'Hoodies', 'Bags', 'Otros'];

const productos = [
  {
    id: 1, nombre: 'Polera Colombia Canta', categoria: 'Poleras', precio: '$45.000',
    emoji: '👕', bg: 'linear-gradient(135deg, #1A56DB, #0F3A9E)',
    descripcion: 'Polera de algodón 100% con el diseño oficial de Colombia Canta y Encanta. Tela suave y transpirable, perfecta para el día a día.',
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Azul', hex: '#1A56DB' }, { nombre: 'Blanco', hex: '#F0F0F0' }, { nombre: 'Negro', hex: '#1a1a1a' }],
    stock: true,
  },
  {
    id: 2, nombre: 'Polera Bambuco', categoria: 'Poleras', precio: '$48.000',
    emoji: '👕', bg: 'linear-gradient(135deg, #E8341A, #A8240E)',
    descripcion: 'Diseño artístico inspirado en el ritmo del bambuco, símbolo del folclor andino colombiano. Algodón premium de alta calidad.',
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Rojo', hex: '#E8341A' }, { nombre: 'Blanco', hex: '#F0F0F0' }],
    stock: true,
  },
  {
    id: 3, nombre: 'Polera Gira USA 2026', categoria: 'Poleras', precio: '$52.000',
    emoji: '👕', bg: 'linear-gradient(135deg, #F5C800, #B8960A)',
    descripcion: 'Edición limitada de la gira Colombia Canta y Encanta por Estados Unidos 2026. Pieza coleccionable del recorrido histórico.',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Amarillo', hex: '#F5C800' }, { nombre: 'Negro', hex: '#1a1a1a' }],
    stock: true,
  },
  {
    id: 4, nombre: 'Hoodie Colombia Canta', categoria: 'Hoodies', precio: '$75.000',
    emoji: '🧥', bg: 'linear-gradient(135deg, #E8341A, #6B21A8)',
    descripcion: 'Hoodie de felpa con capucha y bolsillo canguro. Cálido y cómodo, con el sello inconfundible de Colombia Canta y Encanta.',
    tallas: ['S', 'M', 'L', 'XL', 'XXL'],
    colores: [{ nombre: 'Rojo', hex: '#E8341A' }, { nombre: 'Morado', hex: '#6B21A8' }, { nombre: 'Negro', hex: '#1a1a1a' }],
    stock: true,
  },
  {
    id: 5, nombre: 'Hoodie Tricolor', categoria: 'Hoodies', precio: '$80.000',
    emoji: '🧥', bg: 'linear-gradient(135deg, #0F3A9E, #6B21A8)',
    descripcion: 'Hoodie con bordado tricolor inspirado en los colores de la bandera colombiana. Edición especial de identidad nacional.',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Azul', hex: '#0F3A9E' }, { nombre: 'Morado', hex: '#6B21A8' }],
    stock: false,
  },
  {
    id: 6, nombre: 'Tote Bag Colombia', categoria: 'Bags', precio: '$28.000',
    emoji: '👜', bg: 'linear-gradient(135deg, #F5C800, #E8341A)',
    descripcion: 'Bolso tote de algodón con serigrafía del logo oficial. Resistente, lavable y con amplio espacio interior para el día a día.',
    tallas: [],
    colores: [{ nombre: 'Natural', hex: '#F5ECD7' }, { nombre: 'Negro', hex: '#1a1a1a' }],
    stock: true,
  },
  {
    id: 7, nombre: 'Mochila Artesanal', categoria: 'Bags', precio: '$65.000',
    emoji: '🎒', bg: 'linear-gradient(135deg, #B8960A, #E8341A)',
    descripcion: 'Mochila elaborada por artesanos de Medellín con técnicas tradicionales. Única en diseño, resistente y con múltiples compartimentos.',
    tallas: [],
    colores: [{ nombre: 'Multicolor', hex: '#F5C800' }],
    stock: true,
  },
  {
    id: 8, nombre: 'Termo Colombia Canta', categoria: 'Otros', precio: '$35.000',
    emoji: '🍵', bg: 'linear-gradient(135deg, #16A34A, #1A56DB)',
    descripcion: 'Termo de acero inoxidable de 500 ml con el logo oficial. Mantiene bebidas frías hasta 24 h y calientes hasta 12 h.',
    tallas: [],
    colores: [{ nombre: 'Verde', hex: '#16A34A' }, { nombre: 'Azul', hex: '#1A56DB' }],
    stock: true,
  },
  {
    id: 9, nombre: 'Café Colombia Canta', categoria: 'Otros', precio: '$22.000',
    emoji: '☕', bg: 'linear-gradient(135deg, #92400E, #B8960A)',
    descripcion: 'Café de origen colombiano seleccionado de fincas del Eje Cafetero. Tostado medio, con notas de chocolate y caramelo. 250 g.',
    tallas: [],
    colores: [],
    stock: true,
  },
];

export default function Tienda() {
  const [filtro, setFiltro] = useState('Todos');
  const [toast, setToast] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const filtrados = filtro === 'Todos'
    ? productos
    : productos.filter(p => p.categoria === filtro);

  const handleAgregarSuccess = (nombre) => {
    setToast(`"${nombre}" agregado al carrito`);
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
          animation: 'fadeIn 0.2s ease',
          whiteSpace: 'nowrap',
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
                  fontFamily: 'var(--font-cuerpo)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de productos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {filtrados.map(prod => (
              <div
                key={prod.id}
                className="producto-card"
                onClick={() => setProductoSeleccionado(prod)}
              >
                {/* Imagen */}
                <div style={{
                  height: '180px',
                  background: prod.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px',
                  position: 'relative',
                }}>
                  <span className="producto-card-badge">{prod.categoria}</span>
                  {prod.emoji}
                  {!prod.stock && (
                    <span style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'rgba(239,68,68,0.9)', color: '#fff',
                      fontSize: '11px', fontWeight: '700',
                      padding: '3px 10px', borderRadius: '100px',
                    }}>
                      Agotado
                    </span>
                  )}
                </div>

                {/* Datos */}
                <div style={{ padding: '18px 20px 20px' }}>
                  <div style={{
                    fontFamily: 'var(--font-titulo)', fontSize: '16px',
                    marginBottom: '12px', color: 'var(--texto-principal)',
                    lineHeight: '1.3',
                  }}>
                    {prod.nombre}
                  </div>
                  <span className="producto-card-precio">{prod.precio}</span>

                  <div className="producto-card-acciones">
                    <button
                      className="producto-card-btn-add"
                      onClick={(e) => { e.stopPropagation(); setProductoSeleccionado(prod); }}
                    >
                      🛒 Añadir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de producto */}
      {productoSeleccionado && (
        <ProductoModal
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
          onAgregarSuccess={handleAgregarSuccess}
        />
      )}

      <ContactoSection />
      <Footer />
    </main>
  );
}
