import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PanelAdmin from "./PanelAdmin";

/* Login de /panel-admin contra el mismo Supabase Auth que /area-clientes.
   Lo que importa acá es que un login correcto no alcance por sí solo: hace
   falta además tener fila en "administradores" (si no, se avisa que no hay
   permisos, nunca se muestra el panel). Una vez confirmado admin, se prueba
   que la lista de clientes se cargue y se pueda cerrar sesión. La librería de
   Supabase se mockea entera. */

const ADMIN_DEMO = { auth_user_id: "a1", nombre: "Ana Gómez" };
const CLIENTES_DEMO = [
  { id: "c1", nombre: "AVC", responsable_cliente: "Juan Pérez", coordinador_aloha: null, contacto_coordinador: null, horario_atencion: null, descripcion_servicio: null, fecha_inicio: null },
];

const signInWithPassword = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const onAuthStateChange = vi.fn();
const unsubscribe = vi.fn();

let resultadoAdmin: { data: unknown; error: unknown };
let resultadoClientes: { data: unknown; error: unknown };

const from = vi.fn((tabla: string) => ({
  select: () => ({
    maybeSingle: () => Promise.resolve(resultadoAdmin),
    order: () => Promise.resolve(tabla === "clientes" ? resultadoClientes : resultadoAdmin),
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
  return render(<PanelAdmin />);
}

const email = () => screen.getByLabelText(/^email$/i);
const password = () => screen.getByLabelText(/^contraseña$/i);
const ingresar = () => screen.getByRole("button", { name: /ingresar/i });
const esperarLogin = () => screen.findByRole("button", { name: /ingresar/i });

beforeEach(() => {
  signInWithPassword.mockReset();
  signOut.mockReset();
  getSession.mockReset().mockResolvedValue({ data: { session: null } });
  onAuthStateChange.mockReset().mockImplementation(() => ({ data: { subscription: { unsubscribe } } }));
  resultadoAdmin = { data: ADMIN_DEMO, error: null };
  resultadoClientes = { data: CLIENTES_DEMO, error: null };
});

describe("PanelAdmin", () => {
  it("muestra el login por defecto", async () => {
    renderPagina();
    expect(await screen.findByRole("heading", { name: /panel de administración/i })).toBeInTheDocument();
  });

  it("rechaza credenciales incorrectas", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    renderPagina();
    await esperarLogin();

    await user.type(email(), "admin@aloha.net.ar");
    await user.type(password(), "incorrecta");
    await user.click(ingresar());

    expect(await screen.findByRole("alert")).toHaveTextContent(/email o contraseña incorrectos/i);
  });

  it("avisa cuando el login es válido pero la cuenta no es de administración", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValue({ error: null });
    resultadoAdmin = { data: null, error: null };
    renderPagina();
    await esperarLogin();

    await user.type(email(), "cliente@empresa.com");
    await user.type(password(), "loquesea");
    await user.click(ingresar());

    expect(await screen.findByText(/no tiene permisos de administración/i)).toBeInTheDocument();
  });

  it("da acceso al panel y lista los clientes cuando la cuenta es admin", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValue({ error: null });
    renderPagina();
    await esperarLogin();

    await user.type(email(), "administracion@aloha.net.ar");
    await user.type(password(), "correcta");
    await user.click(ingresar());

    expect(await screen.findByRole("heading", { name: "Clientes" })).toBeInTheDocument();
    expect(await screen.findByText("AVC")).toBeInTheDocument();
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
  });

  it("cerrar sesión llama a supabase.auth.signOut()", async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "a1" } } } });
    signOut.mockResolvedValue({ error: null });
    renderPagina();

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /cerrar sesión/i }));

    expect(signOut).toHaveBeenCalled();
  });
});

describe("PanelAdmin · sin Supabase configurado", () => {
  it("avisa que el acceso no está configurado en vez de mostrar el login", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabaseClient", () => ({ supabaseConfigurado: false, supabase: null }));
    const { default: PanelAdminSinConfigurar } = await import("./PanelAdmin");

    render(<PanelAdminSinConfigurar />);

    expect(await screen.findByText(/todavía no está configurado/i)).toBeInTheDocument();
    vi.doUnmock("@/lib/supabaseClient");
  });
});
