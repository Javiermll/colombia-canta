# Mes 1 — Mayo 2026
## Colombia Canta y Encanta · Plataforma Web

---

## ESTADO GENERAL

El sitio web tiene aproximadamente un 30% de la capa visual construida. Este mes el objetivo es pulir lo que ya existe: mejorar el posicionamiento en Google, hacer funcionar los formularios y el carrito de compras, y hacer el primer despliegue público.

---

## SOLICITUDES PARA LA DISEÑADORA UX/UI

Los siguientes archivos son necesarios para completar el trabajo técnico de este mes. Por favor entregar en las dimensiones indicadas.

### Archivos pendientes

| Archivo | Tamaño | Para qué sirve |
|--------|--------|----------------|
| `og-image.jpg` | 1200 × 630 px | Imagen que aparece cuando alguien comparte el link del sitio en WhatsApp, Facebook, LinkedIn u otras redes sociales. Es la "tarjeta de presentación" del sitio en redes. |
| `apple-touch-icon.png` | 180 × 180 px | Icono que aparece cuando alguien guarda el sitio en la pantalla de inicio de su iPhone. |
| `favicon.ico` | 32 × 32 px | Icono pequeño que aparece en la pestaña del navegador (el que ya existe es `.svg`, este es el respaldo para navegadores más antiguos). |

### Imágenes para el contenido del sitio

Estas imágenes reemplazarán los placeholders (imágenes de relleno temporales) que hay actualmente en el sitio:

- **Sección Inicio (hero/portada):** imagen principal del sitio, de alta calidad, que represente la esencia de la asociación.
- **Sección Nosotros:** foto o imagen del equipo, del espacio o de algún momento representativo.
- **Sección Eventos:** una imagen por evento (mínimo para los eventos que ya están publicados).
- **Sección Tienda:** una imagen por producto.

> Formato recomendado: `.jpg` o `.webp`. Peso máximo sugerido: 300 KB por imagen para que el sitio cargue rápido.

### Color de acento para móviles

Cuando alguien visita el sitio desde un celular Android, el navegador toma un color de la marca para pintar la barra del sistema. Actualmente está configurado el dorado `#F5A623`. Confirmar si ese es el color correcto o indicar el código hexadecimal del color de la marca.

---

## SOLICITUDES PARA EL/LA COMUNICADOR/A

El sitio necesita textos reales para reemplazar los contenidos de prueba. Se necesita uno por cada sección:

### Textos generales del sitio

- **Nombre oficial de la asociación** tal como debe aparecer en el sitio (ej: ¿"Colombia Canta y Encanta" o hay un nombre jurídico distinto?).
- **Descripción corta** (máximo 155 caracteres) para que aparezca en Google cuando alguien busque la asociación. Ejemplo: *"Asociación cultural colombiana en Medellín. Eventos, talleres y actividades para celebrar la cultura y el folclor colombiano."*

### Textos por página

| Página | Qué se necesita |
|--------|----------------|
| **Inicio** | Titular principal, subtítulo y texto de bienvenida (máx. 2–3 párrafos cortos). |
| **Nosotros** | Historia de la asociación, misión, visión y quiénes la conforman. |
| **Eventos** | Descripción de cada evento: nombre, fecha, lugar, precio (si aplica) y texto de invitación. |
| **Tienda** | Nombre, descripción y precio de cada producto. |
| **Inscripciones** | Texto introductorio del formulario: ¿a qué se están inscribiendo? ¿Qué pasa después de enviar el formulario? |
| **Contacto** | Dirección, teléfono, correo electrónico, horario de atención y redes sociales oficiales. |

### Títulos SEO por página *(opcional pero recomendado)*

Cada página del sitio puede tener su propio título en la pestaña del navegador y en Google. Ejemplo:
- Inicio → *"Colombia Canta y Encanta | Asociación Cultural en Medellín"*
- Nosotros → *"Quiénes Somos | Colombia Canta y Encanta"*
- Tienda → *"Tienda | Colombia Canta y Encanta"*

Si no se entregan, se usarán títulos genéricos como los anteriores.

---

## CAMBIOS REALIZADOS EN MAYO 2026

Esta sección registra los cambios técnicos completados, explicados de forma sencilla.

---

### ✅ El sitio ahora "habla" español

**Fecha:** 3 de mayo de 2026

El sitio tenía configurado el idioma inglés de forma invisible (en el código). Esto afecta cómo Google interpreta el contenido y cómo los lectores de pantalla lo pronuncian para personas con discapacidad visual. Se corrigió para que el sitio esté correctamente identificado como un sitio en español.

---

### ✅ Preparación para aparecer mejor en Google y redes sociales

**Fecha:** 3 de mayo de 2026

Se añadieron una serie de instrucciones invisibles al sitio (llamadas "metaetiquetas") que le dicen a Google y a las redes sociales información importante sobre la página:

- **Para Google:** descripción del sitio, quién lo creó y que sí debe mostrarse en los resultados de búsqueda.
- **Para WhatsApp, Facebook y LinkedIn:** cuando alguien comparte el link del sitio, en lugar de aparecer solo una URL fea, aparecerá una tarjeta con título, descripción e imagen. Pendiente entregar la imagen (`og-image.jpg`) para activar esto completamente.
- **Para iPhones:** se preparó el espacio para el icono que aparece al guardar el sitio en la pantalla de inicio. Pendiente entregar el archivo de imagen (`apple-touch-icon.png`).

> **Nota:** para que todos estos cambios sean visibles al público, falta hacer el despliegue del sitio en GitHub Pages (previsto para finales de este mes).

---

*Documento actualizado por: Javier Muñoz · Mayo 2026*
