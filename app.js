// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO FIELD — app.js  v3.4
//  Bloque A: PDF fixes + tipo trabajo + fotos libres + roles
// ═══════════════════════════════════════════════════════════

var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyw7HVESP0CSrJyf9gn26ikU6aji9QvYoeVOkF_DrXNcNv1S0q40Ugfo5KLnQTIbLgC/exec";
var VERSION    = "3.6";

// ── ACCESORIOS ───────────────────────────────────────────────
var ACCESORIOS = [
  {id:"abrazadera",      n:"Abrazadera plástica",    p:1.50},
  {id:"manometro",       n:"Manómetro PQS",           p:2.80},
  {id:"cabezal_pqs",     n:"Cabezal extintor PQS",    p:8.80},
  {id:"manguera_pqs",    n:"Manguera PQS",             p:4.80},
  {id:"corneta_co2_5",   n:"Corneta CO₂ 5 lbs",       p:8.80},
  {id:"corneta_co2_10",  n:"Corneta CO₂ 10 lbs",      p:13.80},
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

// ── PRECIOS PERSONALIZADOS (localStorage) ────────────────────
// #019 FIX: Alejandro puede editar precios desde tab Config del admin
// Los precios custom sobreescriben los de ACCESORIOS al cargar
(function() {
  try {
    var preciosGuardados = JSON.parse(localStorage.getItem("pf_precios_accs") || "{}");
    for (var i = 0; i < ACCESORIOS.length; i++) {
      if (preciosGuardados[ACCESORIOS[i].id] !== undefined) {
        ACCESORIOS[i].p = parseFloat(preciosGuardados[ACCESORIOS[i].id]) || ACCESORIOS[i].p;
      }
    }
  } catch(e) {}
})();

// ── USUARIOS ─────────────────────────────────────────────────
var USUARIOS = {
  raul:      { nombre:"Raúl",      rol:"Técnico Operativo y Logístico", emoji:"👷" },
  juan:      { nombre:"Juan",      rol:"Técnico Operativo y Logístico", emoji:"👷" },
  fabiola:   { nombre:"Fabiola",   rol:"Administración y Taller",       emoji:"💼", soloTaller:true },
  alejandro: { nombre:"Alejandro", rol:"Jefe de Operaciones",           emoji:"👔" }
};

// ── TIPOS DE TRABAJO ─────────────────────────────────────────
// Detectado automáticamente desde la misión
var TIPOS_TRABAJO = {
  MANTENIMIENTO: "mantenimiento", // fotos Antes/Después/CO2 + certificado + firma
  RETIRO:        "retiro",        // foto de lo retirado + recibo
  ENTREGA:       "entrega",       // foto de entrega + certificado + nota entrega
  INSTALACION:   "instalacion",   // fotos libres (N fotos) + firma, sin certificado
  COBRO:         "cobro",
  DISTRIBUIDOR:  "distribuidor",
  OTRO:          "otro"
};

function detectarTipoTrabajo(mision) {
  if (!mision) return TIPOS_TRABAJO.MANTENIMIENTO;
  // #18 FIX: normalizar acentos antes de regex
  var m = mision.toLowerCase()
    .replace(/[áà]/g,"a").replace(/[éè]/g,"e").replace(/[íì]/g,"i")
    .replace(/[óò]/g,"o").replace(/[úù]/g,"u").replace(/ñ/g,"n");
  if (/distribui[dr]or?/.test(m))                                       return TIPOS_TRABAJO.DISTRIBUIDOR;
  if (/entregar|entrega|devolver|devolu/.test(m))                       return TIPOS_TRABAJO.ENTREGA;
  if (/cobro|cheque|pago|retirar cheque|retirar pago|recoger pago|recoger cobro/.test(m)) return TIPOS_TRABAJO.COBRO;
  if (/instalar|instalaci|colocar|etiqueta/.test(m))                    return TIPOS_TRABAJO.INSTALACION;
  if (/retir(ar|o|a|ando)|llevar al taller|llevar a taller/.test(m)) return TIPOS_TRABAJO.RETIRO;
  if (/mantenimiento|mant|recarga|revisar|inspeccionar/.test(m))        return TIPOS_TRABAJO.MANTENIMIENTO;
  return TIPOS_TRABAJO.OTRO;
}


// ── HELPERS DE CLIENTE ───────────────────────────────────────
function esGrupoKFC(nombreLocal) {
  if (typeof pfEsGrupoKFC === "function") return pfEsGrupoKFC(nombreLocal);
  var n = (nombreLocal||"").toUpperCase();
  return /KFC|GUS|CAJUN|MENESTRA|AMERICAN DELI|BASKIN|CINNABON|JUAN VALDEZ|NOVOCENTRO|INT FOOD|SHEMLON|DELI INT|PROMOTORA|NOVOEVENTOS|SUSHICORP/.test(n);
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
var _certRaw = parseInt(localStorage.getItem("pf_certCount") || "0");
var CERT_CONTADOR = isNaN(_certRaw) ? 0 : _certRaw; // BAJO FIX: guard NaN
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
  // Actualizar "siguiente local" al llegar a pantalla de certificado listo
  if (id === "senv") { setTimeout(actualizarSigLocal, 100); }
}

// ── FECHA ────────────────────────────────────────────────────
function initFecha() {
  // #5 FIX: usar timezone Ecuador para mostrar la fecha correcta
  var d  = new Date();
  var ec = new Date(d.toLocaleString("en-US", {timeZone: "America/Guayaquil"}));
  var dias  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  var meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  var el    = document.getElementById("s1f");
  if (el) el.textContent = dias[ec.getDay()]+" "+ec.getDate()+" "+meses[ec.getMonth()];
}

function fechaHoy() {
  // #timezone FIX: usar timezone de Ecuador (UTC-5)
  var d = new Date();
  var ec = new Date(d.toLocaleString("en-US", {timeZone: "America/Guayaquil"}));
  return String(ec.getDate()).padStart(2,"0")+"/"+
         String(ec.getMonth()+1).padStart(2,"0")+"/"+
         ec.getFullYear();
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
  else if (USUARIOS[key] && USUARIOS[key].soloTaller) { ir("s1"); cargarRecorrido(); } // Fabiola ve recorrido pero no modifica
  else { ir("s1"); cargarRecorrido(); }
  // #22 FIX: sincronizar fichas al login (todos los usuarios)
  setTimeout(function(){
    if (typeof pfSincronizarFichas === "function") {
      pfSincronizarFichas(function(ok, n) {
        if (ok) {
          console.log("Sync OK: " + n + " locales");
          if (typeof pfRenderCalendario === "function") pfRenderCalendario();
        }
      });
    }
    // #FIX: descargar correos KFC del servidor si no están en localStorage
    var correos = localStorage.getItem("pf_correos_clientes");
    var count = correos ? Object.keys(JSON.parse(correos)).length : 0;
    if (count < 50) { // si tiene menos de 50 correos, descargar del servidor
      fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ accion: "get_kv", token: localStorage.getItem("pf_token")||"", clave: "pf_correos_clientes" })
      }).then(function(r){ return r.json(); }).then(function(d){
        if (d.ok && d.valor) {
          localStorage.setItem("pf_correos_clientes", d.valor);
          console.log("Correos KFC descargados del servidor: " + Object.keys(JSON.parse(d.valor)).length);
        }
      }).catch(function(){});
    }
  }, 1500);
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
  // FIX: MAÑANA siempre índice 0 → click mañana no abre tarde
  var _jo={"MAÑANA":0,"DIA":1,"TARDE":2,"NOCHE":3};
  jornadas.sort(function(a,b){return (_jo[a.jornada]||9)-(_jo[b.jornada]||9);});
  return jornadas;
}

function capitalizar(str) {
  if (!str || !str.length) return ""; // #52 FIX: string vacío
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function parsearRecorrido(texto) {
  var lineas  = texto.split("\n").map(function(l){ return l.trim(); }).filter(function(l){ return l.length > 0; });
  var puntos  = [];
  var puntoActual = null;
  var localActual = null;
  var misionBuffer = [];
  var localIdCounter = 0;
  var rePunto  = /^Punto\s+(\d+)\s*[–\-—:\u2013\u2014]\s*(.+)$/i; // #17 FIX: guiones extendidos
  var reMision = /^Misión\s*:/i;
  var reBullet = /^[\*\-•]\s+.+/;  // #101 FIX: acepta *, -, • como bullets

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
      puntoActual = { num: parseInt(mPunto[1]), nombre: mPunto[2].trim(), locales: [], _nomPunto: mPunto[2].trim() };
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
                     (reMision.test(sigLinea) || sigLinea === "") && localActual && localActual.nombre !== l &&
                     l !== (puntoActual._nomPunto || puntoActual.nombre);
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
    h += '<div style="font-size:14px;font-weight:700;color:'+colTx+';'+(item.estado==="done"?"text-decoration:line-through":"")+'">'+String(item.texto||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'; // MEDIO FIX: XSS
    if (item.nota) h += '<div style="font-size:11px;color:var(--g4);margin-top:2px">'+item.nota+'</div>';
    h += '</div>';
    h += '<div style="display:flex;gap:6px;flex-shrink:0">';
    if (item.estado !== "done") h += '<button class="piz-btn piz-ok" onclick="pizarraAccion(\"'+seccion+'\",'+i+',\"done\")">✓</button>';
    if (item.estado === "done") h += '<button class="piz-btn piz-undo" onclick="pizarraAccion(\"'+seccion+'\",'+i+',\"undo\")">↩</button>';
    h += '<button class="piz-btn piz-del" onclick="pizarraAccion(\"'+seccion+'\",'+i+',\"del\")">✕</button>';
    h += '</div></div>';
  }
  if (items.length === 0) h = '<div style="font-size:13px;color:var(--g3);padding:8px 0">Sin tareas</div>';
  // FIX: historial de tareas completadas por sección — combina done actuales + historial persistente
  var _secs = ["operativa","logistica","pendientes"];
  var _secNom = {operativa:"Operativa",logistica:"Logística",pendientes:"Pendientes"};
  var _histPersist = {};
  try { _histPersist = JSON.parse(localStorage.getItem("pf_pizarra_hist") || "{}"); } catch(e) {}
  var _histHTML = "";
  _secs.forEach(function(sec) {
    var comp = (pizData[sec]||[]).filter(function(it){return it.estado==="done";});
    var histSec = (_histPersist[sec]||[]).filter(function(h){
      // Evitar duplicados con los done actuales
      return !comp.some(function(c){ return c.texto === h.texto && c.fecha === h.fecha; });
    });
    var todos = comp.concat(histSec).slice(0,8);
    if (todos.length === 0) return;
    _histHTML += '<div class="slbl" style="color:var(--v)">✅ Completadas — '+_secNom[sec]+' ('+todos.length+')</div>';
    todos.forEach(function(it) {
      _histHTML += '<div style="margin:0 12px 6px;background:var(--vc);border-radius:10px;padding:10px 14px;border:1px solid var(--v)">';
      _histHTML += '<div style="font-size:13px;font-weight:700;color:var(--v)">✅ '+String(it.texto||"").replace(/</g,"&lt;")+'</div>';
      if (it.nota) _histHTML += '<div style="font-size:11px;color:var(--g4);margin-top:2px">'+it.nota+'</div>';
      if (it.doneEn) _histHTML += '<div style="font-size:10px;color:var(--g3);margin-top:2px">'+it.doneEn+'</div>';
      _histHTML += '</div>';
    });
  });
  if (_histHTML) h += _histHTML;

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
  if (accion === "done") {
    var item = PIZARRA[seccion][idx];
    item.estado = "done";
    item.doneEn = fechaHoy() + " " + new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});
    // Guardar en historial persistente
    try {
      var _hist = JSON.parse(localStorage.getItem("pf_pizarra_hist") || "{}");
      if (!_hist[seccion]) _hist[seccion] = [];
      _hist[seccion].unshift({ texto:item.texto, nota:item.nota||"", fecha:item.fecha||"", doneEn:item.doneEn });
      if (_hist[seccion].length > 30) _hist[seccion] = _hist[seccion].slice(0,30); // max 30 por sección
      localStorage.setItem("pf_pizarra_hist", JSON.stringify(_hist));
    } catch(e) {}
  }
  if (accion === "undo")    PIZARRA[seccion][idx].estado = "pendiente";
  if (accion === "urgente") PIZARRA[seccion][idx].estado = "urgente";
  if (accion === "del")     PIZARRA[seccion].splice(idx, 1);
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
  if (!txt) { pfModal("Escribe o pega el recorrido primero."); return; }
  var jornadas = parsearJornadas(txt);
  if (jornadas.length === 0) { pfModal("No se detectaron puntos. Verifica el formato."); return; }

  // #023 FIX: detectar si el recorrido menciona una fecha futura
  var fechaRecorrido = fechaHoy();
  var mFecha = txt.match(/(\d{1,2})\s+DE\s+(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)/i);
  if (mFecha) {
    var meses = {ENERO:"01",FEBRERO:"02",MARZO:"03",ABRIL:"04",MAYO:"05",JUNIO:"06",JULIO:"07",AGOSTO:"08",SEPTIEMBRE:"09",OCTUBRE:"10",NOVIEMBRE:"11",DICIEMBRE:"12"};
    var dia = mFecha[1].padStart(2,"0");
    var mes = meses[mFecha[2].toUpperCase()];
    var anio = new Date().getFullYear();
    fechaRecorrido = dia+"/"+mes+"/"+anio;
  }

  mostrarCargando(true, "Publicando recorrido...", "Guardando en el servidor");
  localStorage.setItem("pf_recorrido_texto",   txt);
  localStorage.setItem("pf_recorrido_fecha",   fechaRecorrido);
  localStorage.setItem("pf_recorrido_jornadas", JSON.stringify(jornadas));
  localStorage.setItem("pf_recorrido_data", JSON.stringify(jornadas[0].puntos));
  var payload = { accion:"publicar_recorrido", fecha:fechaRecorrido, tecnico:TECNICO_NOMBRE||"Alejandro", texto:txt, jornadas:jornadas };
  // #21 FIX: usar .then().catch() en lugar de .finally() (no disponible en todos los móviles)
  var _pubDone = function() {
    mostrarCargando(false);
    renderCalendarioMes();
    var ok = document.getElementById("admin-pub-ok");
    if (ok) { ok.style.display = "block"; setTimeout(function(){ ok.style.display = "none"; }, 3000); }
  };
  fetch(SCRIPT_URL, { method:"POST", body:JSON.stringify(payload) })
    .then(function(r){ return r.json(); })
    .then(function(){ _pubDone(); })
    .catch(function(){ _pubDone(); });
}

function limpiarRecorrido() {
  pfConfirm("¿Borrar el recorrido actual?", function() {
    document.getElementById("admin-txt").value = "";
    document.getElementById("admin-prev").innerHTML = '<div class="empty">Pega el recorrido arriba para previsualizarlo</div>';
    localStorage.removeItem("pf_recorrido_texto");
    localStorage.removeItem("pf_recorrido_data");
  });
}

function pfInsertarPlantillaRecorrido() {
  var txt = document.getElementById("admin-txt");
  if (!txt) return;
  if (txt.value.trim()) {
    pfConfirm("¿Reemplazar el recorrido actual con la plantilla?", function() {
      txt.value = pfPlantillaRecorrido();
      previsualizarRecorrido();
    });
  } else {
    txt.value = pfPlantillaRecorrido();
    previsualizarRecorrido();
  }
}

function pfPlantillaRecorrido() {
  var fecha = fechaHoy();
  return "RECORRIDO – JORNADA MAÑANA\n" +
    "Punto 1 – \n" +
    "Nombre del local\n" +
    "Misión: Realizar mantenimiento de extintores\n\n" +
    "Punto 2 – \n" +
    "Nombre del local\n" +
    "Misión: Realizar mantenimiento de extintores\n\n" +
    "RECORRIDO – JORNADA TARDE\n" +
    "Punto 1 – \n" +
    "Nombre del local\n" +
    "Misión: Realizar mantenimiento de extintores\n";
}

function pfAgregarJornada(jornada) {
  var txt = document.getElementById("admin-txt");
  if (!txt) return;
  var bloque = "\nRECORRIDO – JORNADA " + jornada + "\n" +
    "Punto 1 – \n" +
    "Nombre del local\n" +
    "Misión: Realizar mantenimiento de extintores\n";
  txt.value = txt.value + bloque;
  txt.focus();
  txt.setSelectionRange(txt.value.length, txt.value.length);
  previsualizarRecorrido();
}

// ════════════════════════════════════════════════════════════
//  CARGA DE RECORRIDO
// ════════════════════════════════════════════════════════════
function cargarRecorrido() {
  mostrarCargando(true, "Cargando recorrido...", "Conectando con el servidor");
  var url = SCRIPT_URL + "?accion=recorrido_texto&fecha=" + encodeURIComponent(fechaHoy());
  // #022 FIX: timeout de 15 segundos
  var _ctrl    = typeof AbortController !== "undefined" ? new AbortController() : null;
  var _timeout = setTimeout(function() {
    if (_ctrl) _ctrl.abort();
    mostrarCargando(false);
    pfModal("⏱ Sin respuesta del servidor. Verifica tu conexión e intenta de nuevo.");
  }, 15000);
  fetch(url, _ctrl ? { signal: _ctrl.signal } : {})
    .then(function(r){ clearTimeout(_timeout); if (!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
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
  var _tecActual = (USUARIO_ACTUAL && USUARIOS[USUARIO_ACTUAL]) ? USUARIOS[USUARIO_ACTUAL].nombre : "Raúl Romero"; // #028 FIX
  if (fecha === fechaHoy()) {
    if (jorData) {
      try { procesarJornadas(JSON.parse(jorData), _tecActual); return; }
      catch(e) {
        // #19 FIX: notificar si datos corruptos en lugar de fallar silenciosamente
        console.warn("pf_recorrido_jornadas corrupto:", e);
        localStorage.removeItem("pf_recorrido_jornadas");
      }
    }
    if (legData) {
      try { procesarPuntos(JSON.parse(legData), _tecActual); return; }
      catch(e) { console.warn("pf_recorrido_data corrupto:", e); localStorage.removeItem("pf_recorrido_data"); }
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

// #005 FIX: actualizar solo el div de un local sin regenerar toda la lista
// #CRÍTICO FIX: caché de progreso para evitar O(n²) en actualizarItemLista
var _PF_PROGRESS = { total: 0, comp: 0 };
function _pfRecalcProgress() {
  var t = 0, c = 0;
  for (var i = 0; i < PUNTOS.length; i++)
    for (var j = 0; j < PUNTOS[i].locales.length; j++) { t++; if (PUNTOS[i].locales[j].done) c++; }
  _PF_PROGRESS.total = t; _PF_PROGRESS.comp = c;
}
function _pfUpdateProgressUI() {
  var s1p  = document.getElementById("s1p");
  var s1pf = document.getElementById("s1pf");
  var t = _PF_PROGRESS.total, c = _PF_PROGRESS.comp;
  if (s1p)  s1p.textContent  = c + "/" + t + " misiones";
  if (s1pf) s1pf.style.width = t > 0 ? (c/t*100) + "%" : "0%";
}

function actualizarItemLista(pi, li) {
  var loc  = PUNTOS[pi] ? PUNTOS[pi].locales[li] : null;
  if (!loc) { renderPuntos(); return; }
  var itemId = "loc_item_" + pi + "_" + li;
  var el = document.getElementById(itemId);
  if (!el) { renderPuntos(); return; }
  var tipo = loc.tipo || TIPOS_TRABAJO.OTRO;
  var ico  = TIPO_ICON[tipo]  || "📋";
  var col  = TIPO_COLOR[tipo] || "var(--g4)";
  var bg   = TIPO_BG[tipo]    || "var(--g1)";
  el.className = "cd" + (loc.done ? " dn" : "");
  el.querySelector(".pn").style.background = loc.done ? "var(--vc)" : bg;
  el.querySelector(".pn").style.color      = loc.done ? "var(--v)"  : col;
  el.querySelector(".pn").textContent = ico;
  el.querySelector(".pnm").textContent = loc.nombre;
  el.querySelector(".psb").textContent = loc.done ? "Completado ✓" : PUNTOS[pi].nombre;
  el.querySelector(".pch").textContent = loc.done ? "✓" : "›";
  // #CRÍTICO FIX O(1): actualizar solo el contador, no recorrer todo
  if (loc.done) _PF_PROGRESS.comp = Math.min(_PF_PROGRESS.comp + 1, _PF_PROGRESS.total);
  _pfUpdateProgressUI();
}

var TIPO_ICON = { mantenimiento:"🔧", retiro:"📦", entrega:"🚚", instalacion:"🔩", cobro:"💰", otro:"📋" };
var TIPO_COLOR = { mantenimiento:"var(--a)", retiro:"var(--n)", entrega:"var(--v)", instalacion:"var(--r)", cobro:"#888", otro:"var(--g4)" };
var TIPO_BG    = { mantenimiento:"var(--ac)", retiro:"var(--nc)", entrega:"var(--vc)", instalacion:"var(--rc)", cobro:"var(--g1)", otro:"var(--g1)" };

function pfFiltrarRecorrido(q) {
  // Re-renderizar con el filtro activo
  renderPuntos();
  // Restaurar foco en el campo de búsqueda
  setTimeout(function(){
    var el = document.getElementById("s1-search");
    if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
  }, 50);
}

function renderPuntos() {
  var lista = document.getElementById("s1list");
  if (!lista) return;
  var _esFabiola = (USUARIO_ACTUAL === "fabiola");
  var total = 0, comp = 0;
  for (var i = 0; i < PUNTOS.length; i++)
    for (var j = 0; j < PUNTOS[i].locales.length; j++) { total++; if (PUNTOS[i].locales[j].done) comp++; }
  var s1p  = document.getElementById("s1p");
  var s1pf = document.getElementById("s1pf");
  if (s1p)  s1p.textContent  = comp+"/"+total+" misiones";
  if (s1pf) s1pf.style.width = total > 0 ? (comp/total*100)+"%" : "0%";
  if (PUNTOS.length === 0) { mostrarSinRecorrido(); return; }
  _pfRecalcProgress();
  // Búsqueda global — preservar valor si ya existe
  var _busqVal = "";
  var _busqEl = document.getElementById("s1-search");
  if (_busqEl) _busqVal = _busqEl.value || "";
  // Header de jornada activa
  var jorActual = JORNADAS[JORNADA_ACTIVA];
  var h = "";
  if (JORNADAS.length > 1 && jorActual) {
    var emoji = jorActual.jornada === "TARDE" ? "🌙" : "☀️";
    var col   = jorActual.jornada === "TARDE" ? "var(--a)" : "var(--r)";
    h += '<div style="margin:8px 12px 4px;padding:10px 14px;background:'+col+';border-radius:12px;display:flex;align-items:center;justify-content:space-between">';
    h += '<div style="font-size:14px;font-weight:700;color:#fff">'+emoji+' '+jorActual.label+'</div>';
    if (!_esFabiola) {
      h += '<button onclick="renderSelectorJornada()" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;cursor:pointer">Cambiar</button>';
    }
    h += '</div>';
  }
  // Búsqueda global F8
  h += '<div style="padding:6px 12px 2px"><input id="s1-search" type="search" value="'+(_busqVal.replace(/"/g,"&quot;"))+'" placeholder="🔍 Buscar local..." oninput="pfFiltrarRecorrido(this.value)" style="width:100%;padding:9px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;box-sizing:border-box;color:var(--ng)"></div>';

  for (var i = 0; i < PUNTOS.length; i++) {
    var p = PUNTOS[i];
    var _puntoBusq = _busqVal.toLowerCase();
    // Si hay búsqueda activa, verificar si el punto tiene al menos un local que matchee
    if (_puntoBusq) {
      var _tieneMatch = p.locales.some(function(l){ return (l.nombre||"").toLowerCase().indexOf(_puntoBusq) !== -1 || (l.mision||"").toLowerCase().indexOf(_puntoBusq) !== -1; });
      if (!_tieneMatch) continue;
    }
    h += '<div class="slbl">📍 Punto '+p.num+' — '+p.nombre+'</div>';
    for (var j = 0; j < p.locales.length; j++) {
      var loc  = p.locales[j];
      // Filtrar por búsqueda
      if (_puntoBusq && (loc.nombre||"").toLowerCase().indexOf(_puntoBusq) === -1 && (loc.mision||"").toLowerCase().indexOf(_puntoBusq) === -1) continue;
      var tipo = loc.tipo || TIPOS_TRABAJO.OTRO;
      var ico  = TIPO_ICON[tipo]  || "📋";
      var col  = TIPO_COLOR[tipo] || "var(--g4)";
      var bg   = TIPO_BG[tipo]    || "var(--g1)";
      var _cl=_esFabiola?' onclick=""':' onclick="abrirLocal('+i+','+j+')"';
      h += '<div class="cd'+(loc.done?" dn":"")+'"'+_cl+' id="loc_item_'+i+'_'+j+'">';
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
  // #CRÍTICO FIX: evitar flash — solo actualizar DOM si contenido cambió
  if (lista._pfLastHash !== h) { lista._pfLastHash = h; lista.innerHTML = h; }
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
  // #008 FIX: snapshot ANTES de reasignar
  var _prevLocal = LOCAL_ACTUAL;
  LOCAL_ACTUAL    = loc;
  LOCAL_ACTUAL._pi = pi;
  LOCAL_ACTUAL._li = li;
  TIPO_TRABAJO    = loc.tipo || detectarTipoTrabajo(loc.mision);

  // #017 FIX: preservar foto ANTES del retiro previo (un solo bloque)
  var _tipoDetectado = loc.tipo || detectarTipoTrabajo(loc.mision || "");
  var _fotoAntesRetiro = null;
  if (_tipoDetectado === "entrega" || _tipoDetectado === TIPOS_TRABAJO.ENTREGA) {
    try {
      var _retPrevArr = JSON.parse(localStorage.getItem("pf_retiros") || "[]");
      var _retPrev = _retPrevArr.filter(function(r){ return r.local === loc.nombre && r.estado === "pendiente"; });
      if (_retPrev.length > 0 && _retPrev[0].fotoAntes) _fotoAntesRetiro = _retPrev[0].fotoAntes;
    } catch(e) {}
  }

  // Reset fotos — revocar URLs anteriores para evitar memory leaks
  for (var _k in FD) {
    if (FD[_k] && typeof FD[_k] === 'string' && FD[_k].indexOf('blob:') === 0) {
      try { URL.revokeObjectURL(FD[_k]); } catch(e) {}
    }
  }
  FD = {}; FB64 = {}; FOTOS_COUNT = 0;

  // Restaurar foto ANTES del retiro si existe
  if (_fotoAntesRetiro) { FB64["antes"] = _fotoAntesRetiro; FD["antes"] = _fotoAntesRetiro; }
  // Guardar ACCS del local anterior por si vuelve (no perder selección)
  // #48 FIX: solo guardar snapshot si hay accesorios (evitar escrituras innecesarias)
  if (_prevLocal && ACCS && ACCS.length > 0) {
    try {
      var snapKey = "pf_accs_snap_" + (_prevLocal.id || _prevLocal.nombre);
      localStorage.setItem(snapKey, JSON.stringify(ACCS));
    } catch(e) {}
  }
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

  // #097 FIX: mostrar campo monto si es COBRO
  setTimeout(function() {
    var monto_sec = document.getElementById("s2-monto-sec");
    if (monto_sec) monto_sec.style.display = (TIPO_TRABAJO === TIPOS_TRABAJO.COBRO) ? "block" : "none";
  }, 100);
}

function labelBotonFotos() {
  switch (TIPO_TRABAJO) {
    case TIPOS_TRABAJO.RETIRO:      return "Registrar retiro y firma";
    case TIPOS_TRABAJO.ENTREGA:     return "Registrar entrega y firma";
    case TIPOS_TRABAJO.INSTALACION: return "Registrar fotos de instalación";
    case TIPOS_TRABAJO.COBRO:       return "Registrar cobro";
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
  var checked = el.classList.contains("ok");
  el.textContent = checked ? "✓" : "";
  // #018 FIX: persistir en PUNTOS[]
  try {
    if (PUNTOS[pi] && PUNTOS[pi].locales[li] && PUNTOS[pi].locales[li].ext) {
      if (!PUNTOS[pi].locales[li]._extCheck) PUNTOS[pi].locales[li]._extCheck = {};
      PUNTOS[pi].locales[li]._extCheck[idx] = checked;
      localStorage.setItem("pf_recorrido_data", JSON.stringify(PUNTOS));
    }
  } catch(e) {}
}

function guardarFotoRetiro(nombreLocal, fb64) {
  // Guarda la foto ANTES del retiro vinculada al local
  try {
    var retiros = JSON.parse(localStorage.getItem("pf_fotos_retiro") || "{}");
    retiros[nombreLocal] = { fb64:fb64, fecha:fechaHoy() };
    localStorage.setItem("pf_fotos_retiro", JSON.stringify(retiros));
  } catch(e) {}
}

function getFotoRetiro(nombreLocal) {
  try {
    var retiros = JSON.parse(localStorage.getItem("pf_fotos_retiro") || "{}");
    return retiros[nombreLocal] || null;
  } catch(e) { return null; }
}

function confirmarSin() {
  if (!LOCAL_ACTUAL) return;
  var _msg_cs = TIPO_TRABAJO === TIPOS_TRABAJO.COBRO
    ? "¿Marcar «"+LOCAL_ACTUAL.nombre+"» como completado?"
    : "¿Marcar «"+LOCAL_ACTUAL.nombre+"» como completado sin registro?";
  pfConfirm(_msg_cs, function() {
    // #097 FIX: guardar monto si es COBRO
    if (TIPO_TRABAJO === TIPOS_TRABAJO.COBRO) {
      var montoEl = document.getElementById("s2-monto");
      var refEl   = document.getElementById("s2-monto-ref");
      var monto   = montoEl ? parseFloat(montoEl.value) || 0 : 0;
      var ref     = refEl   ? refEl.value.trim() : "";
      if (!LOCAL_ACTUAL._cobros) LOCAL_ACTUAL._cobros = [];
      LOCAL_ACTUAL._cobros.push({ monto: monto, ref: ref, fecha: fechaHoy(),
        hora: new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}) });
    }
    var duracion = detenerTimer();
    PUNTOS[LOCAL_ACTUAL._pi].locales[LOCAL_ACTUAL._li].done = true;
    // Guardar en jornada activa también
    if (JORNADAS[JORNADA_ACTIVA]) JORNADAS[JORNADA_ACTIVA].puntos = PUNTOS;
    try {
      localStorage.setItem("pf_recorrido_data",    JSON.stringify(PUNTOS));
      localStorage.setItem("pf_recorrido_jornadas", JSON.stringify(JORNADAS));
    } catch(e) {
      if (e.name === "QuotaExceededError") pfModal("⚠️ Almacenamiento lleno. Ve a Perfil → Backup y descarga tus datos.");
    }
    var hora = new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});
    // #14 FIX: guardar foto del retiro si existe, aunque se complete sin fotos
    if (TIPO_TRABAJO === TIPOS_TRABAJO.RETIRO) {
      var keysRet = Object.keys(FB64);
      if (keysRet.length > 0) {
        var primeraFoto = FB64[keysRet[0]];
        if (primeraFoto) guardarFotoRetiro(LOCAL_ACTUAL.nombre, primeraFoto);
      }
    }
    var item = { local:LOCAL_ACTUAL, punto:PUNTO_ACTUAL, hora:hora, fotos:0, accs:0, url:null, nombre:null, certNum:null, duracion:duracion, tipo:"sin_cert" };
    HISTORIAL.unshift(item);
    guardarHistorialDia(item);
    renderHistorial();
    renderPuntos();
    ir("s1");
  }); // pfConfirm
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
  // #63 FIX: mostrar requeridas vs tomadas
  var requeridas = 0;
  var sfotFotos = document.getElementById("sfot-fotos");
  if (sfotFotos) requeridas = sfotFotos.querySelectorAll(".fpend").length;
  var sfc  = document.getElementById("sfc");
  var sfpf = document.getElementById("sfpf");
  if (sfc)  sfc.textContent  = c + (requeridas > 0 ? "/"+requeridas : "") + " foto(s)";
  if (sfpf) sfpf.style.width = Math.min(c * (requeridas > 0 ? 100/requeridas : 33.3), 100)+"%";
}

function irFirma() {
  var c = 0;
  for (var k in FD) { if (FD[k]) c++; }
  if (c === 0) { pfModal("Necesitas al menos 1 foto para continuar."); return; }
  window._DESTINO_FIRMA = null; // viene de fotos → siempre certificado
  reinitCanvas();
  ir("sfir");
  setTimeout(actualizarBotonFirma, 350);
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

var FIRMA_GUARDADA_B64 = null; // #039 FIX: preservar firma entre cert y nota

function marcarFirmado() {
  var fpw  = document.getElementById("fpw");
  var fsub = document.getElementById("fsub");
  if (fpw)  fpw.classList.add("sig");
  if (fsub) fsub.textContent = "Firma registrada ✓";
  FIRMADO = true;
  // Guardar firma como base64 para que nota.js pueda usarla aunque el canvas se reinicie
  if (canvas && canvas.width > 50) {
    try { FIRMA_GUARDADA_B64 = canvas.toDataURL("image/png"); } catch(e) {}
  }
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
    h += '<div class="asi" onclick="addAcc(\''+pid+'\')"><div class="asn">'+(a.n.replace(/</g,'&lt;').replace(/>/g,'&gt;'))+'</div><div class="asp">$'+a.p.toFixed(2)+'</div></div>'; // #025 FIX XSS
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

// ── NOTA DE ENTREGA — pide firma primero ─────────────────────
var NOTA_PENDIENTE_PI = null;
var NOTA_PENDIENTE_LI = null;

// _generarPDFOrig: se parchea desde pdf.js después de load
var _generarPDFOrig = null;

function accionDespuesFirma() {
  if (window._DESTINO_FIRMA === "nota") {
    window._DESTINO_FIRMA = null;
    if (NOTA_PENDIENTE_PI !== null && NOTA_PENDIENTE_LI !== null) {
      abrirNotaEntrega(NOTA_PENDIENTE_PI, NOTA_PENDIENTE_LI);
    }
  } else if (TIPO_TRABAJO === TIPOS_TRABAJO.DISTRIBUIDOR) {
    irFirmaParaNota();
  } else {
    generarPDF();
  }
}

// Actualizar texto del botón al abrir sfir según destino
function actualizarBotonFirma() {
  var btn = document.getElementById("sfir-btn-txt");
  if (!btn) return;
  var _esDist = TIPO_TRABAJO===TIPOS_TRABAJO.DISTRIBUIDOR;
  btn.textContent = (window._DESTINO_FIRMA==="nota"||_esDist)?"Continuar a nota de entrega":"Generar certificado PDF";
  var _ns=document.getElementById("sfir-nov-sec"); if(_ns) _ns.style.display=_esDist?"none":"";
}

// irFirma: resetea destino y actualiza botón (coordinator.js agrega sus propios hooks encima)
// irFirmaParaNota: versión definitiva — coordinator.js NO la parchea
function irFirmaParaNota() {
  if (!LOCAL_ACTUAL) return;
  NOTA_PENDIENTE_PI = LOCAL_ACTUAL._pi;
  NOTA_PENDIENTE_LI = LOCAL_ACTUAL._li;
  window._DESTINO_FIRMA = "nota";
  reinitCanvas();
  ir("sfir");
  setTimeout(actualizarBotonFirma, 350);
}


function actualizarSigLocal() {
  var sigC = document.getElementById("sig-c");
  if (!sigC) return;
  for (var i = 0; i < PUNTOS.length; i++) {
    for (var j = 0; j < PUNTOS[i].locales.length; j++) {
      if (!PUNTOS[i].locales[j].done) {
        var loc = PUNTOS[i].locales[j];
        var tipo = loc.tipo || detectarTipoTrabajo(loc.mision);
        var ico = { mantenimiento:"🔧", retiro:"📦", entrega:"🚚", instalacion:"🔩", cobro:"💰", otro:"📋" }[tipo] || "📋";
        var _escNom  = (loc.nombre||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
        var _escPunt = (PUNTOS[i].nombre||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
        sigC.innerHTML = '<div class="sgn">'+ico+'</div><div><div class="sgnm">'+_escNom+'</div><div class="sgm">'+_escPunt+'</div></div>';
        return;
      }
    }
  }
  sigC.innerHTML = '<div style="font-size:14px;color:var(--v);font-weight:700">✅ ¡Recorrido completado!</div>';
}

function irSig() {
  // FIX: guardar progreso antes de saltar
  try { if(LOCAL_ACTUAL && typeof actualizarItemLista==="function") actualizarItemLista(LOCAL_ACTUAL._pi||0, LOCAL_ACTUAL._li||0); } catch(e){}
  for (var i = 0; i < PUNTOS.length; i++) {
    for (var j = 0; j < PUNTOS[i].locales.length; j++) {
      if (!PUNTOS[i].locales[j].done) { abrirLocal(i,j); return; }
    }
  }
  // #021 #53 FIX: limpiar estado completo al terminar el recorrido
  detenerTimer(); // MEDIO FIX: detener timer al terminar recorrido
  LOCAL_ACTUAL       = null;
  PUNTO_ACTUAL       = null;
  TIPO_TRABAJO       = null;
  FIRMA_GUARDADA_B64 = null;
  FIRMADO            = false;
  ACCS               = [];
  NOV                = null;
  ir("s1");
}

// ── HISTORIAL ────────────────────────────────────────────────
function renderHistorial() {
  var lista = document.getElementById("hist-l");
  if (!lista) return;
  if (HISTORIAL.length === 0) { lista.innerHTML = '<div class="empty">Aún no hay registros hoy</div>'; return; }
  // Filtro por tipo
  var _filtro = window._pfHistFiltro || "todos";
  var filtrados = _filtro === "todos" ? HISTORIAL : HISTORIAL.filter(function(h){ return h.tipo === _filtro || (h.tipo !== "sin_cert" && _filtro === "cert"); });
  var _tiposBtns = ["todos","mantenimiento","entrega","retiro","cobro"];
  var hf = '<div style="display:flex;gap:6px;padding:8px 12px;overflow-x:auto;-webkit-overflow-scrolling:touch">';
  _tiposBtns.forEach(function(t){
    var _act = _filtro === t;
    hf += '<button onclick="window._pfHistFiltro=\''+t+'\';renderHistorial()" style="flex-shrink:0;padding:5px 10px;border-radius:16px;border:1.5px solid '+(_act?'var(--r)':'var(--bo)')+';background:'+(_act?'var(--r)':'#fff')+';color:'+(_act?'#fff':'var(--g4)')+';font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>';
  });
  hf += '</div>';
  var h = hf + '<div class="slbl">Hoy — '+fechaHoy()+'</div>';
  for (var i = 0; i < filtrados.length; i++) {
    var hi = filtrados[i];
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
  if (filtrados.length === 0) h += '<div class="empty">Sin registros de este tipo hoy</div>';
  lista.innerHTML = h;
}

// ── OVERLAY ──────────────────────────────────────────────────
var _pfLoadingTimeout = null;
function mostrarCargando(mostrar, titulo, sub) {
  var lov = document.getElementById("lov");
  var ltx = document.getElementById("ltx");
  var lsb = document.getElementById("lsb");
  if (!lov) return;
  if (mostrar) {
    if (ltx) ltx.textContent = titulo || "Cargando...";
    if (lsb) lsb.textContent = sub    || "Por favor espera";
    lov.classList.add("show");
    // #47 FIX: timeout de seguridad — si en 30s no se oculta, ocultarlo automáticamente
    if (_pfLoadingTimeout) clearTimeout(_pfLoadingTimeout);
    _pfLoadingTimeout = setTimeout(function() {
      lov.classList.remove("show");
      console.warn("mostrarCargando: timeout de seguridad activado");
    }, 30000);
  } else {
    if (_pfLoadingTimeout) { clearTimeout(_pfLoadingTimeout); _pfLoadingTimeout = null; }
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
  // Mostrar tareas personales en perfil
  pfRenderTareasPerfil();
  // #AUDIO FIX: backup solo visible para Alejandro
  var backupEl = document.getElementById("pf-backup-btn");
  var backupSec = backupEl ? backupEl.closest("div[style]") : null;
  if (backupSec) backupSec.style.display = (USUARIO_ACTUAL === "alejandro") ? "block" : "none";
}

function cerrarSesion() {
  USUARIO_ACTUAL=null;TECNICO_NOMBRE="";JORNADAS=[];PUNTOS=[];JORNADA_ACTIVA=0;
  LOCAL_ACTUAL=null;PUNTO_ACTUAL=null;FD={};FB64={};ACCS=[];NOV=null;FIRMADO=false;
  pfConfirm("¿Cambiar de usuario?", function() {
    localStorage.removeItem("pf_usuario");
    // #019 FIX: limpiar interval de badge
    if (window._pfBadgeInterval) { clearInterval(window._pfBadgeInterval); window._pfBadgeInterval = null; }
    USUARIO_ACTUAL = null; PUNTOS = []; HISTORIAL = []; HISTORIAL_DIA = [];
    FIRMA_GUARDADA_B64 = null; NOV = null; FIRMADO = false;
    ir("slogin");
  });
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener("load", function() {
  initLogos();
  initFecha();
  renderAccSel();
  // #LOGIN-FIX: conectar la función real con el proxy del index.html y drenar cola
  window._seleccionarUsuarioReal = seleccionarUsuario;
  // #66 FIX: precargar jsPDF en background para que primera generación sea instantánea
  setTimeout(function() {
    if (!window.jspdf) {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onerror = function(){ console.warn("No se pudo precargar jsPDF"); };
      document.head.appendChild(s);
    }
  }, 4000); // 4 segundos después del login
  cargarHistorialDia();
  canvas = document.getElementById("cnv");
  if (canvas) setupCanvasEvents();
  // Si el usuario clickeó antes de que los scripts cargaran, drenar la cola
  if (window._pfLoginQueue && window._pfLoginQueue.length > 0) {
    var key = window._pfLoginQueue[window._pfLoginQueue.length - 1];
    window._pfLoginQueue = [];
    seleccionarUsuario(key);
    return; // ya hay usuario seleccionado, no aplicar auto-login
  }
  var saved = localStorage.getItem("pf_usuario");
  if (saved && USUARIOS[saved]) seleccionarUsuario(saved);
  else ir("slogin");
});

// ── TABS ADMIN ───────────────────────────────────────────────
// Soporta tabs 1-12 (coordinator.js extiende los handlers)
function admTab(n) {
  var MAX_TABS = 16;
  for (var i = 1; i <= MAX_TABS; i++) {
    var btn = document.getElementById("adm-t"+i);
    var pan = document.getElementById("adm-p"+i);
    if (btn) btn.className = "adm-tab-btn" + (i===n?" on":"");
    if (pan) pan.className = "adm-panel"   + (i===n?" on":"");
  }
  if (n === 3) { renderCalendarioMes(); renderResumenJornadas(); }
  if (n === 2) { renderPizarra(); }
}

function pfRenderPendientesIncluir() {
  var el = document.getElementById("admin-pendientes-incluir");
  if (!el) return;
  // Leer proformas autorizadas / pendientes de factura
  var proformas = [];
  try { proformas = JSON.parse(localStorage.getItem("pf_proformas") || "[]"); } catch(e) {}
  var pendientes = proformas.filter(function(p){
    return p.estado === "autorizada" || p.estado === "pend_factura";
  });
  if (!pendientes.length) {
    el.innerHTML = '<div style="font-size:13px;color:var(--g3);padding:8px 0">Sin proformas pendientes de entrega.</div>';
    return;
  }
  // Ver qué locales ya están en el recorrido de hoy
  var recData = [];
  try { recData = JSON.parse(localStorage.getItem("pf_recorrido_data") || "[]"); } catch(e) {}
  var localesEnRec = {};
  recData.forEach(function(p){ (p.locales||[]).forEach(function(l){ localesEnRec[(l.nombre||"").toLowerCase()] = true; }); });

  var h = "";
  pendientes.forEach(function(prof) {
    var cli = prof.cliente || {};
    var nomCli = (cli.razon || "—").toLowerCase();
    var yaIncluido = localesEnRec[nomCli];
    var col = yaIncluido ? "var(--v)" : "var(--n)";
    var bg  = yaIncluido ? "var(--vc)" : "var(--nc)";
    var ico = yaIncluido ? "✅" : "⚠️";
    h += '<div style="margin-bottom:8px;background:'+bg+';border-radius:12px;padding:10px 14px;border:1.5px solid '+col+'">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
    h += '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--ng)">'+ico+' '+(cli.razon||"—")+'</div>';
    h += '<div style="font-size:11px;color:var(--g4);margin-top:2px">'+prof.num+' · $'+prof.total.toFixed(2)+' · '+prof.fecha+'</div>';
    h += '<div style="font-size:11px;color:'+col+';font-weight:700;margin-top:2px">'+(yaIncluido?"Ya en el recorrido":"No está en el recorrido de hoy")+'</div></div>';
    if (!yaIncluido) {
      h += '<button onclick="pfAgregarProformaAlRecorrido(\''+prof.id+'\')" style="padding:6px 10px;border-radius:8px;border:none;background:var(--r);color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0;margin-left:8px">+ Agregar</button>';
    }
    h += '</div></div>';
  });
  el.innerHTML = h;
}

function pfAgregarProformaAlRecorrido(profId) {
  var proformas = [];
  try { proformas = JSON.parse(localStorage.getItem("pf_proformas") || "[]"); } catch(e) {}
  var prof = proformas.find(function(p){ return p.id === profId; });
  if (!prof) return;
  var cli = prof.cliente || {};
  var txt = document.getElementById("admin-txt");
  if (!txt) { pfModal("Abre el tab de Recorrido primero."); return; }
  var linea = "\nPunto — \n" + (cli.razon||"Cliente") + "\nMisión: Entregar productos de proforma " + prof.num + " ($" + prof.total.toFixed(2) + ")\n";
  txt.value = txt.value + linea;
  previsualizarRecorrido();
  // Ir al tab recorrido
  if (typeof admTab === "function") admTab(1);
  pfModal("✅ Local agregado al final del recorrido. Ajusta el número de punto.");
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
  var ciudad = localStorage.getItem("pf_ciudad") || "Guayaquil Ecuador"; // #59 FIX: ciudad configurable
  window.open("https://maps.google.com/maps?q=" + encodeURIComponent((nombre||"")+" "+(direccion||"")+" "+ciudad), "_blank");
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
  if (!seg || seg === 0) return "< 1 min"; // #034 FIX
  if (seg < 60) return seg + "s";
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
  // #020 FIX: revocar URLs viejas para evitar memory leak
  if (URLS_GENERADAS.length > 5) {
    var old = URLS_GENERADAS.splice(0, URLS_GENERADAS.length - 5);
    old.forEach(function(u){ try { URL.revokeObjectURL(u); } catch(e){} });
  }
  // #65 FIX: no guardar blob URL (inválida en futura sesión) — guardar solo metadata
  var itemSafe = {
    local:    item.local    ? { nombre: item.local.nombre, _pi: item.local._pi, _li: item.local._li } : null,
    punto:    item.punto    ? { nombre: item.punto.nombre, num: item.punto.num } : null,
    hora:     item.hora,
    fotos:    item.fotos,
    accs:     item.accs,
    url:      null,          // blob URL no persiste entre sesiones
    nombre:   item.nombre,
    certNum:  item.certNum,
    duracion: item.duracion,
    tipo:     item.tipo
  };
  HISTORIAL_DIA.unshift(itemSafe);
  HISTORIAL_DIA = HISTORIAL_DIA.slice(0, 200); // máximo 200 entradas
  HISTORIAL = HISTORIAL_DIA; // #012 FIX: mantener sincronizados
  localStorage.setItem("pf_hist_data", JSON.stringify(HISTORIAL_DIA));
}

// ════════════════════════════════════════════════════════════
//  SEMÁFORO DE VENCIMIENTOS EN LISTA DE PUNTOS
// ════════════════════════════════════════════════════════════
function semaforoVencimiento(proxMant) {
  // #56 FIX: delegar a pfSemaforoColor de mejoras2.js para evitar duplicación
  if (!proxMant) return "";
  try {
    var partes = proxMant.split("/");
    if (partes.length !== 3) return "";
    var fecha = new Date(parseInt(partes[2]), parseInt(partes[1])-1, parseInt(partes[0]));
    var dias  = Math.round((fecha - new Date()) / (1000*60*60*24));
    if (typeof pfSemaforoColor === "function") {
      var s = pfSemaforoColor(dias);
      return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:'+s.bg+';color:'+s.tx+'">'+s.ico+' '+s.label+'</span>';
    }
    if (dias < 0)  return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:var(--rc);color:var(--r)">VENCIDO</span>';
    if (dias < 30) return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:var(--rc);color:var(--r)">🔴 '+dias+'d</span>';
    if (dias < 60) return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:var(--nc);color:var(--n)">🟡 '+dias+'d</span>';
    return '<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:20px;background:var(--vc);color:var(--v)">🟢 '+dias+'d</span>';
  } catch(e) { return ""; }
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


// ═══════════════════════════════════════════════════════════
//  MÓDULO TALLER — Gestión de extintores en taller
//  Cualquiera puede registrar, queda registrado con su nombre
// ═══════════════════════════════════════════════════════════
var PF_TALLER_KEY = "pf_taller";

function pfGetTaller() {
  try { return JSON.parse(localStorage.getItem(PF_TALLER_KEY) || "[]"); } catch(e) { return []; }
}
function pfSaveTaller(arr) {
  try { localStorage.setItem(PF_TALLER_KEY, JSON.stringify(arr)); }
  catch(e) { if (e.name === "QuotaExceededError") pfModal("⚠️ Almacenamiento lleno. Haz un backup desde Perfil."); }
} // #097 FIX

// Agregar extintor al taller (desde retiro)
function pfIngresarAlTaller(local, descripcion, cantidad) {
  var taller = pfGetTaller();
  taller.unshift({
    id:          "tal_" + Date.now(),
    local:       local,
    descripcion: descripcion || "Extintor",
    cantidad:    cantidad || 1,
    estado:      "pendiente", // pendiente | en_proceso | listo
    accesorios:  [],          // accesorios cambiados
    fechaIngreso: fechaHoy(),
    fechaListo:   null,
    registradoPor: TECNICO_NOMBRE || "Técnico"
  });
  pfSaveTaller(taller);
}

function pfAgregarAccesorioTaller(id, accNombre, cant) {
  var taller = pfGetTaller();
  for (var i = 0; i < taller.length; i++) {
    if (taller[i].id === id) {
      taller[i].accesorios.push({
        nombre:    accNombre,
        cant:      cant || 1,
        fecha:     fechaHoy(),
        hora:      new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}),
        usuario:   TECNICO_NOMBRE || "Técnico"
      });
      if (taller[i].estado === "pendiente") taller[i].estado = "en_proceso";
      break;
    }
  }
  pfSaveTaller(taller);
  pfRenderTaller();
}

function pfMarcarListoTaller(id) {
  var taller = pfGetTaller();
  for (var i = 0; i < taller.length; i++) {
    if (taller[i].id === id) {
      taller[i].estado     = "listo";
      taller[i].fechaListo = fechaHoy();
      break;
    }
  }
  pfSaveTaller(taller);
  pfRenderTaller();
}

function pfActualizarBadgeTaller() {
  var badge = document.getElementById("nav-badge-taller");
  if (!badge) return;
  try {
    var taller = JSON.parse(localStorage.getItem(PF_TALLER_KEY) || "[]");
    var listos = taller.filter(function(t){ return t.estado === "listo"; }).length;
    badge.textContent = listos > 0 ? listos : "";
    badge.style.display = listos > 0 ? "flex" : "none";
  } catch(e) { badge.style.display = "none"; }
}

function pfRenderTaller() {
  var el = document.getElementById("pf-taller-lista");
  if (!el) return;
  pfActualizarBadgeTaller(); // actualizar badge
  var taller = pfGetTaller();

  if (!taller.length) {
    el.innerHTML = '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">No hay extintores en el taller.</div>';
    return;
  }

  var pendientes  = taller.filter(function(t){ return t.estado !== "listo"; });
  var listos      = taller.filter(function(t){ return t.estado === "listo"; });
  var h = "";

  // Resumen
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 12px 12px">';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--n)">'+taller.filter(function(t){return t.estado==="pendiente";}).length+'</div><div style="font-size:11px;color:var(--g3)">Pendientes</div></div>';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--a)">'+taller.filter(function(t){return t.estado==="en_proceso";}).length+'</div><div style="font-size:11px;color:var(--g3)">En proceso</div></div>';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--v)">'+listos.length+'</div><div style="font-size:11px;color:var(--g3)">Listos</div></div>';
  h += '</div>';

  // Formulario agregar extintor manual
  h += '<div style="margin:0 12px 10px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px">';
  h += '<div class="slbl" style="margin-bottom:8px">Ingresar extintor al taller</div>';
  h += '<input id="tal-local" placeholder="Cliente / local" style="width:100%;margin-bottom:6px;padding:8px 10px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px">';
  h += '<input id="tal-desc" placeholder="Descripción (ej: 10 LBS PQS)" style="width:100%;margin-bottom:6px;padding:8px 10px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px">';
  h += '<div style="display:flex;gap:6px">';
  h += '<input id="tal-cant" type="number" min="1" value="1" style="width:60px;padding:8px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px">';
  h += '<button type="button" onclick="pfIngresarManualTaller()" style="flex:1;padding:8px;border-radius:8px;border:none;background:var(--r);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">+ Ingresar</button>';
  h += '</div></div>';

  // Lista pendientes y en proceso
  if (pendientes.length) {
    h += '<div class="slbl">En taller</div>';
    pendientes.forEach(function(t) {
      var colEst = t.estado === "en_proceso" ? "var(--a)" : "var(--n)";
      var lblEst = t.estado === "en_proceso" ? "🔵 En proceso" : "⏳ Pendiente";
      h += '<div style="margin:0 12px 8px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);overflow:hidden">';
      h += '<div style="padding:10px 14px;display:flex;align-items:flex-start;gap:8px">';
      h += '<div style="flex:1"><div style="font-size:14px;font-weight:700">'+t.local+'</div>';
      h += '<div style="font-size:12px;color:var(--g4);margin-top:2px">'+t.cantidad+'x '+t.descripcion+'</div>';
      h += '<div style="font-size:11px;color:var(--g3);margin-top:2px">Ingresó: '+t.fechaIngreso+' · '+t.registradoPor+'</div>';
      // Accesorios registrados
      if (t.accesorios.length > 0) {
        h += '<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--bo)">';
        h += '<div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:3px">Accesorios cambiados:</div>';
        t.accesorios.forEach(function(a) {
          h += '<div style="font-size:12px;color:var(--ng)">• '+a.cant+'x '+a.nombre+' <span style="color:var(--g3)">('+a.usuario+' · '+a.fecha+')</span></div>';
        });
        h += '</div>';
      }
      h += '</div>';
      h += '<div style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:var(--g1);color:'+colEst+';flex-shrink:0">'+lblEst+'</div></div>';
      // Acciones
      h += '<div style="padding:0 12px 10px;display:flex;gap:6px;flex-wrap:wrap">';
      h += '<button type="button" onclick="pfAbrirAgregarAcc(\"'+t.id+'\")" style="padding:6px 10px;border-radius:8px;border:1.5px solid var(--bo);background:var(--g1);color:var(--ng);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">+ Accesorio</button>';
      h += '<button type="button" onclick="pfMarcarListoTaller(\"'+t.id+'\")" style="padding:6px 10px;border-radius:8px;border:none;background:var(--v);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">✓ Marcar listo</button>';
      h += '</div></div>';
    });
  }

  // Lista listos (últimos 5)
  if (listos.length) {
    h += '<div class="slbl">Listos para entrega ('+listos.length+')</div>';
    listos.slice(0,5).forEach(function(t) {
      h += '<div style="margin:0 12px 6px;background:var(--vc);border-radius:12px;border:1.5px solid var(--v);padding:10px 14px;display:flex;align-items:center;gap:8px">';
      h += '<div style="font-size:18px">✅</div>';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--v)">'+t.local+'</div>';
      h += '<div style="font-size:11px;color:var(--g4)">'+t.cantidad+'x '+t.descripcion+' · Listo: '+t.fechaListo+'</div>';
      if (t.accesorios.length > 0) h += '<div style="font-size:11px;color:var(--g4)">'+t.accesorios.length+' accesorio(s) cambiado(s)</div>';
      h += '</div></div>';
    });
  }

  h += '<div style="height:80px"></div>';
  el.innerHTML = h;
}

function pfIngresarManualTaller() {
  var loc  = document.getElementById("tal-local");
  var desc = document.getElementById("tal-desc");
  var cant = document.getElementById("tal-cant");
  if (!loc || !loc.value.trim()) { pfModal("Ingresa el nombre del cliente."); return; }
  var _cantVal = cant ? parseInt(cant.value)||1 : 1;
  if (_cantVal < 1) _cantVal = 1; // #017 FIX: indentación correcta // BAJO FIX: cantidad mínima 1
  pfIngresarAlTaller(loc.value.trim(), desc ? desc.value.trim() : "", _cantVal);
  if (loc) loc.value = ""; if (desc) desc.value = ""; if (cant) cant.value = "1";
  pfRenderTaller();
}

function pfAbrirAgregarAcc(talId) {
  pfPrompt("Accesorio cambiado (ej: Manómetro, Manguera PQS):", "", function(nombre) {
    if (!nombre || !nombre.trim()) return;
    pfPrompt("Cantidad:", "1", function(cantStr) {
      var cant = parseInt(cantStr) || 1;
      pfAgregarAccesorioTaller(talId, nombre.trim(), cant);
    });
  });
}

// Vista para técnicos — misma lógica pero en div distinto
function pfRenderTallerTec() {
  var tec = document.getElementById("pf-taller-lista-tec");
  if (!tec) return;
  var tmp = document.createElement("div");
  tmp.id  = "pf-taller-lista";
  tmp.style.display = "none";
  document.body.appendChild(tmp);
  try { // #018 FIX: try/finally para garantizar limpieza
    pfRenderTaller();
    tec.innerHTML = tmp.innerHTML;
  } finally {
    if (tmp.parentNode) document.body.removeChild(tmp);
  }
}

// ════════════════════════════════════════════════════════════
//  MODAL CUSTOM — reemplaza alert() y confirm()
//  pfModal(msg)         → alerta simple
//  pfConfirm(msg, fn)   → confirmación con callback
//  pfPrompt(msg, def, fn) → prompt con callback
// ════════════════════════════════════════════════════════════
function pfModal(msg, onOk) {
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px";
  ov.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:24px 20px;max-width:320px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.18)">' +
    '<div style="font-size:15px;font-weight:600;color:var(--ng);line-height:1.5;margin-bottom:20px;white-space:pre-wrap">'+msg.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div>' + // FIX: pre-wrap + XSS
    '<button style="width:100%;padding:14px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit" id="pfm-ok">Aceptar</button>' +
    '</div>';
  document.body.appendChild(ov);
  ov.querySelector('#pfm-ok').onclick = function() {
    document.body.removeChild(ov);
    if (typeof onOk === "function") onOk();
  };
}

function pfConfirm(msg, onSi, onNo) {
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px";
  ov.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:24px 20px;max-width:320px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.18)">' +
    '<div style="font-size:15px;font-weight:600;color:var(--ng);line-height:1.5;margin-bottom:20px;white-space:pre-wrap">'+msg.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div>' + // FIX: pre-wrap + XSS
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    '<button style="padding:14px;border-radius:12px;border:1.5px solid var(--bo);background:var(--g1);color:var(--g4);font-size:15px;font-weight:700;cursor:pointer;font-family:inherit" id="pfm-no">Cancelar</button>' +
    '<button style="padding:14px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit" id="pfm-si">Confirmar</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.querySelector('#pfm-si').onclick = function() { document.body.removeChild(ov); if (typeof onSi === "function") onSi(); };
  ov.querySelector('#pfm-no').onclick = function() { document.body.removeChild(ov); if (typeof onNo === "function") onNo(); };
}

function pfPrompt(msg, defVal, onOk) {
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px";
  ov.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:24px 20px;max-width:320px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.18)">' +
    '<div style="font-size:15px;font-weight:600;color:var(--ng);line-height:1.5;margin-bottom:12px;white-space:pre-wrap">'+msg.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div>' + // FIX
    '<input id="pfm-inp" value="'+(defVal||"")+'" style="width:100%;padding:12px 14px;border:1.5px solid var(--bo);border-radius:12px;font-family:inherit;font-size:15px;margin-bottom:16px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    '<button style="padding:14px;border-radius:12px;border:1.5px solid var(--bo);background:var(--g1);color:var(--g4);font-size:15px;font-weight:700;cursor:pointer;font-family:inherit" id="pfm-no">Cancelar</button>' +
    '<button style="padding:14px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit" id="pfm-ok">OK</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  var inp = ov.querySelector('#pfm-inp');
  setTimeout(function(){ inp.focus(); inp.select(); }, 100);
  ov.querySelector('#pfm-ok').onclick = function() {
    var v = inp.value; document.body.removeChild(ov);
    if (typeof onOk === "function") onOk(v);
  };
  ov.querySelector('#pfm-no').onclick = function() { document.body.removeChild(ov); };
  inp.addEventListener('keydown', function(e){ if (e.key==='Enter') ov.querySelector('#pfm-ok').click(); });
}


// ════════════════════════════════════════════════════════════
//  MÓDULO TAREAS INDEPENDIENTES  (#003 FIX)
//  Solo Alejandro crea tareas — todos pueden completarlas
// ════════════════════════════════════════════════════════════
var PF_TAREA_PRIO = "normal";

function pfSetPrioTarea(prio, btn) {
  PF_TAREA_PRIO = prio;
  ["urgente","normal","baja"].forEach(function(p) {
    var b = document.getElementById("pbt-"+p);
    if (b) b.className = "piz-tab-btn" + (p === prio ? " on" : "");
  });
}

function pfGetTareas() {
  try { return JSON.parse(localStorage.getItem("pf_tareas") || "[]"); } catch(e) { return []; }
}
function pfSaveTareas(arr) {
  try { localStorage.setItem("pf_tareas", JSON.stringify(arr)); } catch(e) {}
}

function pfCrearTarea() {
  var desc     = (document.getElementById("pf-tar-desc")     || {}).value || "";
  var tec      = (document.getElementById("pf-tar-tec")      || {}).value || "todos";
  var deadlineEl = document.getElementById("pf-tar-deadline");
  var deadline   = deadlineEl ? deadlineEl.value : "";
  // Convertir formato ISO (YYYY-MM-DD) a DD/MM/YYYY para consistencia
  if (deadline) {
    var _dp = deadline.split("-");
    if (_dp.length === 3) deadline = _dp[2]+"/"+_dp[1]+"/"+_dp[0];
  }
  if (!desc.trim()) { pfModal("Escribe la descripción de la tarea."); return; }
  var tareas = pfGetTareas();
  var tecNombres = { raul:"Raúl Romero", juan:"Juan Arboleda", fabiola:"Fabiola Mejía", todos:"Todos" };
  tareas.unshift({
    id: "tar_" + Date.now() + "_" + Math.random().toString(36).substr(2,5),
    desc: desc.trim(),
    tecnico: tec,
    tecNombre: tecNombres[tec] || tec,
    prioridad: PF_TAREA_PRIO,
    fecha: fechaHoy(),
    deadline: deadline || null,
    hora: new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}),
    completada: false,
    completadaPor: null,
    completadaHora: null
  });
  pfSaveTareas(tareas);
  var inp = document.getElementById("pf-tar-desc");
  if (inp) inp.value = "";
  if (deadlineEl) deadlineEl.value = "";
  pfRenderTareas();
}

function pfCompletarTarea(id) {
  var tareas = pfGetTareas();
  for (var i = 0; i < tareas.length; i++) {
    if (tareas[i].id === id) {
      tareas[i].completada    = true;
      tareas[i].completadaPor = (typeof TECNICO_NOMBRE !== "undefined" && TECNICO_NOMBRE) ? TECNICO_NOMBRE : "Técnico";
      tareas[i].completadaHora = new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});
      break;
    }
  }
  pfSaveTareas(tareas);
  pfRenderTareas();
}

function pfEliminarTarea(id) {
  pfConfirm("¿Eliminar esta tarea?", function() {
    var tareas = pfGetTareas().filter(function(t){ return t.id !== id; });
    pfSaveTareas(tareas);
    pfRenderTareas();
  });
}


function pfEditarTarea(id) {
  var t = pfGetTareas().find(function(x){return x.id===id;});
  if (!t) return;
  // Convertir DD/MM/YYYY a YYYY-MM-DD para el input date
  var _dlISO = "";
  if (t.deadline) {
    var _dp = t.deadline.split("/");
    if (_dp.length === 3) _dlISO = _dp[2]+"-"+_dp[1]+"-"+_dp[0];
  }
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px";
  ov.innerHTML = '<div style="background:#fff;border-radius:20px;padding:24px 20px;max-width:340px;width:100%">' +
    '<div style="font-size:17px;font-weight:700;margin-bottom:14px">✏️ Editar tarea</div>' +
    '<input id="pf-et-desc" type="text" value="'+t.desc.replace(/"/g,"&quot;")+'" style="width:100%;padding:10px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:10px">' +
    '<select id="pf-et-prio" style="width:100%;padding:10px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:10px">' +
    '<option value="urgente"'+(t.prioridad==="urgente"?" selected":"")+'>🔴 Urgente</option>' +
    '<option value="normal"'+(t.prioridad==="normal"?" selected":"")+'>🔵 Normal</option>' +
    '<option value="baja"'+(t.prioridad==="baja"?" selected":"")+'>⬜ Baja</option>' +
    '</select>' +
    '<div style="font-size:10px;font-weight:700;color:var(--g3);margin-bottom:4px">FECHA LÍMITE (opcional)</div>' +
    '<input id="pf-et-deadline" type="date" value="'+_dlISO+'" style="width:100%;padding:9px 10px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:13px;margin-bottom:14px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    '<button id="pf-et-cancel" style="padding:13px;border-radius:12px;border:1.5px solid var(--bo);background:var(--g1);color:var(--g4);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Cancelar</button>' +
    '<button id="pf-et-ok" style="padding:13px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Guardar</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.querySelector("#pf-et-cancel").onclick = function(){document.body.removeChild(ov);};
  ov.querySelector("#pf-et-ok").onclick = function(){
    var desc = ov.querySelector("#pf-et-desc").value.trim();
    var prio = ov.querySelector("#pf-et-prio").value;
    var dlRaw = ov.querySelector("#pf-et-deadline").value;
    var dl = "";
    if (dlRaw) { var _dp = dlRaw.split("-"); if (_dp.length===3) dl = _dp[2]+"/"+_dp[1]+"/"+_dp[0]; }
    if (!desc) { pfModal("La descripción no puede estar vacía."); return; }
    var todas = pfGetTareas();
    for (var i=0;i<todas.length;i++) if(todas[i].id===id){todas[i].desc=desc;todas[i].prioridad=prio;todas[i].deadline=dl||null;break;}
    pfSaveTareas(todas); pfRenderTareas(); document.body.removeChild(ov);
  };
}
function pfRenderTareas() {
  var el = document.getElementById("pf-tareas-lista");
  if (!el) return;
  var tareas = pfGetTareas();
  if (!tareas.length) {
    el.innerHTML = '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Sin tareas asignadas.</div>';
    return;
  }
  var prioColor = { urgente:"var(--r)", normal:"var(--a)", baja:"var(--g4)" };
  var prioIco   = { urgente:"🔴", normal:"🔵", baja:"⬜" };
  var h = "";
  var pendientes = tareas.filter(function(t){ return !t.completada; });
  var completadas = tareas.filter(function(t){ return t.completada; });

  if (pendientes.length) {
    h += '<div class="slbl">Pendientes ('+pendientes.length+')</div>';
    pendientes.forEach(function(t) {
      var col = prioColor[t.prioridad] || "var(--g4)";
      var _hoy = fechaHoy();
      var _vencida = t.deadline && t.deadline < _hoy;
      var _pronto  = t.deadline && t.deadline === _hoy;
      h += '<div style="margin:0 12px 8px;background:#fff;border-radius:14px;border:1.5px solid '+(_vencida?"var(--r)":col)+';padding:12px 14px">';
      h += '<div style="display:flex;align-items:flex-start;gap:8px">';
      h += '<div style="font-size:18px;flex-shrink:0">'+(prioIco[t.prioridad]||"📋")+'</div>';
      h += '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:var(--ng)">'+t.desc+'</div>';
      h += '<div style="font-size:11px;color:var(--g4);margin-top:3px">'+t.tecNombre+' · '+t.fecha;
      if (t.deadline) h += ' · <span style="color:'+(_vencida?"var(--r)":_pronto?"var(--n)":"var(--g4)")+'">⏰ Límite: '+t.deadline+'</span>';
      h += '</div></div></div>';
      h += '<div style="display:grid;grid-template-columns:1fr auto auto;gap:6px;margin-top:10px">';
      h += '<button onclick="pfCompletarTarea(\''+t.id+'\')" style="padding:10px;border-radius:10px;border:none;background:var(--v);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">✅ Completar</button>';
      h += '<button onclick="pfEditarTarea(\''+t.id+'\')" style="padding:10px 12px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:13px;color:var(--a);cursor:pointer;font-family:inherit">✏️</button>';
      h += '<button onclick="pfEliminarTarea(\''+t.id+'\')" style="padding:10px 12px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:13px;color:var(--r);cursor:pointer;font-family:inherit">🗑</button>';
      h += '</div></div>';
    });
  }

  if (completadas.length) {
    h += '<div class="slbl">Completadas ('+completadas.length+')</div>';
    completadas.slice(0,5).forEach(function(t) {
      h += '<div style="margin:0 12px 6px;background:var(--vc);border-radius:12px;border:1.5px solid var(--v);padding:10px 14px;opacity:.8">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--v)">✅ '+t.desc+'</div>';
      h += '<div style="font-size:11px;color:var(--g4);margin-top:2px">'+t.tecNombre+' · Completó: '+(t.completadaPor||"")+'</div>';
      h += '</div>';
    });
  }

  el.innerHTML = h;
}






// ════════════════════════════════════════════════════════════
//  NUEVO CLIENTE TEMPORAL (#002 FIX)
// ════════════════════════════════════════════════════════════
function pfAbrirFormNuevoCliente() {
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px";
  ov.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:24px 20px;max-width:340px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.18)">' +
    '<div style="font-size:17px;font-weight:700;margin-bottom:16px">➕ Nuevo cliente</div>' +
    '<input id="nc-nombre" placeholder="Nombre / Razón social *" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:8px">' +
    '<input id="nc-ruc" placeholder="RUC / CI" inputmode="numeric" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:8px">' +
    '<input id="nc-dir" placeholder="Dirección" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:8px">' +
    '<input id="nc-tel" placeholder="Teléfono" inputmode="tel" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:16px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    '<button style="padding:13px;border-radius:12px;border:1.5px solid var(--bo);background:var(--g1);color:var(--g4);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit" id="nc-cancel">Cancelar</button>' +
    '<button style="padding:13px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit" id="nc-ok">Guardar</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.querySelector('#nc-cancel').onclick = function(){ document.body.removeChild(ov); };
  ov.querySelector('#nc-ok').onclick = function(){
    var nombre = ov.querySelector('#nc-nombre').value.trim();
    if (!nombre) { pfModal("El nombre es obligatorio."); return; }
    var cli = {
      codigo: "TEMP-" + Date.now(),
      nombre: nombre,
      razon:  nombre,
      ruc:    ov.querySelector('#nc-ruc').value.trim(),
      dir:    ov.querySelector('#nc-dir').value.trim(),
      tel:    ov.querySelector('#nc-tel').value.trim(),
      marca:  "Temporal",
      mes:    "",
      freqMant: "1 año",
      freqRec:  "1 año",
      responsable: ""
    };
    try {
      var custom = JSON.parse(localStorage.getItem("pf_clientes_custom") || "[]");
      custom.push(cli);
      localStorage.setItem("pf_clientes_custom", JSON.stringify(custom));
      document.body.removeChild(ov);
      pfModal("✅ Cliente " + nombre + " agregado temporalmente.");
    } catch(e) { pfModal("Error al guardar: " + e.message); }
  };
}

// ════════════════════════════════════════════════════════════
//  GUARDAR CONFIG NOTA (#003 FIX)
// ════════════════════════════════════════════════════════════
function pfGuardarConfigNota() {
  var validez = document.getElementById("cfg-validez");
  var pago    = document.getElementById("cfg-pago");
  var ciudad  = document.getElementById("cfg-ciudad");
  if (validez) localStorage.setItem("pf_nota_validez", validez.value.trim() || "30 DÍAS");
  if (pago)    localStorage.setItem("pf_nota_pago",    pago.value.trim()    || "CRÉDITO");
  if (ciudad)  localStorage.setItem("pf_ciudad",       ciudad.value.trim()  || "Guayaquil Ecuador");
  pfModal("✅ Configuración guardada correctamente.");
}

// ════════════════════════════════════════════════════════════
//  DEBOUNCE para botones críticos (evitar doble tap)
// ════════════════════════════════════════════════════════════
var _pfLastClick = {};
function pfDebounce(fn, key, ms) {
  var now = Date.now();
  ms = ms || 1200;
  if (_pfLastClick[key] && (now - _pfLastClick[key]) < ms) return;
  _pfLastClick[key] = now;
  fn();
}

// ════════════════════════════════════════════════════════════
//  SINCRONIZACIÓN DE FICHAS (#107 FIX)
//  Sube pf_fichas a Sheets y baja fichas de todos los dispositivos
// ════════════════════════════════════════════════════════════
function pfSincronizarFichas(callback) {
  var fichasLocales = {};
  try { fichasLocales = JSON.parse(localStorage.getItem("pf_fichas") || "{}"); } catch(e) {}

  var dispositivo = localStorage.getItem("pf_dispositivo") || "dev_" + Date.now();
  localStorage.setItem("pf_dispositivo", dispositivo);

  // 1. Subir fichas locales
  fetch(SCRIPT_URL, {
    method:  "POST",
    body: JSON.stringify({
      accion:      "guardar_fichas",
      fichas:      fichasLocales,
      dispositivo: dispositivo,
      token:       localStorage.getItem("pf_token") || ""
    })
  })
  .then(function(r){ return r.json(); })
  .then(function() {
    // 2. Bajar fichas merged de todos los dispositivos
    return fetch(SCRIPT_URL, {
      method:  "POST",
      body: JSON.stringify({ accion: "get_fichas", dispositivo: dispositivo, token: localStorage.getItem("pf_token") || "" })
    });
  })
  .then(function(r){ return r.json(); })
  .then(function(data) {
    if (data.ok && data.data) {
      // Merge con locales (locales tienen prioridad para datos de hoy)
      var remoto = data.data;
      var hoy    = fechaHoy();
      for (var local in remoto) {
        if (!fichasLocales[local]) {
          fichasLocales[local] = remoto[local];
        } else {
          // Agregar visitas remotas que no están en local
          var localVisitas  = fichasLocales[local].visitas || [];
          var remotoVisitas = remoto[local].visitas || [];
          var keys = {};
          localVisitas.forEach(function(v){ keys[v.fecha+"_"+v.hora+"_"+v.tipo] = true; });
          remotoVisitas.forEach(function(v) {
            var k = v.fecha+"_"+v.hora+"_"+v.tipo;
            if (!keys[k]) { localVisitas.push(v); keys[k] = true; }
          });
          localVisitas.sort(function(a,b){
            return (b.fecha+b.hora).localeCompare(a.fecha+a.hora);
          });
          fichasLocales[local].visitas = localVisitas;
        }
      }
      localStorage.setItem("pf_fichas", JSON.stringify(fichasLocales));
      localStorage.setItem("pf_ultima_sync", new Date().toISOString());
      if (typeof callback === "function") callback(true, Object.keys(fichasLocales).length);
    }
  })
  .catch(function(err) {
    console.warn("pfSincronizarFichas error:", err);
    if (typeof callback === "function") callback(false, 0);
  });
}

// Sincronización automática al cargar (si es admin o técnico con datos)
function pfAutoSync() {
  if (!navigator.onLine) return;
  var ultimaSync = localStorage.getItem("pf_ultima_sync");
  if (ultimaSync) {
    try {
    var diff = (new Date() - new Date(ultimaSync)) / 60000; // minutos
    if (diff < 5) return;
    } catch(e) { localStorage.removeItem("pf_ultima_sync"); } // #011 FIX
  }
  pfSincronizarFichas(function(ok, n) {
    if (ok) console.log("Sync OK: " + n + " locales sincronizados");
  });
}

// ════════════════════════════════════════════════════════════
//  CONFIG DE PRECIOS — Tab 13 admin (#019 FIX)
// ════════════════════════════════════════════════════════════
function pfRenderConfigPrecios() {
  var el = document.getElementById("pf-config-precios");
  if (!el) return;
  var preciosGuardados = {};
  try { preciosGuardados = JSON.parse(localStorage.getItem("pf_precios_accs") || "{}"); } catch(e) {}

  // Leer IVA actual
  var tasaIVA = parseFloat(localStorage.getItem('pf_iva') || '0.15');
  var h = '<div style="padding:12px 0">';
  h += '<div class="slbl">Tasa IVA</div>';
  h += '<div style="margin:0 12px 12px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 14px;display:flex;align-items:center;gap:10px">';
  h += '<div style="flex:1;font-size:13px;font-weight:600;color:var(--ng)">IVA aplicado</div>';
  h += '<div style="display:flex;align-items:center;gap:4px">';
  h += '<input type="number" step="1" min="0" max="100" id="prc-iva" value="'+(tasaIVA*100).toFixed(0)+'" style="width:60px;padding:6px 8px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;text-align:right">';
  h += '<span style="font-size:13px;color:var(--g4)">%</span>';
  h += '</div></div>';
  h += '<div class="slbl">Precios de accesorios</div>';
  h += '<div style="margin:0 12px 12px;background:#fff;border-radius:14px;border:1.5px solid var(--bo);overflow:hidden">';

  for (var i = 0; i < ACCESORIOS.length; i++) {
    var a = ACCESORIOS[i];
    var precio = preciosGuardados[a.id] !== undefined ? preciosGuardados[a.id] : a.p;
    h += '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--bo)">';
    h += '<div style="flex:1;font-size:13px;font-weight:600;color:var(--ng)">'+a.n+'</div>';
    h += '<div style="display:flex;align-items:center;gap:4px">';
    h += '<span style="font-size:13px;color:var(--g4)">$</span>';
    h += '<input type="number" step="0.01" min="0" id="prc-'+a.id+'" value="'+precio.toFixed(2)+'" ';
    h += 'style="width:70px;padding:6px 8px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;text-align:right">';
    h += '</div></div>';
  }
  h += '</div>';

  // Botones
  h += '<div style="padding:0 12px 16px;display:flex;gap:8px">';
  h += '<button type="button" onclick="pfGuardarPrecios()" style="flex:1;padding:14px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">💾 Guardar precios</button>';
  h += '<button type="button" onclick="pfResetPrecios()" style="padding:14px 16px;border-radius:12px;border:1.5px solid var(--bo);background:#fff;color:var(--g4);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">↺</button>';
  h += '</div>';
  // #72 #73 FIX: config nota de entrega
  h += '<div class="slbl">Configuración Nota de Entrega</div>';
  h += '<div style="margin:0 12px 12px;background:#fff;border-radius:14px;border:1.5px solid var(--bo);overflow:hidden">';
  var cfgCampos = [
    {id:"cfg-validez", label:"Validez de la nota", key:"pf_nota_validez", def:"30 DÍAS"},
    {id:"cfg-pago",    label:"Forma de pago",       key:"pf_nota_pago",    def:"CRÉDITO"},
    {id:"cfg-ciudad",  label:"Ciudad para Maps",     key:"pf_ciudad",       def:"Guayaquil Ecuador"}
  ];
  cfgCampos.forEach(function(c) {
    h += '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--bo)">';
    h += '<div style="flex:1;font-size:13px;font-weight:600;color:var(--ng)">'+c.label+'</div>';
    h += '<input type="text" id="'+c.id+'" value="'+(localStorage.getItem(c.key)||c.def)+'" ';
    h += 'style="width:120px;padding:6px 8px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px">';
    h += '</div>';
  });
  h += '</div>';
  // Botón guardar config
  h += '<div style="padding:0 12px 8px"><button type="button" onclick="pfGuardarConfigNota()" style="width:100%;padding:12px;border-radius:12px;border:none;background:var(--a);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">💾 Guardar configuración</button></div>';
  h += '<div style="height:80px"></div></div>';

  el.innerHTML = h;
}

function pfGuardarPrecios() {
  var precios = {};
  for (var i = 0; i < ACCESORIOS.length; i++) {
    var inp = document.getElementById("prc-"+ACCESORIOS[i].id);
    if (inp) {
      var v = parseFloat(inp.value);
      if (!isNaN(v) && v >= 0) {
        precios[ACCESORIOS[i].id] = v;
        ACCESORIOS[i].p = v; // actualizar en memoria también
      }
    }
  }
  // Guardar IVA
  var ivaInp = document.getElementById("prc-iva");
  if (ivaInp) {
    var ivaRaw = parseFloat(ivaInp.value) || 15;
    // #015 FIX: si usuario escribe 0.15 en lugar de 15, corregir
    if (ivaRaw < 1) ivaRaw = ivaRaw * 100;
    var tasaIVA = Math.min(Math.max(ivaRaw, 0), 100) / 100;
    localStorage.setItem("pf_iva", tasaIVA.toString());
  }
  localStorage.setItem("pf_precios_accs", JSON.stringify(precios));
  renderAccSel(); // re-render lista de accesorios
  pfModal("✅ Precios guardados correctamente.");
}

function pfResetPrecios() {
  pfConfirm("¿Restaurar precios por defecto?", function() {
    localStorage.removeItem("pf_precios_accs");
    // Recargar precios originales (hardcoded)
    var defaults = [
      {id:"abrazadera",p:1.50},{id:"manometro",p:2.80},{id:"cabezal_pqs",p:8.80},
      {id:"manguera_pqs",p:4.80},{id:"corneta_co2_5",p:8.80},{id:"corneta_co2_10",p:0},
      {id:"manguera_co2_10",p:13.80},{id:"empaque",p:1.50},{id:"soporte",p:5.00},
      {id:"piton",p:1.50},{id:"tubo_sifon",p:2.00},{id:"boquilla",p:1.00},
      {id:"valvula_pqs",p:3.00},{id:"pintura",p:2.00},{id:"letrero",p:3.50},{id:"soporte_pared",p:5.00}
    ];
    for (var i = 0; i < ACCESORIOS.length; i++) {
      for (var j = 0; j < defaults.length; j++) {
        if (defaults[j].id === ACCESORIOS[i].id) { ACCESORIOS[i].p = defaults[j].p; break; }
      }
    }
    renderAccSel();
    pfRenderConfigPrecios();
    pfModal("↺ Precios restaurados a valores por defecto.");
  });
}

// Registrar tab 12 en coordinator
window.addEventListener("load", function() {
  if (window.PF_TAB_HANDLERS) {
    window.PF_TAB_HANDLERS[12] = function() { pfRenderTareas(); };
  }
  // admTab ya soporta hasta 12
});

// ════════════════════════════════════════════════════════════
//  FUNCIONES DE NAVEGACIÓN Y FLUJO (#001 #021 #098 #099 #102)
// ════════════════════════════════════════════════════════════

// #001 #004: back button de sfir va al origen correcto
function irAtras_sfir() {
  if (window._DESTINO_FIRMA === "nota") { ir("s2"); }
  else { ir("sfot"); }
}

// #098: deshacer completar sin registro
function deshacerUltimoDone() {
  if (!PUNTOS || !PUNTO_ACTUAL) return;
  var pi = PUNTO_ACTUAL._pi !== undefined ? PUNTO_ACTUAL._pi : -1;
  if (pi < 0) return;
  var locales = PUNTOS[pi] ? PUNTOS[pi].locales : [];
  for (var i = locales.length - 1; i >= 0; i--) {
    if (locales[i].done) {
      locales[i].done = false;
      if (locales[i].noDisp) delete locales[i].noDisp;
      localStorage.setItem("pf_recorrido_data", JSON.stringify(PUNTOS));
      renderPuntos();
      pfModal("↩️ «" + locales[i].nombre + "» marcado como pendiente.");
      return;
    }
  }
  pfModal("No hay locales completados para deshacer.");
}

// #102: regenerar PDF si hubo error
function pfRegenerarPDF() {
  pfConfirm("¿Regenerar el PDF? Se volverá a la pantalla de fotos.", function() {
    if (window._ULTIMO_LOCAL_CERT && window._ULTIMO_LOCAL_CERT.local) {
      var loc = window._ULTIMO_LOCAL_CERT.local;
      if (PUNTOS[loc._pi] && PUNTOS[loc._pi].locales[loc._li]) {
        PUNTOS[loc._pi].locales[loc._li].done = false;
        localStorage.setItem("pf_recorrido_data", JSON.stringify(PUNTOS));
      }
      FIRMA_GUARDADA_B64 = null; FIRMADO = false;
      abrirLocal(loc._pi, loc._li);
    } else { pfModal("No hay referencia al certificado anterior."); }
  });
}

// #099: marcar local no disponible (cerrado, sin encargado)
function pfMarcarNoDisponible() {
  if (!LOCAL_ACTUAL) return;
  pfConfirm("¿Marcar «"+LOCAL_ACTUAL.nombre+"» como NO DISPONIBLE?\n(cerrado, sin encargado, etc.)", function() {
    var duracion = detenerTimer();
    PUNTOS[LOCAL_ACTUAL._pi].locales[LOCAL_ACTUAL._li].done   = true;
    PUNTOS[LOCAL_ACTUAL._pi].locales[LOCAL_ACTUAL._li].noDisp = true;
    // #4 FIX: actualizar JORNADAS también para que persista entre recargas
    if (typeof JORNADAS !== "undefined" && JORNADAS[JORNADA_ACTIVA]) {
      JORNADAS[JORNADA_ACTIVA].puntos = PUNTOS;
      localStorage.setItem("pf_recorrido_jornadas", JSON.stringify(JORNADAS));
    }
    localStorage.setItem("pf_recorrido_data", JSON.stringify(PUNTOS));
    if (typeof pfRegistrarVisitaEnFicha === "function") {
      pfRegistrarVisitaEnFicha(LOCAL_ACTUAL.nombre, {
        fecha: fechaHoy(), hora: new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}),
        tipo: "no_disponible", tecnico: TECNICO_NOMBRE || "Técnico",
        nota: "Local no disponible", punto: PUNTO_ACTUAL ? PUNTO_ACTUAL.nombre : ""
      });
    }
    guardarHistorialDia({ local: LOCAL_ACTUAL, punto: PUNTO_ACTUAL,
      hora: new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}),
      fotos: 0, accs: 0, url: null, nombre: null,
      certNum: "ND", duracion: duracion, tipo: "no_disponible" });
    renderPuntos(); ir("s1");
  });
}

// ════════════════════════════════════════════════════════════
//  TAREAS PERSONALES EN PERFIL (#AUDIO FIX)
// ════════════════════════════════════════════════════════════
function pfRenderTareasPerfil() {
  var el = document.getElementById("sperf-tareas");
  if (!el || !USUARIO_ACTUAL) return;
  var tareas = pfGetTareas();
  // Filtrar tareas del usuario actual
  var misKey = USUARIO_ACTUAL;
  var misTareas = tareas.filter(function(t) {
    return t.tecnico === misKey || t.tecnico === "todos";
  });
  var pendientes = misTareas.filter(function(t){ return !t.completada; });
  if (pendientes.length === 0) {
    el.innerHTML = '<div style="font-size:13px;color:var(--g3);padding:8px 16px">Sin tareas pendientes ✓</div>';
    return;
  }
  var prioIco = { urgente:"🔴", normal:"🔵", baja:"⬜" };
  var h = '<div class="slbl">Mis tareas ('+pendientes.length+')</div>';
  pendientes.forEach(function(t) {
    h += '<div style="margin:0 12px 8px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:10px 14px">';
    h += '<div style="display:flex;align-items:center;gap:8px">';
    h += '<div style="font-size:16px">'+(prioIco[t.prioridad]||"📋")+'</div>';
    h += '<div style="flex:1"><div style="font-size:13px;font-weight:700">'+t.desc+'</div>';
    h += '<div style="font-size:11px;color:var(--g3);margin-top:2px">'+t.fecha+'</div></div>';
    h += '<button onclick="pfCompletarTarea(\''+t.id+'\');pfRenderTareasPerfil()" style="padding:6px 12px;border-radius:8px;border:none;background:var(--v);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">✓ Listo</button>';
    h += '<button onclick="pfEditarTarea(\''+t.id+'\');setTimeout(pfRenderTareasPerfil,300)" style="padding:6px 10px;border-radius:8px;border:1.5px solid var(--bo);background:#fff;font-size:12px;color:var(--a);cursor:pointer;font-family:inherit;margin-left:4px">✏️</button>';
    h += '</div></div>';
  });
  el.innerHTML = h;
}

// ════════════════════════════════════════════════════════════
//  ADMIN — MARCAR VISITA MANUALMENTE (#NUEVA FUNCIONALIDAD)
//  Alejandro puede registrar visitas sin depender del técnico
// ════════════════════════════════════════════════════════════
function pfAdminMarcarVisita() {
  if (typeof PF_CLIENTES === "undefined") { pfModal("Cargando clientes..."); return; }
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:600;display:flex;align-items:flex-end;justify-content:center";
  var mesesOpts = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"]
    .map(function(m,i){ return '<option value="'+(i+1)+'"'+(i+1===new Date().getMonth()+1?' selected':'')+'>'+m+'</option>'; }).join('');
  var hoy = fechaHoy();
  ov.innerHTML =
    '<div style="background:#fff;border-radius:20px 20px 0 0;padding:0;width:100%;max-width:480px;max-height:90vh;overflow-y:auto">' +
    '<div style="background:var(--r);padding:16px 18px;border-radius:20px 20px 0 0;display:flex;align-items:center;justify-content:space-between">' +
    '<div style="font-size:17px;font-weight:700;color:#fff">📋 Registrar visita manualmente</div>' +
    '<button id="mv-close" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:22px;width:36px;height:36px;border-radius:10px;cursor:pointer">✕</button>' +
    '</div>' +
    '<div style="padding:16px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:4px">CLIENTE / LOCAL *</div>' +
    '<input id="mv-local" placeholder="Nombre del local" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:10px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:4px">TIPO DE VISITA</div>' +
    '<select id="mv-tipo" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:10px">' +
    '<option value="mantenimiento">🔧 Mantenimiento</option>' +
    '<option value="instalacion">🔩 Instalación</option>' +
    '<option value="entrega">🚚 Entrega</option>' +
    '<option value="cobro">💰 Cobro</option>' +
    '<option value="retiro">📦 Retiro</option>' +
    '</select>' +
    '<div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:4px">TÉCNICO</div>' +
    '<select id="mv-tec" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:10px">' +
    '<option value="Raúl Romero">Raúl Romero</option>' +
    '<option value="Juan Arboleda">Juan Arboleda</option>' +
    '<option value="Alejandro">Alejandro</option>' +
    '</select>' +
    '<div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:4px">FECHA (DD/MM/AAAA)</div>' +
    '<input id="mv-fecha" value="'+hoy+'" placeholder="DD/MM/AAAA" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:10px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:4px">NOTA (opcional)</div>' +
    '<textarea id="mv-nota" placeholder="Observaciones del servicio..." style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;height:70px;resize:none;margin-bottom:14px"></textarea>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    '<button id="mv-cancel" style="padding:14px;border-radius:12px;border:1.5px solid var(--bo);background:#fff;color:var(--g4);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Cancelar</button>' +
    '<button id="mv-ok" style="padding:14px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">✅ Registrar</button>' +
    '</div></div></div>';
  document.body.appendChild(ov);
  document.body.style.overflow = "hidden";
  var _cerrar = function(){ document.body.style.overflow=""; document.body.removeChild(ov); };
  ov.querySelector("#mv-close").onclick = _cerrar;
  ov.querySelector("#mv-cancel").onclick = _cerrar;
  // Autocompletar local al escribir
  var mvLocal = ov.querySelector("#mv-local");
  mvLocal.addEventListener("input", function() {
    var q = this.value.trim().toUpperCase();
    if (q.length < 2) return;
    if (typeof pfBuscarCliente === "function") {
      var cli = pfBuscarCliente(q);
      if (cli && cli.nombre && cli.nombre !== q) {
        // no sobreescribir — solo sugerir
      }
    }
  });
  ov.querySelector("#mv-ok").onclick = function() {
    var local = (ov.querySelector("#mv-local").value || "").trim();
    var tipo  = ov.querySelector("#mv-tipo").value;
    var tec   = ov.querySelector("#mv-tec").value;
    var fecha = (ov.querySelector("#mv-fecha").value || "").trim();
    var nota  = (ov.querySelector("#mv-nota").value || "").trim();
    if (!local) { pfModal("El nombre del local es obligatorio."); return; }
    if (!fecha || !/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) { pfModal("Fecha inválida. Usa DD/MM/AAAA."); return; }
    if (typeof pfRegistrarVisitaEnFicha !== "function") { pfModal("Error: módulo de fichas no disponible."); return; }
    pfRegistrarVisitaEnFicha(local, {
      fecha:   fecha,
      hora:    new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}),
      tipo:    tipo,
      tecnico: tec,
      nota:    nota || "Visita registrada manualmente por Alejandro",
      punto:   "Manual"
    });
    _cerrar();
    pfModal("✅ Visita de " + tipo + " registrada para " + local + " (" + fecha + ")");
  };
}

// ════════════════════════════════════════════════════════════
//  F4 — NOTIFICACIONES PUSH (Web Push API)
// ════════════════════════════════════════════════════════════
// VAPID public key — para producción real necesitas generar tus propias claves VAPID
// Generar en: https://vapidkeys.com/ y poner la pública aquí
var PF_VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBB4o8CCbLQn7kz4mwmA";

function pfActualizarEstadoPush() {
  var el = document.getElementById("pf-push-status");
  var btn = document.getElementById("pf-push-btn");
  if (!el) return;
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    el.textContent = "Estado: no compatible con este navegador";
    if (btn) btn.style.display = "none";
    return;
  }
  var perm = Notification.permission;
  if (perm === "granted") {
    // Verificar si hay suscripción activa
    navigator.serviceWorker.ready.then(function(reg) {
      reg.pushManager.getSubscription().then(function(sub) {
        el.textContent = sub ? "Estado: ✅ Activas en este dispositivo" : "Estado: Permitidas pero no activas";
        if (btn) { btn.textContent = sub ? "🔕 Desactivar notificaciones" : "🔔 Activar notificaciones"; btn.style.background = sub ? "var(--g3)" : "var(--a)"; }
      });
    }).catch(function(){ el.textContent = "Estado: error al verificar"; });
  } else if (perm === "denied") {
    el.textContent = "Estado: ⛔ Bloqueadas — actívalas en ajustes del navegador";
    if (btn) { btn.textContent = "Abrir ajustes del navegador"; btn.style.background = "var(--g3)"; }
  } else {
    el.textContent = "Estado: sin configurar";
    if (btn) { btn.textContent = "🔔 Activar notificaciones"; btn.style.background = "var(--a)"; }
  }
}

function pfTogglePushNotif() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    pfModal("Tu navegador no soporta notificaciones push."); return;
  }
  if (Notification.permission === "denied") {
    pfModal("Las notificaciones están bloqueadas.\nVe a Ajustes → Privacidad → Notificaciones y actívalas para esta app.");
    return;
  }
  navigator.serviceWorker.ready.then(function(reg) {
    reg.pushManager.getSubscription().then(function(existingSub) {
      if (existingSub) {
        // Desactivar
        existingSub.unsubscribe().then(function() {
          pfModal("🔕 Notificaciones desactivadas en este dispositivo.");
          pfActualizarEstadoPush();
        });
      } else {
        // Activar — pedir permiso y suscribir
        Notification.requestPermission().then(function(perm) {
          if (perm !== "granted") { pfModal("Permiso denegado."); return; }
          // Convertir VAPID key a Uint8Array
          var key = PF_VAPID_PUBLIC_KEY;
          var raw = atob(key.replace(/-/g,"+").replace(/_/g,"/"));
          var buf = new Uint8Array(raw.length);
          for (var i=0;i<raw.length;i++) buf[i]=raw.charCodeAt(i);
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: buf
          }).then(function(sub) {
            // Guardar suscripción en localStorage (en producción mandarla al servidor)
            try { localStorage.setItem("pf_push_sub", JSON.stringify(sub.toJSON())); } catch(e){}
            pfModal("✅ Notificaciones activadas.\nRecibirás alertas de retiros urgentes y tareas.");
            pfActualizarEstadoPush();
          }).catch(function(e) {
            pfModal("Error al activar notificaciones: " + e.message + "\n\nNota: en GitHub Pages necesitas configurar VAPID keys propias.");
          });
        });
      }
    });
  });
}

// Función para enviar notificación local (sin servidor) — para pruebas
function pfEnviarNotifLocal(titulo, cuerpo, url) {
  if (Notification.permission !== "granted") return;
  navigator.serviceWorker.ready.then(function(reg) {
    reg.showNotification(titulo || "Previfuego Field", {
      body:    cuerpo || "",
      icon:    "/previfuego-backend/icon-192.png",
      tag:     "pf-local-" + Date.now(),
      data:    url || "/previfuego-backend/",
      vibrate: [200,100,200]
    });
  });
}

// Revisar alertas periódicamente y notificar si hay retiros urgentes
window.addEventListener("load", function() {
  // Solo si notificaciones activas
  if (Notification.permission !== "granted") return;
  setInterval(function() {
    try {
      var retiros = JSON.parse(localStorage.getItem("pf_retiros") || "[]");
      var urgentes = retiros.filter(function(r){
        if (r.estado !== "pendiente") return false;
        var p = (r.fecha||"").split("/");
        if (p.length < 3) return false;
        var d = new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
        return (Date.now() - d.getTime()) > 7*24*3600*1000;
      });
      if (urgentes.length > 0) {
        // Solo notificar una vez por día
        var hoy = new Date().toLocaleDateString("es-EC");
        var ultima = localStorage.getItem("pf_push_ultima_alerta");
        if (ultima !== hoy) {
          localStorage.setItem("pf_push_ultima_alerta", hoy);
          pfEnviarNotifLocal(
            "⚠️ Retiros urgentes — Previfuego",
            urgentes.length + " extintor(es) con más de 7 días sin entregar",
            "/previfuego-backend/"
          );
        }
      }
    } catch(e){}
  }, 3600000); // cada hora
});
