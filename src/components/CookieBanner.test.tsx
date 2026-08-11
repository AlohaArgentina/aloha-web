import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CookieBanner, { COOKIE_BANNER_RESIZE_EVENT } from "./CookieBanner";

function renderBanner() {
  return render(
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>
  );
}

/* Mientras el banner está visible, tiene que avisar su alto (para que la
   burbuja de WhatsApp no quede tapada) y dejar de avisarlo apenas se cierra. */

vi.mock("posthog-js", () => ({ default: { init: vi.fn() } }));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("CookieBanner", () => {
  it("avisa su alto mientras está visible", async () => {
    const onResize = vi.fn();
    window.addEventListener(COOKIE_BANNER_RESIZE_EVENT, onResize);

    renderBanner();

    await waitFor(() => expect(onResize).toHaveBeenCalled());
    window.removeEventListener(COOKIE_BANNER_RESIZE_EVENT, onResize);
  });

  it("avisa alto 0 apenas se decide (se oculta) el banner", async () => {
    const user = userEvent.setup();
    const onResize = vi.fn();
    window.addEventListener(COOKIE_BANNER_RESIZE_EVENT, onResize);

    renderBanner();
    await screen.findByRole("dialog");
    onResize.mockClear();

    await user.click(screen.getByRole("button", { name: "Aceptar" }));

    await waitFor(() => expect(onResize).toHaveBeenCalledWith(expect.objectContaining({ detail: 0 })));
    window.removeEventListener(COOKIE_BANNER_RESIZE_EVENT, onResize);
  });

  it("no avisa nada si el consentimiento ya estaba decidido", async () => {
    localStorage.setItem("aloha-consent", "accepted");
    const onResize = vi.fn();
    window.addEventListener(COOKIE_BANNER_RESIZE_EVENT, onResize);

    renderBanner();

    await new Promise((r) => setTimeout(r, 50));
    expect(onResize).not.toHaveBeenCalled();
    window.removeEventListener(COOKIE_BANNER_RESIZE_EVENT, onResize);
  });
});
