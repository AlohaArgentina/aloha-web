import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { claseCampo, claseEtiqueta } from "@/components/ui/campos";
import { actualizarCliente } from "@/datos/adminApi";
import type { Cliente } from "@/pages/area-clientes/tipos";

/* Edición de los datos de cuenta de un cliente: lo mismo que hasta ahora se
   tocaba fila por fila en el Table Editor de Supabase. El nombre y el resto
   de los campos son los que ve el cliente en la solapa "Información" de su
   propio panel. */

export default function FormularioCliente({ cliente, onGuardado }: {
  cliente: Cliente;
  onGuardado: () => void;
}) {
  const [nombre, setNombre] = useState(cliente.nombre);
  const [responsableCliente, setResponsableCliente] = useState(cliente.responsable_cliente ?? "");
  const [coordinadorAloha, setCoordinadorAloha] = useState(cliente.coordinador_aloha ?? "");
  const [contactoCoordinador, setContactoCoordinador] = useState(cliente.contacto_coordinador ?? "");
  const [horarioAtencion, setHorarioAtencion] = useState(cliente.horario_atencion ?? "");
  const [descripcionServicio, setDescripcionServicio] = useState(cliente.descripcion_servicio ?? "");
  const [fechaInicio, setFechaInicio] = useState(cliente.fecha_inicio ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const puedeGuardar = nombre.trim() !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!puedeGuardar) return;

    setEnviando(true);
    setError(null);
    setGuardado(false);
    try {
      await actualizarCliente(cliente.id, {
        nombre: nombre.trim(),
        responsable_cliente: responsableCliente.trim() || null,
        coordinador_aloha: coordinadorAloha.trim() || null,
        contacto_coordinador: contactoCoordinador.trim() || null,
        horario_atencion: horarioAtencion.trim() || null,
        descripcion_servicio: descripcionServicio.trim() || null,
        fecha_inicio: fechaInicio || null,
      });
      setGuardado(true);
      onGuardado();
    } catch {
      setError("No pudimos guardar los cambios. Reintentá en un momento.");
    }
    setEnviando(false);
  };

  return (
    <Tarjeta className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cliente-nombre" className={claseEtiqueta}>Empresa</label>
          <input
            id="cliente-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
            className={claseCampo}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cliente-responsable" className={claseEtiqueta}>
              Responsable del lado del cliente
            </label>
            <input
              id="cliente-responsable" value={responsableCliente}
              onChange={(e) => setResponsableCliente(e.target.value)}
              className={claseCampo}
            />
          </div>
          <div>
            <label htmlFor="cliente-coordinador" className={claseEtiqueta}>Coordinador asignado en Aloha</label>
            <input
              id="cliente-coordinador" value={coordinadorAloha}
              onChange={(e) => setCoordinadorAloha(e.target.value)}
              className={claseCampo}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cliente-contacto" className={claseEtiqueta}>Contacto directo del coordinador</label>
            <input
              id="cliente-contacto" value={contactoCoordinador}
              onChange={(e) => setContactoCoordinador(e.target.value)}
              className={claseCampo}
            />
          </div>
          <div>
            <label htmlFor="cliente-horario" className={claseEtiqueta}>Horario de atención</label>
            <input
              id="cliente-horario" value={horarioAtencion}
              onChange={(e) => setHorarioAtencion(e.target.value)}
              className={claseCampo}
            />
          </div>
        </div>

        <div>
          <label htmlFor="cliente-servicio" className={claseEtiqueta}>Servicio contratado</label>
          <textarea
            id="cliente-servicio" value={descripcionServicio} rows={2}
            onChange={(e) => setDescripcionServicio(e.target.value)}
            className={claseCampo}
          />
        </div>

        <div className="max-w-xs">
          <label htmlFor="cliente-fecha-inicio" className={claseEtiqueta}>Cliente desde</label>
          <input
            id="cliente-fecha-inicio" type="date" value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className={claseCampo}
          />
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <Boton type="submit" variante="principal" disabled={!puedeGuardar || enviando}>
            <Save size={16} />
            {enviando ? "Guardando..." : "Guardar cambios"}
          </Boton>
          {guardado && !enviando && (
            <span className="text-sm text-success font-medium">Guardado</span>
          )}
        </div>
      </form>
    </Tarjeta>
  );
}
