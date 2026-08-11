/**
 * Sincroniza archivos de Google Drive con las tablas reportes/facturas de
 * Supabase. Rodrigo solo deja el archivo en la carpeta correcta con el
 * nombre correcto — este script hace el resto. No necesita acceso a
 * Supabase ni tocar nada fuera de Drive.
 *
 * Este archivo vive en Google Apps Script (script.google.com), no en el
 * build del sitio. Se guarda acá como copia de respaldo/documentación.
 *
 * === Convención de carpetas (una vez por cliente) ===
 *   <Carpeta del cliente>/
 *     Reportes/
 *       2026-07.pdf
 *     Facturas/
 *       2026-07.pdf
 *
 * El nombre del archivo debe EMPEZAR con "AAAA-MM" (año-mes). El resto del
 * nombre y la extensión no importan: "2026-07 informe AVC.pdf" también
 * funciona. Si el archivo para ese cliente/mes/tipo ya está cargado, se
 * ignora (no pisa datos cargados a mano, como el estado de una factura).
 *
 * === Setup ===
 * 1. script.google.com → New project → pegar este código.
 * 2. Project Settings (ícono de engranaje) → Script properties → agregar:
 *      SUPABASE_URL               https://dnvtgdcpiohslahvlsud.supabase.co
 *      SUPABASE_SERVICE_ROLE_KEY  la "service_role" key de Supabase
 *                                 (Project Settings → API). Pegarla ACÁ
 *                                 directamente, nunca en un chat ni en este
 *                                 archivo: da acceso total a la base, sin
 *                                 las restricciones de RLS que protegen a
 *                                 cada cliente de ver los datos de otro.
 * 3. Completar el array CONFIG de abajo con el clienteId (columna "id" de
 *    la tabla clientes, no el auth_user_id) y el carpetaId de Drive de
 *    cada cliente (se copia de la URL: drive.google.com/drive/folders/ESTE_ID).
 * 4. Ejecutar sincronizarTodo() una vez a mano desde el editor para
 *    autorizar el acceso a Drive que pide Google.
 * 5. Triggers (ícono de reloj) → Add Trigger → función sincronizarTodo,
 *    time-driven, hour timer. Listo, corre solo desde ahí.
 */

var CONFIG = [
  { nombre: 'AVC',     clienteId: '52ef2392-8271-47d9-a533-3a6f50df6c82', carpetaId: 'PEGAR-CARPETA-ID-AVC' },
  { nombre: 'Airsat',  clienteId: '35d23b11-f823-4e28-adf3-3678c5b0b35d', carpetaId: 'PEGAR-CARPETA-ID-AIRSAT' },
  { nombre: 'Fiberty', clienteId: 'a0f9716c-7345-4cd5-8a2c-1775b769a24e', carpetaId: 'PEGAR-CARPETA-ID-FIBERTY' },
];

function sincronizarTodo() {
  CONFIG.forEach(function (cliente) {
    sincronizarSubcarpeta(cliente, 'Reportes', 'reportes');
    sincronizarSubcarpeta(cliente, 'Facturas', 'facturas');
  });
}

function sincronizarSubcarpeta(cliente, nombreSubcarpeta, tabla) {
  var carpetaCliente = DriveApp.getFolderById(cliente.carpetaId);
  var subcarpetas = carpetaCliente.getFoldersByName(nombreSubcarpeta);
  if (!subcarpetas.hasNext()) {
    Logger.log('No existe la carpeta "' + nombreSubcarpeta + '" para ' + cliente.nombre);
    return;
  }
  var subcarpeta = subcarpetas.next();
  var archivos = subcarpeta.getFiles();

  while (archivos.hasNext()) {
    var archivo = archivos.next();
    var periodo = extraerPeriodo(archivo.getName());
    if (!periodo) {
      Logger.log('Nombre sin período reconocible, se omite: ' + archivo.getName());
      continue;
    }
    insertarSiNoExiste(tabla, cliente.clienteId, periodo, archivo.getUrl());
  }
}

function extraerPeriodo(nombreArchivo) {
  var match = nombreArchivo.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  return match[1] + '-' + match[2] + '-01';
}

function insertarSiNoExiste(tabla, clienteId, periodo, driveUrl) {
  var url = getScriptProperty_('SUPABASE_URL') + '/rest/v1/' + tabla;
  var respuesta = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      apikey: getScriptProperty_('SUPABASE_SERVICE_ROLE_KEY'),
      Authorization: 'Bearer ' + getScriptProperty_('SUPABASE_SERVICE_ROLE_KEY'),
      Prefer: 'resolution=ignore-duplicates',
    },
    payload: JSON.stringify({
      cliente_id: clienteId,
      periodo: periodo,
      drive_url: driveUrl,
    }),
    muteHttpExceptions: true,
  });

  var codigo = respuesta.getResponseCode();
  if (codigo >= 200 && codigo < 300) {
    Logger.log(tabla + ' ' + periodo + ' (' + clienteId + '): ok');
  } else {
    Logger.log(tabla + ' ' + periodo + ' (' + clienteId + '): ERROR ' + codigo + ' ' + respuesta.getContentText());
  }
}

function getScriptProperty_(clave) {
  var valor = PropertiesService.getScriptProperties().getProperty(clave);
  if (!valor) throw new Error('Falta configurar "' + clave + '" en Project Settings → Script properties.');
  return valor;
}
