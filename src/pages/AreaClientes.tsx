import { useEffect, useState, type FormEvent } from "react";
import { LayoutDashboard, FileText, BarChart3, MessageCircle, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase, supabaseConfigurado } from "@/lib/supabaseClient";

/* Login de /area-clientes contra Supabase Auth: mientras no existe el portal
   real con datos por cliente, hay un único usuario administrador creado a
   mano en el panel de Supabase (no en este código). La contraseña queda
   hasheada del lado de Supabase, no viaja en el bundle de JavaScript. */

const labelClass = "block text-sm font-medium text-foreground mb-1";
const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition";

const adelantos = [
  { icon: BarChart3, label: "Reportes y estadísticas de tu operación" },
  { icon: FileText,  label: "Facturas y comprobantes disponibles para descargar" },
  { icon: LayoutDashboard, label: "Todos los datos de tu cuenta, centralizados en un solo lugar" },
];

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

function PortalEnConstruccion({ onLogout }: { onLogout: () => void }) {
  return (
    <>
      <div className="grid gap-4 mb-12">
        {adelantos.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-4 bg-card border border-border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="text-primary" size={20} />
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed">{label}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-muted-foreground mb-6">
          Mientras tanto, si sos cliente y necesitás algo de tu cuenta, escribinos y te ayudamos directamente.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://wa.me/5493512193103"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            <MessageCircle size={18} />
            Escribinos por WhatsApp
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="px-6 py-3.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}

const AreaClientes = () => {
  const [autenticado, setAutenticado] = useState(false);

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

  return (
    <div className="min-h-screen">
      <Seo path="/area-clientes" />
      <Navbar />
      <main>

      <section className="hero-gradient pt-32 pb-20">
        <div className="container mx-auto text-center max-w-2xl">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            {autenticado ? "Próximamente" : "Acceso privado"}
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Área Clientes
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            {autenticado
              ? "Estamos preparando tu portal personal, donde vas a poder acceder a toda la información de tu cuenta con Aloha Argentina."
              : "El portal de clientes todavía está en construcción. Este acceso es solo para uso interno."}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto max-w-2xl">
          {autenticado ? <PortalEnConstruccion onLogout={handleLogout} /> : <LoginForm onLogin={() => setAutenticado(true)} />}
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default AreaClientes;
