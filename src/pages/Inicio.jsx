import Hero from '../components/Hero/Hero';
import CarruselEventos from '../components/CarruselEventos/CarruselEventos';
import Historia from '../components/Historia/Historia';
import Escuela from '../components/Escuela/Escuela';
import ContactoSection from '../components/Contacto/Contacto';
import Footer from '../components/Footer/Footer';

export default function Inicio() {
  return (
    <main>
      <Hero />
      <CarruselEventos />
      <Historia />
      <Escuela />
      <ContactoSection />
      <Footer />
    </main>
  );
}
