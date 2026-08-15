import { useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { claseAyuda, claseCampo, claseEtiqueta } from "@/components/ui/campos";
import { guardarReporte } from "@/datos/adminApi";
import type { Reporte } from "@/pages/area-clientes/tipos";

/* Alta y edición de un reporte mensual. El archivo sigue viviendo en Drive:
   acá se guarda el link de "Compartir", igual que en la documentación interna
   de aloha-desk. El período se elige como mes/año y se guarda como el primer
   día de ese mes (columna date en Postgres), que es el formato que ya usa la
   tabla "reportes". */

export default function FormularioReporte({ clienteId, reporte, onListo, onCancelar }: {
  clienteId: string;
  reporte?: Reporte;
  onListo: () => void;
  onCancelar: () => void;
}) {
  const [periodo, setPeriodo] = useState(reporte?.periodo.slice(0, 7) ?? "");
  const [driveUrl, setDriveUrl] = useState(reporte?.drive_url ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeGuardar = periodo !== "" && driveUrl.trim() !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!puedeGuardar) return;

    setEnviando(true);
    setError(null);
    try {
      await guardarReporte(clienteId, { periodo: `${periodo}-01`, drive_url: driveUrl.trim() }, reporte?.id);
      onListo();
    } catch {
      setError("No pudimos guardar el reporte. ¿Ya existe uno cargado para ese mes?");
      setEnviando(false);
    }
  };

  return (
    <Tarjeta className="p-6 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-display font-bold text-foreground">
          {reporte ? "Editar reporte" : "Nuevo reporte"}
        </h3>
        <button type="button" onClick={onCancelar} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reporte-periodo" className={claseEtiqueta}>Mes</label>
            <input
              id="reporte-periodo" type="month" value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              autoFocus className={claseCampo}
            />
          </div>
          <div>
            <label htmlFor="reporte-url" className={claseEtiqueta}>Enlace de Drive</label>
            <input
              id="reporte-url" type="url" value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/..." className={claseCampo}
            />
          </div>
        </div>
        <p className={claseAyuda}>
          Pegá el link de "Compartir" de Drive. Revisá que esté compartido con el cliente: el panel no cambia los permisos del archivo.
        </p>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Boton type="submit" variante="principal" disabled={!puedeGuardar || enviando}>
            <Save size={16} />
            {enviando ? "Guardando..." : "Guardar"}
          </Boton>
          <Boton type="button" variante="fantasma" onClick={onCancelar}>Cancelar</Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
