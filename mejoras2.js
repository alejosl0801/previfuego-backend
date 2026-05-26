// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — mejoras2.js  v1.0
//  43 — Semáforo de vencimientos mejorado
//  39 — Aprobación de recorrido (Fabiola ve antes que Raúl)
//  25 — Email automático del certificado via Apps Script
// ═══════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
//  43 — SEMÁFORO DE VENCIMIENTOS MEJORADO
//  Agrega panel de vencimientos en el admin con datos reales
//  de las fichas del local
// ════════════════════════════════════════════════════════════

// Frecuencias de mantenimiento por tipo de cliente (días)
var PF_FREQ = {
  kfc:          365 * 3,  // Grupo KFC → cada 3 años
  independiente: 365      // Independientes → cada 1 año
};

var PF_GRUPO_KFC = ["INT FOOD","SHEMLON","DELI INT","PROMOTORA","NOVOEVENTOS","SUSHICORP","KFC","GUS","CAJUN","MENESTRAS","AMERICAN DELI","BASKIN","CINNABON","JUAN VALDEZ","NOVOCENTRO","KOBE","NOE"];

function pfEsGrupoKFC(nombreLocal) {
  var n = (nombreLocal || "").toUpperCase();
  for (var i = 0; i < PF_GRUPO_KFC.length; i++) {
    if (n.indexOf(PF_GRUPO_KFC[i]) !== -1) return true;
  }
  return false;
}

function pfProximoMantenimiento(nombreLocal, ultimaVisita) {
  if (!ultimaVisita) return null;
  try {
    var p    = ultimaVisita.split("/");
    var d    = new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
    // Mantenimiento: 1 año para todos. Recarga: 3 años KFC, 1 año independientes
  var freq = PF_FREQ.independiente; // mantenimiento siempre 1 año
    d.setDate(d.getDate() + freq);
    return d;
  } catch(e) { return null; }
}

function pfDiasParaVencer(fechaProx) {
  if (!fechaProx) return null;
  return Math.round((fechaProx - new Date()) / 86400000);
}

function pfSemaforoColor(dias) {
  if (dias === null) return { bg:"var(--g2)", tx:"var(--g4)", ico:"⬜", label:"Sin datos" };
  if (dias < 0)     return { bg:"var(--rc)", tx:"var(--r)", ico:"🔴", label:"VENCIDO "+(Math.abs(dias))+"d" };
  if (dias < 30)    return { bg:"var(--rc)", tx:"var(--r)", ico:"🔴", label:dias+"d" };
  if (dias < 90)    return { bg:"var(--nc)", tx:"var(--n)", ico:"🟡", label:dias+"d" };
  return              { bg:"var(--vc)", tx:"var(--v)", ico:"🟢", label:dias+"d" };
}

function pfRenderSemaforo() {
  var el = document.getElementById("pf-semaforo-lista");
  if (!el) return;

  var fichas = {};
  try { fichas = JSON.parse(localStorage.getItem("pf_fichas") || "{}"); } catch(e) {}

  var locales = Object.keys(fichas);
  if (!locales.length) {
    el.innerHTML = '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Sin locales registrados aún.</div>';
    return;
  }

  // Calcular días para cada local
  var items = locales.map(function(nombre) {
    var ficha = fichas[nombre];
    // Buscar última visita de mantenimiento o entrega
    var ultVisita = null;
    var visitas = (ficha.visitas || []).filter(function(v){ return v.tipo === "mantenimiento" || v.tipo === "entrega"; });
    if (visitas.length > 0) ultVisita = visitas[0].fecha; // ya vienen ordenadas desc
    var proxFecha = pfProximoMantenimiento(nombre, ultVisita);
    var dias      = pfDiasParaVencer(proxFecha);
    return { nombre:nombre, ultVisita:ultVisita, proxFecha:proxFecha, dias:dias };
  });

  // Ordenar: vencidos primero, luego por días asc
  items.sort(function(a,b) {
    var da = a.dias === null ? 99999 : a.dias;
    var db = b.dias === null ? 99999 : b.dias;
    return da - db;
  });

  // Contadores para resumen
  var vencidos = items.filter(function(i){ return i.dias !== null && i.dias < 0; }).length;
  var proximos = items.filter(function(i){ return i.dias !== null && i.dias >= 0 && i.dias < 90; }).length;

  var h = "";

  // Resumen
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 12px 12px">';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 8px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--r)">'+vencidos+'</div><div style="font-size:11px;color:var(--g3)">Vencidos</div></div>';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 8px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--n)">'+proximos+'</div><div style="font-size:11px;color:var(--g3)">Por vencer</div></div>';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 8px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--g4)">'+locales.length+'</div><div style="font-size:11px;color:var(--g3)">Total</div></div>';
  h += '</div>';

  // Lista
  items.forEach(function(item) {
    var sem   = pfSemaforoColor(item.dias);
    var esKFC = pfEsGrupoKFC(item.nombre);
    h += '<div style="margin:0 12px 6px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:10px 14px;display:flex;align-items:center;gap:10px">';
    h += '<div style="font-size:20px;flex-shrink:0">'+sem.ico+'</div>';
    h += '<div style="flex:1;min-width:0">';
    h += '<div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+item.nombre+'</div>';
    h += '<div style="font-size:11px;color:var(--g4);margin-top:1px">'+(esKFC?"Grupo KFC · cada 3 años":"Independiente · cada 1 año")+(item.ultVisita?" · último: "+item.ultVisita:" · sin visitas")+'</div>';
    h += '</div>';
    h += '<div style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:'+sem.bg+';color:'+sem.tx+';flex-shrink:0">'+sem.label+'</div>';
    h += '</div>';
  });

  el.innerHTML = h;
}

// Inyectar tab Semáforo en admin
function pfInyectarSemaforo() {
  var tabBar = document.querySelector(".adm-tab");
  var admScr = document.getElementById("sadmin");
  if (!tabBar || !admScr) return;
  if (document.getElementById("adm-t6")) return;

  var btn = document.createElement("button");
  btn.id = "adm-t6"; btn.className = "adm-tab-btn";
  btn.textContent = "🚦 Venc.";
  btn.onclick = function(){ pfAdmTab6(6); };
  tabBar.appendChild(btn);

  var sc = admScr.querySelector(".sc");
  var panel = document.createElement("div");
  panel.id = "adm-p6"; panel.className = "adm-panel";
  panel.innerHTML =
    '<div style="padding:12px 0">' +
    '<div class="slbl">Semáforo de vencimientos</div>' +
    '<div id="pf-semaforo-lista"></div>' +
    '<div style="height:80px"></div></div>';
  if (sc) sc.appendChild(panel); else admScr.appendChild(panel);
}

function pfAdmTab6(n) {
  for (var i = 1; i <= 6; i++) {
    var b = document.getElementById("adm-t"+i);
    var p = document.getElementById("adm-p"+i);
    if (b) b.className = "adm-tab-btn" + (i===n?" on":"");
    if (p) p.className = "adm-panel"   + (i===n?" on":"");
  }
  if (n === 6) pfRenderSemaforo();
}

// ════════════════════════════════════════════════════════════
//  39 — APROBACIÓN DE RECORRIDO
//  Fabiola puede ver el recorrido y aprobarlo antes que Raúl
// ════════════════════════════════════════════════════════════

function pfRenderAprobacion() {
  var el = document.getElementById("pf-aprob-contenido");
  if (!el) return;

  var txt   = localStorage.getItem("pf_recorrido_texto") || "";
  var fecha = localStorage.getItem("pf_recorrido_fecha") || "—";
  var aprobado = localStorage.getItem("pf_recorrido_aprobado") === "si";
  var aprobadoPor = localStorage.getItem("pf_recorrido_aprobado_por") || "";
  var aprobadoHora = localStorage.getItem("pf_recorrido_aprobado_hora") || "";

  var h = "";

  if (!txt) {
    h = '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Alejandro no ha publicado el recorrido de hoy aún.</div>';
    el.innerHTML = h; return;
  }

  // Estado de aprobación
  if (aprobado) {
    h += '<div style="margin:0 12px 10px;padding:12px 14px;background:var(--vc);border-radius:12px;border:1.5px solid var(--v)">';
    h += '<div style="font-size:13px;font-weight:700;color:var(--v)">✅ Recorrido aprobado</div>';
    h += '<div style="font-size:12px;color:var(--g4);margin-top:2px">Por: '+aprobadoPor+' · '+aprobadoHora+'</div></div>';
  } else {
    h += '<div style="margin:0 12px 10px;padding:12px 14px;background:var(--nc);border-radius:12px;border:1.5px solid var(--n)">';
    h += '<div style="font-size:13px;font-weight:700;color:var(--n)">⏳ Pendiente de aprobación</div>';
    h += '<div style="font-size:12px;color:var(--g4);margin-top:2px">Fabiola debe revisar y aprobar antes de que el técnico inicie</div></div>';
    h += '<div style="margin:0 12px 10px">';
    h += '<button onclick="pfAprobarRecorrido()" style="width:100%;padding:14px;border-radius:12px;border:none;background:var(--v);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">✅ Aprobar recorrido</button>';
    h += '</div>';
  }

  // Preview del recorrido
  h += '<div class="slbl">Recorrido del '+fecha+'</div>';
  h += '<div style="margin:0 12px 10px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 14px">';
  h += '<pre style="font-size:12px;color:var(--g4);white-space:pre-wrap;line-height:1.6;font-family:inherit">'+txt+'</pre>';
  h += '</div>';
  h += '<div style="height:80px"></div>';

  el.innerHTML = h;
}

function pfAprobarRecorrido() {
  var nombre = "Fabiola";
  var hora   = new Date().toLocaleTimeString("es-EC", {hour:"2-digit", minute:"2-digit"});
  localStorage.setItem("pf_recorrido_aprobado",      "si");
  localStorage.setItem("pf_recorrido_aprobado_por",  nombre);
  localStorage.setItem("pf_recorrido_aprobado_hora", hora);
  pfRenderAprobacion();
  // Notificar via Apps Script si hay conexión
  var txt = localStorage.getItem("pf_recorrido_texto") || "";
  if (typeof SCRIPT_URL !== "undefined") {
    fetch(SCRIPT_URL, { method:"POST", body: JSON.stringify({ accion:"aprobar_recorrido", aprobadoPor:nombre, hora:hora }) }).catch(function(){});
  }
}

// Inyectar en pantalla de Fabiola — se agrega como tab en su nav
function pfInyectarAprobacion() {
  // Panel de aprobación para Fabiola — se muestra en su pantalla s1 como banner
  window.addEventListener("pfUsuarioSeleccionado", function(e) {
    if (e.detail === "fabiola") pfMostrarBannerAprobacion();
  });
}

function pfMostrarBannerAprobacion() {
  var lista = document.getElementById("s1list");
  if (!lista) return;
  var aprobado = localStorage.getItem("pf_recorrido_aprobado") === "si";
  var txt      = localStorage.getItem("pf_recorrido_texto") || "";
  if (!txt) return;

  var banner = document.getElementById("pf-aprobacion-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "pf-aprobacion-banner";
    lista.parentNode.insertBefore(banner, lista);
  }

  if (aprobado) {
    var por  = localStorage.getItem("pf_recorrido_aprobado_por") || "";
    var hora = localStorage.getItem("pf_recorrido_aprobado_hora") || "";
    banner.innerHTML = '<div style="margin:10px 12px;padding:12px 14px;background:var(--vc);border-radius:12px;border:1.5px solid var(--v);font-size:13px;font-weight:700;color:var(--v)">✅ Recorrido aprobado por '+por+' a las '+hora+'</div>';
  } else {
    banner.innerHTML =
      '<div style="margin:10px 12px;padding:12px 14px;background:var(--nc);border-radius:12px;border:1.5px solid var(--n)">' +
      '<div style="font-size:13px;font-weight:700;color:var(--n);margin-bottom:8px">⏳ Recorrido pendiente de aprobación</div>' +
      '<button onclick="pfAprobarRecorrido();pfMostrarBannerAprobacion()" style="width:100%;padding:12px;border-radius:10px;border:none;background:var(--v);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">✅ Aprobar y publicar a Raúl</button>' +
      '</div>';
  }
}

// ════════════════════════════════════════════════════════════
//  25 — EMAIL AUTOMÁTICO DEL CERTIFICADO
//  Envía email via Apps Script al completar un certificado
// ════════════════════════════════════════════════════════════

function pfEnviarEmailCertificado(certNum, localNombre, emailEncargado) {
  if (!emailEncargado || !emailEncargado.includes("@")) return;
  if (typeof SCRIPT_URL === "undefined") return;

  var payload = {
    accion:    "enviar_certificado",
    certNum:   certNum,
    local:     localNombre,
    email:     emailEncargado,
    fecha:     new Date().toLocaleDateString("es-EC", {day:"2-digit", month:"long", year:"numeric"}),
    tecnico:   typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "Técnico"
  };

  fetch(SCRIPT_URL, { method:"POST", body: JSON.stringify(payload) })
    .then(function(r){ return r.json(); })
    .then(function(d){ if (d.ok) console.log("Email enviado a "+emailEncargado); })
    .catch(function(){});
}

// Agregar campo de email en pantalla de firma
function pfInyectarCampoEmail() {
  var sfir = document.getElementById("sfir");
  if (!sfir || document.getElementById("pf-email-enc")) return;

  var sc = sfir.querySelector(".sc");
  if (!sc) return;

  var div = document.createElement("div");
  div.style.cssText = "margin:0 12px 10px";
  div.innerHTML =
    '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Email del encargado (opcional)</div>' +
    '<input id="pf-email-enc" type="email" placeholder="encargado@empresa.com" autocomplete="email" inputmode="email" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;color:var(--ng)">' +
    '<div style="font-size:11px;color:var(--g3);margin-top:4px">Si lo ingresas, el certificado se envía automáticamente por email</div>';

  // Insertar antes del último elemento del sc
  sc.insertBefore(div, sc.lastElementChild);
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener("load", function() {
  pfInyectarSemaforo();
  pfInyectarAprobacion();

  // Parchear irFirma para inyectar campo email
  var _irFirmaOrig2 = window.irFirma;
  window.irFirma = function() {
    if (typeof _irFirmaOrig2 === "function") _irFirmaOrig2();
    setTimeout(pfInyectarCampoEmail, 300);
  };

  // Detectar Fabiola desde ir() — sin parchear seleccionarUsuario
  var _irOrig2 = window.ir;
  window.ir = function(id) {
    if (_irOrig2) _irOrig2(id);
    if (id === "s1" && typeof USUARIO_ACTUAL !== "undefined" && USUARIO_ACTUAL === "fabiola") {
      setTimeout(pfMostrarBannerAprobacion, 400);
    }
  };

  // Parchear pfOnLocalCompletado para enviar email
  var _pfOnOrig = window.pfOnLocalCompletado;
  window.pfOnLocalCompletado = function(local, punto, tipo, tecnico, nota) {
    _pfOnOrig && _pfOnOrig(local, punto, tipo, tecnico, nota);
    // Enviar email si hay uno ingresado
    var emailEl = document.getElementById("pf-email-enc");
    if (emailEl && emailEl.value && local) {
      var certNum = typeof CERT_CONTADOR !== "undefined" ? "CERT-"+local.nombre.substring(0,8).toUpperCase().replace(/[^A-Z0-9]/g,"")+"-"+new Date().getFullYear()+"-"+String(CERT_CONTADOR).padStart(3,"0") : "—";
      pfEnviarEmailCertificado(certNum, local.nombre, emailEl.value);
    }
  };

  // Tab 6 registrado en coordinator.js
});
