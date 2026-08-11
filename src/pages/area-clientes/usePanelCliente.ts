import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Cliente, Reporte, Factura } from "./tipos";

/* Trae los datos del cliente logueado. No hace falta filtrar por usuario acá:
   las políticas de Row Level Security en Supabase ya devuelven solo las filas
   de auth.uid() (ver supabase/schema.sql), así que un select sin filtro es
   automáticamente seguro.

   Solo busca datos cuando `habilitado` es true (la página ya confirmó que
   hay sesión): antes del login no tiene sentido pegarle a la API, y evita
   un parpadeo de "error" mientras todavía no se inició sesión. */

interface EstadoPanel {
  cliente: Cliente | null;
  reportes: Reporte[];
  facturas: Factura[];
  loading: boolean;
  error: boolean;
}

const ESTADO_INICIAL: EstadoPanel = { cliente: null, reportes: [], facturas: [], loading: true, error: false };

export function usePanelCliente(habilitado: boolean): EstadoPanel {
  const [estado, setEstado] = useState<EstadoPanel>(ESTADO_INICIAL);

  useEffect(() => {
    if (!habilitado) {
      setEstado(ESTADO_INICIAL);
      return;
    }

    let cancelado = false;
    if (!supabase) {
      setEstado((e) => ({ ...e, loading: false, error: true }));
      return;
    }

    (async () => {
      const [clienteRes, reportesRes, facturasRes] = await Promise.all([
        supabase.from("clientes").select("*").single(),
        supabase.from("reportes").select("*").order("periodo", { ascending: false }),
        supabase.from("facturas").select("*").order("periodo", { ascending: false }),
      ]);

      if (cancelado) return;

      const huboError = !!clienteRes.error || !!reportesRes.error || !!facturasRes.error;
      if (huboError) {
        console.error("Error cargando el panel de cliente:", clienteRes.error, reportesRes.error, facturasRes.error);
      }

      setEstado({
        cliente: (clienteRes.data as Cliente) ?? null,
        reportes: (reportesRes.data as Reporte[]) ?? [],
        facturas: (facturasRes.data as Factura[]) ?? [],
        loading: false,
        error: huboError,
      });
    })();

    return () => {
      cancelado = true;
    };
  }, [habilitado]);

  return estado;
}
