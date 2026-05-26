// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO FIELD — app.js  v3.0
//  Fase 2+3: Recorrido texto libre + Multiusuario base
// ═══════════════════════════════════════════════════════════

var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsGUa-Z31KwPkixPxM8tLgEoyj7HsYRmdic8-HCuE9ZLjBfCYSGPJKmNDT9jOITxlO/exec";
var VERSION    = "3.0";

// ── ACCESORIOS ──────────────────────────────────────────────
var ACCESORIOS = [
  {id:"abrazadera",      n:"Abrazadera plástica",       p:1.50},
  {id:"manometro",       n:"Manómetro PQS",              p:2.80},
  {id:"cabezal_pqs",     n:"Cabezal extintor PQS",       p:8.80},
  {id:"manguera_pqs",    n:"Manguera PQS",               p:4.80},
  {id:"corneta_co2_5",   n:"Corneta CO₂ 5 lbs",          p:8.80},
  {id:"corneta_co2_10",  n:"Corneta CO₂ 10 lbs",         p:0},
  {id:"manguera_co2_10", n:"Manguera CO₂ 10 lbs",        p:13.80},
  {id:"empaque",         n:"Empaque válvula",             p:1.50},
  {id:"soporte",         n:"Soporte metálico",            p:5.00},
  {id:"piton",           n:"Pitón",                       p:1.50},
  {id:"tubo_sifon",      n:"Tubo sifón",                  p:2.00},
  {id:"boquilla",        n:"Boquilla",                    p:1.00},
  {id:"valvula_pqs",     n:"Válvula PQS",                 p:3.00},
  {id:"pintura",         n:"Pintura sintética",            p:2.00},
  {id:"letrero",         n:"Letrero señalética",           p:3.50},
  {id:"soporte_pared",   n:"Soporte de pared",             p:5.00}
];

// ── USUARIOS ─────────────────────────────────────────────────
var USUARIOS = {
  raul:      { nombre:"Raúl Romero",   rol:"tecnico",  emoji:"👷" },
  juan:      { nombre:"Juan",          rol:"conductor", emoji:"🚗" },
  fabiola:   { nombre:"Fabiola",       rol:"admin",     emoji:"💼" },
  alejandro: { nombre:"Alejandro",     rol:"jefe",      emoji:"👔" }
};

// ── ESTADO GLOBAL ────────────────────────────────────────────
var USUARIO_ACTUAL = null;
var PUNTOS         = [];   // [{num, nombre, locales:[{id,nombre,mision,done}]}]
var PUNTO_ACTUAL   = null;
var LOCAL_ACTUAL   = null;
var FD   = {1:null, 2:null, 3:null};
var FB64 = {1:null, 2:null, 3:null};
var ACCS = [], NOV = null, FIRMADO = false, HISTORIAL = [];
var canvas, ctx, drawing = false, trazado = false;
var CERT_CONTADOR = parseInt(localStorage.getItem("pf_certCount") || "0");
var URLS_GENERADAS = [];
var TECNICO_NOMBRE = "Raúl Romero";

// ── NAVEGACIÓN ───────────────────────────────────────────────
function ir(id){
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("active"); });
  var el = document.getElementById(id);
  if(el){ el.classList.add("active"); window.scrollTo(0,0); }
}

// ── FECHA ────────────────────────────────────────────────────
function initFecha(){
  var d     = new Date();
  var dias  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  var meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  var el    = document.getElementById("s1f");
  if(el) el.textContent = dias[d.getDay()]+" "+d.getDate()+" "+meses[d.getMonth()];
}

function fechaHoy(){
  var d = new Date();
  return String(d.getDate()).padStart(2,"0")+"/"+
         String(d.getMonth()+1).padStart(2,"0")+"/"+
         d.getFullYear();
}

// ── LOGO ─────────────────────────────────────────────────────
function initLogos(){
  if(typeof LOGO_B64 === "undefined") return;
  var el = document.getElementById("lcd");
  if(el) el.setAttribute("data-b64", LOGO_B64);
  var src = "data:image/png;base64,"+LOGO_B64;
  document.querySelectorAll(".logo-img").forEach(function(img){ img.src = src; });
}

// ════════════════════════════════════════════════════════════
//  SELECCIÓN DE USUARIO
// ════════════════════════════════════════════════════════════
function seleccionarUsuario(key){
  USUARIO_ACTUAL = key;
  TECNICO_NOMBRE = USUARIOS[key].nombre;
  localStorage.setItem("pf_usuario", key);

  // Actualizar nombre en topbars
  document.querySelectorAll(".ts-nombre").forEach(function(el){
    el.textContent = TECNICO_NOMBRE;
  });
  document.querySelectorAll(".sperf-nom").forEach(function(el){
    el.textContent = TECNICO_NOMBRE;
  });

  if(key === "alejandro"){
    ir("sadmin");
    cargarRecorridoAdmin();
  } else {
    ir("s1");
    cargarRecorrido();
  }
}

// ════════════════════════════════════════════════════════════
//  PARSER DE TEXTO LIBRE DE RECORRIDO
// ════════════════════════════════════════════════════════════
function parsearRecorrido(texto){
  var lineas = texto.split("\n").map(function(l){ return l.trim(); }).filter(function(l){ return l.length > 0; });
  var puntos = [];
  var puntoActual = null;
  var localActual = null;
  var misionBuffer = [];
  var localIdCounter = 0;

  function guardarLocal(){
    if(localActual && puntoActual){
      localActual.mision = misionBuffer.join("\n").trim();
      puntoActual.locales.push(localActual);
      localActual  = null;
      misionBuffer = [];
    }
  }

  function guardarPunto(){
    guardarLocal();
    if(puntoActual && puntoActual.locales.length > 0){
      puntos.push(puntoActual);
    }
    puntoActual = null;
  }

  // Patrones
  var rePunto  = /^Punto\s+(\d+)\s*[–\-—]\s*(.+)$/i;
  var reMision = /^Misión\s*:/i;
  var reBullet = /^\*\s+.+/;

  for(var i = 0; i < lineas.length; i++){
    var l = lineas[i];

    // ¿Es un nuevo Punto N?
    var mPunto = l.match(rePunto);
    if(mPunto){
      guardarPunto();
      puntoActual = {
        num:    parseInt(mPunto[1]),
        nombre: mPunto[2].trim(),
        locales: []
      };
      // El nombre del punto también puede ser un local directo
      // (cuando no hay sub-locales después)
      localIdCounter++;
      localActual = {
        id:     localIdCounter,
        nombre: mPunto[2].trim(),
        mision: "",
        done:   false,
        ext:    []
      };
      misionBuffer = [];
      continue;
    }

    // ¿Es línea "Misión:"?
    if(reMision.test(l)){
      // El texto después de "Misión:" en la misma línea
      var resto = l.replace(/^Misión\s*:\s*/i, "").trim();
      if(resto) misionBuffer.push(resto);
      continue;
    }

    // ¿Es bullet de lista?
    if(reBullet.test(l)){
      misionBuffer.push(l);
      continue;
    }

    // ¿Es un sub-local dentro del punto?
    // Detectar si es un nombre de local — línea sin ":" al final,
    // no empieza con "*", no es un Punto, y hay un puntoActual activo
    // y la SIGUIENTE línea empieza con "Misión:"
    var sigLinea = (i+1 < lineas.length) ? lineas[i+1] : "";
    var esSubLocal = puntoActual &&
                     !reMision.test(l) &&
                     !reBullet.test(l) &&
                     !rePunto.test(l) &&
                     (reMision.test(sigLinea) || sigLinea === "");

    if(esSubLocal && localActual && localActual.nombre !== l){
      // Guardar local anterior y empezar nuevo
      guardarLocal();
      localIdCounter++;
      localActual = {
        id:     localIdCounter,
        nombre: l,
        mision: "",
        done:   false,
        ext:    []
      };
      misionBuffer = [];
      continue;
    }

    // Si hay misión activa, agregar línea al buffer
    if(misionBuffer.length > 0 || (localActual && l)){
      misionBuffer.push(l);
    }
  }

  guardarPunto();

  // Si un punto tiene 1 solo local con el mismo nombre → es local directo
  // No hace falta cambiar nada, ya queda bien

  return puntos;
}

// ════════════════════════════════════════════════════════════
//  PANTALLA ADMIN — ALEJANDRO
// ════════════════════════════════════════════════════════════
function cargarRecorridoAdmin(){
  var saved = localStorage.getItem("pf_recorrido_texto");
  if(saved){
    document.getElementById("admin-txt").value = saved;
    previsualizarRecorrido();
  }
}

function previsualizarRecorrido(){
  var txt    = document.getElementById("admin-txt").value.trim();
  var prev   = document.getElementById("admin-prev");
  if(!txt){ prev.innerHTML = '<div class="empty">Pega el recorrido arriba para previsualizarlo</div>'; return; }

  var puntos = parsearRecorrido(txt);
  if(puntos.length === 0){
    prev.innerHTML = '<div class="empty">No se detectaron puntos. Verifica el formato.</div>';
    return;
  }

  var h = '<div class="slbl">'+puntos.length+' punto(s) detectado(s)</div>';
  for(var i = 0; i < puntos.length; i++){
    var p = puntos[i];
    h += '<div class="cd" style="margin-bottom:8px">';
    h += '<div style="padding:12px 14px;background:var(--r);border-radius:12px 12px 0 0">';
    h += '<div style="font-size:13px;font-weight:700;color:#fff">📍 Punto '+p.num+' — '+p.nombre+'</div>';
    h += '<div style="font-size:11px;color:rgba(255,255,255,.75);margin-top:2px">'+p.locales.length+' local(es)</div>';
    h += '</div>';
    for(var j = 0; j < p.locales.length; j++){
      var loc = p.locales[j];
      h += '<div style="padding:10px 14px;border-bottom:1px solid var(--bo)">';
      h += '<div style="font-size:14px;font-weight:700;color:var(--ng)">'+loc.nombre+'</div>';
      if(loc.mision){
        h += '<div style="font-size:12px;color:var(--g4);margin-top:4px;line-height:1.5;white-space:pre-wrap">'+loc.mision+'</div>';
      }
      h += '</div>';
    }
    h += '</div>';
  }
  prev.innerHTML = h;
}

function publicarRecorrido(){
  var txt = document.getElementById("admin-txt").value.trim();
  if(!txt){ alert("Escribe o pega el recorrido primero."); return; }

  var puntos = parsearRecorrido(txt);
  if(puntos.length === 0){ alert("No se detectaron puntos. Verifica el formato."); return; }

  mostrarCargando(true, "Publicando recorrido...", "Guardando en el servidor");

  // Guardar localmente
  localStorage.setItem("pf_recorrido_texto", txt);
  localStorage.setItem("pf_recorrido_fecha", fechaHoy());
  localStorage.setItem("pf_recorrido_data",  JSON.stringify(puntos));

  // Enviar al Script
  var payload = {
    accion:   "publicar_recorrido",
    fecha:    fechaHoy(),
    tecnico:  "Raúl Romero",
    texto:    txt,
    puntos:   puntos
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body:   JSON.stringify(payload)
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    mostrarCargando(false);
    document.getElementById("admin-pub-ok").style.display = "block";
    setTimeout(function(){ document.getElementById("admin-pub-ok").style.display = "none"; }, 3000);
  })
  .catch(function(){
    mostrarCargando(false);
    // Aunque falle el servidor, quedó guardado localmente
    document.getElementById("admin-pub-ok").style.display = "block";
    setTimeout(function(){ document.getElementById("admin-pub-ok").style.display = "none"; }, 3000);
  });
}

function limpiarRecorrido(){
  if(!confirm("¿Borrar el recorrido actual?")) return;
  document.getElementById("admin-txt").value = "";
  document.getElementById("admin-prev").innerHTML = '<div class="empty">Pega el recorrido arriba para previsualizarlo</div>';
  localStorage.removeItem("pf_recorrido_texto");
  localStorage.removeItem("pf_recorrido_data");
}

// ════════════════════════════════════════════════════════════
//  CARGA DE RECORRIDO — RAÚL / JUAN / FABIOLA
// ════════════════════════════════════════════════════════════
function cargarRecorrido(){
  mostrarCargando(true, "Cargando recorrido...", "Conectando con el servidor");

  // Intentar servidor primero
  var url = SCRIPT_URL + "?accion=recorrido_texto&fecha=" + encodeURIComponent(fechaHoy());

  fetch(url)
    .then(function(r){
      if(!r.ok) throw new Error("HTTP "+r.status);
      return r.json();
    })
    .then(function(data){
      mostrarCargando(false);
      if(data.ok && data.texto){
        var puntos = parsearRecorrido(data.texto);
        if(puntos.length > 0){
          procesarPuntos(puntos, data.tecnico || "Raúl Romero");
          return;
        }
      }
      // Fallback a localStorage
      cargarRecorridoLocal();
    })
    .catch(function(){
      mostrarCargando(false);
      cargarRecorridoLocal();
    });
}

function cargarRecorridoLocal(){
  var fecha  = localStorage.getItem("pf_recorrido_fecha");
  var data   = localStorage.getItem("pf_recorrido_data");
  if(data && fecha === fechaHoy()){
    try{
      var puntos = JSON.parse(data);
      procesarPuntos(puntos, "Raúl Romero");
      return;
    }catch(e){}
  }
  mostrarSinRecorrido();
}

function procesarPuntos(puntos, tecnico){
  PUNTOS = puntos;
  TECNICO_NOMBRE = tecnico || "Raúl Romero";
  document.querySelectorAll(".ts-nombre").forEach(function(el){ el.textContent = TECNICO_NOMBRE; });
  renderPuntos();
}

// ── RENDER PUNTOS ────────────────────────────────────────────
function renderPuntos(){
  var lista = document.getElementById("s1list");
  if(!lista) return;

  // Contar locales totales y completados
  var total = 0, comp = 0;
  for(var i = 0; i < PUNTOS.length; i++){
    for(var j = 0; j < PUNTOS[i].locales.length; j++){
      total++;
      if(PUNTOS[i].locales[j].done) comp++;
    }
  }

  var s1p  = document.getElementById("s1p");
  var s1pf = document.getElementById("s1pf");
  if(s1p)  s1p.textContent      = comp+"/"+total+" misiones";
  if(s1pf) s1pf.style.width     = total > 0 ? (comp/total*100)+"%" : "0%";

  if(PUNTOS.length === 0){ mostrarSinRecorrido(); return; }

  var h = "";
  for(var i = 0; i < PUNTOS.length; i++){
    var p = PUNTOS[i];

    // Header del punto
    h += '<div class="slbl">📍 Punto '+p.num+' — '+p.nombre+'</div>';

    // Locales del punto
    for(var j = 0; j < p.locales.length; j++){
      var loc = p.locales[j];
      var done = loc.done;
      h += '<div class="cd'+(done?" dn":"")+'" onclick="abrirLocal('+i+','+j+')">';
      h += '<div class="pr">';
      h += '<div class="pn">'+(done?"✓":(comp+1))+"</div>";
      h += '<div class="pi">';
      h += '<div class="pnm">'+loc.nombre+'</div>';
      h += '<div class="psb">'+(done?"Completado ✓":"Pendiente")+'</div>';
      h += '</div>';
      h += '<div class="pch">'+(done?"✓":"›")+'</div>';
      h += '</div>';
      if(loc.mision){
        h += '<div style="padding:0 14px 10px;font-size:12px;color:var(--g4);line-height:1.5;white-space:pre-wrap">'+loc.mision+'</div>';
      }
      h += '</div>';
    }
  }
  lista.innerHTML = h;
}

function mostrarSinRecorrido(){
  var lista = document.getElementById("s1list");
  if(!lista) return;
  lista.innerHTML = '<div style="margin:16px;padding:24px;background:#fff;border-radius:14px;border:1.5px dashed var(--bo);text-align:center;color:var(--g4);font-size:14px;line-height:1.8">📋 No hay recorrido publicado para hoy.<br>Alejandro debe publicar el recorrido.<br><br><button type="button" class="btn btn-g" style="font-size:13px;padding:10px 16px;width:auto" onclick="cargarRecorrido()">🔄 Reintentar</button></div>';
  var s1p  = document.getElementById("s1p");
  var s1pf = document.getElementById("s1pf");
  if(s1p)  s1p.textContent  = "0/0 misiones";
  if(s1pf) s1pf.style.width = "0%";
}

// ════════════════════════════════════════════════════════════
//  ABRIR LOCAL — PANTALLA DE MISIÓN
// ════════════════════════════════════════════════════════════
function abrirLocal(pi, li){
  var p   = PUNTOS[pi];
  var loc = p.locales[li];
  PUNTO_ACTUAL = p;
  LOCAL_ACTUAL = loc;
  LOCAL_ACTUAL._pi = pi;
  LOCAL_ACTUAL._li = li;

  // Reset estado
  FD   = {1:null, 2:null, 3:null};
  FB64 = {1:null, 2:null, 3:null};
  ACCS = []; NOV = null; FIRMADO = false;
  resetFotosUI();
  borrarFirma();
  document.getElementById("btn-nov").className      = "nb";
  document.getElementById("btn-ok").className       = "nb";
  document.getElementById("acc-sec").style.display  = "none";
  document.getElementById("acc-lista").innerHTML    = "";
  document.getElementById("acc-tot").textContent    = "$0.00";

  // Llenar UI
  document.getElementById("s2t").textContent     = loc.nombre;
  document.getElementById("s2s").textContent     = "Punto "+p.num+" · "+p.nombre;
  document.getElementById("s2c").textContent     = p.nombre;
  document.getElementById("s2n").textContent     = loc.nombre;
  document.getElementById("s2-badge").textContent = loc.done ? "Completado" : "Pendiente";
  document.getElementById("s2m").textContent     = loc.mision || "Sin misión especificada.";

  var now = new Date();
  document.getElementById("s2e").textContent =
    now.toLocaleDateString("es-EC",{day:"numeric",month:"long",year:"numeric"});

  // Extintores del local (si existen en el Sheet)
  var extSec = document.getElementById("s2es");
  var extDiv = document.getElementById("s2el");
  if(loc.ext && loc.ext.length > 0){
    extSec.style.display = "block";
    var eh = '<div class="ext-h">'+loc.ext.length+' extintor'+(loc.ext.length>1?"es":"")+'</div>';
    for(var i = 0; i < loc.ext.length; i++){
      var e = loc.ext[i];
      eh += '<div class="erow"><span class="eloc">'+(e.l||e.ubicacion||"")+'</span><span class="etip">'+(e.t||e.tipo||"")+'</span><span class="ew">'+(e.w||e.capacidad||"")+'</span><div class="eck" id="eck_'+pi+'_'+li+'_'+i+'" onclick="toggleExt('+pi+','+li+','+i+')"></div></div>';
    }
    extDiv.innerHTML = eh;
  } else {
    extSec.style.display = "none";
  }

  document.getElementById("sfott").textContent = loc.nombre;
  document.getElementById("sfirt").textContent = loc.nombre;
  ir("s2");
}

function toggleExt(pi, li, idx){
  var el = document.getElementById("eck_"+pi+"_"+li+"_"+idx);
  if(!el) return;
  el.classList.toggle("ok");
  el.textContent = el.classList.contains("ok") ? "✓" : "";
}

function confirmarSin(){
  if(!LOCAL_ACTUAL) return;
  if(confirm("¿Marcar «"+LOCAL_ACTUAL.nombre+"» como completado sin certificado?")){
    PUNTOS[LOCAL_ACTUAL._pi].locales[LOCAL_ACTUAL._li].done = true;
    localStorage.setItem("pf_recorrido_data", JSON.stringify(PUNTOS));
    renderPuntos();
    ir("s1");
  }
}

// ════════════════════════════════════════════════════════════
//  FOTOS
// ════════════════════════════════════════════════════════════
function resetFotosUI(){
  for(var n = 1; n <= 3; n++){
    if(FD[n]){ try{ URL.revokeObjectURL(FD[n]); }catch(ex){} FD[n]=null; }
    FB64[n] = null;
  }
  var slots = ["fs1","fs2f","fs3f"];
  for(var n = 1; n <= 3; n++){
    var slotEl = document.getElementById(slots[n-1]);
    if(slotEl) slotEl.className = "fs2"+(n===3?"":" fpend");
    var fnEl = document.getElementById("fn"+n);
    if(fnEl){ fnEl.className="fnum "+(n===3?"fngr":"fnpnd"); fnEl.textContent=n; }
    var fbEl = document.getElementById("fb"+n);
    if(fbEl){ fbEl.className="fbg "+(n===3?"fbop":"fbpd"); fbEl.textContent=n===3?"Opcional":"Pendiente"; }
    var prev = document.getElementById("fp"+n);
    if(prev){
      prev.className = "fprev";
      var imgs = prev.querySelectorAll("img");
      for(var j=0;j<imgs.length;j++) imgs[j].remove();
    }
    var fpc = document.getElementById("fpc"+n);
    if(fpc) fpc.style.display = "";
    var fi = document.getElementById("fi"+n);
    if(fi) fi.value = "";
  }
  actualizarFotos();
}

function abrirCam(n){
  var inp = document.getElementById("fi"+n);
  if(!inp) return;
  inp.setAttribute("capture","environment");
  inp.click();
}

function abrirGal(n){
  var inp = document.getElementById("fi"+n);
  if(!inp) return;
  inp.removeAttribute("capture");
  inp.click();
}

function fotoOk(n, input){
  if(!input.files || !input.files[0]) return;
  var file = input.files[0];
  var url  = URL.createObjectURL(file);
  FD[n]    = url;

  var slots = ["fs1","fs2f","fs3f"];
  var slotEl = document.getElementById(slots[n-1]);
  if(slotEl) slotEl.className = "fs2 fok";
  var fnEl = document.getElementById("fn"+n);
  if(fnEl){ fnEl.className="fnum fnok"; fnEl.textContent="✓"; }
  var fbEl = document.getElementById("fb"+n);
  if(fbEl){ fbEl.className="fbg fbok"; fbEl.textContent="Lista"; }
  var prev = document.getElementById("fp"+n);
  if(prev){
    prev.className = "fprev has";
    var fpc = document.getElementById("fpc"+n);
    if(fpc) fpc.style.display = "none";
    var imgEl = document.createElement("img");
    imgEl.src = url;
    prev.insertBefore(imgEl, prev.firstChild);
  }

  // Comprimir en background
  var img = new Image();
  img.onload = function(){
    var cvs = document.createElement("canvas");
    var MAX = 900, w = img.width, h = img.height;
    if(w > MAX){ h = Math.round(h*MAX/w); w = MAX; }
    if(h > MAX){ w = Math.round(w*MAX/h); h = MAX; }
    cvs.width = w; cvs.height = h;
    cvs.getContext("2d").drawImage(img, 0, 0, w, h);
    FB64[n] = cvs.toDataURL("image/jpeg", 0.65);
  };
  img.src = url;
  actualizarFotos();
}

function actualizarFotos(){
  var c = 0;
  for(var n=1;n<=3;n++){ if(FD[n]) c++; }
  var sfc  = document.getElementById("sfc");
  var sfpf = document.getElementById("sfpf");
  if(sfc)  sfc.textContent   = c+"/3";
  if(sfpf) sfpf.style.width  = (c/3*100)+"%";
}

function irFirma(){
  var c = 0;
  for(var n=1;n<=3;n++){ if(FD[n]) c++; }
  if(c===0){ alert("Necesitas al menos 1 foto para continuar."); return; }
  // Re-init canvas por si estaba oculto
  reinitCanvas();
  ir("sfir");
}

// ════════════════════════════════════════════════════════════
//  FIRMA
// ════════════════════════════════════════════════════════════
function initFirma(){
  canvas = document.getElementById("cnv");
  if(!canvas) return;
  reinitCanvas();
}

function reinitCanvas(){
  canvas = document.getElementById("cnv");
  if(!canvas) return;
  // Forzar ancho visible
  var w = canvas.parentElement ? canvas.parentElement.offsetWidth : 336;
  canvas.width  = w || 336;
  canvas.height = 130;
  ctx = canvas.getContext("2d");
  ctx.strokeStyle = "#1C1C1A";
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
}

function gp(e){
  var r  = canvas.getBoundingClientRect();
  var sx = canvas.width/r.width, sy = canvas.height/r.height;
  if(e.touches) return {x:(e.touches[0].clientX-r.left)*sx, y:(e.touches[0].clientY-r.top)*sy};
  return {x:(e.clientX-r.left)*sx, y:(e.clientY-r.top)*sy};
}

function setupCanvasEvents(){
  canvas.addEventListener("mousedown",  function(e){e.preventDefault();drawing=true;var p=gp(e);ctx.beginPath();ctx.moveTo(p.x,p.y);});
  canvas.addEventListener("mousemove",  function(e){e.preventDefault();if(!drawing)return;trazado=true;var p=gp(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
  canvas.addEventListener("mouseup",    function(){drawing=false;if(trazado)marcarFirmado();});
  canvas.addEventListener("mouseleave", function(){drawing=false;});
  canvas.addEventListener("touchstart", function(e){e.preventDefault();drawing=true;var p=gp(e);ctx.beginPath();ctx.moveTo(p.x,p.y);},{passive:false});
  canvas.addEventListener("touchmove",  function(e){e.preventDefault();if(!drawing)return;trazado=true;var p=gp(e);ctx.lineTo(p.x,p.y);ctx.stroke();},{passive:false});
  canvas.addEventListener("touchend",   function(){drawing=false;if(trazado)marcarFirmado();});
}

function marcarFirmado(){
  var fpw  = document.getElementById("fpw");
  var fsub = document.getElementById("fsub");
  if(fpw)  fpw.classList.add("sig");
  if(fsub) fsub.textContent = "Firma registrada ✓";
  FIRMADO = true;
}

function borrarFirma(){
  if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  trazado = false; FIRMADO = false;
  var fpw  = document.getElementById("fpw");
  var fsub = document.getElementById("fsub");
  if(fpw)  fpw.classList.remove("sig");
  if(fsub) fsub.textContent = "Dibuja la firma con el dedo";
}

// ════════════════════════════════════════════════════════════
//  NOVEDADES Y ACCESORIOS
// ════════════════════════════════════════════════════════════
function selNov(v){
  NOV = v;
  document.getElementById("btn-nov").className = "nb"+(v==="si"?" sn":"");
  document.getElementById("btn-ok").className  = "nb"+(v==="no"?" so":"");
  document.getElementById("acc-sec").style.display = v==="si"?"block":"none";
}

function renderAccSel(){
  var h = "";
  for(var i=0;i<ACCESORIOS.length;i++){
    var a = ACCESORIOS[i];
    var pid = a.id.replace(/'/g,"");
    h += '<div class="asi" onclick="addAcc(\''+pid+'\')"><div class="asn">'+a.n+'</div><div class="asp">$'+a.p.toFixed(2)+'</div></div>';
  }
  var el = document.getElementById("asel-list");
  if(el) el.innerHTML = h;
}

function abrirSel(){
  document.getElementById("asel").classList.add("open");
  document.getElementById("ov").classList.add("show");
}

function cerrarSel(){
  document.getElementById("asel").classList.remove("open");
  document.getElementById("ov").classList.remove("show");
}

function addAcc(id){
  var found = null;
  for(var i=0;i<ACCESORIOS.length;i++){
    if(ACCESORIOS[i].id===id){ found=ACCESORIOS[i]; break; }
  }
  if(!found) return;
  var uid = "a"+Date.now()+"r"+Math.floor(Math.random()*9999);
  ACCS.push({id:found.id, n:found.n, p:found.p, uid:uid});
  renderAccList();
  cerrarSel();
}

function rmAcc(uid){
  ACCS = ACCS.filter(function(a){ return a.uid!==uid; });
  renderAccList();
}

function renderAccList(){
  var h="", tot=0;
  for(var i=0;i<ACCS.length;i++){
    var a=ACCS[i]; tot+=a.p;
    h+='<div class="ait"><span class="anm">'+a.n+'</span><span class="apr">$'+a.p.toFixed(2)+'</span><span class="arm" onclick="rmAcc(\''+a.uid+'\')">✕</span></div>';
  }
  document.getElementById("acc-lista").innerHTML = h;
  document.getElementById("acc-tot").textContent = "$"+tot.toFixed(2);
}

// ════════════════════════════════════════════════════════════
//  GENERADOR PDF
// ════════════════════════════════════════════════════════════
function generarPDF(){
  if(NOV===null){ alert("Indica si hay novedades antes de continuar."); return; }
  if(NOV==="si"&&ACCS.length===0){ alert("Seleccionaste accesorios dañados pero no agregaste ninguno."); return; }
  var fc=0;
  for(var n=1;n<=3;n++){ if(FB64[n]) fc++; }
  if(fc===0){ alert("Necesitas al menos 1 foto para generar el certificado."); return; }

  mostrarCargando(true,"Generando certificado...","Por favor espera");

  // Esperar que todas las fotos terminen de comprimir
  var intentos = 0;
  function esperarFotos(){
    var listas = 0;
    for(var n=1;n<=3;n++){ if(FD[n]&&FB64[n]) listas++; else if(!FD[n]) listas++; }
    if(listas>=3 || intentos>20){ cargarJsPDF(fc); }
    else { intentos++; setTimeout(esperarFotos, 150); }
  }
  setTimeout(esperarFotos, 200);
}

function cargarJsPDF(fc){
  if(window.jspdf && window.jspdf.jsPDF){
    hacerPDF(fc);
  } else {
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload  = function(){ hacerPDF(fc); };
    s.onerror = function(){
      mostrarCargando(false);
      alert("Error cargando el generador de PDF. Verifica tu conexión a internet.");
    };
    document.head.appendChild(s);
  }
}

function hacerPDF(fc){
  try{
    var J   = window.jspdf.jsPDF;
    var doc = new J({orientation:"portrait",unit:"mm",format:"a4"});
    var PW=210,PH=297,ML=15,CW=180;
    var R=[158,18,18],NG=[26,24,28],GR=[88,86,90],BG=[246,246,246];

    function fR(){ doc.setFillColor(R[0],R[1],R[2]); }
    function fN(){ doc.setFillColor(NG[0],NG[1],NG[2]); }
    function fBG(){ doc.setFillColor(BG[0],BG[1],BG[2]); }
    function tR(){ doc.setTextColor(R[0],R[1],R[2]); }
    function tN(){ doc.setTextColor(NG[0],NG[1],NG[2]); }
    function tG(){ doc.setTextColor(GR[0],GR[1],GR[2]); }
    function tW(){ doc.setTextColor(255,255,255); }
    function dR(){ doc.setDrawColor(R[0],R[1],R[2]); }
    function dL(){ doc.setDrawColor(200,198,196); }

    var now = new Date();
    var MES = String(now.getMonth()+1).padStart(2,"0");
    var ANO = now.getFullYear();
    var MA  = MES+"/"+ANO, MAS = MES+"/"+(ANO+1);

    CERT_CONTADOR++;
    localStorage.setItem("pf_certCount", CERT_CONTADOR);
    var nomBase = LOCAL_ACTUAL.nombre.substring(0,8).toUpperCase().replace(/[^A-Z0-9]/g,"");
    var CERT_NUM = "CERT-"+nomBase+"-"+ANO+"-"+String(CERT_CONTADOR).padStart(3,"0");

    function fondoBase(){
      doc.setFillColor(255,255,255); doc.rect(0,0,PW,PH,"F");
      fR(); doc.rect(0,0,4,PH,"F");
      fR(); doc.rect(0,0,PW,7,"F");
    }

    function piePagina(){
      fN(); doc.rect(0,PH-10,PW,10,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(6.8); tW();
      doc.text("DIR: PORTETE #3007 Y GALLEGOS LARA  |  TEL: 04-2374822 · 0978997247 · 09835883325  |  EMAIL: ventas_previfuego@hotmail.com",PW/2,PH-3.8,{align:"center"});
    }

    function bloqueAutorizacion(yy){
      if(yy > PH-50){ return yy; } // no cabe — skip
      dR(); doc.setLineWidth(0.5); doc.line(ML,yy,ML+CW,yy); yy+=5;
      doc.setFillColor(253,251,251);
      dR(); doc.setLineWidth(0.3); doc.rect(ML,yy,CW,30,"FD");
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); tR();
      doc.text("AUTORIZADO POR:",ML+5,yy+7);
      doc.setFont("helvetica","bold"); doc.setFontSize(12); tN();
      doc.text("Alejandro Lopez",ML+5,yy+15);
      doc.setFont("helvetica","normal"); doc.setFontSize(9); tG();
      doc.text("Jefe de Operaciones  —  Previfuego / Pyroshield",ML+5,yy+22);
      doc.text("RUC: 0952773976001",ML+5,yy+28);
      return yy+36;
    }

    // ── PÁG 1 ──
    fondoBase();
    var y=9;
    var lcdEl = document.getElementById("lcd");
    var b64   = lcdEl ? lcdEl.getAttribute("data-b64") : "";
    if(b64){ try{ doc.addImage("data:image/png;base64,"+b64,"PNG",ML,y,24,24); }catch(e){} }

    doc.setFont("helvetica","bold"); doc.setFontSize(7); tR();
    doc.text(CERT_NUM,PW-5,12,{align:"right"});

    var HX=ML+28, HW=PW-5-HX;
    doc.setFont("helvetica","bold"); doc.setFontSize(22); tR();
    var pW=doc.getTextWidth("PREVIFUEGO");
    doc.text("PREVIFUEGO",HX+(HW-pW)/2,y+9);
    dR(); doc.setLineWidth(0.5);
    doc.line(HX+(HW-pW)/2,y+11,HX+(HW-pW)/2+pW,y+11);
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tN();
    var sW=doc.getTextWidth("SEGURIDAD INDUSTRIAL Y CONTRA INCENDIOS");
    doc.text("SEGURIDAD INDUSTRIAL Y CONTRA INCENDIOS",HX+(HW-sW)/2,y+16);
    doc.setFont("helvetica","normal"); doc.setFontSize(6.2); tG();
    var iL=[
      "RUC.: 0952773976001  |  ASESORAMIENTO · RECARGA · MANTENIMIENTO · VENTAS",
      "PQS (ABC) · GAS CARBONICO · HALOTRON",
      "DISEÑO E INSTALACIÓN DE RED HIDRÁULICA CONTRA INCENDIOS",
      "SISTEMAS DE CO2 PARA COCINAS, GENERADORES, TRANSFORMADORES, ETC",
      "INSTALACIÓN DE LÁMPARAS DE EMERGENCIA Y DETECTORES DE HUMO"
    ];
    for(var i=0;i<iL.length;i++){
      var lw=doc.getTextWidth(iL[i]);
      doc.text(iL[i],HX+(HW-lw)/2,y+20+i*3.4);
    }

    y=48;
    dR(); doc.setLineWidth(0.9); doc.line(ML,y,PW-ML,y);
    dL(); doc.setLineWidth(0.3); doc.line(ML,y+1.8,PW-ML,y+1.8);
    y+=8;

    doc.setFont("helvetica","bold"); doc.setFontSize(13); tN();
    var tits=["CERTIFICADO DE INSPECCIÓN Y MANTENIMIENTO DE","EXTINTORES PORTÁTILES"];
    for(var i=0;i<tits.length;i++){
      var tw=doc.getTextWidth(tits[i]);
      var tx=ML+(CW-tw)/2;
      doc.text(tits[i],tx,y);
      dR(); doc.setLineWidth(0.35); doc.line(tx,y+1.2,tx+tw,y+1.2);
      y+=7.5;
    }
    y+=4;

    doc.setFillColor(247,247,247);
    dL(); doc.setLineWidth(0.4); doc.rect(ML,y-3,CW,7.5,"FD");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); tG();
    doc.text("MEDIANTE EL PRESENTE, SE GARANTIZA EL TRABAJO REALIZADO BAJO EL SIGUIENTE DETALLE:",ML+3,y+1.5);
    y+=11;

    var localNom = LOCAL_ACTUAL.nombre.toUpperCase();
    var puntNom  = PUNTO_ACTUAL ? PUNTO_ACTUAL.nombre.toUpperCase() : localNom;
    var ptxt = "INSPECCIÓN Y MANTENIMIENTO DE EXTINTORES PORTÁTILES UBICADOS EN LOS DISTINTOS PUNTOS ESTRATÉGICOS DEL LOCAL «"+localNom+"» UBICADO EN "+puntNom+", SIGUIENDO LAS NORMAS NFPA10.";
    doc.setFont("helvetica","normal"); doc.setFontSize(9); tN();
    var ptxtL=doc.splitTextToSize(ptxt,CW);
    for(var i=0;i<ptxtL.length;i++){ doc.text(ptxtL[i],ML,y); y+=4.8; }
    y+=5;

    fR(); doc.rect(ML,y-3.5,CW,7.5,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(9.5); tW();
    doc.text("COMPRENDE:",ML+4,y+0.8);
    y+=7;

    doc.setFont("helvetica","normal"); doc.setFontSize(9); tN();
    var items=["REVISION INTEGRAL DE LOS CILINDROS","INSPECCIÓN DE CABEZALES","INSPECCIÓN DE CORNETAS / MANGUERAS","PESAJE / TARA","MANTENIMIENTO PREVENTIVO-CORRECTIVO","RECARGA DEL AGENTE"];
    for(var i=0;i<items.length;i++){
      fR(); doc.rect(ML+3,y-2.2,2.2,2.2,"F");
      tN(); doc.text(items[i],ML+8,y);
      y+=5.5;
    }
    y+=5;

    // Tabla extintores — solo si hay extintores del Sheet
    var exts = (LOCAL_ACTUAL.ext && LOCAL_ACTUAL.ext.length > 0) ? LOCAL_ACTUAL.ext : [];
    if(exts.length > 0){
      var gmap={};
      for(var i=0;i<exts.length;i++){
        var e=exts[i];
        var cap=(e.w||e.capacidad||"").toUpperCase();
        var tip=(e.t||e.tipo||"").toUpperCase();
        var k=cap+"|"+tip;
        if(!gmap[k]) gmap[k]={cnt:0,cap:cap,tip:tip};
        gmap[k].cnt++;
      }
      var grps=[];
      for(var k in gmap) grps.push(gmap[k]);

      var cws=[18,36,28,50,48],cxs=[ML];
      for(var i=1;i<cws.length;i++) cxs.push(cxs[i-1]+cws[i-1]);
      var rH=9,tRows=grps.length;

      fN(); doc.rect(ML,y,CW,rH,"F");
      doc.setDrawColor(60,58,62); doc.setLineWidth(0.2);
      var vx=ML;
      for(var i=0;i<cws.length;i++){ vx+=cws[i]; if(vx<ML+CW) doc.line(vx,y,vx,y+rH); }
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tW();
      var heads=["CANT.","CAPACIDAD","TIPO","ÚLTIMO MANT.","PRÓXIMO MANT."];
      for(var i=0;i<heads.length;i++){
        doc.text(heads[i],cxs[i]+cws[i]/2,y+rH-2.8,{align:"center",maxWidth:cws[i]-2});
      }
      y+=rH;

      for(var r=0;r<tRows;r++){
        var ry=y+r*rH;
        if(r%2===0){ doc.setFillColor(255,255,255); }else{ fBG(); }
        doc.rect(ML,ry,CW,rH,"F");
        dL(); doc.setLineWidth(0.2); doc.line(ML,ry+rH,ML+CW,ry+rH);
        var vx2=ML;
        for(var i=0;i<cws.length;i++){ vx2+=cws[i]; if(vx2<ML+CW) doc.line(vx2,ry,vx2,ry+rH); }
        var g=grps[r];
        doc.setFont("helvetica","bold"); doc.setFontSize(10); tN();
        doc.text(String(g.cnt),cxs[0]+cws[0]/2,ry+rH-2.8,{align:"center"});
        doc.text(g.cap,cxs[1]+cws[1]/2,ry+rH-2.8,{align:"center"});
        tR(); doc.text(g.tip,cxs[2]+cws[2]/2,ry+rH-2.8,{align:"center"});
        tN();
        doc.text(MA,cxs[3]+cws[3]/2,ry+rH-2.8,{align:"center"});
        doc.text(MAS,cxs[4]+cws[4]/2,ry+rH-2.8,{align:"center"});
      }
      var tablaYi=y-rH; y+=tRows*rH;
      dR(); doc.setLineWidth(0.5); doc.rect(ML,tablaYi,CW,rH*(tRows+1),"S");
      y+=8;
    }

    doc.setFont("helvetica","normal"); doc.setFontSize(8.8); tN();
    var gar="Los extintores detallados se encuentran operativos de acuerdo con la norma NFPA10 y normativa ecuatoriana vigente. Cada extintor cuenta con sus respectivos precintos y seguros metálicos, etiqueta de control de carga, accesorios en buen estado y agente extintor en óptimas condiciones, garantizando su funcionamiento con vigencia de un (1) año a partir de su último mantenimiento.";
    var garL=doc.splitTextToSize(gar,CW);
    for(var i=0;i<garL.length;i++){ doc.text(garL[i],ML,y); y+=4.6; }
    y+=6;
    bloqueAutorizacion(y);
    piePagina();

    // ── PÁG 2 ──
    doc.addPage();
    fondoBase();
    var evTit="EVIDENCIA FOTOGRÁFICA — "+LOCAL_ACTUAL.nombre.toUpperCase().substring(0,30);
    var evW=doc.getTextWidth(evTit);
    doc.setFont("helvetica","bold"); doc.setFontSize(11); tN();
    doc.text(evTit,PW/2,17,{align:"center"});
    var lineLen=(CW-evW-10)/2;
    dR(); doc.setLineWidth(0.9);
    doc.line(ML,19,ML+lineLen,19);
    doc.line(PW-ML-lineLen,19,PW-ML,19);
    dL(); doc.setLineWidth(0.3); doc.line(ML,20.5,PW-ML,20.5);

    var p2y=25;
    var fotosArr=[FB64[1],FB64[2],FB64[3]];
    var fv=[],etiqU=[];
    var etiq=["ANTES","DESPUÉS","CILINDRO CO₂"];
    for(var i=0;i<fotosArr.length;i++){
      if(fotosArr[i]){ fv.push(fotosArr[i]); etiqU.push(etiq[i]); }
    }
    if(fv.length>0){
      var maxFW=fv.length===1?100:CW;
      var fw=(maxFW-(fv.length-1)*5)/fv.length;
      var fh=fw*0.75;
      var totalW=fv.length*fw+(fv.length-1)*5;
      var fStartX=ML+(CW-totalW)/2;
      for(var i=0;i<fv.length;i++){
        try{
          var fx=fStartX+i*(fw+5);
          doc.setFillColor(200,200,200); doc.rect(fx+1.5,p2y+1.5,fw,fh,"F");
          fR(); doc.rect(fx-1,p2y-1,fw+2,fh+2,"F");
          doc.addImage(fv[i],"JPEG",fx,p2y,fw,fh);
          fR(); doc.rect(fx,p2y+fh-7,fw,7,"F");
          doc.setFont("helvetica","bold"); doc.setFontSize(7); tW();
          doc.text(etiqU[i]||"",fx+fw/2,p2y+fh-2.5,{align:"center"});
        }catch(e){}
      }
      p2y+=fh+8;
    }

    if(FIRMADO&&canvas){
      try{
        var sigData=canvas.toDataURL("image/png");
        dR(); doc.setLineWidth(0.5); doc.line(ML,p2y,ML+CW,p2y); p2y+=6;
        doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tR();
        doc.text("FIRMA DEL ENCARGADO:",ML,p2y); p2y+=5;
        doc.setFillColor(251,251,251);
        dR(); doc.setLineWidth(0.5); doc.rect(ML,p2y,82,26,"FD");
        doc.addImage(sigData,"PNG",ML+1,p2y+1,80,24);
        p2y+=28;
        doc.setFont("helvetica","normal"); doc.setFontSize(9.5); tN();
        doc.text("Encargado del local — "+LOCAL_ACTUAL.nombre,ML,p2y);
        p2y+=8;
      }catch(e){ p2y+=5; }
    }

    if(ACCS.length>0){
      dR(); doc.setLineWidth(0.5); doc.line(ML,p2y,ML+CW,p2y); p2y+=6;
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tR();
      doc.text("ACCESORIOS UTILIZADOS:",ML,p2y); p2y+=6;
      fN(); doc.rect(ML,p2y,CW,7.5,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tW();
      doc.text("DESCRIPCIÓN DEL ACCESORIO",ML+5,p2y+5);
      p2y+=7.5;
      for(var i=0;i<ACCS.length;i++){
        var ac=ACCS[i];
        if(i%2===0){ doc.setFillColor(255,255,255); }else{ fBG(); }
        doc.rect(ML,p2y,CW,7,"F");
        dL(); doc.setLineWidth(0.2); doc.line(ML,p2y+7,ML+CW,p2y+7);
        doc.setFont("helvetica","normal"); doc.setFontSize(9); tN();
        doc.text(ac.n,ML+5,p2y+4.8);
        p2y+=7;
      }
      dR(); doc.setLineWidth(0.4);
      doc.rect(ML,p2y-ACCS.length*7-7.5,CW,ACCS.length*7+7.5,"S");
      p2y+=8;
    }

    bloqueAutorizacion(p2y);
    piePagina();

    // ── GUARDAR ──
    var safeName = LOCAL_ACTUAL.nombre.replace(/[^a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑ]/g,"").trim().substring(0,20);
    var nom = safeName+"-CERT-"+ANO+".pdf";
    var blob = doc.output("blob");
    var blobUrl = URL.createObjectURL(blob);
    URLS_GENERADAS.push(blobUrl);
    if(URLS_GENERADAS.length>10) URL.revokeObjectURL(URLS_GENERADAS.shift());

    mostrarCargando(false);

    // Marcar local como done
    PUNTOS[LOCAL_ACTUAL._pi].locales[LOCAL_ACTUAL._li].done = true;
    localStorage.setItem("pf_recorrido_data", JSON.stringify(PUNTOS));
    renderPuntos();

    var hora       = new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});
    var fechaLarga = new Date().toLocaleDateString("es-EC",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

    document.getElementById("senv-s").textContent   = LOCAL_ACTUAL.nombre;
    document.getElementById("senv-hr").textContent  = hora+" — "+fechaLarga;
    document.getElementById("senv-sub").textContent = "PDF listo para descargar";
    document.getElementById("st-e").textContent     = (LOCAL_ACTUAL.ext&&LOCAL_ACTUAL.ext.length)||"—";
    document.getElementById("st-f").textContent     = fc;
    document.getElementById("st-a").textContent     = ACCS.length;
    document.getElementById("senv-pdf").textContent = nom;

    var dl = document.getElementById("senv-dl");
    dl.href     = blobUrl;
    dl.download = nom;
    dl.onclick  = function(){ return true; }; // Fix iOS

    if(ACCS.length>0){
      var tot=0;
      for(var i=0;i<ACCS.length;i++) tot+=ACCS[i].p;
      var iva=tot*0.15;
      document.getElementById("nota-c").style.display = "block";
      document.getElementById("nota-m").textContent =
        "Subtotal $"+tot.toFixed(2)+" + IVA $"+iva.toFixed(2)+" = $"+(tot+iva).toFixed(2);
    } else {
      document.getElementById("nota-c").style.display = "none";
    }

    // Siguiente local pendiente
    var sig=null, sigPi=-1, sigLi=-1;
    outer: for(var i=0;i<PUNTOS.length;i++){
      for(var j=0;j<PUNTOS[i].locales.length;j++){
        if(!PUNTOS[i].locales[j].done){ sig=PUNTOS[i].locales[j]; sigPi=i; sigLi=j; break outer; }
      }
    }
    var sc=document.getElementById("sig-c");
    if(sig){
      sc.innerHTML='<div class="sgn">'+(sigPi+1)+'</div><div><div class="sgnm">'+sig.nombre+'</div><div class="sgm">'+PUNTOS[sigPi].nombre+'</div></div>';
    } else {
      sc.innerHTML='<div style="font-size:15px;color:var(--v);font-weight:700">¡Recorrido completado! 🎉</div>';
    }

    // Historial
    HISTORIAL.unshift({local:LOCAL_ACTUAL, punto:PUNTO_ACTUAL, hora:hora, fotos:fc, accs:ACCS.length, url:blobUrl, nombre:nom, certNum:CERT_NUM});
    renderHistorial();

    // Enviar a Sheets si hay accesorios
    if(ACCS.length>0){
      var payload={
        accion:"facturacion",
        fecha:new Date().toLocaleDateString("es-EC"),
        hora:hora,
        cliente:LOCAL_ACTUAL.nombre,
        punto:PUNTO_ACTUAL?PUNTO_ACTUAL.nombre:"",
        empresa:"",
        certificado:CERT_NUM,
        accesorios:ACCS.map(function(a){ return {nombre:a.n,precio:a.p}; })
      };
      fetch(SCRIPT_URL,{method:"POST",body:JSON.stringify(payload)}).catch(function(){});
    }

    ir("senv");

  }catch(err){
    mostrarCargando(false);
    console.error(err);
    alert("Error generando el PDF: "+err.message);
  }
}

// ── SIGUIENTE ────────────────────────────────────────────────
function irSig(){
  for(var i=0;i<PUNTOS.length;i++){
    for(var j=0;j<PUNTOS[i].locales.length;j++){
      if(!PUNTOS[i].locales[j].done){ abrirLocal(i,j); return; }
    }
  }
  ir("s1");
}

// ── HISTORIAL ────────────────────────────────────────────────
function renderHistorial(){
  var lista=document.getElementById("hist-l");
  if(!lista) return;
  if(HISTORIAL.length===0){
    lista.innerHTML='<div class="empty">Aún no hay certificados hoy</div>';
    return;
  }
  var h='<div class="slbl">Hoy</div>';
  for(var i=0;i<HISTORIAL.length;i++){
    var hi=HISTORIAL[i];
    h+='<div class="cd"><div style="padding:13px 14px;display:flex;align-items:center;gap:12px">';
    h+='<div style="width:36px;height:36px;border-radius:11px;background:var(--rc);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:var(--r);font-weight:700">PDF</div>';
    h+='<div style="flex:1"><div style="font-size:15px;font-weight:700">'+hi.local.nombre+'</div>';
    h+='<div style="font-size:12px;color:var(--g3);margin-top:2px">'+hi.hora+' · '+hi.fotos+' foto(s)'+(hi.accs>0?' · '+hi.accs+' acc.':'')+'</div></div>';
    h+='<a href="'+hi.url+'" download="'+hi.nombre+'" style="font-size:10px;font-weight:700;background:var(--ac);color:var(--a);padding:4px 8px;border-radius:10px;text-decoration:none">⬇ PDF</a>';
    h+='</div></div>';
  }
  lista.innerHTML=h;
}

// ── OVERLAY CARGANDO ─────────────────────────────────────────
function mostrarCargando(mostrar,titulo,sub){
  var lov=document.getElementById("lov");
  var ltx=document.getElementById("ltx");
  var lsb=document.getElementById("lsb");
  if(!lov) return;
  if(mostrar){
    if(ltx) ltx.textContent=titulo||"Cargando...";
    if(lsb) lsb.textContent=sub||"Por favor espera";
    lov.classList.add("show");
  } else {
    lov.classList.remove("show");
  }
}

// ── PERFIL ───────────────────────────────────────────────────
function renderPerfil(){
  document.querySelectorAll(".sperf-nom").forEach(function(el){
    el.textContent = TECNICO_NOMBRE;
  });
  var ver = document.getElementById("sperf-ver");
  if(ver) ver.textContent = "Previfuego Field v"+VERSION;
}

function cerrarSesion(){
  if(!confirm("¿Cambiar de usuario?")) return;
  localStorage.removeItem("pf_usuario");
  USUARIO_ACTUAL = null;
  PUNTOS = [];
  HISTORIAL = [];
  ir("slogin");
}

// ── INIT ─────────────────────────────────────────────────────
window.onload = function(){
  initLogos();
  initFecha();
  renderAccSel();

  // Canvas events (aunque esté oculto)
  canvas = document.getElementById("cnv");
  if(canvas) setupCanvasEvents();

  // Restaurar usuario
  var saved = localStorage.getItem("pf_usuario");
  if(saved && USUARIOS[saved]){
    seleccionarUsuario(saved);
  } else {
    ir("slogin");
  }
};
