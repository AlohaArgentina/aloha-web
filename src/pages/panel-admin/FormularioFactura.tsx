import { useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { claseAyuda, claseCampo, claseEtiqueta } from "@/components/ui/campos";
import { guardarFactura } from "@/datos/adminApi";
import type { Factura } from "@/pages/area-clientes/tipos";

export default function FormularioFactura({ clienteId, factura, onListo, onCancelar }: {
  clienteId: string;
  factura?: Factura;
  onListo: () => void;
  onCancelar: () => void;
}) {
  const [periodo, setPeriodo] = useState(factura?.periodo.slice(0, 7) ?? "");
  const [driveUrl, setDriveUrl] = useState(factura?.drive_url ?? "");
  const [monto, setMonto] = useState(factura?.monto != null ? String(factura.monto) : "");
  const [estado, setEstado] = useState<Factura["estado"]>(factura?.estado ?? "pendiente");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeGuardar = periodo !== "" && driveUrl.trim() !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!puedeGuardar) return;

    setEnviando(true);
    setError(null);
    try {
      await guardarFactura(clienteId, {
        periodo: `${periodo}-01`,
        drive_url: driveUrl.trim(),
        monto: monto.trim() === "" ? null : Number(monto),
        estado,
      }, factura?.id);
      onListo();
    } catch {
      setError("No pudimos guardar la factura. ¿Ya existe una cargada para ese mes?");
      setEnviando(false);
    }
  };

  return (
    <Tarjeta className="p-6 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-display font-bold text-foreground">
          {factura ? "Editar factura" : "Nueva factura"}
        </h3>
        <button type="button" onClick={onCancelar} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="factura-periodo" className={claseEtiqueta}>Mes</label>
            <input
              id="factura-periodo" type="month" value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              autoFocus className={claseCampo}
            />
          </div>
          <div>
            <label htmlFor="factura-url" className={claseEtiqueta}>Enlace de Drive</label>
            <input
              id="factura-url" type="url" value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/..." className={claseCampo}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="factura-monto" className={claseEtiqueta}>Monto (opcional)</label>
            <input
              id="factura-monto" type="number" min="0" step="0.01" value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className={claseCampo}
            />
          </div>
          <div>
            <label htmlFor="factura-estado" className={claseEtiqueta}>Estado</label>
            <select
              id="factura-estado" value={estado}
              onChange={(e) => setEstado(e.target.value as Factura["estado"])}
              className={claseCampo}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
            </select>
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
