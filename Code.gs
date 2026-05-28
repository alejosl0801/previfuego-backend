// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — Code.gs  v2.3
//  Apps Script — Google Sheets backend
//  Agrega: enviar_certificado, aprobar_recorrido, crm
// ═══════════════════════════════════════════════════════════

var SHEET_ID = "1H3OQmaJtqVWHqVrI_hX2h8ZL_-a6RRobQww7IuGMhp0";

// ── CORS ─────────────────────────────────────────────────────
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function setCors(output) {
  return output;
}

// ── ROUTER PRINCIPAL ─────────────────────────────────────────
function doGet(e) {
  var p      = e.parameter || {};
  var accion = p.accion || "";

  try {
    if (accion === "recorrido_texto")  return responder(getRecorridoTexto(p));
    if (accion === "testConexion")     return responder({ ok:true, msg:"Conexión OK", ts: new Date().toISOString() });
    return responder({ ok:false, msg:"Acción no reconocida: " + accion });
  } catch(err) {
    return responder({ ok:false, msg:"Error GET: " + err.message });
  }
}

function doPost(e) {
  var body   = {};
  var accion = "";
  try {
    body   = JSON.parse(e.postData.contents);
    accion = body.accion || "";
  } catch(err) {
    return responder({ ok:false, msg:"Error parseando body: " + err.message });
  }

  try {
    if (accion === "publicar_recorrido")  return responder(publicarRecorrido(body));
    if (accion === "aprobar_recorrido")   return responder(aprobarRecorrido(body));
    if (accion === "guardarFacturacion")  return responder(guardarFacturacion(body));
    if (accion === "enviar_certificado")  return responder(enviarCertificado(body));
    if (accion === "guardar_crm")         return responder(guardarCRM(body));
    if (accion === "get_crm")             return responder(getCRM(body));
    // #107 FIX: sincronización de fichas entre dispositivos
    if (accion === "guardar_fichas")      return responder(guardarFichas(body));
    if (accion === "get_fichas")          return responder(getFichas(body));
    if (accion === "guardar_visita")      return responder(guardarVisita(body));
    // Integración Azur
    if (accion === "emitir_factura_azur")    return responder(emitirFacturaAzur(body));
    if (accion === "consultar_comprobante")  return responder(consultarComprobanteAzur(body));
    if (accion === "guardar_azur_key")       return responder(guardarAzurKey(body));
    return responder({ ok:false, msg:"Acción no reconocida: " + accion });
  } catch(err) {
    return responder({ ok:false, msg:"Error POST ["+accion+"]: " + err.message });
  }
}

function responder(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET RECORRIDO ─────────────────────────────────────────────
function getRecorridoTexto(p) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("RECORRIDOS");
  if (!sheet) return { ok:false, msg:"Hoja RECORRIDOS no encontrada" };

  var fecha  = p.fecha || Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy");
  var data   = sheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    if (String(row[0]).trim() === fecha && String(row[13]).trim().toUpperCase() === "SI") {
      return { ok:true, texto: String(row[2]), fecha: fecha, tecnico: String(row[1]||"Raúl Romero") };
    }
  }
  return { ok:false, msg:"No hay recorrido publicado para " + fecha };
}

// ── PUBLICAR RECORRIDO ────────────────────────────────────────
function publicarRecorrido(body) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("RECORRIDOS");
  if (!sheet) return { ok:false, msg:"Hoja RECORRIDOS no encontrada" };

  var fecha  = body.fecha   || Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy");
  var tecnico = body.tecnico || "Raúl Romero";
  var texto   = body.texto  || "";

  // Buscar fila existente del día
  var data = sheet.getDataRange().getValues();
  var fila = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === fecha) { fila = i + 1; break; }
  }

  if (fila > 0) {
    sheet.getRange(fila, 1, 1, 14).setValues([[fecha, tecnico, texto, "","","","","","","","","","", "SI"]]);
  } else {
    sheet.appendRow([fecha, tecnico, texto, "","","","","","","","","","", "SI"]);
  }

  return { ok:true, msg:"Recorrido publicado para " + fecha };
}

// ── APROBAR RECORRIDO ─────────────────────────────────────────
function aprobarRecorrido(body) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("RECORRIDOS");
  if (!sheet) return { ok:false, msg:"Hoja RECORRIDOS no encontrada" };

  var fecha = Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy");
  var data  = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === fecha) {
      // Columna O (15) = APROBADO, P (16) = APROBADO_POR, Q (17) = HORA
      sheet.getRange(i+1, 15).setValue("SI");
      sheet.getRange(i+1, 16).setValue(body.aprobadoPor || "Fabiola");
      sheet.getRange(i+1, 17).setValue(body.hora || "");
      return { ok:true, msg:"Recorrido aprobado por " + (body.aprobadoPor||"Fabiola") };
    }
  }
  return { ok:false, msg:"No se encontró recorrido del día para aprobar" };
}

// ── GUARDAR FACTURACIÓN ───────────────────────────────────────
function guardarFacturacion(body) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("FACTURACIÓN");
  if (!sheet) sheet = ss.insertSheet("FACTURACIÓN");

  var accs = body.accesorios || [];
  var fecha = body.fecha || Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy");

  for (var i = 0; i < accs.length; i++) {
    sheet.appendRow([fecha, body.hora||"", body.cliente||"", body.punto||"", body.empresa||"", body.certificado||"", accs[i].nombre||"", accs[i].precio||0]);
  }

  return { ok:true, msg:"Facturación guardada: " + accs.length + " accesorio(s)" };
}

// ── ENVIAR CERTIFICADO POR EMAIL ──────────────────────────────
function enviarCertificado(body) {
  var email   = body.email   || "";
  var local   = body.local   || "";
  var certNum = body.certNum || "";
  var fecha   = body.fecha   || "";
  var tecnico = body.tecnico || "Técnico Previfuego";

  if (!email || !email.includes("@")) return { ok:false, msg:"Email inválido" };

  var asunto = "Certificado de Mantenimiento — " + local + " — Previfuego";

  var cuerpo =
    "Estimado/a encargado/a,\n\n" +
    "Adjuntamos el certificado de mantenimiento correspondiente a:\n\n" +
    "  Local:       " + local + "\n" +
    "  Certificado: " + certNum + "\n" +
    "  Fecha:       " + fecha + "\n" +
    "  Técnico:     " + tecnico + "\n\n" +
    "El certificado confirma que los extintores de su local han sido revisados y recargados " +
    "según la norma NFPA 10, garantizando su correcto funcionamiento.\n\n" +
    "Para consultas:\n" +
    "  Tel: 04-2374822 · 0978997247\n" +
    "  Email: ventas_previfuego@hotmail.com\n\n" +
    "Atentamente,\n" +
    "PREVIFUEGO / PYROSHIELD\n" +
    "PORTETE #3007 Y GALLEGOS LARA, Guayaquil";

  try {
    MailApp.sendEmail({
      to:      email,
      subject: asunto,
      body:    cuerpo,
      name:    "Previfuego"
    });

    // Registrar en hoja EMAILS_ENVIADOS
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName("EMAILS_ENVIADOS");
    if (!sheet) {
      sheet = ss.insertSheet("EMAILS_ENVIADOS");
      sheet.appendRow(["FECHA","HORA","LOCAL","CERTIFICADO","EMAIL","TECNICO","ESTADO"]);
    }
    var hora = Utilities.formatDate(new Date(), "America/Guayaquil", "HH:mm");
    sheet.appendRow([fecha, hora, local, certNum, email, tecnico, "Enviado"]);

    return { ok:true, msg:"Email enviado a " + email };
  } catch(err) {
    return { ok:false, msg:"Error enviando email: " + err.message };
  }
}

// ── CRM — NOTAS Y CONTACTOS POR CLIENTE ──────────────────────
function guardarCRM(body) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("CRM");
  if (!sheet) {
    sheet = ss.insertSheet("CRM");
    sheet.appendRow(["FECHA","LOCAL","TIPO","CONTACTO","EMAIL","TELEFONO","NOTA","USUARIO"]);
  }

  var fecha = Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy");
  var hora  = Utilities.formatDate(new Date(), "America/Guayaquil", "HH:mm");

  sheet.appendRow([
    fecha + " " + hora,
    body.local    || "",
    body.tipo     || "nota",
    body.contacto || "",
    body.email    || "",
    body.telefono || "",
    body.nota     || "",
    body.usuario  || ""
  ]);

  return { ok:true, msg:"CRM guardado para " + (body.local||"cliente") };
}

function getCRM(body) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("CRM");
  if (!sheet) return { ok:true, data:[] };

  var data    = sheet.getDataRange().getValues();
  var local   = (body.local || "").toLowerCase();
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!local || String(row[1]).toLowerCase().indexOf(local) !== -1) {
      results.push({
        fecha:    String(row[0]),
        local:    String(row[1]),
        tipo:     String(row[2]),
        contacto: String(row[3]),
        email:    String(row[4]),
        telefono: String(row[5]),
        nota:     String(row[6]),
        usuario:  String(row[7])
      });
    }
  }

  return { ok:true, data:results };
}


// ── AUTH BÁSICA (#104 #105 FIX) ───────────────────────────────
// Token en PropertiesService — NO en código fuente
// Configurar en Apps Script: Archivo → Propiedades del proyecto → pf_token
var PF_AUTH_TOKEN = null;

function getToken() {
  if (!PF_AUTH_TOKEN) {
    try {
      PF_AUTH_TOKEN = PropertiesService.getScriptProperties().getProperty("pf_token") || "";
    } catch(e) { PF_AUTH_TOKEN = ""; }
  }
  return PF_AUTH_TOKEN;
}

function verificarToken(body) {
  var token = getToken();
  if (!token) return true; // si no hay token configurado, no bloquear (backward compat)
  return (body.token && body.token === token);
}

// ── SINCRONIZAR FICHAS (#107 FIX) ────────────────────────────
// Permite leer y escribir pf_fichas desde Sheets
// Esto hace que el semáforo funcione en todos los dispositivos

function guardarFichas(body) {
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("FICHAS");
  if (!sheet) {
    sheet = ss.insertSheet("FICHAS");
    sheet.appendRow(["DISPOSITIVO","FECHA_SYNC","DATA_JSON"]);
  }

  var dispositivo = body.dispositivo || "default";
  var data        = body.fichas || {};
  var fecha       = Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy HH:mm");
  var json        = JSON.stringify(data);

  // Buscar fila existente del dispositivo
  var rows = sheet.getDataRange().getValues();
  var fila = -1;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === dispositivo) { fila = i + 1; break; }
  }

  if (fila > 0) {
    sheet.getRange(fila, 1, 1, 3).setValues([[dispositivo, fecha, json]]);
  } else {
    sheet.appendRow([dispositivo, fecha, json]);
  }

  return { ok:true, msg:"Fichas sincronizadas: " + Object.keys(data).length + " locales" };
}

function getFichas(body) {
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("FICHAS");
  if (!sheet) return { ok:true, data:{}, msg:"Sin datos aún" };

  var dispositivo = body.dispositivo || "default";
  var rows        = sheet.getDataRange().getValues();
  var merged      = {};

  // Merge fichas de todos los dispositivos (última sync gana)
  for (var i = 1; i < rows.length; i++) {
    var json = String(rows[i][2]);
    if (!json) continue;
    try {
      var fichas = JSON.parse(json);
      // Merge: para cada local, tomar la visita más reciente
      for (var local in fichas) {
        if (!merged[local]) {
          merged[local] = fichas[local];
        } else {
          // Combinar visitas sin duplicados (comparar por fecha+hora+tipo)
          var existentes = merged[local].visitas || [];
          var nuevas     = fichas[local].visitas || [];
          var keys       = {};
          existentes.forEach(function(v){ keys[v.fecha+"_"+v.hora+"_"+v.tipo] = true; });
          nuevas.forEach(function(v) {
            var k = v.fecha+"_"+v.hora+"_"+v.tipo;
            if (!keys[k]) { existentes.push(v); keys[k] = true; }
          });
          // Re-ordenar desc
          existentes.sort(function(a,b){
            return (b.fecha+b.hora).localeCompare(a.fecha+a.hora);
          });
          merged[local].visitas = existentes;
        }
      }
    } catch(e) {}
  }

  return { ok:true, data:merged, locales:Object.keys(merged).length };
}

// ── HISTORIAL FICHAS INDIVIDUAL ───────────────────────────────
function guardarVisita(body) {
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("HISTORIAL_VISITAS");
  if (!sheet) {
    sheet = ss.insertSheet("HISTORIAL_VISITAS");
    sheet.appendRow(["FECHA","HORA","LOCAL","TIPO","TECNICO","NOTA","PUNTO","DISPOSITIVO"]);
  }

  var visita = body.visita || {};
  sheet.appendRow([
    visita.fecha     || "",
    visita.hora      || "",
    body.local       || "",
    visita.tipo      || "",
    visita.tecnico   || "",
    visita.nota      || "",
    visita.punto     || "",
    body.dispositivo || ""
  ]);

  return { ok:true, msg:"Visita registrada" };
}


// ═══════════════════════════════════════════════════════════
//  INTEGRACIÓN AZUR — Facturación Electrónica
//  api_key guardada en PropertiesService → pf_azur_key
//  NUNCA en código fuente ni en GitHub
// ═══════════════════════════════════════════════════════════

var AZUR_URL_FACTURA  = "https://azur.com.ec/plataforma/api/v2/factura/emision";
var AZUR_URL_CONSULTA = "https://azur.com.ec/plataforma/api/v2/consulta/comprobante";
var AZUR_URL_ELIMINAR = "https://azur.com.ec/plataforma/api/v2/eliminar/comprobante";

// ── Obtener api_key de Azur desde PropertiesService ─────────
function getAzurKey() {
  try {
    var key = PropertiesService.getScriptProperties().getProperty("pf_azur_key") || "";
    return key.trim();
  } catch(e) {
    return "";
  }
}

// ── Guardar api_key de Azur (llamada desde la app, solo una vez) ─
function guardarAzurKey(body) {
  // Solo permite guardar si viene con el token de admin
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };
  var key = (body.azur_key || "").trim();
  if (!key || key.length < 10) return { ok:false, msg:"api_key inválida — debe tener al menos 10 caracteres" };
  try {
    PropertiesService.getScriptProperties().setProperty("pf_azur_key", key);
    return { ok:true, msg:"api_key de Azur guardada correctamente" };
  } catch(e) {
    return { ok:false, msg:"Error al guardar: " + e.message };
  }
}

// ── Detectar tipo de identificación automáticamente ──────────
// RUC: 13 dígitos → código "04"
// CI:  10 dígitos → código "05"
// Sin datos / consumidor final → código "07", identificacion "9999999999999"
function detectarTipoIdentificacion(identificacion) {
  var id = (identificacion || "").replace(/[^0-9]/g, "").trim();
  if (id.length === 13) return { tipo: "04", id: id };
  if (id.length === 10) return { tipo: "05", id: id };
  // Consumidor final
  return { tipo: "07", id: "9999999999999" };
}

// ── Convertir fecha dd/MM/YYYY → YYYY/MM/DD para Azur ────────
function formatearFechaAzur(fechaEC) {
  // Entrada: "27/05/2026" — Salida: "2026/05/27"
  try {
    var p = String(fechaEC).trim().split("/");
    if (p.length === 3) return p[2] + "/" + p[1] + "/" + p[0];
  } catch(e) {}
  // Fallback: fecha actual
  return Utilities.formatDate(new Date(), "America/Guayaquil", "yyyy/MM/dd");
}

// ── Validar datos antes de enviar a Azur ────────────────────
function validarDatosFactura(datos) {
  var errores = [];

  if (!datos.cliente || datos.cliente.trim() === "")
    errores.push("Razón social del cliente es obligatoria");

  if (!datos.items || datos.items.length === 0)
    errores.push("Debe haber al menos un ítem");

  // Validar ítems
  for (var i = 0; i < datos.items.length; i++) {
    var item = datos.items[i];
    if (!item.desc || item.desc.trim() === "")
      errores.push("Ítem " + (i+1) + ": descripción vacía");
    if (!item.puni || parseFloat(item.puni) <= 0)
      errores.push("Ítem " + (i+1) + ": precio unitario debe ser mayor a 0");
    if (!item.cant || parseFloat(item.cant) <= 0)
      errores.push("Ítem " + (i+1) + ": cantidad debe ser mayor a 0");
  }

  // Validar total para consumidor final (máx $200)
  var tipoId = detectarTipoIdentificacion(datos.ruc);
  if (tipoId.tipo === "07") {
    var total = 0;
    for (var j = 0; j < datos.items.length; j++) {
      var tasaIVA = parseFloat(datos.tasaIVA || 0.15);
      var sub = parseFloat(datos.items[j].puni) * parseFloat(datos.items[j].cant);
      total += sub * (1 + tasaIVA);
    }
    if (total > 200) {
      errores.push("Consumidor final no puede superar $200 en total (total calculado: $" + total.toFixed(2) + "). Ingresa el RUC del cliente.");
    }
  }

  return errores;
}

// ── Construir JSON de factura para Azur ─────────────────────
function construirJSONFactura(datos, apiKey) {
  var tipoId   = detectarTipoIdentificacion(datos.ruc);
  var fechaAzur = formatearFechaAzur(datos.fecha);
  var tasaIVA  = parseFloat(datos.tasaIVA || 0.15);

  // Determinar código de tipo_iva según tasa
  // 0%=0, 5%=5, 12%=2, 13%=10, 14%=3, 15%=4, no objeto=6, exento=7
  var codigoIVA = 4; // 15% por defecto
  if (tasaIVA === 0)    codigoIVA = 7; // exento
  if (tasaIVA === 0.12) codigoIVA = 2;
  if (tasaIVA === 0.15) codigoIVA = 4;

  // Construir items para Azur
  // Regla Azur: precio_unitario y cantidad máx 5 decimales, resto máx 2
  var itemsAzur = [];
  for (var i = 0; i < datos.items.length; i++) {
    var item     = datos.items[i];
    var cantidad = parseFloat(parseFloat(item.cant || 1).toFixed(5));
    var precio   = parseFloat(parseFloat(item.puni || 0).toFixed(5));
    itemsAzur.push({
      "codigo_principal": "SRV-" + String(i + 1).padStart(3, "0"),
      "codigo_auxiliar":  null,
      "descripcion":      (item.desc || "Servicio").toUpperCase().trim(),
      "tipoproducto":     2,        // SERVICIO
      "tipo_iva":         codigoIVA,
      "precio_unitario":  precio,
      "cantidad":         cantidad,
      "descuento":        0,
      "tipo_ice":         null,
      "valor_ice":        0,
      "tarifa_ice":       0
    });
  }

  // Total de la factura (Azur lo calcula pero enviamos por seguridad)
  var subtotal = 0;
  for (var j = 0; j < datos.items.length; j++) {
    subtotal += parseFloat(datos.items[j].puni || 0) * parseFloat(datos.items[j].cant || 1);
  }
  var totalConIVA = parseFloat((subtotal * (1 + tasaIVA)).toFixed(2));

  var json = {
    "api_key":   apiKey,
    "codigoDoc": "01",
    "emisor": {
      "manejo_interno_secuencia": "SI",
      "fecha_emision": fechaAzur
    },
    "comprador": {
      "tipo_identificacion": tipoId.tipo,
      "identificacion":      tipoId.id,
      "razon_social":        (datos.cliente || "CONSUMIDOR FINAL").toUpperCase().trim(),
      "direccion":           (datos.direccion || "GUAYAQUIL").toUpperCase().trim(),
      "telefono":            (datos.telefono || "").replace(/[^0-9\-\s]/g, "").trim() || null,
      "celular":             null,
      "correo":              (datos.correo || "").trim() || null
    },
    "items": itemsAzur,
    "pagos": [
      {
        "tipo":  "20",
        "total": totalConIVA
      }
    ],
    "informacion_adicional": [
      {
        "nombre":  "Local",
        "detalle": (datos.local || datos.cliente || "").toUpperCase().trim()
      },
      {
        "nombre":  "Certificado",
        "detalle": (datos.certNum || "—").toUpperCase().trim()
      }
    ]
  };

  // Eliminar informacion_adicional si algún campo quedó vacío
  json.informacion_adicional = json.informacion_adicional.filter(function(x) {
    return x.detalle && x.detalle !== "—" && x.detalle.trim() !== "";
  });
  if (json.informacion_adicional.length === 0) delete json.informacion_adicional;

  return json;
}

// ── EMITIR FACTURA A AZUR ────────────────────────────────────
function emitirFacturaAzur(body) {
  // 1. Verificar token de admin
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };

  // 2. Obtener api_key
  var apiKey = getAzurKey();
  if (!apiKey) return { ok:false, msg:"api_key de Azur no configurada. Ve a ⚙ Config → Azur y pégala." };

  // 3. Validar datos recibidos
  var errores = validarDatosFactura(body);
  if (errores.length > 0) return { ok:false, msg:"Errores de validación", errores: errores };

  // 4. Construir JSON
  var jsonFactura = construirJSONFactura(body, apiKey);

  // 5. Enviar a Azur
  try {
    var opciones = {
      method:             "POST",
      contentType:        "application/json",
      payload:            JSON.stringify(jsonFactura),
      muteHttpExceptions: true  // Para capturar respuestas de error HTTP
    };

    var respuesta = UrlFetchApp.fetch(AZUR_URL_FACTURA, opciones);
    var codigoHTTP = respuesta.getResponseCode();
    var textoResp  = respuesta.getContentText();

    var data = {};
    try { data = JSON.parse(textoResp); } catch(e) { data = { creado: "false", errors: [textoResp] }; }

    // 6. Registrar en Sheets independientemente del resultado
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName("FACTURAS_AZUR");
    if (!sheet) {
      sheet = ss.insertSheet("FACTURAS_AZUR");
      sheet.appendRow([
        "FECHA_EMISION","HORA","LOCAL","CLIENTE","RUC",
        "SUBTOTAL","IVA","TOTAL","CLAVE_ACCESO",
        "ESTADO","HTTP_CODE","ERROR","TECNICO","CERT_NUM"
      ]);
      // Formatear encabezados
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var fechaReg = Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy");
    var horaReg  = Utilities.formatDate(new Date(), "America/Guayaquil", "HH:mm");
    var tasaIVA  = parseFloat(body.tasaIVA || 0.15);
    var subtotal = 0;
    for (var i = 0; i < body.items.length; i++) {
      subtotal += parseFloat(body.items[i].puni || 0) * parseFloat(body.items[i].cant || 1);
    }
    var ivaVal   = parseFloat((subtotal * tasaIVA).toFixed(2));
    var totalVal = parseFloat((subtotal + ivaVal).toFixed(2));

    var creado       = String(data.creado) === "true";
    var claveAcceso  = data.claveacceso || "";
    var errorMsg     = creado ? "" : (data.errors ? data.errors.join(" | ") : "Error desconocido");

    sheet.appendRow([
      fechaReg,
      horaReg,
      body.local    || "",
      body.cliente  || "",
      body.ruc      || "",
      subtotal.toFixed(2),
      ivaVal.toFixed(2),
      totalVal.toFixed(2),
      claveAcceso,
      creado ? "EMITIDA" : "ERROR",
      codigoHTTP,
      errorMsg,
      body.tecnico  || "Alejandro",
      body.certNum  || ""
    ]);

    // 7. Responder a la app
    if (creado) {
      return {
        ok:           true,
        claveAcceso:  claveAcceso,
        msg:          "Factura emitida correctamente",
        subtotal:     subtotal.toFixed(2),
        iva:          ivaVal.toFixed(2),
        total:        totalVal.toFixed(2)
      };
    } else {
      return {
        ok:       false,
        msg:      "Azur rechazó la factura",
        errores:  data.errors || ["Error desconocido"],
        httpCode: codigoHTTP
      };
    }

  } catch(e) {
    // Error de red o de Apps Script
    return { ok:false, msg:"Error de conexión con Azur: " + e.message };
  }
}

// ── CONSULTAR ESTADO DE COMPROBANTE ─────────────────────────
function consultarComprobanteAzur(body) {
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };

  var apiKey      = getAzurKey();
  var claveAcceso = (body.claveAcceso || "").trim();

  if (!apiKey)      return { ok:false, msg:"api_key de Azur no configurada" };
  if (!claveAcceso) return { ok:false, msg:"claveAcceso es obligatoria" };

  try {
    var opciones = {
      method:             "POST",
      contentType:        "application/json",
      payload:            JSON.stringify({ api_key: apiKey, claveacceso: claveAcceso }),
      muteHttpExceptions: true
    };

    var respuesta  = UrlFetchApp.fetch(AZUR_URL_CONSULTA, opciones);
    var data       = {};
    try { data = JSON.parse(respuesta.getContentText()); } catch(e) {}

    return { ok:true, data:data };
  } catch(e) {
    return { ok:false, msg:"Error de conexión: " + e.message };
  }
}

// ── TEST ──────────────────────────────────────────────────────
function testConexion() {
  return { ok:true, msg:"Apps Script funcionando correctamente", ts: new Date().toISOString() };
}
