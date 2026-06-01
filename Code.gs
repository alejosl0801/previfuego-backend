// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — Code.gs  v3.5
//  Apps Script — Google Sheets backend
//  Agrega: enviar_certificado, aprobar_recorrido, crm
// ═══════════════════════════════════════════════════════════

var SHEET_ID = "1H3OQmaJtqVWHqVrI_hX2h8ZL_-a6RRobQww7IuGMhp0";

// ── CORS ─────────────────────────────────────────────────────
function doOptions(e) {
  // #154 FIX: CORS headers
  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
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
    if (accion === "extintores_mes")   return responder(getExtintoresPorMes(p.mes));
    if (accion === "extintores_local") return responder(getExtintores(p.nombre || p.local));
    if (accion === "testConexion")     return responder({ ok:true, msg:"Conexión OK", ts: new Date().toISOString() });
    return responder({ ok:false, msg:"Acción no reconocida: " + accion });
  } catch(err) {
    return responder({ ok:false, msg:"Error GET: " + err.message });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch(ex) { return jsonResp({ok:false,msg:"Servidor ocupado, reintenta en unos segundos"}); }
  var body   = {};
  var accion = "";
  try {
    body   = JSON.parse(e.postData.contents);
    accion = body.accion || "";
  } catch(err) {
    return responder({ ok:false, msg:"Error parseando body: " + err.message });
  }

  try {
    // BAJO FIX: verificar token antes de procesar acciones sensibles
    var accionesProtegidas = ["guardar_fichas","get_fichas","guardar_visita",
      "emitir_factura_azur","consultar_comprobante","guardar_azur_key"];
    if (accionesProtegidas.indexOf(accion) !== -1 && !verificarToken(body)) {
      return responder({ ok:false, msg:"No autorizado" });
    }
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
    if (accion === "listar_facturas_azur")    return responder(listarFacturasAzur(body));
    if (accion === "analisis_ia")               return responder(analisisIA(body));
    if (accion === "guardar_proforma")         return responder(guardarProforma(body));
    if (accion === "get_reportes_mensuales")   return responder(getReportesMensuales(body));
    if (accion === "dashboard_publico")       return responder(getDashboardPublico());
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

// Búsqueda de hoja tolerante a emojis/espacios/mayúsculas/acentos. Las pestañas tienen
// prefijos como "📅 RECORRIDOS" o "💰 FACTURACIÓN" → getSheetByName exacto falla.
function _normNombreHoja(s) {
  return String(s || "").toUpperCase().replace(/[^A-Z0-9_]/g, "");
}
function _hoja(ss, nombre) {
  var sheet = ss.getSheetByName(nombre);
  if (sheet) return sheet;
  var objetivo = _normNombreHoja(nombre);
  var hojas = ss.getSheets();
  for (var i = 0; i < hojas.length; i++) {
    if (_normNombreHoja(hojas[i].getName()) === objetivo) return hojas[i];
  }
  return null;
}

// ── GET RECORRIDO ─────────────────────────────────────────────
function getRecorridoTexto(p) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = _hoja(ss, "RECORRIDOS");
  if (!sheet) return { ok:false, msg:"Hoja RECORRIDOS no encontrada" };

  var fecha  = p.fecha || Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy");
  var data   = sheet.getDataRange().getValues();

  // #144 FIX: buscar columna PUBLICADO por nombre en la fila de headers
  var headers = data[0] || [];
  var colPublicado = -1;
  for (var h = 0; h < headers.length; h++) {
    if (String(headers[h]).trim().toUpperCase() === "PUBLICADO") { colPublicado = h; break; }
  }
  if (colPublicado === -1) colPublicado = 13; // fallback al índice anterior si no hay headers

  // 1) match exacto de fecha + publicado
  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    if (String(row[0]).trim() === fecha && String(row[colPublicado]).trim().toUpperCase() === "SI") {
      return { ok:true, exacto:true, texto: String(row[2]), fecha: fecha, tecnico: String(row[1]||"Raúl Romero") };
    }
  }
  // 2) #2 FIX: sin match exacto, devolver el recorrido PUBLICADO más reciente con su fecha real
  for (var j = data.length - 1; j >= 1; j--) {
    var r2 = data[j];
    if (String(r2[colPublicado]).trim().toUpperCase() === "SI") {
      return { ok:true, exacto:false, texto: String(r2[2]), fecha: String(r2[0]).trim(), tecnico: String(r2[1]||"Raúl Romero") };
    }
  }
  return { ok:false, msg:"No hay ningún recorrido publicado" };
}

// ── EXTINTORES (hoja EXTINTORES) ──────────────────────────────
// Columnas: MES | NOMBRE DEL LOCAL | UBICACIÓN EN EL LOCAL | TIPO |
//           CAPACIDAD | TRABAJO (M/R) | AÑO RECARGA | PRECIO
function _extLeerHoja() {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("EXTINTORES");
  if (!sheet) return null;
  return sheet.getDataRange().getValues();
}

// Detecta columnas por nombre de header (robusto a reordenamiento); cae a posición fija.
function _extCols(headers) {
  function buscar(tokens, fallback) {
    for (var h = 0; h < headers.length; h++) {
      var H = String(headers[h]).trim().toUpperCase();
      for (var t = 0; t < tokens.length; t++) {
        if (H.indexOf(tokens[t]) !== -1) return h;
      }
    }
    return fallback;
  }
  return {
    mes:    buscar(["MES"], 0),
    local:  buscar(["NOMBRE"], 1),
    ubic:   buscar(["UBICAC"], 2),
    tipo:   buscar(["TIPO"], 3),
    cap:    buscar(["CAPACID"], 4),
    trab:   buscar(["TRABAJO"], 5),
    anio:   buscar(["AÑO", "ANO", "RECARGA"], 6),
    precio: buscar(["PRECIO"], 7)
  };
}

// Encuentra la fila de encabezados (la que tiene "MES" y "NOMBRE"); la hoja real
// tiene una fila de título arriba, así que los encabezados NO están en la fila 0.
function _extHeader(data) {
  for (var r = 0; r < Math.min(data.length, 10); r++) {
    var fila = (data[r] || []).map(function(x){ return String(x).trim().toUpperCase(); });
    if (fila.indexOf("MES") !== -1 && fila.some(function(h){ return h.indexOf("NOMBRE") !== -1; })) {
      return { headerRow: r, cols: _extCols(data[r]) };
    }
  }
  return { headerRow: 0, cols: _extCols(data[0] || []) };
}

function _extNorm(s) { return String(s || "").trim().toUpperCase(); }

function _extFila(row, c) {
  return {
    mes:         String(row[c.mes]   || "").trim(),
    local:       String(row[c.local] || "").trim(),
    ubicacion:   String(row[c.ubic]  || "").trim(),
    tipo:        String(row[c.tipo]  || "").trim(),
    capacidad:   String(row[c.cap]   || "").trim(),
    trabajo:     String(row[c.trab]  || "").trim(),    // "M" mantenimiento / "R" recarga
    anioRecarga: String(row[c.anio]  || "").trim(),
    precio:      row[c.precio]
  };
}

// REGLA DE NEGOCIO: un extintor cuenta como "sistema CO2 fijo" solo si es CO2 de
// 50, 75 o 100 lbs. Los CO2 de 5/10/20 lbs son portátiles y NO cuentan.
function _esSistemaCO2(ext) {
  var tipo = _extNorm(ext.tipo);
  if (tipo.indexOf("CO2") === -1 && tipo.indexOf("CO₂") === -1) return false;
  var lbs = parseInt(String(ext.capacidad).replace(/[^0-9]/g, ""), 10);
  return lbs === 50 || lbs === 75 || lbs === 100;
}

// GET ?accion=extintores_mes&mes=MAYO
function getExtintoresPorMes(mes) {
  var data = _extLeerHoja();
  if (!data) return { ok:false, msg:"Hoja EXTINTORES no encontrada" };
  if (!mes)  return { ok:false, msg:"Falta el parámetro 'mes'" };
  var hd = _extHeader(data);
  var c = hd.cols;
  var objetivo = _extNorm(mes);
  var lista = [];
  for (var i = hd.headerRow + 1; i < data.length; i++) {
    if (_extNorm(data[i][c.mes]) === objetivo) lista.push(_extFila(data[i], c));
  }
  // Resumen por local (para pintar el badge CO2 en la lista del recorrido con 1 sola llamada)
  var mapa = {};
  lista.forEach(function(e){
    var k = _extNorm(e.local);
    if (!k) return;
    if (!mapa[k]) mapa[k] = { local:e.local, total:0, numCilindrosCO2:0 };
    mapa[k].total++;
    if (_esSistemaCO2(e)) mapa[k].numCilindrosCO2++;
  });
  var locales = Object.keys(mapa).map(function(k){
    var m = mapa[k];
    return { local:m.local, total:m.total,
             tieneSistemaCO2: m.numCilindrosCO2 > 0, numCilindrosCO2: m.numCilindrosCO2 };
  });
  return { ok:true, mes: mes, total: lista.length, locales: locales, extintores: lista };
}

// GET ?accion=extintores_local&nombre=KFC URDESA
function getExtintores(nombreLocal) {
  var data = _extLeerHoja();
  if (!data) return { ok:false, msg:"Hoja EXTINTORES no encontrada" };
  if (!nombreLocal) return { ok:false, msg:"Falta el parámetro 'nombre'" };
  var hd = _extHeader(data);
  var c = hd.cols;
  var objetivo = _extNorm(nombreLocal);
  var exactos = [], contiene = [];
  for (var i = hd.headerRow + 1; i < data.length; i++) {
    var nom = _extNorm(data[i][c.local]);
    if (!nom) continue;
    if (nom === objetivo) exactos.push(_extFila(data[i], c));
    else if (nom.indexOf(objetivo) !== -1 || objetivo.indexOf(nom) !== -1) contiene.push(_extFila(data[i], c));
  }
  var lista = exactos.length ? exactos : contiene;
  // Campos calculados de sistema CO2 fijo (CO2 de 50/75/100 lbs).
  // Varios cilindros grandes = UN solo sistema, pero se reporta el conteo.
  var numCilindrosCO2 = lista.filter(function(e){ return _esSistemaCO2(e); }).length;
  return { ok:true, local: nombreLocal, exacto: exactos.length > 0,
           total: lista.length,
           tieneSistemaCO2: numCilindrosCO2 > 0,
           numCilindrosCO2: numCilindrosCO2,
           extintores: lista };
}

// ── PUBLICAR RECORRIDO ────────────────────────────────────────
function publicarRecorrido(body) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = _hoja(ss, "RECORRIDOS");
  if (!sheet) return { ok:false, msg:"Hoja RECORRIDOS no encontrada" };

  var fecha  = body.fecha   || Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy");
  var tecnico = body.tecnico || "Raúl Romero";
  var texto   = (body.texto || "").substring(0, 50000); // #95 FIX: máx 50K chars en Sheets

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
  var sheet = _hoja(ss, "RECORRIDOS");
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
  var sheet = _hoja(ss, "FACTURACIÓN");
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
    (body.nota     || "").substring(0, 2000), // #91 FIX: máx 2000 chars por nota
    (body.usuario  || "").substring(0, 100)
  ]);

  return { ok:true, msg:"CRM guardado para " + (body.local||"cliente") };
}

function getCRM(body) {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("CRM");
  if (!sheet) return { ok:true, data:[] };

  var data    = sheet.getDataRange().getValues();
  var local   = (body.local || "").toLowerCase();
  var limit   = Math.min(parseInt(body.limit || 100), 500); // #149 FIX: paginación máx 500
  var results = [];

  for (var i = data.length - 1; i >= 1 && results.length < limit; i--) { // Más recientes primero
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
var _PF_RATE_CACHE = {}; // simple in-memory rate limit

function getToken() {
  // #153 FIX: no cachear — siempre leer desde PropertiesService para permitir actualización sin redeploy
  try {
    return PropertiesService.getScriptProperties().getProperty("pf_token") || "";
  } catch(e) { return ""; }
}

function verificarToken(body) {
  var token = getToken();
  if (!token) {
    console.warn("PREVIFUEGO: pf_token no configurado — endpoints sin autenticación");
    return true;
  }
  if (!body || !body.token) return false;
  // Rate limiting básico: max 60 requests por minuto por token
  var ahora = Date.now();
  var minuto = Math.floor(ahora / 60000);
  var cacheKey = "rl_" + minuto;
  _PF_RATE_CACHE[cacheKey] = (_PF_RATE_CACHE[cacheKey] || 0) + 1;
  // Limpiar entradas viejas
  Object.keys(_PF_RATE_CACHE).forEach(function(k){ if (k !== cacheKey) delete _PF_RATE_CACHE[k]; });
  if (_PF_RATE_CACHE[cacheKey] > 120) {
    console.warn("PREVIFUEGO: Rate limit excedido (" + _PF_RATE_CACHE[cacheKey] + " req/min)");
    return false;
  }
  return body.token === token;
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
  // #142 FIX: comprimir fichas SIEMPRE — guardar solo últimas 20 visitas por local
  if (body.fichas) {
    Object.keys(body.fichas).forEach(function(k) {
      if (body.fichas[k].visitas && body.fichas[k].visitas.length > 20) {
        body.fichas[k].visitas = body.fichas[k].visitas.slice(0, 20);
      }
    });
  }

  var dispositivo = body.dispositivo || "default";
  var data        = body.fichas || {};
  var fecha       = Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy HH:mm");
  var json        = JSON.stringify(data);
  // #CRÍTICO FIX: limitar tamaño para no superar límite de celda Sheets (50KB)
  if (json.length > 45000) {
    var dataRed = {};
    for (var k in data) {
      dataRed[k] = { nombre: data[k].nombre };
      dataRed[k].visitas = (data[k].visitas || []).slice(0, 10); // reducir a 10
    }
    json = JSON.stringify(dataRed);
  }
  // Fallback extremo: si sigue siendo muy grande, solo guardar nombres
  if (json.length > 45000) {
    var dataMin = {};
    for (var k in data) { dataMin[k] = { nombre: data[k].nombre, visitas: [] }; }
    json = JSON.stringify(dataMin);
    Logger.log("WARN: fichas reducidas a solo nombres por tamaño excesivo");
  }

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
          // #42 FIX: ordenar por fecha real (dd/MM/yyyy → yyyy/MM/dd para comparar)
          existentes.sort(function(a,b){
            var fa = a.fecha ? a.fecha.split("/").reverse().join("")+a.hora : "";
            var fb = b.fecha ? b.fecha.split("/").reverse().join("")+b.hora : "";
            return fb.localeCompare(fa);
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
  // #143 FIX: validar que hay items con precio
  if (!body.items || !body.items.length) return { ok:false, msg:"No hay ítems para facturar" };
  var totalCheck = body.items.reduce(function(s,i){ return s + (parseFloat(i.puni||0)*parseFloat(i.cant||1)); }, 0);
  if (totalCheck <= 0) return { ok:false, msg:"El total de la factura no puede ser $0" };
  // 1. Verificar token de admin
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };

  // 2. Obtener api_key
  var apiKey = getAzurKey();
  if (!apiKey) return { ok:false, msg:"api_key de Azur no configurada. Ve a ⚙ Config → Azur y pégala." };

  // 3. Validar datos recibidos
  // #43 FIX: verificar que items existe antes de validar
  if (!body.items || !Array.isArray(body.items)) {
    return { ok:false, msg:"No se recibieron ítems para facturar" };
  }
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
      // MEDIO FIX: crear con 15 columnas incluyendo JSON_PAYLOAD
      sheet.appendRow([
        "FECHA_EMISION","HORA","LOCAL","CLIENTE","RUC",
        "SUBTOTAL","IVA","TOTAL","CLAVE_ACCESO",
        "ESTADO","HTTP_CODE","ERROR","TECNICO","CERT_NUM","JSON_PAYLOAD"
      ]);
    } else {
      // Migrar hoja existente si tiene solo 14 columnas
      var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
      if (headers.indexOf("JSON_PAYLOAD") === -1) {
        sheet.getRange(1, headers.length + 1).setValue("JSON_PAYLOAD");
      }
      // Formatear encabezados
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // #93 FIX: guardar JSON enviado a Azur en columna adicional para auditoría
    var jsonEnviado = JSON.stringify(jsonFactura).substring(0, 5000);
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
      body.certNum  || "",
      jsonEnviado   // #93 FIX: payload completo para auditoría
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

// ── LISTAR FACTURAS DESDE SHEETS ─────────────────────────────
// BAJO FIX: endpoint para listar facturas (complementa localStorage)
function listarFacturasAzur(body) {
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("FACTURAS_AZUR");
  if (!sheet) return { ok:true, data:[], msg:"Sin facturas aún" };
  var rows = sheet.getDataRange().getValues();
  var facturas = [];
  var limite = parseInt(body.limite || "50");
  for (var i = Math.max(1, rows.length - limite); i < rows.length; i++) {
    if (!rows[i][0]) continue;
    facturas.push({
      fecha:       String(rows[i][0]),
      hora:        String(rows[i][1]),
      local:       String(rows[i][2]),
      cliente:     String(rows[i][3]),
      ruc:         String(rows[i][4]),
      subtotal:    String(rows[i][5]),
      iva:         String(rows[i][6]),
      total:       String(rows[i][7]),
      claveAcceso: String(rows[i][8]),
      estado:      String(rows[i][9])
    });
  }
  facturas.reverse(); // más recientes primero
  return { ok:true, data:facturas };
}

// ── TEST ──────────────────────────────────────────────────────
function testConexion() {
  return { ok:true, msg:"Apps Script funcionando correctamente", ts: new Date().toISOString() };
}

// ── GUARDAR PROFORMA (#F9) ───────────────────────────────────
function guardarProforma(body) {
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };
  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName("PROFORMAS");
    if (!sheet) {
      sheet = ss.insertSheet("PROFORMAS");
    }
    // Verificar/crear headers independientemente de si la hoja es nueva o existente
    var firstRow = sheet.getLastRow() > 0 ? sheet.getRange(1,1).getValue() : "";
    if (firstRow !== "ID") {
      sheet.clearContents();
      sheet.appendRow(["ID","NUMERO","FECHA","CLIENTE","RUC","ITEMS_JSON","SUBTOTAL","IVA","TOTAL","ESTADO","PAGO","FECHA_ESTADO"]);
    }
    var data = sheet.getDataRange().getValues();
    var cli  = body.cliente || {};
    var row  = [
      body.id, body.num, body.fecha,
      cli.razon||"", cli.ruc||"",
      JSON.stringify(body.items||[]).substring(0,2000),
      body.subtotal||0, body.iva||0, body.total||0,
      body.estado||"pendiente", body.pago||"",
      Utilities.formatDate(new Date(),"America/Guayaquil","dd/MM/yyyy HH:mm")
    ];
    // Buscar si ya existe para actualizar
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === body.id) {
        sheet.getRange(i+1, 1, 1, row.length).setValues([row]);
        return { ok:true, updated:true };
      }
    }
    sheet.appendRow(row);
    return { ok:true, inserted:true };
  } catch(e) {
    return { ok:false, msg:"Error guardando proforma: " + e.message };
  }
}

// ── ANÁLISIS IA (#F11) ────────────────────────────────────────
// Analiza datos del recorrido/clientes con IA externa (Claude API via inteligencia.js)
// En Code.gs solo se usa como proxy si es necesario; la llamada real la hace el browser
function analisisIA(body) {
  // Si el cliente manda datos para análisis, Code.gs puede formatearlos
  // y devolver un resumen procesado. Por ahora, devuelve los datos tal cual
  // para que el browser los use con su propia llamada a Claude API.
  try {
    var contexto = body.contexto || "";
    if (!contexto) return { ok:false, msg:"Sin contexto para analizar" };
    // Limitar tamaño del contexto (Apps Script tiene límite de 50s de ejecución)
    if (contexto.length > 8000) contexto = contexto.substring(0, 8000) + "...[truncado]";
    // Retornar contexto formateado para que inteligencia.js lo use
    return { ok:true, contexto:contexto, msg:"Listo para análisis" };
  } catch(e) {
    return { ok:false, msg:"Error en analisisIA: " + e.message };
  }
}

// ── F7: REPORTE MENSUAL AUTOMÁTICO ───────────────────────────
// Trigger: Editar → Activadores → reporteMensualTrigger → Temporizador → Mes → Día 1 → 08:00
function reporteMensualTrigger() {
  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var mes   = Utilities.formatDate(new Date(), "America/Guayaquil", "MM/yyyy");
    var hoja  = ss.getSheetByName("HISTORIAL_VISITAS");
    if (!hoja) { Logger.log("Sin hoja HISTORIAL_VISITAS"); return; }
    var data  = hoja.getDataRange().getValues();
    // Filtrar visitas del mes anterior
    var mesAnterior = _getMesAnterior();
    var visitas = data.slice(1).filter(function(row){
      var fecha = String(row[1]||"");
      return fecha.indexOf(mesAnterior.mm+"/"+mesAnterior.yyyy) !== -1;
    });
    var totalVisitas = visitas.length;
    var porTecnico   = {};
    var porTipo      = {};
    visitas.forEach(function(row){
      var tec  = String(row[3]||"Desconocido");
      var tipo = String(row[4]||"otro");
      porTecnico[tec]  = (porTecnico[tec]  || 0) + 1;
      porTipo[tipo]    = (porTipo[tipo]    || 0) + 1;
    });

    // Guardar resumen en hoja REPORTES_MENSUALES
    var repSheet = ss.getSheetByName("REPORTES_MENSUALES") || ss.insertSheet("REPORTES_MENSUALES");
    if (repSheet.getLastRow() === 0) {
      repSheet.appendRow(["MES","TOTAL_VISITAS","MANTENIMIENTO","ENTREGA","RETIRO","COBRO","OTRO","TECNICOS_JSON","GENERADO_EN"]);
    }
    repSheet.appendRow([
      mesAnterior.label,
      totalVisitas,
      porTipo.mantenimiento||0,
      porTipo.entrega||0,
      porTipo.retiro||0,
      porTipo.cobro||0,
      porTipo.otro||0,
      JSON.stringify(porTecnico),
      Utilities.formatDate(new Date(),"America/Guayaquil","dd/MM/yyyy HH:mm")
    ]);

    // Enviar email a Alejandro
    var emailBody = "REPORTE MENSUAL — " + mesAnterior.label + "\n\n" +
      "Total visitas: " + totalVisitas + "\n" +
      "Mantenimientos: " + (porTipo.mantenimiento||0) + "\n" +
      "Entregas: " + (porTipo.entrega||0) + "\n" +
      "Retiros: " + (porTipo.retiro||0) + "\n" +
      "Cobros: " + (porTipo.cobro||0) + "\n\n" +
      "Por técnico:\n" +
      Object.keys(porTecnico).map(function(t){ return "  " + t + ": " + porTecnico[t]; }).join("\n") +
      "\n\nGenerado automáticamente por Previfuego Field";
    try {
      MailApp.sendEmail("ventas_previfuego@hotmail.com", "📊 Reporte Mensual Previfuego — " + mesAnterior.label, emailBody);
    } catch(e) { Logger.log("Email no enviado: " + e.message); }

    Logger.log("Reporte mensual generado: " + mesAnterior.label + " — " + totalVisitas + " visitas");
  } catch(e) {
    Logger.log("Error reporteMensualTrigger: " + e.message);
  }
}

function _getMesAnterior() {
  var hoy   = new Date();
  var ec    = new Date(hoy.toLocaleString("en-US", {timeZone:"America/Guayaquil"}));
  ec.setDate(1);
  ec.setMonth(ec.getMonth() - 1);
  var meses = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
  return {
    mm:    String(ec.getMonth()+1).padStart(2,"0"),
    yyyy:  String(ec.getFullYear()),
    label: meses[ec.getMonth()] + " " + ec.getFullYear()
  };
}

// Endpoint para obtener reportes desde la app
function getReportesMensuales(body) {
  if (!verificarToken(body)) return { ok:false, msg:"No autorizado" };
  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName("REPORTES_MENSUALES");
    if (!sheet) return { ok:true, reportes:[] };
    var data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return { ok:true, reportes:[] };
    var headers = data[0];
    var reportes = data.slice(1).map(function(row){
      var obj = {};
      headers.forEach(function(h,i){ obj[h] = row[i]; });
      return obj;
    });
    return { ok:true, reportes:reportes.slice(-12) }; // últimos 12 meses
  } catch(e) {
    return { ok:false, msg:e.message };
  }
}

// ── F10: DASHBOARD PÚBLICO ────────────────────────────────────
// URL de acceso: SCRIPT_URL?accion=dashboard_publico&token=PUBLIC_TOKEN
// PUBLIC_TOKEN se configura en PropertiesService como "pf_public_token"
function getDashboardPublico() {
  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var hoja  = ss.getSheetByName("HISTORIAL_VISITAS");
    if (!hoja) return { ok:true, data:{ visitas:0, locales:0, mes:"" } };
    var data  = hoja.getDataRange().getValues();
    // Calcular métricas del mes actual
    var hoy   = new Date();
    var ec    = new Date(hoy.toLocaleString("en-US",{timeZone:"America/Guayaquil"}));
    var mm    = String(ec.getMonth()+1).padStart(2,"0");
    var yy    = String(ec.getFullYear());
    var meses = ["","ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
    var mesLabel = meses[parseInt(mm)] + " " + yy;
    var visitasMes = data.slice(1).filter(function(row){
      var f = String(row[1]||"");
      return f.indexOf(mm+"/") !== -1 && f.indexOf(yy) !== -1;
    });
    var localesUnicos = {};
    visitasMes.forEach(function(row){ if(row[0]) localesUnicos[row[0]]=true; });
    return {
      ok:    true,
      data: {
        mes:          mesLabel,
        visitas:      visitasMes.length,
        localesAten:  Object.keys(localesUnicos).length,
        actualizado:  Utilities.formatDate(new Date(),"America/Guayaquil","dd/MM/yyyy HH:mm"),
        empresa:      "PREVIFUEGO",
        slogan:       "Seguridad contra incendios — Guayaquil, Ecuador"
      }
    };
  } catch(e) {
    return { ok:false, msg:e.message };
  }
}
