# Colombia Canta y Encanta — Contexto del proyecto

## Descripción
Plataforma web oficial de **Colombia Canta y Encanta**, asociación cultural con sede en Medellín dedicada a la formación musical de niños y jóvenes en música tradicional colombiana. El objetivo final es una plataforma completa: presentación institucional, venta de merch con pagos reales y sistema de inscripciones digitalizado.

**Estado actual:** ~50% — Capa visual completa + SEO implementado + dark mode toggle + mejoras de UX (scroll to top, carruseles). Sin backend ni funcionalidad transaccional real.

---

## Stack técnico actual (frontend)
- React 19 + Vite 8 (**no cambiar a webpack** — decisión deliberada, Vite es el estándar 2025)
- CSS puro (sin Tailwind ni librerías de UI)
- React Router v7 con `HashRouter` (requerido para GitHub Pages, migrar a `BrowserRouter` en Mes 6)
- `react-helmet-async` — títulos y meta tags dinámicos por página
- Google Fonts: Poppins (títulos) + Inter (cuerpo)
- Deploy: GitHub Pages vía `gh-pages` → `https://Javiermll.github.io/colombia-canta/`

## Stack objetivo completo (al finalizar el proyecto)
**Frontend**
- React 19 + Vite — mantener
- React Router v7 → migrar a `BrowserRouter` cuando haya servidor propio
- Zustand — estado global (carrito, sesión)
- EmailJS — formulario de contacto sin backend (Mes 1)

**Backend**
- Node.js + Express
- MongoDB Atlas (mismo servicio que Job_bot)
- Mongoose — ODM
- JWT — autenticación del panel admin
- Nodemailer / Resend — emails transaccionales
- Bcrypt — hashing de contraseñas

**Pagos**
- Mercado Pago Checkout Pro — ventas Colombia + Latinoamérica

**Infraestructura**
- Frontend: dominio propio apuntando a Vercel o Netlify
- Backend: Render (mismo servicio que Job_bot)
- Base de datos: MongoDB Atlas (tier gratuito M0)
- Emails: Resend (100 emails/día gratis)

---

## Paleta de colores
```css
--amarillo:      #F5C800
--azul:          #1A56DB
--rojo:          #E8341A
--coral:         #F03A6E
--amarillo-oscuro: #B8960A
--azul-oscuro:   #0F3A9E
--rojo-oscuro:   #A8240E
--coral-oscuro:  #C42D57
--footer-bg:     #0A0F1E
--crema:         #FFFDF0
```
Todas las variables están en `src/styles/main.css`. **Nunca hardcodear hex en los componentes.**

---

## Arquitectura de rutas (actual)
```
/                   → Inicio
/nosotros           → Nosotros (#quienes-somos, #elenco, #inspiracion, #noticias)
/eventos            → Eventos (grid filtrable por tipo)
/eventos/:id        → EventoDetallePage (useParams → pasa evento a EventoDetalle)
/tienda             → Tienda (grid + filtros + carrito básico)
/tienda/carrito     → Carrito (lista, cantidades, totales)
/inscripciones      → Inscripciones (#cursos, #como-inscribirse, #faq)
/contacto           → Contacto (formulario + info)
/admin              → [PENDIENTE] Panel de administración (protegido)
/404 + *            → NotFound
```

---

## Estructura de archivos
```
src/
├── components/
│   ├── Navbar/          — Navbar con dropdowns CSS hover, hamburger mobile
│   ├── Hero/            — 3 columnas 100vh con letras superpuestas
│   ├── CarruselEventos/ — Carrusel horizontal (useState offset)
│   │   └── EventCard.jsx — Card reutilizable en carrusel y en /eventos
│   ├── Historia/        — Carrusel fade automático (3s) + dots indicadores
│   ├── Escuela/         — Sección fondo azul oscuro con pills de cursos
│   ├── Contacto/        — ContactoSection reutilizable + carrusel de aliados
│   ├── EventoDetalle/   — Landing completa de cada concierto
│   ├── ScrollToTop.jsx  — Scroll al tope en cada cambio de ruta
│   └── Footer/          — Footer 6 columnas (sin franja de bandera)
├── pages/
│   ├── Inicio.jsx
│   ├── Nosotros.jsx
│   ├── Eventos.jsx
│   ├── EventoDetallePage.jsx
│   ├── Tienda.jsx
│   ├── Inscripciones.jsx
│   ├── Contacto.jsx
│   └── NotFound.jsx
├── data/
│   └── eventos.js       — Array con 5 eventos. Campos clave: id, titulo, slug, tipo,
│                          fecha, fechaCompleta, ciudad, lugar, descripcion,
│                          descripcionLarga, programa, precio, color, testimonios
├── hooks/
│   └── useTheme.js      — Toggle dark/light mode; persiste en localStorage; aplica data-theme en <html>
├── utils/
│   └── seo.js           — BASE_URL y OG_IMAGE (constantes compartidas para Helmet)
└── styles/
    └── main.css         — Variables :root, reset, tipografía, clases utilitarias globales
```

---

## Estado funcional por sección

| Sección | Visual | Lógica real |
|---|---|---|
| Navbar + dropdowns + mobile | ✅ | ✅ |
| Hero v2 (ilustración + texto) | ✅ | ✅ Scroll indicator, placeholder animación, responsive |
| Carrusel de eventos | ✅ | ✅ (navegación) |
| Historia — carrusel fade | ✅ | ✅ Auto-avance 3s, dots indicadores |
| Aliados — carrusel marquee | ✅ | ✅ Loop infinito, pausa al hover |
| Filtros /eventos y /tienda | ✅ | ✅ (useState) |
| Carrito de tienda | ✅ | ✅ `CarritoContext` + `localStorage` + página `/tienda/carrito` |
| Quick view de productos | ✅ | ✅ Modal 2 col, tallas, colores, cantidad, COP + USD, stock badge |
| Cards dark mode (tienda) | ✅ | ✅ Fondo negro, borde blanco, precio amarillo, badge categoría |
| Logo real en Navbar/Footer | ✅ | ✅ `Col_Logo.png` vía `import.meta.env.BASE_URL` |
| Formulario de contacto | ✅ | ❌ No envía datos reales (Resend + backend en Mes 2) |
| Inscripciones | ✅ | ❌ Redirige a WhatsApp |
| Pagos | ✅ botones | ❌ Sin integración |
| Panel admin | ❌ | ❌ No existe |
| Dark mode toggle | ✅ | ✅ useTheme hook, localStorage, data-theme en html |
| Scroll to top en navegación | ✅ | ✅ ScrollToTop component |
| SEO — títulos dinámicos | ✅ react-helmet-async | ✅ Implementado |
| SEO — meta descriptions | ✅ | ✅ Implementado |
| SEO — Open Graph tags | ✅ | ✅ Implementado (todas las páginas) |
| Página 404 | ✅ | ✅ noindex + botón home |

---

## Decisiones técnicas tomadas

- **Vite sobre webpack:** decisión confirmada. Webpack está deprecado para CRA desde 2023; Vite es el estándar actual. No migrar.
- **HashRouter sobre BrowserRouter:** requerido por GitHub Pages (sin servidor que maneje rutas). Se migrará en Mes 6 al mover a dominio propio + Vercel/Netlify.
- **react-helmet-async sobre react-helmet:** react-helmet está sin mantenimiento; la versión async es la fork mantenida y compatible con React 18+.
- **HelmetProvider** envuelve toda la app en `App.jsx`, por encima del router.
- **Poppins sobre Playfair Display:** fuente de títulos cambiada a Poppins (más moderna, sin serifa). Inter sigue como fuente de cuerpo. Ambas desde Google Fonts en `main.css` `@import`.
- **Sin franja de bandera en el footer:** se eliminó el `<div className="franja-bandera">` y su CSS. Decisión estética del cliente.
- **Dark mode implementado** con `src/hooks/useTheme.js`: toggle 🌙/☀️ en el Navbar, `data-theme="dark"` en `<html>`, preferencia persistida en `localStorage`. Variables semánticas en `:root` (`--bg-body`, `--bg-card`, `--bg-surface`, `--border-sutil`, `--border-media`, `--sombra-*`) y bloque `[data-theme="dark"]` en `main.css`. Todos los componentes y páginas actualizados para usar variables en lugar de hex hardcodeados.
- **ScrollToTop:** componente `src/components/ScrollToTop.jsx` montado en `App.jsx` dentro del router. Escucha `pathname` con `useLocation` y llama `window.scrollTo(0, 0)` en cada navegación.
- **Carrusel Historia (fade):** `useEffect` + `setInterval` de 3s. Slides en `position: absolute` con `opacity: 0/1` y `transition: opacity 1s`. Dots visuales en la parte inferior.
- **Carrusel Aliados (marquee CSS):** items duplicados (`[...aliados, ...aliados]`) + `@keyframes aliados-scroll` animando `translateX(-50%)`. Fade en bordes con `mask-image`. Pausa al hover. Implementado en `ContactoSection` y en la página `/contacto`.
- **Botón Contacto en navbar:** hover usa `--azul-oscuro` + texto blanco (antes usaba `--texto-principal` que en dark mode era casi blanco, generando contraste incorrecto).
- **HashRouter + Open Graph (limitación conocida):** los scrapers de redes sociales ignoran el hash en la URL y siempre leen las meta tags de la raíz. Los tags por página funcionan para SEO en buscadores. Se resuelve en Mes 6 con la migración a BrowserRouter.
- **CarritoContext:** estado global del carrito en `src/context/CarritoContext.jsx`. Persiste en `localStorage` bajo la clave `colombia-canta-carrito`. `agregar(producto, cantidad)` hace stacking por ID compuesto `${id}-${talla}-${color}` para distinguir variantes del mismo producto.
- **ProductoModal (quick view):** `src/components/ProductoModal/`. Se abre al clickear cualquier card o el botón "🛒 Añadir". Muestra precio en COP y equivalente USD con tasa fija `TASA_USD = 4200` (se reemplaza por API real en Mes 2 — tarea 2.10). Cierre con Escape, clic en overlay o botón ✕. Bloquea scroll del body mientras está abierto.
- **Cards dark mode tienda:** `src/pages/Tienda.css` con selectores `[data-theme="dark"] .producto-card`. Fondo `#090d1a`, borde blanco `rgba(255,255,255,0.15)`, precio en `var(--amarillo)`, badge de categoría amarillo sobre la imagen.
- **Logo real:** `public/Col_Logo.png` referenciado como `${import.meta.env.BASE_URL}Col_Logo.png` para que funcione correctamente con `base: '/colombia-canta/'` en `vite.config.js`.
- **Hero v2:** `src/components/Hero/`. Layout dos columnas (texto izquierda / animación derecha). Fondo siempre `var(--footer-bg)` independiente del tema. Botón primario usa `var(--coral)`. En mobile (≤900px) la zona de animación va arriba y el texto abajo. Placeholder de animación en `.hero-animacion-placeholder` — reemplazar por Lottie/CSS/Spline cuando esté disponible. Scroll indicator con animación `heroScrollBounce`. Hero v1 (3 columnas) guardado en `colombia-canta-docs/referencia/hero-v1-original.md`.

---

## Información del cliente
- **Dirección:** Calle 49 76a 65, Sector Estadio, Medellín
- **WhatsApp:** 3015315119 → `wa.me/573015315119`
- **Email:** hola@colombiacanta.org *(pendiente activar correo corporativo — Tarea 1.1)*
- **Aliados:** Co·Crea · Alcaldía de Medellín · Medellín Bureau · Teleantioquia · Teatro Trail

---

## Deploy
```bash
npm run dev        # servidor local en http://localhost:5173
npm run build      # build de producción en /dist
npm run deploy     # build + push a rama gh-pages (GitHub Pages)
```
URL pública: `https://Javiermll.github.io/colombia-canta/`

**Seguridad:** `.env` y `.env.*` están en `.gitignore`. Las claves de EmailJS (Mes 1) deben ir en un `.env` local nunca commiteado.

---

## Documentación del proyecto
La carpeta `colombia-canta-docs/` (en `c:/Users/Mily/projects/colombia-canta-docs/`) es un repo separado con documentación para el equipo (comunicador, diseñadora UX/UI). Estructura:
```
colombia-canta-docs/
├── mayo/
│   ├── mes-01-mayo.md           — Roadmap detallado del mes (tareas 1.1–1.11)
│   └── requisitos_avances_mayo.md — Solicitudes al equipo + avances en lenguaje no técnico
└── junio/
    ├── mes-02-junio.md
    └── requisitos_avances_junio.md
```

---

## Roadmap — 6 meses (Mayo–Octubre 2026)

### Mes 1 — Mayo · Pulir + SEO + Formularios reales
- [x] `lang="es"` confirmado en index.html
- [x] Meta tags base en index.html (description, OG, Twitter Card, favicons)
- [x] `.env` agregado a `.gitignore`
- [x] Instalar `react-helmet-async` + `HelmetProvider` en App.jsx
- [x] Títulos dinámicos por página
- [x] Meta descriptions por página
- [x] Open Graph tags por página (tarea 1.5)
- [x] Dark mode toggle con `useTheme` hook (fuera de roadmap original — implementado)
- [x] ScrollToTop en cada navegación de ruta (fuera de roadmap original — implementado)
- [x] Carrusel fade en sección Historia (fuera de roadmap original — implementado)
- [x] Carrusel marquee en barra de aliados (fuera de roadmap original — implementado)
- [x] EmailJS descartado — email seguro via Resend + backend en Mes 2 (tarea 1.6 removida del mes)
- [x] Persistencia del carrito con `localStorage` + `CarritoContext` (tarea 1.6)
- [x] Página `/tienda/carrito` con cantidades, eliminar, totales y estado vacío (tarea 1.7)
- [x] Botón carrito del navbar muestra badge con total y navega a `/tienda/carrito` (tarea 1.8)
- [ ] Sección de noticias en el home entre Historia y Escuela, datos en `src/data/noticias.js` (tarea 1.11)
- [ ] Quick view de artistas en /nosotros — modal con bio, especialidades y enlace YouTube (tarea 1.12)
- [ ] Separación eventos próximos / pasados con estilo diferenciado en /eventos (tarea 1.13)
- [ ] Quick view de cursos en /inscripciones — modal con horarios, fotos y botón WhatsApp (tarea 1.14)
- [ ] Reemplazar placeholders con imágenes reales del cliente (tarea 1.9)
- [ ] Deploy final del mes a GitHub Pages (tarea 1.10)

### Mes 2 — Junio · Backend: cimientos
- [ ] Proyecto Node.js + Express en repo separado (`colombia-canta-api`)
- [ ] MongoDB Atlas — modelos: `Producto`, `Pedido`, `Inscripcion`, `Evento`
- [ ] API REST: CRUD productos, lectura de eventos
- [ ] Deploy backend en Render
- [ ] Conectar frontend a API — datos dejan de ser hardcodeados
- [ ] **Crear cuenta Mercado Pago del cliente este mes** (verificación tarda 1–2 semanas)

### Mes 3 — Julio · E-commerce: carrito y pagos
- [ ] Página de carrito completa (editar cantidades, eliminar, total)
- [ ] Integración Mercado Pago Checkout Pro
- [ ] Flujo completo: carrito → checkout → confirmación
- [ ] Email automático al cliente tras compra (Resend/Nodemailer)
- [ ] Guardar pedidos en MongoDB

### Mes 4 — Agosto · Sistema de inscripciones
- [ ] Formulario de inscripción real (curso, nombre, edad, nivel, horario, contacto)
- [ ] Pago de matrícula con Mercado Pago
- [ ] Confirmación automática por email al inscrito
- [ ] Registro del estudiante en MongoDB
- [ ] Página de estado de inscripción

### Mes 5 — Septiembre · Panel de administración
- [ ] Autenticación JWT (solo admin)
- [ ] Panel `/admin` protegido: pedidos, inscripciones, CRUD eventos y productos
- [ ] Gestión completa del catálogo: formulario de producto con nombre, descripción, categoría, precio COP, tallas (array), colores (nombre + hex), stock, imagen, activo/inactivo
- [ ] Estadísticas básicas

### Mes 6 — Octubre · Optimización y lanzamiento
- [ ] Auditoría Lighthouse (performance, SEO, accesibilidad)
- [ ] Optimización de imágenes (WebP, lazy loading)
- [ ] Migrar HashRouter → BrowserRouter + dominio propio (Vercel/Netlify)
- [ ] Google Analytics
- [ ] Tests en flujos críticos
- [ ] Lanzamiento oficial

---

## Costos estimados de infraestructura (mensuales)

| Servicio | Costo |
|---|---|
| MongoDB Atlas M0 | **Gratis** |
| Render (backend) | **Gratis** (spin-down en inactividad; $7/mes para producción sin cold start) |
| Vercel / Netlify | **Gratis** |
| Resend (100 emails/día) | **Gratis** |
| Mercado Pago | **3.49% + IVA** por transacción |
| Dominio | **$0 adicional** (ya disponible) |
| **Total fijo mensual** | **$0 USD** |
