import rateLimit from 'express-rate-limit';

// ⭐ Hallazgo real (2026-08-14, uso real del panel): 100 peticiones/15min por IP
// es un límite pensado para frenar abuso, pero se aplica a TODO (index.js:44),
// incluidos los GET públicos de solo lectura del sitio y las revisiones de
// sesión del panel. Una sola carga del home ya dispara ~4 peticiones (hero,
// eventos, eventos-fijos, noticias), y en desarrollo React StrictMode las
// duplica; navegar unas cuantas pantallas del panel agotaba el cupo en minutos
// y dejaba al admin bloqueado con 429 en TODO, incluida su propia sesión.
export const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta de nuevo en unos minutos.' },
});

export const limiterEstricto = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, intenta de nuevo en unos minutos.' },
});

// Pantalla de puerta (Fase 6, 2026-09-08) — necesita mucho más volumen legítimo
// que limiterEstricto (el staff puede escanear a cientos de personas en poco
// tiempo durante un evento real), pero sigue siendo un endpoint que recibe un
// PIN como credencial — 120/15min alcanza sobrado para uso real y sigue
// haciendo impráctico adivinar un PIN de 6 dígitos por fuerza bruta (1M
// combinaciones tardaría semanas a este ritmo).
export const limiterPuerta = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, espera unos minutos.' },
});
