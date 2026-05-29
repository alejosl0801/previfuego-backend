// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — retiros.js  v1.1
//  Registro automático de retiros + Ficha digital del local
//  + Alertas de retiro sin entrega
// ═══════════════════════════════════════════════════════════

function pfGetRetiros() {
  try { return JSON.parse(localStorage.getItem("pf_retiros") || "[]"); } catch(e) { return []; }
}
function pfSaveRetiros(arr) {
  try {
    localStorage.setItem("pf_retiros", JSON.stringify(arr));
  } catch(e) {
    if (e.name === "QuotaExceededError") {
      pfModal("⚠️ Almacenamiento lleno. Haz un backup desde Perfil y borra datos antiguos.");
    }
  }
}
function pfGetFichas() {
  try { return JSON.parse(localStorage.getItem("pf_fichas") || "{}"); } catch(e) { return {}; }
}
function pfSaveFichas(obj) {
  try {
    localStorage.setItem("pf_fichas", JSON.stringify(obj));
  } catch(e) {
    if (e.name === "QuotaExceededError") {
      pfModal("⚠️ Almacenamiento lleno. Haz un backup desde Perfil y borra datos antiguos.");
    }
  }
}

// ── REGISTRO DE RETIRO ───────────────────────────────────────
function pfRegistrarRetiro(local, punto, tecnico, desc) {
  // BAJO FIX: validar local.nombre
  if (!local || !local.nombre) { console.warn("pfRegistrarRetiro: local sin nombre"); return null; }
  var retiros = pfGetRetiros();
  var id = "ret_" + Date.now();
  var r = {
    id: id,
    fecha: fechaHoy(),
    hora: new Date().toLocaleTimeString("es-EC", {hour:"2-digit", minute:"2-digit"}),
    local: local.nombre,
    punto: punto ? punto.nombre : "",
    tecnico: tecnico || (typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "Técnico"),
    descripcion: desc || local.mision || "",
    estado: "pendiente",
    fechaEntrega: null
  };
  retiros.unshift(r);
  pfSaveRetiros(retiros);
  pfRegistrarVisitaEnFicha(local.nombre, {
    fecha: r.fecha, hora: r.hora, tipo: "retiro",
    tecnico: r.tecnico, nota: r.descripcion, retiroId: id
  });
  // Ingresar automáticamente al taller
  if (typeof pfIngresarAlTaller === "function") {
    pfIngresarAlTaller(local.nombre, r.descripcion || "Extintor", 1);
  }
  return r;
}

function pfMarcarEntregado(retiroId) {
  if (!retiroId) { console.warn("pfMarcarEntregado: id inválido"); return; } // #091 FIX
  var retiros = pfGetRetiros();
  var retiroEntregado = null;
  for (var i = 0; i < retiros.length; i++) {
    if (retiros[i].id === retiroId) {
      retiroEntregado = JSON.parse(JSON.stringify(retiros[i])); // snapshot
      retiros[i].estado = "entregado";
      retiros[i].fechaEntrega = fechaHoy();
      break;
    }
  }
  // #41 FIX: retiroEntregado ya fue asignado arriba con snapshot correcto
  if (retiroEntregado) {
    pfRegistrarVisitaEnFicha(retiroEntregado.local, {
      fecha: fechaHoy(),
      hora: new Date().toLocaleTimeString("es-EC", {hour:"2-digit", minute:"2-digit"}),
      tipo: "entrega",
      tecnico: typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "Técnico",
      nota: "Extintor entregado (retiro del " + retiroEntregado.fecha + ")"
    });
  }
  pfSaveRetiros(retiros);
  pfRenderRetiros();
}

// ── FICHA DEL LOCAL ────────────────────────────────────────── ──────────────────────────────────────────
function pfRegistrarVisitaEnFicha(nombreLocal, visita) {
  // BAJO FIX: try/catch para QuotaExceededError
  try {
    var fichas = pfGetFichas();
    if (!fichas[nombreLocal]) fichas[nombreLocal] = { nombre: nombreLocal, visitas: [] };
    // Limitar a 200 visitas por local para controlar tamaño
    fichas[nombreLocal].visitas.unshift(visita);
    if (fichas[nombreLocal].visitas.length > 200) fichas[nombreLocal].visitas = fichas[nombreLocal].visitas.slice(0, 200);
    pfSaveFichas(fichas);
  } catch(e) {
    if (e.name === "QuotaExceededError") pfModal("⚠️ Almacenamiento lleno. Ve a Perfil → Backup.");
    else console.error("pfRegistrarVisitaEnFicha:", e);
  }
}

function pfRegistrarVisita(local, punto, tipo, tecnico, nota) {
  pfRegistrarVisitaEnFicha(local.nombre, {
    fecha: fechaHoy(),
    hora: new Date().toLocaleTimeString("es-EC", {hour:"2-digit", minute:"2-digit"}),
    tipo: tipo || "mantenimiento",
    tecnico: tecnico || (typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "Técnico"),
    nota: nota || "",
    punto: punto ? punto.nombre : ""
  });
}

// ── ALERTAS ──────────────────────────────────────────────────
function pfDiasTranscurridos(fechaStr) {
  try {
    var p = fechaStr.split("/");
    if (p.length < 3) return 0;
    var d   = new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
    var raw = new Date();
    var hoy = new Date(raw.toLocaleString("en-US", {timeZone:"America/Guayaquil"}));
    hoy.setHours(0,0,0,0); // #090 FIX: solo fecha, sin hora
    return Math.floor((hoy - d) / 86400000);
  } catch(e) { return 0; }
}

function pfGetAlertas() {
  return pfGetRetiros().filter(function(r){
    var d = pfDiasTranscurridos(r.fecha);
    return r.estado === "pendiente" && d >= 7 && d <= 180; // #093 FIX: máx 180 días
  }).map(function(r){ var d = pfDiasTranscurridos(r.fecha); return { retiro:r, dias:d }; });
}

// ── MODAL FICHA DEL LOCAL ─────────────────────────────────────
function pfAbrirFicha(nombreLocal) {
  var fichas  = pfGetFichas();
  var ficha   = fichas[nombreLocal] || { nombre: nombreLocal, visitas: [] };
  var retiros = pfGetRetiros().filter(function(r){ return r.local === nombreLocal; });
  var retPend = retiros.filter(function(r){ return r.estado === "pendiente"; });

  var tipoLabel = { retiro:"📦 Retiro", entrega:"🚚 Entrega", mantenimiento:"🔧 Mantenimiento", instalacion:"🔩 Instalación", cobro:"💰 Cobro", otro:"📋 Otro" };
  var tipoColor = { retiro:"var(--n)", entrega:"var(--v)", mantenimiento:"var(--a)", instalacion:"var(--r)", cobro:"var(--g4)", otro:"var(--g4)" };

  var h = "";

  // Header
  h += '<div style="background:var(--r);padding:16px 14px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10">';
  h += '<div><div style="font-size:18px;font-weight:700;color:#fff">'+nombreLocal+'</div>';
  h += '<div style="font-size:12px;color:rgba(255,255,255,.75);margin-top:2px">'+ficha.visitas.length+' visita(s) · '+retPend.length+' retiro(s) pendiente(s)</div></div>';
  h += '<button onclick="pfCerrarFicha()" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:24px;width:38px;height:38px;border-radius:10px;cursor:pointer;line-height:1">✕</button>';
  h += '</div>';

  // Alerta retiros pendientes
  if (retPend.length > 0) {
    h += '<div style="margin:12px 12px 0;padding:10px 14px;background:var(--rc);border-radius:12px;border:1.5px solid var(--r)">';
    h += '<div style="font-size:13px;font-weight:700;color:var(--r);margin-bottom:6px">⚠ Extintores pendientes de entrega</div>';
    for (var i = 0; i < retPend.length; i++) {
      var dias = pfDiasTranscurridos(retPend[i].fecha);
      h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-top:1px solid rgba(158,18,18,.15);margin-top:4px">';
      h += '<div style="font-size:12px;color:var(--ng)">Retirado el '+retPend[i].fecha+' ('+dias+' día'+(dias!==1?'s':'')+')</div>';
      h += '<button data-rid="'+retPend[i].id+'" data-loc="'+nombreLocal.replace(/"/g,'&quot;')+'" onclick="pfMarcarEntregado(this.dataset.rid); pfAbrirFicha(this.dataset.loc)" style="background:var(--v);color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer">✓ Entregado</button>'; // #089+dataset FIX
      // Asignar nombre via dataset después (evita problemas con apóstrofes en onclick)
      h += '</div>';
    }
    h += '</div>';
  }

  // Resumen estadístico
  var totalVisitas = ficha.visitas.length;
  var totalRetiros = retiros.length;
  var totalEntregados = retiros.filter(function(r){ return r.estado==="entregado"; }).length;

  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:12px">';
  h += '<div class="si"><div class="sv" style="color:var(--a)">'+totalVisitas+'</div><div class="sl">Visitas</div></div>';
  h += '<div class="si"><div class="sv" style="color:var(--n)">'+totalRetiros+'</div><div class="sl">Retiros</div></div>';
  h += '<div class="si"><div class="sv" style="color:var(--v)">'+totalEntregados+'</div><div class="sl">Entregados</div></div>';
  h += '</div>';

  // Historial de visitas — paginación real con botón Ver más
  var PF_FICHA_PAGE = 15;
  var _fichaOffset = window._pfFichaOffset || 0;
  var visitasRender = ficha.visitas.slice(0, PF_FICHA_PAGE + _fichaOffset);
  h += '<div class="slbl">Historial de visitas ('+ficha.visitas.length+')</div>';
  if (ficha.visitas.length === 0) {
    h += '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Sin historial aún.<br>Las visitas se registran automáticamente.</div>';
  } else {
    for (var i = 0; i < visitasRender.length; i++) {
      var v   = visitasRender[i];
      var col = tipoColor[v.tipo] || "var(--g4)";
      var lbl = tipoLabel[v.tipo] || v.tipo;
      h += '<div style="margin:0 12px 8px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:11px 14px">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">';
      h += '<div style="font-size:13px;font-weight:700;color:'+col+'">'+lbl+'</div>';
      h += '<div style="font-size:11px;color:var(--g3)">'+v.fecha+(v.hora?' · '+v.hora:'')+'</div></div>';
      h += '<div style="font-size:12px;color:var(--g4)">'+v.tecnico+(v.punto?' · '+v.punto:'')+'</div>';
      if (v.nota) h += '<div style="font-size:12px;color:var(--g4);margin-top:4px;line-height:1.5;border-top:1px solid var(--bo);padding-top:4px">'+v.nota+'</div>';
      h += '</div>';
    }
    if (visitasRender.length < ficha.visitas.length) {
      var _nomEscF = nombreLocal.replace(/'/g,"");
      h += '<div style="padding:0 12px 12px"><button onclick="window._pfFichaOffset=(window._pfFichaOffset||0)+15;pfAbrirFicha(\''+_nomEscF+'\')" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:13px;font-weight:700;color:var(--a);cursor:pointer;font-family:inherit">Ver más ('+(ficha.visitas.length - visitasRender.length)+' restantes)</button></div>';
    }
  }
  h += '<div style="height:80px"></div>';

  // Modal
  var modal = document.getElementById("pf-ficha-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "pf-ficha-modal";
    modal.style.cssText = "position:fixed;inset:0;background:var(--g1);z-index:300;overflow-y:auto;display:none;padding-bottom:80px";
    document.body.appendChild(modal);
  }
  modal.innerHTML = h;
  modal.style.display = "block";
  modal.scrollTop = 0;
}

function pfCerrarFicha() {
  var modal = document.getElementById("pf-ficha-modal");
  if (modal) modal.style.display = "none";
  window._pfFichaOffset = 0; // resetear paginación
}

// ── PANEL RETIROS EN ADMIN ────────────────────────────────────
function pfRenderRetiros() {
  var el = document.getElementById("pf-retiros-lista");
  if (!el) return;
  var retiros = pfGetRetiros();
  if (!retiros.length) {
    el.innerHTML = '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">No hay retiros registrados aún.</div>';
    return;
  }
  var _filtro = window._pfRetiroFiltro || "todos";
  var pendientes  = retiros.filter(function(r){ return r.estado === "pendiente"; });
  var entregados  = retiros.filter(function(r){ return r.estado === "entregado"; });
  var alertas     = retiros.filter(function(r){ return r.estado === "pendiente" && pfDiasTranscurridos(r.fecha) >= 7; });
  var filtrados   = _filtro === "pendiente" ? pendientes : _filtro === "entregado" ? entregados : _filtro === "urgente" ? alertas : retiros;

  var h = "";
  // Filtros
  h += '<div style="display:flex;gap:6px;padding:0 12px 10px;overflow-x:auto;-webkit-overflow-scrolling:touch">';
  [["todos","Todos ("+retiros.length+")"],["pendiente","⏳ Pendientes ("+pendientes.length+")"],["urgente","⚠️ Urgentes ("+alertas.length+")"],["entregado","✅ Entregados ("+entregados.length+")"]].forEach(function(f){
    var act = _filtro === f[0];
    h += '<button onclick="window._pfRetiroFiltro=\''+f[0]+'\';pfRenderRetiros()" style="flex-shrink:0;padding:6px 12px;border-radius:20px;border:1.5px solid '+(act?'var(--r)':'var(--bo)')+';background:'+(act?'var(--r)':'#fff')+';color:'+(act?'#fff':'var(--g4)')+';font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">'+f[1]+'</button>';
  });
  h += '</div>';

  for (var i = 0; i < filtrados.length; i++) {
    var r    = filtrados[i];
    var dias = pfDiasTranscurridos(r.fecha);
    var alerta = r.estado === "pendiente" && dias >= 7;
    var colorBg  = r.estado === "entregado" ? "var(--vc)"  : alerta ? "var(--rc)"  : "#fff";
    var colorBor = r.estado === "entregado" ? "var(--v)"   : alerta ? "var(--r)"   : "var(--bo)";
    var colorTx  = r.estado === "entregado" ? "var(--v)"   : alerta ? "var(--r)"   : "var(--ng)";
    var estadoTxt = r.estado === "entregado" ? "✓ Entregado "+r.fechaEntrega
                  : alerta ? "⚠ "+dias+" días sin entregar"
                  : dias+"d pendiente";
    h += '<div style="margin:0 12px 8px;background:'+colorBg+';border:1.5px solid '+colorBor+';border-radius:14px;overflow:hidden">';
    h += '<div style="padding:12px 14px">';
    h += '<div style="display:flex;align-items:flex-start;gap:8px">';
    h += '<div style="flex:1"><div style="font-size:15px;font-weight:700;color:'+colorTx+'">'+(r.local||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>';
    h += '<div style="font-size:12px;color:var(--g4);margin-top:2px">'+r.fecha+' · '+r.hora+' · '+r.tecnico+'</div>';
    if (r.descripcion) h += '<div style="font-size:12px;color:var(--g4);margin-top:3px;line-height:1.5">'+(r.descripcion||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>';
    h += '</div>';
    h += '<div style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;white-space:nowrap;background:'+(r.estado==='entregado'?'var(--vc)':alerta?'var(--rc)':'var(--nc)')+';color:'+colorTx+'">'+estadoTxt+'</div>';
    h += '</div>';
    if (r.estado === "pendiente") {
      h += '<div style="padding:6px 12px 10px;display:flex;gap:6px">';
      h += '<button onclick="pfMarcarEntregado(\''+r.id+'\')" style="flex:1;background:var(--v);color:#fff;border:none;border-radius:10px;padding:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">✓ Marcar entregado</button>';
      h += '<button onclick="pfAbrirFicha(\''+r.local.replace(/'/g,"")+'\')" style="padding:8px 12px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;color:var(--g4);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">📋 Ficha</button>';
      h += '</div>';
    }
    h += '</div>';
  }
  if (filtrados.length === 0) h += '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Sin retiros en este filtro.</div>';
  el.innerHTML = h;
}

function pfRenderAlertas() {
  // FIX: badge urgente (retiros con más de 7 días pendientes)
  try {
    var _retiros = JSON.parse(localStorage.getItem("pf_retiros")||"[]");
    var _hoy = new Date();
    var _urgentes = _retiros.filter(function(r){
      if (r.estado!=="pendiente") return false;
      var p=r.fecha.split("/"); var d=new Date(parseInt(p[2]),parseInt(p[1])-1,parseInt(p[0]));
      return (_hoy-d)/86400000 > 7;
    }).length;
    var _badge = document.getElementById("nav-badge-retiros");
    if (_badge) { _badge.textContent=_urgentes>0?_urgentes:""; _badge.style.display=_urgentes>0?"":"none"; }
  } catch(e) {}
  var el = document.getElementById("pf-retiros-alertas");
  if (!el) return;
  var alertas = pfGetAlertas();
  if (!alertas.length) { el.innerHTML = ""; return; }
  var h = '<div style="margin:0 12px 10px;padding:12px 14px;background:var(--rc);border-radius:12px;border:1.5px solid var(--r)">';
  h += '<div style="font-size:13px;font-weight:700;color:var(--r);margin-bottom:6px">⚠ '+alertas.length+' retiro(s) sin entregar hace más de 7 días</div>';
  for (var i = 0; i < alertas.length; i++) {
    var a = alertas[i];
    h += '<div style="font-size:13px;color:var(--ng);padding:4px 0;border-top:1px solid rgba(158,18,18,.15);margin-top:4px">';
    h += '<strong>'+a.retiro.local+'</strong> — '+a.retiro.fecha+' ('+a.dias+' días)</div>';
  }
  h += '</div>';
  el.innerHTML = h;
}

// ── INYECTAR TAB EN ADMIN ─────────────────────────────────────
function pfInyectarPanelRetiros() {
  var tabBar = document.querySelector(".adm-tab");
  var admScr = document.getElementById("sadmin");
  if (!tabBar || !admScr) return;

  if (!document.getElementById("adm-t4")) {
    var btn = document.createElement("button");
    btn.id = "adm-t4"; btn.className = "adm-tab-btn";
    btn.textContent = "📦 Retiros";
    btn.onclick = function(){ admTab(4); };
    tabBar.appendChild(btn);
  }

  if (!document.getElementById("adm-p4")) {
    var panel = document.createElement("div");
    panel.id = "adm-p4"; panel.className = "adm-panel";
    panel.innerHTML = '<div style="padding:12px 0"><div class="slbl">Retiros registrados</div><div id="pf-retiros-alertas"></div><div id="pf-retiros-lista"></div></div>';
    admScr.appendChild(panel);
  }

  // Tab 4 manejado por coordinator.js
  if (window.PF_TAB_HANDLERS) window.PF_TAB_HANDLERS[4] = function(){ pfRenderRetiros(); pfRenderAlertas(); };
}

// ── BADGE DE ALERTAS ─────────────────────────────────────────
function pfActualizarBadge() {
  var btn = document.getElementById("adm-t4");
  if (!btn) return;
  var n = pfGetAlertas().length;
  btn.textContent = n > 0 ? "📦 Retiros ("+n+"⚠)" : "📦 Retiros";
}

// ── HOOK CON app.js y pdf.js ──────────────────────────────────
window.addEventListener("load", function() {
  pfInyectarPanelRetiros();
  pfActualizarBadge();
  window._pfBadgeInterval = setInterval(pfActualizarBadge, 60000); // #019 FIX: guardado para limpieza en cerrarSesion

  // confirmarSin y pfOnLocalCompletado manejados por coordinator.js
});
