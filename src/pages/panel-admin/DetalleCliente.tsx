import { useCallback, useState } from "react";
import { ArrowLeft, FileText, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import Boton from "@/components/ui/Boton";
import Etiqueta from "@/components/ui/Etiqueta";
import { Cargando, ErrorDeCarga, EstadoVacio, Tarjeta } from "@/components/ui/Tarjeta";
import { eliminarFactura, eliminarReporte, traerCliente, traerFacturas, traerReportes } from "@/datos/adminApi";
import { useDatos } from "@/hooks/useDatos";
import { formatearPeriodo } from "@/pages/area-clientes/formato";
import FormularioCliente from "./FormularioCliente";
import FormularioFactura from "./FormularioFactura";
import FormularioReporte from "./FormularioReporte";
import type { Factura, Reporte } from "@/pages/area-clientes/tipos";

/* Ficha de un cliente: sus datos de cuenta (lo que ve en la solapa
   "Información" de su propio panel) y la documentación que se le va cargando
   mes a mes (reportes y facturas, siempre como link de Drive — el archivo
   nunca se sube acá, sigue viviendo en Drive). */

function FilaReporte({ reporte, onEditar, onEliminar, ocupado }: {
  reporte: Reporte;
  onEditar: () => void;
  onEliminar: () => void;
  ocupado: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
      <a
        href={reporte.drive_url} target="_blank" rel="noopener noreferrer"
        className="font-medium text-foreground hover:text-primary transition-colors"
      >
        {formatearPeriodo(reporte.periodo)}
      </a>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onEditar} className="text-muted-foreground hover:text-foreground transition-colors" aria-label={`Editar reporte de ${formatearPeriodo(reporte.periodo)}`}>
          <Pencil size={15} />
        </button>
        <button
          type="button" onClick={onEliminar} disabled={ocupado}
          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-60"
          aria-label={`Eliminar reporte de ${formatearPeriodo(reporte.periodo)}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function FilaFactura({ factura, onEditar, onEliminar, ocupado }: {
  factura: Factura;
  onEditar: () => void;
  onEliminar: () => void;
  ocupado: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <a
          href={factura.drive_url} target="_blank" rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          {formatearPeriodo(factura.periodo)}
        </a>
        <Etiqueta tono={factura.estado === "pagada" ? "exito" : "alerta"}>
          {factura.estado === "pagada" ? "Pagada" : "Pendiente"}
        </Etiqueta>
        {factura.monto != null && (
          <span className="text-sm text-muted-foreground">
            {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(factura.monto)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onEditar} className="text-muted-foreground hover:text-foreground transition-colors" aria-label={`Editar factura de ${formatearPeriodo(factura.periodo)}`}>
          <Pencil size={15} />
        </button>
        <button
          type="button" onClick={onEliminar} disabled={ocupado}
          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-60"
          aria-label={`Eliminar factura de ${formatearPeriodo(factura.periodo)}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function SeccionReportes({ clienteId }: { clienteId: string }) {
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Reporte | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);

  const cargar = useCallback(() => traerReportes(clienteId), [clienteId]);
  const { datos: reportes, cargando, error, recargar } = useDatos<Reporte[]>(cargar, []);

  const formularioAbierto = creando || editando !== null;
  const cerrarFormulario = () => { setCreando(false); setEditando(null); };

  const borrar = async (reporte: Reporte) => {
    setBorrando(reporte.id);
    try {
      await eliminarReporte(reporte.id);
      recargar();
    } finally {
      setBorrando(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-foreground">Reportes mensuales</h2>
        {!formularioAbierto && (
          <Boton variante="secundario" onClick={() => setCreando(true)}>
            <Plus size={16} />
            Nuevo reporte
          </Boton>
        )}
      </div>

      {formularioAbierto && (
        <FormularioReporte
          key={editando?.id ?? "nuevo-reporte"}
          clienteId={clienteId}
          reporte={editando ?? undefined}
          onListo={() => { cerrarFormulario(); recargar(); }}
          onCancelar={cerrarFormulario}
        />
      )}

      {cargando && <Cargando filas={1} />}
      {!cargando && error && <ErrorDeCarga onReintentar={recargar} />}
      {!cargando && !error && reportes.length === 0 && (
        <EstadoVacio icono={FileText} titulo="Todavía no hay reportes cargados" />
      )}
      {!cargando && !error && reportes.length > 0 && (
        <Tarjeta className="px-5">
          {reportes.map((r) => (
            <FilaReporte
              key={r.id} reporte={r} ocupado={borrando === r.id}
              onEditar={() => { setCreando(false); setEditando(r); }}
              onEliminar={() => borrar(r)}
            />
          ))}
        </Tarjeta>
      )}
    </div>
  );
}

function SeccionFacturas({ clienteId }: { clienteId: string }) {
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Factura | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);

  const cargar = useCallback(() => traerFacturas(clienteId), [clienteId]);
  const { datos: facturas, cargando, error, recargar } = useDatos<Factura[]>(cargar, []);

  const formularioAbierto = creando || editando !== null;
  const cerrarFormulario = () => { setCreando(false); setEditando(null); };

  const borrar = async (factura: Factura) => {
    setBorrando(factura.id);
    try {
      await eliminarFactura(factura.id);
      recargar();
    } finally {
      setBorrando(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-foreground">Facturación</h2>
        {!formularioAbierto && (
          <Boton variante="secundario" onClick={() => setCreando(true)}>
            <Plus size={16} />
            Nueva factura
          </Boton>
        )}
      </div>

      {formularioAbierto && (
        <FormularioFactura
          key={editando?.id ?? "nueva-factura"}
          clienteId={clienteId}
          factura={editando ?? undefined}
          onListo={() => { cerrarFormulario(); recargar(); }}
          onCancelar={cerrarFormulario}
        />
      )}

      {cargando && <Cargando filas={1} />}
      {!cargando && error && <ErrorDeCarga onReintentar={recargar} />}
      {!cargando && !error && facturas.length === 0 && (
        <EstadoVacio icono={Receipt} titulo="Todavía no hay facturas cargadas" />
      )}
      {!cargando && !error && facturas.length > 0 && (
        <Tarjeta className="px-5">
          {facturas.map((f) => (
            <FilaFactura
              key={f.id} factura={f} ocupado={borrando === f.id}
              onEditar={() => { setCreando(false); setEditando(f); }}
              onEliminar={() => borrar(f)}
            />
          ))}
        </Tarjeta>
      )}
    </div>
  );
}

export default function DetalleCliente({ clienteId, onVolver }: {
  clienteId: string;
  onVolver: () => void;
}) {
  const cargar = useCallback(() => traerCliente(clienteId), [clienteId]);
  const { datos: cliente, cargando, error, recargar } = useDatos(cargar, null);

  return (
    <div>
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Volver a clientes
      </button>

      {cargando && <Cargando filas={3} />}
      {!cargando && (error || !cliente) && <ErrorDeCarga onReintentar={recargar} />}

      {!cargando && cliente && (
        <>
          <EncabezadoPagina titulo={cliente.nombre} descripcion="Datos de la cuenta y documentación mensual." />

          <div className="space-y-10">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground mb-4">Datos de la cuenta</h2>
              <FormularioCliente cliente={cliente} onGuardado={recargar} />
            </div>

            <SeccionReportes clienteId={clienteId} />
            <SeccionFacturas clienteId={clienteId} />
          </div>
        </>
      )}
    </div>
  );
}
