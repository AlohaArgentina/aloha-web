import type { ReactNode } from "react";

/* Encabezado común de cada pantalla de panel: título, bajada y, a la
   derecha, la acción principal. Mismo patrón que usa aloha-desk. */
export default function EncabezadoPagina({
  titulo, descripcion, accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{titulo}</h1>
        {descripcion && <p className="text-muted-foreground mt-1.5 max-w-2xl">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}
