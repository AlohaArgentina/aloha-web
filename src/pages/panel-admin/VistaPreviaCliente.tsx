import { useCallback } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Cargando, ErrorDeCarga } from "@/components/ui/Tarjeta";
import { traerCliente, traerFacturas, traerReportes } from "@/datos/adminApi";
import { useDatos } from "@/hooks/useDatos";
import PanelCliente from "@/pages/area-clientes/PanelCliente";
import type { Cliente, Factura, Reporte } from "@/pages/area-clientes/tipos";

/* Le deja a coordinación ver exactamente el mismo panel que ve un cliente,
   sin necesitar su contraseña: los datos se traen con la sesión del admin
   (las políticas de RLS "administradores pueden ver todo" ya lo permiten,
   ver supabase/schema.sql), así que es de solo lectura y no exige tocar
   Authentication → Users para nada. */

interface DatosVista {
  cliente: Cliente | null;
  reportes: Reporte[];
  facturas: Factura[];
}

const VACIO: DatosVista = { cliente: null, reportes: [], facturas: [] };

function BannerVistaPrevia({ onVolver }: { onVolver: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-accent/10 border border-accent/30">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Eye size={16} className="text-accent flex-shrink-0" />
        <span>Estás viendo el panel tal como lo ve este cliente.</span>
      </div>
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline flex-shrink-0"
      >
        <ArrowLeft size={15} />
        Volver al panel de admin
      </button>
    </div>
  );
}

export default function VistaPreviaCliente({ clienteId, onVolver }: {
  clienteId: string;
  onVolver: () => void;
}) {
  const cargar = useCallback(async (): Promise<DatosVista> => {
    const [cliente, reportes, facturas] = await Promise.all([
      traerCliente(clienteId),
      traerReportes(clienteId),
      traerFacturas(clienteId),
    ]);
    return { cliente, reportes, facturas };
  }, [clienteId]);

  const { datos, cargando, error, recargar } = useDatos(cargar, VACIO);

  if (cargando || error || !datos.cliente) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl py-12">
          {cargando ? <Cargando filas={3} /> : <ErrorDeCarga onReintentar={recargar} />}
        </div>
      </div>
    );
  }

  return (
    <PanelCliente
      cliente={datos.cliente}
      reportes={datos.reportes}
      facturas={datos.facturas}
      onLogout={onVolver}
      etiquetaSalir="Volver al panel de admin"
      banner={<BannerVistaPrevia onVolver={onVolver} />}
    />
  );
}
