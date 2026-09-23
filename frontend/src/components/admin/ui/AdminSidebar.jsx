import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Image,
  Newspaper,
  PartyPopper,
  CalendarDays,
  ShoppingBag,
  GraduationCap,
  ClipboardList,
  Ticket,
  Package,
  Mail,
  Users,
  History,
  QrCode,
  Percent,
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';

// 5.2 · Decisión del usuario (2026-08-14): el menú solo muestra secciones que
// ya existen de verdad — nada de links "próximamente" a Eventos/Tienda/etc.
// Se agrega una entrada acá mismo cuando la pantalla real quede construida.
// ⭐ Íconos pasados de emoji a lucide-react (pedido del usuario, 2026-09-07)
// — se veían inconsistentes entre sistemas operativos/navegadores; con SVG
// + `currentColor` además heredan gratis el color coral del link activo.
const SECCIONES = [
  { to: '/admin/hero', label: 'Carrusel (Hero)', Icono: Image },
  { to: '/admin/noticias', label: 'Noticias', Icono: Newspaper },
  { to: '/admin/eventos', label: 'Eventos', Icono: PartyPopper },
  { to: '/admin/eventos-fijos', label: 'Eventos Fijos', Icono: CalendarDays },
  { to: '/admin/productos', label: 'Productos', Icono: ShoppingBag },
  { to: '/admin/cupones', label: 'Cupones', Icono: Percent },
  { to: '/admin/cursos', label: 'Cursos', Icono: GraduationCap },
  { to: '/admin/inscripciones', label: 'Inscripciones', Icono: ClipboardList },
  { to: '/admin/reservas', label: 'Reservas', Icono: Ticket },
  { to: '/admin/pedidos', label: 'Pedidos', Icono: Package },
  { to: '/admin/contacto', label: 'Contacto', Icono: Mail },
];

// 5.7 · Aparte del array de arriba porque estas entradas no son para todos los
// admins. Administradores: solo el maestro puede invitar/desactivar/resetear
// MFA de otros. Historial (agregado 2026-08-31, a pedido del usuario): ve la
// actividad de TODOS los admins, no solo la propia, así que se restringe al
// mismo criterio (también reforzado server-side, ver `requireRole` en
// `backend/src/index.js` — esto no es solo un ajuste visual).
const SECCIONES_MAESTRO = [
  { to: '/admin/administradores', label: 'Administradores', Icono: Users },
  { to: '/admin/historial', label: 'Historial', Icono: History },
];

// ⭐ Ajuste 5.2 (2026-08-14, pedido tras probar el panel real): en tablet/
// mobile (≤1024px, mismo corte que ya usa el Navbar del sitio público — ver
// Navbar.css) el menú lateral fijo de 240px ya no cabe junto al contenido.
// Se convierte en un panel deslizable con el mismo patrón que el drawer del
// Navbar público (fondo oscuro + `aside` que entra desde la izquierda) para
// que la interacción le resulte familiar a alguien no técnico que ya usó el
// menú del sitio — no un patrón nuevo que aprender.
export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [abierto, setAbierto] = useState(false);

  // ⭐ Hallazgo real (revisión crítica 5.2, 2026-08-15): el `<aside>` solo se
  // comporta como drawer colapsable en ≤1024px (ver AdminLayout.css) — en
  // desktop es un menú fijo siempre visible, `abierto` nunca pasa a `true`
  // ahí porque el botón hamburguesa que lo cambia ni se muestra. Marcar
  // `aria-hidden={!abierto}` sin este chequeo habría escondido el menú
  // COMPLETO de lectores de pantalla en desktop, todo el tiempo — hace falta
  // saber si estamos en modo drawer antes de usar `abierto` para eso.
  const [esDrawer, setEsDrawer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const escuchar = (e) => setEsDrawer(e.matches);
    mq.addEventListener('change', escuchar);
    return () => mq.removeEventListener('change', escuchar);
  }, []);

  // Cierra el drawer al navegar (link, atrás/adelante del navegador, o
  // navigate() programático) — ajustado durante el render en vez de en un
  // efecto (mismo criterio que ya usa este proyecto, ver Hero.jsx/Noticias.jsx
  // y https://react.dev/learn/you-might-not-need-an-effect), para no violar
  // react-hooks/set-state-in-effect con un setState síncrono.
  const [ultimaLocationKey, setUltimaLocationKey] = useState(location.key);
  if (location.key !== ultimaLocationKey) {
    setUltimaLocationKey(location.key);
    setAbierto(false);
  }

  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [abierto]);

  async function manejarLogout() {
    await logout();
    navigate('/admin/login');
  }

  return (
    <>
      <div className="admin-topbar">
        <button
          className="admin-topbar-hamburger"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú del panel"
          aria-expanded={abierto}
          aria-controls="admin-sidebar-drawer"
        >
          <span />
          <span />
          <span />
        </button>
        <p className="admin-topbar-titulo">Panel de control</p>
      </div>

      <div
        className={`admin-sidebar-backdrop${abierto ? ' abierto' : ''}`}
        onClick={() => setAbierto(false)}
        aria-hidden="true"
      />

      {/* ⭐ Hallazgo real (revisión crítica 5.2, 2026-08-15): el comentario de
         arriba decía "mismo patrón que el drawer del Navbar público" pero
         faltaba justamente el `aria-hidden` que ese drawer sí tiene (ver
         Navbar.jsx) — sin esto, un lector de pantalla podía anunciar los
         links del menú como disponibles aunque estuvieran fuera de pantalla
         (con `transform`, no `display:none`) mientras el drawer está cerrado. */}
      <aside id="admin-sidebar-drawer" aria-hidden={esDrawer && !abierto} className={`admin-sidebar${abierto ? ' abierto' : ''}`}>
        <div className="admin-sidebar-header">
          <p className="admin-sidebar-titulo">Panel de control</p>
          <button
            className="admin-sidebar-cerrar"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          {SECCIONES.map((s) => {
            // ⭐ Hallazgo real (pedido del usuario, 2026-09-07): `startsWith`
            // marcaba "Eventos" Y "Eventos Fijos" activos a la vez estando en
            // /admin/eventos-fijos, porque ese path también empieza con
            // "/admin/eventos". Todas las rutas del panel son planas (sin
            // sub-rutas tipo /admin/eventos/:id) — comparar exacto alcanza.
            const activo = location.pathname === s.to;
            return (
              <Link key={s.to} to={s.to} className={`admin-sidebar-link${activo ? ' activo' : ''}`}>
                <s.Icono className="admin-sidebar-icono" aria-hidden="true" size={18} strokeWidth={2} />
                {s.label}
              </Link>
            );
          })}
          {admin?.rol === 'admin_maestro' && SECCIONES_MAESTRO.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className={`admin-sidebar-link${location.pathname === s.to ? ' activo' : ''}`}
            >
              <s.Icono className="admin-sidebar-icono" aria-hidden="true" size={18} strokeWidth={2} />
              {s.label}
            </Link>
          ))}

          {/* ⭐ Pedido del usuario (2026-09-10): acceso fácil a la pantalla de
             puerta (/puerta) desde ADENTRO del panel — antes solo se llegaba
             escribiendo la URL a mano. Nunca en el footer público (esa
             pantalla queda protegida por su propio PIN, pero no tiene
             sentido anunciarla a cualquier visitante del sitio). Abre en
             pestaña nueva porque es una experiencia aparte, sin Navbar/menú
             del panel (ver App.jsx) — pensada para el celular del staff, no
             para navegarse desde acá. */}
          <div className="admin-sidebar-separador" role="separator" />
          <Link to="/puerta" target="_blank" rel="noopener noreferrer" className="admin-sidebar-link">
            <QrCode className="admin-sidebar-icono" aria-hidden="true" size={18} strokeWidth={2} />
            Validar entradas (/puerta)
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          {/* ⭐ Rediseño (pedido del usuario, 2026-09-10): avatar con iniciales
             para darle más jerarquía visual al pie del menú — mismo dato que
             ya se mostraba (nombre o email), solo con una identidad visual
             más clara que un párrafo suelto. */}
          <div className="admin-sidebar-usuario-fila">
            <span className="admin-sidebar-avatar" aria-hidden="true">
              {(admin?.nombre || admin?.email || '?').trim().charAt(0).toUpperCase()}
            </span>
            {/* 2026-08-31, a pedido del usuario: saludo persistente y visible
               mientras se navega el panel — el email queda como respaldo para
               las cuentas que todavía no tienen `nombre` guardado (ver
               Bienvenida.jsx) y como tooltip completo en cualquier caso. */}
            <p className="admin-sidebar-usuario" title={admin?.email}>
              {admin?.nombre ? `¡Hola, ${admin.nombre}!` : admin?.email}
            </p>
          </div>
          <button className="admin-sidebar-logout" onClick={manejarLogout}>Cerrar sesión</button>
        </div>
      </aside>
    </>
  );
}
