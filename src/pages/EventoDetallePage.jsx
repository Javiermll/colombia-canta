import { useParams, Navigate } from 'react-router-dom';
import { eventos } from '../data/eventos';
import EventoDetalle from '../components/EventoDetalle/EventoDetalle';

export default function EventoDetallePage() {
  const { id } = useParams();
  const evento = eventos.find(e => e.id === parseInt(id));
  if (!evento) return <Navigate to="/404" />;
  return <EventoDetalle evento={evento} />;
}
