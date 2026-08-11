import { describe, it, expect, beforeEach, vi } from "vitest";

/* El consentimiento decide si se carga la analítica, así que lo que importa es
   que la decisión se persista, se lea correctamente entre visitas y que nada
   se cargue sin aceptación.

   El módulo guarda estado propio (para no inicializar la analítica dos veces),
   por eso cada test lo importa de nuevo: equivale a una carga de página limpia. */

vi.mock("posthog-js", () => ({ default: { init: vi.fn() } }));

async function cargarModulo() {
  vi.resetModules();
  return import("./consent");
}

beforeEach(() => {
  localStorage.clear();
  document.getElementById("gtm-script")?.remove();
});

describe("consent", () => {
  it("sin decisión previa devuelve null", async () => {
    const { getStoredConsent } = await cargarModulo();
    expect(getStoredConsent()).toBeNull();
  });

  it("recuerda la aceptación entre visitas", async () => {
    const { acceptConsent, getStoredConsent } = await cargarModulo();
    acceptConsent();
    expect(getStoredConsent()).toBe("accepted");
  });

  it("recuerda el rechazo entre visitas", async () => {
    const { rejectConsent, getStoredConsent } = await cargarModulo();
    rejectConsent();
    expect(getStoredConsent()).toBe("rejected");
  });

  it("ignora valores desconocidos guardados en localStorage", async () => {
    localStorage.setItem("aloha-consent", "quizas");
    const { getStoredConsent } = await cargarModulo();
    expect(getStoredConsent()).toBeNull();
  });

  it("no carga GTM al rechazar", async () => {
    const { rejectConsent } = await cargarModulo();
    rejectConsent();
    expect(document.getElementById("gtm-script")).toBeNull();
  });

  it("carga GTM al aceptar", async () => {
    const { acceptConsent } = await cargarModulo();
    acceptConsent();
    expect(document.getElementById("gtm-script")).not.toBeNull();
  });

  it("no carga GTM dos veces si se acepta más de una vez", async () => {
    const { acceptConsent } = await cargarModulo();
    acceptConsent();
    acceptConsent();
    expect(document.querySelectorAll("#gtm-script")).toHaveLength(1);
  });

  it("avisa por evento cuando se acepta o se rechaza", async () => {
    const { acceptConsent, rejectConsent, CONSENT_CHANGED_EVENT } = await cargarModulo();
    const onChange = vi.fn();
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);

    acceptConsent();
    rejectConsent();

    expect(onChange).toHaveBeenCalledTimes(2);
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  });
});
