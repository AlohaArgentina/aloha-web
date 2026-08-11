import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { getStoredConsent, acceptConsent, rejectConsent } from "@/lib/consent";

/* Banner de consentimiento de cookies.

   Aparece solo si el visitante todavía no eligió. Mientras tanto la analítica
   (PostHog y GTM) permanece desactivada. Los formularios y Turnstile funcionan
   con normalidad: son necesarios para prestar el servicio y no dependen de esta
   decisión. */

/** Alto real del banner, para que otros elementos fijos (la burbuja de
    WhatsApp) puedan correrse y no quedar tapados. Varía mucho según el ancho
    de pantalla: el texto se envuelve en más líneas en mobile. */
export const COOKIE_BANNER_RESIZE_EVENT = "aloha:cookie-banner-resize";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Se evalúa después del montaje para no bloquear el primer render.
    if (getStoredConsent() === null) setVisible(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!visible || !el) return;

    const reportar = () =>
      window.dispatchEvent(new CustomEvent(COOKIE_BANNER_RESIZE_EVENT, { detail: el.getBoundingClientRect().height }));

    reportar();
    const observer = new ResizeObserver(reportar);
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.dispatchEvent(new CustomEvent(COOKIE_BANNER_RESIZE_EVENT, { detail: 0 }));
    };
  }, [visible]);

  const handleAccept = () => {
    acceptConsent();
    setVisible(false);
  };

  const handleReject = () => {
    rejectConsent();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-live="polite"
          aria-label="Consentimiento de cookies"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xl sm:flex-row sm:items-center sm:gap-6">
              <div className="flex flex-1 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Cookie size={18} />
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Usamos cookies propias y de terceros para analizar el uso del sitio y mejorar tu
                  experiencia. Podés aceptarlas o rechazarlas; el sitio funciona igual en ambos casos.{" "}
                  <Link to="/privacidad" className="text-primary underline underline-offset-2 hover:text-accent transition-colors">
                    Más información
                  </Link>
                  .
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={handleReject}
                  className="flex-1 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:flex-none"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:flex-none"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
