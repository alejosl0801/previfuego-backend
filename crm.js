
// ── HELPER: escapar nombre para uso en onclick HTML ──────────
function pfEscNom(nombre) {
  return (nombre||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/"/g,"&quot;");
}
// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — crm.js  v1.0
//  44 — CRM básico: notas y contactos por cliente
//  52 — Reporte de productividad por técnico
// ═══════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
//  44 — CRM BÁSICO
//  Notas, contactos e historial de comunicaciones por local
// ════════════════════════════════════════════════════════════

function pfGetCRM() {
  try { return JSON.parse(localStorage.getItem("pf_crm") || "{}"); } catch(e) { return {}; }
}
function pfSaveCRM(obj) { localStorage.setItem("pf_crm", JSON.stringify(obj)); }

function pfGetCRMLocal(nombreLocal) {
  var crm = pfGetCRM();
  if (!crm[nombreLocal]) crm[nombreLocal] = { contactos:[], notas:[] };
  return crm[nombreLocal];
}

function pfGuardarNota(nombreLocal, nota, tipo) {
  var crm   = pfGetCRM();
  if (!crm[nombreLocal]) crm[nombreLocal] = { contactos:[], notas:[] };
  crm[nombreLocal].notas.unshift({
    fecha:   fechaHoy(),
    hora:    new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}),
    tipo:    tipo || "nota",
    texto:   nota,
    usuario: typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "—"
  });
  pfSaveCRM(crm);
  // Sincronizar con Sheets si hay conexión
  if (typeof SCRIPT_URL !== "undefined") {
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        accion:"guardar_crm", local:nombreLocal, tipo:tipo||"nota",
        nota:nota, usuario: typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "—"
      })
    }).catch(function(){});
  }
}

function pfGuardarContacto(nombreLocal, contacto) {
  var crm = pfGetCRM();
  if (!crm[nombreLocal]) crm[nombreLocal] = { contactos:[], notas:[] };
  crm[nombreLocal].contactos.push(contacto);
  pfSaveCRM(crm);
}

// ── MODAL CRM ─────────────────────────────────────────────────
function pfAbrirCRM(nombreLocal) {
  var data = pfGetCRMLocal(nombreLocal);
  var tipoOpts = [
    {v:"nota",      l:"📝 Nota general"},
    {v:"llamada",   l:"📞 Llamada"},
    {v:"visita",    l:"🤝 Visita comercial"},
    {v:"problema",  l:"⚠ Problema reportado"},
    {v:"pago",      l:"💰 Seguimiento pago"}
  ];

  var h = "";

  // Header
  h += '<div style="background:var(--a);padding:16px 14px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10">';
  h += '<div><div style="font-size:18px;font-weight:700;color:#fff">CRM — '+nombreLocal+'</div>';
  h += '<div style="font-size:12px;color:rgba(255,255,255,.75);margin-top:2px">'+data.notas.length+' nota(s) · '+data.contactos.length+' contacto(s)</div></div>';
  h += '<button onclick="pfCerrarCRM()" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:24px;width:38px;height:38px;border-radius:10px;cursor:pointer;line-height:1">✕</button>';
  h += '</div>';

  // Nueva nota
  h += '<div style="margin:12px 12px 0;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 14px">';
  h += '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Nueva nota</div>';
  h += '<select id="crm-tipo" style="width:100%;margin-bottom:8px;padding:8px 10px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:13px">';
  tipoOpts.forEach(function(o){ h += '<option value="'+o.v+'">'+o.l+'</option>'; });
  h += '</select>';
  h += '<textarea id="crm-nota-txt" maxlength="2000" placeholder="Escribe una nota sobre este cliente..." style="width:100%;height:80px;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:13px;resize:none;margin-bottom:8px"></textarea>';
  h += '<button onclick="pfEnviarNota(\''+pfEscNom(nombreLocal)+'\')" style="width:100%;padding:12px;border-radius:10px;border:none;background:var(--a);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">💾 Guardar nota</button>';
  h += '</div>';

  // Contactos
  h += '<div style="margin:12px 12px 0;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 14px">';
  h += '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Contactos</div>';
  if (data.contactos.length === 0) {
    h += '<div style="font-size:13px;color:var(--g3);margin-bottom:8px">Sin contactos registrados.</div>';
  } else {
    data.contactos.forEach(function(c) {
      h += '<div style="padding:8px 0;border-bottom:1px solid var(--bo)">';
      h += '<div style="font-size:14px;font-weight:700">'+c.nombre+'</div>';
      if (c.cargo)    h += '<div style="font-size:12px;color:var(--g4)">'+c.cargo+'</div>';
      if (c.telefono) h += '<div style="font-size:12px;color:var(--a)">📞 '+c.telefono+'</div>';
      if (c.email)    h += '<div style="font-size:12px;color:var(--a)">✉ '+c.email+'</div>';
      h += '</div>';
    });
  }
  h += '<div style="margin-top:8px">';
  h += '<input id="crm-cont-nom" placeholder="Nombre" style="width:100%;padding:8px 10px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px;margin-bottom:6px">';
  h += '<input id="crm-cont-cargo" placeholder="Cargo (opcional)" style="width:100%;padding:8px 10px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px;margin-bottom:6px">';
  h += '<input id="crm-cont-tel" placeholder="Teléfono" style="width:100%;padding:8px 10px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px;margin-bottom:6px">';
  h += '<input id="crm-cont-email" placeholder="Email" style="width:100%;padding:8px 10px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px;margin-bottom:6px">';
  h += '<button onclick="pfGuardarContactoUI(\''+pfEscNom(nombreLocal)+'\')" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--bo);background:var(--g1);color:var(--ng);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">+ Agregar contacto</button>';
  h += '</div></div>';

  // Historial de notas con búsqueda
  h += '<div class="slbl">Historial ('+data.notas.length+')</div>';
  h += '<div style="padding:0 12px 8px"><input id="crm-search-notas" type="search" placeholder="🔍 Buscar en notas..." oninput="pfFiltrarNotasCRM(\''+pfEscNom(nombreLocal)+'\',this.value)" style="width:100%;padding:8px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:13px;box-sizing:border-box"></div>';
  if (data.notas.length === 0) {
    h += '<div style="padding:16px;text-align:center;color:var(--g3);font-size:14px">Sin notas aún.</div>';
  } else {
    var tipoIco = { nota:"📝", llamada:"📞", visita:"🤝", problema:"⚠", pago:"💰" };
    var tipoCol = { nota:"var(--a)", llamada:"var(--v)", visita:"var(--n)", problema:"var(--r)", pago:"var(--v)" };
    // Mostrar máximo 15, el resto colapsado
    var notasMostrar = data.notas.slice(0, 15);
    h += '<div id="crm-notas-lista">';
    notasMostrar.forEach(function(n) {
      var ico = tipoIco[n.tipo] || "📝";
      var col = tipoCol[n.tipo] || "var(--a)";
      h += '<div class="crm-nota-item" data-texto="'+(n.texto||"").toLowerCase().replace(/"/g,"&quot;")+'" style="margin:0 12px 8px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:11px 14px">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">';
      h += '<div style="font-size:13px;font-weight:700;color:'+col+'">'+ico+' '+n.tipo+'</div>';
      h += '<div style="font-size:11px;color:var(--g3)">'+n.fecha+' '+n.hora+'</div></div>';
      h += '<div style="font-size:13px;color:var(--ng);line-height:1.5">'+n.texto+'</div>';
      h += '<div style="font-size:11px;color:var(--g4);margin-top:4px">'+n.usuario+'</div>';
      h += '</div>';
    });
    h += '</div>';
    if (data.notas.length > 15) {
      h += '<div style="padding:0 12px 12px;text-align:center"><button onclick="pfVerTodasNotas(\''+pfEscNom(nombreLocal)+'\')" style="padding:8px 20px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:13px;font-weight:700;color:var(--a);cursor:pointer;font-family:inherit">Ver todas ('+data.notas.length+')</button></div>';
    }
  }
  h += '<div style="height:80px"></div>';

  var modal = document.getElementById("pf-crm-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "pf-crm-modal";
    modal.style.cssText = "position:fixed;inset:0;background:var(--g1);z-index:510;overflow-y:auto;display:none;padding-bottom:80px"; // #067 FIX: z-index > modal Azur (500)
    document.body.appendChild(modal);
  }
  modal.innerHTML = h;
  modal.style.display = "block";
  modal.scrollTop = 0;
}

function pfEnviarNota(nombreLocal) {
  var txt  = document.getElementById("crm-nota-txt");
  var tipo = document.getElementById("crm-tipo");
  if (!txt || !txt.value.trim() || txt.value.trim().length < 3) { pfModal("La nota debe tener al menos 3 caracteres."); return; } // #069 FIX
  pfGuardarNota(nombreLocal, txt.value.trim(), tipo ? tipo.value : "nota");
  txt.value = "";
  pfAbrirCRM(nombreLocal); // refrescar
}

function pfGuardarContactoUI(nombreLocal) {
  var nom   = document.getElementById("crm-cont-nom");
  var cargo = document.getElementById("crm-cont-cargo");
  var tel   = document.getElementById("crm-cont-tel");
  var email = document.getElementById("crm-cont-email");
  if (!nom || !nom.value.trim() || nom.value.trim().length < 2) { pfModal("Ingresa el nombre del contacto (mínimo 2 caracteres)."); return; } // #070 FIX
  pfGuardarContacto(nombreLocal, {
    nombre:   nom.value.trim(),
    cargo:    cargo ? cargo.value.trim() : "",
    telefono: tel   ? tel.value.trim()   : "",
    email:    email ? email.value.trim()  : ""
  });
  pfAbrirCRM(nombreLocal);
}

function pfCerrarCRM() {
  var modal = document.getElementById("pf-crm-modal");
  if (!modal) return;
  // #ALTO FIX: limpiar innerHTML para liberar event listeners y evitar memory leak
  modal.innerHTML = "";
  modal.style.display = "none";
}

// pfAbrirFicha se parchea en coordinator.js para agregar el botón CRM — no duplicar aquí

// ════════════════════════════════════════════════════════════
//  52 — REPORTE DE PRODUCTIVIDAD POR TÉCNICO
//  Panel detallado en el dashboard
// ════════════════════════════════════════════════════════════

function pfRenderProductividad() {
  var el = document.getElementById("pf-prod-contenido");
  if (!el) return;

  var fichas = {};
  try { fichas = JSON.parse(localStorage.getItem("pf_fichas") || "{}"); } catch(e) {}

  // Agrupar visitas por técnico y mes
  var porTecnico = {};
  var meses = {};

  Object.keys(fichas).forEach(function(local) {
    (fichas[local].visitas || []).forEach(function(v) {
      var tec = v.tecnico || "Desconocido";
      var mes = v.fecha ? v.fecha.split("/").slice(1).join("/") : "?";
      if (!porTecnico[tec]) porTecnico[tec] = { visitas:[], tiempos:[], tipos:{} };
      porTecnico[tec].visitas.push(v);
      if (!porTecnico[tec].tipos[v.tipo]) porTecnico[tec].tipos[v.tipo] = 0;
      porTecnico[tec].tipos[v.tipo]++;
      meses[mes] = true;
    });
  });

  var tecnicos = Object.keys(porTecnico);
  if (!tecnicos.length) {
    el.innerHTML = '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Sin datos de productividad aún.<br>Se registran automáticamente con cada visita.</div>';
    return;
  }

  var tipoLabel = { mantenimiento:"🔧 Mant.", retiro:"📦 Retiro", entrega:"🚚 Entrega", instalacion:"🔩 Inst.", cobro:"💰 Cobro", otro:"📋 Otro" };
  var cols = ["var(--r)","var(--a)","var(--v)","var(--n)"];
  var h = "";

  tecnicos.sort(function(a,b){ return porTecnico[b].visitas.length - porTecnico[a].visitas.length; });

  tecnicos.forEach(function(tec, idx) {
    var data  = porTecnico[tec];
    var total = data.visitas.length;
    var col   = cols[idx % cols.length];
    var ini   = tec.charAt(0).toUpperCase();

    h += '<div style="margin:0 12px 12px;background:#fff;border-radius:14px;border:1.5px solid var(--bo);overflow:hidden">';

    // Header técnico
    h += '<div style="padding:12px 14px;background:'+col+';display:flex;align-items:center;gap:10px">';
    h += '<div style="width:36px;height:36px;border-radius:11px;background:rgba(255,255,255,.25);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0">'+ini+'</div>';
    h += '<div style="flex:1"><div style="font-size:16px;font-weight:700;color:#fff">'+tec+'</div>';
    h += '<div style="font-size:12px;color:rgba(255,255,255,.8)">'+total+' visitas totales registradas</div></div></div>';

    // Stats por tipo
    h += '<div style="padding:12px 14px">';
    // Comparativo mes actual vs anterior
    var _raw = new Date();
    var _ec  = new Date(_raw.toLocaleString("en-US",{timeZone:"America/Guayaquil"}));
    var _mm  = String(_ec.getMonth()+1).padStart(2,"0");
    var _yy  = String(_ec.getFullYear());
    var _mmAnt = _ec.getMonth() === 0 ? "12" : String(_ec.getMonth()).padStart(2,"0");
    var _yyAnt = _ec.getMonth() === 0 ? String(_ec.getFullYear()-1) : _yy;
    var visitasMes    = data.visitas.filter(function(v){ var p=(v.fecha||"").split("/"); return p.length>=3 && p[1]===_mm && p[2]===_yy; }).length;
    var visitasAnt    = data.visitas.filter(function(v){ var p=(v.fecha||"").split("/"); return p.length>=3 && p[1]===_mmAnt && p[2]===_yyAnt; }).length;
    var diff          = visitasMes - visitasAnt;
    var diffTxt       = diff > 0 ? ("↑ +" + diff + " vs mes anterior") : diff < 0 ? ("↓ " + diff + " vs mes anterior") : "= igual que mes anterior";
    var diffCol       = diff > 0 ? "var(--v)" : diff < 0 ? "var(--r)" : "var(--g3)";
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    h += '<div><div style="font-size:22px;font-weight:700;color:'+col+'">'+visitasMes+'</div><div style="font-size:11px;color:var(--g3)">visitas este mes</div></div>';
    h += '<div style="text-align:right"><div style="font-size:13px;font-weight:700;color:'+diffCol+'">'+diffTxt+'</div><div style="font-size:11px;color:var(--g3)">'+visitasAnt+' el mes pasado</div></div>';
    h += '</div>';
    h += '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Por tipo de trabajo</div>';
    Object.keys(data.tipos).forEach(function(tipo) {
      var cnt = data.tipos[tipo];
      var pct = Math.round(cnt / total * 100);
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
      h += '<div style="font-size:12px;color:var(--g4);width:80px;flex-shrink:0">'+(tipoLabel[tipo]||tipo)+'</div>';
      h += '<div style="flex:1;height:6px;background:var(--g2);border-radius:3px;overflow:hidden">';
      h += '<div style="height:100%;width:'+pct+'%;background:'+col+';border-radius:3px"></div></div>';
      h += '<div style="font-size:12px;font-weight:700;color:var(--ng);width:30px;text-align:right">'+cnt+'</div>';
      h += '</div>';
    });

    // Últimas visitas
    var ultimas = data.visitas.slice().sort(function(a,b){ return (b.fecha+b.hora).localeCompare(a.fecha+a.hora); }).slice(0,3);
    h += '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin:10px 0 6px">Últimas visitas</div>';
    ultimas.forEach(function(v) {
      h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-top:1px solid var(--bo)">';
      h += '<div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%">'+(v.punto || v.nota || "—")+'</div>';
      h += '<div style="font-size:11px;color:var(--g3)">'+v.fecha+'</div></div>';
    });

    h += '</div></div>';
  });

  el.innerHTML = h;
}

// Inyectar tab Productividad en admin
function pfInyectarProductividad() {
  var tabBar = document.querySelector(".adm-tab");
  var admScr = document.getElementById("sadmin");
  if (!tabBar || !admScr) return;
  if (document.getElementById("adm-t7")) return;

  var btn = document.createElement("button");
  btn.id = "adm-t7"; btn.className = "adm-tab-btn";
  btn.textContent = "👷 Prod.";
  btn.onclick = function(){ admTab(7); };
  tabBar.appendChild(btn);

  var panel = document.createElement("div");
  panel.id = "adm-p7"; panel.className = "adm-panel";
  panel.innerHTML = '<div style="padding:12px 0"><div class="slbl">Productividad por técnico</div><div id="pf-prod-contenido"></div><div style="height:80px"></div></div>';
  admScr.appendChild(panel);
}

// pfAdmTab7 manejado por coordinator.js — no duplicar


// #067 #068 FIX: helpers para refrescar solo secciones del CRM
function pfEliminarNotaCRM(nombreLocal, idx) {
  pfConfirm("¿Eliminar esta nota?", function() {
    var crm = pfGetCRM();
    if (crm[nombreLocal] && crm[nombreLocal].notas) {
      crm[nombreLocal].notas.splice(idx, 1);
      pfSaveCRM(crm);
      var el = document.getElementById("pf-crm-notas");
      if (el) pfRenderNotasCRM(nombreLocal, el);
    }
  });
}

function pfIniciarEdicionNota(nombreLocal, idx) {
  var crm = pfGetCRM();
  if (crm[nombreLocal] && crm[nombreLocal].notas[idx]) {
    crm[nombreLocal].notas[idx]._editando = true;
    pfSaveCRM(crm);
    var el = document.getElementById("pf-crm-notas");
    if (el) pfRenderNotasCRM(nombreLocal, el);
  }
}

function pfCancelarEdicionNota(nombreLocal, idx) {
  var crm = pfGetCRM();
  if (crm[nombreLocal] && crm[nombreLocal].notas[idx]) {
    delete crm[nombreLocal].notas[idx]._editando;
    pfSaveCRM(crm);
    var el = document.getElementById("pf-crm-notas");
    if (el) pfRenderNotasCRM(nombreLocal, el);
  }
}

function pfGuardarEdicionNota(nombreLocal, idx) {
  var inp = document.getElementById("crm-edit-" + idx);
  if (!inp || !inp.value.trim() || inp.value.trim().length < 3) { pfModal("La nota debe tener al menos 3 caracteres."); return; }
  var crm = pfGetCRM();
  if (crm[nombreLocal] && crm[nombreLocal].notas[idx]) {
    crm[nombreLocal].notas[idx].texto = inp.value.trim();
    delete crm[nombreLocal].notas[idx]._editando;
    pfSaveCRM(crm);
    var el = document.getElementById("pf-crm-notas");
    if (el) pfRenderNotasCRM(nombreLocal, el);
  }
}

function pfRenderNotasCRM(nombreLocal, el) {
  if (!el) return;
  var crm = pfGetCRM();
  var data = crm[nombreLocal] || { notas:[], contactos:[] };
  var h = "";
  if (data.notas.length === 0) {
    h = '<div style="padding:16px;text-align:center;color:var(--g3);font-size:14px">Sin notas aún.</div>';
  } else {
    data.notas.slice(0, 20).forEach(function(n, idx_nota) {
      h += '<div style="background:var(--g1);border-radius:10px;padding:10px 12px;margin-bottom:6px">';
      if (n._editando) {
        h += '<textarea id="crm-edit-'+idx_nota+'" style="width:100%;height:60px;padding:6px 8px;border:1.5px solid var(--a);border-radius:8px;font-family:inherit;font-size:13px;resize:none;margin-bottom:6px">'+n.texto+'</textarea>';
        h += '<div style="display:flex;gap:6px">';
        h += '<button data-idx="'+idx_nota+'" data-local="'+(nombreLocal||"").replace(/"/g,"&quot;")+'" onclick="pfGuardarEdicionNota(this.dataset.local,parseInt(this.dataset.idx))" style="flex:1;padding:6px;border-radius:8px;border:none;background:var(--a);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">💾 Guardar</button>';
        h += '<button data-idx="'+idx_nota+'" data-local="'+(nombreLocal||"").replace(/"/g,"&quot;")+'" onclick="pfCancelarEdicionNota(this.dataset.local,parseInt(this.dataset.idx))" style="flex:1;padding:6px;border-radius:8px;border:1.5px solid var(--bo);background:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Cancelar</button>';
        h += '</div>';
      } else {
        h += '<div style="font-size:13px;color:var(--ng);line-height:1.5">'+n.texto+'</div>';
        // #064 FIX: usar idx_nota (parámetro del forEach) en lugar de indexOf
        h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">';
        h += '<div style="font-size:11px;color:var(--g3)">'+n.fecha+' · '+n.usuario+'</div>';
        h += '<div style="display:flex;gap:4px">';
        h += '<button data-idx="'+idx_nota+'" data-local="'+(nombreLocal||"").replace(/"/g,"&quot;")+'" onclick="pfIniciarEdicionNota(this.dataset.local,parseInt(this.dataset.idx))" style="font-size:10px;color:var(--a);background:none;border:none;cursor:pointer;padding:2px 6px">✏️</button>';
        h += '<button data-idx="'+idx_nota+'" data-local="'+(nombreLocal||"").replace(/"/g,"&quot;")+'" onclick="pfEliminarNotaCRM(this.dataset.local,parseInt(this.dataset.idx))" style="font-size:10px;color:var(--r);background:none;border:none;cursor:pointer;padding:2px 6px">🗑</button>';
        h += '</div></div>';
      }
      h += '</div>';
    });
  }
  el.innerHTML = h;
}

function pfRenderContactosCRM(nombreLocal, el) {
  if (!el) return;
  var crm = pfGetCRM();
  var data = crm[nombreLocal] || { notas:[], contactos:[] };
  var h = "";
  if (data.contactos.length === 0) {
    h = '<div style="font-size:13px;color:var(--g3);margin-bottom:8px">Sin contactos registrados.</div>';
  } else {
    data.contactos.forEach(function(c) {
      h += '<div style="background:var(--g1);border-radius:10px;padding:10px 12px;margin-bottom:6px">';
      h += '<div style="font-size:14px;font-weight:700;color:var(--ng)">'+c.nombre+'</div>';
      if (c.telefono) h += '<div style="font-size:12px;color:var(--g4)">'+c.telefono+'</div>';
      if (c.email)    h += '<div style="font-size:12px;color:var(--g4)">'+c.email+'</div>';
      h += '</div>';
    });
  }
  el.innerHTML = h;
}

function pfFiltrarNotasCRM(nombreLocal, q) {
  var items = document.querySelectorAll(".crm-nota-item");
  var qLow = (q||"").toLowerCase().trim();
  items.forEach(function(el){
    var texto = el.getAttribute("data-texto") || "";
    el.style.display = !qLow || texto.indexOf(qLow) !== -1 ? "" : "none";
  });
}

function pfVerTodasNotas(nombreLocal) {
  var crm  = pfGetCRM();
  var data = crm[nombreLocal] || { notas:[] };
  var lista = document.getElementById("crm-notas-lista");
  if (!lista) return;
  var tipoIco = { nota:"📝", llamada:"📞", visita:"🤝", problema:"⚠", pago:"💰" };
  var tipoCol = { nota:"var(--a)", llamada:"var(--v)", visita:"var(--n)", problema:"var(--r)", pago:"var(--v)" };
  var h = "";
  data.notas.forEach(function(n) {
    var ico = tipoIco[n.tipo] || "📝";
    var col = tipoCol[n.tipo] || "var(--a)";
    h += '<div class="crm-nota-item" data-texto="'+(n.texto||"").toLowerCase().replace(/"/g,"&quot;")+'" style="margin:0 0 8px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:11px 14px">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">';
    h += '<div style="font-size:13px;font-weight:700;color:'+col+'">'+ico+' '+n.tipo+'</div>';
    h += '<div style="font-size:11px;color:var(--g3)">'+n.fecha+' '+n.hora+'</div></div>';
    h += '<div style="font-size:13px;color:var(--ng);line-height:1.5">'+n.texto+'</div>';
    h += '<div style="font-size:11px;color:var(--g4);margin-top:4px">'+n.usuario+'</div>';
    h += '</div>';
  });
  lista.innerHTML = h;
  // Ocultar botón ver todas
  var btn = lista.nextElementSibling;
  if (btn) btn.style.display = "none";
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener("load", function() {
  pfInyectarProductividad();

  // Parchear admTab para tabs 7
  // Tab 7 manejado por coordinator.js
});
