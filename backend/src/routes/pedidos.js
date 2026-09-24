import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabaseClient.js';
import { requireCsrf } from '../middleware/requireCsrf.js';
import { limiterEstricto } from '../middleware/rateLimiters.js';
import { logAudit, buscarBorradoEnAuditLog } from '../lib/auditLog.js';
import { stripUndefined } from '../lib/zodMultipart.js';
import { errorGenerico } from '../lib/errores.js';
import { paginacionSchema, aplicarRango, empaquetarPagina } from '../lib/paginacion.js';
import { enviarCorreo } from '../lib/resend.js';
import { plantillaCorreo, escaparHtml } from '../lib/emailPlantilla.js';
import { crearPreferencia } from '../lib/mercadoPago.js';

// Espejo intencional de `formatCOP` en frontend/src/utils/formato.js — no se
// puede importar directo (paquetes npm separados, backend/frontend, sin
// workspace compartido). `pedidos.total` siempre es COP (la Tienda no maneja
// otra moneda, a diferencia de Eventos), así que no hay riesgo real de
// divergencia de moneda — solo de la regla de formato en sí, si cambia una
// copia sin la otra. Si alguna vez se toca, revisar ambas.
function formatCOP(numero) {
  return '$' + Number(numero).toLocaleString('es-CO');
}

const ESTADOS = ['pendiente', 'pagado', 'cancelado', 'enviado'];

function zodError(result) {
  const err = new Error(result.error.issues.map((i) => i.message).join(', '));
  err.status = 400;
  return err;
}

function traducirError(error) {
  if (error.code === '23503') {
    const err = new Error('Uno de los productos indicados ya no existe');
    err.status = 400;
    return err;
  }
  return errorGenerico(error, 'pedidos.js traducirError');
}

async function obtenerPedidoCompleto(id) {
  const { data } = await supabase
    .from('pedidos')
    .select('*, pedido_items(*)')
    .eq('id', id)
    .single();
  return data;
}

// ⭐ Extraído a una función propia (Fase 6, Sección 2, 2026-09-10) — antes
// vivía en línea dentro del PATCH de admin (la transición manual a
// 'pagado'). Ahora también la usa `confirmarPagoPedido()` (el webhook de
// Mercado Pago) — mismo correo exacto, sin duplicar nada, sin importar cuál
// de los 2 caminos confirmó el pago.
async function enviarCorreoPagoConfirmado(pedido) {
  const productosCorreo = (pedido.pedido_items || []).map((it) => ({
    nombre: escaparHtml(it.nombre),
    detalle: [it.talla, it.color_nombre].filter(Boolean).map(escaparHtml).join(' · ') || null,
    cantidad: it.cantidad,
    precio: formatCOP(it.precio),
    imagenUrl: it.productos?.imagenes?.[0] ?? null,
  }));

  // ⭐ Cupones de descuento (pedido del usuario, 2026-09-10): si el pedido
  // usó uno, se muestra el desglose completo (subtotal → cupón → total) en
  // vez de solo el total final — mismo criterio de "que el comprador vea de
  // dónde sale el número" que ya usa el resto de los correos.
  const filas = [{ etiqueta: 'Pedido', valor: `#${pedido.numero_pedido}` }];
  if (pedido.cupon_codigo) {
    filas.push({ etiqueta: 'Subtotal', valor: formatCOP(pedido.subtotal) });
    filas.push({ etiqueta: 'Cupón aplicado', valor: `${escaparHtml(pedido.cupon_codigo)} (-${pedido.descuento_porcentaje}%)` });
  }
  filas.push({ etiqueta: 'Total', valor: formatCOP(pedido.total) });
  filas.push({ etiqueta: 'Envío a', valor: `${escaparHtml(pedido.direccion)}, ${escaparHtml(pedido.ciudad)}` });

  return enviarCorreo({
    to: pedido.email,
    subject: '¡Tu pago fue confirmado!',
    html: plantillaCorreo({
      titulo: '¡Tu pago fue confirmado!',
      intro: 'Ya registramos tu pago — tu pedido pasa a preparación. Aquí el resumen:',
      productos: productosCorreo,
      filas,
      notaFinal: 'Te avisaremos cuando tu pedido sea despachado.',
    }),
  }).catch((err) => console.error('Fallo al mandar correo de confirmación de pago:', err));
}

// ⭐ Fase 6, Sección 2 (Mercado Pago, 2026-09-10) — llamado por
// webhookMercadoPago.js cuando Mercado Pago confirma un pago aprobado para
// un pedido. Idempotente (mismo criterio que confirmarPagoReserva en
// reservas.js): si el pedido ya estaba 'pagado' — un reintento del webhook,
// Mercado Pago no garantiza una sola entrega — no hace nada.
export async function confirmarPagoPedido(pedidoId, referenciaMp) {
  const { data: actual, error: fetchError } = await supabase
    .from('pedidos')
    .select('*, pedido_items(producto_variante_id, cantidad, nombre, talla, color_nombre, precio, productos(imagenes))')
    .eq('id', pedidoId)
    .maybeSingle();

  if (fetchError || !actual) {
    const borrado = await buscarBorradoEnAuditLog('pedidos', pedidoId);
    if (borrado) {
      console.error(
        `confirmarPagoPedido: pago tardío ${referenciaMp} para el pedido ${pedidoId} — el registro fue BORRADO por ${borrado.usuario_email} el ${new Date(borrado.creado_en).toLocaleString('es-CO')}. Requiere revisión manual (posible reembolso).`,
      );
    } else {
      console.error('confirmarPagoPedido: pedido no encontrado -', pedidoId);
    }
    return;
  }

  if (actual.estado === 'pagado') return;

  // ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): un pedido
  // 'cancelado' (por `expirar_pedidos_pendientes()` o a mano desde el panel)
  // ya devolvió su stock y su uso de cupón. Un pago real que llega tarde
  // para ESTE pedido no puede marcarse 'pagado' a ciegas — ese stock puede
  // haberse vendido ya a otra persona. Antes de revivirlo, se intenta volver
  // a descontar el stock y reconsumir el cupón de verdad (mismas funciones
  // que usa la creación normal) — si ya no alcanza, se rechaza y se deja un
  // rastro (`referencia_mp` igual queda guardada) para que el admin lo
  // revise a mano (reembolsar al comprador o reubicarlo en otro producto).
  if (actual.estado === 'cancelado') {
    const itemsParaStock = (actual.pedido_items || []).map((it) => ({ variante_id: it.producto_variante_id, cantidad: it.cantidad }));
    const { error: stockError } = await supabase.rpc('descontar_stock_pedido', { p_items: itemsParaStock });
    if (stockError) {
      await supabase.from('pedidos').update({ referencia_mp: referenciaMp }).eq('id', pedidoId);
      console.error(
        `confirmarPagoPedido: pago tardío ${referenciaMp} para el pedido ${pedidoId} (ya cancelado) sin stock suficiente para revivirlo — requiere revisión manual (posible reembolso).`,
        stockError.message,
      );
      return;
    }
    if (actual.cupon_codigo) {
      const { error: cuponError } = await supabase.rpc('usar_cupon', { p_codigo: actual.cupon_codigo, p_subtotal: actual.subtotal });
      if (cuponError) {
        await supabase.rpc('restaurar_stock_pedido', { p_items: itemsParaStock });
        await supabase.from('pedidos').update({ referencia_mp: referenciaMp }).eq('id', pedidoId);
        console.error(
          `confirmarPagoPedido: pago tardío ${referenciaMp} para el pedido ${pedidoId} (ya cancelado), cupón "${actual.cupon_codigo}" ya no disponible — requiere revisión manual (posible reembolso).`,
          cuponError.message,
        );
        return;
      }
    }
  }

  const { error: updateError } = await supabase
    .from('pedidos')
    .update({ estado: 'pagado', referencia_mp: referenciaMp })
    .eq('id', pedidoId);

  if (updateError) {
    console.error('confirmarPagoPedido: fallo al actualizar estado -', updateError);
    return;
  }

  await enviarCorreoPagoConfirmado(actual);
}

// ── Router público: recepción de pedidos desde el carrito de Tienda ──
// El precio SIEMPRE se recalcula server-side a partir de `producto_variantes`
// + `productos` — el cliente solo manda `variante_id`/`cantidad`, nunca precio
// ni nombre (mismo principio que ya se aplica en reservas.js con `evento`).
export const pedidosPublicRouter = Router();

const itemSchema = z
  .object({
    variante_id: z.string().uuid('variante_id debe ser un uuid válido'),
    cantidad: z.coerce.number().int('cantidad debe ser un entero').positive('cantidad debe ser mayor a 0'),
  })
  .strict();

const publicSchema = z
  .object({
    nombre: z.string().trim().min(2, 'Ingresa tu nombre completo'),
    celular: z.string().trim().min(7, 'Ingresa un número de celular válido'),
    email: z.string().trim().email('Ingresa un correo electrónico válido'),
    direccion: z.string().trim().min(5, 'Ingresa una dirección de envío válida'),
    ciudad: z.string().trim().min(2, 'Ingresa una ciudad válida'),
    direccion_adicional: z.string().trim().min(1).nullable().optional(),
    items: z.array(itemSchema).min(1, 'El pedido debe tener al menos un producto'),
    // ⭐ Cupones de descuento (pedido del usuario, 2026-09-10) — opcional; el
    // % real y su validez se recalculan siempre server-side (ver RPC
    // `usar_cupon` más abajo), nunca se confía en nada que mande el cliente
    // más allá de CUÁL código quiere usar.
    cupon_codigo: z.string().trim().min(1).optional(),
    acepta_terminos: z.literal(true, { message: 'Debes aceptar los términos y condiciones' }),
  })
  .strict();

pedidosPublicRouter.post('/', limiterEstricto, async (req, res, next) => {
  const result = publicSchema.safeParse(req.body);
  if (!result.success) {
    return next(zodError(result));
  }

  const datos = result.data;

  // ⭐ Pedido del usuario (2026-09-17): libera primero cualquier stock/uso de
  // cupón que haya quedado atascado por pedidos 'pendiente' de hace más de
  // 30 min que nunca se pagaron (rechazados o abandonados) — antes de
  // chequear stock para ESTE pedido nuevo, para no bloquearlo por culpa de
  // un abandono ajeno. Ver `expirar_pedidos_pendientes()` (migración
  // 20260917120000) — mismo criterio de "expiración perezosa sin cron" que
  // ya usan las reservas, adaptado a que acá el stock se descuenta de verdad.
  const { error: expirarError } = await supabase.rpc('expirar_pedidos_pendientes');
  if (expirarError) {
    console.error('POST /api/pedidos: fallo al expirar pedidos pendientes viejos -', expirarError);
  }

  // ⭐ Bug real (auditoría 2026-08-30): el chequeo de stock corría por cada
  // línea del body por separado — 2 líneas con el mismo `variante_id` (ej.
  // 5+5 contra un stock de 6) pasaban las 2 validaciones individuales aunque
  // pidieran 10 en total. Se agrupa por `variante_id` ANTES de validar, así
  // el pedido nunca tiene 2 líneas para la misma variante ni una forma de
  // sobrepasar el stock partiendo la cantidad en varias entradas del body.
  const cantidadesPorVariante = new Map();
  for (const item of datos.items) {
    cantidadesPorVariante.set(item.variante_id, (cantidadesPorVariante.get(item.variante_id) || 0) + item.cantidad);
  }
  const itemsAgrupados = [...cantidadesPorVariante.entries()].map(([variante_id, cantidad]) => ({ variante_id, cantidad }));

  const varianteIds = [...cantidadesPorVariante.keys()];
  const { data: variantes, error: variantesError } = await supabase
    .from('producto_variantes')
    .select('id, talla, color_nombre, stock, productos(id, nombre, precio, activo)')
    .in('id', varianteIds);

  if (variantesError) {
    return next(errorGenerico(variantesError, 'POST /api/pedidos (variantes)'));
  }

  const items = [];
  let subtotal = 0;

  for (const item of itemsAgrupados) {
    const variante = variantes.find((v) => v.id === item.variante_id);

    if (!variante || !variante.productos?.activo) {
      const err = new Error('Uno de los productos de tu carrito ya no está disponible. Actualiza tu carrito e intenta de nuevo.');
      err.status = 400;
      return next(err);
    }

    if (item.cantidad > variante.stock) {
      const err = new Error(
        `Ya no hay stock suficiente de "${variante.productos.nombre}"${variante.talla ? ` (talla ${variante.talla})` : ''}. Disponible: ${variante.stock}.`,
      );
      err.status = 400;
      return next(err);
    }

    const precio = variante.productos.precio;
    items.push({
      producto_id: variante.productos.id,
      producto_variante_id: variante.id,
      nombre: variante.productos.nombre,
      talla: variante.talla,
      color_nombre: variante.color_nombre,
      precio,
      cantidad: item.cantidad,
    });
    subtotal += precio * item.cantidad;
  }

  // ⭐ Cupones de descuento (pedido del usuario, 2026-09-10) — se valida y
  // CONSUME (atómico, con lock — ver migración) antes de tocar stock, así
  // si el cupón ya no sirve no queda nada que compensar todavía. `cuponInfo`
  // queda `null` si no se mandó ningún código — el resto del flujo sigue
  // exactamente igual que antes, sin descuento.
  let cuponInfo = null;
  if (datos.cupon_codigo) {
    const { data: resultadoCupon, error: cuponError } = await supabase.rpc('usar_cupon', {
      p_codigo: datos.cupon_codigo.toUpperCase(),
      p_subtotal: subtotal,
    });
    if (cuponError) {
      const agotado = cuponError.message === 'cupon_agotado';
      const err = new Error(agotado ? 'Este cupón ya alcanzó su límite de usos.' : 'Este cupón no existe o ya no está activo.');
      err.status = agotado ? 409 : 404;
      return next(err);
    }
    cuponInfo = resultadoCupon[0];
  }

  const total = cuponInfo ? cuponInfo.total : subtotal;

  // ⭐ Bug real corregido (auditoría Fase 5, 2026-08-31/09-01): el chequeo de
  // arriba (`item.cantidad > variante.stock`) es solo una validación rápida
  // con el dato leído hace un instante — nunca restaba nada de verdad, así
  // que 2 compras casi simultáneas podían las 2 pasar esa validación y
  // sobrevender. `descontar_stock_pedido` (ver migración) hace el descuento
  // real de forma atómica en la base para TODOS los items del pedido a la
  // vez — si cualquiera ya no tiene stock suficiente en ese instante exacto,
  // aborta sin dejar ningún item a medio descontar.
  const { error: stockError } = await supabase.rpc('descontar_stock_pedido', {
    p_items: itemsAgrupados,
  });
  if (stockError) {
    if (cuponInfo) await supabase.rpc('devolver_uso_cupon', { p_cupon_id: cuponInfo.cupon_id });
    const err = new Error('Uno de los productos de tu carrito ya no tiene stock suficiente — alguien más lo compró justo antes. Actualiza tu carrito e intenta de nuevo.');
    err.status = 409;
    return next(err);
  }

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      nombre: datos.nombre,
      celular: datos.celular,
      email: datos.email,
      direccion: datos.direccion,
      ciudad: datos.ciudad,
      direccion_adicional: datos.direccion_adicional ?? null,
      subtotal,
      total,
      cupon_codigo: cuponInfo ? datos.cupon_codigo.toUpperCase() : null,
      descuento_porcentaje: cuponInfo ? cuponInfo.porcentaje : null,
      acepta_terminos: true,
      estado: 'pendiente',
    })
    .select()
    .single();

  if (pedidoError) {
    // El stock ya se descontó — si el pedido no se puede crear, hay que
    // devolverlo (compensación manual: no hay una transacción real que
    // envuelva el RPC de arriba y este insert, son 2 llamadas separadas a
    // PostgREST). Mismo criterio para el cupón, si se usó uno.
    await supabase.rpc('restaurar_stock_pedido', { p_items: itemsAgrupados });
    if (cuponInfo) await supabase.rpc('devolver_uso_cupon', { p_cupon_id: cuponInfo.cupon_id });
    return next(traducirError(pedidoError));
  }

  const filas = items.map((it) => ({ ...it, pedido_id: pedido.id }));
  const { error: itemsError } = await supabase.from('pedido_items').insert(filas);

  if (itemsError) {
    // El pedido ya se creó — si las líneas fallan, no dejamos un pedido sin
    // items (mismo criterio que productos.js con producto+variantes). Mismo
    // criterio de compensación que arriba para el stock/cupón ya consumidos.
    await supabase.from('pedidos').delete().eq('id', pedido.id);
    await supabase.rpc('restaurar_stock_pedido', { p_items: itemsAgrupados });
    if (cuponInfo) await supabase.rpc('devolver_uso_cupon', { p_cupon_id: cuponInfo.cupon_id });
    return next(errorGenerico(itemsError, 'POST /api/pedidos (items)'));
  }

  // ⭐ Mercado Pago (Fase 6, Sección 2, 2026-09-10) — Checkout Pro real,
  // reemplaza por completo la coordinación manual de siempre (decisión de
  // producto ya tomada con el usuario). El pedido y su stock ya quedaron
  // confirmados arriba, igual que siempre — acá solo se agrega el link de
  // pago. Si Mercado Pago falla al crear la preferencia, se revierte TODO
  // (mismo criterio de compensación que el resto de esta ruta: un pedido no
  // debe quedar creado sin ninguna forma real de pagarlo).
  const primerOrigen = (process.env.FRONTEND_URL || '').split(',').map((s) => s.trim()).filter(Boolean)[0];
  const backUrls = primerOrigen?.startsWith('https://')
    ? {
        success: `${primerOrigen}/#/confirmacion?pedido=${pedido.id}`,
        pending: `${primerOrigen}/#/confirmacion?pedido=${pedido.id}`,
        failure: `${primerOrigen}/#/pago-cancelado?pedido=${pedido.id}`,
      }
    : undefined; // ver hallazgo real en reservas.js: Mercado Pago rechaza la preferencia si back_urls.success no es https:// real (ej. localhost en desarrollo)

  // ⭐ Cupones (2026-09-10): si se aplicó descuento, Mercado Pago tiene que
  // cobrar el monto YA descontado — no hay forma de mandarle "items al
  // precio de siempre" y que él mismo reste un %. Cada línea se manda con
  // `quantity: 1` y el precio de la línea completa (ya con descuento) como
  // `unit_price` — evita precios unitarios fraccionados si la cantidad es
  // >1. El último item absorbe cualquier diferencia de redondeo, para que
  // la suma coincida EXACTO con `total` (lo que de verdad se guardó).
  const itemsMP = items.map((it) => {
    if (!cuponInfo) {
      return {
        id: it.producto_variante_id,
        title: `${it.nombre}${it.talla ? ` (${it.talla})` : ''}${it.color_nombre ? ` - ${it.color_nombre}` : ''}`,
        quantity: it.cantidad,
        currency_id: 'COP',
        unit_price: it.precio,
      };
    }
    const precioLineaConDescuento = Math.round((it.precio * it.cantidad * cuponInfo.porcentaje) / 100);
    return {
      id: it.producto_variante_id,
      title: `${it.nombre}${it.talla ? ` (${it.talla})` : ''}${it.color_nombre ? ` - ${it.color_nombre}` : ''} x${it.cantidad}`,
      quantity: 1,
      currency_id: 'COP',
      unit_price: it.precio * it.cantidad - precioLineaConDescuento,
    };
  });
  if (cuponInfo) {
    const sumaActual = itemsMP.reduce((acc, it) => acc + it.unit_price, 0);
    itemsMP[itemsMP.length - 1].unit_price += total - sumaActual;
  }

  // ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): a diferencia de
  // `reservas.js`, esta preferencia no tenía vencimiento — quedaba válida
  // para pagar indefinidamente, incluso después de que `expirar_pedidos_
  // pendientes()` ya hubiera liberado el stock/cupón de este mismo pedido a
  // los 30 min. Mismos 30 min que esa función, contados desde el `creado_en`
  // real del pedido (no desde ahora) para que ambos venzan exactamente
  // juntos, sin importar cuánto haya tardado el resto de este request.
  const expiraEn = new Date(new Date(pedido.creado_en).getTime() + 30 * 60 * 1000).toISOString();

  let preferencia;
  try {
    preferencia = await crearPreferencia({
      items: itemsMP,
      externalReference: `pedido:${pedido.id}`,
      backUrls,
      notificationUrl: process.env.BACKEND_PUBLIC_URL ? `${process.env.BACKEND_PUBLIC_URL}/api/webhooks/mercadopago` : undefined,
      expiraEn,
    });
  } catch (err) {
    await supabase.from('pedido_items').delete().eq('pedido_id', pedido.id);
    await supabase.from('pedidos').delete().eq('id', pedido.id);
    await supabase.rpc('restaurar_stock_pedido', { p_items: itemsAgrupados });
    if (cuponInfo) await supabase.rpc('devolver_uso_cupon', { p_cupon_id: cuponInfo.cupon_id });
    return next(errorGenerico(err, 'POST /api/pedidos (crear preferencia Mercado Pago)'));
  }

  res.status(201).json({ ok: true, data: { initPoint: preferencia.initPoint } });
});

// ── Router admin: gestión (montado en /api/admin/pedidos con requireAdmin) ──
const router = Router();

const updateSchema = z
  .object({
    nombre: z.string().trim().min(2).optional(),
    celular: z.string().trim().min(7).optional(),
    email: z.string().trim().email().optional(),
    direccion: z.string().trim().min(5).optional(),
    ciudad: z.string().trim().min(2).optional(),
    direccion_adicional: z.string().trim().nullable().optional(),
    estado: z.enum(ESTADOS).optional(),
    referencia_mp: z.string().trim().nullable().optional(),
  })
  .strict();

// GET / — listar pedidos (paginados), con sus líneas embebidas. ⭐ Paginación
// real agregada (auditoría Fase 5, 2026-09-01) — igual criterio que
// inscripciones/reservas: se alimenta de compras públicas, crece sin límite.
router.get('/', async (req, res, next) => {
  const result = paginacionSchema.safeParse(req.query);
  if (!result.success) {
    return next(zodError(result));
  }
  const { offset, limit } = result.data;

  // Mismo criterio que en el POST público — el admin ve el estado real
  // (pedidos viejos sin pagar ya como 'cancelado', con su stock/cupón
  // liberados) sin depender de que alguien más compre para disparar la
  // limpieza. Ver `expirar_pedidos_pendientes()`, migración 20260917120000.
  const { error: expirarError } = await supabase.rpc('expirar_pedidos_pendientes');
  if (expirarError) {
    console.error('GET /api/admin/pedidos: fallo al expirar pedidos pendientes viejos -', expirarError);
  }

  const query = supabase
    .from('pedidos')
    .select('*, pedido_items(*)')
    .order('creado_en', { ascending: false });

  const { data, error } = await aplicarRango(query, offset, limit);

  if (error) {
    return next(errorGenerico(error, 'GET /api/admin/pedidos'));
  }

  res.json({ ok: true, ...empaquetarPagina(data, limit) });
});

// PATCH /:id — el admin corrige datos del comprador/envío, cambia estado
// (ej. pagado/enviado) o registra una referencia de pago manual.
router.patch('/:id', requireCsrf, async (req, res, next) => {
  const { id } = req.params;

  const { data: actual, error: fetchError } = await supabase
    .from('pedidos')
    .select('*, pedido_items(producto_variante_id, cantidad, nombre, talla, color_nombre, precio, productos(imagenes))')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !actual) {
    const err = new Error('Pedido no encontrado');
    err.status = 404;
    return next(err);
  }

  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return next(zodError(result));
  }

  const updates = stripUndefined(result.data);

  // ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): esto antes leía el
  // estado actual en JS, decidía, y recién después compensaba stock/cupón —
  // 2 peticiones casi simultáneas (2 clics, o 2 pestañas del panel abiertas)
  // podían las 2 leer el mismo estado viejo y las 2 ejecutar la
  // restauración/reconsumo, devolviendo o retomando el mismo cupón/stock 2
  // veces. Se mueve TODO eso a `actualizar_estado_pedido()` (migración
  // 20260917150000) — una sola transacción de Postgres con
  // `select ... for update`, que bloquea la fila para que una 2da llamada
  // concurrente para el MISMO pedido tenga que esperar su turno y vea el
  // estado ya actualizado, en vez de pisar el trabajo de la primera.
  const estadoCambia = updates.estado && updates.estado !== actual.estado;
  if (estadoCambia) {
    const { error: estadoError } = await supabase.rpc('actualizar_estado_pedido', {
      p_pedido_id: id,
      p_nuevo_estado: updates.estado,
    });
    if (estadoError) {
      if (estadoError.message === 'pedido_no_encontrado') {
        const err = new Error('Pedido no encontrado');
        err.status = 404;
        return next(err);
      }
      if (estadoError.message.startsWith('stock_insuficiente')) {
        const err = new Error('No se puede reactivar este pedido — ya no hay stock suficiente de uno o más productos.');
        err.status = 409;
        return next(err);
      }
      if (estadoError.message === 'cupon_agotado') {
        const err = new Error('No se puede reactivar este pedido — el cupón ya alcanzó su límite de usos con otras compras.');
        err.status = 409;
        return next(err);
      }
      if (estadoError.message === 'cupon_invalido') {
        const err = new Error('No se puede reactivar este pedido — el cupón ya no existe o está desactivado.');
        err.status = 409;
        return next(err);
      }
      return next(errorGenerico(estadoError, 'PATCH /api/admin/pedidos/:id (actualizar_estado_pedido)'));
    }
  }

  // El resto de los campos (nombre, dirección, etc.) se guarda aparte —
  // `estado` ya quedó resuelto de forma atómica arriba (si cambiaba), así
  // que se excluye acá para no volver a escribirlo por fuera de esa función
  // (y para no pisar un resultado idempotente con el valor pedido a ciegas).
  const { estado: _estadoYaAplicado, ...updatesRestantes } = updates;

  if (Object.keys(updatesRestantes).length > 0) {
    const { error } = await supabase.from('pedidos').update(updatesRestantes).eq('id', id);
    if (error) {
      return next(traducirError(error));
    }
  }

  if (estadoCambia || Object.keys(updatesRestantes).length > 0) {
    await logAudit({
      actor: req.admin,
      accion: 'editar',
      entidad: 'pedidos',
      entidadId: id,
      detalle: updates,
    });

    // ⭐ Correo de confirmación (Fase 6, 2026-09-08; corregido 2026-09-09 para
    // no bloquear la respuesta — ver misma nota en reservas.js/inscripciones.js)
    // — el 4to y último flujo desbloqueado sin depender de Mercado Pago: el
    // pago hoy se coordina y se marca "pagado" a mano desde el panel (ver
    // ReservaModal/CompradorModal, "te contactaremos para coordinar el
    // pago"), no por un webhook — pero el aviso al comprador tiene sentido
    // igual apenas eso ocurre. Solo se manda en la TRANSICIÓN real hacia
    // 'pagado' (no en cada PATCH que ya estaba pagado antes, ej. si el admin
    // corrige el teléfono después).
    // ⭐ Pedido del usuario (2026-09-10): mostrar los productos reales
    // comprados (foto + detalle) — ver `enviarCorreoPagoConfirmado` arriba,
    // reusada también por `confirmarPagoPedido` (el webhook de Mercado
    // Pago, Fase 6 Sección 2) para no duplicar este correo en 2 lugares.
    if (updates.estado === 'pagado' && actual.estado !== 'pagado') {
      enviarCorreoPagoConfirmado(actual);
    }
  }

  res.json({ ok: true, data: await obtenerPedidoCompleto(id) });
});

// DELETE /:id — se permite (ej. duplicados o envíos erróneos), igual criterio
// que Reservas; para solo cerrar un caso sin perder el registro, usar
// PATCH { estado: 'cancelado' } en su lugar.
router.delete('/:id', requireCsrf, async (req, res, next) => {
  const { id } = req.params;

  const { data: actual, error: fetchError } = await supabase
    .from('pedidos')
    .select('*, pedido_items(producto_variante_id, cantidad)')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !actual) {
    const err = new Error('Pedido no encontrado');
    err.status = 404;
    return next(err);
  }

  const { error } = await supabase.from('pedidos').delete().eq('id', id);
  if (error) {
    return next(errorGenerico(error, 'DELETE /api/admin/pedidos/:id'));
  }

  // ⭐ Ajuste real (auditoría Fase 5): si el pedido borrado no estaba ya
  // cancelado, su stock nunca se había devuelto -- devolverlo acá (ej. un
  // duplicado o un pedido cargado por error, ver el comentario de esta ruta).
  // Si ya estaba cancelado, el stock ya se restauró en el PATCH que lo canceló.
  if (actual.estado !== 'cancelado') {
    const itemsParaStock = (actual.pedido_items || []).map((it) => ({ variante_id: it.producto_variante_id, cantidad: it.cantidad }));
    await supabase.rpc('restaurar_stock_pedido', { p_items: itemsParaStock });
    // ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): mismo hueco que ya
    // se corrigió para "cancelar" un pedido (PATCH a `estado: 'cancelado'`,
    // ver `actualizar_estado_pedido()`) — borrar un pedido devolvía el
    // stock, pero nunca el uso de cupón. Mismo gate que el stock de arriba:
    // si ya estaba 'cancelado', el cupón ya se devolvió ahí, no hay que
    // devolverlo 2 veces.
    if (actual.cupon_codigo) {
      const { data: cupon } = await supabase.from('cupones').select('id').eq('codigo', actual.cupon_codigo).maybeSingle();
      if (cupon) await supabase.rpc('devolver_uso_cupon', { p_cupon_id: cupon.id });
    }
  }

  await logAudit({
    actor: req.admin,
    accion: 'borrar',
    entidad: 'pedidos',
    entidadId: id,
    detalle: { nombre: actual.nombre, total: actual.total },
  });

  res.json({ ok: true });
});

export default router;
