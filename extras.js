// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — extras.js  v1.0
//  58 — Marca de agua en fotos
//  63 — Firma con timestamp + GPS
//  55 — Backup automático a Google Drive (descarga local)
// ═══════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
//  58 — MARCA DE AGUA EN FOTOS
//  Se inyecta sobre fotoOk() de app.js
// ════════════════════════════════════════════════════════════
function pfAgregarMarcaAgua(canvas, ctx) {
  // #ALTO FIX: guard contra canvas 0x0 que lanza error en fillRect
  if (!canvas || canvas.width === 0 || canvas.height === 0) return;
  var _ahoraRaw = new Date();
  var ahora = new Date(_ahoraRaw.toLocaleString("en-US", {timeZone:"America/Guayaquil"}));
  var fecha = ahora.toLocaleDateString("es-EC", {day:"2-digit", month:"2-digit", year:"numeric"});
  var hora  = ahora.toLocaleTimeString("es-EC", {hour:"2-digit", minute:"2-digit"});
  var tecnico = (typeof TECNICO_NOMBRE !== "undefined" && TECNICO_NOMBRE && TECNICO_NOMBRE !== "Raúl Romero") ? TECNICO_NOMBRE : ((typeof USUARIO_ACTUAL !== "undefined" && USUARIO_ACTUAL) ? USUARIO_ACTUAL : "Técnico Previfuego");
  var local   = (typeof LOCAL_ACTUAL !== "undefined" && LOCAL_ACTUAL ? LOCAL_ACTUAL.nombre : "");
  var lineas  = [
    "PREVIFUEGO",
    fecha + "  " + hora,
    tecnico,
    local
  ].filter(Boolean);

  var W = canvas.width, H = canvas.height;
  var fs = Math.max(12, Math.round(W * 0.028)); // tamaño fuente relativo

  // Fondo semitransparente en esquina inferior izquierda
  var padX = 10, padY = 8, lineH = fs + 5;
  var boxH = lineas.length * lineH + padY * 2;
  var boxW = Math.round(W * 0.65);

  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, H - boxH, boxW, boxH);
  ctx.globalAlpha = 1;

  ctx.font = "bold " + fs + "px -apple-system, Arial, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";

  for (var i = 0; i < lineas.length; i++) {
    var y = H - boxH + padY + i * lineH;
    if (i === 0) {
      ctx.fillStyle = "#FF6B6B"; // PREVIFUEGO en rojo
    } else {
      ctx.fillStyle = "#fff";
      ctx.font = (i === 1 ? "bold " : "") + fs + "px -apple-system, Arial, sans-serif";
    }
    ctx.fillText(lineas[i], padX, y);
  }
  ctx.restore();
}

// Reemplazar fotoOk para agregar marca de agua en compresión
window.addEventListener("load", function() {
  var _fotoOkOrig = window.fotoOk;
  // #60 FIX: si app.js no cargó aún, no parchear
  if (typeof _fotoOkOrig !== "function") {
    console.warn("extras.js: fotoOk no encontrada en app.js — carga diferida");
    setTimeout(function(){
      var _fo2 = window.fotoOk;
      if (typeof _fo2 === "function") window.fotoOk = function(n,input){ _fo2(n,input); };
    }, 500);
    return;
  }
  window.fotoOk = function(n, input) {
    if (!input.files || !input.files[0]) return;
    var file = input.files[0];
    var url  = URL.createObjectURL(file);
    FD[n] = url;

    // UI update (igual que antes)
    var slotEl = document.getElementById("fs"+n);
    var fnEl   = document.getElementById("fn"+n);
    var fbEl   = document.getElementById("fb"+n);
    var prev   = document.getElementById("fp"+n);
    var fpc    = document.getElementById("fpc"+n);
    if (slotEl) slotEl.className = "fs2 fok";
    if (fnEl)   { fnEl.className = "fnum fnok"; fnEl.textContent = "✓"; }
    if (fbEl)   { fbEl.className = "fbg fbok";  fbEl.textContent = "Lista ✓ MdA"; }
    if (prev)   {
      prev.className = "fprev has";
      if (fpc) fpc.style.display = "none";
      var imgs = prev.querySelectorAll("img");
      for (var i = 0; i < imgs.length; i++) imgs[i].remove();
      var imgEl = document.createElement("img");
      imgEl.src = url;
      prev.insertBefore(imgEl, prev.firstChild);
    }

    // #64 FIX: validar tamaño máximo antes de comprimir (evitar OOM)
    if (file.size > 20 * 1024 * 1024) { // 20MB límite
      pfModal("⚠️ La foto es demasiado grande ("+Math.round(file.size/1024/1024)+"MB). Máximo 20MB.");
      return;
    }

    // Comprimir + marca de agua
    (function(idx, src) {
      var img = new Image();
      img.onload = function() {
        var cvs = document.createElement("canvas");
        var MAX = 900, w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        cvs.width = w; cvs.height = h;
        var c = cvs.getContext("2d");
        c.drawImage(img, 0, 0, w, h);
        pfAgregarMarcaAgua(cvs, c); // ← marca de agua
        FB64[idx] = cvs.toDataURL("image/jpeg", 0.70);
      };
      img.src = src;
    })(n, url);

    actualizarContadorFotos();
  };
});

// ════════════════════════════════════════════════════════════
//  63 — FIRMA CON TIMESTAMP + GPS
// ════════════════════════════════════════════════════════════
var PF_FIRMA_GEO = null; // { lat, lng, ts }

function pfCapturarGPS() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      PF_FIRMA_GEO = {
        lat: pos.coords.latitude.toFixed(6),
        lng: pos.coords.longitude.toFixed(6),
        ts:  new Date().toISOString()
      };
    },
    function() { PF_FIRMA_GEO = null; }, // si niega permiso, sin GPS
    { timeout: 4000, maximumAge: 30000 } // #129 FIX: 30s máximo de antigüedad GPS
  );
}

function pfGetTimestampFirma() {
  var ahora = new Date();
  return {
    fecha:   ahora.toLocaleDateString("es-EC", {day:"2-digit", month:"long", year:"numeric"}),
    hora:    ahora.toLocaleTimeString("es-EC", {hour:"2-digit", minute:"2-digit", second:"2-digit"}),
    iso:     ahora.toISOString(),
    lat:     PF_FIRMA_GEO ? PF_FIRMA_GEO.lat : null,
    lng:     PF_FIRMA_GEO ? PF_FIRMA_GEO.lng : null
  };
}

// Inyectar bloque de timestamp+GPS en la pantalla de firma
function pfInyectarTimestampFirma() {
  var sfir = document.getElementById("sfir");
  if (!sfir) return;
  if (document.getElementById("pf-ts-firma")) return; // ya existe

  var div = document.createElement("div");
  div.id = "pf-ts-firma";
  div.style.cssText = "margin:0 12px 10px;padding:10px 14px;background:var(--ac);border-radius:12px;border:1.5px solid var(--a);font-size:12px;color:var(--a);box-sizing:border-box";
  div.innerHTML = '<div style="font-weight:700;margin-bottom:4px">🔐 Firma digital con respaldo</div><div id="pf-ts-texto" style="font-family:monospace;font-size:11px;color:var(--g4)">Obteniendo datos...</div>';

  // Insertar antes del botón de firmar / al inicio del sc
  var sc = sfir.querySelector(".sc") || sfir.querySelector(".bw");
  if (sc && sc.firstChild) sc.insertBefore(div, sc.firstChild); // #131 FIX: guard firstChild null
  else if (sc) sc.appendChild(div);
  else sfir.appendChild(div);
}

function pfActualizarTimestampUI() {
  var el = document.getElementById("pf-ts-texto");
  if (!el) return;
  var ts = pfGetTimestampFirma();
  var txt = ts.fecha + " · " + ts.hora;
  if (ts.lat) txt += "\nGPS: " + ts.lat + ", " + ts.lng;
  else txt += "\nGPS: no disponible";
  txt += "\nTécnico: " + (typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "—");
  el.style.whiteSpace = "pre-wrap";
  el.textContent = txt;
}

// Guardar timestamp junto con la firma
var PF_FIRMA_TS = null;

window.addEventListener("load", function() {
  // GPS se captura al abrir la pantalla de firma, no en load
  // pfCapturarGPS(); -- movido a irFirma

  // irFirma coordinado por coordinator.js

  // Parchear marcarFirmado para guardar timestamp
  var _marcarFirmadoOrig = window.marcarFirmado;
  window.marcarFirmado = function() {
    if (typeof _marcarFirmadoOrig === "function") _marcarFirmadoOrig();
    PF_FIRMA_TS = pfGetTimestampFirma();
    pfActualizarTimestampUI();
  };

  // Exponer para que pdf.js pueda leerlo
  window.pfGetFirmaTimestamp = function() { return PF_FIRMA_TS; };
});

// ════════════════════════════════════════════════════════════
//  55 — BACKUP AUTOMÁTICO (descarga JSON local)
//  Guarda todo localStorage de Previfuego en un archivo .json
// ════════════════════════════════════════════════════════════
function pfHacerBackup() {
  var claves = [
    "pf_retiros", "pf_fichas", "pf_pizarra",
    "pf_hist_data", "pf_hist_fecha",
    "pf_recorrido_texto", "pf_recorrido_data", "pf_recorrido_jornadas",
    "pf_certCount", "pyro_ordenes", "pyro_oe_nro", "pf_usuario",
    "pf_clientes_custom", "pf_correos_clientes", "pf_facturas_emitidas", "pf_precios_accs", "pf_iva",
    "pf_taller", "pf_tareas", "pf_crm", "pf_proformas", "pf_entregas_pendientes", "pf_prof_count" // #125 FIX: incluir taller, tareas, CRM y proformas en backup
  ];
  var backup = { version: "1.0", fecha: new Date().toISOString(), datos: {} };
  claves.forEach(function(k) {
    var v = localStorage.getItem(k);
    if (v) {
      try { backup.datos[k] = JSON.parse(v); }
      catch(e) { backup.datos[k] = v; }
    }
  });

  var json = JSON.stringify(backup, null, 2);
  var blob = new Blob([json], { type: "application/json" });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement("a");
  var fecha = new Date().toLocaleDateString("es-EC").replace(/\//g,"-");
  a.href     = url;
  a.download = "PREVIFUEGO_BACKUP_" + fecha + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  localStorage.setItem("pf_ultimo_backup", new Date().toISOString());
  pfModal("✅ Backup descargado: PREVIFUEGO_BACKUP_" + fecha + ".json — Guárdalo en Google Drive.");
}

function pfRestaurarBackup(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var backup = JSON.parse(e.target.result);
      if (!backup.datos) { pfModal("Archivo de backup inválido."); return; }
      if (backup.version && backup.version < "1.0") { pfModal("⚠️ Backup muy antiguo (v" + backup.version + "). Puede haber incompatibilidades."); } // #128 FIX
      pfConfirm("¿Restaurar backup del " + backup.fecha + "?\nEsto reemplazará los datos actuales.", function() {
        Object.keys(backup.datos).forEach(function(k) {
          localStorage.setItem(k, JSON.stringify(backup.datos[k]));
        });
        pfModal("✅ Backup restaurado correctamente. Recargando...", function(){ location.reload(); }); // BAJO FIX
      });
    } catch(e) { pfModal("Error al leer el backup: " + e.message); }
  };
  reader.readAsText(file);
}

// Inyectar botón de backup en pantalla perfil
function pfInyectarBackupEnPerfil() {
  var sperf = document.getElementById("sperf");
  if (!sperf) return;
  if (document.getElementById("pf-backup-btn")) return;

  var bw = sperf.querySelector(".bw");
  if (!bw) return;

  var div = document.createElement("div");
  div.style.cssText = "margin:0 12px 12px";
  div.innerHTML =
    '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Backup de datos</div>' +
    '<button id="pf-backup-btn" type="button" onclick="pfHacerBackup()" style="width:100%;padding:14px;border-radius:12px;border:1.5px solid var(--bo);background:#fff;font-size:14px;font-weight:700;color:var(--a);cursor:pointer;font-family:inherit;margin-bottom:8px">💾 Descargar backup</button>' +
    '<label style="width:100%;display:block;padding:14px;border-radius:12px;border:1.5px dashed var(--bo);background:var(--g1);font-size:13px;font-weight:700;color:var(--g4);cursor:pointer;text-align:center;font-family:inherit">📂 Restaurar backup<input type="file" accept=".json" style="display:none" onchange="pfRestaurarBackup(this.files[0])"></label>' +
    '<div id="pf-ultimo-backup" style="font-size:11px;color:var(--g3);margin-top:6px;text-align:center"></div>';

  bw.parentNode.insertBefore(div, bw);

  // Mostrar fecha último backup
  var ub = localStorage.getItem("pf_ultimo_backup");
  if (ub) {
    var el = document.getElementById("pf-ultimo-backup");
    if (el) el.textContent = "Último backup: " + new Date(ub).toLocaleDateString("es-EC");
  }
}

window.addEventListener("load", function() {
  // Inyectar backup en perfil cuando se abre
  // Inyectar backup en perfil usando MutationObserver seguro
  var _renderPerfilOrig = window.renderPerfil;
  window.renderPerfil = function() {
    if (typeof _renderPerfilOrig === "function") _renderPerfilOrig();
    setTimeout(pfInyectarBackupEnPerfil, 100);
  };
});
