<div align="center">

# 🎶 Colombia Canta y Encanta

**Plataforma web full-stack para una academia real de canto y danza folclórica colombiana** — sitio público, panel de administración y pagos en línea con Mercado Pago, construida y desplegada en producción.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)](#)
[![Mercado Pago](https://img.shields.io/badge/Mercado%20Pago-Checkout%20Pro-00B1EA?logo=mercadopago&logoColor=white)](#)

### [🌐 Ver demo en vivo](https://colombia-canta-encanta.vercel.app/)

![Vista previa del sitio](docs/preview-home.png)

</div>

---

## Sobre el proyecto

Aplicación real, en producción, para **Colombia Canta y Encanta**, una academia de música y danza folclórica colombiana. No es un proyecto de práctica: gestiona inscripciones de estudiantes reales, vende entradas a eventos y productos de tienda con **pagos reales a través de Mercado Pago**, y le da al equipo administrativo un panel completo para manejar el contenido del día a día sin tocar código.

El objetivo desde el diseño fue simple: **que el dinero, el cupo y el stock nunca se descuadren**, sin importar qué tan rápido o simultáneamente lleguen las compras.

## Funcionalidades destacadas

- 💳 **Pagos reales con Mercado Pago (Checkout Pro)** — entradas a eventos y compras en tienda, con webhook que verifica firma criptográfica *y* que el monto cobrado coincida exacto con lo esperado antes de confirmar nada.
- 🔒 **Cero sobreventa, con carga real de tráfico simultáneo en mente** — el cupo por zona de un evento y el stock de un producto se reservan con locks a nivel de base de datos (PostgreSQL advisory locks), no con lecturas optimistas que puedan chocar entre sí.
- ⏱️ **Expiración automática de reservas sin pagar** — un carrito o una entrada abandonada a mitad de pago libera su cupo/stock solo a los 30 minutos, sin necesitar ningún cron job.
- 🎟️ **Entradas con QR + código corto de respaldo**, validadas desde una pantalla dedicada para el staff de la puerta (PIN por evento, confirmación de evento antes de escanear, y señal sonora/vibración para validar rápido en un ambiente oscuro y ruidoso).
- 🏷️ **Cupones de descuento** con límite de usos, consumidos y devueltos de forma atómica (sin condiciones de carrera entre 2 compradores usando el mismo código a la vez).
- 🛠️ **Panel de administración completo** — CRUD de eventos, productos, cursos, noticias, inscripciones, reservas, pedidos y cupones; autenticación con **MFA (TOTP) obligatorio**, roles diferenciados, protección CSRF, rate limiting, y un historial de auditoría de cada acción tomada por cada administrador.
- ♿ **Accesibilidad auditada (WCAG AA)** — navegación por teclado, foco gestionado en modales/transiciones, contraste de color corregido donde hacía falta.
- ✉️ **Correos transaccionales** (confirmaciones de compra, invitaciones de admin) con plantillas HTML propias vía Resend.

## Stack técnico

| Área | Tecnología |
|---|---|
| Frontend | React · Vite · React Router |
| Backend | Node.js · Express · Zod |
| Base de datos | Supabase (PostgreSQL) — funciones SQL con locks para operaciones críticas |
| Autenticación | Supabase Auth con MFA (TOTP) |
| Pagos | Mercado Pago (Checkout Pro + Webhooks) |
| Correo | Resend |
| Despliegue | Vercel (frontend) · Render (backend) |

## Arquitectura

```
colombia-canta/
├── frontend/    # React + Vite — sitio público y panel de administración
└── backend/     # API REST en Express — lógica de negocio, pagos, correos
```

Backend y frontend se despliegan por separado y se comunican por API REST; el estado sensible (pagos, cupos, stock) vive siempre del lado del servidor — el cliente nunca decide un precio, una disponibilidad ni un descuento, todo se recalcula contra la base de datos en cada operación.

---

<sub>Proyecto real, en producción — código y arquitectura compartidos con fines de portafolio.</sub>
