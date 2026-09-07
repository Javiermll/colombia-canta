import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useScrollAlSeleccionar } from '../../hooks/useScrollAlSeleccionar';
import AdminLayout from '../../components/admin/ui/AdminLayout';
import Card from '../../components/admin/ui/Card';
import Button from '../../components/admin/ui/Button';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { formatearFechaHora } from '../../utils/formato';
import './Contacto.css';

// Bandeja de mensajes recibidos por el formulario público de Contacto (ver
// Inscripciones.jsx). No hay edición de contenido acá: el admin solo puede
// marcar leído/no leído o borrar (spam, duplicados, ya atendidos).
function MensajeDetalle({ mensaje, onCambiado, onBorrado, onAviso, aviso, adminFetch }) {
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false);
  const [borrando, setBorrando] = useState(false);

  async function alternarLeido() {
    setGuardando(true);
    setErrorGeneral('');
    try {
      const data = await adminFetch(`/api/admin/contacto/${mensaje.id}`, {
        method: 'PATCH',
        body: { leido: !mensaje.leido },
      });
      onCambiado(data.data);
      onAviso(data.data.leido ? 'Marcado como leído.' : 'Marcado como no leído.');
    } catch (err) {
      setErrorGeneral(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarBorrado() {
    setBorrando(true);
    try {
      await adminFetch(`/api/admin/contacto/${mensaje.id}`, { method: 'DELETE' });
      onBorrado();
      onAviso('Mensaje borrado.');
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
      <h2 className="contadmin-form-titulo">{mensaje.nombre}</h2>
      <p className="contadmin-form-sub">
        <a href={`mailto:${mensaje.email}`}>{mensaje.email}</a>
        {' · '}
        <a href={`tel:${mensaje.telefono}`}>{mensaje.telefono}</a>
        {' · '}
        {formatearFechaHora(mensaje.creado_en)}
      </p>

      <p className="contadmin-mensaje-cuerpo">{mensaje.mensaje}</p>

      {errorGeneral && <p className="admin-page-error">{errorGeneral}</p>}

      {aviso && (
        <p className="admin-form-aviso" role="status">
          <span aria-hidden="true">✓</span> {aviso}
        </p>
      )}

      <div className="admin-form-acciones">
        <Button type="button" variant="secundario" onClick={alternarLeido} disabled={guardando}>
          {mensaje.leido ? 'Marcar como no leído' : 'Marcar como leído'}
        </Button>
        <Button type="button" variant="peligro" onClick={() => setConfirmandoBorrar(true)} disabled={guardando}>
          Borrar mensaje
        </Button>
      </div>

      <ConfirmDialog
        abierto={confirmandoBorrar}
        titulo="¿Borrar este mensaje?"
        mensaje={`Se va a borrar el mensaje de "${mensaje.nombre}" de forma permanente.`}
        onConfirmar={confirmarBorrado}
        onCancelar={() => setConfirmandoBorrar(false)}
        confirmando={borrando}
      />
    </Card>
  );
}

export default function Contacto() {
  const { adminFetch } = useAdminAuth();
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState(undefined);
  const [aviso, setAviso] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);
  const [hayMas, setHayMas] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const formPanelRef = useScrollAlSeleccionar(seleccionadoId, !cargando);

  const mensajeSeleccionado = mensajes.find((m) => m.id === seleccionadoId) || null;

  const cargar = useCallback((cancelObj) => {
    adminFetch('/api/admin/contacto')
      .then((data) => {
        if (cancelObj?.cancelado) return;
        setMensajes(data.data);
        setHayMas(data.hayMas);
        setErrorCarga('');
      })
      .catch((err) => { if (!cancelObj?.cancelado) setErrorCarga(err.message); })
      .finally(() => { if (!cancelObj?.cancelado) setCargando(false); });
  }, [adminFetch]);

  useEffect(() => {
    const cancelObj = { cancelado: false };
    cargar(cancelObj);
    return () => { cancelObj.cancelado = true; };
  }, [cargar]);

  const cargarMas = useCallback(async () => {
    setCargandoMas(true);
    try {
      const data = await adminFetch(`/api/admin/contacto?offset=${mensajes.length}`);
      setMensajes((prev) => [...prev, ...data.data]);
      setHayMas(data.hayMas);
    } catch (err) {
      setErrorCarga(err.message);
    } finally {
      setCargandoMas(false);
    }
  }, [adminFetch, mensajes.length]);

  const noLeidos = useMemo(() => mensajes.filter((m) => !m.leido).length, [mensajes]);

  const mensajesFiltrados = useMemo(() => {
    const textoBuscado = busqueda.toLowerCase();
    return mensajes.filter((m) => {
      const coincideTexto = m.nombre.toLowerCase().includes(textoBuscado)
        || m.email.toLowerCase().includes(textoBuscado)
        || m.mensaje.toLowerCase().includes(textoBuscado);
      const coincideLeido = !soloNoLeidos || !m.leido;
      return coincideTexto && coincideLeido;
    });
  }, [mensajes, busqueda, soloNoLeidos]);

  function seleccionar(id) {
    setSeleccionadoId(id);
    setAviso('');
  }

  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(() => setAviso(''), 3500);
    return () => clearTimeout(timer);
  }, [aviso]);

  function manejarCambiado(mensajeActualizado) {
    setMensajes((prev) => prev.map((m) => (m.id === mensajeActualizado.id ? mensajeActualizado : m)));
  }

  function manejarBorrado() {
    setMensajes((prev) => prev.filter((m) => m.id !== seleccionadoId));
    setSeleccionadoId(undefined);
  }

  return (
    <AdminLayout>
      <div className="contadmin-panel-header">
        <div>
          <h1 className="admin-page-titulo">Contacto</h1>
          <p className="admin-page-sub">Mensajes recibidos desde el formulario de Contacto del sitio.</p>
        </div>
      </div>

      {cargando && <p>Cargando…</p>}
      {errorCarga && (
        <p className="admin-page-error">
          No se pudo cargar: {errorCarga}{' '}
          <button onClick={() => { setCargando(true); cargar(); }}>Reintentar</button>
        </p>
      )}

      {!cargando && !errorCarga && (
        <div className="contadmin-layout">
          <div className="contadmin-lista-panel">
            <div className="contadmin-filtros">
              <input
                type="text"
                placeholder="🔎 Buscar por nombre, correo o mensaje…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <label className="contadmin-filtro-check">
                <input type="checkbox" checked={soloNoLeidos} onChange={(e) => setSoloNoLeidos(e.target.checked)} />
                Solo no leídos {noLeidos > 0 && `(${noLeidos})`}
              </label>
            </div>

            <p className="contadmin-contador">Mensajes encontrados ({mensajesFiltrados.length})</p>

            {mensajesFiltrados.length === 0 && (
              <p className="contadmin-vacio">
                {mensajes.length === 0 ? 'Todavía no hay mensajes recibidos.' : 'No hay mensajes que coincidan con los filtros.'}
              </p>
            )}

            <div className="contadmin-panel-lista">
              {mensajesFiltrados.map((m) => (
                <button
                  key={m.id}
                  className={`contadmin-item${m.id === seleccionadoId ? ' activo' : ''}${m.leido ? '' : ' no-leido'}`}
                  onClick={() => seleccionar(m.id)}
                >
                  <span className="contadmin-item-titulo">
                    {!m.leido && <span className="contadmin-punto" aria-hidden="true" />}
                    {m.nombre}
                  </span>
                  <span className="contadmin-item-meta">{m.email}</span>
                  <span className="contadmin-item-meta">{formatearFechaHora(m.creado_en)}</span>
                </button>
              ))}
            </div>

            {hayMas && (
              <div className="contadmin-cargar-mas">
                <Button type="button" variant="secundario" onClick={cargarMas} disabled={cargandoMas}>
                  {cargandoMas ? 'Cargando…' : 'Cargar más'}
                </Button>
              </div>
            )}
          </div>

          <div className="contadmin-form-panel" ref={formPanelRef}>
            {mensajeSeleccionado ? (
              <MensajeDetalle
                key={seleccionadoId}
                mensaje={mensajeSeleccionado}
                adminFetch={adminFetch}
                onCambiado={manejarCambiado}
                onBorrado={manejarBorrado}
                onAviso={setAviso}
                aviso={aviso}
              />
            ) : (
              <Card className="contadmin-form-vacio">
                {aviso ? (
                  <p className="admin-form-aviso" role="status">
                    <span aria-hidden="true">✓</span> {aviso}
                  </p>
                ) : (
                  <p>Selecciona un mensaje de la lista para verlo.</p>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
