import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AreaClientes from "./AreaClientes";

/* Login de /area-clientes contra Supabase Auth. Lo que importa acá es que
   solo credenciales válidas den acceso, que una sesión ya iniciada
   (supabase.auth.getSession) se respete al cargar la página, que los
   cambios de sesión (onAuthStateChange) se reflejen, y que cerrar sesión
   llame a supabase.auth.signOut(). También que, ya logueado, se carguen y
   muestren los datos del cliente (supabase.from). La librería de Supabase
   se mockea entera: no hay proyecto real en los tests. El contenido
   específico del panel (tabs, documentos) se prueba en PanelCliente.test.tsx. */

const CLIENTE_DEMO = {
  id: "c1", nombre: "AVC", responsable_cliente: "Juan Pérez", coordinador_aloha: "Ana",
  contacto_coordinador: "ana@aloha.net.ar", horario_atencion: "Lunes a viernes 9 a 18 hs",
  descripcion_servicio: "Soporte técnico nivel 1 y 2", fecha_inicio: "2024-03-01",
};

const signInWithPassword = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const onAuthStateChange = vi.fn();
const unsubscribe = vi.fn();

let resultadoCliente: { data: unknown; error: unknown };
let resultadoReportes: { data: unknown; error: unknown };
let resultadoFacturas: { data: unknown; error: unknown };

const from = vi.fn((tabla: string) => ({
  select: () => ({
    single: () => Promise.resolve(resultadoCliente),
    order: () => Promise.resolve(tabla === "reportes" ? resultadoReportes : resultadoFacturas),
  }),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabaseConfigurado: true,
  get supabase() {
    return {
      auth: { signInWithPassword, signOut, getSession, onAuthStateChange },
      from,
    };
  },
}));

function renderPagina() {
  return render(
    <MemoryRouter>
      <AreaClientes />
    </MemoryRouter>
  );
}

const email = () => screen.getByLabelText(/^email$/i);
const password = () => screen.getByLabelText(/^contraseña$/i);
const ingresar = () => screen.getByRole("button", { name: /ingresar/i });

beforeEach(() => {
  signInWithPassword.mockReset();
  signOut.mockReset();
  getSession.mockReset().mockResolvedValue({ data: { session: null } });
  onAuthStateChange.mockReset().mockReturnValue({ data: { subscription: { unsubscribe } } });
  resultadoCliente = { data: CLIENTE_DEMO, error: null };
  resultadoReportes = { data: [], error: null };
  resultadoFacturas = { data: [], error: null };
});

describe("AreaClientes", () => {
  it("muestra el login por defecto, no el panel", async () => {
    renderPagina();

    expect(await screen.findByRole("button", { name: /ingresar/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cerrar sesión/i })).not.toBeInTheDocument();
  });

  it("rechaza credenciales incorrectas", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    renderPagina();

    await user.type(email(), "avc@aloha.net.ar");
    await user.type(password(), "contraseña-incorrecta");
    await user.click(ingresar());

    expect(await screen.findByRole("alert")).toHaveTextContent(/email o contraseña incorrectos/i);
    expect(screen.queryByRole("button", { name: /cerrar sesión/i })).not.toBeInTheDocument();
  });

  it("da acceso y carga el panel del cliente con credenciales correctas", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValue({ error: null });
    renderPagina();

    await user.type(email(), "avc@aloha.net.ar");
    await user.type(password(), "AlohaDemo2104!");
    await user.click(ingresar());

    expect(signInWithPassword).toHaveBeenCalledWith({ email: "avc@aloha.net.ar", password: "AlohaDemo2104!" });
    // El nombre del cliente logueado pasa a encabezar la página.
    expect(await screen.findByRole("heading", { name: "AVC" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /información/i })).toBeInTheDocument();
  });

  it("respeta una sesión ya iniciada al cargar la página", async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "1" } } } });
    renderPagina();

    expect(await screen.findByRole("heading", { name: "AVC" })).toBeInTheDocument();
  });

  it("muestra un aviso si el panel no puede cargar los datos del cliente", async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "1" } } } });
    resultadoCliente = { data: null, error: { message: "RLS denied" } };
    renderPagina();

    expect(await screen.findByText(/no pudimos cargar tu panel/i)).toBeInTheDocument();
  });

  it("cerrar sesión llama a supabase.auth.signOut()", async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "1" } } } });
    signOut.mockResolvedValue({ error: null });
    renderPagina();

    await userEvent.setup().click(await screen.findByRole("button", { name: /cerrar sesión/i }));

    expect(signOut).toHaveBeenCalled();
  });

  it("el campo de contraseña se puede mostrar y ocultar", async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole("button", { name: /ingresar/i });

    expect(password()).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /mostrar contraseña/i }));

    expect(password()).toHaveAttribute("type", "text");
  });
});

describe("AreaClientes · sin Supabase configurado", () => {
  it("avisa que el acceso no está configurado en vez de mostrar el formulario", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabaseClient", () => ({ supabaseConfigurado: false, supabase: null }));
    const { default: AreaClientesSinConfigurar } = await import("./AreaClientes");

    render(
      <MemoryRouter>
        <AreaClientesSinConfigurar />
      </MemoryRouter>
    );

    expect(await screen.findByText(/todavía no está configurado/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ingresar/i })).not.toBeInTheDocument();

    vi.doUnmock("@/lib/supabaseClient");
  });
});
