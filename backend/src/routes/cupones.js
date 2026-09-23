import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabaseClient.js';
import { requireCsrf } from '../middleware/requireCsrf.js';
import { limiterEstricto } from '../middleware/rateLimiters.js';
import { logAudit } from '../lib/auditLog.js';
import { stripUndefined } from '../lib/zodMultipart.js';
import { errorGenerico } from '../lib/errores.js';

// ⭐ Cupones de descuento para la Tienda (pedido del usuario, 2026-09-10) —
// decisiones ya confirmadas: el % aplica siempre a TODO el pedido, y cada
// cupón tiene un límite de usos obligatorio (sin opción de "ilimitado").

function zodError(result) {
  const err = new Error(result.error.issues.map((i) => i.message).join(', '));
  err.status = 400;
  return err;
}

function traducirError(error) {
  if (error.code === '23505') {
    const err = new Error('Ya existe un cupón con ese código');
    err.status = 409;
    return err;
  }
  return errorGenerico(error, 'cupones.js traducirError');
}

// El código se guarda siempre en mayúsculas — evita que "VERANO20" y
// "verano20" convivan como cupones distintos por un descuido al escribirlo.
const codigoSchema = z.string().trim().min(3, 'El código debe tener al menos 3 caracteres').max(30, 'El código es demasiado largo').transform((v) => v.toUpperCase());

const createSchema = z.object({
  codigo: codigoSchema,
  porcentaje: z.coerce.number().int('porcentaje debe ser un entero').positive('porcentaje debe ser mayor a 0').max(100, 'porcentaje no puede superar 100'),
  usos_maximos: z.coerce.number().int('usos_maximos debe ser un entero').positive('usos_maximos debe ser mayor a 0'),
}).strict();

const updateSchema = z.object({
  codigo: codigoSchema.optional(),
  porcentaje: z.coerce.number().int().positive().max(100).optional(),
  usos_maximos: z.coerce.number().int().positive().optional(),
  activo: z.boolean().optional(),
}).strict();

// ── Router admin: gestión (montado en /api/admin/cupones con requireAdmin) ──
const router = Router();

router.get('/', async (req, res, next) => {
  const { data, error } = await supabase.from('cupones').select('*').order('creado_en', { ascending: false });
  if (error) return next(errorGenerico(error, 'GET /api/admin/cupones'));
  res.json({ ok: true, data });
});

router.post('/', requireCsrf, async (req, res, next) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) return next(zodError(result));

  const { data, error } = await supabase.from('cupones').insert(result.data).select().single();
  if (error) return next(traducirError(error));

  await logAudit({
    actor: req.admin,
    accion: 'crear',
    entidad: 'cupones',
    entidadId: data.id,
    detalle: { codigo: data.codigo, porcentaje: data.porcentaje, usos_maximos: data.usos_maximos },
  });

  res.status(201).json({ ok: true, data });
});

router.patch('/:id', requireCsrf, async (req, res, next) => {
  const { id } = req.params;

  const { data: actual, error: fetchError } = await supabase.from('cupones').select('*').eq('id', id).maybeSingle();
  if (fetchError || !actual) {
    const err = new Error('Cupón no encontrado');
    err.status = 404;
    return next(err);
  }

  const result = updateSchema.safeParse(req.body);
  if (!result.success) return next(zodError(result));
  const updates = stripUndefined(result.data);

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('cupones').update(updates).eq('id', id);
    if (error) return next(traducirError(error));

    await logAudit({ actor: req.admin, accion: 'editar', entidad: 'cupones', entidadId: id, detalle: updates });
  }

  const { data } = await supabase.from('cupones').select('*').eq('id', id).single();
  res.json({ ok: true, data });
});

router.delete('/:id', requireCsrf, async (req, res, next) => {
  const { id } = req.params;

  const { data: actual, error: fetchError } = await supabase.from('cupones').select('*').eq('id', id).maybeSingle();
  if (fetchError || !actual) {
    const err = new Error('Cupón no encontrado');
    err.status = 404;
    return next(err);
  }

  const { error } = await supabase.from('cupones').delete().eq('id', id);
  if (error) return next(errorGenerico(error, 'DELETE /api/admin/cupones/:id'));

  await logAudit({ actor: req.admin, accion: 'borrar', entidad: 'cupones', entidadId: id, detalle: { codigo: actual.codigo } });

  res.json({ ok: true });
});

export default router;

// ── Router público: validar un cupón desde el Carrito (montado en /api/cupones) ──
// Solo valida y calcula — NO consume un uso (eso pasa de verdad recién al
// crear el pedido, ver pedidos.js). Nunca se expone un listado de cupones
// acá — solo se puede consultar UNO por su código exacto, para no dejar que
// cualquiera descubra los códigos activos mirando la API.
export const cuponesPublicRouter = Router();

const validarSchema = z.object({
  codigo: z.string().trim().min(1, 'codigo es obligatorio'),
  subtotal: z.coerce.number().int('subtotal debe ser un entero').positive('subtotal debe ser mayor a 0'),
}).strict();

cuponesPublicRouter.post('/validar', limiterEstricto, async (req, res, next) => {
  const result = validarSchema.safeParse(req.body);
  if (!result.success) return next(zodError(result));
  const { codigo, subtotal } = result.data;

  const { data: cupon, error } = await supabase
    .from('cupones')
    .select('porcentaje, usos_maximos, usos_actuales, activo')
    .eq('codigo', codigo.toUpperCase())
    .maybeSingle();

  // ⭐ Hallazgo real (preauditoría de Fase 6, 2026-09-17): antes esto
  // distinguía "no existe/inactivo" (404) de "agotado" (409) con mensajes
  // distintos — alguien probando muchos códigos a mano podía darse cuenta de
  // cuáles SÍ existen (aunque nunca se revelara el % de descuento) solo
  // mirando si la respuesta cambiaba de 404 a 409. Se unifica en un solo
  // caso/mensaje/estado — inválido y agotado se ven exactamente igual desde
  // afuera.
  if (error || !cupon || !cupon.activo || cupon.usos_actuales >= cupon.usos_maximos) {
    const err = new Error('Este cupón no es válido o ya no está disponible.');
    err.status = 404;
    return next(err);
  }

  const descuento = Math.round((subtotal * cupon.porcentaje) / 100);

  res.json({
    ok: true,
    data: { porcentaje: cupon.porcentaje, descuento, total: subtotal - descuento },
  });
});
