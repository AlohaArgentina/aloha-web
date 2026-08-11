import { useEffect } from "react";
import { LayoutDashboard, FileText, BarChart3, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const adelantos = [
  { icon: BarChart3, label: "Reportes y estadísticas de tu operación" },
  { icon: FileText,  label: "Facturas y comprobantes disponibles para descargar" },
  { icon: LayoutDashboard, label: "Todos los datos de tu cuenta, centralizados en un solo lugar" },
];

const AreaClientes = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Seo path="/area-clientes" />
      <Navbar />
      <main>

      <section className="hero-gradient pt-32 pb-20">
        <div className="container mx-auto text-center max-w-2xl">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            Próximamente
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Área Clientes
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Estamos preparando tu portal personal, donde vas a poder acceder a toda la información
            de tu cuenta con Aloha Argentina.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto max-w-2xl">
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
            <a
              href="https://wa.me/5493512193103"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              <MessageCircle size={18} />
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default AreaClientes;
