import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* Superficie base de los paneles internos (área clientes / admin): mismo
   card blanco con borde suave que ya usa el resto de aloha-web. */
export function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl shadow-sm", className)}>
      {children}
    </div>
  );
}

/* Estado vacío: siempre dice qué falta y, cuando corresponde, cómo llenarlo. */
export function EstadoVacio({
  icono: Icono, titulo, detalle, children,
}: {
  icono: LucideIcon;
  titulo: string;
  detalle?: string;
  children?: ReactNode;
}) {
  return (
    <Tarjeta className="p-10 text-center">
      <Icono className="text-muted-foreground mx-auto mb-3" size={28} />
      <p className="text-foreground font-medium">{titulo}</p>
      {detalle && <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">{detalle}</p>}
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </Tarjeta>
  );
}

/* Bloques grises con la forma aproximada del contenido real: la pantalla no
   salta cuando llegan los datos. */
export function Cargando({ filas = 3 }: { filas?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export function ErrorDeCarga({ onReintentar }: { onReintentar: () => void }) {
  return (
    <Tarjeta className="p-8 text-center">
      <p className="text-muted-foreground text-sm">
        No pudimos cargar esta sección. Puede ser un problema de conexión.
      </p>
      <button
        type="button"
        onClick={onReintentar}
        className="mt-4 text-sm font-semibold text-primary hover:text-accent transition-colors"
      >
        Reintentar
      </button>
    </Tarjeta>
  );
}
