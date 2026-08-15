import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Píldora de estado (ej. estado de una factura). Los tonos usan los mismos
   tokens que el resto del sitio, con fondo al 12% para que no compitan con
   los botones de acción. */

export type Tono = "neutral" | "primario" | "acento" | "exito" | "alerta" | "error";

const TONOS: Record<Tono, string> = {
  neutral:  "bg-muted text-muted-foreground",
  primario: "bg-primary/15 text-primary",
  acento:   "bg-accent/15 text-accent",
  exito:    "bg-success/15 text-success",
  alerta:   "bg-warning/15 text-warning",
  error:    "bg-destructive/15 text-destructive",
};

export default function Etiqueta({
  children, tono = "neutral", className, style,
}: {
  children: ReactNode;
  tono?: Tono;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
