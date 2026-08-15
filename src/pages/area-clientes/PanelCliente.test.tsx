import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PanelCliente from "./PanelCliente";
import type { Cliente, Reporte, Factura } from "./tipos";

/* Prueba el panel ya logueado, sin pasar por Supabase: recibe los datos
   como props (así se desacopla de cómo se buscan, eso lo cubre
   usePanelCliente / AreaClientes.test.tsx). Lo importante acá es que cada
   solapa muestre lo suyo, que los documentos generen la URL de
   previsualización embebida (no un link a drive.google.com) y de
   descarga, y que el estado vacío se muestre cuando no hay nada cargado. */

const CLIENTE: Cliente = {
  id: "c1", nombre: "AVC", responsable_cliente: "Juan Pérez", coordinador_aloha: "Ana Gómez",
  contacto_coordinador: "ana@aloha.net.ar", horario_atencion: "Lunes a viernes 9 a 18 hs",
  descripcion_servicio: "Soporte técnico nivel 1 y 2", fecha_inicio: "2024-03-01",
};

const REPORTE_JULIO: Reporte = {
  id: "r1", periodo: "2026-07-01",
  drive_url: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing",
};
const REPORTE_JUNIO: Reporte = {
  id: "r2", periodo: "2026-06-01",
  drive_url: "https://drive.google.com/file/d/2ZzYyXxWwVvUuTtSsRr/view?usp=sharing",
};

const FACTURA_PENDIENTE: Factura = {
  id: "f1", periodo: "2026-07-01", monto: 150000, estado: "pendiente",
  drive_url: "https://drive.google.com/file/d/3QqWwEeRrTtYyUuIiOo/view?usp=sharing",
};

function renderPanel(props: Partial<React.ComponentProps<typeof PanelCliente>> = {}) {
  const onLogout = vi.fn();
  render(
    <PanelCliente
      cliente={CLIENTE}
      reportes={[REPORTE_JULIO, REPORTE_JUNIO]}
      facturas={[FACTURA_PENDIENTE]}
      onLogout={onLogout}
      {...props}
    />
  );
  return { onLogout };
}

describe("PanelCliente", () => {
  it("muestra la información general por defecto", () => {
    renderPanel();

    expect(screen.getByRole("heading", { name: "AVC" })).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
  });

  it("la solapa de reportes previsualiza el más reciente embebido, sin link a Drive", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Reportes" }));

    const iframe = screen.getByTitle(/julio de 2026/i);
    expect(iframe).toHaveAttribute("src", "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/preview");

    const descarga = screen.getByRole("link", { name: /descargar/i });
    expect(descarga).toHaveAttribute("href", "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQr");
  });

  it("permite cambiar de período en reportes", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Reportes" }));
    await user.click(screen.getByRole("button", { name: /junio de 2026/i }));

    expect(screen.getByTitle(/junio de 2026/i)).toHaveAttribute(
      "src", "https://drive.google.com/file/d/2ZzYyXxWwVvUuTtSsRr/preview"
    );
  });

  it("muestra un estado vacío cuando no hay reportes", async () => {
    const user = userEvent.setup();
    renderPanel({ reportes: [] });

    await user.click(screen.getByRole("button", { name: "Reportes" }));

    expect(screen.getByText(/todavía no hay reportes cargados/i)).toBeInTheDocument();
  });

  it("la solapa de facturación muestra el estado de cada factura", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Facturación" }));

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("cerrar sesión llama a onLogout", async () => {
    const user = userEvent.setup();
    const { onLogout } = renderPanel();

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(onLogout).toHaveBeenCalled();
  });
});
