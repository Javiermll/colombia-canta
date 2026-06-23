import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ProductoModal from '../components/ProductoModal/ProductoModal';
import ContactoSection from '../components/Contacto/Contacto';
import Footer from '../components/Footer/Footer';
import { BASE_URL, OG_IMAGE } from '../utils/seo';
import './Tienda.css';

const PAGE_TITLE = 'Tienda | Colombia Canta y Encanta';
const PAGE_DESC = 'Merch oficial de Colombia Canta y Encanta: camisetas, hoodies, tote bags y más. Lleva un pedacito de la cultura colombiana contigo.';

const coleccionesSuperiores = [
  { id: 'novedades', nombre: 'NOVEDADES', emoji: '⭐' },
  { id: 'drop1', nombre: 'DROP 1', emoji: '❤️' },
  { id: 'drop2', nombre: 'DROP 2', emoji: '⭐' },
  { id: 'kit', nombre: 'KIT ME ENAMORAS', emoji: '🤍' }
];

const categoriasFiltro = ['TODAS', 'CAMISETAS', 'TANQUES', 'GORRAS', 'TOTES BAGS', 'ACCESORIOS', 'TERMOS', 'LLAVEROS', 'STICKERS'];

// Conservamos las propiedades completas (tallas, colores, descripción) para alimentar el modal de compra
const productosData = [
  { 
    id: 1, nombre: 'Camiseta Clásica Orgullo Colombiano', categoria: 'CAMISETAS', precio: '$79.900', emoji: '👕', imgBg: '#f4f4f4', stock: true, tag: 'Popular',
    descripcion: 'Camiseta de algodón 100% con el diseño oficial de Colombia Canta y Encanta. Tela suave y transpirable, perfecta para el día a día.',
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Azul', hex: '#1A56DB' }, { nombre: 'Blanco', hex: '#F0F0F0' }, { nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 2, nombre: 'Camiseta Clásica Corazón Colombiano', categoria: 'CAMISETAS', precio: '$79.900', emoji: '👕', imgBg: '#1a1a1a', stock: true, tag: 'Artesanal',
    descripcion: 'Diseño artístico inspirado en el ritmo del bambuco, símbolo del folclor andino colombiano. Algodón premium de alta calidad.',
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Rojo', hex: '#E8341A' }, { nombre: 'Blanco', hex: '#F0F0F0' }]
  },
  { 
    id: 3, nombre: 'Tank Top Corazón Lateral', categoria: 'TANQUES', precio: '$69.900', emoji: '🎽', imgBg: '#f4f4f4', stock: true, tag: null,
    descripcion: 'Prenda fresca y cómoda con corte atlético y el detalle bordado del corazón de la marca.',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Blanco', hex: '#F0F0F0' }]
  },
  { 
    id: 4, nombre: 'Tank Top Colombia Vertical', categoria: 'TANQUES', precio: '$69.900', emoji: '🎽', imgBg: '#1a1a1a', stock: true, tag: null,
    descripcion: 'Diseño minimalista con tipografía vertical estilizada. Ideal para climas cálidos y ensayos.',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 5, nombre: 'Gorra Clásica Logo Multicolor', categoria: 'GORRAS', precio: '$59.900', emoji: '🧢', imgBg: '#1a1a1a', stock: true, tag: 'Nuevo',
    descripcion: 'Gorra de visera curva con bordado multicolor de alta definición. Ajuste regulable posterior.',
    tallas: ['Única'],
    colores: [{ nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 6, nombre: 'Gorra Corazón Bordado', categoria: 'GORRAS', precio: '$59.900', emoji: '🧢', imgBg: '#1a1a1a', stock: true, tag: null,
    descripcion: 'Diseño sutil con el corazón icónico bordado en el panel frontal.',
    tallas: ['Única'],
    colores: [{ nombre: 'Negro', hex: '#1a1a1a' }, { nombre: 'Blanco', hex: '#F0F0F0' }]
  },
  { 
    id: 7, nombre: 'Tote Bag Te llevo en mi', categoria: 'TOTES BAGS', precio: '$65.900', emoji: '👜', imgBg: '#f5ecd7', stock: true, tag: 'Best Seller',
    descripcion: 'Bolso tote de lona de algodón de alta resistencia con serigrafía oficial. Espaciosa y duradera.',
    tallas: [],
    colores: [{ nombre: 'Natural', hex: '#F5ECD7' }, { nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 8, nombre: 'Tula Logo Multicolor', categoria: 'TOTES BAGS', precio: '$55.900', emoji: '🎒', imgBg: '#1a1a1a', stock: true, tag: null,
    descripcion: 'Morral tipo tula ligera con cordones ajustables, ideal para transportar accesorios ligeros.',
    tallas: [],
    colores: [{ nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 9, nombre: 'Termo Metálico Logo Vertical', categoria: 'TERMOS', precio: '$49.900', emoji: '🍵', imgBg: '#fff', stock: true, tag: 'Nuevo',
    descripcion: 'Termo de acero inoxidable doble capa. Mantiene bebidas frías por 24 horas y calientes por 12 horas.',
    tallas: [],
    colores: [{ nombre: 'Blanco', hex: '#ffffff' }]
  },
  { 
    id: 10, nombre: 'Llavero Cinta Logo', categoria: 'LLAVEROS', precio: '$19.900', emoji: '🔑', imgBg: '#1a1a1a', stock: true, tag: null,
    descripcion: 'Llavero tipo reata de alta resistencia con mosquetón metálico premium.',
    tallas: [],
    colores: [{ nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 11, nombre: 'Sticker Pack Sonidos de País', categoria: 'STICKERS', precio: '$9.900', emoji: '🏷️', imgBg: '#fff', stock: true, tag: 'Exclusivo',
    descripcion: 'Colección de pegatinas de vinilo resistentes al agua con motivos folclóricos ilustrados.',
    tallas: [],
    colores: []
  },
  { 
    id: 12, nombre: 'Libreta Logo', categoria: 'ACCESORIOS', precio: '$19.900', emoji: '📓', imgBg: '#1a1a1a', stock: false, tag: null,
    descripcion: 'Libreta de notas de lomo empastado con hojas cuadriculadas y el logo repujado.',
    tallas: [],
    colores: [{ nombre: 'Negro', hex: '#1a1a1a' }]
  }
];

export default function Tienda() {
  const [coleccionActiva, setColeccionActiva] = useState('drop1');
  const [categoriaActiva, setCategoriaActiva] = useState('TODAS');
  const [ordenarPor, setOrdenarPor] = useState('relevancia');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [toast, setToast] = useState(null);

  const filtrados = productosData.filter(p => {
    return categoriaActiva === 'TODAS' || p.categoria === categoriaActiva;
  });

  // Callback que gatilla el modal interno una vez el usuario presiona "Agregar al Carrito" en la ficha expandida
  const handleAgregarSuccess = (nombre) => {
    setToast(`"${nombre}" agregado al carrito`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <main className="tienda-layout-raiz">
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

      {/* 1. HERO EDITORIAL ASIMÉTRICO */}
      <section className="tienda-editorial-hero">
        <div className="hero-col-izq">
          <div className="hero-editorial-contenido">
            <h2 className="hero-ed-tagline">SONIDOS QUE NOS UNEN</h2>
            <p className="hero-ed-parrafo">Piezas que cuentan historias, inspiradas en lo que somos, en nuestra gente y en la música que nos mueve.</p>
            <button className="hero-ed-btn">VER COLECCIÓN</button>
          </div>
        </div>
        <div className="hero-col-der">
          <div className="hero-editorial-contenido">
            <h2 className="hero-ed-tagline">VISTE LO QUE SIENTES</h2>
            <p className="hero-ed-parrafo">Diseños únicos para llevar contigo tu orgullo, a donde quiera que vayas.</p>
            <button className="hero-ed-btn">COMPRAR AHORA</button>
          </div>
        </div>
      </section>

      {/* 2. TICKER INFINITO DE ANUNCIOS */}
      <div className="tienda-anuncios-ticker">
        <div className="ticker-track">
          {[...Array(4)].map((_, idx) => (
            <span key={idx} className="ticker-text">
              ENVÍO GRATIS DESDE $220.000  •  REGÍSTRATE A NUESTRA NEWSLETTER Y OBTÉN 10% DE DESCUENTO  •  
            </span>
          ))}
        </div>
      </div>

      {/* 3. BOTONERA SUPERIOR DE DROPS */}
      <section className="seccion-colecciones-drops">
        <div className="container-tienda">
          <div className="grid-colecciones-links">
            {coleccionesSuperiores.map(col => (
              <button
                key={col.id}
                onClick={() => setColeccionActiva(col.id)}
                className={`btn-drop-tab ${coleccionActiva === col.id ? 'activo' : ''}`}
              >
                <span className="drop-tab-emoji">{col.emoji}</span> {col.nombre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FILTROS POR CATEGORÍA Y ORDENAMIENTO */}
      <section className="seccion-barra-navegacion-filtros">
        <div className="container-tienda">
          <span className="label-filtrar-por">FILTRAR POR CATEGORÍA</span>
          <div className="tienda-wrapper-controles-filtros">
            <div className="flex-tags-categorias">
              {categoriasFiltro.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`btn-categoria-tag ${categoriaActiva === cat ? 'activo' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="tienda-subcabecera-grid-cabecera">
            <h2 className="titulo-coleccion-actual">DROP 1 <span className="estrella-decorativa">★</span></h2>
            <div className="control-ordenar-dropdown">
              <span className="label-ordenar">ORDENAR POR</span>
              <select value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)} className="select-ordenar-native">
                <option value="relevancia">Relevancia</option>
                <option value="precio-bajo">Precio: Menor a Mayor</option>
                <option value="precio-alto">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GRID DE PRODUCTOS CON TRANSICIÓN HOVER BAR */}
      <section className="seccion-grid-productos-galeria">
        <div className="container-tienda">
          <div className="galeria-productos-tienda-grid">
            {filtrados.map(prod => (
              <div
                key={prod.id}
                className="tarjeta-producto-limpia"
                onClick={() => setProductoSeleccionado(prod)} // Al hacer clic en la tarjeta abre el detalle de compra
              >
                {/* Contenedor de Imagen */}
                <div className="wrapper-contenedor-imagen" style={{ backgroundColor: prod.imgBg }}>
                  {prod.tag && <span className="producto-card-badge">{prod.tag}</span>}
                  {!prod.stock && <span className="producto-card-agotado">Agotado</span>}
                  <span className="emoji-renderizado-fallback" aria-hidden="true">{prod.emoji}</span>
                  
                  {/* Botón flotante de favoritos (Corazón) */}
                  <button 
                    className="btn-guardar-favorito-corazon" 
                    onClick={(e) => { e.stopPropagation(); }} // Evita abrir el modal al dar clic al corazón
                    aria-label="Guardar en favoritos"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Sincronizado: Al hacer clic en la barra hover también se abre el modal de compra */}
                  <div
                    className="producto-card-hover-bar"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setProductoSeleccionado(prod); 
                    }}
                  >
                    <span>{prod.stock ? 'Ver opciones / Añadir' : 'Sin Stock'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                </div>

                {/* Información del Producto debajo de la caja */}
                <div className="meta-informacion-producto">
                  <div className="producto-card-fila-top">
                    <h3 className="titulo-producto-texto">{prod.nombre}</h3>
                    <span className="precio-producto-texto">{prod.precio}</span>
                  </div>
                  <span className="producto-card-cat-label">{prod.categoria}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toast Informativo */}
      {toast && <div className="tienda-toast">✓ {toast}</div>}

      {/* El modal renderiza las opciones complejas de color, descripción, etc. */}
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