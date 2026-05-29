// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — dashboard.js  v1.0
//  Dashboard ejecutivo — métricas del mes desde localStorage
//  NO modifica app.js — se incluye como script adicional
// ═══════════════════════════════════════════════════════════

function pfMesActual() {
  var d  = new Date();
  var ec = new Date(d.toLocaleString("en-US", {timeZone:"America/Guayaquil"}));
  return String(ec.getMonth()+1).padStart(2,"0") + "/" + ec.getFullYear();
}

function pfFechaEnMes(fechaStr) {
  if (!fechaStr || typeof fechaStr !== "string") return false; // #136 FIX
  var p = fechaStr.split("/");
  if (p.length < 3 || !p[2] || p[2].length < 4) return false;
  var ma = pfMesActual().split("/");
  // #NEW FIX: comparar correctamente MM y YYYY
  return p[1].padStart(2,"0") === ma[0].padStart(2,"0") && p[2] === ma[1];
}

// ── CALCULAR MÉTRICAS ────────────────────────────────────────
function pfCalcDashboard() {
  // #135 FIX: verificar que el historial sea de hoy
  var histHoy = [];
  try {
    var _histFecha = localStorage.getItem("pf_hist_fecha");
    var _histData  = localStorage.getItem("pf_hist_data");
    var _hoyEC = (function(){ var d=new Date(); var ec=new Date(d.toLocaleString("en-US",{timeZone:"America/Guayaquil"})); return String(ec.getDate()).padStart(2,"0")+"/"+String(ec.getMonth()+1).padStart(2,"0")+"/"+ec.getFullYear(); })();
    if (_histFecha === _hoyEC && _histData) histHoy = JSON.parse(_histData);
  } catch(e){}

  // Retiros del mes
  var retiros = [];
  try { retiros = JSON.parse(localStorage.getItem("pf_retiros") || "[]"); } catch(e){}
  var retirosMes     = retiros.filter(function(r){ return pfFechaEnMes(r.fecha); });
  var retirosPend    = retirosMes.filter(function(r){ return r.estado === "pendiente"; });
  var retirosEntregados = retirosMes.filter(function(r){ return r.estado === "entregado"; });

  // Fichas — total locales registrados
  var fichas = {};
  try { fichas = JSON.parse(localStorage.getItem("pf_fichas") || "{}"); } catch(e){}
  var totalLocales = Object.keys(fichas).length;

  // Visitas del mes desde fichas
  var visitasMes = 0, visitasPorTipo = { mantenimiento:0, retiro:0, entrega:0, instalacion:0, cobro:0, otro:0 };
  var visitasPorTecnico = {};
  Object.keys(fichas).forEach(function(key) {
    var f = fichas[key];
    (f.visitas || []).forEach(function(v) {
      if (pfFechaEnMes(v.fecha)) {
        visitasMes++;
        if (visitasPorTipo[v.tipo] !== undefined) visitasPorTipo[v.tipo]++;
        else visitasPorTipo.otro++;
        var tec = v.tecnico || "Desconocido";
        visitasPorTecnico[tec] = (visitasPorTecnico[tec] || 0) + 1;
      }
    });
  });

  // Certificados hoy
  var certsHoy  = histHoy.filter(function(h){ return h.tipo === "cert"; }).length;
  var visitasHoy = histHoy.length;

  // Tiempo promedio hoy (segundos)
  var tiempos = histHoy.filter(function(h){ return h.duracion > 0; }).map(function(h){ return h.duracion; });
  var promSeg = tiempos.length > 0 ? Math.round(tiempos.reduce(function(a,b){ return a+b; }, 0) / tiempos.length) : 0;
  var promTxt = promSeg > 0 ? (Math.floor(promSeg/60) + "min " + (promSeg%60) + "s") : "—";

  return {
    visitasMes:       visitasMes,
    visitasHoy:       visitasHoy,
    certsHoy:         certsHoy,
    promTiempoHoy:    promTxt,
    retirosPend:      retirosPend.length,
    retirosEntregados:retirosEntregados.length,
    totalLocales:     totalLocales,
    visitasPorTipo:   visitasPorTipo,
    visitasPorTecnico:visitasPorTecnico
  };
}

// ── RENDER DASHBOARD ─────────────────────────────────────────
function pfRenderDashboard() {
  // #052 FIX: si el panel no existe aún, reintentar en 200ms
  var el = document.getElementById("pf-dash-contenido");
  if (!el) {
    // BAJO FIX: limitar reintentos a 10 (2 segundos total)
    pfRenderDashboard._retries = (pfRenderDashboard._retries || 0) + 1;
    if (pfRenderDashboard._retries < 10) setTimeout(pfRenderDashboard, 200);
    else console.warn("pfRenderDashboard: pf-dash-contenido no encontrado");
    return;
  }
  pfRenderDashboard._retries = 0;

  var d   = pfCalcDashboard();
  var mes = pfMesActual();
  var h   = "";

  // ── Fecha y encabezado
  h += '<div style="padding:14px 16px 6px"><div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1.5px;text-transform:uppercase">Resumen del mes — '+mes+'</div></div>';

  // ── Métricas principales
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 12px 12px">';
  h += pfStatCard(d.visitasMes,     "Visitas del mes", "var(--a)");
  h += pfStatCard(d.visitasHoy,     "Hoy",           "var(--r)");
  h += pfStatCard(d.totalLocales,   "Locales",       "var(--n)");
  h += '</div>';

  // ── Hoy
  h += '<div class="slbl">Hoy en campo</div>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 12px">';
  h += pfStatCard2(d.certsHoy,       "Certificados generados", "🏅");
  h += pfStatCard2(d.promTiempoHoy,  "Tiempo prom. por local", "⏱");
  h += '</div>';

  // ── Retiros
  h += '<div class="slbl">Retiros del mes</div>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 12px">';
  h += pfStatCard2(d.retirosPend,       "Pendientes de entrega", "📦");
  h += pfStatCard2(d.retirosEntregados, "Entregados",            "✅");
  h += '</div>';

  // ── Visitas por tipo
  h += '<div class="slbl">Visitas por tipo — '+mes+'</div>';
  h += '<div style="margin:0 12px 12px;background:#fff;border-radius:14px;border:1.5px solid var(--bo);padding:12px 14px">';
  var tipoLabel = { mantenimiento:"🔧 Mantenimiento", retiro:"📦 Retiro", entrega:"🚚 Entrega", distribuidor:"🏢 Distribuidor", instalacion:"🔩 Instalación", cobro:"💰 Cobro", otro:"📋 Otro" };
  var tipoColor = { mantenimiento:"var(--a)", retiro:"var(--n)", entrega:"var(--v)", instalacion:"var(--r)", cobro:"var(--g4)", otro:"var(--g4)" };
  var totalTipos = Object.values(d.visitasPorTipo).reduce(function(a,b){ return a+b; }, 0) || 1;
  Object.keys(d.visitasPorTipo).forEach(function(tipo) {
    var cnt = d.visitasPorTipo[tipo];
    if (cnt === 0) return;
    var pct = Math.round(cnt / totalTipos * 100);
    var col = tipoColor[tipo] || "var(--g4)";
    h += '<div style="margin-bottom:10px">';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:4px">';
    h += '<div style="font-size:13px;font-weight:700;color:'+col+'">'+(tipoLabel[tipo]||tipo)+'</div>';
    h += '<div style="font-size:13px;font-weight:700;color:var(--ng)">'+cnt+' <span style="color:var(--g3);font-weight:400">('+pct+'%)</span></div></div>';
    h += '<div style="height:6px;background:var(--g2);border-radius:3px;overflow:hidden">';
    h += '<div style="height:100%;width:'+pct+'%;background:'+col+';border-radius:3px;transition:width .5s"></div></div>';
    h += '</div>';
  });
  if (totalTipos === 1) h += '<div style="font-size:13px;color:var(--g3)">Sin visitas registradas este mes aún.</div>';
  h += '</div>';

  // ── Productividad por técnico
  h += '<div class="slbl">Productividad por técnico — '+mes+'</div>';
  h += '<div style="margin:0 12px 12px;background:#fff;border-radius:14px;border:1.5px solid var(--bo);padding:12px 14px">';
  var tecnicos = Object.keys(d.visitasPorTecnico);
  if (tecnicos.length === 0) {
    h += '<div style="font-size:13px;color:var(--g3)">Sin datos aún.</div>';
  } else {
    var maxV = Math.max.apply(null, tecnicos.map(function(t){ return d.visitasPorTecnico[t]; })) || 1;
    tecnicos.sort(function(a,b){ return d.visitasPorTecnico[b] - d.visitasPorTecnico[a]; });
    tecnicos.forEach(function(tec, idx) {
      var cnt = d.visitasPorTecnico[tec];
      var pct = Math.round(cnt / maxV * 100);
      var cols = ["var(--r)","var(--a)","var(--v)","var(--n)"];
      var col  = cols[idx % cols.length];
      var inicial = tec.charAt(0).toUpperCase();
      h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
      h += '<div style="width:32px;height:32px;border-radius:10px;background:'+col+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0">'+inicial+'</div>';
      h += '<div style="flex:1">';
      h += '<div style="display:flex;justify-content:space-between;margin-bottom:3px"><div style="font-size:13px;font-weight:700">'+tec+'</div><div style="font-size:13px;font-weight:700;color:'+col+'">'+cnt+' visita(s)</div></div>';
      h += '<div style="height:5px;background:var(--g2);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+col+';border-radius:3px;transition:width .5s"></div></div>';
      h += '</div></div>';
    });
  }
  h += '</div>';

  // ── Botón actualizar
  h += '<div style="padding:0 12px 8px"><button type="button" onclick="this.textContent=\'⏳ Actualizando...\';pfRenderDashboard()" style="width:100%;padding:12px;border-radius:12px;border:1.5px solid var(--bo);background:#fff;font-size:13px;font-weight:700;color:var(--g4);cursor:pointer;font-family:inherit">🔄 Actualizar datos</button></div>';
  // F10: botón dashboard público
  h += '<div style="padding:0 12px 16px"><button type="button" onclick="pfAbrirDashboardPublico()" style="width:100%;padding:12px;border-radius:12px;border:none;background:var(--a);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">🌐 Ver dashboard público</button></div>';
  h += '<div style="height:80px"></div>';

  el.innerHTML = h;
}

function pfStatCard(val, label, color) {
  // #051 FIX: reducir font-size si el número tiene 3+ dígitos
  var numStr = String(val);
  var fs = numStr.length >= 4 ? "16px" : numStr.length === 3 ? "20px" : numStr.length === 2 ? "24px" : "28px";
  return '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 6px;text-align:center">' +
    '<div style="font-size:'+fs+';font-weight:700;line-height:1;color:'+color+'">'+val+'</div>' +
    '<div style="font-size:10px;color:var(--g3);font-weight:500;margin-top:3px;line-height:1.2">'+label+'</div></div>';
}

function pfStatCard2(val, label, ico) {
  return '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px">' +
    '<div style="font-size:22px;margin-bottom:4px">'+ico+'</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--ng);line-height:1">'+val+'</div>' +
    '<div style="font-size:11px;color:var(--g3);font-weight:500;margin-top:3px">'+label+'</div></div>';
}

// ── INYECTAR TAB EN ADMIN ─────────────────────────────────────
function pfInyectarDashboard() {
  var tabBar = document.querySelector(".adm-tab");
  var admScr = document.getElementById("sadmin");
  if (!tabBar || !admScr) return;

  if (!document.getElementById("adm-t5")) {
    var btn = document.createElement("button");
    btn.id = "adm-t5"; btn.className = "adm-tab-btn";
    btn.textContent = "📊 Dashboard";
    btn.onclick = function(){ admTab(5); };
    tabBar.appendChild(btn);
  }

  if (!document.getElementById("adm-p5")) {
    var panel = document.createElement("div");
    panel.id = "adm-p5"; panel.className = "adm-panel";
    panel.innerHTML = '<div id="pf-dash-contenido"><div style="padding:40px 16px;text-align:center;color:var(--g3)">Cargando dashboard...</div></div>';
    admScr.appendChild(panel);
  }

  // #ALTO FIX: NO registrar PF_TAB_HANDLERS[5] aquí — lo hace coordinator.js
  // Evitar doble registro y condición de carrera
}

// pfAdmTab manejado por coordinator.js — no duplicar

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener("load", function() {
  pfInyectarDashboard();
});

// ── F10: DASHBOARD PÚBLICO ────────────────────────────────────
function pfAbrirDashboardPublico() {
  // Generar HTML del dashboard público en una nueva ventana
  var win = window.open("", "_blank");
  if (!win) { pfModal && pfModal("Activa las ventanas emergentes para ver el dashboard público."); return; }

  var d = pfCalcDashboard();
  var mes = pfMesActual();
  var html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Previfuego — Panel de Avance</title>' +
    '<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,system-ui,sans-serif;background:#f5f5f3;color:#1c1c1a;padding:20px;}' +
    '.header{background:linear-gradient(135deg,#9E1212,#5C0A0A);color:#fff;border-radius:16px;padding:24px;margin-bottom:20px;text-align:center;}' +
    '.header h1{font-size:28px;font-weight:700;letter-spacing:-0.5px;}' +
    '.header p{font-size:14px;opacity:.8;margin-top:6px;}' +
    '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;}' +
    '.card{background:#fff;border-radius:14px;padding:18px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.08);}' +
    '.card-num{font-size:36px;font-weight:700;line-height:1;}' +
    '.card-lbl{font-size:12px;color:#8a8884;margin-top:6px;font-weight:500;}' +
    '.footer{text-align:center;font-size:11px;color:#8a8884;margin-top:20px;}' +
    '.badge{display:inline-block;background:#9E1212;color:#fff;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;margin-top:8px;}' +
    '</style></head><body>' +
    '<div class="header"><h1>🔥 PREVIFUEGO</h1><p>Panel de operaciones en campo — ' + mes + '</p>' +
    '<span class="badge">GUAYAQUIL, ECUADOR</span></div>' +
    '<div class="grid">' +
    '<div class="card"><div class="card-num" style="color:#9E1212">' + d.visitasMes + '</div><div class="card-lbl">Visitas este mes</div></div>' +
    '<div class="card"><div class="card-num" style="color:#1A7A4A">' + d.totalLocales + '</div><div class="card-lbl">Locales atendidos</div></div>' +
    '<div class="card"><div class="card-num" style="color:#1A5FAA">' + d.visitasHoy + '</div><div class="card-lbl">Visitas hoy</div></div>' +
    '<div class="card"><div class="card-num" style="color:#C25A00">' + d.certsHoy + '</div><div class="card-lbl">Certificados hoy</div></div>' +
    '</div>' +
    '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,.08)">' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:12px">Servicios disponibles</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">' +
    '<div>🔧 Mantenimiento de extintores</div><div>♻️ Recarga de extintores</div>' +
    '<div>📦 Retiro y entrega</div><div>🚨 Sistemas CO₂</div>' +
    '<div>🔍 Inspección gratuita</div><div>📋 Señaléticas NFPA</div>' +
    '</div></div>' +
    '<div class="footer">PREVIFUEGO · Tel: 04-2374822 · 0978997247<br>ventas_previfuego@hotmail.com<br>' +
    'Actualizado: ' + new Date().toLocaleString("es-EC") + '</div>' +
    '</body></html>';

  win.document.write(html);
  win.document.close();
}
