// ════════════════════════════════════════════════════════════════
// Code.gs — Backend Google Apps Script para Portal PyroShield
//
// Web App desplegada como endpoint POST. Recibe los pedidos
// confirmados desde el portal (pyroshield/app.js → confirmarPedido)
// y los registra en un Google Sheet.
// ════════════════════════════════════════════════════════════════

// ID del Google Sheet donde se almacenan los pedidos
var SHEET_ID = "1H3OQmaJtqVWHqVrI_hX2h8ZL_-a6RRobQww7IuGMhp0";

// Nombre de la pestaña y encabezados de la hoja de pedidos
var HOJA_PEDIDOS = "PEDIDOS_PYRO";
var ENCABEZADOS_PEDIDOS = [
  "id_pedido",
  "fecha",
  "ruc_dist",
  "nombre_dist",
  "items_json",
  "total",
  "estado",
  "fecha_registro"
];

// ════════════════════════════════════════════════════════════════
// ENTRADA: doPost — enruta por el campo "accion"
// ════════════════════════════════════════════════════════════════
function doPost(e) {
  var resultado;
  try {
    var datos = JSON.parse(e.postData.contents);
    switch (datos.accion) {
      case "guardarPedidoPyro":
        resultado = recibirPedidoPyro(datos);
        break;
      default:
        resultado = { ok: false, error: "Acción no reconocida: " + datos.accion };
    }
  } catch (err) {
    resultado = { ok: false, error: String(err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

// ════════════════════════════════════════════════════════════════
// recibirPedidoPyro — registra un pedido en la hoja PEDIDOS_PYRO
//
// datos: {accion, id_pedido, fecha, ruc_dist, nombre_dist,
//         items_json, total, estado}
// ════════════════════════════════════════════════════════════════
function recibirPedidoPyro(datos) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_PEDIDOS);

  // Crear la pestaña con encabezados si no existe
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_PEDIDOS);
    hoja.appendRow(ENCABEZADOS_PEDIDOS);
  }

  // Agregar la fila con los datos recibidos + fecha de registro actual
  hoja.appendRow([
    datos.id_pedido || "",
    datos.fecha || "",
    datos.ruc_dist || "",
    datos.nombre_dist || "",
    datos.items_json || "",
    datos.total != null ? datos.total : "",
    datos.estado || "",
    new Date()
  ]);

  return { ok: true };
}
