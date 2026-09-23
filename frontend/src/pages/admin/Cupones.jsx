import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from '../../components/admin/ui/AdminLayout';
import Card from '../../components/admin/ui/Card';
import FormField from '../../components/admin/ui/FormField';
import Button from '../../components/admin/ui/Button';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { formatearFechaHora } from '../../utils/formato';
import './Cupones.css';

// ⭐ Cupones de descuento para la Tienda (pedido del usuario, 2026-09-10) —
// alcance ya acordado: el % aplica siempre a TODO el pedido (no a productos
// específicos), y cada cupón tiene un límite de usos obligatorio (sin opción
// de "ilimitado"). Mismo patrón visual que Administradores.jsx (la pantalla
// más parecida ya existente en el panel: lista simple + crear + acciones
// inline, sin vista de detalle aparte).
export default function Cupones() {
  const { adminFetch } = useAdminAuth();

  const [cupones, setCupones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [aviso, setAviso] = useState('');

  const [form, setForm] = useState({ codigo: '', porcentaje: '', usosMaximos: '' });
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState('');

  const [confirmandoAccion, setConfirmandoAccion] = useState(null); // { tipo: 'activar'|'desactivar'|'borrar', fila } | null
  const [procesando, setProcesando] = useState(false);
  const [errorFila, setErrorFila] = useState('');

  const cargar = useCallback((cancelObj) => {
    adminFetch('/api/admin/cupones')
      .then((data) => {
        if (cancelObj?.cancelado) return;
        setCupones(data.data);
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

  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(() => setAviso(''), 3500);
    return () => clearTimeout(timer);
  }, [aviso]);

  async function crear(e) {
    e.preventDefault();
    setErrorCrear('');

    if (!form.codigo.trim() || !form.porcentaje || !form.usosMaximos) {
      setErrorCrear('Completa el código, el porcentaje y el límite de usos.');
      return;
    }

    setCreando(true);
    try {
      const data = await adminFetch('/api/admin/cupones', {
        method: 'POST',
        body: {
          codigo: form.codigo.trim(),
          porcentaje: Number(form.porcentaje),
          usos_maximos: Number(form.usosMaximos),
        },
      });
      setCupones((prev) => [data.data, ...prev]);
      setForm({ codigo: '', porcentaje: '', usosMaximos: '' });
      setAviso(`Cupón ${data.data.codigo} creado.`);
    } catch (err) {
      setErrorCrear(err.message);
    } finally {
      setCreando(false);
    }
  }

  function pedirConfirmacion(tipo, fila) {
    setErrorFila('');
    setConfirmandoAccion({ tipo, fila });
  }

  async function confirmarAccion() {
    const { tipo, fila } = confirmandoAccion;
    setProcesando(true);
    try {
      if (tipo === 'borrar') {
        await adminFetch(`/api/admin/cupones/${fila.id}`, { method: 'DELETE' });
        setCupones((prev) => prev.filter((c) => c.id !== fila.id));
        setAviso(`El cupón ${fila.codigo} fue borrado.`);
      } else {
        const activo = tipo === 'activar';
        const data = await adminFetch(`/api/admin/cupones/${fila.id}`, { method: 'PATCH', body: { activo } });
        setCupones((prev) => prev.map((c) => (c.id === fila.id ? data.data : c)));
        setAviso(activo ? `${fila.codigo} fue reactivado.` : `${fila.codigo} fue desactivado.`);
      }
      setConfirmandoAccion(null);
    } catch (err) {
      setErrorFila(err.message);
      setConfirmandoAccion(null);
    } finally {
      setProcesando(false);
    }
  }

  const TITULOS_CONFIRMACION = {
    desactivar: (f) => `¿Desactivar el cupón ${f.codigo}?`,
    activar: (f) => `¿Reactivar el cupón ${f.codigo}?`,
    borrar: (f) => `¿Borrar el cupón ${f.codigo}?`,
  };
  const MENSAJES_CONFIRMACION = {
    desactivar: () => 'Deja de funcionar de inmediato — nadie va a poder aplicarlo en el carrito hasta que lo reactives.',
    activar: (f) => `${f.codigo} vuelve a funcionar en el carrito (mientras no haya llegado a su límite de ${f.usos_maximos} usos).`,
    borrar: () => 'Esta acción no se puede deshacer. Los pedidos que ya usaron este cupón conservan su descuento — solo deja de existir el cupón en sí, no afecta compras pasadas.',
  };
  const TEXTOS_BOTON_CONFIRMAR = {
    desactivar: { confirmar: 'Sí, desactivar', confirmando: 'Desactivando…' },
    activar: { confirmar: 'Sí, reactivar', confirmando: 'Reactivando…' },
    borrar: { confirmar: 'Sí, borrar', confirmando: 'Borrando…' },
  };

  return (
    <AdminLayout>
      <h1 className="admin-page-titulo">Cupones de descuento</h1>
      <div className="admin-page-franja" aria-hidden="true" />
      <p className="admin-page-sub">Crea códigos de descuento para la Tienda — el % se aplica al total del pedido cuando el comprador lo ingresa en el carrito.</p>

      <Card className="cupones-crear">
        <h3 className="cupones-seccion-titulo">Crear cupón nuevo</h3>
        <form onSubmit={crear} className="cupones-crear-form">
          <FormField label="Código" className="cupones-campo-codigo">
            <input
              type="text"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
              placeholder="VERANO20"
              maxLength={30}
            />
          </FormField>
          <FormField label="% de descuento">
            <input
              type="number"
              min={1}
              max={100}
              value={form.porcentaje}
              onChange={(e) => setForm((f) => ({ ...f, porcentaje: e.target.value }))}
              placeholder="20"
            />
          </FormField>
          <FormField label="Límite de usos" ayuda="Cuántas veces se puede usar este código en total, sumando todos los compradores — al llegar al límite deja de funcionar solo.">
            <input
              type="number"
              min={1}
              value={form.usosMaximos}
              onChange={(e) => setForm((f) => ({ ...f, usosMaximos: e.target.value }))}
              placeholder="50"
            />
          </FormField>
          <Button type="submit" disabled={creando}>{creando ? 'Creando…' : 'Crear cupón'}</Button>
        </form>
        {errorCrear && <p className="admin-page-error" role="alert">{errorCrear}</p>}
      </Card>

      {aviso && (
        <p className="admin-form-aviso" role="status">
          <span aria-hidden="true">✓</span> {aviso}
        </p>
      )}
      {errorFila && <p className="admin-page-error" role="alert">{errorFila}</p>}

      {cargando && <p>Cargando…</p>}
      {errorCarga && (
        <p className="admin-page-error">
          No se pudo cargar: {errorCarga}{' '}
          <button onClick={() => { setCargando(true); cargar(); }}>Reintentar</button>
        </p>
      )}

      {!cargando && !errorCarga && (
        cupones.length === 0 ? (
          <p className="cupones-vacio">Todavía no hay ningún cupón creado.</p>
        ) : (
          <div className="cupones-lista">
            {cupones.map((c) => (
              <div className="cupones-fila" key={c.id}>
                <div className="cupones-fila-info">
                  <span className="cupones-codigo">{c.codigo}</span>
                  <span className="cupones-meta">
                    {c.porcentaje}% de descuento · {c.usos_actuales} de {c.usos_maximos} usos
                    {' · '}
                    <span className={c.activo ? 'cupones-activo' : 'cupones-inactivo'}>{c.activo ? 'Activo' : 'Desactivado'}</span>
                    {' · creado '}{formatearFechaHora(c.creado_en)}
                  </span>
                </div>
                <div className="cupones-fila-acciones">
                  {c.activo ? (
                    <Button type="button" variant="peligro" onClick={() => pedirConfirmacion('desactivar', c)}>Desactivar</Button>
                  ) : (
                    <>
                      <Button type="button" variant="secundario" onClick={() => pedirConfirmacion('activar', c)}>Reactivar</Button>
                      <Button type="button" variant="peligro" onClick={() => pedirConfirmacion('borrar', c)}>Borrar</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {confirmandoAccion && (
        <ConfirmDialog
          abierto={!!confirmandoAccion}
          titulo={TITULOS_CONFIRMACION[confirmandoAccion.tipo](confirmandoAccion.fila)}
          mensaje={MENSAJES_CONFIRMACION[confirmandoAccion.tipo](confirmandoAccion.fila)}
          textoConfirmar={TEXTOS_BOTON_CONFIRMAR[confirmandoAccion.tipo].confirmar}
          textoConfirmando={TEXTOS_BOTON_CONFIRMAR[confirmandoAccion.tipo].confirmando}
          onConfirmar={confirmarAccion}
          onCancelar={() => setConfirmandoAccion(null)}
          confirmando={procesando}
        />
      )}
    </AdminLayout>
  );
}
