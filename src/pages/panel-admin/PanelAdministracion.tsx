import { useState } from "react";
import { type Administrador } from "@/datos/adminApi";
import AdminShell from "@/pages/panel-admin/AdminShell";
import DetalleCliente from "@/pages/panel-admin/DetalleCliente";
import ListaClientes from "@/pages/panel-admin/ListaClientes";
import VistaPreviaCliente from "@/pages/panel-admin/VistaPreviaCliente";

type Vista =
  | { tipo: "lista" }
  | { tipo: "detalle"; clienteId: string }
  | { tipo: "vista-cliente"; clienteId: string };

/* El panel de administración en sí, una vez confirmado que quien está
   logueado tiene fila en "administradores". Lo usan tanto /panel-admin
   como, si el usuario resulta ser admin, /area-clientes. */
export default function PanelAdministracion({ admin, onLogout }: { admin: Administrador; onLogout: () => void }) {
  const [vista, setVista] = useState<Vista>({ tipo: "lista" });

  /* La vista previa del cliente trae su propio shell (PanelShell, el mismo
     que ve el cliente real): se muestra a pantalla completa, sin el
     AdminShell alrededor, para que no queden dos barras laterales. */
  if (vista.tipo === "vista-cliente") {
    return (
      <VistaPreviaCliente clienteId={vista.clienteId} onVolver={() => setVista({ tipo: "detalle", clienteId: vista.clienteId })} />
    );
  }

  return (
    <AdminShell nombreAdmin={admin.nombre} onLogout={onLogout}>
      {vista.tipo === "lista" && (
        <ListaClientes onAbrirCliente={(clienteId) => setVista({ tipo: "detalle", clienteId })} />
      )}
      {vista.tipo === "detalle" && (
        <DetalleCliente
          clienteId={vista.clienteId}
          onVolver={() => setVista({ tipo: "lista" })}
          onVerComoCliente={() => setVista({ tipo: "vista-cliente", clienteId: vista.clienteId })}
        />
      )}
    </AdminShell>
  );
}
