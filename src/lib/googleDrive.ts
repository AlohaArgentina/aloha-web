/* Convierte el link de "Compartir" que da Google Drive en las dos URLs que
   necesita el panel: una para previsualizar el archivo embebido (iframe,
   sin salir del sitio) y otra para descargarlo directo. Ambas se derivan
   del mismo ID de archivo, así que quien carga un reporte o factura cada
   mes solo tiene que pegar el link tal cual Drive lo da — nada de extraer
   IDs a mano. */

const PATRON_ID_EN_RUTA = /\/d\/([a-zA-Z0-9_-]{10,})/;

export function extraerIdDrive(urlCompartido: string): string | null {
  const enRuta = urlCompartido.match(PATRON_ID_EN_RUTA);
  if (enRuta) return enRuta[1];

  try {
    const id = new URL(urlCompartido).searchParams.get("id");
    if (id) return id;
  } catch {
    // No es una URL válida: no hay ID que extraer.
  }
  return null;
}

export function urlPreviewDrive(urlCompartido: string): string | null {
  const id = extraerIdDrive(urlCompartido);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

export function urlDescargaDrive(urlCompartido: string): string | null {
  const id = extraerIdDrive(urlCompartido);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : null;
}
