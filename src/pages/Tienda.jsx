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
    tag: 'Popular',
    emoji: '👕', bg: 'linear-gradient(135deg, #1A56DB, #0F3A9E)',
    imagen: 'tienda-productos/polera-colombia-canta.webp',
    descripcion: 'Polera de algodón 100% con el diseño oficial de Colombia Canta y Encanta. Tela suave y transpirable, perfecta para el día a día.',
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Azul', hex: '#1A56DB' }, { nombre: 'Blanco', hex: '#F0F0F0' }, { nombre: 'Negro', hex: '#1a1a1a' }],
    stock: true,
  },
  {
    id: 2, nombre: 'Polera Bambuco', categoria: 'Poleras', precio: '$48.000',
    tag: 'Artesanal',
    emoji: '👕', bg: 'linear-gradient(135deg, #E8341A, #A8240E)',
    imagen: 'tienda-productos/polera-bambuco.webp',
    descripcion: 'Diseño artístico inspirado en el ritmo del bambuco, símbolo del folclor andino colombiano. Algodón premium de alta calidad.',
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Rojo', hex: '#E8341A' }, { nombre: 'Blanco', hex: '#F0F0F0' }],
    stock: true,
  },
  {
    id: 3, nombre: 'Polera Gira USA 2026', categoria: 'Poleras', precio: '$52.000',
    tag: 'Edición Limitada',
    emoji: '👕', bg: 'linear-gradient(135deg, #F5C800, #B8960A)',
    descripcion: 'Edición limitada de la gira Colombia Canta y Encanta por Estados Unidos 2026. Pieza coleccionable del recorrido histórico.',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Amarillo', hex: '#F5C800' }, { nombre: 'Negro', hex: '#1a1a1a' }],
    stock: true,
  },
  {
    id: 4, nombre: 'Hoodie Colombia Canta', categoria: 'Hoodies', precio: '$75.000',
    tag: 'Best Seller',
    emoji: '🧥', bg: 'linear-gradient(135deg, #E8341A, #6B21A8)',
    descripcion: 'Hoodie de felpa con capucha y bolsillo canguro. Cálido y cómodo, con el sello inconfundible de Colombia Canta y Encanta.',
    tallas: ['S', 'M', 'L', 'XL', 'XXL'],
    colores: [{ nombre: 'Rojo', hex: '#E8341A' }, { nombre: 'Morado', hex: '#6B21A8' }, { nombre: 'Negro', hex: '#1a1a1a' }],
    stock: true,
  },
  {
    id: 5, nombre: 'Hoodie Tricolor', categoria: 'Hoodies', precio: '$80.000',
    tag: null,
    emoji: '🧥', bg: 'linear-gradient(135deg, #0F3A9E, #6B21A8)',
    descripcion: 'Hoodie con bordado tricolor inspirado en los colores de la bandera colombiana. Edición especial de identidad nacional.',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Azul', hex: '#0F3A9E' }, { nombre: 'Morado', hex: '#6B21A8' }],
    stock: false,
  },
  {
    id: 6, nombre: 'Tote Bag Colombia', categoria: 'Bags', precio: '$28.000',
    tag: 'Nuevo',
    emoji: '👜', bg: 'linear-gradient(135deg, #F5C800, #E8341A)',
    descripcion: 'Bolso tote de algodón con serigrafía del logo oficial. Resistente, lavable y con amplio espacio interior para el día a día.',
    tallas: [],
    colores: [{ nombre: 'Natural', hex: '#F5ECD7' }, { nombre: 'Negro', hex: '#1a1a1a' }],
    stock: true,
  },
  {
    id: 7, nombre: 'Mochila Artesanal', categoria: 'Bags', precio: '$65.000',
    tag: 'Artesanal',
    emoji: '🎒', bg: 'linear-gradient(135deg, #B8960A, #E8341A)',
    descripcion: 'Mochila elaborada por artesanos de Medellín con técnicas tradicionales. Única en diseño, resistente y con múltiples compartimentos.',
    tallas: [],
    colores: [{ nombre: 'Multicolor', hex: '#F5C800' }],
    stock: true,
  },
  {
    id: 8, nombre: 'Termo Colombia Canta', categoria: 'Otros', precio: '$35.000',
    tag: 'Nuevo',
    emoji: '🍵', bg: 'linear-gradient(135deg, #16A34A, #1A56DB)',
    descripcion: 'Termo de acero inoxidable de 500 ml con el logo oficial. Mantiene bebidas frías hasta 24 h y calientes hasta 12 h.',
    tallas: [],
    colores: [{ nombre: 'Verde', hex: '#16A34A' }, { nombre: 'Azul', hex: '#1A56DB' }],
    stock: true,
  },
  {
    id: 9, nombre: 'Café Colombia Canta', categoria: 'Otros', precio: '$22.000',
    tag: 'Exclusivo',
    emoji: '☕', bg: 'linear-gradient(135deg, #92400E, #B8960A)',
    descripcion: 'Café de origen colombiano seleccionado de fincas del Eje Cafetero. Tostado medio, con notas de chocolate y caramelo. 250 g.',
    tallas: [],
    colores: [],
    stock: true,
  },
];

export default function Tienda() {
  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const filtrados = productos.filter(p => {
    const matchCat = filtro === 'Todos' || p.categoria === filtro;
    const matchQ = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchQ;
  });

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

      {/* Hero Tienda */}
      <div className="tienda-hero">
        <div className="container">
          <div className="tienda-hero-top">
            <span className="tienda-hero-label">Boutique Cultural</span>
            <h1 className="tienda-hero-titulo">Lleva la tradición<br />contigo</h1>
          </div>
          <div className="tienda-hero-divisor" />
          <div className="tienda-hero-controls">
            <div className="tienda-filtros">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFiltro(cat)}
                  className={`tienda-filtro-btn${filtro === cat ? ' activo' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <label className="tienda-busqueda">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="tienda-toast">✓ {toast}</div>
      )}

      <section className="tienda-productos-section">
        <div className="container">
          {/* Grid de productos */}
          <div className="productos-grid">
            {filtrados.map(prod => (
              <div
                key={prod.id}
                className="producto-card"
                onClick={() => setProductoSeleccionado(prod)}
              >
                {/* Zona imagen */}
                <div className="producto-card-imagen" style={{ background: prod.bg }}>
                  {prod.tag && <span className="producto-card-badge">{prod.tag}</span>}
                  {!prod.stock && <span className="producto-card-agotado">Agotado</span>}
                  {prod.imagen ? (
                    <img
                      src={`${import.meta.env.BASE_URL}${prod.imagen}`}
                      alt={prod.nombre}
                      className="producto-card-foto"
                      loading="lazy"
                    />
                  ) : (
                    <span className="producto-card-emoji" aria-hidden="true">{prod.emoji}</span>
                  )}

                  {/* Barra hover */}
                  <div
                    className="producto-card-hover-bar"
                    onClick={(e) => { e.stopPropagation(); setProductoSeleccionado(prod); }}
                  >
                    <span>Añadir al carrito</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                </div>

                {/* Info debajo */}
                <div className="producto-card-info">
                  <div className="producto-card-fila-top">
                    <span className="producto-card-nombre">{prod.nombre}</span>
                    <span className="producto-card-precio">{prod.precio}</span>
                  </div>
                  <span className="producto-card-cat-label">{prod.categoria}</span>
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
