import { useEffect, useState, type FormEvent } from "react";
import { LayoutDashboard, FileText, BarChart3, MessageCircle, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

/* Login provisorio, solo para uso interno mientras se desarrolla el portal
   real de clientes (con cuentas propias y backend). Hasta entonces hay un
   único usuario administrador.

   Ojo: esto NO es un mecanismo de seguridad real. La verificación ocurre en
   el navegador y estas credenciales viajan en el bundle de JavaScript —
   cualquiera que revise el código fuente las puede ver. Sirve únicamente
   para no dejar la vista previa del portal abierta a cualquier visitante;
   no debe usarse para proteger datos reales de clientes. */
const ADMIN_USER = "admin";
const ADMIN_PASS = "AlohaDemo2104!";
const SESSION_KEY = "aloha-area-clientes-auth";

const labelClass = "block text-sm font-medium text-foreground mb-1";
const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition";

const adelantos = [
  { icon: BarChart3, label: "Reportes y estadísticas de tu operación" },
  { icon: FileText,  label: "Facturas y comprobantes disponibles para descargar" },
  { icon: LayoutDashboard, label: "Todos los datos de tu cuenta, centralizados en un solo lugar" },
];

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (usuario === ADMIN_USER && password === ADMIN_PASS) {
      setError(false);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Modo privado o storage bloqueado: la sesión no persiste, pero se respeta en esta carga.
      }
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="area-clientes-usuario" className={labelClass}>Usuario</label>
          <input
            id="area-clientes-usuario" type="text" value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Usuario" autoComplete="username" autoFocus
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
            <AlertCircle size={16} /><span>Usuario o contraseña incorrectos.</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
        >
          <Lock size={18} />
          Ingresar
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
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") setAutenticado(true);
    } catch {
      // Sin storage no hay sesión que recordar; se pide login igual.
    }
  }, []);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Nada que limpiar si no hay storage disponible.
    }
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
