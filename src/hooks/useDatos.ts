import { useCallback, useEffect, useState } from "react";

/* Carga de datos con los tres estados que toda pantalla de panel necesita
   (cargando / error / datos) y un `recargar` para después de una acción.
   Mismo hook que usa aloha-desk. Es deliberadamente chico: sin caché ni
   reintentos, alcanza para las pantallas de administración de clientes.

   `cargar` tiene que venir memorizada con useCallback: es lo que dispara la
   consulta al cambiar. */

export interface EstadoDatos<T> {
  datos: T;
  cargando: boolean;
  error: boolean;
  recargar: () => void;
}

export function useDatos<T>(cargar: () => Promise<T>, inicial: T): EstadoDatos<T> {
  const [datos, setDatos] = useState<T>(inicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(false);

    cargar()
      .then((resultado) => {
        if (!cancelado) setDatos(resultado);
      })
      .catch(() => {
        if (!cancelado) setError(true);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cargar, version]);

  return { datos, cargando, error, recargar };
}
