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
      case "obtenerPedidosPyro":
        resultado = obtenerPedidosPyro();
        break;
      case "actualizarEstadoPedidoPyro":
        resultado = actualizarEstadoPedidoPyro(datos);
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

// ════════════════════════════════════════════════════════════
// obtenerPedidosPyro — retorna todas las filas de PEDIDOS_PYRO
// ════════════════════════════════════════════════════════════
function obtenerPedidosPyro() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_PEDIDOS);
  if (!hoja) return { ok: true, pedidos: [] };

  var datos = hoja.getDataRange().getValues();
  if (datos.length <= 1) return { ok: true, pedidos: [] };

  var headers = datos[0];
  var pedidos = [];
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = fila[j];
      if (val instanceof Date) {
        obj[headers[j]] = Utilities.formatDate(val, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
      } else {
        obj[headers[j]] = val;
      }
    }
    pedidos.push(obj);
  }
  return { ok: true, pedidos: pedidos };
}

// ════════════════════════════════════════════════════════════
// actualizarEstadoPedidoPyro — cambia el estado de un pedido
// (p.ej. "pendiente" → "entregado") al completar la entrega en
// el recorrido de campo. datos: {id_pedido, estado}
// ════════════════════════════════════════════════════════════
function actualizarEstadoPedidoPyro(datos) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_PEDIDOS);
  if (!hoja) return { ok: false, error: "Hoja PEDIDOS_PYRO no encontrada" };

  var rango = hoja.getDataRange().getValues();
  if (rango.length <= 1) return { ok: false, error: "Sin pedidos" };

  var headers = rango[0];
  var colId = headers.indexOf("id_pedido");
  var colEstado = headers.indexOf("estado");
  if (colId === -1 || colEstado === -1) {
    return { ok: false, error: "Columnas id_pedido/estado no encontradas" };
  }

  for (var i = 1; i < rango.length; i++) {
    if (String(rango[i][colId]) === String(datos.id_pedido)) {
      hoja.getRange(i + 1, colEstado + 1).setValue(datos.estado || "entregado");
      return { ok: true };
    }
  }
  return { ok: false, error: "Pedido no encontrado: " + datos.id_pedido };
}
