import React, { useState } from 'react';

export function HeroManager() {
  const [slides, setSlides] = useState([
    {
      id: 1,
      orden: 1,
      label: 'Bienvenidos',
      titulo: 'Tu camino artístico',
      descripcion: 'Comienza aquí y descubre todo el talento y la cultura que tenemos para ofrecerte.',
      cta_label: 'Conoce más',
      cta_url: '#',
      img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
      activo: true
    }
  ]);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const current = slides[activeIndex] || slides[0];

  const update = (field, value) => {
    setSlides(slides.map((s, idx) => idx === activeIndex ? { ...s, [field]: value } : s));
  };

  const moveSlide = (direction) => {
    const newIndex = activeIndex + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[activeIndex];
    updated[activeIndex] = updated[newIndex];
    updated[newIndex] = temp;
    // Actualizar campo orden
    updated.forEach((s, idx) => { s.orden = idx + 1; });
    setSlides(updated);
    setActiveIndex(newIndex);
  };

  const addSlide = () => {
    const nuevoSlide = {
      id: Date.now(),
      orden: slides.length + 1,
      label: 'Nuevo Antetítulo',
      titulo: 'Título Principal',
      descripcion: 'Descripción o texto de apoyo opcional...',
      cta_label: '',
      cta_url: '',
      img: '',
      activo: true
    };
    setSlides([...slides, nuevoSlide]);
    setActiveIndex(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length === 1) {
      alert('Debe existir al menos un slide en el Hero.');
      return;
    }
    const updated = slides.filter((_, idx) => idx !== activeIndex);
    updated.forEach((s, idx) => { s.orden = idx + 1; });
    setSlides(updated);
    setActiveIndex(Math.max(0, activeIndex - 1));
  };

  return (
    <div style={styles.container}>
      {/* Cabecera */}
      <div style={styles.headerArea}>
        <div>
          <h2 style={styles.title}>Gestión del Hero</h2>
          <p style={styles.subtitle}>Administra los slides, orden y contenido del carrusel principal</p>
        </div>
        <button style={styles.addBtn} onClick={addSlide}>+ Añadir Slide</button>
      </div>

      {/* Selector de Slides (Paginador / Pestañas con controles de orden) */}
      <div style={styles.tabBarContainer}>
        <div style={styles.tabBar}>
          {slides.map((s, i) => (
            <button 
              key={s.id} 
              style={{...styles.tab, ...(activeIndex === i ? styles.tabActive : {}), opacity: s.activo ? 1 : 0.6}}
              onClick={() => setActiveIndex(i)}
            >
              <span>Slide {i + 1}: {s.titulo.substring(0, 15)}...</span>
              {!s.activo && <span style={{fontSize: '0.65rem', marginLeft: '6px'}}>(Oculto)</span>}
            </button>
          ))}
        </div>

        {/* Acciones de Orden y Borrado rápido */}
        <div style={styles.orderActions}>
          <button style={styles.smallActionBtn} onClick={() => moveSlide(-1)} disabled={activeIndex === 0} title="Mover a la izquierda">⬅️</button>
          <button style={styles.smallActionBtn} onClick={() => moveSlide(1)} disabled={activeIndex === slides.length - 1} title="Mover a la derecha">➡️</button>
          <button style={styles.deleteActionBtn} onClick={deleteSlide} title="Borrar slide">🗑️</button>
        </div>
      </div>

      {/* Formulario de Contenido */}
      <div style={styles.formCard}>
        
        {/* Controles de Estado y Orden */}
        <div style={styles.switchRow}>
          <label style={styles.switchLabel}>
            <input 
              type="checkbox" 
              checked={current.activo} 
              onChange={e => update('activo', e.target.checked)} 
            />
            <span>Mostrar Slide en Rotación (Activo)</span>
          </label>
          <div style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600'}}>
            Posición de Orden: #{current.orden}
          </div>
        </div>

        <div style={styles.row3}>
          <div style={styles.field}>
            <label style={styles.label}>Label / Antetítulo</label>
            <input style={styles.input} value={current.label} onChange={e => update('label', e.target.value)} placeholder="Ej. PRÓXIMO EVENTO" />
          </div>
          <div style={styles.field} style={{ gridColumn: 'span 2' }}>
            <label style={styles.label}>Título Principal</label>
            <input style={styles.input} value={current.titulo} onChange={e => update('titulo', e.target.value)} placeholder="Título principal del slide" />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Descripción (Texto largo opcional)</label>
          <textarea style={styles.textarea} value={current.descripcion} onChange={e => update('descripcion', e.target.value)} placeholder="Texto de apoyo bajo el título..." />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>CTA Label (Texto del Botón)</label>
            <input style={styles.input} value={current.cta_label} onChange={e => update('cta_label', e.target.value)} placeholder="Ej. Ver detalles" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>CTA URL (Enlace del Botón)</label>
            <input style={styles.input} value={current.cta_url} onChange={e => update('cta_url', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Imagen de Fondo (URL / Uploader obligatorio)</label>
          <input style={styles.input} value={current.img} onChange={e => update('img', e.target.value)} placeholder="https://images.unsplash.com/..." />
          {current.img && (
            <div style={styles.previewContainer}>
              <img src={current.img} alt="Vista previa fondo" style={styles.previewImg} />
            </div>
          )}
        </div>

        <button style={styles.saveBtn} onClick={() => alert('Cambios del Hero guardados correctamente')}>Guardar Cambios del Slide</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  headerArea: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.8rem', margin: 0, color: '#0f172a' },
  subtitle: { color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' },
  addBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  tabBarContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' },
  tabBar: { display: 'flex', gap: '0.5rem', overflowX: 'auto' },
  tab: { padding: '0.6rem 1rem', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', color: '#334155', display: 'flex', alignItems: 'center' },
  tabActive: { backgroundColor: '#ff2a74', color: '#fff', border: '1px solid #ff2a74', fontWeight: '600' },
  orderActions: { display: 'flex', gap: '0.4rem', paddingLeft: '0.5rem' },
  smallActionBtn: { padding: '0.5rem', background: '#fff', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer' },
  deleteActionBtn: { padding: '0.5rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer' },
  formCard: { backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
  switchRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' },
  switchLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#334155', cursor: 'pointer' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  row3: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.2rem' },
  label: { fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' },
  input: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '0.95rem', boxSizing: 'border-box', width: '100%' },
  textarea: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', minHeight: '90px', fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' },
  previewContainer: { marginTop: '0.5rem', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e0', background: '#f1f5f9' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  saveBtn: { marginTop: '1rem', padding: '1rem 2rem', backgroundColor: '#ff2a74', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1rem', transition: 'background 0.2s' }
};