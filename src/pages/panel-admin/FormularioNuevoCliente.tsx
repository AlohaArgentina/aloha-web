import { useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { claseAyuda, claseCampo, claseEtiqueta } from "@/components/ui/campos";
import { crearCliente } from "@/datos/adminApi";

/* Alta de un cliente nuevo. El login se crea primero a mano en Supabase
   (Authentication → Users, con una contraseña provisoria que se comparte por
   fuera), igual que hasta ahora; acá solo se vincula ese email con su fila
   de datos en "clientes". Si el email no tiene un login creado todavía, el
   backend lo rechaza con un mensaje claro en vez de crear una fila huérfana. */

export default function FormularioNuevoCliente({ onCreado, onCancelar }: {
  onCreado: () => void;
  onCancelar: () => void;
}) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeGuardar = email.trim() !== "" && nombre.trim() !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!puedeGuardar) return;

    setEnviando(true);
    setError(null);
    try {
      await crearCliente(email.trim(), nombre.trim());
      onCreado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear el cliente.");
      setEnviando(false);
    }
  };

  return (
    <Tarjeta className="p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-display font-bold text-foreground">Nuevo cliente</h2>
        <button type="button" onClick={onCancelar} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nuevo-cliente-email" className={claseEtiqueta}>Email del login</label>
          <input
            id="nuevo-cliente-email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@empresa.com" autoFocus className={claseCampo}
          />
          <p className={claseAyuda}>
            Tiene que ser el email de un usuario ya creado en Authentication → Users de Supabase.
          </p>
        </div>

        <div>
          <label htmlFor="nuevo-cliente-nombre" className={claseEtiqueta}>Empresa</label>
          <input
            id="nuevo-cliente-nombre" value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la empresa" className={claseCampo}
          />
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Boton type="submit" variante="principal" disabled={!puedeGuardar || enviando}>
            <Save size={16} />
            {enviando ? "Creando..." : "Crear cliente"}
          </Boton>
          <Boton type="button" variante="fantasma" onClick={onCancelar}>Cancelar</Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
