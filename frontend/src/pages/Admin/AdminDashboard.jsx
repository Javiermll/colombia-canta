import React, { useState, useEffect } from 'react';

// Fallback seguro por si la variable de entorno de Vite no está definida
const base = import.meta.env?.BASE_URL || "/";

const slidesPorDefecto = [
  {
    id: "bienvenida",
    label: "Inicio",
    titulo: "Donde Colombia canta, baila y <span class='hero-titulo-acento'>encanta</span>",
    descripcion: "Somos una comunidad artística que preserva y proyecta el folclor colombiano a través de la formación.",
    imagen: "hero-slides/bienvenida.webp",
  },
  {
    id: "quienes-somos",
    label: "Escuela",
    titulo: "Tu camino artístico <span class='hero-titulo-acento'>comienza</span> aquí",
    descripcion: "No importa si estás empezando o quieres fortalecer tu talento.",
    imagen: "hero-slides/quienes-somos.webp",
  }
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('hero');
  const [slides, setSlides] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Estados del formulario
  const [label, setLabel] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');

  // Carga inicial ultra segura con try/catch para evitar pantallas en blanco
  useEffect(() => {
    try {
      const guardados = localStorage.getItem("hero_slides");
      if (guardados) {
        const parseados = JSON.parse(guardados);
        if (Array.isArray(parseados)) {
          setSlides(parseados);
        } else {
          throw new Error("Los datos no son un array");
        }
      } else {
        setSlides(slidesPorDefecto);
        localStorage.setItem("hero_slides", JSON.stringify(slidesPorDefecto));
      }
    } catch (error) {
      console.warn("Error al leer localStorage, restaurando valores por defecto:", error);
      setSlides(slidesPorDefecto);
      localStorage.setItem("hero_slides", JSON.stringify(slidesPorDefecto));
    }
  }, []);

  const guardarEnStorage = (nuevosSlides) => {
    try {
      setSlides(nuevosSlides);
      localStorage.setItem("hero_slides", JSON.stringify(nuevosSlides));
    } catch (error) {
      console.error("No se pudo guardar en localStorage", error);
    }
  };

  const handleSubmitHero = (e) => {
    e.preventDefault();
    
    if (!label.trim() || !titulo.trim() || !descripcion.trim()) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (editingId) {
      const actualizados = slides.map(s => s.id === editingId ? { 
        ...s, 
        label: label.trim(), 
        titulo: titulo.trim(), 
        descripcion: descripcion.trim(), 
        imagen: imagen.trim() || "hero-slides/bienvenida.webp"
      } : s);
      guardarEnStorage(actualizados);
      setEditingId(null);
    } else {
      const nuevo = {
        id: Date.now().toString(),
        label: label.trim(),
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        imagen: imagen.trim() || "hero-slides/bienvenida.webp",
        ctas: [{ label: "Explorar", to: "/", primario: true }]
      };
      guardarEnStorage([...slides, nuevo]);
    }

    setLabel('');
    setTitulo('');
    setDescripcion('');
    setImagen('');
  };

  const iniciarEdicion = (slide) => {
    if (!slide) return;
    setEditingId(slide.id);
    setLabel(slide.label || '');
    setTitulo(slide.titulo || '');
    setDescripcion(slide.descripcion || '');
    setImagen(slide.imagen || '');
  };

  const eliminarSlide = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta diapositiva?")) {
      const filtrados = slides.filter(s => s.id !== id);
      guardarEnStorage(filtrados);
    }
  };

  const obtenerRutaImagen = (imgStr) => {
    if (!imgStr) return `${base}hero-slides/bienvenida.webp`;
    if (imgStr.startsWith("http://") || imgStr.startsWith("https://") || imgStr.startsWith("data:")) {
      return imgStr;
    }
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanImg = imgStr.startsWith('/') ? imgStr.slice(1) : imgStr;
    return `${cleanBase}${cleanImg}`;
  };

  return (
    <div className="admin-container" style={styles.container}>
      
      {/* 1. BARRA LATERAL (Sidebar) */}
      <aside style={styles.sidebar}>
        <div style={styles.brandArea}>
          <span style={styles.brandText}>Colombia Canta</span>
          <span style={styles.brandSub}>PANEL DE CONTROL</span>
        </div>
        
        <nav style={styles.navMenu}>
          <button 
            type="button"
            style={{...styles.navItem, ...(activeTab === 'hero' ? styles.navItemActive : {})}} 
            onClick={() => setActiveTab('hero')}
          >
            🖼️ Carrusel (Hero)
          </button>
          
          <button 
            type="button"
            style={{...styles.navItem, ...(activeTab === 'eventos' ? styles.navItemActive : {})}} 
            onClick={() => setActiveTab('eventos')}
          >
            📅 Próximos Eventos
          </button>

          <button 
            type="button"
            style={{...styles.navItem, ...(activeTab === 'tienda' ? styles.navItemActive : {})}} 
            onClick={() => setActiveTab('tienda')}
          >
            🛍️ Tienda / Colección
          </button>

          <button 
            type="button"
            style={{...styles.navItem, ...(activeTab === 'inscripciones' ? styles.navItemActive : {})}} 
            onClick={() => setActiveTab('inscripciones')}
          >
            📝 Inscripciones
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Sesión activa: Admin</p>
        </div>
      </aside>

      {/* 2. ÁREA DE TRABAJO PRINCIPAL */}
      <main style={styles.mainContent}>
        
        {/* TAB ACTIVE: HERO */}
        {activeTab === 'hero' && (
          <div>
            <header style={styles.contentHeader}>
              <div>
                <h1 style={styles.title}>Gestor de Banner Principal (Hero)</h1>
                <p style={styles.subtitle}>Agrega, edita o remueve las diapositivas del carrusel en tiempo real.</p>
              </div>
            </header>

            <div style={styles.workspaceGrid}>
              
              {/* Formulario Lateral */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  {editingId ? "📝 Editar Diapositiva" : "✨ Nueva Diapositiva"}
                </h3>
                
                <form onSubmit={handleSubmitHero} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Etiqueta del Indicador</label>
                    <input 
                      type="text" 
                      value={label} 
                      onChange={e => setLabel(e.target.value)} 
                      required 
                      placeholder="Ej: Escuela, Festival, Evento"
                      style={styles.input} 
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Título (Permite tags HTML como &lt;span&gt;)</label>
                    <input 
                      type="text" 
                      value={titulo} 
                      onChange={e => setTitulo(e.target.value)} 
                      required 
                      placeholder="Donde Colombia canta y <span class='hero-titulo-acento'>encanta</span>"
                      style={styles.input} 
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Descripción Breve</label>
                    <textarea 
                      value={descripcion} 
                      onChange={e => setDescripcion(e.target.value)} 
                      required 
                      placeholder="Escribe un párrafo de presentación..."
                      style={{...styles.input, height: '90px', resize: 'none'}} 
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Imagen (Ruta local o URL)</label>
                    <input 
                      type="text" 
                      value={imagen} 
                      onChange={e => setImagen(e.target.value)} 
                      placeholder="Ej: hero-slides/tienda.webp"
                      style={styles.input} 
                    />
                  </div>

                  <div style={styles.buttonGroup}>
                    <button type="submit" style={styles.btnPrimary}>
                      {editingId ? "Guardar Cambios" : "Añadir al Carrusel"}
                    </button>
                    {editingId && (
                      <button 
                        type="button" 
                        onClick={() => { setEditingId(null); setLabel(''); setTitulo(''); setDescripcion(''); setImagen(''); }} 
                        style={styles.btnCancel}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Lista Visual de Diapositivas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h3 style={styles.cardTitle}>Diapositivas Activas ({slides.length})</h3>
                
                <div style={styles.slidesList}>
                  {slides.map((slide) => (
                    <div key={slide.id} style={styles.slideCard}>
                      <div style={styles.slideImageWrapper}>
                        <img 
                          src={obtenerRutaImagen(slide.imagen)} 
                          alt={slide.label || 'slide'} 
                          style={styles.slideImage} 
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300&auto=format&fit=crop";
                          }}
                        />
                        <span style={styles.slideBadge}>{slide.label}</span>
                      </div>
                      
                      <div style={styles.slideDetails}>
                        <h4 
                          style={styles.slideTitleText} 
                          dangerouslySetInnerHTML={{ __html: slide.titulo || '' }} 
                        />
                        <p style={styles.slideDescText}>{slide.descripcion}</p>
                        
                        <div style={styles.slideActions}>
                          <button type="button" onClick={() => iniciarEdicion(slide)} style={styles.btnEdit}>
                            ⚙️ Editar
                          </button>
                          <button type="button" onClick={() => eliminarSlide(slide.id)} style={styles.btnDelete}>
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Marcadores de posición */}
        {activeTab === 'eventos' && (
          <div style={styles.emptyState}>
            <h2>📅 Gestor de Eventos</h2>
            <p>Módulo de administración en construcción para eventos y boletería.</p>
          </div>
        )}

        {activeTab === 'tienda' && (
          <div style={styles.emptyState}>
            <h2>🛍️ Gestor de Tienda</h2>
            <p>Módulo de administración en construcción para productos e inventarios.</p>
          </div>
        )}

        {activeTab === 'inscripciones' && (
          <div style={styles.emptyState}>
            <h2>📝 Inscripciones de Alumnos</h2>
            <p>Módulo en construcción para verificar matrículas recibidas.</p>
          </div>
        )}

      </main>
    </div>
  );
}

// Estilos limpios, ahora adaptados al Navbar
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '"Poppins", system-ui, sans-serif',
    backgroundColor: '#f5f7fb',
    color: '#2d3748',
    paddingTop: '80px', // Empuja todo el dashboard hacia abajo del Navbar
    boxSizing: 'border-box',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#1a202c',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 1rem',
    borderRight: '1px solid #2d3748',
    position: 'fixed',
    top: '80px', // Empieza justo debajo del Navbar
    height: 'calc(100vh - 80px)', // Ocupa todo el alto restante sin desbordarse
    boxSizing: 'border-box',
    zIndex: 10,
  },
  brandArea: {
    marginBottom: '2.5rem',
    paddingLeft: '0.8rem',
  },
  brandText: {
    display: 'block',
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#ff2a74',
  },
  brandSub: {
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '2px',
    color: '#a0aec0',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    flex: 1,
  },
  navItem: {
    background: 'none',
    border: 'none',
    color: '#cbd5e0',
    padding: '0.8rem 1rem',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontWeight: '500',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    backgroundColor: '#ff2a74',
    color: '#fff',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(255, 42, 116, 0.3)',
  },
  sidebarFooter: {
    borderTop: '1px solid #2d3748',
    paddingTop: '1rem',
    textAlign: 'center',
  },
  mainContent: {
    marginLeft: '260px', // Da espacio a la barra lateral izquierda
    flex: 1,
    padding: '3rem',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  contentHeader: {
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: 0,
    color: '#1a202c',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#718096',
    margin: '0.3rem 0 0 0',
  },
  workspaceGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1.3fr',
    gap: '2.5rem',
    alignItems: 'start',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    margin: '0 0 1.5rem 0',
    color: '#2d3748',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4a5568',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#ff2a74',
    color: '#fff',
    border: 'none',
    padding: '0.8rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnCancel: {
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    border: 'none',
    padding: '0.8rem 1.2rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  slidesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  slideCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  slideImageWrapper: {
    position: 'relative',
    width: '140px',
    minWidth: '140px',
    backgroundColor: '#edf2f7',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  slideBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '2px 8px',
    fontSize: '0.7rem',
    borderRadius: '4px',
    fontWeight: '600',
  },
  slideDetails: {
    padding: '1.2rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  slideTitleText: {
    fontSize: '1rem',
    margin: 0,
    color: '#1a202c',
    lineHeight: '1.4',
  },
  slideDescText: {
    fontSize: '0.8rem',
    color: '#718096',
    margin: '0.4rem 0 1rem 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  slideActions: {
    display: 'flex',
    gap: '0.8rem',
  },
  btnEdit: {
    backgroundColor: '#fff',
    color: '#4a5568',
    border: '1px solid #cbd5e0',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDelete: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    border: '1px solid #fed7d7',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    color: '#718096',
  }
};

export default AdminDashboard;