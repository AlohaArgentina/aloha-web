import { useState } from "react";
import { usePostHog } from "@posthog/react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Wifi, ShoppingBag, Cpu, Building2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import ParticleCanvas from "@/components/ParticleCanvas";
import QuoteWizard from "./cotizar/QuoteWizard";
import { RUBRO_CONFIGS } from "./cotizar/rubros-config";

const rubros = [
  { id: "isp",        icon: Wifi,        label: "ISP / Telecomunicaciones", desc: "Proveedor de internet, telefonía o servicios de conectividad" },
  { id: "retail",     icon: ShoppingBag, label: "Retail / E-commerce",      desc: "Tienda física, online o marketplace" },
  { id: "tecnologia", icon: Cpu,         label: "Tecnología / SaaS",        desc: "Empresa de software, startup o producto digital" },
  { id: "otro",       icon: Building2,   label: "Otro rubro",               desc: "Empresa en crecimiento de cualquier industria" },
];

// ════════════════════════════════════════════════════════════
// Página principal
// ════════════════════════════════════════════════════════════
const CotizarServicio = () => {
  const posthog = usePostHog();
  const [rubroId, setRubroId]     = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const rubroSeleccionado = rubros.find(r => r.id === rubroId);

  return (
    <div className="min-h-screen">
      <Seo path="/request" />
      <Navbar />
      <main>
      <section className="relative hero-gradient text-primary-foreground overflow-hidden">
        <ParticleCanvas />
        <div className="container mx-auto text-center relative z-10 py-28 lg:py-36 max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Sin costo · Sin compromiso</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-5xl font-display font-bold leading-tight mb-5">
            Llevá tu atención al <span className="text-gradient">siguiente nivel</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-primary-foreground/70 text-lg leading-relaxed">
            Completá el formulario y en menos de 48 hs te enviamos una propuesta adaptada a tu operación.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {!rubroId && !submitted && (
              <motion.div key="selector" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">¿A qué rubro pertenece su empresa?</h2>
                  <p className="text-muted-foreground">Seleccioná tu industria para mostrarte el formulario más adecuado.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {rubros.map((r, i) => (
                    <motion.button key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      onClick={() => { setRubroId(r.id); posthog.capture("quote_rubro_selected", { rubro: r.id }); }}
                      className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/40 hover:glow-primary transition-all duration-300 group">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"><r.icon className="text-primary" size={20} /></div>
                      <div className="flex-1"><p className="font-display font-semibold text-foreground text-sm mb-0.5">{r.label}</p><p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p></div>
                      <ChevronRight size={16} className="text-muted-foreground mt-1 flex-shrink-0 group-hover:text-primary transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            {rubroId && !submitted && (
              <motion.div key={`form-${rubroId}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setRubroId(null)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Cambiar rubro</button>
                  <span className="text-muted-foreground/40">|</span>
                  {rubroSeleccionado && (
                    <div className="flex items-center gap-2">
                      <rubroSeleccionado.icon size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">{rubroSeleccionado.label}</span>
                    </div>
                  )}
                </div>
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                  {rubroId && RUBRO_CONFIGS[rubroId] && (
                    <QuoteWizard key={rubroId} config={RUBRO_CONFIGS[rubroId]} onSubmitted={() => setSubmitted(true)} />
                  )}
                </div>
              </motion.div>
            )}
            {submitted && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="text-center py-16">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.1 }} className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={44} className="text-accent" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-3">¡Solicitud enviada!</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">Recibimos tu formulario. En menos de 48 hs te enviamos una propuesta adaptada a tu operación. Todos los datos son confidenciales.</p>
                <a href="/" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">Volver al inicio</a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
};

export default CotizarServicio;