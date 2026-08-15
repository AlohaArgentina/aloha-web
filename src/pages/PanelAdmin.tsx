import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Lock } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { claseCampo, claseEtiqueta } from "@/components/ui/campos";
import { supabase, supabaseConfigurado } from "@/lib/supabaseClient";
import { useAdministradorActual } from "@/hooks/useAdministradorActual";
import PanelAdministracion from "@/pages/panel-admin/PanelAdministracion";

/* Ruta de administración de cuentas de cliente (/panel-admin). No está
   linkeada desde la navegación pública a propósito: es para coordinación,
   no para clientes ni visitantes del sitio.

   Usa el mismo proyecto de Supabase Auth que /area-clientes (mismo login,
   misma sesión), así que un login correcto acá no alcanza por sí solo: hace
   falta además tener una fila en "administradores" (ver
   supabase/schema.sql). Sin eso, cualquier cliente que probara entrar por
   acá vería "no tenés permisos", nunca el panel — y del lado de Supabase,
   RLS igual le rechazaría toda lectura/escritura sobre otras cuentas. */

function PantallaCargando() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center">
      <p className="text-primary-foreground/70 text-sm" role="status">Cargando...</p>
    </div>
  );
}

function LoginAdmin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(false);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      console.error("Supabase signInWithPassword error:", authError.message, authError.status);
      setError(true);
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md w-full">
        <h1 className="text-xl font-display font-bold text-foreground mb-1">Panel de administración</h1>
        <p className="text-muted-foreground text-sm mb-6">Acceso exclusivo para coordinación de Aloha Argentina.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className={claseEtiqueta}>Email</label>
            <input
              id="admin-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" autoFocus className={claseCampo}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className={claseEtiqueta}>Contraseña</label>
            <input
              id="admin-password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" className={claseCampo}
            />
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle size={16} /><span>Email o contraseña incorrectos.</span>
            </div>
          )}

          <Boton type="submit" variante="principal" className="w-full" disabled={loading}>
            <Lock size={16} />
            {loading ? "Ingresando..." : "Ingresar"}
          </Boton>
        </form>
      </div>
    </div>
  );
}

function SinPermisos({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md text-center">
        <AlertCircle className="text-muted-foreground mx-auto mb-3" size={28} />
        <h1 className="text-lg font-display font-bold text-foreground mb-2">Tu cuenta no tiene permisos de administración</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Este acceso es solo para coordinación. Si creés que es un error, pedile a alguien de coordinación que te agregue.
        </p>
        <Boton variante="secundario" onClick={onLogout}>Cerrar sesión</Boton>
      </div>
    </div>
  );
}

export default function PanelAdmin() {
  const [autenticado, setAutenticado] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const { admin, cargando: cargandoAdmin, error: errorAdmin } = useAdministradorActual(autenticado);

  useEffect(() => {
    if (!supabase) {
      setCargandoSesion(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setAutenticado(!!data.session);
      setCargandoSesion(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAutenticado(!!session);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setAutenticado(false);
  };

  if (!supabaseConfigurado) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md text-center">
          <AlertCircle className="text-muted-foreground mx-auto mb-3" size={28} />
          <p className="text-muted-foreground text-sm">
            El acceso todavía no está configurado en este entorno.
          </p>
        </div>
      </div>
    );
  }

  if (cargandoSesion) return <PantallaCargando />;
  if (!autenticado) return <LoginAdmin onLogin={() => setAutenticado(true)} />;
  if (cargandoAdmin) return <PantallaCargando />;
  if (errorAdmin || !admin) return <SinPermisos onLogout={handleLogout} />;

  return <PanelAdministracion admin={admin} onLogout={handleLogout} />;
}
