import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabaseClient.js';
import { requireCsrf } from '../middleware/requireCsrf.js';
import { limiterEstricto } from '../middleware/rateLimiters.js';
import { logAudit } from '../lib/auditLog.js';
import { stripUndefined } from '../lib/zodMultipart.js';
import { errorGenerico } from '../lib/errores.js';
import { paginacionSchema, aplicarRango, empaquetarPagina } from '../lib/paginacion.js';
import { enviarCorreo } from '../lib/resend.js';

const EMAIL_DESTINO = process.env.CONTACTO_EMAIL_DESTINO || 'info@colombiacanta.org';

function zodError(result) {
  const err = new Error(result.error.issues.map((i) => i.message).join(', '));
  err.status = 400;
  return err;
}

function escaparHtml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Router público: recepción del formulario de Contacto ──
export const contactoPublicRouter = Router();

const publicSchema = z
  .object({
    nombre: z.string().trim().min(2, 'Ingresa tu nombre completo').max(120),
    email: z.string().trim().email('Ingresa un correo electrónico válido'),
    telefono: z.string().trim()
      .max(30)
      .regex(/^[0-9+()\s-]{7,30}$/, 'El teléfono solo puede tener dígitos, espacios, +, - o paréntesis')
      .refine((v) => v.replace(/\D/g, '').length >= 7, 'Ingresa un número de teléfono válido'),
    mensaje: z.string().trim().min(5, 'Escribe un mensaje un poco más largo').max(4000),
  })
  .strict();

contactoPublicRouter.post('/', limiterEstricto, async (req, res, next) => {
  const result = publicSchema.safeParse(req.body);
  if (!result.success) {
    return next(zodError(result));
  }

  const datos = result.data;

  const { data, error } = await supabase
    .from('contacto_mensajes')
    .insert(datos)
    .select()
    .single();

  if (error) {
    return next(errorGenerico(error, 'POST /api/contacto'));
  }

  // El mensaje ya quedó a salvo en la base de datos — un fallo al avisar por
  // correo no debe convertirse en un error para quien escribió el formulario.
  await enviarCorreo({
    to: EMAIL_DESTINO,
    replyTo: datos.email,
    subject: `Nuevo mensaje de contacto — ${datos.nombre}`,
    html: `
      <p><strong>Nombre:</strong> ${escaparHtml(datos.nombre)}</p>
      <p><strong>Correo:</strong> ${escaparHtml(datos.email)}</p>
      <p><strong>Teléfono:</strong> ${escaparHtml(datos.telefono)}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${escaparHtml(datos.mensaje).replace(/\n/g, '<br>')}</p>
    `,
  });

  res.status(201).json({ ok: true, data });
});

// ── Router admin: gestión (montado en /api/admin/contacto con requireAdmin) ──
const router = Router();

const updateSchema = z
  .object({
    leido: z.boolean(),
  })
  .strict();

// GET / — bandeja de mensajes recibidos, más recientes primero.
router.get('/', async (req, res, next) => {
  const result = paginacionSchema.safeParse(req.query);
  if (!result.success) {
    return next(zodError(result));
  }
  const { offset, limit } = result.data;

  const query = supabase
    .from('contacto_mensajes')
    .select('*')
    .order('creado_en', { ascending: false });

  const { data, error } = await aplicarRango(query, offset, limit);

  if (error) {
    return next(errorGenerico(error, 'GET /api/admin/contacto'));
  }

  res.json({ ok: true, ...empaquetarPagina(data, limit) });
});

// PATCH /:id — marcar como leído/no leído.
router.patch('/:id', requireCsrf, async (req, res, next) => {
  const { id } = req.params;

  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return next(zodError(result));
  }

  const { data: actual, error: fetchError } = await supabase
    .from('contacto_mensajes')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !actual) {
    const err = new Error('Mensaje no encontrado');
    err.status = 404;
    return next(err);
  }

  const updates = stripUndefined(result.data);

  const { data, error } = await supabase
    .from('contacto_mensajes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return next(errorGenerico(error, 'PATCH /api/admin/contacto/:id'));
  }

  await logAudit({
    actor: req.admin,
    accion: 'editar',
    entidad: 'contacto_mensajes',
    entidadId: id,
    detalle: updates,
  });

  res.json({ ok: true, data });
});

// DELETE /:id — descartar un mensaje (spam, duplicado, ya atendido).
router.delete('/:id', requireCsrf, async (req, res, next) => {
  const { id } = req.params;

  const { data: actual, error: fetchError } = await supabase
    .from('contacto_mensajes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !actual) {
    const err = new Error('Mensaje no encontrado');
    err.status = 404;
    return next(err);
  }

  const { error } = await supabase.from('contacto_mensajes').delete().eq('id', id);
  if (error) {
    return next(errorGenerico(error, 'DELETE /api/admin/contacto/:id'));
  }

  await logAudit({
    actor: req.admin,
    accion: 'borrar',
    entidad: 'contacto_mensajes',
    entidadId: id,
    detalle: { nombre: actual.nombre, email: actual.email },
  });

  res.json({ ok: true });
});

export default router;
