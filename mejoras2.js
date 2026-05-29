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

var PF_GRUPO_KFC = ["INT FOOD","SHEMLON","DELI INT","PROMOTORA","NOVOEVENTOS","SUSHICORP","KFC","GUS","CAJUN","MENESTRAS","AMERICAN DELI","BASKIN","CINNABON","JUAN VALDEZ","NOVOCENTRO","KOBE","NOE",
  "CASA RES","ILCAPPO","ESPAÑOL","DOLCE","CAFA","TROPIBURGER","HELADERIAS",
  // Casa Res (SHEMLON) — códigos R (R00x con cero o sin cero)
  "R001","R002","R003","R004","R005","R006","R007","R008","R009","R010","R011","R012",
  "R01","R02","R03","R04","R05","R06","R07","R08","R09","R10","R11","R12",
  // #108 FIX: SAN MARINO es Grupo KFC (Casa Res)
  "SAN MARINO"];

// #82 FIX: usar Set para búsqueda eficiente + cache del resultado
var _PF_KFC_SET = null;
function pfEsGrupoKFC(nombreLocal) {
  // #053 FIX: cache como array, búsqueda con some() más legible
  if (!_PF_KFC_SET) _PF_KFC_SET = PF_GRUPO_KFC;
  var n = (nombreLocal || "").toUpperCase();
  return _PF_KFC_SET.some(function(k){ return n.indexOf(k) !== -1; });
}

// ════════════════════════════════════════════════════════════
//  LÓGICA DE RECARGA — ciclo global Grupo KFC / Sushicorp
//  Recarga global: Oct 2024–Sep 2025 → próxima Oct 2026–Sep 2027 → cada 3 años
//  Meses OCT/NOV/DIC → recarga en año base (2026, 2029...)
//  Meses ENE–SEP    → recarga en año base +1 (2027, 2030...)
//  Excepción Casa Res (SHEMLON, código R): ciclo propio en MAYO
//   - R003,R008,R010 → recarga May 2026 → May 2029, 2032...
//   - R004           → recarga May 2025 → May 2028, 2031...
// ════════════════════════════════════════════════════════════

// Año base del último ciclo de recarga global KFC (el que arrancó Oct 2024)
var PF_RECARGA_BASE = 2024;        // Oct 2024 – Sep 2025
var PF_RECARGA_CICLO = 3;          // cada 3 años

var _PF_MESES_KEY = {"ENERO":0,"FEBRERO":1,"MARZO":2,"ABRIL":3,"MAYO":4,"JUNIO":5,
  "JULIO":6,"AGOSTO":7,"SEPTIEMBRE":8,"OCTUBRE":9,"NOVIEMBRE":10,"DICIEMBRE":11};

// Devuelve el índice de mes (0-11) del local, o null
function pfMesLocal(cli) {
  if (!cli || !cli.mes) return null;
  var k = cli.mes.toUpperCase().trim();
  return (_PF_MESES_KEY[k] !== undefined) ? _PF_MESES_KEY[k] : null;
}

// ¿Es Casa Res? (SHEMLON, código que empieza con R)
function pfEsCasaRes(cli) {
  if (!cli) return false;
  var cod = (cli.codigo||"").toUpperCase();
  var raz = (cli.razon||"").toUpperCase();
  return /^R\d/.test(cod) || raz.indexOf("SHEMLON") !== -1;
}

// Devuelve el año calendario en que a este local le toca la PRÓXIMA recarga.
// Si el local no es KFC/Sushicorp/CasaRes (independiente) → usa freqRec propio (no maneja ciclo global).
function pfAnioProximaRecarga(cli, mesIdx) {
  if (!cli) return null;
  // Casa Res — ciclo propio en MAYO
  if (pfEsCasaRes(cli)) {
    var cod = (cli.codigo||"").toUpperCase().replace(/^R0*/,"R"); // normaliza R003→R3
    var baseR;
    if (cod === "R4") baseR = 2025;          // R004 recargó May 2025
    else baseR = 2026;                       // R003,R008,R010 (y resto Casa Res) recargaron May 2026
    var anio = baseR;
    var hoyA = new Date().getFullYear();
    while (anio < hoyA || (anio === hoyA && (new Date().getMonth() > 4))) anio += PF_RECARGA_CICLO;
    return anio;
  }
  // KFC / Sushicorp — ciclo global Oct–Sep
  if (mesIdx === null) return null;
  // En la ventana Oct(base+2)–Sep(base+3): meses OCT/NOV/DIC caen en base+2, ENE–SEP en base+3
  var ciclo = PF_RECARGA_BASE; // 2024
  function anioVisitaEnCiclo(c) {
    return (mesIdx >= 9) ? (c + 2) : (c + 3); // Oct/Nov/Dic → +2, resto → +3
  }
  var anioRec = anioVisitaEnCiclo(ciclo);
  var hoy = new Date();
  // avanzar ciclos de 3 años hasta que la recarga sea futura (o este mismo año si aún no pasó el mes)
  while (anioRec < hoy.getFullYear() || (anioRec === hoy.getFullYear() && mesIdx < hoy.getMonth())) {
    ciclo += PF_RECARGA_CICLO;
    anioRec = anioVisitaEnCiclo(ciclo);
  }
  return anioRec;
}

// ¿A este local le toca RECARGA en su próxima visita (este ciclo)?
// true → va al semáforo Recarga+Mant ; false → va al semáforo Mantenimiento
function pfTocaRecargaEsteCiclo(cli, mesIdx) {
  if (!cli) return false;
  var esKFCoSushi = pfEsGrupoKFC(cli.nombre) || pfEsCasaRes(cli);
  if (!esKFCoSushi) {
    // Independiente: toca recarga si su freqRec es anual (mant y recarga coinciden cada año)
    var fr = (cli.freqRec||"").toLowerCase();
    return fr.indexOf("1") !== -1 || fr.indexOf("año") !== -1 && fr.indexOf("3") === -1 && fr.indexOf("2") === -1;
  }
  if (mesIdx === null) return false;
  // La próxima visita del local cae en su mes, del año-calendario más cercano futuro
  var hoy = new Date();
  var anioVisita = hoy.getFullYear();
  if (mesIdx < hoy.getMonth()) anioVisita++; // ya pasó este año → el próximo
  var anioRec = pfAnioProximaRecarga(cli, mesIdx);
  return anioRec === anioVisita;
}

function pfProximoMantenimiento(nombreLocal, ultimaVisita) {
  if (!ultimaVisita) return null;
  try {
    var p = ultimaVisita.split("/");
    var d = new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
    // El MANTENIMIENTO es anual para TODOS (KFC, Sushicorp, independientes).
    // La recarga (cada 3 años para KFC) se calcula aparte en pfAnioProximaRecarga.
    d.setFullYear(d.getFullYear() + 1);
    return d;
  } catch(e) { return null; }
}

function pfDiasParaVencer(fechaProx) {
  if (!fechaProx) return null;
  return Math.round((fechaProx - new Date()) / 86400000);
}

function pfSemaforoColor(dias) {
  if (dias === null) return { bg:"var(--g2)", tx:"var(--g4)", ico:"⬜", label:"Sin datos" };
  if (dias < 0)     return { bg:"var(--rc)", tx:"var(--r)", ico:"🔴", label:"VENCIDO hace "+(Math.abs(dias))+" días" };
  if (dias < 30)    return { bg:"var(--rc)", tx:"var(--r)", ico:"🔴", label:dias+" días" };
  if (dias < 60)    return { bg:"var(--nc)", tx:"var(--n)", ico:"🟡", label:dias+" días" };
  return              { bg:"var(--vc)", tx:"var(--v)", ico:"🟢", label:dias+" días" };
}

// Filtro activo del semáforo: "todos" | "vencidos" | "proximos" | mes
var PF_SEM_FILTRO = "todos"; // declarado UNA sola vez
var PF_SEM_MODO   = "mant";  // "mant" | "recarga" — semáforo activo

// #33 FIX: pfGenerarRecorridoDesdeList eliminada (duplicada con pfGenerarRecorridoSemaforo)
function pfSetFiltroSemaforo(f) { PF_SEM_FILTRO = f; pfRenderSemaforo(PF_SEM_MODO); }

// #055 FIX: pfGenerarRecorridoDesdeList eliminada — usar pfGenerarRecorridoSemaforo

// #061 #062 #063 FIX: Filtros + generador de recorrido (PF_SEM_FILTRO ya declarado arriba)

function pfGenerarRecorridoSemaforo(items) {
  if (!items) items = (window.PF_SEM && window.PF_SEM.items) || []; // #056 FIX
  if (!items.length) { pfModal("No hay locales con ese filtro."); return; }
  var texto = "RECORRIDO — " + items.length + " LOCALES\n\n";
  items.forEach(function(item, i) {
    texto += "Punto " + (i+1) + " — " + item.nombre + "\n  Misión: Mantenimiento\n\n";
  });
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto).then(function(){
      pfModal("✅ Texto copiado. Pégalo en el tab Recorrido.");
    }).catch(function(){ pfModal(texto.substring(0,300)); });
  } else { pfModal(texto.substring(0,300)); }
}

var _PF_SEM_CACHE = {}; // #060 FIX: cache de proximoMantenimiento
function pfRenderSemaforo(modo) {
  modo = modo || PF_SEM_MODO || "mant"; // "mant" = solo mantenimiento | "recarga" = recarga+mant
  PF_SEM_MODO = modo;
  var el = document.getElementById(modo === "recarga" ? "pf-semaforo-rec-lista" : "pf-semaforo-lista");
  if (!el) return;

  var fichas = {};
  try { fichas = JSON.parse(localStorage.getItem("pf_fichas") || "{}"); } catch(e) {}

  // FIX: combinar fichas + clientes.js para mostrar 341, no solo los con ficha
  var _nomSet = {};
  Object.keys(fichas).forEach(function(n){_nomSet[n]=true;});
  if (typeof PF_CLIENTES!=="undefined" && Array.isArray(PF_CLIENTES)) {
    PF_CLIENTES.forEach(function(cl){var n=cl.nombre||cl.local;if(n&&!_nomSet[n])_nomSet[n]=true;});
  }
  var locales = Object.keys(_nomSet);
  if (!locales.length) {
    el.innerHTML = '<div style="padding:24px 16px;text-align:center;color:var(--g3);font-size:14px">Sin locales registrados aún.</div>';
    return;
  }

  // Calcular días para cada local — REPARTIR entre semáforo mant y recarga (un local en uno solo)
  var items = locales.map(function(nombre) {
    var ficha = fichas[nombre];
    var _cli = (typeof pfBuscarCliente === "function") ? pfBuscarCliente(nombre) : null;
    if (_cli && _cli.inactivo) return null; // filtrar inactivos/cerrados
    if (!_cli) return null;                 // sin cliente en BD → fuera (evita ruido)

    var _mesIdx = pfMesLocal(_cli);
    var _tocaRec = pfTocaRecargaEsteCiclo(_cli, _mesIdx);
    // Reparto: si modo=recarga, solo los que tocan recarga; si modo=mant, solo los que NO
    if (modo === "recarga" && !_tocaRec) return null;
    if (modo === "mant"    &&  _tocaRec) return null;

    // Última visita de mantenimiento o entrega
    var ultVisita = null;
    var visitas = ficha ? (ficha.visitas || []).filter(function(v){ return v.tipo === "mantenimiento" || v.tipo === "entrega"; }) : [];
    if (visitas.length > 0) ultVisita = visitas[0].fecha;
    var proxFecha = pfProximoMantenimiento(nombre, ultVisita);
    var dias      = pfDiasParaVencer(proxFecha);
    return { nombre:nombre, ultVisita:ultVisita, proxFecha:proxFecha, dias:dias, mesIdx:_mesIdx, esRec:_tocaRec };
  });

  // Filtrar nulos
  items = items.filter(function(i){ return i !== null; });

  // Ordenar: vencidos primero, luego por días asc
  items.sort(function(a,b) {
    var da = a.dias === null ? 99999 : a.dias;
    var db = b.dias === null ? 99999 : b.dias;
    return da - db;
  });

  // Contadores para resumen
  var vencidos = items.filter(function(i){ return i.dias !== null && i.dias < 0; }).length;
  var proximos = items.filter(function(i){ return i.dias !== null && i.dias >= 0 && i.dias < 60; }).length;

  var h = "";

  // Resumen
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 12px 12px">';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 8px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--r)">'+vencidos+'</div><div style="font-size:11px;color:var(--g3)">Vencidos</div></div>';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 8px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--n)">'+proximos+'</div><div style="font-size:11px;color:var(--g3)">Por vencer</div></div>';
  h += '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 8px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--g4)">'+locales.length+'</div><div style="font-size:11px;color:var(--g3)">Total</div></div>';
  h += '</div>';

  // Aplicar filtro activo
  var itemsFiltrados = items.filter(function(item) {
    if (PF_SEM_FILTRO === "vencidos") return item.dias !== null && item.dias < 0;
    if (PF_SEM_FILTRO === "proximos") return item.dias !== null && item.dias >= 0 && item.dias < 60;
    if (PF_SEM_FILTRO === "sin_datos") return item.dias === null;
    // #35 FIX: filtros de mes dinámicos
    var _mesIdx = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"].indexOf(PF_SEM_FILTRO);
    if (_mesIdx >= 0) return item.proxFecha && item.proxFecha.getMonth() === _mesIdx;
    return true;
  });

  // Campo búsqueda
  h += '<div style="padding:0 12px 8px"><input id="pf-sem-search-'+modo+'" type="text" placeholder="🔍 Buscar local..." oninput="pfFiltrarSemaforoBusqueda(this.value,\''+modo+'\')" style="width:100%;padding:9px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;box-sizing:border-box"></div>';
  // Barra de filtros
  h += '<div style="display:flex;gap:6px;padding:0 12px 10px;overflow-x:auto;-webkit-overflow-scrolling:touch">';
  // #35 FIX: filtros de mes dinámicos — próximos 3 meses desde hoy
  var _hoy = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Guayaquil"}));
  var _mesesNombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var _mesesClave   = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var _m1 = _hoy.getMonth(), _m2 = (_m1+1)%12, _m3 = (_m1+2)%12;
  var filtros = [
    {k:"todos",    l:"Todos ("+items.length+")"},
    {k:"vencidos", l:"🔴 Vencidos ("+vencidos+")"},
    {k:"proximos", l:"🟡 Próximos ("+proximos+")"},
    {k:"sin_datos",l:"⬜ Sin datos"},
    {k:_mesesClave[_m1], l:_mesesNombres[_m1]},
    {k:_mesesClave[_m2], l:_mesesNombres[_m2]},
    {k:_mesesClave[_m3], l:_mesesNombres[_m3]}
  ];
  filtros.forEach(function(fi) {
    var activo = PF_SEM_FILTRO === fi.k;
    h += '<button onclick="pfSetFiltroSemaforo(\''+fi.k+'\')" style="flex-shrink:0;padding:7px 12px;border-radius:20px;border:1.5px solid '+
      (activo?"var(--r)":"var(--bo)")+';background:'+
      (activo?"var(--r)":"#fff")+';color:'+
      (activo?"#fff":"var(--g4)")+';font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">'+fi.l+'</button>';
  });
  h += '</div>';

  // Botón generar recorrido desde filtro
  if (itemsFiltrados.length > 0 && PF_SEM_FILTRO !== "todos") {
    h += '<div style="padding:0 12px 10px"><button onclick="pfGenerarRecorridoSemaforo()" style="width:100%;padding:11px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">📋 Copiar recorrido con estos '+itemsFiltrados.length+' locales</button></div>'; // #056 FIX: lee items al momento del click
  }
  // BAJO FIX: usar variable de módulo en lugar de global window
  if (!window.PF_SEM) window.PF_SEM = {};
  window.PF_SEM.items = itemsFiltrados;

  // Leyenda colores
  h += '<div style="display:flex;gap:12px;padding:0 12px 8px;flex-wrap:wrap;font-size:11px;font-weight:700">';
  h += '<span style="color:var(--r)">🔴 Vencido/&lt;30d</span>&nbsp;<span style="color:var(--n)">🟡 30-60d</span>&nbsp;<span style="color:var(--v)">🟢 +60d</span>&nbsp;<span style="color:var(--g3)">⬜ Sin datos</span>';
  h += '</div>';

  // Renderizar header inmediatamente, luego items en batches para no congelar UI
  el.innerHTML = h;

  // Función para generar HTML de un ítem
  function _semItemHTML(item) {
    var sem   = pfSemaforoColor(item.dias);
    var esKFC = pfEsGrupoKFC(item.nombre);
    var freqLabel;
    if (modo === "recarga") freqLabel = "🔄 RECARGA + Mantenimiento";
    else freqLabel = esKFC ? "🔧 Mantenimiento (KFC)" : "🔧 Mantenimiento";
    return '<div class="pf-sem-item" data-nombre="'+item.nombre+'" style="margin:0 12px 6px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:10px 14px;display:flex;align-items:center;gap:10px">' +
      '<div style="font-size:20px;flex-shrink:0">'+sem.ico+'</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+item.nombre+'</div>' +
      '<div style="font-size:11px;color:var(--g4);margin-top:1px">'+freqLabel+(item.ultVisita?" · último: "+item.ultVisita:" · sin visitas")+'</div>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;background:'+sem.bg+';color:'+sem.tx+';flex-shrink:0">'+sem.label+'</div>' +
      '</div>';
  }

  // Primeros 40 ítems inmediatos (lo que ve el usuario sin scroll)
  var LOTE1 = 40, LOTE_N = 30;
  var hItems = "";
  var primo40 = itemsFiltrados.slice(0, LOTE1);
  primo40.forEach(function(item){ hItems += _semItemHTML(item); });
  var contenedor = document.createElement("div");
  contenedor.id = "pf-sem-lista-items-" + modo;
  contenedor.innerHTML = hItems;
  el.appendChild(contenedor);

  // Resto en batches de 30 con requestAnimationFrame
  if (itemsFiltrados.length > LOTE1) {
    var resto = itemsFiltrados.slice(LOTE1);
    var _semBatchIdx = 0;
    function _renderBatch() {
      if (_semBatchIdx >= resto.length) {
        // Quitar indicador de carga
        var ind = document.getElementById("pf-sem-loading");
        if (ind) ind.remove();
        return;
      }
      var batch = resto.slice(_semBatchIdx, _semBatchIdx + LOTE_N);
      var frag = document.createElement("div");
      frag.innerHTML = batch.map(_semItemHTML).join("");
      while (frag.firstChild) contenedor.appendChild(frag.firstChild);
      _semBatchIdx += LOTE_N;
      requestAnimationFrame(_renderBatch);
    }
    // Mostrar indicador de carga
    var ind = document.createElement("div");
    ind.id = "pf-sem-loading";
    ind.style.cssText = "padding:8px 12px;font-size:12px;color:var(--g3);text-align:center";
    ind.textContent = "Cargando " + (itemsFiltrados.length - LOTE1) + " locales más...";
    el.appendChild(ind);
    requestAnimationFrame(_renderBatch);
  }
}

// Inyectar tabs Semáforo (Mantenimiento + Recarga) en admin
function pfInyectarSemaforo() {
  var tabBar = document.querySelector(".adm-tab");
  var admScr = document.getElementById("sadmin");
  if (!tabBar || !admScr) return;

  // ── Semáforo MANTENIMIENTO (tab 6) ──
  if (!document.getElementById("adm-t6")) {
    var btn = document.createElement("button");
    btn.id = "adm-t6"; btn.className = "adm-tab-btn";
    btn.textContent = "🔧 Mant.";
    btn.onclick = function(){ admTab(6); };
    tabBar.appendChild(btn);

    var panel = document.createElement("div");
    panel.id = "adm-p6"; panel.className = "adm-panel";
    panel.innerHTML =
      '<div style="padding:12px 0">' +
      '<div class="slbl">Semáforo de mantenimiento (anual)</div>' +
      '<div id="pf-semaforo-lista"></div>' +
      '<div style="height:80px"></div></div>';
    admScr.appendChild(panel);
  }

  // ── Semáforo RECARGA + MANTENIMIENTO (tab 16) ──
  if (!document.getElementById("adm-t16")) {
    var btnR = document.createElement("button");
    btnR.id = "adm-t16"; btnR.className = "adm-tab-btn";
    btnR.textContent = "🔄 Recarga";
    btnR.onclick = function(){ admTab(16); };
    tabBar.appendChild(btnR);

    var panelR = document.createElement("div");
    panelR.id = "adm-p16"; panelR.className = "adm-panel";
    panelR.innerHTML =
      '<div style="padding:12px 0">' +
      '<div class="slbl">Semáforo de recarga + mantenimiento</div>' +
      '<div id="pf-semaforo-rec-lista"></div>' +
      '<div style="height:80px"></div></div>';
    admScr.appendChild(panelR);
  }

  // Handlers de tabs
  if (window.PF_TAB_HANDLERS) {
    window.PF_TAB_HANDLERS[6]  = function(){ pfRenderSemaforo("mant"); };
    window.PF_TAB_HANDLERS[16] = function(){ pfRenderSemaforo("recarga"); };
  }
}

// pfAdmTab6 manejado por coordinator.js — no duplicar

// Aprobación de recorrido eliminada — Alejandro publica directamente

// ════════════════════════════════════════════════════════════
//  25 — EMAIL AUTOMÁTICO DEL CERTIFICADO
//  Envía email via Apps Script al completar un certificado
// ════════════════════════════════════════════════════════════

function pfEnviarEmailCertificado(certNum, localNombre, emailEncargado) {
  if (!emailEncargado || !emailEncargado.includes("@") || !emailEncargado.includes(".")) return; // #057 FIX: validación más robusta
  if (typeof SCRIPT_URL === "undefined") return;

  var payload = {
    accion:    "enviar_certificado",
    certNum:   certNum,
    local:     localNombre,
    email:     emailEncargado,
    fecha:     new Date().toLocaleDateString("es-EC", {day:"2-digit", month:"long", year:"numeric"}),
    tecnico:   typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "Técnico"
  };

  fetch(SCRIPT_URL, { method:"POST", body: JSON.stringify(payload) }) // #061 FIX
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
  // irFirma coordinado por coordinator.js

  // Detección de Fabiola: mejoras2 ya no necesita parchear ir() —
  // el banner de aprobación fue removido en v1.0 (Alejandro publica directamente)

  // pfOnLocalCompletado coordinado por coordinator.js

  // Tab 6 registrado en coordinator.js
});

// ── BÚSQUEDA EN SEMÁFORO ────────────────────────────────────
function pfFiltrarSemaforoBusqueda(q, modo) {
  modo = modo || PF_SEM_MODO || "mant";
  var cont = document.getElementById("pf-sem-lista-items-" + modo);
  var items = cont ? cont.querySelectorAll(".pf-sem-item") : document.querySelectorAll(".pf-sem-item");
  var qLow  = (q || "").toLowerCase().trim();
  var count = 0;
  items.forEach(function(el) {
    var nombre = (el.getAttribute("data-nombre") || "").toLowerCase();
    var mostrar = !qLow || nombre.indexOf(qLow) !== -1;
    el.style.display = mostrar ? "" : "none";
    if (mostrar) count++;
  });
  // Indicador de resultados
  var indId = "pf-sem-search-count-" + modo;
  var ind = document.getElementById(indId);
  if (!ind) {
    ind = document.createElement("div");
    ind.id = indId;
    ind.style.cssText = "padding:2px 12px 6px;font-size:11px;color:var(--g3)";
    var srchEl = document.getElementById("pf-sem-search-" + modo);
    if (srchEl && srchEl.parentNode) srchEl.parentNode.insertAdjacentElement("afterend", ind);
  }
  if (qLow) {
    ind.textContent = count + " resultado(s) para \"" + q + "\"";
    ind.style.display = "";
  } else {
    ind.style.display = "none";
  }
}
