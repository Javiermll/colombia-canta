import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { formatearBytes } from '../../../utils/formato';
import Card from './Card';
import './PanelUso.css';

function BarraUso({ etiqueta, usadoBytes, limiteBytes }) {
  const porcentaje = Math.min(100, (usadoBytes / limiteBytes) * 100);
  // Umbrales arbitrarios pero razonables para un aviso temprano — el punto
  // de este panel es justamente ver venir el límite antes de chocar con él.
  const nivel = porcentaje >= 90 ? 'critico' : porcentaje >= 70 ? 'alerta' : 'ok';

  return (
    <div className="panel-uso-item">
      <div className="panel-uso-item-encabezado">
        <span className="panel-uso-item-label">{etiqueta}</span>
        <span className="panel-uso-item-valor">
          {formatearBytes(usadoBytes)} <span className="panel-uso-item-limite">/ {formatearBytes(limiteBytes)}</span>
        </span>
      </div>
      <div className="panel-uso-barra-fondo">
        <div
          className={`panel-uso-barra-relleno panel-uso-barra-relleno--${nivel}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <span className="panel-uso-item-porcentaje">{porcentaje.toFixed(1)}% usado</span>
    </div>
  );
}

function GraficoActividad({ dias }) {
  const max = Math.max(1, ...dias.map((d) => d.total));

  return (
    <div className="panel-uso-actividad">
      <span className="panel-uso-item-label">Actividad (peticiones/día, últimos 7 días)</span>
      <div className="panel-uso-actividad-barras">
        {dias.map((d) => {
          // ⭐ Hallazgo real (auditoría de cierre de Fase 5, 2026-09-08): el
          // `title` nativo solo se ve con mouse encima — un lector de
          // pantalla no lo anuncia de forma confiable, y sin `tabIndex` un
          // usuario de teclado ni siquiera puede llegar a esta barra. Se
          // agrega `aria-label` (sí se anuncia) + `tabIndex=0`, sin sacar el
          // `title` (sigue sirviendo el tooltip visual con mouse).
          const etiqueta = `${new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}: ${d.total} peticiones`;
          return (
            <div
              key={d.fecha}
              className="panel-uso-actividad-barra"
              style={{ height: `${Math.max(4, (d.total / max) * 100)}%` }}
              title={etiqueta}
              role="img"
              aria-label={etiqueta}
              tabIndex={0}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PanelUso() {
  const { adminFetch } = useAdminAuth();
  const [uso, setUso] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    adminFetch('/api/admin/uso')
      .then((data) => { if (!cancelado) setUso(data); })
      .catch((err) => { if (!cancelado) setError(err.message); });
    return () => { cancelado = true; };
  }, [adminFetch]);

  if (error) return null; // no bloquea el resto de Administradores por esto
  if (!uso) return null;

  return (
    <Card className="panel-uso">
      <h3 className="adminsadmin-seccion-titulo">Uso de Supabase</h3>
      <div className="panel-uso-grid">
        <BarraUso etiqueta="Storage (archivos)" usadoBytes={uso.storage.usadoBytes} limiteBytes={uso.storage.limiteBytes} />
        <BarraUso etiqueta="Base de datos" usadoBytes={uso.baseDatos.usadoBytes} limiteBytes={uso.baseDatos.limiteBytes} />
      </div>
      {uso.actividad && <GraficoActividad dias={uso.actividad} />}
    </Card>
  );
}
