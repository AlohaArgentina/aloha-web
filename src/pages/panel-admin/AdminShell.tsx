import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* Mismo shell que PanelShell (área clientes) y que AppShell (aloha-desk):
   barra lateral oscura fija en escritorio, cajón en mobile. La sección de
   administración es chica (una sola pantalla real, "Clientes"), pero usa la
   misma estructura para que se sienta parte del mismo par de productos y no
   una herramienta improvisada aparte. */

function Marca() {
  return (
    <div className="flex items-center gap-3">
      <img src="/favicon.svg" alt="" className="h-7 w-7 object-contain" aria-hidden="true" />
      <div className="leading-tight">
        <p className="text-sm font-bold" style={{ fontFamily: "RidleyGrotesk-Bold", color: "#839ca6" }}>
          ÁREA CLIENTES
        </p>
        <p className="text-[11px] text-primary-foreground/50">Panel de administración</p>
      </div>
    </div>
  );
}

function Navegacion() {
  return (
    <nav className="flex flex-col gap-1">
      <span
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary/20 text-primary-foreground"
      >
        <Users size={18} className="flex-shrink-0" />
        Clientes
      </span>
    </nav>
  );
}

function FichaAdmin({ nombreAdmin, onLogout, compacto = false }: {
  nombreAdmin: string;
  onLogout: () => void;
  compacto?: boolean;
}) {
  return (
    <div className={cn("border-t border-primary-foreground/10 pt-4", compacto && "mt-4")}>
      <p className="text-sm font-semibold text-primary-foreground">{nombreAdmin}</p>
      <p className="text-xs text-primary-foreground/50 mb-3">Administración</p>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 text-xs font-medium text-primary-foreground/70 hover:text-accent transition-colors"
      >
        <LogOut size={14} />
        Cerrar sesión
      </button>
    </div>
  );
}

export default function AdminShell({ nombreAdmin, onLogout, children }: {
  nombreAdmin: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col justify-between bg-secondary px-4 py-6">
        <div>
          <Marca />
          <div className="mt-8">
            <Navegacion />
          </div>
        </div>
        <FichaAdmin nombreAdmin={nombreAdmin} onLogout={onLogout} />
      </aside>

      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-secondary px-4 py-3">
        <Marca />
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
          className="text-primary-foreground p-1"
        >
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden sticky top-[57px] z-40 overflow-hidden bg-secondary px-4 pb-4"
          >
            <Navegacion />
            <FichaAdmin nombreAdmin={nombreAdmin} onLogout={onLogout} compacto />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="container mx-auto max-w-5xl py-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
