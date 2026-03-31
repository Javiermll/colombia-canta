import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Inicio from './pages/Inicio';
import Nosotros from './pages/Nosotros';
import Eventos from './pages/Eventos';
import EventoDetallePage from './pages/EventoDetallePage';
import Tienda from './pages/Tienda';
import Inscripciones from './pages/Inscripciones';
import Contacto from './pages/Contacto';
import NotFound from './pages/NotFound';
import './styles/main.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/eventos/:id" element={<EventoDetallePage />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/inscripciones" element={<Inscripciones />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
