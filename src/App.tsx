import { MotionConfig } from "framer-motion";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";
import CookieBanner from "./components/CookieBanner";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";

/* Rutas secundarias en lazy-load: no forman parte del bundle inicial de la
   home, que es la que más importa para el LCP y el SEO. */
const NotFound = lazy(() => import("./pages/NotFound"));
const TrabajaConNosotros = lazy(() => import("./pages/TrabajaConNosotros"));
const CotizarServicio = lazy(() => import("./pages/CotizarServicio"));
const PoliticaPrivacidad = lazy(() => import("./pages/PoliticaPrivacidad"));
const TerminosCondiciones = lazy(() => import("./pages/TerminosCondiciones"));
const EliminacionDatos = lazy(() => import("./pages/EliminacionDatos"));
const AreaClientes = lazy(() => import("./pages/AreaClientes"));

/* Scrollea a la sección del hash (#tecnologia, #contacto, ...) incluso cuando
   se llega desde otra ruta (/empleos, /request). Reintenta unos instantes
   porque el contenido del home se monta de forma asíncrona. */
function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (tries++ < 20) setTimeout(tryScroll, 100);
    };
    tryScroll();
  }, [pathname, hash]);

  return null;
}

const App = () => (
  <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <ScrollToHash />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/empleos" element={<TrabajaConNosotros />} />
          <Route path="/request" element={<CotizarServicio />} />
          <Route path="/privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos" element={<TerminosCondiciones />} />
          <Route path="/eliminacion-datos" element={<EliminacionDatos />} />
          <Route path="/area-clientes" element={<AreaClientes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <WhatsAppFloatingButton />
      <CookieBanner />
    </BrowserRouter>
  </MotionConfig>
);

export default App;
