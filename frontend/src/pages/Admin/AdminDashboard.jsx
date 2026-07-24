import React, { useState } from 'react';
import { HeroManager } from './modules/HeroManager';
import { EventosManager } from './modules/EventosManager';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('hero');

  const menuItems = [
    { id: 'hero', label: '🖼️ Carrusel (Hero)' },
    { id: 'eventos', label: '📅 Próximos Eventos' },
    { id: 'tienda', label: '🛍️ Tienda / Colección' },
    { id: 'inscripciones', label: '📝 Inscripciones' }
  ];

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.brandArea}>
          <span style={styles.brandText}>Colombia Canta</span>
          <span style={styles.brandSub}>PANEL DE CONTROL</span>
        </div>
        <nav style={styles.navMenu}>
          {menuItems.map(item => (
            <button key={item.id} style={{...styles.navItem, ...(activeTab === item.id ? styles.navItemActive : {})}} onClick={() => setActiveTab(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main style={styles.mainContent}>
        {activeTab === 'hero' && <HeroManager />}
        {activeTab === 'eventos' && <EventosManager />}
        {['tienda', 'inscripciones'].includes(activeTab) && (
          <div style={styles.emptyState}><h2>🚧 En construcción</h2><p>Módulo de {activeTab} en desarrollo.</p></div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui' },
  sidebar: { width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '2rem 1.5rem', position: 'fixed', height: '100vh' },
  brandArea: { marginBottom: '3rem' },
  brandText: { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', display: 'block' },
  brandSub: { fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.15rem', textTransform: 'uppercase' },
  navMenu: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  navItem: { background: 'none', border: 'none', color: '#64748b', padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
  navItemActive: { backgroundColor: '#f1f5f9', color: '#ff2a74', fontWeight: '600' },
  mainContent: { marginLeft: '280px', flex: 1, padding: '3rem' },
  emptyState: { textAlign: 'center', padding: '6rem 2rem', border: '1px dashed #cbd5e0', borderRadius: '16px', color: '#64748b' }
};