import { Router } from 'express';
import { supabase } from '../config/supabaseClient.js';
import { errorGenerico } from '../lib/errores.js';
import { obtenerActividadDiaria } from '../lib/supabaseManagement.js';

const router = Router();

const BUCKET = 'sitio-imagenes';
const LIMITE_STORAGE_BYTES = 1 * 1024 * 1024 * 1024; // 1GB, plan gratuito
const LIMITE_DB_BYTES = 500 * 1024 * 1024; // 500MB, plan gratuito
const PAGINA = 100;

// Storage de Supabase no da un total agregado por bucket — hay que listar
// cada "carpeta" (nivel plano, ver procesarYSubirImagen en imageUpload.js:
// siempre `${carpeta}/${uuid}.webp`, sin sub-carpetas) y sumar el tamaño real
// de cada archivo. Los objetos que son carpeta vienen con `id: null`.
async function calcularUsoStorage() {
  // ⭐ Hallazgo real (auditoría de cierre de Fase 5, 2026-09-08): este listado
  // raíz no estaba paginado, a diferencia del de cada carpeta más abajo — si
  // el bucket llegara a tener más de `PAGINA` carpetas de primer nivel, las
  // que pasan de esa página se perdían en silencio del total. Con las 6
  // carpetas reales de hoy no se nota, pero es el mismo patrón que sí se usa
  // correctamente más abajo — se unifica acá.
  const carpetas = [];
  let offsetRaiz = 0;
  while (true) {
    const { data: pagina, error: errorRaiz } = await supabase.storage.from(BUCKET).list('', { limit: PAGINA, offset: offsetRaiz });
    if (errorRaiz) throw errorRaiz;
    carpetas.push(...pagina.filter((entrada) => entrada.id === null).map((entrada) => entrada.name));
    if (pagina.length < PAGINA) break;
    offsetRaiz += PAGINA;
  }

  let totalBytes = 0;
  let totalArchivos = 0;

  for (const carpeta of carpetas) {
    let offset = 0;
    while (true) {
      const { data: archivos, error } = await supabase.storage
        .from(BUCKET)
        .list(carpeta, { limit: PAGINA, offset });
      if (error) throw error;

      for (const archivo of archivos) {
        if (archivo.id !== null) {
          totalBytes += archivo.metadata?.size || 0;
          totalArchivos += 1;
        }
      }

      if (archivos.length < PAGINA) break;
      offset += PAGINA;
    }
  }

  return { totalBytes, totalArchivos };
}

// GET / — montado en /api/admin/uso con requireAdmin + requireRole('admin_maestro').
router.get('/', async (req, res, next) => {
  try {
    const [storage, dbSize, actividad] = await Promise.all([
      calcularUsoStorage(),
      supabase.rpc('get_db_size_bytes'),
      obtenerActividadDiaria(),
    ]);

    if (dbSize.error) {
      return next(errorGenerico(dbSize.error, 'GET /api/admin/uso (get_db_size_bytes)'));
    }

    res.json({
      ok: true,
      storage: {
        usadoBytes: storage.totalBytes,
        limiteBytes: LIMITE_STORAGE_BYTES,
        archivos: storage.totalArchivos,
      },
      baseDatos: {
        usadoBytes: Number(dbSize.data),
        limiteBytes: LIMITE_DB_BYTES,
      },
      actividad, // null si el token de Management API no está configurado
    });
  } catch (error) {
    next(errorGenerico(error, 'GET /api/admin/uso'));
  }
});

export default router;
