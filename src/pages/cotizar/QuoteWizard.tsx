import { useState } from "react";
import { usePostHog } from "@posthog/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle, ArrowRight } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { RubroFormConfig } from "./rubros-config";
import { valoresIniciales } from "./rubros-config";
import { PasoCampos, type ValorCampo } from "./campos";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACnIcJCY0rNYR6j2";

const stepVariants = {
  enter:  { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -30 },
};

// ── CTA Button ───────────────────────────────────────────────
function ShimmerButton({ children, className = "", disabled = false, type = "button", onClick }: {
  children: React.ReactNode; className?: string; disabled?: boolean;
  type?: "button" | "submit"; onClick?: () => void;
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg
        bg-accent hover:bg-accent/90 px-8 py-4 font-semibold text-accent-foreground
        shadow-lg shadow-accent/20 transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

// ── Barra de progreso ────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full mb-8">
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round((step / total) * 100)}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

async function submitForm(formName: string, data: Record<string, string>, turnstileToken?: string | null) {
  const body = new URLSearchParams({ "form-name": formName, "cf-turnstile-response": turnstileToken || "", ...data });
  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) {
    throw new Error(`Envío rechazado por el servidor (HTTP ${response.status})`);
  }
}

/** Wizard multi-paso genérico: recibe la configuración de un rubro y dibuja
    sus pasos, validación de contacto, captcha y envío. Los cuatro rubros
    comparten esta única implementación; lo que cambia entre ellos vive en
    rubros-config.ts. */
export default function QuoteWizard({ config, onSubmitted }: { config: RubroFormConfig; onSubmitted: () => void }) {
  const posthog = usePostHog();
  const totalPasos = config.pasos.length;

  const [paso, setPaso]                     = useState(1);
  const [valores, setValores]               = useState(() => valoresIniciales(config));
  const [otroTextos, setOtroTextos]         = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const [loading, setLoading]               = useState(false);
  const [submitError, setSubmitError]       = useState(false);
  const isVerified = !!turnstileToken;

  const actualizar = (clave: string, valor: ValorCampo) => setValores(v => ({ ...v, [clave]: valor }));
  const actualizarOtroTexto = (clave: string, texto: string) => setOtroTextos(o => ({ ...o, [clave]: texto }));

  const contactoCompleto = !!(valores.empresa && valores.telefono && valores.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;
    setLoading(true);
    setSubmitError(false);
    try {
      await submitForm(config.formName, config.construirPayload(valores), turnstileToken);
      posthog.capture("service_quote_submitted", { sector: config.posthogSector });
      onSubmitted();
    } catch {
      setSubmitError(true);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ProgressBar step={paso} total={totalPasos} />
      <AnimatePresence mode="wait">
        {config.pasos.map((pasoConfig, i) => {
          const numeroPaso = i + 1;
          if (numeroPaso !== paso) return null;
          const esUltimo = numeroPaso === totalPasos;

          return (
            <motion.div key={`s${numeroPaso}`} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className={pasoConfig.espaciado}>
              <div className="mb-5">
                <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Paso {numeroPaso} de {totalPasos}</p>
                <h3 className="text-lg font-display font-bold text-foreground">{pasoConfig.titulo}</h3>
                <p className="text-sm text-muted-foreground">{pasoConfig.subtitulo}</p>
              </div>

              <PasoCampos
                elementos={pasoConfig.elementos}
                idBase={config.formName}
                valores={valores}
                actualizar={actualizar}
                otroTextos={otroTextos}
                actualizarOtroTexto={actualizarOtroTexto}
              />

              {esUltimo && (
                <div className="flex flex-col items-start gap-4 pt-2">
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(t) => { setTurnstileToken(t); setTurnstileError(false); }}
                    onError={() => { setTurnstileToken(null); setTurnstileError(true); }}
                    onExpire={() => { setTurnstileToken(null); setTurnstileError(true); }}
                    options={{ theme: "light", size: "normal" }}
                  />
                  {turnstileError && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle size={16} /><span>La verificación falló. Por favor reintentá.</span>
                    </div>
                  )}
                  {submitError && (
                    <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle size={16} /><span>No pudimos enviar tu solicitud. Reintentá o escribinos por WhatsApp.</span>
                    </div>
                  )}
                </div>
              )}

              <div className={numeroPaso === 1 ? "pt-3" : esUltimo ? "flex gap-3" : "flex gap-3 pt-2"}>
                {numeroPaso > 1 && (
                  <button type="button" onClick={() => setPaso(numeroPaso - 1)} className="px-6 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                    ← Atrás
                  </button>
                )}
                {esUltimo ? (
                  <ShimmerButton type="submit" disabled={!isVerified || loading} className="flex-1">
                    {loading ? "Enviando..." : "Cotizá tu equipo a medida"} <Send size={18} />
                  </ShimmerButton>
                ) : (
                  <ShimmerButton
                    onClick={() => setPaso(numeroPaso + 1)}
                    disabled={numeroPaso === 1 && !contactoCompleto}
                    className={numeroPaso === 1 ? "w-full" : "flex-1"}
                  >
                    Continuar <ArrowRight size={18} />
                  </ShimmerButton>
                )}
              </div>

              {esUltimo && (
                <p className="text-xs text-muted-foreground text-center">{config.notaFinal}</p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </form>
  );
}
