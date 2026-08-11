import { createClient } from "@supabase/supabase-js";

/* Cliente de Supabase, usado por ahora solo para el login de /area-clientes.

   Las credenciales son públicas por diseño (la "anon key" está pensada para
   vivir en el navegador; el acceso real a los datos se controla del lado de
   Supabase con Row Level Security, no ocultando esta clave). Nunca se debe
   usar acá la "service role key": esa sí es secreta y solo puede vivir en
   una función serverless (Netlify Functions), nunca en el bundle del
   cliente. */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigurado = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

/* null cuando falta configuración (por ejemplo, en un preview sin las
   variables de entorno todavía cargadas): las pantallas que lo usan deben
   mostrar ese estado explícitamente, no fallar en silencio ni caer en un
   modo alternativo sin autenticación real. */
export const supabase = supabaseConfigurado ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
