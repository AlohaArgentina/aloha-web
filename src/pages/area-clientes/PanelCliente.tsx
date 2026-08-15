import { useState } from "react";
import { Building2, User, Users, Clock, FileText as FileTextIcon, Calendar, Download, CheckCircle2, Circle } from "lucide-react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import { formatearPeriodo } from "./formato";
import { urlPreviewDrive, urlDescargaDrive } from "@/lib/googleDrive";
import PanelShell from "./PanelShell";
import type { Cliente, Reporte, Factura, Tab } from "./tipos";

interface DocumentoBase {
  id: string;
  periodo: string;
  drive_url: string;
}

/* Lista de períodos a la izquierda (mes a mes) + previsualización del
   elegido a la derecha, embebida con un iframe de Drive: el visitante nunca
   navega a drive.google.com, todo pasa dentro del panel. El botón de
   descarga usa la URL de descarga directa de Drive, así que tampoco abre
   la vista normal de Drive. */
function DocumentosMensuales<T extends DocumentoBase>({
  titulo, items, vacioMensaje, renderExtra,
}: {
  titulo: string;
  items: T[];
  vacioMensaje: string;
  renderExtra?: (item: T) => React.ReactNode;
}) {
  const [seleccionadoId, setSeleccionadoId] = useState(items[0]?.id ?? null);
  const seleccionado = items.find((item) => item.id === seleccionadoId) ?? null;

  if (items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <FileTextIcon className="text-muted-foreground mx-auto mb-3" size={28} />
        <p className="text-muted-foreground text-sm">{vacioMensaje}</p>
      </div>
    );
  }

  const urlPreview = seleccionado ? urlPreviewDrive(seleccionado.drive_url) : null;
  const urlDescarga = seleccionado ? urlDescargaDrive(seleccionado.drive_url) : null;

  return (
    <div>
      <h3 className="text-lg font-display font-bold text-foreground mb-4">{titulo}</h3>
      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSeleccionadoId(item.id)}
              className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-left whitespace-nowrap transition-colors
                ${item.id === seleccionadoId
                  ? "bg-primary/15 border border-primary/40 text-primary"
                  : "border border-border text-muted-foreground hover:border-primary/30"}`}
            >
              <span className="flex items-center gap-2"><Calendar size={14} />{formatearPeriodo(item.periodo)}</span>
              {renderExtra?.(item)}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {urlPreview ? (
            <>
              <iframe
                src={urlPreview}
                title={`Documento de ${seleccionado ? formatearPeriodo(seleccionado.periodo) : ""}`}
                className="w-full aspect-[3/4] md:aspect-video"
                referrerPolicy="no-referrer"
              />
              {urlDescarga && (
                <div className="p-4 border-t border-border">
                  <a
                    href={urlDescarga}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors"
                  >
                    <Download size={16} />
                    Descargar
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No pudimos generar la vista previa de este documento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EstadoFactura({ estado }: { estado: Factura["estado"] }) {
  const pagada = estado === "pagada";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${pagada ? "text-primary" : "text-accent"}`}>
      {pagada ? <CheckCircle2 size={12} /> : <Circle size={12} />}
      {pagada ? "Pagada" : "Pendiente"}
    </span>
  );
}

function FilaInfo({ icon: Icon, label, valor }: { icon: typeof Building2; label: string; valor: string | null }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="text-primary" size={16} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-foreground">{valor?.trim() || "Sin definir"}</p>
      </div>
    </div>
  );
}

function InfoGeneral({ cliente }: { cliente: Cliente }) {
  return (
    <div className="bg-card border border-border rounded-xl px-6">
      <FilaInfo icon={Building2} label="Empresa" valor={cliente.nombre} />
      <FilaInfo icon={User} label="Responsable del lado del cliente" valor={cliente.responsable_cliente} />
      <FilaInfo icon={Users} label="Coordinador asignado en Aloha" valor={cliente.coordinador_aloha} />
      <FilaInfo icon={FileTextIcon} label="Contacto directo del coordinador" valor={cliente.contacto_coordinador} />
      <FilaInfo icon={Clock} label="Horario de atención" valor={cliente.horario_atencion} />
      <FilaInfo icon={FileTextIcon} label="Servicio contratado" valor={cliente.descripcion_servicio} />
      {cliente.fecha_inicio && (
        <FilaInfo
          icon={Calendar}
          label="Cliente desde"
          valor={new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(new Date(`${cliente.fecha_inicio}T00:00:00`))}
        />
      )}
    </div>
  );
}

const DESCRIPCIONES: Record<Tab, string> = {
  info: "Los datos de tu cuenta con Aloha Argentina.",
  reportes: "Reportes mensuales del servicio.",
  facturacion: "Facturas y su estado de pago.",
};

export default function PanelCliente({ cliente, reportes, facturas, onLogout }: {
  cliente: Cliente;
  reportes: Reporte[];
  facturas: Factura[];
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<Tab>("info");

  return (
    <PanelShell nombreCliente={cliente.nombre} tab={tab} onTabChange={setTab} onLogout={onLogout}>
      <EncabezadoPagina titulo={cliente.nombre} descripcion={DESCRIPCIONES[tab]} />

      {tab === "info" && <InfoGeneral cliente={cliente} />}

      {tab === "reportes" && (
        <DocumentosMensuales
          titulo="Reportes mensuales"
          items={reportes}
          vacioMensaje="Todavía no hay reportes cargados para tu cuenta."
        />
      )}

      {tab === "facturacion" && (
        <DocumentosMensuales
          titulo="Facturación"
          items={facturas}
          vacioMensaje="Todavía no hay facturas cargadas para tu cuenta."
          renderExtra={(factura) => <EstadoFactura estado={factura.estado} />}
        />
      )}
    </PanelShell>
  );
}
