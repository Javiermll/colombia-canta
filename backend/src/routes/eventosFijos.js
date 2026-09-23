import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabaseClient.js';
import { requireCsrf } from '../middleware/requireCsrf.js';
import { logAudit } from '../lib/auditLog.js';
import { uploadMiddleware, validarImagenReal, procesarYSubirImagen, borrarImagenPorUrl } from '../lib/imageUpload.js';
import { jsonArrayField, nullableNumberFromString } from '../lib/zodMultipart.js';
import { toCamelCase } from '../lib/camelCase.js';
import { errorGenerico } from '../lib/errores.js';
import { regenerarPinPuerta } from '../lib/pin.js';

const router = Router();
const CARPETA_GALERIA = 'eventos-fijos/galeria';
const MAX_SHOWS = 20; // tope razonable de shows en una programación mensual

const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fechaISO debe tener formato YYYY-MM-DD');

// 2026-08-16 · Rediseño pedido por el usuario, reemplaza el esquema anterior
// (galería aparte, ligada a cada show solo por posición en la lista — ver
// git history de este archivo). Cada show ahora guarda su propia `foto`
// dentro del mismo objeto — se puede agregar/editar/borrar un show sin
// tener que volver a mandar la foto de los demás. `nombre`/`descripcion`
// quedan opcionales porque "Colombia me Enamoras" no los necesita (siempre
// es la misma experiencia, solo cambian las fechas) — el frontend público
// usa el título de la experiencia como respaldo cuando faltan.
const showSchema = z.object({
  dia: z.string().trim().min(1, 'programacion[].dia es obligatorio'),
  hora: z.string().trim().min(1, 'programacion[].hora es obligatoria'),
  nombre: z.string().trim().optional(),
  descripcion: z.string().trim().optional(),
  fechaISO,
  // Opcional a nivel de Zod a propósito: un show con foto nueva llega SIN
  // esta clave (se completa más abajo con la URL recién subida, según
  // `fotosIndices`) — la obligatoriedad real (todo show necesita alguna
  // foto, vieja o nueva) se valida aparte, no acá.
  foto: z.string().trim().url('programacion[].foto debe ser una URL válida').optional(),
  // Cupo de ESTE show (pedido del usuario, 2026-09-07) — opcional, null/vacío
  // = sin límite. Cada show de la programación tiene su propio aforo (ej. un
  // show de Salas Colombia canta puede tener menos cupo que otro).
  cupo: z.coerce.number().int('programacion[].cupo debe ser un entero').positive('programacion[].cupo debe ser mayor a 0').nullable().optional(),
});

// El panel solo puede tocar mes/programación. El resto del contenido (título,
// foto de portada, galería de la tarjeta de inicio, descripciones, pills,
// fases...) queda fijo. .strict() rechaza cualquier otro campo que se
// intente mandar, en vez de ignorarlo en silencio.
const updateSchema = z
  .object({
    mes: z.string().trim().optional(),
    // Aforo TOTAL de esta experiencia (pedido del usuario, 2026-09-07) — solo
    // aplica a la reserva "general" sin show específico (`show_seleccionado`
    // null en reservas.js); cuando SÍ hay programación con shows concretos,
    // el cupo real que manda es el de cada show (`programacion[].cupo`).
    cupo_total: nullableNumberFromString(z.coerce.number().int('cupo_total debe ser un entero').positive('cupo_total debe ser mayor a 0')).optional(),
    programacion: jsonArrayField(showSchema).optional(),
    // Índices (dentro de `programacion`) que traen una foto NUEVA en este
    // envío, en el mismo orden que los archivos subidos — ej. `[0, 2]`
    // significa "el primer archivo es la foto de programacion[0], el
    // segundo es la de programacion[2]". Los shows no listados acá ya
    // deben traer su `foto` (una URL existente) en el propio objeto.
    fotosIndices: jsonArrayField(z.number().int().nonnegative()).optional(),
  })
  .strict();

const uploadImagenes = uploadMiddleware.array('fotos', MAX_SHOWS);

function zodError(result) {
  const err = new Error(result.error.issues.map((i) => i.message).join(', '));
  err.status = 400;
  return err;
}

// GET / — listar las 2 experiencias (contenido completo, de solo lectura desde acá)
router.get('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('eventos_fijos')
    .select('*')
    .order('creado_en', { ascending: true });

  if (error) {
    return next(errorGenerico(error, 'GET /api/admin/eventos-fijos'));
  }

  res.json({ ok: true, data });
});

// PATCH /:id — mes/programación (multipart/form-data). Cada show de
// `programacion` necesita una `foto`: o ya la trae (URL existente, sin
// cambios) o su índice aparece en `fotosIndices` con un archivo nuevo en el
// mismo orden. No hay POST ni DELETE a propósito: estas 2 filas no se crean
// ni se borran desde el panel (ver hallazgo en EventosFijos.jsx — la página
// está hardcodeada para exactamente 2).
router.patch('/:id', requireCsrf, uploadImagenes, async (req, res, next) => {
  const { id } = req.params;

  const { data: actual, error: fetchError } = await supabase
    .from('eventos_fijos')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !actual) {
    const err = new Error('Experiencia no encontrada');
    err.status = 404;
    return next(err);
  }

  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return next(zodError(result));
  }

  const archivos = req.files || [];
  const updates = {};
  let fotosViejasHuerfanas = [];

  if (result.data.mes !== undefined) {
    updates.mes = result.data.mes;
  }

  if (result.data.cupo_total !== undefined) {
    updates.cupo_total = result.data.cupo_total;
  }

  if (result.data.programacion !== undefined) {
    const programacion = result.data.programacion;
    const fotosIndices = result.data.fotosIndices || [];

    // ⭐ Hallazgo real (auditoría Fase 6, 2026-09-09): el cupo/disponibilidad
    // de un show (crear_reserva_con_cupo, y el cálculo público de abajo) se
    // busca SOLO por `fechaISO` — 2 shows de la misma experiencia con la
    // misma fecha pero distinta hora (ej. función 3pm y función 8pm el mismo
    // día) colisionarían en el mismo cupo, dejando uno mal bloqueado o el
    // otro vendible de más. Se rechaza acá, en el único lugar donde se
    // puede crear esa combinación, en vez de rediseñar la clave.
    const fechasRepetidas = new Set();
    const fechasVistas = new Set();
    for (const show of programacion) {
      if (fechasVistas.has(show.fechaISO)) fechasRepetidas.add(show.fechaISO);
      fechasVistas.add(show.fechaISO);
    }
    if (fechasRepetidas.size > 0) {
      const err = new Error(`No puede haber 2 funciones con la misma fecha (${[...fechasRepetidas].join(', ')}) — usa fechas distintas para cada función`);
      err.status = 400;
      return next(err);
    }

    if (archivos.length !== fotosIndices.length) {
      const err = new Error(
        `Se esperaban ${fotosIndices.length} foto(s) nueva(s) pero llegaron ${archivos.length}`
      );
      err.status = 400;
      return next(err);
    }

    const indicesConFotoNueva = new Set(fotosIndices);
    const idxSinFoto = programacion.findIndex((show, idx) => !indicesConFotoNueva.has(idx) && !show.foto);
    if (idxSinFoto !== -1) {
      const err = new Error(`programacion[${idxSinFoto}] necesita una foto`);
      err.status = 400;
      return next(err);
    }

    // Validar TODAS las fotos antes de subir ninguna.
    for (const archivo of archivos) {
      await validarImagenReal(archivo.buffer);
    }

    const urlsNuevas = [];
    for (const archivo of archivos) {
      const { url } = await procesarYSubirImagen(archivo.buffer, CARPETA_GALERIA);
      urlsNuevas.push(url);
    }

    fotosIndices.forEach((idxShow, idxArchivo) => {
      programacion[idxShow].foto = urlsNuevas[idxArchivo];
    });

    // Fotos que ya no queda ninguna referencia en la programación nueva
    // (show borrado, o su foto fue reemplazada) — se borran de Storage
    // recién si el guardado sale bien.
    const fotosNuevasSet = new Set(programacion.map((s) => s.foto));
    fotosViejasHuerfanas = (actual.programacion || [])
      .map((s) => s.foto)
      .filter((url) => url && !fotosNuevasSet.has(url));

    updates.programacion = programacion;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('eventos_fijos').update(updates).eq('id', id);

    if (error) {
      // Las fotos recién subidas en este intento quedarían huérfanas si el
      // UPDATE falla — se identifican como las que no estaban ya en la fila
      // actual antes de este PATCH.
      if (updates.programacion) {
        const fotosViejas = new Set((actual.programacion || []).map((s) => s.foto));
        for (const show of updates.programacion) {
          if (show.foto && !fotosViejas.has(show.foto)) await borrarImagenPorUrl(show.foto);
        }
      }
      return next(errorGenerico(error, 'PATCH /api/admin/eventos-fijos/:id'));
    }

    for (const url of fotosViejasHuerfanas) await borrarImagenPorUrl(url);

    await logAudit({
      actor: req.admin,
      accion: 'editar',
      entidad: 'eventos_fijos',
      entidadId: id,
      detalle: { mes: updates.mes, cupoTotal: updates.cupo_total, cantidadShows: updates.programacion?.length },
    });
  }

  const { data } = await supabase.from('eventos_fijos').select('*').eq('id', id).single();
  res.json({ ok: true, data });
});

// POST /:id/pin-puerta — genera (o regenera) el código de acceso de la
// pantalla de puerta (/puerta, Fase 6, 2026-09-08). Mismo criterio que el
// endpoint gemelo de eventos.js.
router.post('/:id/pin-puerta', requireCsrf, async (req, res, next) => {
  const { id } = req.params;
  const resultado = await regenerarPinPuerta({
    tabla: 'eventos_fijos',
    entidad: 'eventos_fijos',
    id,
    actor: req.admin,
    contexto: 'POST /api/admin/eventos-fijos/:id/pin-puerta',
  });
  if (resultado.error) return next(resultado.error);

  res.json({ ok: true, data: { pin: resultado.pin } });
});

// Router público de solo lectura — sin requireAdmin ni requireCsrf, en camelCase.
// Filtra activo:true por consistencia con el resto (aunque hoy el PATCH de admin no
// expone ese campo — ver nota de la corrección hecha antes de construir esto).
export const eventosFijosPublicoRouter = Router();

// ⭐ Cupos (pedido del usuario, 2026-09-07): a diferencia de eventos, acá SÍ
// se conecta a reservas reales siempre (Salas/Enamoras no tienen concepto de
// pago simulado) — se calcula disponibilidad tanto a nivel de la experiencia
// (reservas sin show específico) como por cada show de la programación.
eventosFijosPublicoRouter.get('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('eventos_fijos')
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: true });

  if (error) {
    return next(errorGenerico(error, 'GET /api/eventos-fijos'));
  }

  const ids = data.map((e) => e.id);
  let reservas = [];
  if (ids.length > 0) {
    const { data: reservasData, error: errorReservas } = await supabase
      .from('reservas')
      .select('evento_fijo_id, show_seleccionado, cantidad')
      .in('evento_fijo_id', ids)
      .neq('estado', 'cancelada');
    if (errorReservas) return next(errorGenerico(errorReservas, 'GET /api/eventos-fijos (disponibilidad)'));
    reservas = reservasData;
  }

  const reservadoGeneral = {};
  const reservadoPorShow = {};
  for (const r of reservas) {
    if (r.show_seleccionado?.fecha_iso) {
      const clave = `${r.evento_fijo_id}|${r.show_seleccionado.fecha_iso}`;
      reservadoPorShow[clave] = (reservadoPorShow[clave] || 0) + r.cantidad;
    } else {
      reservadoGeneral[r.evento_fijo_id] = (reservadoGeneral[r.evento_fijo_id] || 0) + r.cantidad;
    }
  }

  // ⭐ `pin_puerta` (Fase 6, 2026-09-08) nunca debe llegar al público — mismo
  // criterio que en eventos.js (ver esa nota para el detalle del riesgo).
  const dataConDisponibilidad = data.map(({ pin_puerta, ...e }) => {
    const programacion = (e.programacion || []).map((s) => {
      if (s.cupo == null) return s;
      const reservado = reservadoPorShow[`${e.id}|${s.fechaISO}`] || 0;
      return { ...s, cupoDisponible: Math.max(0, s.cupo - reservado) };
    });
    const cupoDisponible = e.cupo_total != null ? Math.max(0, e.cupo_total - (reservadoGeneral[e.id] || 0)) : null;
    return { ...e, programacion, cupo_disponible: cupoDisponible };
  });

  res.json({ ok: true, data: toCamelCase(dataConDisponibilidad) });
});

export default router;
