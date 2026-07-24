import React, { useState } from 'react';

export function EventosManager() {
  const [eventos, setEventos] = useState([
    {
      id: 1,
      titulo: 'Festival Nacional de la Cumbia',
      slug: 'festival-nacional-de-la-cumbia',
      tipo: 'Festival',
      fecha: '23-26 de julio',
      fecha_iso: '2026-07-23',
      fecha_iso_fin: '2026-07-26',
      fecha_completa: 'Miércoles 23 al Sábado 26 de julio, 2026',
      ciudad: 'Medellín',
      lugar: 'Teatro Metropolitano',
      direccion: 'Calle 41 # 57-30',
      hora: '19:00',
      puertas: '18:00',
      img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
      galeria: ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a'],
      pills: [{ icono: '🎶', texto: 'Tradición' }],
      descripcion: 'Gran encuentro cultural de música y danza tradicional.',
      descripcion_larga: 'Cuatro días de presentaciones magistrales con delegaciones de todo el país rindiendo homenaje a la cumbia.',
      programa: [{ hora: '19:00', actividad: 'Apertura de Gala' }],
      testimonios: [],
      color: '#ff2a74',
      color_hero: '#0f172a',
      precio: '$45.000',
      precio_detalle: 'Aplica descuento para estudiantes',
      zonas: [{ nombre: 'General', precio: 45000 }, { nombre: 'VIP', precio: 80000 }],
      max_entradas: 5,
      accion_tipo: 'festival',
      cta: 'Comprar Entradas',
      cta_wa: 'https://wa.me/573000000000',
      wa_link: 'https://wa.me/573000000000',
      inscripcion_cerrada: false,
      inscripcion_link: '',
      bases: '',
      destacado_hero: true,
      activo: true
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Filtros de búsqueda y estados
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterAccion, setFilterAccion] = useState('todos');

  const [form, setForm] = useState({
    titulo: '',
    slug: '',
    tipo: 'Festival',
    fecha: '',
    fecha_iso: '',
    fecha_iso_fin: '',
    fecha_completa: '',
    ciudad: '',
    lugar: '',
    direccion: '',
    hora: '',
    puertas: '',
    img: '',
    galeria: '',
    descripcion: '',
    descripcion_larga: '',
    color: '#ff2a74',
    color_hero: '#0f172a',
    precio: '',
    precio_detalle: '',
    max_entradas: 5,
    accion_tipo: 'libre',
    cta: 'Ver más',
    cta_wa: '',
    wa_link: '',
    inscripcion_cerrada: false,
    inscripcion_link: '',
    bases: '',
    destacado_hero: false,
    activo: true
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({
      titulo: '',
      slug: '',
      tipo: 'Festival',
      fecha: '',
      fecha_iso: '',
      fecha_iso_fin: '',
      fecha_completa: '',
      ciudad: '',
      lugar: '',
      direccion: '',
      hora: '',
      puertas: '',
      img: '',
      galeria: '',
      descripcion: '',
      descripcion_larga: '',
      color: '#ff2a74',
      color_hero: '#0f172a',
      precio: 'Entrada libre',
      precio_detalle: '',
      max_entradas: 5,
      accion_tipo: 'libre',
      cta: 'Participar',
      cta_wa: '',
      wa_link: '',
      inscripcion_cerrada: false,
      inscripcion_link: '',
      bases: '',
      destacado_hero: false,
      activo: true
    });
  };

  const handleOpenEdit = (evento) => {
    setIsEditing(true);
    setCurrentId(evento.id);
    setForm({
      ...evento,
      galeria: Array.isArray(evento.galeria) ? evento.galeria.join(', ') : evento.galeria
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fecha_iso) {
      alert('Por favor completa al menos el título y la fecha ISO del evento.');
      return;
    }

    // Regla: Solo un evento puede tener destacado_hero en true
    let updatedEventos = [...eventos];
    if (form.destacado_hero) {
      updatedEventos = updatedEventos.map(ev => ({
        ...ev,
        destacado_hero: ev.id === currentId ? true : false
      }));
    }

    const payload = {
      ...form,
      galeria: typeof form.galeria === 'string' ? form.galeria.split(',').map(s => s.trim()).filter(Boolean) : form.galeria
    };

    if (isEditing) {
      setEventos(updatedEventos.map(ev => ev.id === currentId ? { ...payload, id: currentId } : ev));
      alert('Evento actualizado exitosamente');
    } else {
      const nuevoEvento = { ...payload, id: Date.now() };
      setEventos(form.destacado_hero ? [...updatedEventos, nuevoEvento] : [...eventos, nuevoEvento]);
      alert('Evento creado exitosamente');
    }
    handleOpenCreate();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este evento definitivamente?')) {
      setEventos(eventos.filter(ev => ev.id !== id));
      if (currentId === id) handleOpenCreate();
    }
  };

  const handleToggleActivo = (id) => {
    setEventos(eventos.map(ev => ev.id === id ? { ...ev, activo: !ev.activo } : ev));
  };

  // Filtrado de la lista
  const filteredEventos = eventos.filter(ev => {
    const matchesSearch = ev.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || ev.tipo === filterTipo;
    const matchesAccion = filterAccion === 'todos' || ev.accion_tipo === filterAccion;
    return matchesSearch && matchesTipo && matchesAccion;
  });

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.title}>Gestión de Eventos y Giras</h2>
          <p style={styles.subtitle}>Colección dinámica: crea, edita, filtra y borra eventos libremente</p>
        </div>
        <button style={styles.createBtn} onClick={handleOpenCreate}>
          + Nuevo Evento / Gira
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div style={styles.filterBar}>
        <input 
          style={styles.searchInput} 
          placeholder="🔍 Buscar por título..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select style={styles.filterSelect} value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          <option value="Festival">Festival</option>
          <option value="Gira USA">Gira USA</option>
          <option value="Sede">Sede</option>
        </select>
        <select style={styles.filterSelect} value={filterAccion} onChange={e => setFilterAccion(e.target.value)}>
          <option value="todos">Todos los CTA (Acción)</option>
          <option value="libre">Libre</option>
          <option value="pago">Pago</option>
          <option value="festival">Festival</option>
          <option value="proximamente">Próximamente</option>
        </select>
      </div>

      <div style={styles.mainGrid}>
        {/* LISTADO DE EVENTOS */}
        <div style={styles.listSection}>
          <h3 style={styles.sectionHeading}>Eventos Encontrados ({filteredEventos.length})</h3>
          {filteredEventos.length === 0 ? (
            <p style={styles.emptyText}>No hay eventos que coincidan con los filtros.</p>
          ) : (
            filteredEventos.map(ev => (
              <div 
                key={ev.id} 
                style={{
                  ...styles.card, 
                  borderColor: currentId === ev.id && isEditing ? '#ff2a74' : '#e2e8f0',
                  background: currentId === ev.id && isEditing ? '#fff5f7' : '#fff',
                  opacity: ev.activo ? 1 : 0.6
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={{display: 'flex', gap: '6px'}}>
                    <span style={styles.badge}>{ev.tipo}</span>
                    <span style={styles.badgeAction}>{ev.accion_tipo}</span>
                    {ev.destacado_hero && <span style={styles.badgeHero}>⭐ Destacado Hero</span>}
                  </div>
                  <button 
                    style={{...styles.statusToggle, color: ev.activo ? '#10b981' : '#94a3b8'}}
                    onClick={() => handleToggleActivo(ev.id)}
                  >
                    {ev.activo ? '● Activo' : '○ Oculto'}
                  </button>
                </div>
                <h4 style={styles.cardTitle}>{ev.titulo}</h4>
                <p style={styles.cardInfo}>📅 {ev.fecha} ({ev.fecha_iso}) | 📍 {ev.ciudad}</p>
                <p style={styles.cardDesc}>{ev.descripcion}</p>
                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => handleOpenEdit(ev)}>Editar</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(ev.id)}>Borrar</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FORMULARIO CRUD COMPLETO */}
        <div style={styles.formSection}>
          <h3 style={styles.sectionHeading}>
            {isEditing ? `✏️ Editando Evento (ID: ${currentId})` : '➕ Crear Nuevo Evento'}
          </h3>
          <form onSubmit={handleSave} style={styles.form}>
            
            <div style={styles.checkboxGroup}>
              <label style={styles.switchLabel}>
                <input 
                  type="checkbox" 
                  checked={form.activo} 
                  onChange={e => setForm({...form, activo: e.target.checked})} 
                />
                <span>Evento Activo en Sitio</span>
              </label>
              <label style={styles.switchLabel}>
                <input 
                  type="checkbox" 
                  checked={form.destacado_hero} 
                  onChange={e => {
                    const val = e.target.checked;
                    if (val) alert('⚠️ Al destacar este evento, se desmarcará automáticamente cualquier otro evento destacado en el Hero.');
                    setForm({...form, destacado_hero: val});
                  }} 
                />
                <span>⭐ Destacado en el Hero (Único)</span>
              </label>
            </div>

            <div style={styles.sectionDivider}>1. Identificación y Tipo</div>
            <div>
              <label style={styles.label}>Título</label>
              <input style={styles.input} value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ej. Concierto de Verano" />
            </div>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Slug (URL única)</label>
                <input style={styles.input} value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="concierto-de-verano" />
              </div>
              <div>
                <label style={styles.label}>Tipo de Evento</label>
                <select style={styles.input} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                  <option value="Festival">Festival</option>
                  <option value="Gira USA">Gira USA</option>
                  <option value="Sede">Sede</option>
                </select>
              </div>
            </div>

            <div style={styles.sectionDivider}>2. Fechas, Horarios y Ubicación</div>
            <div>
              <label style={styles.label}>Fecha Visible (Ej. "23-26 de julio")</label>
              <input style={styles.input} value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} placeholder="23-26 de julio" />
            </div>
            <div style={styles.row3}>
              <div>
                <label style={styles.label}>Fecha ISO (Inicio)</label>
                <input type="date" style={styles.input} value={form.fecha_iso} onChange={e => setForm({...form, fecha_iso: e.target.value})} />
              </div>
              <div>
                <label style={styles.label}>Fecha ISO Fin (Opcional)</label>
                <input type="date" style={styles.input} value={form.fecha_iso_fin} onChange={e => setForm({...form, fecha_iso_fin: e.target.value})} />
              </div>
              <div>
                <label style={styles.label}>Ciudad</label>
                <input style={styles.input} value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} placeholder="Medellín" />
              </div>
            </div>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Lugar / Recinto</label>
                <input style={styles.input} value={form.lugar} onChange={e => setForm({...form, lugar: e.target.value})} placeholder="Teatro Metropolitano" />
              </div>
              <div>
                <label style={styles.label}>Dirección</label>
                <input style={styles.input} value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Calle 41 # 57-30" />
              </div>
            </div>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Hora</label>
                <input style={styles.input} value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} placeholder="19:00" />
              </div>
              <div>
                <label style={styles.label}>Puertas</label>
                <input style={styles.input} value={form.puertas} onChange={e => setForm({...form, puertas: e.target.value})} placeholder="18:00" />
              </div>
            </div>

            <div style={styles.sectionDivider}>3. Comportamiento del CTA (Botón)</div>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Acción Tipo (Controla Flujo)</label>
                <select style={styles.input} value={form.accion_tipo} onChange={e => setForm({...form, accion_tipo: e.target.value})}>
                  <option value="libre">Libre</option>
                  <option value="pago">Pago</option>
                  <option value="festival">Festival</option>
                  <option value="proximamente">Próximamente</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Texto del Botón (CTA)</label>
                <input style={styles.input} value={form.cta} onChange={e => setForm({...form, cta: e.target.value})} placeholder="Comprar Entradas" />
              </div>
            </div>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Link WhatsApp Alternativo</label>
                <input style={styles.input} value={form.wa_link} onChange={e => setForm({...form, wa_link: e.target.value})} placeholder="https://wa.me/..." />
              </div>
              <div>
                <label style={styles.label}>Link Formulario Externo (Opcional)</label>
                <input style={styles.input} value={form.inscripcion_link} onChange={e => setForm({...form, inscripcion_link: e.target.value})} placeholder="https://forms.gle/..." />
              </div>
            </div>
            <div style={styles.checkboxGroup}>
              <label style={styles.switchLabel}>
                <input 
                  type="checkbox" 
                  checked={form.inscripcion_cerrada} 
                  onChange={e => setForm({...form, inscripcion_cerrada: e.target.checked})} 
                />
                <span>Inscripción Cerrada (Bloquea botón)</span>
              </label>
            </div>

            <div style={styles.sectionDivider}>4. Contenido Visual y Textos</div>
            <div>
              <label style={styles.label}>URL Imagen Principal</label>
              <input style={styles.input} value={form.img} onChange={e => setForm({...form, img: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <label style={styles.label}>Galería (URLs separadas por comas)</label>
              <input style={styles.input} value={form.galeria} onChange={e => setForm({...form, galeria: e.target.value})} placeholder="url1, url2..." />
            </div>
            <div>
              <label style={styles.label}>Descripción Corta</label>
              <textarea style={styles.textareaSmall} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Descripción Larga</label>
              <textarea style={styles.textarea} value={form.descripcion_larga} onChange={e => setForm({...form, descripcion_larga: e.target.value})} />
            </div>

            <div style={styles.sectionDivider}>5. Precios y Cupos</div>
            <div style={styles.row3}>
              <div>
                <label style={styles.label}>Precio (Texto)</label>
                <input style={styles.input} value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} placeholder="$45.000" />
              </div>
              <div>
                <label style={styles.label}>Detalle de Precio</label>
                <input style={styles.input} value={form.precio_detalle} onChange={e => setForm({...form, precio_detalle: e.target.value})} placeholder="Descuento estudiantes" />
              </div>
              <div>
                <label style={styles.label}>Máx. Entradas</label>
                <input type="number" style={styles.input} value={form.max_entradas} onChange={e => setForm({...form, max_entradas: Number(e.target.value)})} />
              </div>
            </div>

            <div style={styles.formButtons}>
              {isEditing && (
                <button type="button" style={styles.cancelBtn} onClick={handleOpenCreate}>Cancelar</button>
              )}
              <button type="submit" style={styles.submitBtn}>
                {isEditing ? 'Guardar Cambios' : 'Crear Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', margin: 0, color: '#0f172a' },
  subtitle: { color: '#64748b', margin: '0.5rem 0', fontSize: '0.95rem' },
  createBtn: { background: '#ff2a74', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '1rem', marginBottom: '2rem', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' },
  searchInput: { flex: 2, padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '0.9rem' },
  filterSelect: { flex: 1, padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '0.9rem', background: '#fff' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 480px', gap: '2rem', alignItems: 'start' },
  listSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  sectionHeading: { fontSize: '1rem', color: '#1e293b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' },
  emptyText: { color: '#64748b', fontSize: '0.9rem' },
  card: { background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)', transition: '0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  badge: { fontSize: '0.65rem', background: '#f1f5f9', color: '#ff2a74', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  badgeAction: { fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  badgeHero: { fontSize: '0.65rem', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  statusToggle: { background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' },
  cardTitle: { fontSize: '1.1rem', color: '#0f172a', margin: '0 0 0.3rem 0' },
  cardInfo: { fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem 0' },
  cardDesc: { fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  editBtn: { background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' },
  formSection: { background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'sticky', top: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  sectionDivider: { fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginTop: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.3rem', textTransform: 'uppercase' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' },
  row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.2rem' },
  input: { width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e0', boxSizing: 'border-box', fontSize: '0.85rem' },
  textarea: { width: '100%', padding: '0.6rem', height: '70px', borderRadius: '8px', border: '1px solid #cbd5e0', boxSizing: 'border-box', fontSize: '0.85rem', fontFamily: 'inherit' },
  textareaSmall: { width: '100%', padding: '0.6rem', height: '50px', borderRadius: '8px', border: '1px solid #cbd5e0', boxSizing: 'border-box', fontSize: '0.85rem', fontFamily: 'inherit' },
  checkboxGroup: { display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' },
  switchLabel: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: '#334155', cursor: 'pointer' },
  formButtons: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  cancelBtn: { flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  submitBtn: { flex: 2, background: '#ff2a74', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};