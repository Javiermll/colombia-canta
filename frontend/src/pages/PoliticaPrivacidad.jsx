import PaginaLegal from "../components/PaginaLegal/PaginaLegal";
import { politicaPrivacidad } from "../data/legal/politicaPrivacidad";

export default function PoliticaPrivacidad() {
  return <PaginaLegal documento={politicaPrivacidad} ruta="/politica-privacidad" />;
}
