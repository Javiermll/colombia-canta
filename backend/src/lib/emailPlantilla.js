// Marco visual compartido para los correos de confirmación de Fase 6 (Eventos
// gratis, Salas/Enamora, Cursos, Tienda).
//
// ⭐ Rediseño (2026-09-10), a pedido del usuario — referencia visual: una
// plantilla de tema oscuro para el correo de confirmación del Festival. Se
// toma el LENGUAJE VISUAL (tema oscuro, tarjeta de resumen, bloque de QR,
// pie) como base nueva para los 4 flujos reales — no el contenido específico
// de esa referencia (crédito de la Alcaldía, "Agregar a calendario"), que es
// propio de Festival/Convocatoria y sigue fuera de alcance (ver
// `esConvocatoria` en ReservaModal.jsx).
//
// Mismo criterio de contraste real que ya se usó en `/puerta` (ver
// ValidarEntrada.css) — en tema OSCURO el coral real de la marca (`--coral:
// #ff5c8d`) sí pasa WCAG AA como texto/acento directo sobre el fondo
// (~5.75:1 contra `#151b2e`, calculado y verificado) — a diferencia del tema
// claro de `invite.html`, que necesita el coral más oscuro `#b5285a`
// (~2.9:1 en claro, insuficiente). Nota para cuando esta plantilla necesite
// un botón sólido (texto blanco sobre coral): usar `--coral-oscuro`
// (`#e03d6f`) como fondo, no este coral — blanco sobre el coral real da solo
// ~2.98:1, insuficiente para texto chico (mismo hallazgo ya aplicado en el
// PIN de puerta del panel admin).
const LOGO_URL = 'https://colombia-canta-encanta.vercel.app/logo.png';
const BG_PAGINA = '#0a0f1e';
const BG_TARJETA = '#151b2e';
const BG_CAJA = '#1c2440';
// ⭐ Pedido del usuario (2026-09-10): borde con tinte coral (no el gris-azul
// neutro que tenía antes) — mismo criterio de contraste que el resto de este
// archivo: un coral tan claro como el de marca se perdería casi del todo
// contra el fondo oscuro en un borde de 1px (muy poca área para que el ojo
// lo note) — se usa una versión bien oscurecida del coral en vez del gris
// neutro, sutil pero perceptible como "tinte", no un borde coral brillante.
const BORDE = '#3a2233';
const CORAL = '#ff5c8d';
const TEXTO_PRINCIPAL = '#ffffff';
const TEXTO_SECUNDARIO = '#9a9fae';

// ⭐ Pedido del usuario (2026-09-10): fondo con textura, no un negro plano —
// mosaico geométrico sutil (zigzag, inspirado en tejidos andinos/Wayuu),
// línea coral casi imperceptible (7% de opacidad) para no competir con el
// texto. Mismo `BG_TARJETA` horneado adentro del tile (no transparente —
// misma lección de los íconos de redes: un PNG transparente no se compone
// igual en todos los clientes de correo). Progressive enhancement real: los
// clientes que no soportan `background-image` en CSS (Outlook de escritorio
// clásico) simplemente ven el `background-color` sólido de siempre — nunca
// se rompe, solo se ve más plano ahí.
const PATRON_URL = 'https://gvjundobpmjirhzsboeu.supabase.co/storage/v1/object/public/sitio-imagenes/email-assets/patron-tribal.webp';

// ⭐ Pedido del usuario (2026-09-10): "que en todos los correos se presente
// una imagen" — para Tienda (un pedido puede tener varios productos, ninguna
// foto única lo representa) o un curso/evento sin foto propia cargada, se
// cae a esta — la foto real del slide principal del Home (`hero_slides`, ya
// en uso en el sitio), no una imagen inventada.
const IMAGEN_DEFECTO = 'https://gvjundobpmjirhzsboeu.supabase.co/storage/v1/object/public/sitio-imagenes/hero-slides/42a6a799-b62d-47f2-aa3a-1479ba804b7a.webp';

// ⭐ Redes sociales en el pie (pedido del usuario, 2026-09-10) — mismos links
// reales que ya usa el Footer del sitio (frontend/src/data/redesSociales.jsx,
// no se inventa ninguno acá). Los íconos son imágenes reales pre-generadas
// (mismo motivo que el QR: un ícono SVG/`data:` embebido no se ve en Gmail) —
// se generaron una sola vez con el mismo path exacto de cada SVG del sitio y
// se subieron a Storage (`email-assets/redes-v2/`, script de un solo uso, no
// forma parte del código que corre en cada correo — no hace falta
// regenerarlos salvo que cambien los íconos del sitio). Fondo SÓLIDO
// (coral oscuro de marca), no transparente.
//
// ⭐ Carpeta "redes-v2", a propósito (no "redes") — la v1 tenía el ícono con
// fondo transparente, casi invisible en la práctica (confirmado descargando
// el archivo). Se corrigió a fondo sólido, pero SOBREESCRIBIR el mismo
// archivo no alcanzó: Gmail seguía mostrando la versión vieja rota (su
// proxy de imágenes cachea por URL, no revisa si el contenido cambió). Una
// carpeta/URL nueva fuerza la descarga real — si se necesita corregir estos
// íconos de nuevo en el futuro, cambiar de carpeta otra vez, no sobreescribir.
const REDES_SOCIALES = [
  { label: 'Instagram', href: 'https://www.instagram.com/colombia_canta', icono: 'https://gvjundobpmjirhzsboeu.supabase.co/storage/v1/object/public/sitio-imagenes/email-assets/redes-v2/instagram.webp' },
  { label: 'Facebook', href: 'https://web.facebook.com/colombiacanta', icono: 'https://gvjundobpmjirhzsboeu.supabase.co/storage/v1/object/public/sitio-imagenes/email-assets/redes-v2/facebook.webp' },
  { label: 'YouTube', href: 'https://www.youtube.com/colcanta', icono: 'https://gvjundobpmjirhzsboeu.supabase.co/storage/v1/object/public/sitio-imagenes/email-assets/redes-v2/youtube.webp' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@colombiacantayencanta', icono: 'https://gvjundobpmjirhzsboeu.supabase.co/storage/v1/object/public/sitio-imagenes/email-assets/redes-v2/tiktok.webp' },
  { label: 'WhatsApp', href: 'https://wa.me/573015315119', icono: 'https://gvjundobpmjirhzsboeu.supabase.co/storage/v1/object/public/sitio-imagenes/email-assets/redes-v2/whatsapp.webp' },
  { label: 'TripAdvisor', href: 'https://www.tripadvisor.es/Attraction_Review-g297478-d23933011-Reviews-Colombia_Canta_Y_Encanta-Medellin_Antioquia_Department.html', icono: 'https://gvjundobpmjirhzsboeu.supabase.co/storage/v1/object/public/sitio-imagenes/email-assets/redes-v2/tripadvisor.webp' },
];

// ⭐ Pedido del usuario (2026-09-10) — link real a Contacto en el pie del
// correo. Mismo patrón ya usado en `admins.js` (`urlBienvenida`) para armar
// links hacia el sitio público: `FRONTEND_URL` puede traer varios orígenes
// separados por coma, se usa el primero. Funciona ya mismo contra la URL
// real de Vercel (el sitio ya está en uso por visitantes reales, aunque el
// dominio propio `colombiacanta.org` siga sirviendo Wix por ahora) — el día
// que se migre el dominio (ver "Despliegue a producción" en readme_guia.md),
// solo hay que actualizar la variable de entorno `FRONTEND_URL`, este link
// se ajusta solo sin tocar código.
function urlContacto() {
  const primerOrigen = (process.env.FRONTEND_URL || '').split(',').map((s) => s.trim()).filter(Boolean)[0];
  return primerOrigen ? `${primerOrigen}/#/contacto` : null;
}

export function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// `filas`: [{ etiqueta, valor }] — se muestran en una tarjeta tipo "resumen"
// (evento/fecha/lugar, curso/estudiante, pedido/total...). Los valores NO se
// escapan acá adentro — quien arma `filas` es responsable de pasar `escaparHtml`
// sobre cualquier dato que venga de un formulario público (nombre, etc.).
//
// `qrs` (entradas con QR): [{ numero, total, url, codigo }] — un bloque por
// entrada individual, cada una con su propio código. `url` es una imagen
// real hospedada en Storage (ver lib/qr.js) — antes era un `data:` URI
// embebido directo, pero Gmail (el cliente más usado) bloquea ese tipo de
// imagen y no la mostraba (hallazgo real del usuario, 2026-09-10). El QR ya
// se genera sobre fondo blanco (lib/qr.js) — se le agrega un marco blanco
// acá para que se lea bien sobre el fondo oscuro de la tarjeta. `codigo`
// (pedido del usuario, 2026-09-10) es un respaldo REAL, no decorativo — el
// staff de la puerta puede escribirlo a mano en /puerta si el QR no escanea
// (ver validarEntrada.js, acepta el `id` real o este código corto).
//
// `mapaUrl` (opcional) — link "Ver ubicación" bajo el resumen. Quien llama
// arma la URL (ej. un link de búsqueda de Google Maps con la dirección
// real) — la plantilla no adivina coordenadas.
//
// `imagenUrl` (opcional, pedido del usuario 2026-09-10: "que en todos los
// correos se presente una imagen") — foto real del evento/curso
// (`eventos.img`/`eventos_fijos.img`/`cursos.imagen`, ya hospedadas en
// Storage), mostrada debajo del encabezado. Si no se pasa (Tienda, donde un
// pedido puede tener varios productos y ninguna foto única lo representa; o
// un curso/evento sin foto propia cargada), se usa `IMAGEN_DEFECTO` — el
// correo SIEMPRE muestra alguna imagen, nunca queda sin ninguna.
// `productos` (opcional, Tienda — pedido del usuario 2026-09-10: "que se vea
// la imagen del producto y los detalles de la compra") — [{ nombre, detalle,
// cantidad, precio, imagenUrl }], un renglón por línea real de
// `pedido_items` (snapshot ya guardado — nombre/talla/color/precio no
// cambian aunque el producto se edite o borre después). `imagenUrl` puede
// venir `null` (producto borrado del catálogo desde la compra, `ON DELETE
// SET NULL`) — esa línea simplemente no muestra foto, no rompe nada.
//
// ⭐ Rediseño (2026-09-10, 2do ajuste a pedido del usuario): la v1 ponía las
// fotos en una grilla arriba, separadas del detalle — el usuario pidió la
// foto de cada producto JUNTO a su propio renglón (no en un bloque aparte),
// y que el encabezado de arriba se quede solo con el logo/título cuando hay
// `productos` (nada de foto ahí — ver `imagenHtml` más abajo).
export function plantillaCorreo({ titulo, intro, filas, notaFinal, qrs, mapaUrl, imagenUrl, productos }) {
  const productosHtml = (productos || [])
    .map(
      ({ nombre, detalle, cantidad, precio, imagenUrl: fotoProducto }) => `
        <tr>
          <td style="padding: 10px 0; vertical-align: top; width: 52px;">
            ${fotoProducto
              ? `<img src="${fotoProducto}" alt="" width="48" height="48" style="display: block; border-radius: 8px; object-fit: cover;" />`
              : `<div style="width: 48px; height: 48px; border-radius: 8px; background: ${BG_CAJA};"></div>`}
          </td>
          <td style="padding: 10px 0 10px 14px; vertical-align: top;">
            <p style="margin: 0; font-size: 13.5px; color: ${TEXTO_PRINCIPAL}; font-weight: bold;">${nombre}</p>
            ${detalle ? `<p style="margin: 2px 0 0; font-size: 12px; color: ${TEXTO_SECUNDARIO};">${detalle}</p>` : ''}
          </td>
          <td style="padding: 10px 0; text-align: right; white-space: nowrap; vertical-align: top;">
            <p style="margin: 0; font-size: 12.5px; color: ${TEXTO_SECUNDARIO};">${cantidad} × ${precio}</p>
          </td>
        </tr>`,
    )
    .join('');

  const filasHtml = (filas || [])
    .map(
      ({ etiqueta, valor }) => `
        <tr>
          <td style="padding: 7px 0; text-align: center;">
            <p style="margin: 0; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: ${TEXTO_SECUNDARIO};">${etiqueta}</p>
            <p style="margin: 2px 0 0; font-size: 14px; color: ${TEXTO_PRINCIPAL}; font-weight: bold;">${valor}</p>
          </td>
        </tr>`,
    )
    .join('');

  const qrsHtml = (qrs || [])
    .map(
      ({ numero, total, url, codigo }) => `
      <div style="text-align: center; padding: 20px 0; ${numero < total ? `border-bottom: 1px dashed ${BORDE};` : ''}">
        <p style="font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: ${TEXTO_SECUNDARIO}; font-weight: bold; margin: 0 0 12px;">
          Entrada ${numero} de ${total}
        </p>
        <div style="display: inline-block; background: #ffffff; padding: 10px; border-radius: 10px; line-height: 0;">
          <img src="${url}" alt="Código QR de la entrada ${numero}" width="170" height="170" style="display: block;" />
        </div>
        ${codigo ? `
        <p style="margin: 10px 0 0; font-size: 11px; color: ${TEXTO_SECUNDARIO};">
          ¿No escanea? Código: <span style="font-family: 'Courier New', monospace; letter-spacing: 0.06em; color: ${TEXTO_PRINCIPAL}; font-weight: bold;">${codigo}</span>
        </p>` : ''}
      </div>`,
    )
    .join('');

  // Foto real (pedido del usuario, 2026-09-10: SIEMPRE presente) — la del
  // evento/curso si quien arma el correo la pasó (`evento.img`/
  // `curso.imagen`), si no la genérica de marca (`IMAGEN_DEFECTO`, ver
  // arriba). `width="480"` como atributo HTML (no solo CSS) es a propósito
  // — Outlook de escritorio ignora `width:100%` en CSS pero sí respeta el
  // atributo.
  //
  // ⭐ 2do ajuste (2026-09-10): cuando hay `productos` (Tienda), NO se
  // muestra ningún banner acá — el usuario pidió que el encabezado quede
  // solo con el logo/título en ese caso, y que la foto de cada producto
  // viva junto a su propio renglón más abajo (ver `productosHtml`), no
  // separada en un bloque propio.
  const imagenHtml = productos?.length
    ? ''
    : `
    <img src="${imagenUrl || IMAGEN_DEFECTO}" alt="" width="480" height="200" style="display: block; width: 100%; height: 200px; object-fit: cover;" />`;

  const redesHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 14px auto 0;">
      <tr>
        ${REDES_SOCIALES.map(
          ({ label, href, icono }) => `
        <td style="padding: 0 4px;">
          <a href="${href}" target="_blank" rel="noopener noreferrer">
            <img src="${icono}" alt="${label}" width="32" height="32" style="display: block; border-radius: 50%;" />
          </a>
        </td>`,
        ).join('')}
      </tr>
    </table>`;

  return `
<div style="background: ${BG_PAGINA}; padding: 32px 16px; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto; background: ${BG_TARJETA} url('${PATRON_URL}') repeat; border-radius: 16px; border: 1px solid ${BORDE}; overflow: hidden;">
    <div style="padding: 28px 32px 20px; text-align: center;">
      <img src="${LOGO_URL}" alt="Colombia Canta y Encanta" width="48" height="48" style="display: block; margin: 0 auto 12px; border-radius: 10px;" />
      <p style="margin: 0; font-size: 14px; font-weight: bold; letter-spacing: 0.02em;">
        <span style="color: ${TEXTO_PRINCIPAL};">COLOMBIA</span> <span style="color: ${CORAL};">Canta y Encanta</span>
      </p>
    </div>
    ${imagenHtml}
    <div style="border-bottom: 1px solid ${BORDE};"></div>
    <div style="padding: 28px 32px 8px;">
      <h1 style="font-size: 20px; color: ${TEXTO_PRINCIPAL}; margin: 0 0 12px; text-align: center;">${titulo}</h1>
      <p style="font-size: 14px; line-height: 1.6; color: ${TEXTO_SECUNDARIO}; margin: 0 0 24px; text-align: center;">${intro}</p>
      ${productosHtml ? `
      <div style="border-top: 1px solid ${BORDE}; border-bottom: 1px solid ${BORDE}; padding: 4px 0; margin: 0 0 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">${productosHtml}</table>
      </div>` : ''}
      ${filasHtml ? `
      <div style="background: ${BG_CAJA}; border: 1px solid ${BORDE}; border-radius: 12px; padding: 6px 22px; margin: 0 0 ${mapaUrl ? '12px' : '24px'};">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">${filasHtml}</table>
      </div>` : ''}
      ${mapaUrl ? `
      <p style="text-align: center; margin: 0 0 24px;">
        <a href="${mapaUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 12.5px; color: ${CORAL}; text-decoration: underline;">Ver ubicación en el mapa</a>
      </p>` : ''}
      ${notaFinal ? `<p style="font-size: 13px; line-height: 1.6; color: ${TEXTO_SECUNDARIO}; margin: 0 0 24px; text-align: center;">${notaFinal}</p>` : ''}
      ${qrsHtml ? `
      <div style="margin: 0 0 8px;">
        <p style="font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: ${TEXTO_SECUNDARIO}; font-weight: bold; margin: 0 0 4px; text-align: center;">
          Presenta esto en la entrada
        </p>
        ${qrsHtml}
      </div>` : ''}
    </div>
    <div style="padding: 20px 32px 28px; border-top: 1px solid ${BORDE}; text-align: center;">
      <p style="font-size: 12px; line-height: 1.5; color: ${TEXTO_SECUNDARIO}; margin: 0;">
        ${urlContacto()
          ? `Si tienes dudas, escríbenos a través de <a href="${urlContacto()}" target="_blank" rel="noopener noreferrer" style="color: ${CORAL};">la página de Contacto</a>.`
          : 'Si tienes dudas, escríbenos a través de la página de Contacto.'}
      </p>
      ${redesHtml}
    </div>
  </div>
</div>`;
}
