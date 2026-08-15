import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* Botones del panel (área clientes / admin). El acento naranja se reserva
   para la acción principal de cada pantalla, igual que el resto de
   aloha-web: si todo es naranja, no se distingue qué es lo importante. */

type Variante = "principal" | "secundario" | "fantasma" | "peligro";

const VARIANTES: Record<Variante, string> = {
  principal:  "bg-accent text-accent-foreground hover:bg-accent/90",
  secundario: "border border-border bg-card text-foreground hover:bg-muted",
  fantasma:   "text-muted-foreground hover:bg-muted hover:text-foreground",
  peligro:    "border border-destructive/40 text-destructive hover:bg-destructive/10",
};

export default function Boton({
  variante = "secundario", className, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        VARIANTES[variante],
        className,
      )}
    />
  );
}
