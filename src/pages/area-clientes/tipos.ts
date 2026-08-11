export interface Cliente {
  id: string;
  nombre: string;
  responsable_cliente: string | null;
  coordinador_aloha: string | null;
  contacto_coordinador: string | null;
  horario_atencion: string | null;
  descripcion_servicio: string | null;
  fecha_inicio: string | null;
}

export interface Reporte {
  id: string;
  periodo: string; // fecha del primer día del mes, ej. "2026-07-01"
  drive_url: string;
}

export interface Factura {
  id: string;
  periodo: string;
  drive_url: string;
  monto: number | null;
  estado: "pendiente" | "pagada";
}
