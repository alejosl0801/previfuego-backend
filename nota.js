// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — nota.js
//  Generador de Nota de Entrega Digital
//  Numeración desde 7500, correlativa, guardada en localStorage
// ═══════════════════════════════════════════════════════════

var NOTA_CONTADOR = parseInt(localStorage.getItem("pf_notaCount") || "7499");

// ── ESTADO NOTA ──────────────────────────────────────────────
var NOTA_ACTUAL = null;  // nota en construcción
var NOTA_ITEMS  = [];    // ítems de la tabla

// ── ABRIR PANTALLA NOTA DE ENTREGA ───────────────────────────
function abrirNotaEntrega(pi, li) {
  var p   = PUNTOS[pi];
  var loc = p.locales[li];
  PUNTO_ACTUAL     = p;
  LOCAL_ACTUAL     = loc;
  LOCAL_ACTUAL._pi = pi;
  LOCAL_ACTUAL._li = li;

  NOTA_ITEMS = [];

  // Pre-cargar ítems desde extintores del local si existen
  if (loc.ext && loc.ext.length > 0) {
    // Agrupar por tipo y capacidad
    var grupos = {};
    for (var i = 0; i < loc.ext.length; i++) {
      var e   = loc.ext[i];
      var key = (e.w||e.capacidad||"") + "|" + (e.t||e.tipo||"");
      if (!grupos[key]) grupos[key] = { desc: generarDescExt(e), precio: e.precio||0, cant: 0 };
      grupos[key].cant++;
    }
    for (var k in grupos) {
      var g = grupos[k];
      NOTA_ITEMS.push({ cant: g.cant, desc: g.desc, puni: g.precio, total: g.cant * g.precio });
    }
  }

  // Si hay accesorios de la sesión actual, agregarlos como segunda nota
  // (se maneja por separado)

  // Llenar datos del cliente
  var now    = new Date();
  var fecha  = String(now.getDate()).padStart(2,"0") + " DE " + mesEnLetras(now.getMonth()) + " DEL " + now.getFullYear();

  NOTA_ACTUAL = {
    numero:    null, // se asigna al generar
    cliente:   loc.emp    || "",
    direccion: loc.dir    || p.nombre,
    ruc:       loc.ruc    || "",
    telefono:  loc.telefono || "",
    fecha:     fecha,
    local:     loc.nombre,
    items:     NOTA_ITEMS
  };

  // Llenar UI
  var elCliente = document.getElementById("nota-cliente");
  var elDir     = document.getElementById("nota-dir");
  var elRuc     = document.getElementById("nota-ruc");
  var elTel     = document.getElementById("nota-tel");
  var elFecha   = document.getElementById("nota-fecha");
  var elLocal   = document.getElementById("nota-local");

  if (elCliente) elCliente.value = NOTA_ACTUAL.cliente;
  if (elDir)     elDir.value     = NOTA_ACTUAL.direccion;
  if (elRuc)     elRuc.value     = NOTA_ACTUAL.ruc;
  if (elTel)     elTel.value     = NOTA_ACTUAL.telefono;
  if (elFecha)   elFecha.value   = NOTA_ACTUAL.fecha;
  if (elLocal)   elLocal.value   = NOTA_ACTUAL.local;

  renderNotaItems();
  ir("snota");
}

function mesEnLetras(m) {
  var meses = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
  return meses[m] || "";
}

function generarDescExt(e) {
  var cap  = (e.w || e.capacidad || "").toUpperCase();
  var tipo = (e.t || e.tipo || "").toUpperCase();
  var trabajo = (e.trabajo || "M").toUpperCase();
  var accion  = trabajo === "R" ? "RECARGA" : "MANTENIMIENTO";
  return "EXTINTOR " + cap + " - " + tipo + " · " + accion;
}

// ── TABLA DE ÍTEMS ───────────────────────────────────────────
function renderNotaItems() {
  var el = document.getElementById("nota-items");
  if (!el) return;

  var h = "";
  var subtotal = 0;

  for (var i = 0; i < NOTA_ITEMS.length; i++) {
    var item = NOTA_ITEMS[i];
    item.total = (item.cant || 0) * (item.puni || 0);
    subtotal  += item.total;
    h += '<div class="nota-row" id="nota-row-'+i+'">';
    h += '<input type="number" class="nota-inp nota-cant" value="'+(item.cant||1)+'" min="1" onchange="notaItemChange('+i+',\'cant\',this.value)">';
    h += '<input type="text"   class="nota-inp nota-desc" value="'+(item.desc||"")+'" placeholder="Descripción" onchange="notaItemChange('+i+',\'desc\',this.value)">';
    h += '<input type="number" class="nota-inp nota-puni" value="'+(item.puni||0)+'" step="0.01" onchange="notaItemChange('+i+',\'puni\',this.value)">';
    h += '<div class="nota-tot">$'+(item.total).toFixed(2)+'</div>';
    h += '<button class="nota-del" onclick="notaEliminar('+i+')">✕</button>';
    h += '</div>';
  }

  // Fila vacía para agregar
  h += '<div class="nota-row-add" onclick="notaAgregarItem()">+ Agregar ítem</div>';

  el.innerHTML = h;

  var iva   = subtotal * 0.15;
  var total = subtotal + iva;

  var elSub = document.getElementById("nota-subtotal");
  var elIva = document.getElementById("nota-iva");
  var elTot = document.getElementById("nota-total");
  var elSon = document.getElementById("nota-son");

  if (elSub) elSub.textContent = "$" + subtotal.toFixed(2);
  if (elIva) elIva.textContent = "$" + iva.toFixed(2);
  if (elTot) elTot.textContent = "$" + total.toFixed(2);
  if (elSon) elSon.textContent = numeroALetras(total);
}

function notaItemChange(idx, campo, valor) {
  if (!NOTA_ITEMS[idx]) return;
  if (campo === "cant") NOTA_ITEMS[idx].cant = parseFloat(valor) || 0;
  if (campo === "desc") NOTA_ITEMS[idx].desc = valor;
  if (campo === "puni") NOTA_ITEMS[idx].puni = parseFloat(valor) || 0;
  renderNotaItems();
}

function notaEliminar(idx) {
  NOTA_ITEMS.splice(idx, 1);
  renderNotaItems();
}

function notaAgregarItem() {
  NOTA_ITEMS.push({ cant: 1, desc: "", puni: 0, total: 0 });
  renderNotaItems();
  // Focus en el último campo de descripción
  setTimeout(function() {
    var rows = document.querySelectorAll(".nota-desc");
    if (rows.length > 0) rows[rows.length-1].focus();
  }, 100);
}

// ── NÚMERO EN LETRAS ─────────────────────────────────────────
function numeroALetras(n) {
  n = Math.round(n * 100) / 100;
  var entero   = Math.floor(n);
  var centavos = Math.round((n - entero) * 100);
  var letras   = enteroALetras(entero);
  return letras.toUpperCase() + " CON " + String(centavos).padStart(2,"0") + "/100 USD";
}

function enteroALetras(n) {
  if (n === 0) return "CERO";
  var unidades  = ["","UNO","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE","DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE","VEINTE"];
  var decenas   = ["","","VEINTI","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"];
  var centenas  = ["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"];

  if (n <= 20)  return unidades[n];
  if (n < 30)   return "VEINTI" + unidades[n-20].toLowerCase();
  if (n < 100)  return decenas[Math.floor(n/10)] + (n%10 > 0 ? " Y " + unidades[n%10] : "");
  if (n === 100) return "CIEN";
  if (n < 1000) return centenas[Math.floor(n/100)] + (n%100 > 0 ? " " + enteroALetras(n%100) : "");
  if (n < 2000) return "MIL" + (n%1000 > 0 ? " " + enteroALetras(n%1000) : "");
  if (n < 1000000) return enteroALetras(Math.floor(n/1000)) + " MIL" + (n%1000 > 0 ? " " + enteroALetras(n%1000) : "");
  return String(n);
}

// ── GENERAR PDF NOTA DE ENTREGA ──────────────────────────────
function notaTienePrecios() {
  // Con precios: accesorios en mantenimiento (ambos tipos de cliente)
  // Sin precios: entrega de mercadería, instalación, constancia
  if (typeof TIPO_TRABAJO === "undefined") return true;
  if (TIPO_TRABAJO === "instalacion") return false;
  if (TIPO_TRABAJO === "entrega") {
    // Entrega de mercadería/importación: sin precios
    var mision = (LOCAL_ACTUAL && LOCAL_ACTUAL.mision) ? LOCAL_ACTUAL.mision.toLowerCase() : "";
    if (/mercader|importa|pedido|distribuidor/.test(mision)) return false;
    // Entrega de extintores: con precios si hay accesorios
    return NOTA_ITEMS.some(function(i){ return i.puni > 0; });
  }
  return true; // mantenimiento: siempre con precios
}

function generarNotaPDF(tipo) {
  // tipo: "entrega" o "accesorios"
  var items = tipo === "accesorios" ? ACCS.map(function(a){ return {cant:1, desc:a.n, puni:a.p, total:a.p}; }) : NOTA_ITEMS;
  if (!items || items.length === 0) { alert("Agrega al menos un ítem a la nota."); return; }

  mostrarCargando(true, "Generando nota de entrega...", "Por favor espera");

  NOTA_CONTADOR++;
  localStorage.setItem("pf_notaCount", NOTA_CONTADOR);
  var numNota = String(NOTA_CONTADOR).padStart(7, "0");

  // Leer campos del formulario
  var cliente  = (document.getElementById("nota-cliente") || {}).value || NOTA_ACTUAL.cliente;
  var direccion= (document.getElementById("nota-dir")     || {}).value || NOTA_ACTUAL.direccion;
  var ruc      = (document.getElementById("nota-ruc")     || {}).value || NOTA_ACTUAL.ruc;
  var telefono = (document.getElementById("nota-tel")     || {}).value || NOTA_ACTUAL.telefono;
  var fecha    = (document.getElementById("nota-fecha")   || {}).value || NOTA_ACTUAL.fecha;
  var local    = (document.getElementById("nota-local")   || {}).value || NOTA_ACTUAL.local;

  setTimeout(function() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload  = function(){ hacerNotaPDF(numNota, cliente, direccion, ruc, telefono, fecha, local, items, tipo); };
      s.onerror = function(){ mostrarCargando(false); alert("Error cargando PDF. Verifica conexión."); };
      document.head.appendChild(s);
    } else {
      hacerNotaPDF(numNota, cliente, direccion, ruc, telefono, fecha, local, items, tipo);
    }
  }, 200);
}

function hacerNotaPDF(numNota, cliente, direccion, ruc, telefono, fecha, local, items, tipo) {
  try {
    var J   = window.jspdf.jsPDF;
    var doc = new J({ orientation:"portrait", unit:"mm", format:"a4" });
    var PW=210, PH=297, ML=12, CW=186;

    var R  = [158,18,18];
    var NG = [26,24,28];
    var GR = [100,98,96];

    function fR(){ doc.setFillColor(R[0],R[1],R[2]); }
    function fN(){ doc.setFillColor(NG[0],NG[1],NG[2]); }
    function tR(){ doc.setTextColor(R[0],R[1],R[2]); }
    function tN(){ doc.setTextColor(NG[0],NG[1],NG[2]); }
    function tG(){ doc.setTextColor(GR[0],GR[1],GR[2]); }
    function tW(){ doc.setTextColor(255,255,255); }
    function dR(){ doc.setDrawColor(R[0],R[1],R[2]); }
    function dN(){ doc.setDrawColor(NG[0],NG[1],NG[2]); }
    function dL(){ doc.setDrawColor(180,178,176); }

    // ── HEADER ──────────────────────────────────────────────
    doc.setFillColor(255,255,255);
    doc.rect(0,0,PW,PH,"F");

    // Logo
    var lcdEl = document.getElementById("lcd");
    var b64   = lcdEl ? lcdEl.getAttribute("data-b64") : "";
    if (b64) { try { doc.addImage("data:image/png;base64,"+b64,"PNG",ML,8,28,28); } catch(e){} }

    // Nombre empresa
    doc.setFont("helvetica","bolditalic"); doc.setFontSize(22); tR();
    doc.text("PREVIFUEGO", ML+32, 16);
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tN();
    doc.text("SEGURIDAD INDUSTRIAL Y CONTRA INCENDIOS", ML+32, 21);
    doc.setFont("helvetica","normal"); doc.setFontSize(7); tG();
    var infoLines = [
      "RUC.: 0952773976001",
      "ASESORAMIENTO · RECARGA · MANTENIMIENTOS · VENTAS",
      "PQS (ABC) GAS CARBONICO – HALOTRON",
      "ESTUDIO, DISEÑO E INSTALACION DE RED HIDRAULICA CONTRA INCENDIOS",
      "SISTEMAS DE CO2 PARA COCINAS, GENERADORES, TRANSFORMADORES, ETC",
      "INSTALACION DE LAMPARAS DE EMERGENCIA, DETECTORES DE HUMO, ETC."
    ];
    for (var i=0; i<infoLines.length; i++) {
      doc.text(infoLines[i], ML+32, 26+i*3.2);
    }

    // Separador rojo
    fR(); doc.rect(ML, 38, CW, 1.2, "F");

    // Caja "NOTA DE ENTREGA" + número
    fR(); doc.rect(PW-ML-55, 8, 55, 28, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(11); tW();
    doc.text("NOTA DE ENTREGA", PW-ML-27.5, 17, {align:"center"});
    doc.setFont("helvetica","normal"); doc.setFontSize(8); tW();
    doc.text("RUC: 0952773976001", PW-ML-27.5, 22, {align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(15); tW();
    doc.text("Nº "+numNota, PW-ML-27.5, 31, {align:"center"});

    var y = 43;

    // ── DATOS CLIENTE ────────────────────────────────────────
    dL(); doc.setLineWidth(0.3);
    doc.rect(ML, y, CW, 28, "S");

    // Líneas internas horizontales
    doc.line(ML, y+7,  ML+CW, y+7);
    doc.line(ML, y+14, ML+CW, y+14);
    doc.line(ML, y+21, ML+CW, y+21);

    // Línea vertical central
    doc.line(ML+CW*0.6, y, ML+CW*0.6, y+28);

    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); tG();
    // Col izquierda
    doc.text("CLIENTE",   ML+2, y+4.5);
    doc.text("DIRECCIÓN", ML+2, y+11.5);
    doc.text("CONTACTO",  ML+2, y+18.5);
    doc.text("TELÉFONO",  ML+2, y+25.5);
    // Col derecha
    var rx = ML+CW*0.6+2;
    doc.text("RUC",       rx, y+4.5);
    doc.text("VALIDEZ",   rx, y+11.5);
    doc.text("FORMA",     rx, y+18.5);
    doc.text("DE PAGO",   rx, y+25.5);

    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); tN();
    var lx = ML+22;
    doc.text(cliente,   lx, y+4.5,  {maxWidth: CW*0.6-25});
    doc.text(direccion, lx, y+11.5, {maxWidth: CW*0.6-25});
    doc.text(telefono,  lx, y+25.5, {maxWidth: CW*0.6-25});

    var rx2 = ML+CW*0.6+22;
    doc.text(ruc,       rx2, y+4.5);
    doc.text("30 DÍAS",  rx2, y+11.5);
    doc.text("CRÉDITO",  rx2, y+18.5);

    // Fecha a la derecha
    doc.setFont("helvetica","bold"); doc.setFontSize(8); tR();
    doc.text("GUAYAQUIL, "+fecha, PW-ML-2, y+4.5, {align:"right"});

    y += 32;

    // ── TABLA DE ÍTEMS ───────────────────────────────────────
    var colW = [18, 108, 28, 28];  // CANT, DESCRIPCIÓN, P.UNI, TOTAL
    var colX = [ML];
    for (var i=1; i<colW.length; i++) colX.push(colX[i-1]+colW[i-1]);
    var rowH = 8;

    // Header tabla
    fN(); doc.rect(ML, y, CW, rowH+1, "F");
    dN(); doc.setLineWidth(0.2);
    for (var i=1; i<colX.length; i++) doc.line(colX[i], y, colX[i], y+rowH+1);
    doc.setFont("helvetica","bold"); doc.setFontSize(8); tW();
    doc.text("CANTIDAD",    colX[0]+colW[0]/2, y+5.5, {align:"center"});
    doc.text("DETALLE",     colX[1]+colW[1]/2, y+5.5, {align:"center"});
    doc.text("P.UNI",       colX[2]+colW[2]/2, y+5.5, {align:"center"});
    doc.text("TOTAL",       colX[3]+colW[3]/2, y+5.5, {align:"center"});
    y += rowH+1;

    // Subtítulo si aplica
    if (tipo === "entrega") {
      doc.setFont("helvetica","bolditalic"); doc.setFontSize(8.5); tR();
      doc.text("MANTENIMIENTO", colX[1]+colW[1]/2, y+5.5, {align:"center"});
      dL(); doc.setLineWidth(0.2); doc.line(ML, y+rowH, ML+CW, y+rowH);
      y += rowH;
    }

    // Filas de ítems
    var subtotal = 0;
    var maxFilas = 12;
    for (var i=0; i<Math.min(items.length, maxFilas); i++) {
      var item = items[i];
      var tot  = (item.cant||0) * (item.puni||item.p||0);
      subtotal += tot;
      if (i%2===0) { doc.setFillColor(255,255,255); }
      else { doc.setFillColor(248,248,246); }
      doc.rect(ML, y, CW, rowH, "F");
      dL(); doc.setLineWidth(0.2); doc.line(ML, y+rowH, ML+CW, y+rowH);
      for (var j=1; j<colX.length; j++) doc.line(colX[j], y, colX[j], y+rowH);

      doc.setFont("helvetica","normal"); doc.setFontSize(8.5); tN();
      doc.text(String(item.cant||1), colX[0]+colW[0]/2, y+5.5, {align:"center"});
      doc.text(item.desc||"", colX[1]+2, y+5.5, {maxWidth:colW[1]-4});
      doc.text("$"+((item.puni||item.p||0)).toFixed(2), colX[2]+colW[2]/2, y+5.5, {align:"center"});
      doc.setFont("helvetica","bold");
      doc.text("$"+tot.toFixed(2), colX[3]+colW[3]-2, y+5.5, {align:"right"});
      y += rowH;
    }

    // Filas vacías hasta completar espacio
    var filasRestantes = Math.max(0, 12 - items.length);
    for (var i=0; i<filasRestantes; i++) {
      doc.setFillColor(i%2===0?255:248, i%2===0?255:248, i%2===0?255:246);
      doc.rect(ML, y, CW, rowH, "F");
      dL(); doc.line(ML, y+rowH, ML+CW, y+rowH);
      for (var j=1; j<colX.length; j++) doc.line(colX[j], y, colX[j], y+rowH);
      y += rowH;
    }

    // Borde exterior tabla
    dN(); doc.setLineWidth(0.5);
    doc.rect(ML, y-rowH*(items.length+filasRestantes+(tipo==="entrega"?1:0)+1), CW, rowH*(items.length+filasRestantes+(tipo==="entrega"?1:0)+1), "S");

    // Nota local
    doc.setFont("helvetica","bolditalic"); doc.setFontSize(8.5); tN();
    doc.text("LOCAL: " + local.toUpperCase(), colX[1]+2, y+5);
    y += 10;

    // ── TOTALES ──────────────────────────────────────────────
    var iva   = subtotal * 0.15;
    var total = subtotal + iva;

    // Columna izquierda: observaciones
    var obsY  = y;
    var obsW  = CW * 0.55;
    dL(); doc.setLineWidth(0.3); doc.rect(ML, obsY, obsW, 30, "S");
    doc.setFont("helvetica","bold"); doc.setFontSize(7); tG();
    doc.text("OBSERVACIÓN:", ML+2, obsY+5);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); tN();
    var obs = "NO NOS RESPONSABILIZAMOS POR TRABAJOS ABANDONADOS DESPUÉS DE 30 DÍAS.";
    var obsL = doc.splitTextToSize(obs, obsW-4);
    for (var i=0; i<obsL.length; i++) doc.text(obsL[i], ML+2, obsY+10+i*4);

    // Columna derecha: totales
    var totX = ML + obsW + 2;
    var totW = CW - obsW - 2;
    dL(); doc.setLineWidth(0.3);
    doc.rect(ML+obsW, obsY, totW, 9.5, "S");
    doc.rect(ML+obsW, obsY+9.5, totW, 9.5, "S");
    doc.rect(ML+obsW, obsY+19, totW, 11, "S");

    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tG();
    doc.text("SUBTOTAL",  totX+2, obsY+6);
    doc.text("IVA 15%",   totX+2, obsY+15.5);
    doc.setFont("helvetica","bold"); doc.setFontSize(9); tR();
    doc.text("TOTAL",     totX+2, obsY+25.5);

    doc.setFont("helvetica","bold"); doc.setFontSize(9); tN();
    doc.text("$"+subtotal.toFixed(2), ML+obsW+totW-2, obsY+6,    {align:"right"});
    doc.text("$"+iva.toFixed(2),      ML+obsW+totW-2, obsY+15.5, {align:"right"});
    doc.setFont("helvetica","bold"); doc.setFontSize(10); tR();
    doc.text("$"+total.toFixed(2),    ML+obsW+totW-2, obsY+25.5, {align:"right"});

    y = obsY + 34;

    // SON
    doc.setFont("helvetica","bold"); doc.setFontSize(8); tN();
    doc.text("SON: ", ML+2, y+4);
    doc.setFont("helvetica","normal");
    doc.text(numeroALetras(total), ML+12, y+4, {maxWidth: CW-14});
    dL(); doc.setLineWidth(0.3); doc.rect(ML, y, CW, 9, "S");
    y += 13;

    // ── FIRMAS ───────────────────────────────────────────────
    var firW = CW / 2 - 4;

    // Firma encargado (izquierda)
    dL(); doc.setLineWidth(0.3); doc.rect(ML, y, firW, 32, "S");
    doc.setFont("helvetica","bold"); doc.setFontSize(7); tG();
    doc.text("LOCAL: "+local.toUpperCase(), ML+2, y+5, {maxWidth:firW-4});
    dL(); doc.line(ML+2, y+25, ML+firW-2, y+25);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); tG();
    doc.text("Firma y Sello", ML+firW/2, y+30, {align:"center"});

    // Canvas firma si existe
    if (FIRMADO && canvas && canvas.width > 50) {
      try {
        var sigData = canvas.toDataURL("image/png");
        doc.addImage(sigData, "PNG", ML+2, y+6, firW-4, 17);
      } catch(e) {}
    }

    // Firma Alejandro (derecha)
    var rx3 = ML + firW + 8;
    dL(); doc.rect(rx3, y, firW, 32, "S");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); tN();
    doc.text("Alejandro López", rx3+firW/2, y+13, {align:"center"});
    dL(); doc.line(rx3+2, y+14, rx3+firW-2, y+14);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); tG();
    doc.text("Jefe de Operaciones", rx3+firW/2, y+19, {align:"center"});
    doc.text("Previfuego / Pyroshield", rx3+firW/2, y+24, {align:"center"});
    doc.text("RUC: 0952773976001", rx3+firW/2, y+29, {align:"center"});

    y += 36;

    // ── PIE ──────────────────────────────────────────────────
    fR(); doc.rect(0, PH-10, PW, 10, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(6.8); tW();
    doc.text("DIR: PORTETE #3007 Y GALLEGOS LARA  |  TELEF.:04-2192274 · 0986772944 · 0978997247 · 0983583325", PW/2, PH-3.8, {align:"center"});

    // ── GUARDAR ──────────────────────────────────────────────
    var safeName = (LOCAL_ACTUAL ? LOCAL_ACTUAL.nombre : "LOCAL").replace(/[^a-zA-Z0-9]/g,"").substring(0,15);
    var nom      = "NE-"+numNota+"-"+safeName+".pdf";
    var blob     = doc.output("blob");
    var blobUrl  = URL.createObjectURL(blob);
    URLS_GENERADAS.push(blobUrl);
    if (URLS_GENERADAS.length > 10) URL.revokeObjectURL(URLS_GENERADAS.shift());

    mostrarCargando(false);

    // Mostrar pantalla de nota generada
    var elNum = document.getElementById("nota-gen-num");
    var elDl  = document.getElementById("nota-gen-dl");
    var elAcc = document.getElementById("nota-gen-acc");
    if (elNum) elNum.textContent = "Nº " + numNota;
    if (elDl)  { elDl.href = blobUrl; elDl.download = nom; }

    // Mostrar botón nota accesorios solo si hay accesorios
    if (elAcc) elAcc.style.display = (ACCS && ACCS.length > 0 && tipo !== "accesorios") ? "flex" : "none";

    ir("snota-gen");

  } catch(err) {
    mostrarCargando(false);
    console.error(err);
    alert("Error generando nota: " + err.message);
  }
}
