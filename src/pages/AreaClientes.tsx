import { useEffect, useState, type FormEvent } from "react";
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase, supabaseConfigurado } from "@/lib/supabaseClient";
import { usePanelCliente } from "./area-clientes/usePanelCliente";
import PanelCliente from "./area-clientes/PanelCliente";

/* Login de /area-clientes contra Supabase Auth. Cada cliente (AVC, Airsat,
   Fiberty) tiene un único usuario creado a mano en Supabase, vinculado a su
   fila en la tabla "clientes" (ver supabase/schema.sql). La contraseña
   queda hasheada del lado de Supabase, no viaja en el bundle de JavaScript. */

const labelClass = "block text-sm font-medium text-foreground mb-1";
const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition";

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
      // El mensaje visible se mantiene genérico a propósito (no decir si el
      // email existe o no); el detalle real queda en la consola para poder
      // diagnosticar problemas de configuración sin exponerlos en pantalla.
      console.error("Supabase signInWithPassword error:", authError.message, authError.status);
      setError(true);
    } else {
      onLogin();
    }
  };

  if (!supabaseConfigurado) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md mx-auto text-center">
        <AlertCircle className="text-muted-foreground mx-auto mb-3" size={28} />
        <p className="text-muted-foreground text-sm">
          El acceso todavía no está configurado en este entorno. Volvé a intentarlo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="area-clientes-email" className={labelClass}>Email</label>
          <input
            id="area-clientes-email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" autoComplete="email" autoFocus
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="area-clientes-password" className={labelClass}>Contraseña</label>
          <div className="relative">
            <input
              id="area-clientes-password" type={mostrarPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña" autoComplete="current-password"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((v) => !v)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle size={16} /><span>Email o contraseña incorrectos.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Lock size={18} />
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

const AreaClientes = () => {
  const [autenticado, setAutenticado] = useState(false);
  const { cliente, reportes, facturas, loading, error } = usePanelCliente(autenticado);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setAutenticado(!!data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAutenticado(!!session);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setAutenticado(false);
  };

  const eyebrow = autenticado ? "Panel de cliente" : "Acceso privado";
  const titulo = autenticado && cliente ? cliente.nombre : "Área Clientes";
  const subtitulo = autenticado
    ? "Reportes, facturación y los datos de tu cuenta con Aloha Argentina."
    : "Ingresá con tu usuario para acceder a tu panel.";

  return (
    <div className="min-h-screen">
      <Seo path="/area-clientes" />
      <Navbar />
      <main>

      <section className="hero-gradient pt-32 pb-20">
        <div className="container mx-auto text-center max-w-2xl">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            {eyebrow}
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            {titulo}
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            {subtitulo}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className={`container mx-auto ${autenticado ? "max-w-4xl" : "max-w-2xl"}`}>
          {!autenticado && <LoginForm onLogin={() => setAutenticado(true)} />}

          {autenticado && loading && (
            <p className="text-center text-muted-foreground">Cargando tu panel...</p>
          )}

          {autenticado && !loading && (error || !cliente) && (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md mx-auto text-center">
              <AlertCircle className="text-muted-foreground mx-auto mb-3" size={28} />
              <p className="text-muted-foreground text-sm mb-6">
                No pudimos cargar tu panel. Reintentá más tarde o escribinos si el problema sigue.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}

          {autenticado && !loading && cliente && (
            <PanelCliente cliente={cliente} reportes={reportes} facturas={facturas} onLogout={handleLogout} />
          )}
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default AreaClientes;
