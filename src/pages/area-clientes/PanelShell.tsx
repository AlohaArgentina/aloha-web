import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, FileText, LogOut, Menu, Receipt, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tab } from "./tipos";

/* Estructura del panel de cliente, calcada de AppShell.tsx del panel interno
   (aloha-desk): barra lateral oscura fija en escritorio, cajón deslizable en
   mobile. Es deliberadamente la misma estructura visual — mismos tokens de
   color, misma tipografía Ridley Grotesk — para que el cliente sienta que
   entra al mismo producto que atiende su cuenta, no a una herramienta aparte.

   A diferencia de AppShell, acá no hay rutas anidadas: las tres secciones son
   estado (tab), no URLs, porque el panel de cliente nunca tuvo sub-rutas y no
   hay necesidad real de que /area-clientes/reportes sea un link compartible. */

interface ItemNav {
  tab: Tab;
  etiqueta: string;
  icono: LucideIcon;
}

const ITEMS: ItemNav[] = [
  { tab: "info",        etiqueta: "Información",  icono: Building2 },
  { tab: "reportes",    etiqueta: "Reportes",     icono: FileText },
  { tab: "facturacion", etiqueta: "Facturación",  icono: Receipt },
];

function Navegacion({ tab, onTabChange, onNavegar }: {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onNavegar?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map(({ tab: itemTab, etiqueta, icono: Icono }) => (
        <button
          key={itemTab}
          type="button"
          onClick={() => { onTabChange(itemTab); onNavegar?.(); }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
            itemTab === tab
              ? "bg-primary/20 text-primary-foreground"
              : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
          )}
        >
          <Icono size={18} className="flex-shrink-0" />
          <span>{etiqueta}</span>
        </button>
      ))}
    </nav>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-3">
      <img src="/favicon.svg" alt="" className="h-7 w-7 object-contain" aria-hidden="true" />
      <div className="leading-tight">
        <p className="text-sm font-bold" style={{ fontFamily: "RidleyGrotesk-Bold", color: "#839ca6" }}>
          ÁREA CLIENTES
        </p>
        <p className="text-[11px] text-primary-foreground/50">Aloha Argentina</p>
      </div>
    </div>
  );
}

function FichaCliente({ nombreCliente, onLogout, etiquetaSalir, compacto = false }: {
  nombreCliente: string;
  onLogout: () => void;
  etiquetaSalir: string;
  compacto?: boolean;
}) {
  return (
    <div className={cn("border-t border-primary-foreground/10 pt-4", compacto && "mt-4")}>
      <p className="text-sm font-semibold text-primary-foreground">{nombreCliente}</p>
      <p className="text-xs text-primary-foreground/50 mb-3">Panel de cliente</p>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 text-xs font-medium text-primary-foreground/70 hover:text-accent transition-colors"
      >
        <LogOut size={14} />
        {etiquetaSalir}
      </button>
    </div>
  );
}

export default function PanelShell({ nombreCliente, tab, onTabChange, onLogout, etiquetaSalir = "Cerrar sesión", banner, children }: {
  nombreCliente: string;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogout: () => void;
  etiquetaSalir?: string;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Lateral fija en escritorio */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col justify-between bg-secondary px-4 py-6">
        <div>
          <Marca />
          <div className="mt-8">
            <Navegacion tab={tab} onTabChange={onTabChange} />
          </div>
        </div>
        <FichaCliente nombreCliente={nombreCliente} onLogout={onLogout} etiquetaSalir={etiquetaSalir} />
      </aside>

      {/* Barra superior en mobile */}
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
            <Navegacion tab={tab} onTabChange={onTabChange} onNavegar={() => setAbierto(false)} />
            <FichaCliente nombreCliente={nombreCliente} onLogout={onLogout} etiquetaSalir={etiquetaSalir} compacto />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="container mx-auto max-w-5xl py-8 lg:py-12">
          {banner}
          {children}
        </div>
      </main>
    </div>
  );
}
