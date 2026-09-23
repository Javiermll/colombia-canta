// API de Management de Supabase (distinta a la de datos/PostgREST) — usa un
// Personal Access Token de la cuenta del usuario, no el service_role key.
// Investigado a fondo (2026-09-07): el permiso "Usage Analytics" solo expone
// CONTEO de peticiones por día (auth/rest/storage/realtime), no bytes de
// egress/storage/BD — ese dato no existe en ningún endpoint público
// documentado de esta API, es exclusivo del dashboard de Supabase.
const MANAGEMENT_API_URL = 'https://api.supabase.com/v1';

// No lanza: si el token no está configurado o falla, el resto del panel de
// uso (Storage/BD, que no dependen de esto) debe seguir funcionando igual.
export async function obtenerActividadDiaria() {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  const ref = process.env.SUPABASE_PROJECT_REF;

  if (!token || !ref) {
    console.warn('obtenerActividadDiaria: SUPABASE_MANAGEMENT_TOKEN/SUPABASE_PROJECT_REF no configurados — actividad omitida.');
    return null;
  }

  try {
    const respuesta = await fetch(
      `${MANAGEMENT_API_URL}/projects/${ref}/analytics/endpoints/usage.api-counts?interval=7day`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!respuesta.ok) {
      console.error('obtenerActividadDiaria: Management API respondió con error -', respuesta.status, await respuesta.text());
      return null;
    }

    const { result } = await respuesta.json();
    return result.map((fila) => ({
      fecha: fila.timestamp.slice(0, 10),
      total: (fila.total_auth_requests || 0)
        + (fila.total_rest_requests || 0)
        + (fila.total_storage_requests || 0)
        + (fila.total_realtime_requests || 0),
    }));
  } catch (error) {
    console.error('obtenerActividadDiaria: fallo de red al llamar a la Management API -', error.message);
    return null;
  }
}
