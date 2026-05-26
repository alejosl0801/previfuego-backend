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

// ── TEST ──────────────────────────────────────────────────────
function testConexion() {
  return { ok:true, msg:"Apps Script funcionando correctamente", ts: new Date().toISOString() };
}
