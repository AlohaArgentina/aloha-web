/* Gestión del consentimiento de cookies / analítica.

   El sitio carga PostHog y Google Tag Manager solo si el visitante acepta.
   Hasta entonces PostHog arranca en modo "opt-out" (no escribe cookies ni
   envía eventos) y GTM directamente no se inyecta.

   La decisión se guarda en localStorage para no volver a preguntar. */

import posthog from "posthog-js";

const STORAGE_KEY = "aloha-consent";
const GTM_ID = "GTM-5TDQL9T6";

export type ConsentValue = "accepted" | "rejected";

export function getStoredConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    // Modo privado o storage bloqueado: se trata como "sin decisión".
    return null;
  }
}

/* Evento propio para que otros componentes fijos en pantalla (p. ej. la
   burbuja de WhatsApp) sepan cuándo el banner de cookies deja de estar
   visible y puedan reacomodarse, sin acoplarse al estado interno de
   CookieBanner. */
export const CONSENT_CHANGED_EVENT = "aloha:consent-changed";

function storeConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Sin storage no podemos recordar la decisión; se respeta igual en la sesión.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT));
}

/* Inyecta GTM una sola vez. Se llama únicamente tras el consentimiento. */
let gtmLoaded = false;
function loadGTM() {
  if (gtmLoaded || document.getElementById("gtm-script")) return;
  gtmLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

/* Habilita la analítica: inicializa PostHog y carga GTM.

   PostHog se inicializa acá y no antes: `posthog.init()` contacta a los
   servidores (config, flags) y escribe una cookie apenas se ejecuta, incluso
   con la captura desactivada. Difiriéndolo hasta el consentimiento, el
   visitante que no acepta no genera ninguna petición ni cookie de analítica. */
let analyticsStarted = false;
export function enableAnalytics() {
  if (analyticsStarted) return;
  analyticsStarted = true;

  const token = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (token) {
    posthog.init(token, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      defaults: "2026-01-30",
    });
  }
  loadGTM();
}

export function acceptConsent() {
  storeConsent("accepted");
  enableAnalytics();
}

export function rejectConsent() {
  storeConsent("rejected");
  // No hay nada que desactivar: sin consentimiento la analítica nunca se inició.
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
