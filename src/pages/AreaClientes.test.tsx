import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AreaClientes from "./AreaClientes";

/* Login provisorio de /area-clientes: un único usuario administrador,
   mientras no existe el portal real con cuentas de cliente. Lo que importa
   acá es que solo esas credenciales exactas den acceso, que la sesión se
   recuerde entre recargas (sessionStorage) y que cerrar sesión la borre. */

function renderPagina() {
  return render(
    <MemoryRouter>
      <AreaClientes />
    </MemoryRouter>
  );
}

const usuario = () => screen.getByLabelText(/^usuario$/i);
const password = () => screen.getByLabelText(/^contraseña$/i);
const ingresar = () => screen.getByRole("button", { name: /ingresar/i });

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  sessionStorage.clear();
});

describe("AreaClientes", () => {
  it("muestra el login por defecto, no el contenido del portal", () => {
    renderPagina();

    expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
    expect(screen.queryByText(/reportes y estadísticas/i)).not.toBeInTheDocument();
  });

  it("rechaza credenciales incorrectas", async () => {
    const user = userEvent.setup();
    renderPagina();

    await user.type(usuario(), "admin");
    await user.type(password(), "contraseña-incorrecta");
    await user.click(ingresar());

    expect(await screen.findByRole("alert")).toHaveTextContent(/usuario o contraseña incorrectos/i);
    expect(screen.queryByText(/reportes y estadísticas/i)).not.toBeInTheDocument();
  });

  it("da acceso con las credenciales correctas", async () => {
    const user = userEvent.setup();
    renderPagina();

    await user.type(usuario(), "admin");
    await user.type(password(), "AlohaDemo2104!");
    await user.click(ingresar());

    expect(await screen.findByText(/reportes y estadísticas/i)).toBeInTheDocument();
  });

  it("recuerda la sesión entre recargas", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPagina();

    await user.type(usuario(), "admin");
    await user.type(password(), "AlohaDemo2104!");
    await user.click(ingresar());
    await screen.findByText(/reportes y estadísticas/i);
    unmount();

    renderPagina();
    expect(await screen.findByText(/reportes y estadísticas/i)).toBeInTheDocument();
  });

  it("cerrar sesión vuelve a pedir login y no la recuerda en la próxima carga", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPagina();

    await user.type(usuario(), "admin");
    await user.type(password(), "AlohaDemo2104!");
    await user.click(ingresar());
    await user.click(await screen.findByRole("button", { name: /cerrar sesión/i }));

    expect(await screen.findByRole("button", { name: /ingresar/i })).toBeInTheDocument();
    unmount();

    renderPagina();
    expect(await screen.findByRole("button", { name: /ingresar/i })).toBeInTheDocument();
  });

  it("el campo de contraseña se puede mostrar y ocultar", async () => {
    const user = userEvent.setup();
    renderPagina();

    expect(password()).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /mostrar contraseña/i }));

    expect(password()).toHaveAttribute("type", "text");
  });
});
