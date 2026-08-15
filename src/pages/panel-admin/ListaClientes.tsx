import { useCallback, useState } from "react";
import { Building2, ChevronRight, Plus, Search } from "lucide-react";
import EncabezadoPagina from "@/components/layout/EncabezadoPagina";
import Boton from "@/components/ui/Boton";
import { Cargando, ErrorDeCarga, EstadoVacio, Tarjeta } from "@/components/ui/Tarjeta";
import { claseCampo } from "@/components/ui/campos";
import { traerClientes } from "@/datos/adminApi";
import { useDatos } from "@/hooks/useDatos";
import FormularioNuevoCliente from "./FormularioNuevoCliente";
import type { Cliente } from "@/pages/area-clientes/tipos";

export default function ListaClientes({ onAbrirCliente }: { onAbrirCliente: (id: string) => void }) {
  const [busqueda, setBusqueda] = useState("");
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(() => traerClientes(), []);
  const { datos: clientes, cargando, error, recargar } = useDatos<Cliente[]>(cargar, []);

  const termino = busqueda.trim().toLowerCase();
  const visibles = termino === ""
    ? clientes
    : clientes.filter((c) => `${c.nombre} ${c.responsable_cliente ?? ""}`.toLowerCase().includes(termino));

  return (
    <div>
      <EncabezadoPagina
        titulo="Clientes"
        descripcion="Cuentas del área clientes: sus datos y la documentación mensual que ven en su panel."
        accion={!creando ? (
          <Boton variante="principal" onClick={() => setCreando(true)}>
            <Plus size={16} />
            Nuevo cliente
          </Boton>
        ) : undefined}
      />

      {creando && (
        <FormularioNuevoCliente
          onCreado={() => { setCreando(false); recargar(); }}
          onCancelar={() => setCreando(false)}
        />
      )}

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por empresa o responsable"
          aria-label="Buscar clientes"
          className={`${claseCampo} pl-11`}
        />
      </div>

      {cargando && <Cargando filas={3} />}
      {!cargando && error && <ErrorDeCarga onReintentar={recargar} />}

      {!cargando && !error && visibles.length === 0 && (
        <EstadoVacio
          icono={Building2}
          titulo={termino === "" ? "Todavía no hay clientes cargados" : "Sin resultados"}
          detalle={termino === "" ? "Creá el primero con \"Nuevo cliente\"." : "Probá con otro término de búsqueda."}
        />
      )}

      {!cargando && !error && visibles.length > 0 && (
        <Tarjeta className="px-6">
          {visibles.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onAbrirCliente(c.id)}
              className="w-full flex items-center justify-between gap-3 py-4 border-b border-border last:border-0 text-left group"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {c.responsable_cliente || "Sin responsable definido"}
                </p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </Tarjeta>
      )}
    </div>
  );
}
