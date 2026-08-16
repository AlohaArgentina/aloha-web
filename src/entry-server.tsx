import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { MotionConfig } from "framer-motion";

import Index from "./pages/Index";
import TrabajaConNosotros from "./pages/TrabajaConNosotros";
import CotizarServicio from "./pages/CotizarServicio";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import EliminacionDatos from "./pages/EliminacionDatos";

/* Punto de entrada usado solo al construir el sitio (ver scripts/prerender.mjs).

   Genera el HTML de cada ruta para que los buscadores, los asistentes de IA y
   los generadores de vistas previas —que no ejecutan JavaScript— reciban la
   página con su contenido y sus metadatos reales.

   Las páginas se importan de forma directa, no con React.lazy: durante el
   renderizado en Node no hay forma de esperar a un import diferido y la ruta
   quedaría vacía. En el navegador, App.tsx las sigue cargando por separado
   para no engordar el paquete inicial.

   Mantener esta lista sincronizada con las rutas de App.tsx; el test de
   entry-server verifica que cada ruta prerenderizada produzca contenido. */

const PAGES: Record<string, () => JSX.Element> = {
  "/": Index,
  "/empleos": TrabajaConNosotros,
  "/request": CotizarServicio,
  "/privacidad": PoliticaPrivacidad,
  "/terminos": TerminosCondiciones,
  "/eliminacion-datos": EliminacionDatos,
};

export function render(url: string): string {
  const Page = PAGES[url];
  if (!Page) throw new Error(`No hay página registrada para la ruta ${url}`);

  return renderToString(
    <MotionConfig reducedMotion="user">
      <StaticRouter location={url}>
        <Page />
      </StaticRouter>
    </MotionConfig>
  );
}

export { SEO_BY_PATH, PRERENDER_PATHS, SITE_URL } from "./lib/seo-data";
export { buildFaqJsonLd } from "./lib/faq-data";
