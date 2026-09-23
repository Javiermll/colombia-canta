import QRCode from 'qrcode';
import sharp from 'sharp';
import crypto from 'crypto';
import { supabase } from '../config/supabaseClient.js';

// El contenido del QR es el `id` de la fila en `reserva_entradas` — ya es un
// UUID único e imposible de adivinar (128 bits), no hace falta firmarlo ni
// envolverlo en un token aparte.
const BUCKET = 'sitio-imagenes';
const CARPETA = 'qrs';

// ⭐ Hallazgo real del usuario (2026-09-10): la primera versión embebía el QR
// como `data:` URI directo en el `<img src>` del correo — funciona en Apple
// Mail, pero Gmail (el cliente más usado, y el que probó el usuario) bloquea
// las imágenes `data:` por seguridad y simplemente no las muestra, dejando
// el correo sin QR visible. Se sube el PNG a Storage (mismo bucket público
// `sitio-imagenes` que ya usan las fotos de eventos/productos) y el correo
// referencia una URL real — funciona en cualquier cliente de correo.
//
// El contenido del QR (el UUID de la entrada) no es sensible por sí solo —
// la seguridad real vive en el PIN de puerta + que la entrada exista en la
// base, no en que la imagen del QR esté oculta — así que subirlo a un bucket
// público no introduce ningún riesgo nuevo (ver validarEntrada.js).
//
// `upsert: true` con el `entradaId` como nombre de archivo hace esto
// idempotente — si se llama de nuevo para la misma entrada (ej. un futuro
// reenvío del correo), sobreescribe con el mismo contenido en vez de
// acumular archivos huérfanos.
export async function generarQrUrl(entradaId) {
  const png = await QRCode.toBuffer(entradaId, { width: 440, margin: 1 });
  // El bucket `sitio-imagenes` solo acepta `image/webp` (todo lo demás del
  // sitio pasa por esa conversión, ver imageUpload.js) — se convierte el QR
  // a webp SIN PÉRDIDA (no la compresión con calidad reducida que sí se usa
  // para fotos) para no arriesgar que un QR comprimido deje de leerse bien.
  const webp = await sharp(png).webp({ lossless: true }).toBuffer();
  const path = `${CARPETA}/${entradaId}.webp`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, webp, { contentType: 'image/webp', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ⭐ Código corto de respaldo (pedido del usuario, 2026-09-10) — el `id` de
// la entrada ya sirve para identificarla, pero es un UUID de 36 caracteres,
// poco práctico para que el staff de la puerta lo escriba a mano si el QR no
// escanea. No es un secreto (la seguridad real es el PIN + un solo uso, ver
// validarEntrada.js) — solo necesita ser corto, fácil de leer/tipear, y
// prácticamente único. Alfabeto sin `0/O/1/I/L` (se confunden fácil a mano o
// en letra chica) — 8 caracteres de un alfabeto de 32 ya da ~1 billón de
// combinaciones, de sobra para esto.
const ALFABETO_CODIGO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generarCodigoCorto() {
  let codigo = '';
  for (let i = 0; i < 8; i += 1) {
    codigo += ALFABETO_CODIGO[crypto.randomInt(0, ALFABETO_CODIGO.length)];
  }
  return `${codigo.slice(0, 4)}-${codigo.slice(4)}`;
}
