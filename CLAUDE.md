# Colombia Canta y Encanta — Contexto del proyecto

## Descripción
Landing page oficial de **Colombia Canta y Encanta**, asociación cultural con sede en Medellín. Incluye presentación institucional, carrusel de eventos, escuela de música, tienda de merch e inscripciones. Construida como web de prueba para mostrar al cliente antes de publicar.

## Stack técnico
- React 19 + Vite 8
- CSS puro (sin Tailwind ni librerías de UI)
- React Router v7 con `HashRouter` (requerido para GitHub Pages)
- Google Fonts: Playfair Display (títulos) + Inter (cuerpo)

## Paleta de colores
```css
--amarillo: #F5C800
--azul: #1A56DB
--rojo: #E8341A
--amarillo-oscuro: #B8960A
--azul-oscuro: #0F3A9E
--rojo-oscuro: #A8240E
--footer-bg: #0A0F1E
--crema: #FFFDF0
```
Todas las variables están en `src/styles/main.css`. **Nunca hardcodear hex en los componentes.**

## Arquitectura de rutas
```
/                   → Inicio
/nosotros           → Nosotros (#quienes-somos, #elenco, #inspiracion, #noticias)
/eventos            → Eventos (grid filtrable)
/eventos/:id        → Detalle de evento (plantilla dinámica)
/tienda             → Tienda (grid + filtros + carrito básico)
/inscripciones      → Inscripciones (#cursos, #como-inscribirse, #faq)
/contacto           → Contacto (formulario + info)
/404 + *            → NotFound
```

## Estructura de archivos
```
src/
├── components/
│   ├── Navbar/          — Navbar con dropdowns CSS hover, hamburger mobile
│   ├── Hero/            — 3 columnas 100vh con letras superpuestas
│   ├── CarruselEventos/ — Carrusel horizontal (useState offset)
│   │   └── EventCard.jsx — Card reutilizable en carrusel y en /eventos/:id
│   ├── Historia/        — Sección "Desde Medellín para el mundo"
│   ├── Escuela/         — Sección fondo azul oscuro con pills de cursos
│   ├── Contacto/        — ContactoSection reutilizable + barra de aliados
│   ├── EventoDetalle/   — Landing completa de cada concierto
│   └── Footer/          — Footer 6 columnas, franja bandera colombiana
├── pages/
│   ├── Inicio.jsx       — Ensambla Hero + Carrusel + Historia + Escuela + Contacto + Footer
│   ├── Nosotros.jsx
│   ├── Eventos.jsx
│   ├── EventoDetallePage.jsx  — Wrapper con useParams() → pasa evento a EventoDetalle
│   ├── Tienda.jsx
│   ├── Inscripciones.jsx
│   ├── Contacto.jsx
│   └── NotFound.jsx
├── data/
│   └── eventos.js       — Array con los 5 eventos (fuente única de verdad)
└── styles/
    └── main.css         — Variables :root, reset, tipografía, clases utilitarias globales
```

## Datos de los eventos
En `src/data/eventos.js` hay 5 eventos con IDs 1–5:
1. Bambucos en Disney Springs — Orlando, FL — 18 Abr
2. Gira USA 2026 · Miami — Coral Gables, FL — 15 Abr
3. Herencia Andina · Medellín — 28 Mar
4. Festival Nacional Colombia Canta — Mayo 2026
5. Melodías al piano — Medellín — 25 Mar

## Información de contacto del cliente
- **Dirección:** Calle 49 76a 65, Sector Estadio, Medellín
- **WhatsApp:** 3015315119 (wa.me/573015315119)
- **Email:** hola@colombiacanta.org
- **Aliados:** Co·Crea · Alcaldía de Medellín · Medellín Bureau · Teleantioquia · Teatro Trail

## Deploy (GitHub Pages)
El proyecto usa `HashRouter` para que las rutas funcionen sin configuración de servidor.

```bash
npm run build        # genera /dist
# Subir /dist a rama gh-pages del repositorio
```

Si se usa el paquete `gh-pages`:
```bash
npm install --save-dev gh-pages
# En package.json agregar:
# "homepage": "https://<usuario>.github.io/<repo>",
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"
npm run deploy
```

## Comandos
```bash
npm run dev      # servidor local (puerto 5173)
npm run build    # build de producción en /dist
npm run preview  # previsualizar el build
```

## Pendientes / mejoras futuras
- [ ] Reemplazar placeholders de color en Hero y mosaicos con fotos reales del cliente
- [ ] Reemplazar emoji 🩰 en ContactoSection con PNG de bailarina con fondo transparente
- [ ] Integrar Google Maps iframe en sección "El lugar" de EventoDetalle
- [ ] Implementar carrito completo con checkout (Mercado Pago / PayU)
- [ ] Añadir página de carrito dedicada en /tienda/carrito
- [ ] Agregar meta tags OG (Open Graph) para redes sociales
