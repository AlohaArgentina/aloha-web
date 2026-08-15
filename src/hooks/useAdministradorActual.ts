import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { traerAdministradorActual, type Administrador } from "@/datos/adminApi";

/* Comparte la misma cuenta de Supabase Auth que el login de cliente: no hay
   forma de saber si quien acaba de loguearse es coordinación o un cliente
   sin primero preguntarle a la tabla "administradores" (ver
   supabase/schema.sql). Lo usan tanto /panel-admin como /area-clientes,
   que ahora deriva a uno u otro panel según lo que responda esto. */

interface EstadoAdmin {
  admin: Administrador | null;
  cargando: boolean;
  error: boolean;
}

const ESTADO_INICIAL: EstadoAdmin = { admin: null, cargando: true, error: false };

export function useAdministradorActual(habilitado: boolean): EstadoAdmin {
  const [estado, setEstado] = useState<EstadoAdmin>(ESTADO_INICIAL);

  useEffect(() => {
    if (!habilitado) {
      setEstado(ESTADO_INICIAL);
      return;
    }

    let cancelado = false;
    if (!supabase) {
      setEstado({ admin: null, cargando: false, error: true });
      return;
    }

    setEstado((e) => ({ ...e, cargando: true, error: false }));
    traerAdministradorActual()
      .then((admin) => {
        if (!cancelado) setEstado({ admin, cargando: false, error: false });
      })
      .catch(() => {
        if (!cancelado) setEstado({ admin: null, cargando: false, error: true });
      });

    return () => {
      cancelado = true;
    };
  }, [habilitado]);

  return estado;
}
