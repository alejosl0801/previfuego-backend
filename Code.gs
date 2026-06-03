// ════════════════════════════════════════════════════════════════
// Code.gs — Backend Google Apps Script para Previfuego Field
//
// Web App como endpoint GET y POST. Enruta por el campo "accion".
// ════════════════════════════════════════════════════════════════

var SHEET_ID        = "1H3OQmaJtqVWHqVrI_hX2h8ZL_-a6RRobQww7IuGMhp0";

var HOJA_PEDIDOS    = "PEDIDOS_PYRO";
var HOJA_RECORRIDO  = "RECORRIDO";
var HOJA_KV         = "KV";
var HOJA_FICHAS     = "FICHAS";
var HOJA_CRM        = "CRM_LOG";
var HOJA_PROFORMAS  = "PROFORMAS";
var HOJA_EXTINTORES = "EXTINTORES";

var ENCABEZADOS_PEDIDOS = [
  "id_pedido", "fecha", "ruc_dist", "nombre_dist",
  "items_json", "total", "estado", "fecha_registro"
];

// ════════════════════════════════════════════════════════════════
// doGet — peticiones de solo lectura (sin token requerido)
// ════════════════════════════════════════════════════════════════
function doGet(e) {
  var resultado;
  try {
    var accion = (e.parameter && e.parameter.accion) || "";
    switch (accion) {
      case "extintores_mes":
        resultado = getExtintoresPorMes(e.parameter.mes || "");
        break;
      case "extintores_local":
        resultado = getExtintores(e.parameter.nombre || "");
        break;
      case "recorrido_texto":
        resultado = getRecorridoTexto(e.parameter.fecha || "");
        break;
      default:
        resultado = { ok: false, error: "Acción GET no reconocida: " + accion };
    }
  } catch (err) {
    resultado = { ok: false, error: String(err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

// ════════════════════════════════════════════════════════════════
// doPost — enruta por el campo "accion"
// ════════════════════════════════════════════════════════════════
function doPost(e) {
  var resultado;
  try {
    var datos = JSON.parse(e.postData.contents);
    switch (datos.accion) {
      // ── Pedidos PyroShield (originales) ──────────────────────
      case "guardarPedidoPyro":
        resultado = recibirPedidoPyro(datos);
        break;
      case "obtenerPedidosPyro":
        resultado = obtenerPedidosPyro();
        break;
      case "actualizarEstadoPedidoPyro":
        resultado = actualizarEstadoPedidoPyro(datos);
        break;
      // ── Recorrido ─────────────────────────────────────────────
      case "publicar_recorrido":
        resultado = publicarRecorrido(datos);
        break;
      // ── Fichas / sync ─────────────────────────────────────────
      case "guardar_fichas":
        resultado = guardarFichas(datos);
        break;
      case "get_fichas":
        resultado = getFichas(datos);
        break;
      // ── KV store ──────────────────────────────────────────────
      case "set_kv":
        resultado = setKV(datos);
        break;
      case "get_kv":
        resultado = getKV(datos);
        break;
      // ── Azur / Facturación ────────────────────────────────────
      case "guardar_azur_key":
        resultado = guardarAzurKey(datos);
        break;
      case "consultar_comprobante":
        resultado = consultarComprobante(datos);
        break;
      case "emitir_factura_azur":
        resultado = emitirFacturaAzur(datos);
        break;
      // ── CRM ───────────────────────────────────────────────────
      case "guardar_crm":
        resultado = guardarCRM(datos);
        break;
      // ── Proformas ─────────────────────────────────────────────
      case "guardar_proforma":
        resultado = guardarProforma(datos);
        break;
      // ── Certificados ──────────────────────────────────────────
      case "enviar_certificado":
        resultado = enviarCertificado(datos);
        break;
      // ── IA (delegada a API externa) ────────────────────────────
      case "analisis_ia":
        resultado = { ok: false, error: "analisis_ia debe llamarse al endpoint de IA directamente." };
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
// EXTINTORES
// Hoja EXTINTORES: MES | NOMBRE DEL LOCAL | UBICACIÓN EN EL LOCAL
//                  | TIPO | CAPACIDAD | TRABAJO (M/R) | AÑO RECARGA | PRECIO
// ════════════════════════════════════════════════════════════════
function getExtintoresPorMes(mes) {
  if (!mes) return { ok: false, error: "mes requerido" };
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_EXTINTORES);
  if (!hoja) return { ok: false, error: "Hoja EXTINTORES no encontrada" };

  var datos = hoja.getDataRange().getValues();
  if (datos.length <= 1) return { ok: true, mes: mes, total: 0, extintores: [] };

  var mesNorm = mes.trim().toUpperCase();
  var extintores = [];
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    if (!fila[0]) continue;
    if (String(fila[0]).trim().toUpperCase() === mesNorm) {
      extintores.push({
        mes:      fila[0],
        local:    fila[1],
        ubicacion:fila[2],
        tipo:     fila[3],
        capacidad:fila[4],
        trabajo:  fila[5],
        anioRec:  fila[6],
        precio:   fila[7]
      });
    }
  }
  return { ok: true, mes: mes, total: extintores.length, extintores: extintores };
}

function getExtintores(nombreLocal) {
  if (!nombreLocal) return { ok: false, error: "nombre requerido" };
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_EXTINTORES);
  if (!hoja) return { ok: false, error: "Hoja EXTINTORES no encontrada" };

  var datos   = hoja.getDataRange().getValues();
  var busqueda = nombreLocal.trim().toUpperCase();
  var extintores = [];
  var exacto = false;

  for (var i = 1; i < datos.length; i++) {
    var fila   = datos[i];
    var nombre = String(fila[1] || "").trim().toUpperCase();
    if (!nombre) continue;
    if (nombre === busqueda) { exacto = true; extintores.push(fila); }
    else if (!exacto && nombre.indexOf(busqueda) !== -1) { extintores.push(fila); }
  }

  // Calcular sistema CO2 fijo: cilindros CO2 de exactamente 50, 75 o 100 lbs
  var cilindrosCO2 = 0;
  extintores.forEach(function(f) {
    var tipo = String(f[3] || "").toUpperCase();
    var cap  = parseFloat(String(f[4] || "").replace(/[^0-9.]/g, "")) || 0;
    if (tipo.indexOf("CO2") !== -1 && (cap === 50 || cap === 75 || cap === 100)) {
      cilindrosCO2++;
    }
  });

  var resultado = extintores.map(function(f) {
    return { mes:f[0], local:f[1], ubicacion:f[2], tipo:f[3], capacidad:f[4], trabajo:f[5], anioRec:f[6], precio:f[7] };
  });

  return {
    ok:             true,
    local:          nombreLocal,
    exacto:         exacto,
    total:          resultado.length,
    tieneSistemaCO2: cilindrosCO2 > 0,
    numCilindrosCO2: cilindrosCO2,
    extintores:     resultado
  };
}

// ════════════════════════════════════════════════════════════════
// RECORRIDO
// Hoja RECORRIDO: FECHA | TECNICO | TEXTO | JORNADAS_JSON | TIMESTAMP
// ════════════════════════════════════════════════════════════════
function publicarRecorrido(datos) {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_RECORRIDO);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_RECORRIDO);
    hoja.appendRow(["FECHA","TECNICO","TEXTO","JORNADAS_JSON","TIMESTAMP"]);
  }

  var fecha  = datos.fecha  || "";
  var tecnico = datos.tecnico || "";
  var texto  = datos.texto  || "";
  var jornadas = datos.jornadas ? JSON.stringify(datos.jornadas) : "";

  // Buscar si ya existe entrada para esta fecha+tecnico y actualizar
  var filas = hoja.getDataRange().getValues();
  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][0]) === fecha && String(filas[i][1]) === tecnico) {
      hoja.getRange(i + 1, 3, 1, 3).setValues([[texto, jornadas, new Date()]]);
      return { ok: true, accion: "actualizado" };
    }
  }
  hoja.appendRow([fecha, tecnico, texto, jornadas, new Date()]);
  return { ok: true, accion: "creado" };
}

function getRecorridoTexto(fecha) {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_RECORRIDO);
  if (!hoja) return { ok: false, error: "Sin recorridos publicados aún" };

  var filas = hoja.getDataRange().getValues();
  if (filas.length <= 1) return { ok: false, error: "Sin recorridos publicados aún" };

  // Buscar por fecha exacta
  var fechaNorm = (fecha || "").trim();
  for (var i = filas.length - 1; i >= 1; i--) {
    if (String(filas[i][0]).trim() === fechaNorm) {
      return {
        ok:      true,
        exacto:  true,
        fecha:   filas[i][0],
        tecnico: filas[i][1],
        texto:   filas[i][2],
        jornadas: filas[i][3] ? JSON.parse(filas[i][3]) : []
      };
    }
  }

  // Fallback: última entrada disponible
  var ultima = filas[filas.length - 1];
  return {
    ok:      true,
    exacto:  false,
    fecha:   ultima[0],
    tecnico: ultima[1],
    texto:   ultima[2],
    jornadas: ultima[3] ? JSON.parse(ultima[3]) : []
  };
}

// ════════════════════════════════════════════════════════════════
// FICHAS — sincronización entre dispositivos
// Hoja FICHAS: DISPOSITIVO | FICHAS_JSON | TIMESTAMP
// ════════════════════════════════════════════════════════════════
function guardarFichas(datos) {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_FICHAS);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_FICHAS);
    hoja.appendRow(["DISPOSITIVO","FICHAS_JSON","TIMESTAMP"]);
  }

  var dispositivo = datos.dispositivo || "desconocido";
  var fichasJson  = datos.fichas ? JSON.stringify(datos.fichas) : "{}";

  var filas = hoja.getDataRange().getValues();
  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][0]) === dispositivo) {
      hoja.getRange(i + 1, 2, 1, 2).setValues([[fichasJson, new Date()]]);
      return { ok: true };
    }
  }
  hoja.appendRow([dispositivo, fichasJson, new Date()]);
  return { ok: true };
}

function getFichas(datos) {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_FICHAS);
  if (!hoja) return { ok: true, fichas: {} };

  var dispositivo = datos.dispositivo || "";
  var filas = hoja.getDataRange().getValues();

  // Merge: consolidar todas las fichas de todos los dispositivos
  var merged = {};
  for (var i = 1; i < filas.length; i++) {
    if (!filas[i][1]) continue;
    try {
      var f = JSON.parse(filas[i][1]);
      Object.keys(f).forEach(function(k) {
        if (!merged[k]) {
          merged[k] = f[k];
        } else {
          // Combinar visitas sin duplicados (por fecha+tipo)
          var vExist = merged[k].visitas || [];
          var vNuevas = f[k].visitas || [];
          vNuevas.forEach(function(v) {
            var dup = vExist.some(function(e) { return e.fecha === v.fecha && e.tipo === v.tipo; });
            if (!dup) vExist.push(v);
          });
          merged[k].visitas = vExist;
        }
      });
    } catch(e) {}
  }
  return { ok: true, fichas: merged };
}

// ════════════════════════════════════════════════════════════════
// KV STORE — clave/valor genérico (correos, config, etc.)
// Hoja KV: CLAVE | VALOR | TIMESTAMP
// ════════════════════════════════════════════════════════════════
function setKV(datos) {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_KV);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_KV);
    hoja.appendRow(["CLAVE","VALOR","TIMESTAMP"]);
  }

  var clave = datos.clave || "";
  var valor = datos.valor !== undefined ? String(datos.valor) : "";
  if (!clave) return { ok: false, error: "clave requerida" };

  var filas = hoja.getDataRange().getValues();
  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][0]) === clave) {
      hoja.getRange(i + 1, 2, 1, 2).setValues([[valor, new Date()]]);
      return { ok: true };
    }
  }
  hoja.appendRow([clave, valor, new Date()]);
  return { ok: true };
}

function getKV(datos) {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_KV);
  if (!hoja) return { ok: true, valor: null };

  var clave = datos.clave || "";
  var filas = hoja.getDataRange().getValues();
  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][0]) === clave) {
      return { ok: true, clave: clave, valor: filas[i][1] };
    }
  }
  return { ok: true, clave: clave, valor: null };
}

// ════════════════════════════════════════════════════════════════
// AZUR KEY — guardar api_key cifrada en PropertiesService
// ════════════════════════════════════════════════════════════════
function guardarAzurKey(datos) {
  if (!datos.azur_key) return { ok: false, error: "azur_key requerida" };
  PropertiesService.getScriptProperties().setProperty("AZUR_KEY", datos.azur_key);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════
// CONSULTAR COMPROBANTE AZUR (proxy hacia API externa)
// ════════════════════════════════════════════════════════════════
function consultarComprobante(datos) {
  var azurKey = PropertiesService.getScriptProperties().getProperty("AZUR_KEY");
  if (!azurKey) return { ok: false, error: "No hay api_key de Azur configurada. Pide a Alejandro que la registre en Ajustes." };
  if (!datos.claveAcceso) return { ok: false, error: "claveAcceso requerida" };

  try {
    var resp = UrlFetchApp.fetch(
      "https://api.azur.com.ec/sri/comprobante/" + encodeURIComponent(datos.claveAcceso),
      { headers: { "Authorization": "Bearer " + azurKey }, muteHttpExceptions: true }
    );
    var body = resp.getContentText();
    return { ok: true, data: JSON.parse(body) };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ════════════════════════════════════════════════════════════════
// EMITIR FACTURA AZUR (proxy hacia API externa)
// ════════════════════════════════════════════════════════════════
function emitirFacturaAzur(datos) {
  var azurKey = PropertiesService.getScriptProperties().getProperty("AZUR_KEY");
  if (!azurKey) return { ok: false, error: "No hay api_key de Azur configurada. Pide a Alejandro que la registre en Ajustes." };

  try {
    var payload = {
      razon_social:      datos.razon   || "CONSUMIDOR FINAL",
      identificacion:    datos.ruc     || "9999999999999",
      tipo_identificacion: datos.tipoId || "07",
      direccion:         datos.dir     || "GUAYAQUIL",
      correo:            datos.correo  || "",
      items: (datos.items || []).map(function(it) {
        return {
          descripcion:     it.nombre || it.descripcion || "",
          cantidad:        it.qty    || 1,
          precio_unitario: it.precio || 0,
          descuento:       0
        };
      })
    };

    var resp = UrlFetchApp.fetch("https://api.azur.com.ec/factura/emitir", {
      method:  "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      headers: { "Authorization": "Bearer " + azurKey },
      muteHttpExceptions: true
    });

    var body = JSON.parse(resp.getContentText());
    if (body.claveAcceso) {
      // Registrar en KV para historial
      var ss   = SpreadsheetApp.openById(SHEET_ID);
      var hoja = ss.getSheetByName("FACTURAS");
      if (!hoja) { hoja = ss.insertSheet("FACTURAS"); hoja.appendRow(["CLAVE_ACCESO","LOCAL","FECHA","MONTO","DATOS_JSON"]); }
      hoja.appendRow([body.claveAcceso, datos.local || "", new Date(), datos.total || 0, JSON.stringify(body)]);
    }
    return { ok: true, data: body };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ════════════════════════════════════════════════════════════════
// CRM — guardar notas de interacción
// Hoja CRM_LOG: FECHA | LOCAL | TIPO | NOTA | USUARIO | TIMESTAMP
// ════════════════════════════════════════════════════════════════
function guardarCRM(datos) {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_CRM);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_CRM);
    hoja.appendRow(["FECHA","LOCAL","TIPO","NOTA","USUARIO","TIMESTAMP"]);
  }
  hoja.appendRow([
    new Date().toLocaleDateString("es-EC"),
    datos.local   || "",
    datos.tipo    || "nota",
    datos.nota    || "",
    datos.usuario || "",
    new Date()
  ]);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════
// PROFORMAS — guardar proforma en Sheets
// Hoja PROFORMAS: ID | NUM | FECHA | CLIENTE | ITEMS_JSON | SUBTOTAL | IVA | TOTAL | ESTADO | TIMESTAMP
// ════════════════════════════════════════════════════════════════
function guardarProforma(datos) {
  var ss   = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_PROFORMAS);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_PROFORMAS);
    hoja.appendRow(["ID","NUM","FECHA","CLIENTE","ITEMS_JSON","SUBTOTAL","IVA","TOTAL","ESTADO","TIMESTAMP"]);
  }

  var id = datos.id || "";
  // Actualizar si ya existe
  var filas = hoja.getDataRange().getValues();
  for (var i = 1; i < filas.length; i++) {
    if (String(filas[i][0]) === id) {
      hoja.getRange(i + 1, 2, 1, 9).setValues([[
        datos.num || "", datos.fecha || "", datos.cliente || "",
        JSON.stringify(datos.items || []),
        datos.subtotal || 0, datos.iva || 0, datos.total || 0,
        datos.estado || "borrador", new Date()
      ]]);
      return { ok: true, accion: "actualizado" };
    }
  }
  hoja.appendRow([
    id, datos.num || "", datos.fecha || "", datos.cliente || "",
    JSON.stringify(datos.items || []),
    datos.subtotal || 0, datos.iva || 0, datos.total || 0,
    datos.estado || "borrador", new Date()
  ]);
  return { ok: true, accion: "creado" };
}

// ════════════════════════════════════════════════════════════════
// CERTIFICADOS — enviar email de notificación
// ════════════════════════════════════════════════════════════════
function enviarCertificado(datos) {
  if (!datos.email) return { ok: false, error: "email requerido" };
  try {
    var asunto = "Certificado de Mantenimiento — " + (datos.local || "Previfuego");
    var cuerpo =
      "Estimado(a),\n\n" +
      "Se ha completado el mantenimiento de sus extintores.\n\n" +
      "  Certificado N°: " + (datos.certNum || "—") + "\n" +
      "  Local: "         + (datos.local    || "—") + "\n" +
      "  Fecha: "         + (datos.fecha    || "—") + "\n" +
      "  Técnico: "       + (datos.tecnico  || "—") + "\n\n" +
      "Gracias por confiar en PREVIFUEGO.\n" +
      "Tel: 04-2374822 · ventas_previfuego@hotmail.com";

    MailApp.sendEmail({ to: datos.email, subject: asunto, body: cuerpo });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ════════════════════════════════════════════════════════════════
// PEDIDOS PYROSHIELD (funciones originales)
// ════════════════════════════════════════════════════════════════
function recibirPedidoPyro(datos) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_PEDIDOS);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_PEDIDOS);
    hoja.appendRow(ENCABEZADOS_PEDIDOS);
  }
  hoja.appendRow([
    datos.id_pedido   || "",
    datos.fecha       || "",
    datos.ruc_dist    || "",
    datos.nombre_dist || "",
    datos.items_json  || "",
    datos.total != null ? datos.total : "",
    datos.estado      || "",
    new Date()
  ]);
  return { ok: true };
}

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

function actualizarEstadoPedidoPyro(datos) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var hoja = ss.getSheetByName(HOJA_PEDIDOS);
  if (!hoja) return { ok: false, error: "Hoja PEDIDOS_PYRO no encontrada" };

  var rango = hoja.getDataRange().getValues();
  if (rango.length <= 1) return { ok: false, error: "Sin pedidos" };

  var headers  = rango[0];
  var colId    = headers.indexOf("id_pedido");
  var colEstado = headers.indexOf("estado");
  if (colId === -1 || colEstado === -1) return { ok: false, error: "Columnas id_pedido/estado no encontradas" };

  for (var i = 1; i < rango.length; i++) {
    if (String(rango[i][colId]) === String(datos.id_pedido)) {
      hoja.getRange(i + 1, colEstado + 1).setValue(datos.estado || "entregado");
      return { ok: true };
    }
  }
  return { ok: false, error: "Pedido no encontrado: " + datos.id_pedido };
}
