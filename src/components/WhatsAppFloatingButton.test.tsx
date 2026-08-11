import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";
import { CONSENT_CHANGED_EVENT } from "@/lib/consent";
import { COOKIE_BANNER_RESIZE_EVENT } from "./CookieBanner";

/* La burbuja tiene que: enlazar siempre al número comercial correcto, y
   correrse hacia arriba —según el alto real que reporta el banner de
   cookies, no un valor fijo: en mobile el banner ocupa mucho más— mientras
   no hay una decisión, y volver a su lugar apenas se decide. */

const dispararAltoBanner = (height: number) =>
  window.dispatchEvent(new CustomEvent(COOKIE_BANNER_RESIZE_EVENT, { detail: height }));

const capture = vi.fn();
vi.mock("@posthog/react", () => ({
  usePostHog: () => ({ capture }),
}));

beforeEach(() => {
  capture.mockClear();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("WhatsAppFloatingButton", () => {
  it("enlaza al número comercial con un mensaje predefinido", () => {
    render(<WhatsAppFloatingButton />);

    const link = screen.getByRole("link", { name: /escribinos por whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("https://wa.me/5493512193103?text="));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("registra el click en la analítica", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    render(<WhatsAppFloatingButton />);

    await user.click(screen.getByRole("link", { name: /escribinos por whatsapp/i }));

    expect(capture).toHaveBeenCalledWith("whatsapp_click", { location: "floating_bubble" });
  });

  it("se corre hacia arriba, según el alto real del banner, mientras no hay decisión de cookies", async () => {
    render(<WhatsAppFloatingButton />);
    const link = screen.getByRole("link", { name: /escribinos por whatsapp/i });

    dispararAltoBanner(268); // ancho angosto: el texto se envuelve en más líneas

    await waitFor(() => expect(link).toHaveStyle({ bottom: "284px" })); // 268 + 16px de aire
  });

  it("vuelve a su lugar apenas se decide el consentimiento", async () => {
    render(<WhatsAppFloatingButton />);
    const link = screen.getByRole("link", { name: /escribinos por whatsapp/i });
    dispararAltoBanner(158);
    await waitFor(() => expect(link).toHaveStyle({ bottom: "174px" }));

    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT));

    await waitFor(() => expect(link).toHaveStyle({ bottom: "24px" }));
  });

  it("no se corre si el consentimiento ya estaba decidido", async () => {
    localStorage.setItem("aloha-consent", "accepted");
    render(<WhatsAppFloatingButton />);

    const link = screen.getByRole("link", { name: /escribinos por whatsapp/i });
    await waitFor(() => expect(link).toHaveStyle({ bottom: "24px" }));
  });
});
