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

const productosData = [
  { 
    id: 1, nombre: 'CAMISETA CLÁSICA CARTA Y ENCANTA', categoria: 'CAMISETAS', precio: '$89.000', emoji: '👕', imgBg: '#f4f4f4', stock: true, tag: 'NUEVO',
    descripcion: 'Camiseta de algodón 100% con el diseño oficial de Colombia Canta y Encanta. Tela suave y transpirable, perfecta para el día a día.',
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Azul', hex: '#1A56DB' }, { nombre: 'Blanco', hex: '#F0F0F0' }, { nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 5, nombre: 'GORRA CLÁSICA CARTA Y ENCANTA', categoria: 'GORRAS', precio: '$69.900', emoji: '🧢', imgBg: '#1a1a1a', stock: true, tag: 'NUEVO',
    descripcion: 'Gorra de visera curva con bordado multicolor de alta definición. Ajuste regulable posterior.',
    tallas: ['Única'],
    colores: [{ nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 7, nombre: 'TOTE TE LLEVO EN MI', categoria: 'TOTES BAGS', precio: '$59.000', emoji: '👜', imgBg: '#f5ecd7', stock: true, tag: 'NUEVO',
    descripcion: 'Bolso tote de lona de algodón de alta resistencia con serigrafía oficial. Espaciosa y duradera.',
    tallas: [],
    colores: [{ nombre: 'Natural', hex: '#F5ECD7' }, { nombre: 'Negro', hex: '#1a1a1a' }]
  },
  { 
    id: 2, nombre: 'CAMISETA TE LLEVO EN MI', categoria: 'CAMISETAS', precio: '$89.000', emoji: '👕', imgBg: '#1a1a1a', stock: true, tag: 'NUEVO',
    descripcion: 'Diseño artístico inspirado en el ritmo del bambuco, símbolo del folclor andino colombiano. Algodón premium de alta calidad.',
    tallas: ['XS', 'S', 'M', 'L', 'XL'],
    colores: [{ nombre: 'Rojo', hex: '#E8341A' }, { nombre: 'Blanco', hex: '#F0F0F0' }]
  }
];

export default function Tienda() {
  const [coleccionActiva, setColeccionActiva] = useState('novedades');
  const [categoriaActiva, setCategoriaActiva] = useState('TODAS');
  const [ordenarPor, setOrdenarPor] = useState('relevancia');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [toast, setToast] = useState(null);

  const filtrados = productosData.filter(p => {
    return categoriaActiva === 'TODAS' || p.categoria === categoriaActiva;
  });

  const handleAgregarSuccess = (nombre) => {
    setToast(`"${nombre}" agregado al carrito`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <main className="tienda-layout-raiz">
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
      </Helmet>

      {/* 1. HERO EDITORIAL ASIMÉTRICO COMPACTO */}
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

      {/* 3. BOTONERA SUPERIOR DE DROPS REDONDEADA */}
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
            <h2 className="titulo-coleccion-actual">
              {coleccionesSuperiores.find(c => c.id === coleccionActiva)?.nombre || 'PRODUCTOS'}{' '}
              <span className="estrella-decorativa">★</span>
            </h2>
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

      {/* 5. GRID DE PRODUCTOS (LIMITADO A 1 FILA EN NOVEDADES) */}
      <section className="seccion-grid-productos-galeria">
        <div className="container-tienda">
          <div className={`galeria-productos-tienda-grid ${coleccionActiva === 'novedades' ? 'fila-unica-novedades' : ''}`}>
            {filtrados.map(prod => (
              <div
                key={prod.id}
                className="tarjeta-producto-limpia"
                onClick={() => setProductoSeleccionado(prod)}
              >
                <div className="wrapper-contenedor-imagen" style={{ backgroundColor: prod.imgBg }}>
                  {prod.tag && <span className="producto-card-badge">{prod.tag}</span>}
                  {!prod.stock && <span className="producto-card-agotado">Agotado</span>}
                  <span className="emoji-renderizado-fallback" aria-hidden="true">{prod.emoji}</span>
                  
                  <button 
                    className="btn-guardar-favorito-corazon" 
                    onClick={(e) => { e.stopPropagation(); }}
                    aria-label="Guardar en favoritos"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  <div
                    className="producto-card-hover-bar"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setProductoSeleccionado(prod); 
                    }}
                  >
                    <span>{prod.stock ? 'Ver opciones / Añadir' : 'Sin Stock'}</span>
                  </div>
                </div>

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

      {/* 6. PANELES SECUNDARIOS: HECHO EN COLOMBIA Y ACCESORIOS DEBAJO */}
      {coleccionActiva === 'novedades' && (
        <section className="seccion-paneles-inferiores">
          <div className="container-tienda">
            <div className="grid-paneles-dobles">
              <div className="panel-inferior-item hecho-en-colombia">
                <div className="panel-inf-contenido">
                  <h2 className="panel-inf-titulo">HECHO EN COLOMBIA ★</h2>
                  <p className="panel-inf-texto">Diseñado y producido localmente con orgullo y propósito.</p>
                  <button className="panel-inf-btn">CONOCE MÁS</button>
                </div>
              </div>
              <div className="panel-inferior-item accesorios-destacados">
                <div className="panel-inf-contenido">
                  <h2 className="panel-inf-titulo">ACCESORIOS ★</h2>
                  <p className="panel-inf-texto">Pequeños detalles que dicen grandes cosas.</p>
                  <button className="panel-inf-btn">VER COLECCIÓN</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {toast && <div className="tienda-toast">✓ {toast}</div>}

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