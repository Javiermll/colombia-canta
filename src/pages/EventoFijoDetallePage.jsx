import { useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BASE_URL, OG_IMAGE } from '../utils/seo';
import { eventosFijos } from '../data/eventosFijos';
import EventoFijoDetalle from '../components/EventoFijoDetalle/EventoFijoDetalle';

export default function EventoFijoDetallePage() {
  const location = useLocation();
  const slug = location.pathname.split('/').pop();
  const evento = eventosFijos.find(e => e.slug === slug);
  if (!evento) return <Navigate to="/404" />;

  const title = `${evento.titulo} | Colombia Canta y Encanta`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={evento.descripcionCorta} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${BASE_URL}/#/eventos/${evento.slug}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={evento.descripcionCorta} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:site_name" content="Colombia Canta y Encanta" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={evento.descripcionCorta} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>
      <EventoFijoDetalle evento={evento} />
    </>
  );
}
