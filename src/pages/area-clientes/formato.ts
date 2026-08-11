/* Formatea un período (columna date de Postgres, ej. "2026-07-01") como
   "Julio 2026". Se agrega la hora local explícita al parsear: sin eso,
   new Date("2026-07-01") se interpreta como medianoche UTC, que en
   Argentina (UTC-3) cae en el día anterior y puede mostrar el mes
   equivocado. */
export function formatearPeriodo(periodoISO: string): string {
  const fecha = new Date(`${periodoISO}T00:00:00`);
  const texto = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
