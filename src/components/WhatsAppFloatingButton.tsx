import { useEffect, useState } from "react";
import { usePostHog } from "@posthog/react";
import { motion } from "framer-motion";
import { getStoredConsent, CONSENT_CHANGED_EVENT } from "@/lib/consent";
import { COOKIE_BANNER_RESIZE_EVENT } from "@/components/CookieBanner";

const WHATSAPP_NUMBER = "5493512193103";
const MENSAJE = "Hola! Quiero más información sobre sus servicios.";
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MENSAJE)}`;

const MARGEN_BASE = 24; // 1.5rem, separación normal del borde
const MARGEN_SOBRE_BANNER = 16; // aire extra entre la burbuja y el banner de cookies

/* Burbuja flotante de WhatsApp, fija abajo a la derecha en todas las páginas.
   Mientras el banner de cookies todavía no tiene una decisión, se corre más
   arriba para no quedar tapada por él, siguiendo su alto real (el texto se
   envuelve distinto según el ancho de pantalla, así que un valor fijo se
   queda corto en mobile) y vuelve a su lugar apenas el visitante decide.

   El estado de consentimiento se lee recién en un efecto (no en el render)
   para que el HTML prerenderizado y el primer render en el cliente
   coincidan: localStorage no existe durante el prerender. */
const WhatsAppFloatingButton = () => {
  const posthog = usePostHog();
  const [consentPendiente, setConsentPendiente] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    setConsentPendiente(getStoredConsent() === null);

    const onConsentChanged = () => setConsentPendiente(false);
    const onBannerResize = (e: Event) => setBannerHeight((e as CustomEvent<number>).detail);

    window.addEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
    window.addEventListener(COOKIE_BANNER_RESIZE_EVENT, onBannerResize);
    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
      window.removeEventListener(COOKIE_BANNER_RESIZE_EVENT, onBannerResize);
    };
  }, []);

  const bottom = consentPendiente && bannerHeight > 0 ? bannerHeight + MARGEN_SOBRE_BANNER : MARGEN_BASE;

  return (
    <motion.a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => posthog.capture("whatsapp_click", { location: "floating_bubble" })}
      aria-label="Escribinos por WhatsApp"
      title="Escribinos por WhatsApp"
      style={{ bottom }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed right-4 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full
        bg-[#25D366] text-white shadow-lg shadow-black/20 hover:bg-[#20bd5a] transition-[background-color,bottom] duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="motion-safe:animate-ping absolute inset-0 inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40" />
      <svg viewBox="0 0 24 24" width={30} height={30} fill="currentColor" className="relative" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.1c-.24.68-1.4 1.33-1.93 1.4-.53.08-1.02.29-3.42-.71-2.9-1.2-4.75-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.37-.44.5-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2 1.11.99 2.05 1.3 2.34 1.45.29.15.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
      </svg>
    </motion.a>
  );
};

export default WhatsAppFloatingButton;
