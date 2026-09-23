// Espejo intencional de `parsePrecioCompuesto` en
// frontend/src/utils/formato.js — no se puede importar directo (paquetes
// npm separados, backend/frontend, sin workspace compartido). Necesario acá
// para leer `zonas[].precio` de un evento (string compuesto, ej. "$45.000"
// o "$35 USD") y calcular el monto real a cobrar con Mercado Pago — el
// precio SIEMPRE se recalcula server-side a partir de la zona real, nunca
// se confía en lo que manda el frontend (mismo criterio que pedidos.js con
// `producto_variantes.precio`). Si alguna vez se toca una copia, revisar
// también la otra.
export function parsePrecioCompuesto(texto) {
  if (!texto) return { monto: 0, moneda: 'COP' };
  const moneda = /usd/i.test(texto) ? 'USD' : 'COP';
  const tramoNumerico = texto.match(/[\d.,]+/)?.[0] || '';
  const monto = Number(tramoNumerico.replace(/\./g, '').replace(',', '.')) || 0;
  return { monto, moneda };
}
