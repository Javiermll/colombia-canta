import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useListaDinamica } from '../../hooks/useListaDinamica';
import { useScrollAlSeleccionar } from '../../hooks/useScrollAlSeleccionar';
import AdminLayout from '../../components/admin/ui/AdminLayout';
import Card from '../../components/admin/ui/Card';
import FormField from '../../components/admin/ui/FormField';
import Checkbox from '../../components/admin/ui/Checkbox';
import Button from '../../components/admin/ui/Button';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import HelpTooltip from '../../components/admin/ui/HelpTooltip';
import CatalogoSimpleModal from '../../components/admin/ui/CatalogoSimpleModal';
import ImageUploadField from '../../components/admin/ui/ImageUploadField';
import { soloDigitos, formatMiles } from '../../utils/formato';
import './Cursos.css';

function formularioDesdeCurso(curso, ordenSugerido) {
  if (!curso) {
    return {
      nombre: '', tagline: '', color: '#1A56DB', emoji: '', descripcion: '',
      duracion: '', precio: '', precioNumerico: '', matriculaNumerico: '', orden: ordenSugerido,
      esPersonalizado: false, profesorNombre: '', nivelesIds: [], activo: true,
    };
  }
  return {
    nombre: curso.nombre, tagline: curso.tagline || '', color: curso.color || '#1A56DB', emoji: curso.emoji || '', descripcion: curso.descripcion,
    duracion: curso.duracion || '', precio: curso.precio || '', precioNumerico: curso.precio_numerico ?? '', matriculaNumerico: curso.matricula_numerico ?? '', orden: curso.orden ?? 0,
    esPersonalizado: curso.es_personalizado || false, profesorNombre: curso.profesor_nombre || '',
    nivelesIds: (curso.niveles || []).map((n) => n.id), activo: curso.activo,
  };
}

// Formulario en su propio componente, montado con `key` por curso seleccionado
// (mismo criterio ya usado en Hero/Noticias/Eventos/Productos — el estado se
// reinicia solo al cambiar de selección, sin useEffect de sincronización).
function CursoForm({ curso, niveles, ordenSugerido, onGuardado, onBorrado, onAviso, aviso, adminFetch, onAbrirCatalogo }) {
  const [form, setForm] = useState(() => formularioDesdeCurso(curso, ordenSugerido));
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const instrumentos = useListaDinamica(curso?.instrumentos || []);
  const horarios = useListaDinamica(curso?.horarios || []);

  function actualizarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function alternarNivel(id) {
    setForm((f) => ({
      ...f,
      nivelesIds: f.nivelesIds.includes(id) ? f.nivelesIds.filter((x) => x !== id) : [...f.nivelesIds, id],
    }));
  }

  function validar() {
    const nuevosErrores = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!form.descripcion.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria';
    // Obligatoria siempre (no solo al crear) — es el único respaldo visual
    // del curso ahora que se quitó el emoji (pedido del usuario, 2026-09-06):
    // un curso viejo sin foto todavía debe agregarle una antes de guardar
    // cualquier otro cambio, no puede quedar así indefinidamente.
    if (!archivoImagen && !curso?.imagen) nuevosErrores.imagen = 'La imagen es obligatoria';
    if (form.esPersonalizado && !form.profesorNombre.trim()) {
      nuevosErrores.profesorNombre = 'El nombre del profesor es obligatorio en un curso personalizado';
    }

    // Mismo criterio que las zonas/testimonios de Eventos (5.3a): una fila a
    // medio llenar bloquea el guardado en vez de perderse en silencio.
    const horarioErrores = {};
    horarios.items.forEach((h, idx) => {
      const tieneAlgo = h.dia.trim() || h.hora.trim();
      const completo = h.dia.trim() && h.hora.trim();
      if (tieneAlgo && !completo) horarioErrores[idx] = 'Completa día y hora, o borra la fila';
    });
    if (Object.keys(horarioErrores).length > 0) nuevosErrores.horarios = horarioErrores;

    // 2026-08-19 (pedido del usuario): un curso grupal necesita al menos 1
    // franja horaria real — el formulario público de inscripción la ofrece
    // como opción seleccionable, sin datos no hay nada que seleccionar.
    const horariosCompletos = horarios.items.filter((h) => h.dia.trim() && h.hora.trim());
    if (!form.esPersonalizado && horariosCompletos.length === 0 && Object.keys(horarioErrores).length === 0) {
      nuevosErrores.horariosVacio = 'Agrega al menos 1 horario para un curso grupal';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function guardar(e) {
    e.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    setErrorGeneral('');
    try {
      // Multipart/form-data (por la imagen) — todo llega como texto al
      // backend, así que los arrays van serializados a JSON (mismo criterio
      // que Eventos/Productos), y "reemplazo completo" (instrumentos,
      // horarios, niveles) se manda siempre, incluso vacío.
      const fd = new FormData();
      fd.append('nombre', form.nombre);
      fd.append('descripcion', form.descripcion);
      fd.append('orden', String(form.orden));
      fd.append('es_personalizado', String(form.esPersonalizado));
      fd.append('instrumentos', JSON.stringify(instrumentos.items.filter((i) => i.trim())));
      fd.append('horarios', JSON.stringify(
        horarios.items
          .filter((h) => h.dia.trim() && h.hora.trim())
          .map((h) => ({ dia: h.dia, hora: h.hora, edad: h.edad?.trim() || undefined }))
      ));
      fd.append('niveles', JSON.stringify(form.nivelesIds));
      if (form.color) fd.append('color', form.color);
      if (archivoImagen) fd.append('imagen', archivoImagen);

      if (curso) {
        // Editando: se manda siempre (vacío si se quiere borrar) — si solo se
        // manda cuando hay valor, un tagline/duración/precio/emoji ya guardado
        // nunca se puede volver a borrar desde acá (hallazgo real, auditoría
        // 5.5, 2026-08-19 — sigue aplicando con multipart, solo que ahora el
        // "vacío" es un string vacío en vez de `null`).
        fd.append('tagline', form.tagline || '');
        fd.append('emoji', form.emoji || '');
        fd.append('duracion', form.duracion || '');
        fd.append('precio', form.precio || '');
        fd.append('precio_numerico', form.precioNumerico ? String(form.precioNumerico) : '');
        fd.append('matricula_numerico', form.matriculaNumerico ? String(form.matriculaNumerico) : '');
        fd.append('profesor_nombre', form.esPersonalizado ? form.profesorNombre : '');
        fd.append('activo', String(form.activo));
      } else {
        // Creando: no tiene sentido mandar vacío en un insert, solo se manda si hay algo.
        if (form.tagline) fd.append('tagline', form.tagline);
        if (form.emoji) fd.append('emoji', form.emoji);
        if (form.duracion) fd.append('duracion', form.duracion);
        if (form.precio) fd.append('precio', form.precio);
        if (form.precioNumerico) fd.append('precio_numerico', String(form.precioNumerico));
        if (form.matriculaNumerico) fd.append('matricula_numerico', String(form.matriculaNumerico));
        if (form.esPersonalizado) fd.append('profesor_nombre', form.profesorNombre);
      }

      if (curso) {
        const data = await adminFetch(`/api/admin/cursos/${curso.id}`, { method: 'PATCH', body: fd });
        onGuardado(data.data, false);
        onAviso('Cambios guardados.');
      } else {
        const data = await adminFetch('/api/admin/cursos', { method: 'POST', body: fd });
        onGuardado(data.data, true);
        onAviso('Curso creado.');
      }
    } catch (err) {
      setErrorGeneral(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarBorrado() {
    setBorrando(true);
    try {
      await adminFetch(`/api/admin/cursos/${curso.id}`, { method: 'DELETE' });
      onBorrado();
      onAviso('Curso borrado.');
      setConfirmandoBorrar(false);
    } catch (err) {
      setErrorGeneral(err.message);
      setConfirmandoBorrar(false);
    } finally {
      setBorrando(false);
    }
  }

  return (
    <Card>
      <form onSubmit={guardar} noValidate>
        <h2 className="cursos-form-titulo">{curso ? 'Editar curso' : '+ Crear nuevo curso'}</h2>

        {curso && (
          <div className="admin-form-top">
            <Checkbox
              label="Curso visible en el sitio (activo)"
              checked={form.activo}
              onChange={(e) => actualizarCampo('activo', e.target.checked)}
            />
          </div>
        )}

        {/* ── Datos básicos ── */}
        <h3 className="cursos-seccion-titulo">Datos básicos</h3>
        <FormField label="Nombre" error={errores.nombre}>
          <input type="text" value={form.nombre} onChange={(e) => actualizarCampo('nombre', e.target.value)} className={errores.nombre ? 'invalido' : ''} />
        </FormField>
        <div className="admin-field-fila">
          <FormField label="Tagline" hint="opcional — frase corta bajo el nombre">
            <input type="text" value={form.tagline} onChange={(e) => actualizarCampo('tagline', e.target.value)} />
          </FormField>
          <FormField label="Color" hint="acento del curso">
            <input type="color" value={form.color} onChange={(e) => actualizarCampo('color', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Descripción" error={errores.descripcion} hint="usa un párrafo en blanco para separar en varios bloques">
          <textarea value={form.descripcion} onChange={(e) => actualizarCampo('descripcion', e.target.value)} className={errores.descripcion ? 'invalido' : ''} style={{ minHeight: 100 }} />
        </FormField>

        {/* Único respaldo visual del curso ahora que se quitó el ícono de
           emoji (pedido del usuario, 2026-09-06) — por eso pasa a ser
           obligatoria siempre, no solo al crear (ver validar() más abajo). */}
        <ImageUploadField
          label="Foto del curso"
          recomendado="1200×900px (4:3, se usa como portada de la tarjeta y del detalle)"
          aspecto={4 / 3}
          valorActual={curso?.imagen}
          archivo={archivoImagen}
          onChange={setArchivoImagen}
          error={errores.imagen}
          requerido
        />

        <div className="cursos-lista-simple">
          <p className="admin-field-label-texto">
            Instrumentos / modalidades (opcional)
            <HelpTooltip texto="Se muestran como etiquetas en la tarjeta del curso." ejemplo="Guitarra, Piano, Canto" />
          </p>
          {instrumentos.items.map((valor, idx) => (
            <div className="cursos-lista-simple-fila" key={idx}>
              <input type="text" placeholder="Ej. Guitarra" value={valor} onChange={(e) => instrumentos.actualizarSimple(idx, e.target.value)} />
              <button type="button" className="admin-fila-quitar" onClick={() => instrumentos.quitar(idx)} aria-label="Quitar">×</button>
            </div>
          ))}
          <Button type="button" variant="secundario" onClick={() => instrumentos.agregar('')}>+ Agregar</Button>
        </div>

        {/* ── Modalidad ── */}
        <h3 className="cursos-seccion-titulo">Modalidad</h3>
        <div className="admin-form-top">
          <Checkbox
            label="Es un curso personalizado (con profesor)"
            checked={form.esPersonalizado}
            onChange={(e) => actualizarCampo('esPersonalizado', e.target.checked)}
          />
          <HelpTooltip texto='Para clases 1 a 1 con un profesor puntual (ej. "Pedro, clases personalizadas de guitarra"), en vez de un curso grupal con cupos abiertos.' />
        </div>
        {form.esPersonalizado && (
          <FormField label="Nombre del profesor" error={errores.profesorNombre}>
            <input
              type="text"
              maxLength={80}
              value={form.profesorNombre}
              onChange={(e) => actualizarCampo('profesorNombre', e.target.value)}
              className={errores.profesorNombre ? 'invalido' : ''}
              placeholder="Ej. Pedro Ramírez"
            />
          </FormField>
        )}

        <div className="cursos-lista-simple">
          <p className="admin-field-label-texto">
            {form.esPersonalizado ? 'Horario (opcional)' : 'Horarios disponibles'}
            {errores.horariosVacio && <span className="admin-field-error" role="alert"> — {errores.horariosVacio}</span>}
            <HelpTooltip
              texto={form.esPersonalizado
                ? 'El horario fijo del profesor, o déjalo vacío si se coordina directo con el estudiante.'
                : 'Los bloques de horario en los que se dicta este curso — el estudiante elige uno de estos al inscribirse, así que hace falta al menos 1. La edad es opcional, para cuando el mismo curso ofrece horarios distintos según la edad.'}
              ejemplo={form.esPersonalizado ? 'Martes · 4:00 PM' : '6 a 8 años · Sábados · 9:00 AM'}
            />
          </p>
          {horarios.items.map((h, idx) => (
            <div key={idx}>
              <div className="cursos-horario-fila">
                <input
                  type="text"
                  placeholder="Edad (opcional)"
                  aria-label="Edad"
                  maxLength={40}
                  value={h.edad || ''}
                  onChange={(e) => horarios.actualizar(idx, 'edad', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Día"
                  aria-label="Día"
                  aria-invalid={!!errores.horarios?.[idx]}
                  value={h.dia}
                  onChange={(e) => horarios.actualizar(idx, 'dia', e.target.value)}
                  className={errores.horarios?.[idx] ? 'invalido' : ''}
                />
                <input
                  type="time"
                  aria-label="Hora"
                  aria-invalid={!!errores.horarios?.[idx]}
                  value={h.hora}
                  onChange={(e) => horarios.actualizar(idx, 'hora', e.target.value)}
                  className={errores.horarios?.[idx] ? 'invalido' : ''}
                />
                <button type="button" className="admin-fila-quitar" onClick={() => horarios.quitar(idx)} aria-label="Quitar horario">×</button>
              </div>
              {errores.horarios?.[idx] && <span className="admin-field-error" role="alert">{errores.horarios[idx]}</span>}
            </div>
          ))}
          <Button type="button" variant="secundario" onClick={() => horarios.agregar({ dia: '', hora: '', edad: '' })}>+ Agregar</Button>
        </div>

        {/* ── Niveles ── */}
        <h3 className="cursos-seccion-titulo">Niveles</h3>
        <div className="cursos-niveles-selector" role="group" aria-label="Niveles del curso">
          {niveles.length === 0 && (
            <p className="cursos-niveles-vacio">Todavía no hay niveles — usa el botón &quot;+ Nivel&quot; arriba.</p>
          )}
          {niveles.map((n) => (
            <label key={n.id} className="cursos-nivel-chip">
              <input type="checkbox" checked={form.nivelesIds.includes(n.id)} onChange={() => alternarNivel(n.id)} />
              {n.nombre}
            </label>
          ))}
        </div>
        <Button type="button" variant="secundario" onClick={() => onAbrirCatalogo('niveles')}>+ Nivel</Button>

        {/* ── Duración y precio ── */}
        <h3 className="cursos-seccion-titulo">Duración y precio</h3>
        <div className="admin-field-fila">
          <FormField label="Duración" hint='opcional, ej. "6 meses" — usada para generar las cuotas de pago'>
            <input type="text" placeholder="Ej. 6 meses" value={form.duracion} onChange={(e) => actualizarCampo('duracion', e.target.value)} />
          </FormField>
          <FormField label="Precio (texto)" hint='opcional, ej. "Desde $450.000/mes"'>
            <input type="text" value={form.precio} onChange={(e) => actualizarCampo('precio', e.target.value)} />
          </FormField>
        </div>
        <div className="admin-field-fila">
          <FormField label="Precio numérico" hint="opcional — el valor real por mes, usado para autocompletar las cuotas de cada inscripción">
            <input
              type="text"
              inputMode="numeric"
              value={formatMiles(form.precioNumerico)}
              onChange={(e) => actualizarCampo('precioNumerico', soloDigitos(e.target.value))}
            />
          </FormField>
          <FormField label="Matrícula" hint="opcional — cobro anual aparte del precio del semestre">
            <input
              type="text"
              inputMode="numeric"
              value={formatMiles(form.matriculaNumerico)}
              onChange={(e) => actualizarCampo('matriculaNumerico', soloDigitos(e.target.value))}
            />
          </FormField>
        </div>

        {errorGeneral && <p className="admin-page-error">{errorGeneral}</p>}

        {aviso && (
          <p className="admin-form-aviso" role="status">
            <span aria-hidden="true">✓</span> {aviso}
          </p>
        )}

        <div className="admin-form-acciones">
          <Button type="submit" className="admin-btn-ancho" disabled={guardando}>
            {guardando ? 'Guardando…' : curso ? 'Guardar cambios' : 'Crear curso'}
          </Button>
          {curso && (
            <Button type="button" variant="peligro" onClick={() => setConfirmandoBorrar(true)} disabled={guardando}>
              Borrar curso
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        abierto={confirmandoBorrar}
        titulo="¿Borrar este curso?"
        advertencia="Si hay inscripciones registradas para este curso, el borrado se va a rechazar."
        mensaje={`Se va a borrar "${curso?.nombre}" del sitio. Esta acción no se puede deshacer.`}
        onConfirmar={confirmarBorrado}
        onCancelar={() => setConfirmandoBorrar(false)}
        confirmando={borrando}
      />
    </Card>
  );
}

export default function Cursos() {
  const { adminFetch } = useAdminAuth();
  const [cursos, setCursos] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState(undefined); // undefined = ninguno, null = "nuevo"
  const [aviso, setAviso] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('todos');
  const [catalogoAbierto, setCatalogoAbierto] = useState(null); // 'niveles' | null
  const formPanelRef = useScrollAlSeleccionar(seleccionadoId, !cargando);

  const cursoSeleccionado = cursos.find((c) => c.id === seleccionadoId) || null;

  // 2026-08-19 (pedido del usuario): el orden ya no lo escribe el admin a
  // mano — un curso nuevo se agrega siempre al final de la lista actual.
  const ordenSugerido = useMemo(() => cursos.reduce((max, c) => Math.max(max, c.orden ?? 0), -1) + 1, [cursos]);

  const cargarTodo = useCallback((cancelObj) => {
    Promise.all([
      adminFetch('/api/admin/cursos'),
      adminFetch('/api/admin/niveles'),
    ])
      .then(([cur, niv]) => {
        if (cancelObj?.cancelado) return;
        setCursos(cur.data);
        setNiveles(niv.data);
        setErrorCarga('');
      })
      .catch((err) => { if (!cancelObj?.cancelado) setErrorCarga(err.message); })
      .finally(() => { if (!cancelObj?.cancelado) setCargando(false); });
  }, [adminFetch]);

  useEffect(() => {
    const cancelObj = { cancelado: false };
    cargarTodo(cancelObj);
    return () => { cancelObj.cancelado = true; };
  }, [cargarTodo]);

  const cursosFiltrados = useMemo(() => {
    return cursos.filter((c) => {
      const coincideTexto = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideModalidad = filtroModalidad === 'todos'
        || (filtroModalidad === 'personalizado' ? c.es_personalizado : !c.es_personalizado);
      return coincideTexto && coincideModalidad;
    });
  }, [cursos, busqueda, filtroModalidad]);

  function seleccionar(id) {
    setSeleccionadoId(id);
    setAviso('');
  }

  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(() => setAviso(''), 3500);
    return () => clearTimeout(timer);
  }, [aviso]);

  function manejarGuardado(cursoGuardado, esNuevo) {
    setCursos((prev) => (esNuevo ? [cursoGuardado, ...prev] : prev.map((c) => (c.id === cursoGuardado.id ? cursoGuardado : c))));
    if (esNuevo) setSeleccionadoId(cursoGuardado.id);
  }

  function manejarBorrado() {
    setCursos((prev) => prev.filter((c) => c.id !== seleccionadoId));
    setSeleccionadoId(undefined);
  }

  return (
    <AdminLayout>
      <div className="cursos-panel-header">
        <div className="cursos-panel-header-textos">
          <h1 className="admin-page-titulo">Gestión de Cursos</h1>
          <p className="admin-page-sub">Crea, edita y filtra los cursos de la escuela de música.</p>
        </div>
        <div className="cursos-panel-header-acciones">
          <Button variant="secundario" onClick={() => setCatalogoAbierto('niveles')}>+ Nivel</Button>
          <Button onClick={() => seleccionar(null)}>+ Nuevo curso</Button>
        </div>
      </div>

      {cargando && <p>Cargando…</p>}
      {errorCarga && (
        <p className="admin-page-error">
          No se pudo cargar: {errorCarga}{' '}
          <button onClick={() => { setCargando(true); cargarTodo(); }}>Reintentar</button>
        </p>
      )}

      {!cargando && !errorCarga && (
        <div className="cursos-layout">
          <div className="cursos-lista-panel">
            <div className="cursos-filtros">
              <input
                type="text"
                placeholder="🔎 Buscar por nombre…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <select value={filtroModalidad} onChange={(e) => setFiltroModalidad(e.target.value)}>
                <option value="todos">Todas las modalidades</option>
                <option value="grupal">Grupales</option>
                <option value="personalizado">Personalizados</option>
              </select>
            </div>

            <p className="cursos-contador">Cursos encontrados ({cursosFiltrados.length})</p>

            {cursosFiltrados.length === 0 && (
              <p className="cursos-vacio">
                {cursos.length === 0 ? 'Todavía no hay cursos cargados.' : 'No hay cursos que coincidan con los filtros.'}
              </p>
            )}

            <div className="cursos-panel-lista">
              {cursosFiltrados.map((c) => (
                <button
                  key={c.id}
                  className={`cursos-item${c.id === seleccionadoId ? ' activo' : ''}${!c.activo ? ' inactivo' : ''}`}
                  onClick={() => seleccionar(c.id)}
                >
                  <span className="cursos-item-titulo">
                    {c.emoji && <span aria-hidden="true">{c.emoji}</span>}
                    {c.nombre}
                    {c.es_personalizado && <span className="cursos-item-personalizado" title="Curso personalizado">👤</span>}
                  </span>
                  <span className="cursos-item-meta">
                    {c.es_personalizado ? (c.profesor_nombre || 'Sin profesor asignado') : `${(c.niveles || []).length} nivel(es)`}
                    {!c.activo && <span className="admin-inactivo-tag"> (oculto)</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="cursos-form-panel" ref={formPanelRef}>
            {seleccionadoId !== undefined && (
              <CursoForm
                key={seleccionadoId ?? 'nuevo'}
                curso={cursoSeleccionado}
                niveles={niveles}
                ordenSugerido={ordenSugerido}
                adminFetch={adminFetch}
                onGuardado={manejarGuardado}
                onBorrado={manejarBorrado}
                onAviso={setAviso}
                aviso={aviso}
                onAbrirCatalogo={setCatalogoAbierto}
              />
            )}
            {seleccionadoId === undefined && (
              <Card className="cursos-form-vacio">
                {aviso ? (
                  <p className="admin-form-aviso" role="status">
                    <span aria-hidden="true">✓</span> {aviso}
                  </p>
                ) : (
                  <p>Selecciona un curso de la lista para editarlo, o crea uno nuevo.</p>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {catalogoAbierto === 'niveles' && (
        <CatalogoSimpleModal
          titulo="Niveles"
          descripcion="Los niveles de habilidad de los cursos de música (ej. Principiante, Intermedio, Avanzado) — cada estudiante recibe el suyo cuando el admin lo evalúa, en la pantalla de Inscripciones."
          endpoint="/api/admin/niveles"
          etiqueta="nivel"
          conActivo={false}
          adminFetch={adminFetch}
          onCerrar={(lista) => { setNiveles(lista); setCatalogoAbierto(null); }}
        />
      )}
    </AdminLayout>
  );
}
