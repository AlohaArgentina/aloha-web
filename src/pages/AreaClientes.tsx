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

function LoginForm({ onLogin, onOlvidoContrasena }: { onLogin: () => void; onOlvidoContrasena: () => void }) {
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
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={onOlvidoContrasena}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ¿Olvidaste tu contraseña?
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

function OlvideContrasenaForm({ onVolver }: { onVolver: () => void }) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(false);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/area-clientes`,
    });
    setLoading(false);

    if (resetError) {
      console.error("Supabase resetPasswordForEmail error:", resetError.message);
      setError(true);
    } else {
      setEnviado(true);
    }
  };

  if (enviado) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md mx-auto text-center">
        <p className="text-foreground text-sm mb-6">
          Si el email existe, te enviamos un link para restablecer tu contraseña. Revisá tu casilla (y la carpeta de spam).
        </p>
        <button type="button" onClick={onVolver} className="text-accent text-sm font-medium hover:underline">
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="area-clientes-recuperar-email" className={labelClass}>Email</label>
          <input
            id="area-clientes-recuperar-email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" autoComplete="email" autoFocus
            className={inputClass}
          />
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle size={16} /><span>No pudimos enviar el email. Intentá de nuevo más tarde.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando..." : "Enviar link de recuperación"}
        </button>
        <button
          type="button"
          onClick={onVolver}
          className="w-full text-center text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Volver al login
        </button>
      </form>
    </div>
  );
}

function RestablecerContrasenaForm({ onListo }: { onListo: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      console.error("Supabase updateUser error:", updateError.message);
      setError("No pudimos actualizar la contraseña. Probá pedir un nuevo link.");
    } else {
      onListo();
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-foreground mb-1">Elegí tu nueva contraseña</h2>
      <p className="text-muted-foreground text-sm mb-6">Después de guardarla vas a poder ingresar a tu panel.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="area-clientes-nueva-password" className={labelClass}>Nueva contraseña</label>
          <div className="relative">
            <input
              id="area-clientes-nueva-password" type={mostrarPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña" autoComplete="new-password"
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
        <div>
          <label htmlFor="area-clientes-confirmar-password" className={labelClass}>Repetir contraseña</label>
          <input
            id="area-clientes-confirmar-password" type={mostrarPassword ? "text" : "password"} value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            placeholder="Repetir contraseña" autoComplete="new-password"
            className={inputClass}
          />
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle size={16} /><span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Lock size={18} />
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}

const AreaClientes = () => {
  const [autenticado, setAutenticado] = useState(false);
  const [recuperandoPassword, setRecuperandoPassword] = useState(false);
  const [modoAcceso, setModoAcceso] = useState<"login" | "olvide">("login");
  const { cliente, reportes, facturas, loading, error } = usePanelCliente(autenticado);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setAutenticado(!!data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      // El link del mail de "recuperar contraseña" abre una sesión válida
      // igual, pero no hay que dejar pasar directo al panel con ella: hay
      // que forzar a elegir una contraseña nueva primero.
      if (event === "PASSWORD_RECOVERY") {
        setRecuperandoPassword(true);
        return;
      }
      setAutenticado(!!session);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setAutenticado(false);
  };

  const handleContrasenaRestablecida = () => {
    setRecuperandoPassword(false);
    setAutenticado(true);
  };

  /* Una vez que el panel del cliente terminó de cargar, se deja de mostrar el
     chrome del sitio público (Navbar, hero, Footer): el panel pasa a usar su
     propio shell de pantalla completa (ver PanelShell), con el mismo estilo
     que el panel interno de Aloha Desk. El login y los demás estados
     intermedios (cargando, error, recuperar contraseña) siguen dentro del
     sitio público tal como estaban: ahí no hace falta el shell todavía. */
  if (autenticado && !loading && !error && cliente) {
    return (
      <div className="min-h-screen">
        <Seo path="/area-clientes" />
        <PanelCliente cliente={cliente} reportes={reportes} facturas={facturas} onLogout={handleLogout} />
      </div>
    );
  }

  const eyebrow = recuperandoPassword ? "Recuperar acceso" : autenticado ? "Panel de cliente" : "Acceso privado";
  const titulo = "Área Clientes";
  const subtitulo = recuperandoPassword
    ? "Elegí una nueva contraseña para continuar."
    : autenticado
    ? "Cargando tu panel..."
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
        <div className="container mx-auto max-w-2xl">
          {recuperandoPassword && <RestablecerContrasenaForm onListo={handleContrasenaRestablecida} />}

          {!recuperandoPassword && !autenticado && modoAcceso === "login" && (
            <LoginForm onLogin={() => setAutenticado(true)} onOlvidoContrasena={() => setModoAcceso("olvide")} />
          )}

          {!recuperandoPassword && !autenticado && modoAcceso === "olvide" && (
            <OlvideContrasenaForm onVolver={() => setModoAcceso("login")} />
          )}

          {!recuperandoPassword && autenticado && loading && (
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
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default AreaClientes;
