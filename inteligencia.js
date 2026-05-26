// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — inteligencia.js  v1.0
//  46 — Clasificación de clientes por rentabilidad
//  53 — Calendario inteligente
//  68 — Análisis de rentabilidad con IA (Claude API)
// ═══════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
//  46 — CLASIFICACIÓN DE CLIENTES POR RENTABILIDAD
//  Basado en frecuencia de visitas, tipos de trabajo y datos
//  disponibles en localStorage
// ════════════════════════════════════════════════════════════

function pfClasificarClientes() {
  var fichas  = {};
  var retiros = [];
  try { fichas  = JSON.parse(localStorage.getItem("pf_fichas")   || "{}"); } catch(e) {}
  try { retiros = JSON.parse(localStorage.getItem("pf_retiros")  || "[]"); } catch(e) {}

  var clientes = Object.keys(fichas).map(function(nombre) {
    var ficha    = fichas[nombre];
    var visitas  = ficha.visitas || [];
    var esKFC    = pfEsGrupoKFC ? pfEsGrupoKFC(nombre) : false;

    // Contar tipos
    var tipos = { mantenimiento:0, retiro:0, entrega:0, instalacion:0, cobro:0 };
    visitas.forEach(function(v){ if (tipos[v.tipo] !== undefined) tipos[v.tipo]++; });

    // Calcular score de rentabilidad (heurístico)
    // Mantenimiento = alta rentabilidad, cobro = señal de problema de pago
    var score = (tipos.mantenimiento * 3) + (tipos.entrega * 2) + (tipos.instalacion * 4) + (tipos.retiro * 1) - (tipos.cobro * 2);
    var frecuencia = visitas.length;

    // Clasificar
    var clase, color, ico;
    if (score >= 8 || frecuencia >= 6) {
      clase = "A — Alto valor"; color = "var(--v)"; ico = "⭐";
    } else if (score >= 4 || frecuencia >= 3) {
      clase = "B — Medio valor"; color = "var(--a)"; ico = "🔵";
    } else if (score >= 1) {
      clase = "C — Bajo valor";  color = "var(--n)"; ico = "🟡";
    } else {
      clase = "D — Sin datos";   color = "var(--g3)"; ico = "⬜";
    }

    // Último contacto
    var ultFecha = visitas.length > 0 ? visitas[0].fecha : null;

    return { nombre, score, frecuencia, clase, color, ico, tipos, esKFC, ultFecha };
  });

  // Ordenar por score desc
  clientes.sort(function(a,b){ return b.score - a.score; });
  return clientes;
}

function pfRenderRentabilidad() {
  var el = document.getElementById("pf-rent-contenido");
  if (!el) return;

  var clientes = pfClasificarClientes();
  if (!clientes.length) {
    el.innerHTML = '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Sin clientes registrados aún.<br>Se calculan automáticamente con cada visita.</div>';
    return;
  }

  // Resumen por clase
  var conteo = { A:0, B:0, C:0, D:0 };
  clientes.forEach(function(c){ conteo[c.clase.charAt(0)]++; });

  var h = "";
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;padding:0 12px 12px">';
  [["A","var(--v)","⭐"],["B","var(--a)","🔵"],["C","var(--n)","🟡"],["D","var(--g3)","⬜"]].forEach(function(x){
    h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:10px 6px;text-align:center">';
    h += '<div style="font-size:20px">'+x[2]+'</div>';
    h += '<div style="font-size:20px;font-weight:700;color:'+x[1]+'">'+conteo[x[0]]+'</div>';
    h += '<div style="font-size:10px;color:var(--g3)">Clase '+x[0]+'</div></div>';
  });
  h += '</div>';

  // Lista de clientes
  h += '<div class="slbl">Ranking de clientes</div>';
  clientes.forEach(function(c, i) {
    h += '<div style="margin:0 12px 6px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:10px 14px">';
    h += '<div style="display:flex;align-items:center;gap:10px">';
    h += '<div style="font-size:18px;flex-shrink:0">'+c.ico+'</div>';
    h += '<div style="flex:1;min-width:0">';
    h += '<div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+c.nombre+'</div>';
    h += '<div style="font-size:11px;color:var(--g4);margin-top:1px">'+(c.esKFC?"Grupo KFC · ":"")+(c.ultFecha?"Último: "+c.ultFecha:"Sin visitas")+'</div>';
    h += '</div>';
    h += '<div style="text-align:right;flex-shrink:0">';
    h += '<div style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:var(--g1);color:'+c.color+'">'+c.clase+'</div>';
    h += '<div style="font-size:11px;color:var(--g3);margin-top:2px">'+c.frecuencia+' visita(s)</div>';
    h += '</div></div>';
    // Mini barra de tipos
    var total = c.frecuencia || 1;
    h += '<div style="display:flex;gap:2px;margin-top:8px;height:4px;border-radius:2px;overflow:hidden">';
    var colTipo = { mantenimiento:"var(--a)", retiro:"var(--n)", entrega:"var(--v)", instalacion:"var(--r)", cobro:"var(--g3)" };
    Object.keys(c.tipos).forEach(function(tipo){
      var pct = Math.round(c.tipos[tipo]/total*100);
      if (pct > 0) h += '<div style="flex:'+pct+';background:'+colTipo[tipo]+'"></div>';
    });
    h += '</div>';
    h += '</div>';
  });
  h += '<div style="height:80px"></div>';
  el.innerHTML = h;
}

// ════════════════════════════════════════════════════════════
//  53 — CALENDARIO INTELIGENTE
//  Muestra qué locales tocan cada mes según frecuencia
// ════════════════════════════════════════════════════════════

function pfCalendarioMes(offsetMes) {
  offsetMes = offsetMes || 0;
  var fichas = {};
  try { fichas = JSON.parse(localStorage.getItem("pf_fichas") || "{}"); } catch(e) {}

  var hoy      = new Date();
  var año      = hoy.getFullYear();
  var mes      = hoy.getMonth() + offsetMes;
  while (mes > 11) { mes -= 12; año++; }
  while (mes < 0)  { mes += 12; año--; }

  var nombreMes = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][mes];
  var inicioMes = new Date(año, mes, 1);
  var finMes    = new Date(año, mes + 1, 0);

  var tocan = [];

  Object.keys(fichas).forEach(function(nombre) {
    var ficha   = fichas[nombre];
    var visitas = (ficha.visitas || []).filter(function(v){ return v.tipo === "mantenimiento" || v.tipo === "entrega"; });
    if (!visitas.length) return;

    var ultFecha = visitas[0].fecha;
    var proxFecha = pfProximoMantenimiento ? pfProximoMantenimiento(nombre, ultFecha) : null;
    if (!proxFecha) return;

    // Verificar si la próxima fecha cae en el mes objetivo
    if (proxFecha >= inicioMes && proxFecha <= finMes) {
      tocan.push({
        nombre:    nombre,
        proxFecha: proxFecha,
        dias:      Math.round((proxFecha - new Date()) / 86400000),
        esKFC:     pfEsGrupoKFC ? pfEsGrupoKFC(nombre) : false
      });
    }
  });

  tocan.sort(function(a,b){ return a.proxFecha - b.proxFecha; });
  return { nombreMes, año, tocan, offsetMes };
}

var PF_CAL_OFFSET = 0;

function pfRenderCalendario() {
  var el = document.getElementById("pf-cal-contenido");
  if (!el) return;

  var cal = pfCalendarioMes(PF_CAL_OFFSET);
  var h   = "";

  // Navegación de meses
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:0 12px 12px">';
  h += '<button onclick="PF_CAL_OFFSET--;pfRenderCalendario()" style="padding:8px 16px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:16px;cursor:pointer">‹</button>';
  h += '<div style="text-align:center"><div style="font-size:16px;font-weight:700;color:var(--ng)">'+cal.nombreMes+' '+cal.año+'</div>';
  h += '<div style="font-size:12px;color:var(--g3)">'+cal.tocan.length+' local(es) por atender</div></div>';
  h += '<button onclick="PF_CAL_OFFSET++;pfRenderCalendario()" style="padding:8px 16px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:16px;cursor:pointer">›</button>';
  h += '</div>';

  if (!cal.tocan.length) {
    h += '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">No hay locales programados para '+cal.nombreMes+'.<br>Los locales aparecen según su frecuencia de mantenimiento.</div>';
  } else {
    cal.tocan.forEach(function(item) {
      var dias    = item.dias;
      var urgente = dias < 0;
      var pronto  = dias >= 0 && dias <= 14;
      var bg  = urgente ? "var(--rc)"  : pronto ? "var(--nc)"  : "#fff";
      var bor = urgente ? "var(--r)"   : pronto ? "var(--n)"   : "var(--bo)";
      var ico = urgente ? "🔴" : pronto ? "🟡" : "🟢";
      var fechaStr = item.proxFecha.toLocaleDateString("es-EC",{day:"2-digit",month:"short"});

      h += '<div style="margin:0 12px 8px;background:'+bg+';border-radius:12px;border:1.5px solid '+bor+';padding:11px 14px;display:flex;align-items:center;gap:10px">';
      h += '<div style="font-size:20px">'+ico+'</div>';
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+item.nombre+'</div>';
      h += '<div style="font-size:11px;color:var(--g4);margin-top:1px">'+(item.esKFC?"Grupo KFC":"Independiente")+'</div>';
      h += '</div>';
      h += '<div style="text-align:right;flex-shrink:0">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--ng)">'+fechaStr+'</div>';
      h += '<div style="font-size:11px;color:var(--g3)">'+(urgente?"Vencido "+Math.abs(dias)+"d":dias===0?"Hoy":dias+"d")+'</div>';
      h += '</div></div>';
    });
  }
  h += '<div style="height:80px"></div>';
  el.innerHTML = h;
}

// ════════════════════════════════════════════════════════════
//  68 — ANÁLISIS DE RENTABILIDAD CON IA (Claude API)
// ════════════════════════════════════════════════════════════

var PF_IA_CARGANDO = false;

function pfAnalisisIA() {
  if (PF_IA_CARGANDO) return;

  var el = document.getElementById("pf-ia-resultado");
  if (!el) return;

  // Preparar datos para enviar a Claude
  var clientes  = pfClasificarClientes();
  var retiros   = [];
  try { retiros = JSON.parse(localStorage.getItem("pf_retiros") || "[]"); } catch(e) {}

  var resumen = clientes.slice(0, 20).map(function(c) {
    return c.nombre + " | Clase: " + c.clase + " | Visitas: " + c.frecuencia +
      " | Mant: " + c.tipos.mantenimiento + " | Ret: " + c.tipos.retiro +
      " | KFC: " + (c.esKFC ? "Sí" : "No");
  }).join("\n");

  var retirosPend = retiros.filter(function(r){ return r.estado === "pendiente"; }).length;

  var prompt =
    "Eres un asesor de negocios para PREVIFUEGO, empresa de mantenimiento de extintores en Guayaquil, Ecuador.\n\n" +
    "Datos de clientes (top 20 por actividad):\n" + resumen + "\n\n" +
    "Retiros pendientes de entrega: " + retirosPend + "\n\n" +
    "Analiza estos datos y dame:\n" +
    "1. Los 3 clientes más rentables y por qué\n" +
    "2. Los 3 clientes que necesitan más atención\n" +
    "3. Una recomendación concreta para mejorar la rentabilidad este mes\n" +
    "4. Alerta si hay algo urgente\n\n" +
    "Responde en español, de forma directa y práctica. Máximo 300 palabras.";

  PF_IA_CARGANDO = true;
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--g3)"><div style="font-size:24px;margin-bottom:8px">🤖</div>Analizando datos con IA...</div>';

  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages:   [{ role:"user", content: prompt }]
    })
  })
  .then(function(r){ return r.json(); })
  .then(function(data) {
    PF_IA_CARGANDO = false;
    var txt = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : "Sin respuesta de la IA.";
    // Formatear respuesta
    var html = txt
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p style="margin-bottom:8px">')
      .replace(/\n/g, '<br>');
    el.innerHTML =
      '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:14px;font-size:13px;line-height:1.6;color:var(--ng)">' +
      '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🤖 Análisis IA — '+new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"})+'</div>' +
      '<p style="margin-bottom:8px">' + html + '</p></div>';
  })
  .catch(function(err) {
    PF_IA_CARGANDO = false;
    el.innerHTML = '<div style="padding:14px;background:var(--rc);border-radius:12px;color:var(--r);font-size:13px">Error al conectar con la IA: '+err.message+'</div>';
  });
}

// ── INYECTAR TABS EN ADMIN ────────────────────────────────────
function pfInyectarInteligencia() {
  var tabBar = document.querySelector(".adm-tab");
  var admScr = document.getElementById("sadmin");
  if (!tabBar || !admScr) return;

  var tabs = [
    { id:"adm-t8", pid:"adm-p8", label:"⭐ Rent.", n:8,
      html:'<div style="padding:12px 0"><div class="slbl">Clasificación por rentabilidad</div><div id="pf-rent-contenido"></div></div>' },
    { id:"adm-t9", pid:"adm-p9", label:"📅 Cal.", n:9,
      html:'<div style="padding:12px 0"><div class="slbl">Calendario inteligente</div><div style="padding:0 0 12px" id="pf-cal-nav"></div><div id="pf-cal-contenido"></div></div>' },
    { id:"adm-t10", pid:"adm-p10", label:"🤖 IA", n:10,
      html:'<div style="padding:12px 0"><div class="slbl">Análisis con IA</div><div style="margin:0 12px 12px"><button onclick="pfAnalisisIA()" style="width:100%;padding:14px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">🤖 Analizar rentabilidad con IA</button></div><div id="pf-ia-resultado"><div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Toca el botón para analizar tus datos con inteligencia artificial.</div></div><div style="height:80px"></div></div>' }
  ];

  tabs.forEach(function(t) {
    if (document.getElementById(t.id)) return;
    var btn = document.createElement("button");
    btn.id = t.id; btn.className = "adm-tab-btn";
    btn.textContent = t.label;
    btn.onclick = (function(n){ return function(){ pfAdmTabN(n); }; })(t.n);
    tabBar.appendChild(btn);

    var sc = admScr.querySelector(".sc");
    var panel = document.createElement("div");
    panel.id = t.pid; panel.className = "adm-panel";
    panel.innerHTML = t.html;
    if (sc) sc.appendChild(panel); else admScr.appendChild(panel);
  });
}

function pfAdmTabN(n) {
  for (var i = 1; i <= 10; i++) {
    var b = document.getElementById("adm-t"+i);
    var p = document.getElementById("adm-p"+i);
    if (b) b.className = "adm-tab-btn" + (i===n?" on":"");
    if (p) p.className = "adm-panel"   + (i===n?" on":"");
  }
  if (n === 8)  pfRenderRentabilidad();
  if (n === 9)  { PF_CAL_OFFSET = 0; pfRenderCalendario(); }
  if (n === 10) {} // solo muestra el botón
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener("load", function() {
  pfInyectarInteligencia();

  var _prev = window.admTab;
  window.admTab = function(n) {
    if (n >= 8 && n <= 10) pfAdmTabN(n);
    else {
      _prev(n);
      for (var i = 8; i <= 10; i++) {
        var b = document.getElementById("adm-t"+i);
        var p = document.getElementById("adm-p"+i);
        if (b) b.className = "adm-tab-btn";
        if (p) p.className = "adm-panel";
      }
    }
  };
});
