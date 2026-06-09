import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { eventos } from '../../data/eventos';
import { eventosFijos } from '../../data/eventosFijos';
import './AgendaCalendario.css';

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function parseFecha(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function agruparPorMes(lista) {
  const map = new Map();
  lista.forEach(item => {
    const k = `${item.fecha.getFullYear()}-${item.fecha.getMonth()}`;
    if (!map.has(k)) {
      map.set(k, {
        key: k,
        label: `${MESES[item.fecha.getMonth()]} ${item.fecha.getFullYear()}`,
        items: [],
      });
    }
    map.get(k).items.push(item);
  });
  return [...map.values()];
}

export default function AgendaCalendario() {
  const [abierto, setAbierto] = useState(null);

  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { gruposProximos, gruposPasados } = useMemo(() => {
    const todos = [];

    eventosFijos.forEach(ef => {
      if (!ef.programacion) return;
      ef.programacion.forEach(p => {
        if (!p.fechaISO) return;
        const fecha = parseFecha(p.fechaISO);
        todos.push({
          key: `ef-${p.fechaISO}-${p.nombre}`,
          fecha,
          hora: p.hora,
          nombre: p.nombre,
          tipo: ef.titulo,
          color: ef.color,
          link: `/eventos/${ef.slug}`,
          lugar: ef.lugar,
          img: ef.img,
          descripcion: ef.descripcionCorta,
          esPasado: fecha < hoy,
        });
      });
    });

    eventos.forEach(ev => {
      if (!ev.fechaISO) return;
      const fecha = parseFecha(ev.fechaISO);
      todos.push({
        key: `ev-${ev.id}`,
        fecha,
        hora: ev.hora,
        nombre: ev.titulo,
        tipo: ev.tipo,
        color: ev.color,
        link: `/eventos/${ev.id}`,
        lugar: ev.ciudad ? `${ev.lugar} · ${ev.ciudad}` : ev.lugar,
        img: ev.img,
        descripcion: ev.descripcion,
        esPasado: fecha < hoy,
      });
    });

    todos.sort((a, b) => a.fecha - b.fecha);

    const proximos = todos.filter(i => !i.esPasado);
    const pasados  = todos.filter(i => i.esPasado);

    return {
      gruposProximos: agruparPorMes(proximos),
      gruposPasados:  agruparPorMes(pasados).reverse(),
    };
  }, [hoy]);

  const toggle = (key) => setAbierto(prev => prev === key ? null : key);

  const renderFila = (item) => {
    const estaAbierto = abierto === item.key;
    const dia       = item.fecha.getDate();
    const diaSemana = DIAS[item.fecha.getDay()];

    return (
      <div
        key={item.key}
        className={`agenda-item${item.esPasado ? ' agenda-item--pasado' : ''}`}
      >
        <div
          className={`agenda-fila${estaAbierto ? ' agenda-fila--abierto' : ''}`}
          onClick={() => toggle(item.key)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && toggle(item.key)}
        >
          <div className="agenda-fecha" style={{ borderLeftColor: item.color }}>
            <span className="agenda-dia-num">{String(dia).padStart(2, '0')}</span>
            <span className="agenda-dia-sem">{diaSemana}</span>
          </div>

          <div className="agenda-info">
            <span className="agenda-nombre">{item.nombre}</span>
            <div className="agenda-meta">
              <span
                className="agenda-chip"
                style={{
                  background: `${item.color}18`,
                  color: item.color,
                  borderColor: `${item.color}40`,
                }}
              >
                {item.tipo}
              </span>
              {item.esPasado && (
                <span className="agenda-chip agenda-chip--finalizado">Finalizado</span>
              )}
              {item.lugar && (
                <span className="agenda-lugar">📍 {item.lugar}</span>
              )}
            </div>
          </div>

          <div className="agenda-hora">
            <span className="agenda-hora-texto">{item.hora}</span>
            <span className={`agenda-expand-ico${estaAbierto ? ' agenda-expand-ico--abierto' : ''}`}>
              +
            </span>
          </div>
        </div>

        <div className={`agenda-panel${estaAbierto ? ' agenda-panel--abierto' : ''}`}>
          <div className="agenda-panel-inner">
            {item.img && (
              <img
                src={item.img}
                alt={item.nombre}
                className="agenda-panel-img"
                loading="lazy"
              />
            )}
            <div className="agenda-panel-contenido">
              <p className="agenda-panel-desc">{item.descripcion}</p>
              <Link to={item.link} className="agenda-panel-cta">
                Ver evento →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (gruposProximos.length === 0 && gruposPasados.length === 0) {
    return (
      <div className="agenda-vacio">
        <span className="agenda-vacio-ico">📅</span>
        <p>Próximamente anunciaremos nuevas fechas.</p>
      </div>
    );
  }

  return (
    <div className="agenda-calendario">

      {/* ── Próximos ── */}
      {gruposProximos.map(grupo => (
        <div key={grupo.key} className="agenda-mes">
          <div className="agenda-mes-header">
            <h3 className="agenda-mes-titulo">{grupo.label}</h3>
            <span className="agenda-mes-count">
              {grupo.items.length} {grupo.items.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>
          <div className="agenda-lista">
            {grupo.items.map(renderFila)}
          </div>
        </div>
      ))}

      {/* ── Pasados ── */}
      {gruposPasados.length > 0 && (
        <>
          <div className="agenda-pasados-divider">
            <h3 className="agenda-pasados-titulo">Ediciones anteriores</h3>
          </div>
          {gruposPasados.map(grupo => (
            <div key={grupo.key} className="agenda-mes">
              <div className="agenda-mes-header agenda-mes-header--pasado">
                <h3 className="agenda-mes-titulo">{grupo.label}</h3>
                <span className="agenda-mes-count">
                  {grupo.items.length} {grupo.items.length === 1 ? 'evento' : 'eventos'}
                </span>
              </div>
              <div className="agenda-lista">
                {grupo.items.map(renderFila)}
              </div>
            </div>
          ))}
        </>
      )}

    </div>
  );
}
