// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO FIELD — app.js  v3.1
//  Bloque A: PDF fixes + tipo trabajo + fotos libres + roles
// ═══════════════════════════════════════════════════════════

var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsGUa-Z31KwPkixPxM8tLgEoyj7HsYRmdic8-HCuE9ZLjBfCYSGPJKmNDT9jOITxlO/exec";
var VERSION    = "3.3";

// ── ACCESORIOS ───────────────────────────────────────────────
var ACCESORIOS = [
  {id:"abrazadera",      n:"Abrazadera plástica",    p:1.50},
  {id:"manometro",       n:"Manómetro PQS",           p:2.80},
  {id:"cabezal_pqs",     n:"Cabezal extintor PQS",    p:8.80},
  {id:"manguera_pqs",    n:"Manguera PQS",             p:4.80},
  {id:"corneta_co2_5",   n:"Corneta CO₂ 5 lbs",       p:8.80},
  {id:"corneta_co2_10",  n:"Corneta CO₂ 10 lbs",      p:0},
  {id:"manguera_co2_10", n:"Manguera CO₂ 10 lbs",     p:13.80},
  {id:"empaque",         n:"Empaque válvula",          p:1.50},
  {id:"soporte",         n:"Soporte metálico",         p:5.00},
  {id:"piton",           n:"Pitón",                    p:1.50},
  {id:"tubo_sifon",      n:"Tubo sifón",               p:2.00},
  {id:"boquilla",        n:"Boquilla",                 p:1.00},
  {id:"valvula_pqs",     n:"Válvula PQS",              p:3.00},
  {id:"pintura",         n:"Pintura sintética",         p:2.00},
  {id:"letrero",         n:"Letrero señalética",        p:3.50},
  {id:"soporte_pared",   n:"Soporte de pared",          p:5.00}
];

// ── USUARIOS ─────────────────────────────────────────────────
var USUARIOS = {
  raul:      { nombre:"Raúl Romero", rol:"Técnico Operativo y Logístico", emoji:"👷" },
  juan:      { nombre:"Juan",        rol:"Técnico Operativo y Logístico", emoji:"👷" },
  fabiola:   { nombre:"Fabiola",     rol:"Administración y Taller",       emoji:"💼" },
  alejandro: { nombre:"Alejandro",   rol:"Jefe de Operaciones",           emoji:"👔" }
};

// ── TIPOS DE TRABAJO ─────────────────────────────────────────
// Detectado automáticamente desde la misión
var TIPOS_TRABAJO = {
  MANTENIMIENTO: "mantenimiento", // fotos Antes/Después/CO2 + certificado + firma
  RETIRO:        "retiro",        // foto de lo retirado + recibo
  ENTREGA:       "entrega",       // foto de entrega + certificado + nota entrega
  INSTALACION:   "instalacion",   // fotos libres (N fotos) + firma, sin certificado
  COBRO:         "cobro",         // sin fotos, sin certificado
  OTRO:          "otro"           // foto libre opcional
};

function detectarTipoTrabajo(mision) {
  if (!mision) return TIPOS_TRABAJO.MANTENIMIENTO;
  var m = mision.toLowerCase();
  if (/retir|llevar al taller|llevar a taller/.test(m))          return TIPOS_TRABAJO.RETIRO;
  if (/entregar|entrega|devolver|devolu/.test(m))                return TIPOS_TRABAJO.ENTREGA;
  if (/instalar|instalaci|colocar|etiqueta/.test(m))             return TIPOS_TRABAJO.INSTALACION;
  if (/cobro|cheque|pago|retirar cheque|retirar pago/.test(m))   return TIPOS_TRABAJO.COBRO;
  if (/mantenimiento|mant|recarga|revisar|inspeccionar/.test(m)) return TIPOS_TRABAJO.MANTENIMIENTO;
  return TIPOS_TRABAJO.OTRO;
}

// ── ESTADO GLOBAL ────────────────────────────────────────────
var USUARIO_ACTUAL  = null;
var JORNADAS        = [];  // [{jornada:"MAÑANA"|"TARDE", puntos:[]}]
var JORNADA_ACTIVA  = 0;   // índice de jornada actual
var PUNTOS          = [];  // puntos de la jornada activa
var PUNTO_ACTUAL    = null;
var LOCAL_ACTUAL    = null;
var TIPO_TRABAJO    = TIPOS_TRABAJO.MANTENIMIENTO;
var FD              = {};
var FB64            = {};
var FOTOS_COUNT     = 0;
var ACCS            = [], NOV = null, FIRMADO = false, HISTORIAL = [];
var canvas, ctx, drawing = false, trazado = false;
var CERT_CONTADOR   = parseInt(localStorage.getItem("pf_certCount") || "0");
var URLS_GENERADAS  = [];
var TIMER_INICIO    = null;   // timestamp al abrir un local
var TIMER_INTERVAL  = null;   // setInterval del timer
var HISTORIAL_DIA   = [];     // historial persistente (localStorage)
var TECNICO_NOMBRE  = "Raúl Romero";
// Pizarra digital
var PIZARRA         = { operativa:[], logistica:[], pendientes:[] };

// ── NAVEGACIÓN ───────────────────────────────────────────────
function ir(id) {
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("active"); });
  var el = document.getElementById(id);
  if (el) { el.classList.add("active"); window.scrollTo(0,0); }
}

// ── FECHA ────────────────────────────────────────────────────
function initFecha() {
  var d     = new Date();
  var dias  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  var meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  var el    = document.getElementById("s1f");
  if (el) el.textContent = dias[d.getDay()]+" "+d.getDate()+" "+meses[d.getMonth()];
}

function fechaHoy() {
  var d = new Date();
  return String(d.getDate()).padStart(2,"0")+"/"+
         String(d.getMonth()+1).padStart(2,"0")+"/"+
         d.getFullYear();
}

// ── LOGO ─────────────────────────────────────────────────────
function initLogos() {
  if (typeof LOGO_B64 === "undefined") return;
  var el = document.getElementById("lcd");
  if (el) el.setAttribute("data-b64", LOGO_B64);
  var src = "data:image/png;base64,"+LOGO_B64;
  document.querySelectorAll(".logo-img").forEach(function(img){ img.src = src; });
}

// ════════════════════════════════════════════════════════════
//  SELECCIÓN DE USUARIO
// ════════════════════════════════════════════════════════════
function seleccionarUsuario(key) {
  USUARIO_ACTUAL = key;
  TECNICO_NOMBRE = USUARIOS[key].nombre;
  localStorage.setItem("pf_usuario", key);
  document.querySelectorAll(".ts-nombre").forEach(function(el){ el.textContent = TECNICO_NOMBRE; });
  document.querySelectorAll(".sperf-nom").forEach(function(el){ el.textContent = TECNICO_NOMBRE; });
  document.querySelectorAll(".sperf-rol").forEach(function(el){ el.textContent = USUARIOS[key].rol; });
  if (key === "alejandro") { ir("sadmin"); cargarRecorridoAdmin(); }
  else { ir("s1"); cargarRecorrido(); }
}

// ════════════════════════════════════════════════════════════
//  PARSER DE RECORRIDO — soporta JORNADA MAÑANA / TARDE
// ════════════════════════════════════════════════════════════

function parsearJornadas(texto) {
  // Detectar si hay múltiples jornadas
  var reJornada = /JORNADA\s+(MAÑANA|TARDE|NOCHE)/i;
  var lineas    = texto.split("\n");
  var jornadas  = [];
  var jornadaActual = null;
  var bufferLineas  = [];

  for (var i = 0; i < lineas.length; i++) {
    var l = lineas[i].trim();
    var mJ = l.match(reJornada);
    if (mJ) {
      if (jornadaActual && bufferLineas.length > 0) {
        jornadaActual.puntos = parsearRecorrido(bufferLineas.join("\n"));
        if (jornadaActual.puntos.length > 0) jornadas.push(jornadaActual);
      }
      jornadaActual = { jornada: mJ[1].toUpperCase(), label: "Jornada " + capitalizar(mJ[1]), puntos: [] };
      bufferLineas  = [];
    } else {
      bufferLineas.push(lineas[i]);
    }
  }
  // Última jornada
  if (jornadaActual && bufferLineas.length > 0) {
    jornadaActual.puntos = parsearRecorrido(bufferLineas.join("\n"));
    if (jornadaActual.puntos.length > 0) jornadas.push(jornadaActual);
  }

  // Si no hay jornadas explícitas — todo es una sola jornada
  if (jornadas.length === 0) {
    var puntos = parsearRecorrido(texto);
    if (puntos.length > 0) jornadas.push({ jornada:"DIA", label:"Jornada del día", puntos:puntos });
  }
  return jornadas;
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function parsearRecorrido(texto) {
  var lineas  = texto.split("\n").map(function(l){ return l.trim(); }).filter(function(l){ return l.length > 0; });
  var puntos  = [];
  var puntoActual = null;
  var localActual = null;
  var misionBuffer = [];
  var localIdCounter = 0;
  var rePunto  = /^Punto\s+(\d+)\s*[–\-—]\s*(.+)$/i;
  var reMision = /^Misión\s*:/i;
  var reBullet = /^\*\s+.+/;

  function guardarLocal() {
    if (localActual && puntoActual) {
      localActual.mision = misionBuffer.join("\n").trim();
      localActual.tipo   = detectarTipoTrabajo(localActual.mision);
      puntoActual.locales.push(localActual);
      localActual  = null;
      misionBuffer = [];
    }
  }

  function guardarPunto() {
    guardarLocal();
    if (puntoActual && puntoActual.locales.length > 0) puntos.push(puntoActual);
    puntoActual = null;
  }

  for (var i = 0; i < lineas.length; i++) {
    var l = lineas[i];
    var mPunto = l.match(rePunto);
    if (mPunto) {
      guardarPunto();
      puntoActual = { num: parseInt(mPunto[1]), nombre: mPunto[2].trim(), locales: [] };
      localIdCounter++;
      localActual  = { id: localIdCounter, nombre: mPunto[2].trim(), mision: "", tipo: TIPOS_TRABAJO.MANTENIMIENTO, done: false, ext: [] };
      misionBuffer = [];
      continue;
    }
    if (reMision.test(l)) {
      var resto = l.replace(/^Misión\s*:\s*/i, "").trim();
      if (resto) misionBuffer.push(resto);
      continue;
    }
    if (reBullet.test(l)) { misionBuffer.push(l); continue; }
    var sigLinea = (i+1 < lineas.length) ? lineas[i+1] : "";
    var esSubLocal = puntoActual && !reMision.test(l) && !reBullet.test(l) && !rePunto.test(l) &&
                     (reMision.test(sigLinea) || sigLinea === "") && localActual && localActual.nombre !== l;
    if (esSubLocal) {
      guardarLocal();
      localIdCounter++;
      localActual  = { id: localIdCounter, nombre: l, mision: "", tipo: TIPOS_TRABAJO.MANTENIMIENTO, done: false, ext: [] };
      misionBuffer = [];
      continue;
    }
    if (misionBuffer.length > 0 || (localActual && l)) misionBuffer.push(l);
  }
  guardarPunto();
  return puntos;
}

// ════════════════════════════════════════════════════════════
//  PANEL ADMIN — Alejandro
// ════════════════════════════════════════════════════════════
function cargarRecorridoAdmin() {
  var saved = localStorage.getItem("pf_recorrido_texto");
  if (saved) { document.getElementById("admin-txt").value = saved; previsualizarRecorrido(); }
  cargarPizarra();
  renderPizarra();
  renderCalendarioMes();
}

// ── PIZARRA DIGITAL ──────────────────────────────────────────
function cargarPizarra() {
  try {
    var saved = localStorage.getItem("pf_pizarra");
    if (saved) PIZARRA = JSON.parse(saved);
  } catch(e) {}
}

function guardarPizarra() {
  localStorage.setItem("pf_pizarra", JSON.stringify(PIZARRA));
}

function renderPizarra() {
  renderPizarraSeccion("operativa",  "piz-operativa");
  renderPizarraSeccion("logistica",  "piz-logistica");
  renderPizarraSeccion("pendientes", "piz-pendientes");
}

function renderPizarraSeccion(seccion, elId) {
  var el = document.getElementById(elId);
  if (!el) return;
  var items = PIZARRA[seccion] || [];
  var h = "";
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var colBg = item.estado === "done" ? "var(--vc)" : item.estado === "urgente" ? "var(--rc)" : "#fff";
    var colTx = item.estado === "done" ? "var(--v)"  : item.estado === "urgente" ? "var(--r)"  : "var(--ng)";
    h += '<div class="piz-item" style="background:'+colBg+';border-color:'+(item.estado==="urgente"?"var(--r)":"var(--bo)")+'">';
    h += '<div style="flex:1">';
    h += '<div style="font-size:14px;font-weight:700;color:'+colTx+';'+(item.estado==="done"?"text-decoration:line-through":"")+'">'+item.texto+'</div>';
    if (item.nota) h += '<div style="font-size:11px;color:var(--g4);margin-top:2px">'+item.nota+'</div>';
    h += '</div>';
    h += '<div style="display:flex;gap:6px;flex-shrink:0">';
    if (item.estado !== "done") h += '<button class="piz-btn piz-ok"  onclick="pizarraAccion(''+seccion+'','+i+','done')">✓</button>';
    if (item.estado === "done") h += '<button class="piz-btn piz-undo" onclick="pizarraAccion(''+seccion+'','+i+','undo')">↩</button>';
    h += '<button class="piz-btn piz-del" onclick="pizarraAccion(''+seccion+'','+i+','del')">✕</button>';
    h += '</div></div>';
  }
  if (items.length === 0) h = '<div style="font-size:13px;color:var(--g3);padding:8px 0">Sin tareas</div>';
  el.innerHTML = h;
}

function pizarraAgregar(seccion) {
  var inputEl = document.getElementById("piz-input-"+seccion);
  var notaEl  = document.getElementById("piz-nota-"+seccion);
  if (!inputEl) return;
  var txt  = inputEl.value.trim();
  if (!txt) return;
  var nota = notaEl ? notaEl.value.trim() : "";
  PIZARRA[seccion].unshift({ texto:txt, nota:nota, estado:"pendiente", fecha:fechaHoy() });
  inputEl.value = "";
  if (notaEl) notaEl.value = "";
  guardarPizarra();
  renderPizarraSeccion(seccion, "piz-"+seccion);
}

function pizarraAccion(seccion, idx, accion) {
  if (accion === "done")   PIZARRA[seccion][idx].estado = "done";
  if (accion === "undo")   PIZARRA[seccion][idx].estado = "pendiente";
  if (accion === "urgente") PIZARRA[seccion][idx].estado = "urgente";
  if (accion === "del")    PIZARRA[seccion].splice(idx, 1);
  guardarPizarra();
  renderPizarraSeccion(seccion, "piz-"+seccion);
}

// ── CALENDARIO DEL MES ───────────────────────────────────────
function renderCalendarioMes() {
  var el = document.getElementById("admin-calendario");
  if (!el) return;
  var data = localStorage.getItem("pf_recorrido_data");
  if (!data) { el.innerHTML = '<div style="font-size:13px;color:var(--g3)">No hay recorrido publicado hoy</div>'; return; }
  try {
    var puntos = JSON.parse(data);
    var total  = 0, done = 0;
    for (var i = 0; i < puntos.length; i++) {
      for (var j = 0; j < puntos[i].locales.length; j++) {
        total++;
        if (puntos[i].locales[j].done) done++;
      }
    }
    var pct = total > 0 ? Math.round(done/total*100) : 0;
    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px">'+
      '<div style="font-size:28px;font-weight:700;color:var(--r)">'+pct+'%</div>'+
      '<div><div style="font-size:14px;font-weight:700">Avance de hoy</div>'+
      '<div style="font-size:12px;color:var(--g4)">'+done+' de '+total+' locales completados</div></div></div>';
  } catch(e) {}
}

function previsualizarRecorrido() {
  var txt  = document.getElementById("admin-txt").value.trim();
  var prev = document.getElementById("admin-prev");
  if (!txt) { prev.innerHTML = '<div class="empty">Pega el recorrido arriba para previsualizarlo</div>'; return; }
  var puntos = parsearRecorrido(txt);
  if (puntos.length === 0) { prev.innerHTML = '<div class="empty">No se detectaron puntos. Verifica el formato.</div>'; return; }

  var tipoLabel = { mantenimiento:"🔧 Mantenimiento", retiro:"📦 Retiro", entrega:"🚚 Entrega", instalacion:"🔩 Instalación", cobro:"💰 Cobro", otro:"📋 Otro" };
  var h = '<div class="slbl">'+puntos.length+' punto(s) detectado(s)</div>';
  for (var i = 0; i < puntos.length; i++) {
    var p = puntos[i];
    h += '<div class="cd" style="margin-bottom:8px">';
    h += '<div style="padding:12px 14px;background:var(--r);border-radius:12px 12px 0 0">';
    h += '<div style="font-size:13px;font-weight:700;color:#fff">📍 Punto '+p.num+' — '+p.nombre+'</div>';
    h += '<div style="font-size:11px;color:rgba(255,255,255,.75);margin-top:2px">'+p.locales.length+' local(es)</div></div>';
    for (var j = 0; j < p.locales.length; j++) {
      var loc = p.locales[j];
      h += '<div style="padding:10px 14px;border-bottom:1px solid var(--bo)">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
      h += '<div style="font-size:14px;font-weight:700;color:var(--ng)">'+loc.nombre+'</div>';
      h += '<div style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;background:var(--ac);color:var(--a)">'+(tipoLabel[loc.tipo]||loc.tipo)+'</div></div>';
      if (loc.mision) h += '<div style="font-size:12px;color:var(--g4);line-height:1.5;white-space:pre-wrap">'+loc.mision+'</div>';
      h += '</div>';
    }
    h += '</div>';
  }
  prev.innerHTML = h;
}

function publicarRecorrido() {
  var txt = document.getElementById("admin-txt").value.trim();
  if (!txt) { alert("Escribe o pega el recorrido primero."); return; }
  var jornadas = parsearJornadas(txt);
  if (jornadas.length === 0) { alert("No se detectaron puntos. Verifica el formato."); return; }
  mostrarCargando(true, "Publicando recorrido...", "Guardando en el servidor");
  localStorage.setItem("pf_recorrido_texto",   txt);
  localStorage.setItem("pf_recorrido_fecha",   fechaHoy());
  localStorage.setItem("pf_recorrido_jornadas", JSON.stringify(jornadas));
  // Compatibilidad: guardar puntos de primera jornada como data legacy
  localStorage.setItem("pf_recorrido_data", JSON.stringify(jornadas[0].puntos));
  var payload = { accion:"publicar_recorrido", fecha:fechaHoy(), tecnico:"Raúl Romero", texto:txt, jornadas:jornadas };
  fetch(SCRIPT_URL, { method:"POST", body:JSON.stringify(payload) })
    .then(function(r){ return r.json(); })
    .catch(function(){})
    .finally(function(){
      mostrarCargando(false);
      renderCalendarioMes();
      var ok = document.getElementById("admin-pub-ok");
      if (ok) { ok.style.display = "block"; setTimeout(function(){ ok.style.display = "none"; }, 3000); }
    });
}

function limpiarRecorrido() {
  if (!confirm("¿Borrar el recorrido actual?")) return;
  document.getElementById("admin-txt").value = "";
  document.getElementById("admin-prev").innerHTML = '<div class="empty">Pega el recorrido arriba para previsualizarlo</div>';
  localStorage.removeItem("pf_recorrido_texto");
  localStorage.removeItem("pf_recorrido_data");
}

// ════════════════════════════════════════════════════════════
//  CARGA DE RECORRIDO
// ════════════════════════════════════════════════════════════
function cargarRecorrido() {
  mostrarCargando(true, "Cargando recorrido...", "Conectando con el servidor");
  var url = SCRIPT_URL + "?accion=recorrido_texto&fecha=" + encodeURIComponent(fechaHoy());
  fetch(url)
    .then(function(r){ if (!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
    .then(function(data){
      mostrarCargando(false);
      if (data.ok && data.texto) {
        var jornadas = parsearJornadas(data.texto);
        if (jornadas.length > 0) { procesarJornadas(jornadas, data.tecnico||"Raúl Romero"); return; }
      }
      cargarRecorridoLocal();
    })
    .catch(function(){ mostrarCargando(false); cargarRecorridoLocal(); });
}

function cargarRecorridoLocal() {
  var fecha    = localStorage.getItem("pf_recorrido_fecha");
  var jorData  = localStorage.getItem("pf_recorrido_jornadas");
  var legData  = localStorage.getItem("pf_recorrido_data");
  if (fecha === fechaHoy()) {
    if (jorData) {
      try { procesarJornadas(JSON.parse(jorData), "Raúl Romero"); return; } catch(e) {}
    }
    if (legData) {
      try { procesarPuntos(JSON.parse(legData), "Raúl Romero"); return; } catch(e) {}
    }
  }
  mostrarSinRecorrido();
}

function procesarJornadas(jornadas, tecnico) {
  JORNADAS       = jornadas;
  JORNADA_ACTIVA = 0;
  TECNICO_NOMBRE = tecnico || "Raúl Romero";
  document.querySelectorAll(".ts-nombre").forEach(function(el){ el.textContent = TECNICO_NOMBRE; });
  // Si hay más de una jornada mostrar selector
  if (jornadas.length > 1) {
    renderSelectorJornada();
  } else {
    PUNTOS = jornadas[0].puntos;
    renderPuntos();
  }
}

function procesarPuntos(puntos, tecnico) {
  PUNTOS = puntos;
  JORNADAS = [{ jornada:"DIA", label:"Jornada del día", puntos:puntos }];
  JORNADA_ACTIVA = 0;
  TECNICO_NOMBRE = tecnico || "Raúl Romero";
  document.querySelectorAll(".ts-nombre").forEach(function(el){ el.textContent = TECNICO_NOMBRE; });
  renderPuntos();
}

function seleccionarJornada(idx) {
  JORNADA_ACTIVA = idx;
  PUNTOS = JORNADAS[idx].puntos;
  renderPuntos();
}

function renderSelectorJornada() {
  var lista = document.getElementById("s1list");
  if (!lista) return;
  var h = '<div class="slbl">Selecciona la jornada</div>';
  for (var i = 0; i < JORNADAS.length; i++) {
    var jor     = JORNADAS[i];
    var emoji   = jor.jornada === "TARDE" ? "🌙" : "☀️";
    var color   = jor.jornada === "TARDE" ? "var(--a)" : "var(--r)";
    var total   = 0, done = 0;
    for (var j = 0; j < jor.puntos.length; j++)
      for (var k = 0; k < jor.puntos[j].locales.length; k++) { total++; if (jor.puntos[j].locales[k].done) done++; }
    h += '<div class="cd" onclick="seleccionarJornada('+i+')" style="cursor:pointer">';
    h += '<div class="pr">';
    h += '<div class="pn" style="background:'+color+';color:#fff;font-size:20px">'+emoji+'</div>';
    h += '<div class="pi"><div class="pnm">'+jor.label+'</div>';
    h += '<div class="psb">'+done+'/'+total+' locales completados</div></div>';
    h += '<div class="pch">›</div></div></div>';
  }
  lista.innerHTML = h;
  // Limpiar barra de progreso
  var s1p = document.getElementById("s1p"); var s1pf = document.getElementById("s1pf");
  if (s1p)  s1p.textContent  = "Elige jornada";
  if (s1pf) s1pf.style.width = "0%";
}

// ── RENDER PUNTOS ────────────────────────────────────────────
var TIPO_ICON = { mantenimiento:"🔧", retiro:"📦", entrega:"🚚", instalacion:"🔩", cobro:"💰", otro:"📋" };
var TIPO_COLOR = { mantenimiento:"var(--a)", retiro:"var(--n)", entrega:"var(--v)", instalacion:"var(--r)", cobro:"#888", otro:"var(--g4)" };
var TIPO_BG    = { mantenimiento:"var(--ac)", retiro:"var(--nc)", entrega:"var(--vc)", instalacion:"var(--rc)", cobro:"var(--g1)", otro:"var(--g1)" };

function renderPuntos() {
  var lista = document.getElementById("s1list");
  if (!lista) return;
  var total = 0, comp = 0;
  for (var i = 0; i < PUNTOS.length; i++)
    for (var j = 0; j < PUNTOS[i].locales.length; j++) { total++; if (PUNTOS[i].locales[j].done) comp++; }
  var s1p  = document.getElementById("s1p");
  var s1pf = document.getElementById("s1pf");
  if (s1p)  s1p.textContent  = comp+"/"+total+" misiones";
  if (s1pf) s1pf.style.width = total > 0 ? (comp/total*100)+"%" : "0%";
  if (PUNTOS.length === 0) { mostrarSinRecorrido(); return; }
  // Header de jornada activa
  var jorActual = JORNADAS[JORNADA_ACTIVA];
  var h = "";
  if (JORNADAS.length > 1 && jorActual) {
    var emoji = jorActual.jornada === "TARDE" ? "🌙" : "☀️";
    var col   = jorActual.jornada === "TARDE" ? "var(--a)" : "var(--r)";
    h += '<div style="margin:8px 12px 4px;padding:10px 14px;background:'+col+';border-radius:12px;display:flex;align-items:center;justify-content:space-between">';
    h += '<div style="font-size:14px;font-weight:700;color:#fff">'+emoji+' '+jorActual.label+'</div>';
    h += '<button onclick="renderSelectorJornada()" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;cursor:pointer">Cambiar</button>';
    h += '</div>';
  }
  for (var i = 0; i < PUNTOS.length; i++) {
    var p = PUNTOS[i];
    h += '<div class="slbl">📍 Punto '+p.num+' — '+p.nombre+'</div>';
    for (var j = 0; j < p.locales.length; j++) {
      var loc  = p.locales[j];
      var tipo = loc.tipo || TIPOS_TRABAJO.OTRO;
      var ico  = TIPO_ICON[tipo]  || "📋";
      var col  = TIPO_COLOR[tipo] || "var(--g4)";
      var bg   = TIPO_BG[tipo]    || "var(--g1)";
      h += '<div class="cd'+(loc.done?" dn":"")+'" onclick="abrirLocal('+i+','+j+')">';
      h += '<div class="pr">';
      h += '<div class="pn" style="'+(loc.done?'background:var(--vc);color:var(--v)':'background:'+bg+';color:'+col)+'">'+ico+'</div>';
      h += '<div class="pi"><div class="pnm">'+loc.nombre+'</div>';
      h += '<div class="psb">'+(loc.done?"Completado ✓":p.nombre)+'</div></div>';
      h += '<div class="pch">'+(loc.done?"✓":"›")+'</div></div>';
      if (loc.mision && !loc.done) {
        var misionCorta = loc.mision.length > 80 ? loc.mision.substring(0,80)+"..." : loc.mision;
        h += '<div style="padding:0 14px 10px;font-size:12px;color:var(--g4);line-height:1.5">'+misionCorta+'</div>';
      }
      h += '</div>';
    }
  }
  lista.innerHTML = h;
}

function mostrarSinRecorrido() {
  var lista = document.getElementById("s1list");
  if (!lista) return;
  lista.innerHTML = '<div style="margin:16px;padding:24px;background:#fff;border-radius:14px;border:1.5px dashed var(--bo);text-align:center;color:var(--g4);font-size:14px;line-height:1.8">📋 No hay recorrido publicado para hoy.<br>Alejandro debe publicar el recorrido.<br><br><button type="button" class="btn btn-g" style="font-size:13px;padding:10px 16px;width:auto" onclick="cargarRecorrido()">🔄 Reintentar</button></div>';
  var s1p = document.getElementById("s1p"); var s1pf = document.getElementById("s1pf");
  if (s1p)  s1p.textContent  = "0/0 misiones";
  if (s1pf) s1pf.style.width = "0%";
}

// ════════════════════════════════════════════════════════════
//  ABRIR LOCAL
// ════════════════════════════════════════════════════════════
function abrirLocal(pi, li) {
  var p   = PUNTOS[pi];
  var loc = p.locales[li];
  PUNTO_ACTUAL    = p;
  LOCAL_ACTUAL    = loc;
  LOCAL_ACTUAL._pi = pi;
  LOCAL_ACTUAL._li = li;
  TIPO_TRABAJO    = loc.tipo || detectarTipoTrabajo(loc.mision);

  // Reset fotos
  FD = {}; FB64 = {}; FOTOS_COUNT = 0;
  ACCS = []; NOV = null; FIRMADO = false;
  borrarFirma();

  var btnNov = document.getElementById("btn-nov");
  var btnOk  = document.getElementById("btn-ok");
  var accSec = document.getElementById("acc-sec");
  var accLis = document.getElementById("acc-lista");
  var accTot = document.getElementById("acc-tot");
  if (btnNov) btnNov.className = "nb";
  if (btnOk)  btnOk.className  = "nb";
  if (accSec) accSec.style.display  = "none";
  if (accLis) accLis.innerHTML = "";
  if (accTot) accTot.textContent = "$0.00";

  // Llenar UI
  var s2t = document.getElementById("s2t"); if (s2t) s2t.textContent = loc.nombre;
  var s2s = document.getElementById("s2s"); if (s2s) s2s.textContent = "Punto "+p.num+" · "+p.nombre;
  var s2c = document.getElementById("s2c"); if (s2c) s2c.textContent = p.nombre;
  var s2n = document.getElementById("s2n"); if (s2n) s2n.textContent = loc.nombre;
  var s2b = document.getElementById("s2-badge"); if (s2b) s2b.textContent = loc.done?"Completado":"Pendiente";
  var s2m = document.getElementById("s2m"); if (s2m) s2m.textContent = loc.mision || "Sin misión especificada.";
  var s2e = document.getElementById("s2e");
  if (s2e) s2e.textContent = new Date().toLocaleDateString("es-EC",{day:"numeric",month:"long",year:"numeric"});

  // Extintores
  var extSec = document.getElementById("s2es"); var extDiv = document.getElementById("s2el");
  if (loc.ext && loc.ext.length > 0 && extSec && extDiv) {
    extSec.style.display = "block";
    var eh = '<div class="ext-h">'+loc.ext.length+' extintor'+(loc.ext.length>1?"es":"")+'</div>';
    for (var i = 0; i < loc.ext.length; i++) {
      var e = loc.ext[i];
      eh += '<div class="erow"><span class="eloc">'+(e.l||e.ubicacion||"")+'</span><span class="etip">'+(e.t||e.tipo||"")+'</span><span class="ew">'+(e.w||e.capacidad||"")+'</span><div class="eck" id="eck_'+pi+'_'+li+'_'+i+'" onclick="toggleExt('+pi+','+li+','+i+')"></div></div>';
    }
    extDiv.innerHTML = eh;
  } else if (extSec) {
    extSec.style.display = "none";
  }

  // Botón según tipo de trabajo
  var btnFot = document.getElementById("s2-btn-fot");
  var btnSin = document.getElementById("s2-btn-sin");
  if (TIPO_TRABAJO === TIPOS_TRABAJO.COBRO) {
    if (btnFot) btnFot.style.display = "none";
    if (btnSin) btnSin.textContent = "✓ Marcar como completado";
  } else {
    if (btnFot) { btnFot.style.display = "flex"; btnFot.textContent = "📷 " + labelBotonFotos(); }
    if (btnSin) btnSin.textContent = "✓ Completar sin registro";
  }

  var sfott = document.getElementById("sfott"); if (sfott) sfott.textContent = loc.nombre;
  var sfirt = document.getElementById("sfirt"); if (sfirt) sfirt.textContent = loc.nombre;

  // Configurar pantalla de fotos según tipo
  configurarPantallaFotos();

  // Iniciar timer
  iniciarTimer();
  ir("s2");
}

function labelBotonFotos() {
  switch (TIPO_TRABAJO) {
    case TIPOS_TRABAJO.RETIRO:      return "Registrar retiro y firma";
    case TIPOS_TRABAJO.ENTREGA:     return "Registrar entrega y firma";
    case TIPOS_TRABAJO.INSTALACION: return "Registrar fotos de instalación";
    case TIPOS_TRABAJO.COBRO:       return "—";
    default:                        return "Registrar fotos y firma";
  }
}

function configurarPantallaFotos() {
  var titulo = document.getElementById("sfot-titulo");
  var contenedor = document.getElementById("sfot-fotos");
  if (!contenedor) return;

  if (TIPO_TRABAJO === TIPOS_TRABAJO.INSTALACION || TIPO_TRABAJO === TIPOS_TRABAJO.OTRO) {
    // Fotos libres — mostrar UI dinámica
    contenedor.innerHTML = renderFotosLibres();
  } else {
    // Fotos fijas según tipo
    contenedor.innerHTML = renderFotosFijas();
  }
  actualizarContadorFotos();
}

function renderFotosFijas() {
  var configs = {
    mantenimiento: [
      {n:1, etiq:"Antes del mantenimiento",   desc:"Estado inicial",         req:true},
      {n:2, etiq:"Después del mantenimiento", desc:"Extintores precintados",  req:true},
      {n:3, etiq:"Cilindro CO₂ del sistema",  desc:"Peso 50/75 lbs",         req:false}
    ],
    retiro: [
      {n:1, etiq:"Extintores retirados",       desc:"Foto de los extintores", req:true},
      {n:2, etiq:"Foto adicional",             desc:"Opcional",               req:false}
    ],
    entrega: [
      {n:1, etiq:"Extintores entregados",      desc:"Foto de la entrega",     req:true},
      {n:2, etiq:"Estado del local",           desc:"Opcional",               req:false}
    ]
  };
  var tipo  = TIPO_TRABAJO === TIPOS_TRABAJO.COBRO ? "mantenimiento" : (TIPO_TRABAJO || "mantenimiento");
  var lista = configs[tipo] || configs.mantenimiento;
  var h     = "";
  for (var i = 0; i < lista.length; i++) {
    var cfg = lista[i];
    var req = cfg.req;
    h += '<div class="fs2'+(req?" fpend":"")+'" id="fs'+cfg.n+'">';
    h += '<div class="fh"><div class="fnum '+(req?"fnpnd":"fngr")+'" id="fn'+cfg.n+'">'+cfg.n+'</div>';
    h += '<div><div class="ftip">'+cfg.etiq+'</div><div class="fdsc">'+cfg.desc+'</div></div>';
    h += '<div class="fbg '+(req?"fbpd":"fbop")+'" id="fb'+cfg.n+'">'+(req?"Pendiente":"Opcional")+'</div></div>';
    h += '<div class="fprev" id="fp'+cfg.n+'">';
    h += '<div id="fpc'+cfg.n+'" style="text-align:center;pointer-events:none"><div style="font-size:36px;'+(req?"":"opacity:.3")+'">📷</div><div style="font-size:12px;font-weight:600;color:var(--g3);margin-top:4px">Toca para foto</div></div>';
    h += '<input type="file" accept="image/*" capture="environment" id="fi'+cfg.n+'" onchange="fotoOk('+cfg.n+',this)">';
    h += '</div>';
    h += '<div class="fact"><button type="button" class="btn btn-r" style="font-size:14px;padding:10px" onclick="abrirCam('+cfg.n+')">📷 Cámara</button>';
    h += '<button type="button" class="btn btn-g" style="font-size:14px;padding:10px" onclick="abrirGal('+cfg.n+')">Galería</button></div>';
    h += '</div>';
  }
  return h;
}

function renderFotosLibres() {
  // Para instalación: empezar con 1 foto, botón para agregar más
  var h = '<div id="fotos-libres-lista"></div>';
  h += '<div class="bw" style="padding-top:0"><button type="button" class="btn btn-g" onclick="agregarFotoLibre()">+ Agregar foto</button></div>';
  // Iniciar con 1 foto
  FOTOS_COUNT = 0;
  setTimeout(agregarFotoLibre, 50);
  return h;
}

function agregarFotoLibre() {
  FOTOS_COUNT++;
  var n   = FOTOS_COUNT;
  var div = document.getElementById("fotos-libres-lista");
  if (!div) return;
  var el  = document.createElement("div");
  el.id   = "fs"+n;
  el.className = "fs2 fpend";
  el.innerHTML =
    '<div class="fh"><div class="fnum fnpnd" id="fn'+n+'">'+n+'</div>'+
    '<div><div class="ftip">Foto '+n+'</div><div class="fdsc">Evidencia de instalación</div></div>'+
    '<div class="fbg fbpd" id="fb'+n+'">Pendiente</div></div>'+
    '<div class="fprev" id="fp'+n+'">'+
    '<div id="fpc'+n+'" style="text-align:center;pointer-events:none"><div style="font-size:36px">📷</div><div style="font-size:12px;font-weight:600;color:var(--g3);margin-top:4px">Toca para foto</div></div>'+
    '<input type="file" accept="image/*" capture="environment" id="fi'+n+'" onchange="fotoOk('+n+',this)">'+
    '</div>'+
    '<div class="fact"><button type="button" class="btn btn-r" style="font-size:14px;padding:10px" onclick="abrirCam('+n+')">📷 Cámara</button>'+
    '<button type="button" class="btn btn-g" style="font-size:14px;padding:10px" onclick="abrirGal('+n+')">Galería</button></div>';
  div.appendChild(el);
  actualizarContadorFotos();
}

function toggleExt(pi, li, idx) {
  var el = document.getElementById("eck_"+pi+"_"+li+"_"+idx);
  if (!el) return;
  el.classList.toggle("ok");
  el.textContent = el.classList.contains("ok") ? "✓" : "";
}

function confirmarSin() {
  if (!LOCAL_ACTUAL) return;
  var msg = TIPO_TRABAJO === TIPOS_TRABAJO.COBRO
    ? "¿Marcar «"+LOCAL_ACTUAL.nombre+"» como completado?"
    : "¿Marcar «"+LOCAL_ACTUAL.nombre+"» como completado sin registro?";
  if (confirm(msg)) {
    var duracion = detenerTimer();
    PUNTOS[LOCAL_ACTUAL._pi].locales[LOCAL_ACTUAL._li].done = true;
    // Guardar en jornada activa también
    if (JORNADAS[JORNADA_ACTIVA]) JORNADAS[JORNADA_ACTIVA].puntos = PUNTOS;
    localStorage.setItem("pf_recorrido_data",    JSON.stringify(PUNTOS));
    localStorage.setItem("pf_recorrido_jornadas", JSON.stringify(JORNADAS));
    var hora = new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});
    var item = { local:LOCAL_ACTUAL, punto:PUNTO_ACTUAL, hora:hora, fotos:0, accs:0, url:null, nombre:null, certNum:null, duracion:duracion, tipo:"sin_cert" };
    HISTORIAL.unshift(item);
    guardarHistorialDia(item);
    renderHistorial();
    renderPuntos();
    ir("s1");
  }
}

// ════════════════════════════════════════════════════════════
//  FOTOS
// ════════════════════════════════════════════════════════════
function abrirCam(n) {
  var inp = document.getElementById("fi"+n);
  if (!inp) return;
  inp.setAttribute("capture","environment");
  inp.click();
}

function abrirGal(n) {
  var inp = document.getElementById("fi"+n);
  if (!inp) return;
  inp.removeAttribute("capture");
  inp.click();
}

function fotoOk(n, input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  var url  = URL.createObjectURL(file);
  FD[n]    = url;

  // UI update
  var slotEl = document.getElementById("fs"+n);
  var fnEl   = document.getElementById("fn"+n);
  var fbEl   = document.getElementById("fb"+n);
  var prev   = document.getElementById("fp"+n);
  var fpc    = document.getElementById("fpc"+n);
  if (slotEl) slotEl.className = "fs2 fok";
  if (fnEl)   { fnEl.className = "fnum fnok"; fnEl.textContent = "✓"; }
  if (fbEl)   { fbEl.className = "fbg fbok";  fbEl.textContent = "Lista"; }
  if (prev)   {
    prev.className = "fprev has";
    if (fpc) fpc.style.display = "none";
    var imgs = prev.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) imgs[i].remove();
    var imgEl = document.createElement("img");
    imgEl.src = url;
    prev.insertBefore(imgEl, prev.firstChild);
  }

  // Comprimir en background
  (function(idx, src){
    var img = new Image();
    img.onload = function(){
      var cvs = document.createElement("canvas");
      var MAX = 900, w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h*MAX/w); w = MAX; }
      if (h > MAX) { w = Math.round(w*MAX/h); h = MAX; }
      cvs.width = w; cvs.height = h;
      cvs.getContext("2d").drawImage(img, 0, 0, w, h);
      FB64[idx] = cvs.toDataURL("image/jpeg", 0.65);
    };
    img.src = src;
  })(n, url);

  actualizarContadorFotos();
}

function actualizarContadorFotos() {
  var c = 0;
  for (var k in FD) { if (FD[k]) c++; }
  var sfc  = document.getElementById("sfc");
  var sfpf = document.getElementById("sfpf");
  if (sfc)  sfc.textContent  = c+" foto(s)";
  if (sfpf) sfpf.style.width = Math.min(c*33.3, 100)+"%";
}

function irFirma() {
  var c = 0;
  for (var k in FD) { if (FD[k]) c++; }
  if (c === 0) { alert("Necesitas al menos 1 foto para continuar."); return; }
  // Solo ir a firma si el tipo requiere certificado
  if (TIPO_TRABAJO === TIPOS_TRABAJO.INSTALACION) {
    // Instalación: fotos + firma pero sin certificado completo
    reinitCanvas();
    ir("sfir");
  } else {
    reinitCanvas();
    ir("sfir");
  }
}

// ════════════════════════════════════════════════════════════
//  FIRMA
// ════════════════════════════════════════════════════════════
function initFirma() {
  canvas = document.getElementById("cnv");
  if (canvas) setupCanvasEvents();
}

function reinitCanvas() {
  canvas = document.getElementById("cnv");
  if (!canvas) return;
  var w = canvas.parentElement ? canvas.parentElement.offsetWidth : 336;
  canvas.width  = w > 50 ? w : 336;
  canvas.height = 130;
  ctx = canvas.getContext("2d");
  ctx.strokeStyle = "#1C1C1A";
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  // Limpiar trazo anterior
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  trazado = false; FIRMADO = false;
  var fpw  = document.getElementById("fpw");
  var fsub = document.getElementById("fsub");
  if (fpw)  fpw.classList.remove("sig");
  if (fsub) fsub.textContent = "Dibuja la firma con el dedo";
}

function gp(e) {
  var r  = canvas.getBoundingClientRect();
  var sx = canvas.width / r.width, sy = canvas.height / r.height;
  if (e.touches) return { x:(e.touches[0].clientX-r.left)*sx, y:(e.touches[0].clientY-r.top)*sy };
  return { x:(e.clientX-r.left)*sx, y:(e.clientY-r.top)*sy };
}

function setupCanvasEvents() {
  canvas.addEventListener("mousedown",  function(e){ e.preventDefault(); drawing=true; var p=gp(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); });
  canvas.addEventListener("mousemove",  function(e){ e.preventDefault(); if(!drawing)return; trazado=true; var p=gp(e); ctx.lineTo(p.x,p.y); ctx.stroke(); });
  canvas.addEventListener("mouseup",    function(){ drawing=false; if(trazado) marcarFirmado(); });
  canvas.addEventListener("mouseleave", function(){ drawing=false; });
  canvas.addEventListener("touchstart", function(e){ e.preventDefault(); drawing=true; var p=gp(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); }, {passive:false});
  canvas.addEventListener("touchmove",  function(e){ e.preventDefault(); if(!drawing)return; trazado=true; var p=gp(e); ctx.lineTo(p.x,p.y); ctx.stroke(); }, {passive:false});
  canvas.addEventListener("touchend",   function(){ drawing=false; if(trazado) marcarFirmado(); });
}

function marcarFirmado() {
  var fpw  = document.getElementById("fpw");
  var fsub = document.getElementById("fsub");
  if (fpw)  fpw.classList.add("sig");
  if (fsub) fsub.textContent = "Firma registrada ✓";
  FIRMADO = true;
}

function borrarFirma() {
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  trazado = false; FIRMADO = false;
  var fpw  = document.getElementById("fpw");
  var fsub = document.getElementById("fsub");
  if (fpw)  fpw.classList.remove("sig");
  if (fsub) fsub.textContent = "Dibuja la firma con el dedo";
}

// ════════════════════════════════════════════════════════════
//  NOVEDADES Y ACCESORIOS
// ════════════════════════════════════════════════════════════
function selNov(v) {
  NOV = v;
  var btnNov = document.getElementById("btn-nov");
  var btnOk  = document.getElementById("btn-ok");
  var accSec = document.getElementById("acc-sec");
  if (btnNov) btnNov.className = "nb"+(v==="si"?" sn":"");
  if (btnOk)  btnOk.className  = "nb"+(v==="no"?" so":"");
  if (accSec) accSec.style.display = v==="si" ? "block" : "none";
}

function renderAccSel() {
  var h = "";
  for (var i = 0; i < ACCESORIOS.length; i++) {
    var a   = ACCESORIOS[i];
    var pid = a.id.replace(/['"]/g,"");
    h += '<div class="asi" onclick="addAcc(\''+pid+'\')"><div class="asn">'+a.n+'</div><div class="asp">$'+a.p.toFixed(2)+'</div></div>';
  }
  var el = document.getElementById("asel-list");
  if (el) el.innerHTML = h;
}

function abrirSel() {
  document.getElementById("asel").classList.add("open");
  document.getElementById("ov").classList.add("show");
}

function cerrarSel() {
  document.getElementById("asel").classList.remove("open");
  document.getElementById("ov").classList.remove("show");
}

function addAcc(id) {
  var found = null;
  for (var i = 0; i < ACCESORIOS.length; i++) { if (ACCESORIOS[i].id === id) { found = ACCESORIOS[i]; break; } }
  if (!found) return;
  var uid = "a"+Date.now()+"r"+Math.floor(Math.random()*9999);
  ACCS.push({id:found.id, n:found.n, p:found.p, uid:uid});
  renderAccList();
  cerrarSel();
}

function rmAcc(uid) {
  ACCS = ACCS.filter(function(a){ return a.uid !== uid; });
  renderAccList();
}

function renderAccList() {
  var h = "", tot = 0;
  for (var i = 0; i < ACCS.length; i++) {
    var a = ACCS[i]; tot += a.p;
    h += '<div class="ait"><span class="anm">'+a.n+'</span><span class="apr">$'+a.p.toFixed(2)+'</span><span class="arm" onclick="rmAcc(\''+a.uid+'\')">✕</span></div>';
  }
  var accLis = document.getElementById("acc-lista");
  var accTot = document.getElementById("acc-tot");
  if (accLis) accLis.innerHTML = h;
  if (accTot) accTot.textContent = "$"+tot.toFixed(2);
}

// PDF — ver pdf.js

// ── SIGUIENTE ────────────────────────────────────────────────
function irSig() {
  for (var i = 0; i < PUNTOS.length; i++) {
    for (var j = 0; j < PUNTOS[i].locales.length; j++) {
      if (!PUNTOS[i].locales[j].done) { abrirLocal(i,j); return; }
    }
  }
  ir("s1");
}

// ── HISTORIAL ────────────────────────────────────────────────
function renderHistorial() {
  var lista = document.getElementById("hist-l");
  if (!lista) return;
  if (HISTORIAL.length === 0) { lista.innerHTML = '<div class="empty">Aún no hay certificados hoy</div>'; return; }
  var h = '<div class="slbl">Hoy</div>';
  for (var i = 0; i < HISTORIAL.length; i++) {
    var hi = HISTORIAL[i];
    var esCert   = hi.tipo !== "sin_cert" && hi.url;
    var icoBg    = esCert ? "var(--rc)" : "var(--g2)";
    var icoColor = esCert ? "var(--r)"  : "var(--g4)";
    var icoTxt   = esCert ? "PDF"       : "✓";
    var durTxt   = hi.duracion ? " · " + tiempoFormateado(hi.duracion) : "";
    h += '<div class="cd"><div style="padding:13px 14px;display:flex;align-items:center;gap:12px">';
    h += '<div style="width:36px;height:36px;border-radius:11px;background:'+icoBg+';display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;color:'+icoColor+';font-weight:700">'+icoTxt+'</div>';
    h += '<div style="flex:1"><div style="font-size:15px;font-weight:700">'+hi.local.nombre+'</div>';
    h += '<div style="font-size:12px;color:var(--g3);margin-top:2px">'+hi.hora+durTxt+(hi.fotos>0?' · '+hi.fotos+' foto(s)':'')+(hi.accs>0?' · '+hi.accs+' acc.':'')+'</div></div>';
    if (esCert) h += '<a href="'+hi.url+'" download="'+hi.nombre+'" style="font-size:10px;font-weight:700;background:var(--ac);color:var(--a);padding:4px 8px;border-radius:10px;text-decoration:none">⬇ PDF</a>';
    h += '</div></div>';
  }
  lista.innerHTML = h;
}

// ── OVERLAY ──────────────────────────────────────────────────
function mostrarCargando(mostrar, titulo, sub) {
  var lov = document.getElementById("lov");
  var ltx = document.getElementById("ltx");
  var lsb = document.getElementById("lsb");
  if (!lov) return;
  if (mostrar) {
    if (ltx) ltx.textContent = titulo || "Cargando...";
    if (lsb) lsb.textContent = sub    || "Por favor espera";
    lov.classList.add("show");
  } else {
    lov.classList.remove("show");
  }
}

// ── PERFIL ───────────────────────────────────────────────────
function renderPerfil() {
  document.querySelectorAll(".sperf-nom").forEach(function(el){ el.textContent = TECNICO_NOMBRE; });
  document.querySelectorAll(".sperf-rol").forEach(function(el){
    el.textContent = USUARIO_ACTUAL ? USUARIOS[USUARIO_ACTUAL].rol : "";
  });
  var ver = document.getElementById("sperf-ver");
  if (ver) ver.textContent = "Previfuego Field v"+VERSION;
  renderEstadisticasPerfil();
}

function cerrarSesion() {
  if (!confirm("¿Cambiar de usuario?")) return;
  localStorage.removeItem("pf_usuario");
  USUARIO_ACTUAL = null; PUNTOS = []; HISTORIAL = [];
  ir("slogin");
}

// ── INIT ─────────────────────────────────────────────────────
window.onload = function() {
  initLogos();
  initFecha();
  renderAccSel();
  cargarHistorialDia();
  canvas = document.getElementById("cnv");
  if (canvas) setupCanvasEvents();
  var saved = localStorage.getItem("pf_usuario");
  if (saved && USUARIOS[saved]) seleccionarUsuario(saved);
  else ir("slogin");
};

// ── TABS ADMIN ───────────────────────────────────────────────
function admTab(n) {
  for (var i = 1; i <= 3; i++) {
    var btn = document.getElementById("adm-t"+i);
    var pan = document.getElementById("adm-p"+i);
    if (btn) btn.className = "adm-tab-btn" + (i===n?" on":"");
    if (pan) pan.className = "adm-panel"   + (i===n?" on":"");
  }
  if (n === 3) {
    renderCalendarioMes();
    renderResumenJornadas();
  }
  if (n === 2) {
    renderPizarra();
  }
}

function renderResumenJornadas() {
  var el = document.getElementById("admin-resumen-jornadas");
  if (!el) return;
  var jorData = localStorage.getItem("pf_recorrido_jornadas");
  if (!jorData) { el.innerHTML = '<div style="font-size:13px;color:var(--g3);padding:8px 0">Publica un recorrido para ver el resumen</div>'; return; }
  try {
    var jornadas = JSON.parse(jorData);
    var h = "";
    for (var i = 0; i < jornadas.length; i++) {
      var jor   = jornadas[i];
      var emoji = jor.jornada === "TARDE" ? "🌙" : "☀️";
      var col   = jor.jornada === "TARDE" ? "var(--a)" : "var(--r)";
      var total = 0, done = 0;
      for (var j = 0; j < jor.puntos.length; j++)
        for (var k = 0; k < jor.puntos[j].locales.length; k++) { total++; if (jor.puntos[j].locales[k].done) done++; }
      var pct = total > 0 ? Math.round(done/total*100) : 0;
      h += '<div class="cd" style="margin-bottom:8px;padding:14px">';
      h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">';
      h += '<div style="font-size:20px">'+emoji+'</div>';
      h += '<div style="font-size:15px;font-weight:700;color:'+col+'">'+jor.label+'</div>';
      h += '<div style="margin-left:auto;font-size:20px;font-weight:700;color:'+col+'">'+pct+'%</div></div>';
      h += '<div style="height:6px;background:var(--g2);border-radius:3px;overflow:hidden">';
      h += '<div style="height:100%;width:'+pct+'%;background:'+col+';border-radius:3px;transition:width .3s"></div></div>';
      h += '<div style="font-size:12px;color:var(--g4);margin-top:6px">'+done+' de '+total+' locales completados</div>';
      // Listar locales
      for (var j = 0; j < jor.puntos.length; j++) {
        var p = jor.puntos[j];
        for (var k = 0; k < p.locales.length; k++) {
          var loc = p.locales[k];
          h += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid var(--bo);margin-top:4px">';
          h += '<div style="font-size:14px">'+(loc.done?"✅":"⏳")+'</div>';
          h += '<div style="font-size:13px;color:'+(loc.done?"var(--v)":"var(--ng)")+'">'+loc.nombre+'</div>';
          h += '<div style="font-size:11px;color:var(--g4);margin-left:auto">'+p.nombre+'</div></div>';
        }
      }
      h += '</div>';
    }
    el.innerHTML = h;
  } catch(e) { el.innerHTML = '<div style="font-size:13px;color:var(--r)">Error al cargar resumen</div>'; }
}

// ════════════════════════════════════════════════════════════
//  NAVEGACIÓN A GOOGLE MAPS
// ════════════════════════════════════════════════════════════
function abrirMaps(nombre, direccion) {
  var query = encodeURIComponent((nombre || "") + " " + (direccion || "") + " Guayaquil Ecuador");
  window.open("https://maps.google.com/maps?q=" + query, "_blank");
}

function irAMaps() {
  if (!LOCAL_ACTUAL) return;
  var nombre    = LOCAL_ACTUAL.nombre;
  var ubicacion = PUNTO_ACTUAL ? PUNTO_ACTUAL.nombre : "";
  abrirMaps(nombre, ubicacion);
}

// ════════════════════════════════════════════════════════════
//  TIMER POR PUNTO
// ════════════════════════════════════════════════════════════
function iniciarTimer() {
  TIMER_INICIO = Date.now();
  if (TIMER_INTERVAL) clearInterval(TIMER_INTERVAL);
  TIMER_INTERVAL = setInterval(actualizarTimer, 1000);
  actualizarTimer();
}

function detenerTimer() {
  if (TIMER_INTERVAL) { clearInterval(TIMER_INTERVAL); TIMER_INTERVAL = null; }
  var el = document.getElementById("s2-timer");
  if (el) el.style.display = "none";
  var duracion = TIMER_INICIO ? Math.round((Date.now() - TIMER_INICIO) / 1000) : 0;
  TIMER_INICIO = null;
  return duracion; // segundos
}

function actualizarTimer() {
  var el = document.getElementById("s2-timer");
  if (!el || !TIMER_INICIO) return;
  var seg  = Math.floor((Date.now() - TIMER_INICIO) / 1000);
  var min  = Math.floor(seg / 60);
  var s    = seg % 60;
  el.textContent = "⏱ " + String(min).padStart(2,"0") + ":" + String(s).padStart(2,"0");
  el.style.display = "block";
}

function tiempoFormateado(seg) {
  if (!seg || seg < 60) return seg + "s";
  var m = Math.floor(seg/60), s = seg%60;
  return m + "min" + (s > 0 ? " "+s+"s" : "");
}

// ════════════════════════════════════════════════════════════
//  HISTORIAL PERSISTENTE
// ════════════════════════════════════════════════════════════
function cargarHistorialDia() {
  var fecha = localStorage.getItem("pf_hist_fecha");
  if (fecha === fechaHoy()) {
    try {
      var saved = localStorage.getItem("pf_hist_data");
      if (saved) HISTORIAL_DIA = JSON.parse(saved);
    } catch(e) {}
  } else {
    // Nuevo día — limpiar historial
    localStorage.setItem("pf_hist_fecha", fechaHoy());
    localStorage.setItem("pf_hist_data", "[]");
    HISTORIAL_DIA = [];
  }
  HISTORIAL = HISTORIAL_DIA.slice(); // sincronizar con HISTORIAL en memoria
}

function guardarHistorialDia(item) {
  HISTORIAL_DIA.unshift(item);
  localStorage.setItem("pf_hist_data", JSON.stringify(HISTORIAL_DIA));
}

// ════════════════════════════════════════════════════════════
//  SEMÁFORO DE VENCIMIENTOS EN LISTA DE PUNTOS
// ════════════════════════════════════════════════════════════
function semaforoVencimiento(proxMant) {
  if (!proxMant) return "";
  try {
    var partes = proxMant.split("/");
    if (partes.length !== 3) return "";
    var fecha = new Date(parseInt(partes[2]), parseInt(partes[1])-1, parseInt(partes[0]));
    var hoy   = new Date();
    var dias  = Math.round((fecha - hoy) / (1000*60*60*24));
    if (dias < 0)   return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:#FFE0E0;color:#C00">VENCIDO</span>';
    if (dias < 30)  return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:var(--rc);color:var(--r)">🔴 '+dias+'d</span>';
    if (dias < 60)  return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:var(--nc);color:var(--n)">🟡 '+dias+'d</span>';
    return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:var(--vc);color:var(--v)">🟢 '+dias+'d</span>';
  } catch(e) { return ""; }
}

// ════════════════════════════════════════════════════════════
//  OPTIMIZADOR DE RUTAS BÁSICO
//  Agrupa los puntos del día por zona detectada en el nombre
// ════════════════════════════════════════════════════════════
var ZONAS_GYE = {
  "norte":    ["alban borja","norte","batan","kennedy","urdesa","miraflores","ceibos","villa españa","sauces","la aurora"],
  "centro":   ["centro","bahia","9 de octubre","guayaquil","malecón","chile","olmedo","sucre","boyaca"],
  "sur":      ["sur","portete","garzota","14","quil","riocentro sur","socio viejo"],
  "norte2":   ["samborondon","via samborondon","km","daule","duran","pascuales"],
  "malls":    ["mall del sol","san marino","riocentro","alhambra","buena vista","village","plaza","terminal"]
};

function detectarZona(nombre) {
  var n = (nombre || "").toLowerCase();
  for (var zona in ZONAS_GYE) {
    var keywords = ZONAS_GYE[zona];
    for (var i = 0; i < keywords.length; i++) {
      if (n.indexOf(keywords[i]) !== -1) return zona;
    }
  }
  return "otro";
}

function sugerirOrdenRuta() {
  if (!PUNTOS || PUNTOS.length < 2) return;
  // Agrupar puntos por zona
  var grupos = {};
  for (var i = 0; i < PUNTOS.length; i++) {
    var zona = detectarZona(PUNTOS[i].nombre);
    if (!grupos[zona]) grupos[zona] = [];
    grupos[zona].push(PUNTOS[i]);
  }
  // Mostrar sugerencia
  var zonaNames = { norte:"Norte", centro:"Centro", sur:"Sur", norte2:"Vía Samborondón/Daule", malls:"Centros Comerciales", otro:"Otros" };
  var h = '<div class="slbl">Sugerencia de ruta</div>';
  var orden = 1;
  for (var zona in grupos) {
    var pts = grupos[zona];
    h += '<div style="margin:0 12px 8px;padding:10px 14px;background:#fff;border-radius:12px;border:1.5px solid var(--bo)">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--g4);letter-spacing:1px;margin-bottom:8px">📍 '+(zonaNames[zona]||zona).toUpperCase()+'</div>';
    for (var i = 0; i < pts.length; i++) {
      h += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid var(--bo)">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--r);width:20px">'+(orden++)+'</div>';
      h += '<div style="font-size:14px;font-weight:600">'+pts[i].nombre+'</div>';
      h += '<button onclick="abrirMaps(\''+pts[i].nombre.replace(/'/g,"")+'\',\'\')" style="margin-left:auto;background:var(--ac);color:var(--a);border:none;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">Maps</button>';
      h += '</div>';
    }
    h += '</div>';
  }
  var modal = document.getElementById("ruta-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "ruta-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:300;overflow-y:auto;padding:20px 0";
    modal.innerHTML = '<div style="background:var(--g1);min-height:100%;padding-bottom:80px"><div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#fff;border-bottom:1.5px solid var(--bo)"><div style="font-size:17px;font-weight:700">Optimizador de ruta</div><button onclick="document.getElementById(\'ruta-modal\').remove()" style="background:var(--g1);border:1.5px solid var(--bo);border-radius:10px;padding:6px 12px;font-weight:700;cursor:pointer">✕</button></div><div id="ruta-contenido"></div></div>';
    document.body.appendChild(modal);
  }
  document.getElementById("ruta-contenido").innerHTML = h;
}

// ════════════════════════════════════════════════════════════
//  ESTADÍSTICAS DEL DÍA — para pantalla perfil/historial
// ════════════════════════════════════════════════════════════
function calcularEstadisticas() {
  var total = 0, done = 0, tiempoTotal = 0, certs = 0;
  for (var i = 0; i < JORNADAS.length; i++) {
    for (var j = 0; j < JORNADAS[i].puntos.length; j++) {
      for (var k = 0; k < JORNADAS[i].puntos[j].locales.length; k++) {
        total++;
        if (JORNADAS[i].puntos[j].locales[k].done) done++;
      }
    }
  }
  for (var i = 0; i < HISTORIAL_DIA.length; i++) {
    certs++;
    if (HISTORIAL_DIA[i].duracion) tiempoTotal += HISTORIAL_DIA[i].duracion;
  }
  return {
    total:       total,
    done:        done,
    pendientes:  total - done,
    pct:         total > 0 ? Math.round(done/total*100) : 0,
    certs:       certs,
    tiempoTotal: tiempoTotal,
    promedio:    certs > 0 ? Math.round(tiempoTotal/certs) : 0
  };
}

function renderEstadisticasPerfil() {
  var el = document.getElementById("sperf-stats");
  if (!el) return;
  var s = calcularEstadisticas();
  el.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:12px">' +
    '<div class="si"><div class="sv" style="color:var(--v)">'+s.done+'</div><div class="sl">Completados</div></div>' +
    '<div class="si"><div class="sv" style="color:var(--r)">'+s.pendientes+'</div><div class="sl">Pendientes</div></div>' +
    '<div class="si"><div class="sv" style="color:var(--a)">'+s.pct+'%</div><div class="sl">Avance</div></div>' +
    '</div>';
}
