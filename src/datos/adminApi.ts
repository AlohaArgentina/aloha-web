import { supabase } from "@/lib/supabaseClient";
import type { Cliente, Factura, Reporte } from "@/pages/area-clientes/tipos";

/* Toda la conversación con Supabase de la sección admin pasa por acá. Ninguna
   consulta filtra "solo lo mío": las políticas de Row Level Security (ver
   supabase/schema.sql, sección "administradores") ya exigen pertenecer a la
   tabla "administradores" para poder leer o escribir clientes/reportes/
   facturas más allá de la fila propia, así que un select o un write sin
   filtro extra es automáticamente seguro — y no se puede olvidar el chequeo. */

class SinConfigurarError extends Error {
  constructor() {
    super("Supabase no está configurado en este entorno.");
  }
}

function cliente() {
  if (!supabase) throw new SinConfigurarError();
  return supabase;
}

function oFalla<T>({ data, error }: { data: T | null; error: { message: string } | null }, contexto: string): T {
  if (error) {
    console.error(`Error al ${contexto}:`, error.message);
    throw new Error(error.message);
  }
  return data as T;
}

export interface Administrador {
  auth_user_id: string;
  nombre: string;
}

/* null si el usuario logueado no tiene fila en "administradores" (típicamente
   porque es un cliente que entró por acá por error, o un link viejo): la
   política de RLS de esa tabla solo deja ver la fila propia, así que un
   select sin resultados es la forma normal de decir "no sos admin", no un
   error. */
export async function traerAdministradorActual(): Promise<Administrador | null> {
  const respuesta = await cliente().from("administradores").select("*").maybeSingle();
  return oFalla(respuesta, "verificar permisos de administración");
}

export async function traerClientes(): Promise<Cliente[]> {
  const respuesta = await cliente().from("clientes").select("*").order("nombre");
  return oFalla(respuesta, "cargar los clientes") ?? [];
}

export async function traerCliente(id: string): Promise<Cliente | null> {
  const respuesta = await cliente().from("clientes").select("*").eq("id", id).maybeSingle();
  return oFalla(respuesta, "cargar el cliente");
}

export type CambiosCliente = Omit<Cliente, "id">;

export async function actualizarCliente(id: string, cambios: CambiosCliente): Promise<void> {
  const respuesta = await cliente().from("clientes").update(cambios).eq("id", id);
  oFalla(respuesta, "actualizar el cliente");
}

/* El login del cliente (Authentication → Users) se sigue creando a mano en
   Supabase, igual que hasta ahora: no hay forma de dar de alta un usuario de
   auth desde acá con la anon key, ni tendría sentido (esa clave nunca debe
   poder crear logins). Esta función solo vincula un login que ya existe con
   su fila de datos, buscándolo por email a través de una función de la base
   (crear_cliente, security definer): tampoco hay forma de listar auth.users
   desde el navegador para resolver el id a mano. */
export async function crearCliente(email: string, nombre: string): Promise<string> {
  const { data, error } = await cliente().rpc("crear_cliente", { p_email: email, p_nombre: nombre });
  if (error) {
    console.error("Error al crear el cliente:", error.message);
    throw new Error(error.message);
  }
  return data as string;
}

// --- Reportes ----------------------------------------------------------------

export async function traerReportes(clienteId: string): Promise<Reporte[]> {
  const respuesta = await cliente()
    .from("reportes").select("*").eq("cliente_id", clienteId).order("periodo", { ascending: false });
  return oFalla(respuesta, "cargar los reportes") ?? [];
}

export interface DatosReporte {
  periodo: string;
  drive_url: string;
}

export async function guardarReporte(clienteId: string, datos: DatosReporte, id?: string): Promise<void> {
  const respuesta = id
    ? await cliente().from("reportes").update(datos).eq("id", id)
    : await cliente().from("reportes").insert({ ...datos, cliente_id: clienteId });
  oFalla(respuesta, "guardar el reporte");
}

export async function eliminarReporte(id: string): Promise<void> {
  const respuesta = await cliente().from("reportes").delete().eq("id", id);
  oFalla(respuesta, "eliminar el reporte");
}

// --- Facturas ------------------------------------------------------------------

export async function traerFacturas(clienteId: string): Promise<Factura[]> {
  const respuesta = await cliente()
    .from("facturas").select("*").eq("cliente_id", clienteId).order("periodo", { ascending: false });
  return oFalla(respuesta, "cargar las facturas") ?? [];
}

export interface DatosFactura {
  periodo: string;
  drive_url: string;
  monto: number | null;
  estado: Factura["estado"];
}

export async function guardarFactura(clienteId: string, datos: DatosFactura, id?: string): Promise<void> {
  const respuesta = id
    ? await cliente().from("facturas").update(datos).eq("id", id)
    : await cliente().from("facturas").insert({ ...datos, cliente_id: clienteId });
  oFalla(respuesta, "guardar la factura");
}

export async function eliminarFactura(id: string): Promise<void> {
  const respuesta = await cliente().from("facturas").delete().eq("id", id);
  oFalla(respuesta, "eliminar la factura");
}
