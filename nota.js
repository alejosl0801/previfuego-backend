// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — nota.js
//  Generador de Nota de Entrega Digital
//  Numeración desde 7500, correlativa, guardada en localStorage
// ═══════════════════════════════════════════════════════════

var _notaRaw = parseInt(localStorage.getItem("pf_notaCount") || "7499");
var NOTA_CONTADOR = isNaN(_notaRaw) ? 7499 : _notaRaw; // BAJO FIX: guard NaN

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

  // #27 FIX: obtener todos los datos del cliente en una sola llamada
  var _notaCli = (typeof pfBuscarCliente === "function") ? pfBuscarCliente(loc.nombre) : null;
  NOTA_ACTUAL = {
    numero:    null,
    cliente:   _notaCli ? (_notaCli.razon  || loc.nombre) : loc.nombre,
    direccion: p.nombre || "",
    ruc:       _notaCli ? (_notaCli.ruc    || "") : "",
    telefono:  _notaCli ? (_notaCli.responsable || "") : "",
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

  var iva   = subtotal * (parseFloat(localStorage.getItem('pf_iva') || '0.15'));
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

var _notaChangeTimer = null;
function notaItemChange(idx, campo, valor) {
  // #26 FIX: debounce para evitar re-render en cada tecla
  if (!NOTA_ITEMS[idx]) return;
  if (campo === "cant") NOTA_ITEMS[idx].cant = parseFloat(valor) || 0;
  if (campo === "desc") NOTA_ITEMS[idx].desc = valor;
  if (campo === "puni") NOTA_ITEMS[idx].puni = parseFloat(valor) || 0;
  if (_notaChangeTimer) clearTimeout(_notaChangeTimer);
  _notaChangeTimer = setTimeout(renderNotaItems, 300);
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
    if (rows.length > 0) {
      rows[rows.length-1].focus();
      // #79 FIX: scroll al nuevo campo
      rows[rows.length-1].scrollIntoView({ behavior:"smooth", block:"center" });
    }
  }, 150);
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
  if (n < 0) return "MENOS " + enteroALetras(-n); // #25 FIX: negativos
  if (n === 0) return "CERO";
  var unidades  = ["","UNO","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE","DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE","VEINTE"];
  var decenas   = ["","","VEINTI","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"];
  var centenas  = ["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"];

  if (n <= 20)  return unidades[n];
  if (n < 30)   return (n === 21 ? "VEINTIUN" : n === 22 ? "VEINTIDOS" : n === 23 ? "VEINTITRES" : "VEINTI" + unidades[n-20].toLowerCase()); // #76 FIX
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

var _notaGenerando = false;
function generarNotaPDF(tipo) {
  // MEDIO FIX: guard contra doble generación
  if (_notaGenerando) return;
  _notaGenerando = true;
  setTimeout(function(){ _notaGenerando = false; }, 5000); // resetear después de 5s
  // tipo: "entrega" o "accesorios"
  var items = tipo === "accesorios" ? ACCS.map(function(a){ return {cant:1, desc:a.n, puni:a.p, total:a.p}; }) : NOTA_ITEMS;
  if (!items || items.length === 0) { _notaGenerando = false; pfModal("Agrega al menos un ítem a la nota."); return; }

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
      s.onerror = function(){ mostrarCargando(false); pfModal("Error cargando PDF. Verifica conexión."); };
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
    doc.text(localStorage.getItem("pf_nota_validez")||"30 DÍAS", rx2, y+11.5); // #72 FIX
    doc.text(localStorage.getItem("pf_nota_pago")||"CRÉDITO", rx2, y+18.5); // #73 FIX

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
    var maxFilas = items.length; // #038 FIX: todos los ítems
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
    if (local && local.trim()) doc.text("LOCAL: " + local.toUpperCase(), colX[1]+2, y+5); // #75 FIX: solo si tiene nombre
    y += 10;

    // ── TOTALES ──────────────────────────────────────────────
    var iva   = subtotal * (parseFloat(localStorage.getItem('pf_iva') || '0.15'));
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
    // #039 FIX: usar firma guardada si canvas ya fue reiniciado
    var _firmaB64 = (typeof FIRMA_GUARDADA_B64 !== "undefined" && FIRMA_GUARDADA_B64) ? FIRMA_GUARDADA_B64 : (canvas && FIRMADO ? canvas.toDataURL("image/png") : null);
    if (_firmaB64) {
      try {
        var sigData = _firmaB64;
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
    doc.text("DIR: PORTETE #3007 Y GALLEGOS LARA  |  TEL: 04-2374822 · 0978997247 · 0983588325  |  ventas_previfuego@hotmail.com", PW/2, PH-3.8, {align:"center"});

    // ── GUARDAR ──────────────────────────────────────────────
    var safeName = (LOCAL_ACTUAL ? LOCAL_ACTUAL.nombre : "LOCAL").replace(/[^a-zA-Z0-9]/g,"").substring(0,15);
    var nom      = "NE-"+numNota+"-"+safeName+".pdf";
    var blob     = doc.output("blob");
    // #7 #74 FIX: usar mismo patrón que pdf.js — no revocar hasta siguiente generación
    if (window._ULTIMO_BLOB_URL_NOTA) {
      try { URL.revokeObjectURL(window._ULTIMO_BLOB_URL_NOTA); } catch(e) {}
    }
    var blobUrl = URL.createObjectURL(blob);
    window._ULTIMO_BLOB_URL_NOTA = blobUrl;
    URLS_GENERADAS.push(blobUrl);

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

    // Registrar nota en historial del día
    if (typeof guardarHistorialDia === "function") {
      var horaNotaPDF = new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});
      guardarHistorialDia({
        local: LOCAL_ACTUAL || {nombre: cliente},
        punto: PUNTO_ACTUAL || null,
        hora: horaNotaPDF,
        fotos: 0,
        accs: items.length,
        url: blobUrl,
        nombre: nom,
        certNum: "NE-" + numNota,
        duracion: 0,
        tipo: "nota"
      });
      if (typeof renderHistorial === "function") renderHistorial();
    }

  } catch(err) {
    mostrarCargando(false);
    console.error(err);
    pfModal("Error generando nota: " + err.message);
  }
}


// ═══════════════════════════════════════════════════════════
//  INTEGRACIÓN AZUR — Emisión desde nota de entrega
// ═══════════════════════════════════════════════════════════

// Estado de la última factura emitida (para consultar estado)
var PF_ULTIMA_FACTURA = null;

// ── Leer correo guardado para un cliente ─────────────────────
function pfGetCorreoCliente(nombreLocal) {
  try {
    var correos = JSON.parse(localStorage.getItem("pf_correos_clientes") || "{}");
    return correos[nombreLocal] || "";
  } catch(e) { return ""; }
}

function pfGuardarCorreoCliente(nombreLocal, correo) {
  try {
    var correos = JSON.parse(localStorage.getItem("pf_correos_clientes") || "{}");
    correos[nombreLocal] = correo.trim().toLowerCase();
    localStorage.setItem("pf_correos_clientes", JSON.stringify(correos));
  } catch(e) {}
}

// ── Abrir modal de emisión de factura Azur ───────────────────
function pfAbrirEmitirFactura() {
  // Validar que hay datos de nota disponibles
  if (!NOTA_ACTUAL || !NOTA_ITEMS || NOTA_ITEMS.length === 0) {
    pfModal("⚠️ No hay datos de nota para facturar. Genera la nota primero.");
    return;
  }

  // Verificar que hay ítems con precio
  var hayPrecio = NOTA_ITEMS.some(function(i) { return parseFloat(i.puni) > 0; });
  if (!hayPrecio) {
    pfModal("⚠️ Ningún ítem tiene precio. No se puede emitir una factura en $0.");
    return;
  }

  // Calcular totales actuales
  var tasaIVA  = parseFloat(localStorage.getItem("pf_iva") || "0.15");
  var subtotal = 0;
  NOTA_ITEMS.forEach(function(i) { subtotal += parseFloat(i.puni || 0) * parseFloat(i.cant || 1); });
  var ivaVal   = subtotal * tasaIVA;
  var totalVal = subtotal + ivaVal;

  // Leer correo guardado
  var correoGuardado = pfGetCorreoCliente(NOTA_ACTUAL.local || "");

  // Leer RUC actual (puede haber sido editado en pantalla)
  var rucActual  = (document.getElementById("nota-ruc")    || {}).value || NOTA_ACTUAL.ruc    || "";
  var nomActual  = (document.getElementById("nota-cliente") || {}).value || NOTA_ACTUAL.cliente || "";
  var dirActual  = (document.getElementById("nota-dir")    || {}).value || NOTA_ACTUAL.direccion || "";

  // Detectar tipo de identificación para mostrar al usuario
  var tipoLabel = "RUC";
  var rucLimpio = rucActual.replace(/[^0-9]/g, "");
  if      (rucLimpio.length === 10) tipoLabel = "Cédula";
  else if (rucLimpio.length === 13) tipoLabel = "RUC";
  else if (rucLimpio.length === 0)  tipoLabel = "Consumidor Final";

  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:500;display:flex;align-items:flex-end;justify-content:center";

  var h = '<div style="background:#fff;border-radius:20px 20px 0 0;padding:0;width:100%;max-width:480px;max-height:92vh;overflow-y:auto">';

  // Header
  h += '<div style="background:var(--r);padding:16px 18px;border-radius:20px 20px 0 0;display:flex;align-items:center;justify-content:space-between">';
  h += '<div><div style="font-size:17px;font-weight:700;color:#fff">📄 Emitir Factura Electrónica</div>';
  h += '<div style="font-size:12px;color:rgba(255,255,255,.8);margin-top:2px">Azur · SRI Ecuador</div></div>';
  h += '<button id="azur-modal-close" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:22px;width:36px;height:36px;border-radius:10px;cursor:pointer">✕</button>';
  h += '</div>';

  h += '<div style="padding:16px 16px 0">';

  // Resumen de la factura
  h += '<div style="background:var(--g1);border-radius:12px;padding:12px 14px;margin-bottom:14px">';
  h += '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;margin-bottom:8px">RESUMEN</div>';
  h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;color:var(--g4)">Subtotal</span><span style="font-size:13px;font-weight:700">$' + subtotal.toFixed(2) + '</span></div>';
  h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;color:var(--g4)">IVA ' + (tasaIVA * 100).toFixed(0) + '%</span><span style="font-size:13px;font-weight:700">$' + ivaVal.toFixed(2) + '</span></div>';
  h += '<div style="display:flex;justify-content:space-between;border-top:1.5px solid var(--r);padding-top:6px;margin-top:4px"><span style="font-size:15px;font-weight:700;color:var(--r)">TOTAL</span><span style="font-size:17px;font-weight:700;color:var(--r)">$' + totalVal.toFixed(2) + '</span></div>';
  h += '</div>';

  // Datos del comprador (editables)
  h += '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;margin-bottom:6px">DATOS DEL COMPRADOR</div>';

  // Cliente
  h += '<div style="margin-bottom:8px">';
  h += '<div style="font-size:11px;color:var(--g4);margin-bottom:3px">Razón social *</div>';
  h += '<input id="azur-cliente" value="' + (nomActual || "").replace(/"/g, "&quot;") + '" style="width:100%;padding:9px 11px;border:1.5px solid var(--bo);border-radius:9px;font-family:inherit;font-size:14px;box-sizing:border-box">';
  h += '</div>';

  // RUC + tipo
  h += '<div style="display:grid;grid-template-columns:1fr auto;gap:8px;margin-bottom:8px">';
  h += '<div>';
  h += '<div style="font-size:11px;color:var(--g4);margin-bottom:3px">RUC / Cédula (vacío = Consumidor Final)</div>';
  h += '<input id="azur-ruc" value="' + (rucLimpio || "") + '" inputmode="numeric" style="width:100%;padding:9px 11px;border:1.5px solid var(--bo);border-radius:9px;font-family:inherit;font-size:14px;box-sizing:border-box" oninput="pfActualizarTipoId(this.value)">';
  h += '</div>';
  h += '<div style="display:flex;align-items:flex-end">';
  h += '<div id="azur-tipo-id" style="padding:9px 11px;border-radius:9px;background:var(--ac);color:var(--a);font-size:12px;font-weight:700;white-space:nowrap">' + tipoLabel + '</div>';
  h += '</div></div>';

  // Dirección
  h += '<div style="margin-bottom:8px">';
  h += '<div style="font-size:11px;color:var(--g4);margin-bottom:3px">Dirección</div>';
  h += '<input id="azur-dir" value="' + (dirActual || "GUAYAQUIL").replace(/"/g, "&quot;") + '" style="width:100%;padding:9px 11px;border:1.5px solid var(--bo);border-radius:9px;font-family:inherit;font-size:14px;box-sizing:border-box">';
  h += '</div>';

  // Correo
  h += '<div style="margin-bottom:14px">';
  h += '<div style="font-size:11px;color:var(--g4);margin-bottom:3px">Correo electrónico (para envío de RIDE)</div>';
  h += '<input id="azur-correo" type="email" value="' + (correoGuardado || "") + '" placeholder="facturacion@empresa.com" inputmode="email" style="width:100%;padding:9px 11px;border:1.5px solid var(--bo);border-radius:9px;font-family:inherit;font-size:14px;box-sizing:border-box">';
  h += '<div style="font-size:11px;color:var(--g3);margin-top:3px">Si lo ingresas se guarda automáticamente para este cliente</div>';
  h += '</div>';

  // Aviso consumidor final
  h += '<div id="azur-aviso-cf" style="display:' + (rucLimpio.length === 0 ? 'block' : 'none') + ';background:var(--nc);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12px;color:var(--n)">⚠️ <strong>Consumidor Final:</strong> el total no puede superar $200 según normativa SRI.</div>';

  // Botones
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-bottom:20px">';
  h += '<button id="azur-btn-cancel" style="padding:14px;border-radius:12px;border:1.5px solid var(--bo);background:#fff;color:var(--g4);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Cancelar</button>';
  h += '<button id="azur-btn-emitir" style="padding:14px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">📄 Emitir Factura</button>';
  h += '</div>';

  h += '</div></div>';

  ov.innerHTML = h;
  document.body.appendChild(ov);
  document.body.style.overflow = "hidden"; // BAJO FIX: bloquear scroll

  var _cerrarOv = function() { document.body.style.overflow = ""; document.body.removeChild(ov); };
  // Event listeners
  ov.querySelector("#azur-modal-close").onclick = _cerrarOv;
  ov.querySelector("#azur-btn-cancel").onclick   = _cerrarOv;

  ov.querySelector("#azur-btn-emitir").onclick = function() {
    var cliente = (ov.querySelector("#azur-cliente").value || "").trim();
    var ruc     = (ov.querySelector("#azur-ruc").value     || "").replace(/[^0-9]/g, "").trim();
    var dir     = (ov.querySelector("#azur-dir").value     || "").trim() || "GUAYAQUIL";
    var correo  = (ov.querySelector("#azur-correo").value  || "").trim();

    if (!cliente) { pfModal("⚠️ La razón social es obligatoria."); return; }

    // Guardar correo si fue ingresado
    if (correo && correo.indexOf("@") !== -1) {
      pfGuardarCorreoCliente(NOTA_ACTUAL.local || "", correo);
    }

    // Cerrar modal y proceder
    _cerrarOv();
    pfConfirmarEmisionFactura(cliente, ruc, dir, correo);
  };
}

// ── Actualizar badge de tipo de identificación en tiempo real ─
function pfActualizarTipoId(valor) {
  var el      = document.getElementById("azur-tipo-id");
  var avisoEl = document.getElementById("azur-aviso-cf");
  if (!el) return;
  var limpio = (valor || "").replace(/[^0-9]/g, "");
  var label, color, bg;
  if      (limpio.length === 13) { label = "RUC";            color = "var(--v)"; bg = "var(--vc)"; }
  else if (limpio.length === 10) { label = "Cédula";         color = "var(--a)"; bg = "var(--ac)"; }
  else if (limpio.length === 0)  { label = "Cons. Final";    color = "var(--n)"; bg = "var(--nc)"; }
  else                           { label = limpio.length + " dígitos"; color = "var(--g4)"; bg = "var(--g2)"; }
  el.textContent = label;
  el.style.color = color;
  el.style.background = bg;
  if (avisoEl) avisoEl.style.display = limpio.length === 0 ? "block" : "none";
}

// ── Confirmar y enviar factura ───────────────────────────────
function pfConfirmarEmisionFactura(cliente, ruc, dir, correo) {
  var tasaIVA  = parseFloat(localStorage.getItem("pf_iva") || "0.15");
  var subtotal = 0;
  NOTA_ITEMS.forEach(function(i) { subtotal += parseFloat(i.puni || 0) * parseFloat(i.cant || 1); });
  var total = subtotal * (1 + tasaIVA);

  var msg = "¿Emitir factura electrónica?\n\n";
  msg += "Cliente: " + cliente + "\n";
  msg += "RUC/CI:  " + (ruc || "Consumidor Final") + "\n";
  msg += "Total:   $" + total.toFixed(2) + "\n\n";
  msg += "Esta acción emite el comprobante en el SRI y no se puede cancelar fácilmente.";

  pfConfirm(msg, function() {
    pfEnviarFacturaAzur(cliente, ruc, dir, correo);
  });
}

// ── Enviar factura vía Apps Script → Azur ───────────────────
var _pfAzurEnviando = false;
function pfEnviarFacturaAzur(cliente, ruc, dir, correo) {
  // CRÍTICO FIX: guard contra doble envío
  if (_pfAzurEnviando) { pfModal("⚠️ Ya hay una factura en proceso. Espera."); return; }
  _pfAzurEnviando = true;
  if (!NOTA_ACTUAL || !NOTA_ITEMS || !NOTA_ITEMS.length) {
    _pfAzurEnviando = false;
    pfModal("⚠️ Sin datos de nota para facturar.");
    return;
  }

  mostrarCargando(true, "Emitiendo factura...", "Conectando con Azur SRI");

  // Fecha actual en formato dd/MM/YYYY para que Code.gs la convierta
  var d = new Date();
  var ec = new Date(d.toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
  var fechaHoyEC = String(ec.getDate()).padStart(2,"0") + "/" +
                   String(ec.getMonth()+1).padStart(2,"0") + "/" +
                   ec.getFullYear();

  // Leer certNum si existe (del PDF generado)
  var certNum = (typeof CERT_CONTADOR !== "undefined" && CERT_CONTADOR)
    ? (NOTA_ACTUAL.local || "").substring(0,8).toUpperCase().replace(/[^A-Z0-9]/g,"") + "-MANT EXTINTORES-" + ec.getFullYear()
    : "";

  var payload = {
    accion:    "emitir_factura_azur",
    cliente:   cliente,
    ruc:       ruc,
    direccion: dir,
    correo:    correo,
    local:     NOTA_ACTUAL.local || cliente,
    fecha:     fechaHoyEC,
    certNum:   certNum,
    tecnico:   typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "Alejandro",
    tasaIVA:   parseFloat(localStorage.getItem("pf_iva") || "0.15"),
    items:     NOTA_ITEMS.map(function(i) {
      return {
        desc: i.desc || "Servicio mantenimiento extintores",
        puni: parseFloat(i.puni || 0),
        cant: parseFloat(i.cant || 1)
      };
    }).filter(function(i) { return i.puni > 0; }) // solo ítems con precio
  };

  var _surl = typeof SCRIPT_URL !== "undefined" ? SCRIPT_URL : "";
  if (!_surl) { _pfAzurEnviando=false; mostrarCargando(false); pfModal("❌ No está configurada la URL del servidor. Contacta a Alejandro."); return; }
  fetch(_surl, { // BAJO FIX: verificar SCRIPT_URL
    method: "POST",
    body:   JSON.stringify(payload)
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    _pfAzurEnviando = false; // CRÍTICO FIX: resetear guard
    mostrarCargando(false);
    if (data.ok) {
      // Guardar clave de acceso para consultas futuras
      PF_ULTIMA_FACTURA = {
        claveAcceso: data.claveAcceso,
        cliente:     cliente,
        total:       data.total,
        fecha:       fechaHoyEC,
        local:       NOTA_ACTUAL.local || ""
      };
      try {
        var hist = JSON.parse(localStorage.getItem("pf_facturas_emitidas") || "[]");
        hist.unshift(PF_ULTIMA_FACTURA);
        localStorage.setItem("pf_facturas_emitidas", JSON.stringify(hist.slice(0, 100)));
      } catch(e) {}

      pfModal(
        "✅ Factura emitida correctamente\n\n" +
        "Cliente: " + cliente + "\n" +
        "Total: $" + data.total + "\n\n" +
        "Clave de acceso:\n" + data.claveAcceso + "\n\n" +
        "Azur enviará el RIDE al correo del cliente automáticamente."
      );
    } else {
      var errorTxt = "❌ Error al emitir factura:\n\n";
      if (data.errores && data.errores.length) {
        errorTxt += data.errores.join("\n");
      } else {
        errorTxt += data.msg || "Error desconocido";
      }
      pfModal(errorTxt);
    }
  })
  .catch(function(err) {
    _pfAzurEnviando = false; // CRÍTICO FIX: resetear guard en error
    mostrarCargando(false);
    pfModal("❌ Error de conexión: " + err.message + "\n\nVerifica tu internet e intenta de nuevo.");
  });
}

// #78 FIX: limpiar campos de la nota
function pfLimpiarNota() {
  pfConfirm("¿Limpiar todos los campos de la nota?", function() {
    NOTA_ITEMS = [];
    var campos = ["nota-cliente","nota-dir","nota-ruc","nota-tel","nota-proforma","nota-marca"];
    campos.forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ""; });
    renderNotaItems();
  });
}
