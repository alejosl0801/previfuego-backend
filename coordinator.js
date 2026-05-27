// ═══════════════════════════════════════════════════════════
//  PREVIFUEGO — coordinator.js  v1.0
//  Coordina todos los parches de los módulos adicionales
//  Se carga al FINAL, después de todos los demás scripts
//  Resuelve conflictos de: admTab, irFirma, ir, confirmarSin
// ═══════════════════════════════════════════════════════════

(function() {
window.addEventListener("load", function() {
  // ── Sistema central de tabs del admin ────────────────────
  // Cada módulo registra su handler en PF_TAB_HANDLERS[n]
  window.PF_TAB_HANDLERS = window.PF_TAB_HANDLERS || {};

  // Guardar el admTab original de app.js (tabs 1-3)
  var _admTabBase = window.admTab;

  // Reemplazar admTab con versión coordinada
  window.admTab = function(n) {
    // Desactivar todos los tabs y panels
    for (var i = 1; i <= 10; i++) {
      var b = document.getElementById("adm-t" + i);
      var p = document.getElementById("adm-p" + i);
      if (b) b.className = "adm-tab-btn";
      if (p) p.className = "adm-panel";
    }
    // Activar el tab seleccionado
    var btn = document.getElementById("adm-t" + n);
    var pan = document.getElementById("adm-p" + n);
    if (btn) btn.className = "adm-tab-btn on";
    if (pan) pan.className = "adm-panel on";

    // Ejecutar handler del módulo si existe
    if (window.PF_TAB_HANDLERS[n]) {
      window.PF_TAB_HANDLERS[n]();
    } else if (n <= 3 && typeof _admTabBase === "function") {
      // Tabs 1-3 originales — solo activar, ya están activados arriba
    }
  };

  // Registrar tabs de cada módulo
  // Tab 1 = Recorrido, Tab 2 = Pizarra, Tab 3 = Avance (app.js)
  window.PF_TAB_HANDLERS[1] = function() { /* solo activar panel */ };
  window.PF_TAB_HANDLERS[2] = function() { if (typeof renderPizarra === "function") renderPizarra(); };
  window.PF_TAB_HANDLERS[3] = function() {
    if (typeof renderCalendarioMes === "function") renderCalendarioMes();
    if (typeof renderResumenJornadas === "function") renderResumenJornadas();
  };
  // Tab 4 = Retiros (retiros.js)
  window.PF_TAB_HANDLERS[4] = function() {
    if (typeof pfRenderRetiros  === "function") pfRenderRetiros();
    if (typeof pfRenderAlertas  === "function") pfRenderAlertas();
  };
  // Tab 5 = Dashboard (dashboard.js)
  window.PF_TAB_HANDLERS[5] = function() {
    if (typeof pfRenderDashboard === "function") pfRenderDashboard();
  };
  // Tab 6 = Semáforo (mejoras2.js)
  window.PF_TAB_HANDLERS[6] = function() {
    if (typeof pfRenderSemaforo === "function") pfRenderSemaforo();
  };
  // Tab 7 = Productividad (crm.js)
  window.PF_TAB_HANDLERS[7] = function() {
    if (typeof pfRenderProductividad === "function") pfRenderProductividad();
  };
  // Tab 8 = Rentabilidad (inteligencia.js)
  window.PF_TAB_HANDLERS[8] = function() {
    if (typeof pfRenderRentabilidad === "function") pfRenderRentabilidad();
  };
  // Tab 9 = Calendario (inteligencia.js)
  window.PF_TAB_HANDLERS[9] = function() {
    window.PF_CAL_OFFSET = 0;
    if (typeof pfRenderCalendario === "function") pfRenderCalendario();
  };
  // Tab 10 = IA (inteligencia.js)
  window.PF_TAB_HANDLERS[10] = function() {
    // Solo muestra el botón — no hace nada automático
  };

  // ── Coordinador de irFirma ────────────────────────────────
  // Un solo parche, llama a todos los módulos en orden
  var _irFirmaBase = window.irFirma;
  window.irFirma = function() {
    if (typeof _irFirmaBase === "function") _irFirmaBase();
    setTimeout(function() {
      if (typeof pfInyectarTimestampFirma === "function") pfInyectarTimestampFirma();
      if (typeof pfActualizarTimestampUI  === "function") pfActualizarTimestampUI();
      if (typeof pfInyectarCampoEmail     === "function") pfInyectarCampoEmail();
      if (typeof pfCapturarGPS            === "function") pfCapturarGPS();
    }, 300);
  };

  // ── Coordinador de confirmarSin ───────────────────────────
  var _confirmarSinBase = window.confirmarSin;
  window.confirmarSin = function() {
    var localSnap = (typeof LOCAL_ACTUAL !== "undefined" && LOCAL_ACTUAL)
      ? JSON.parse(JSON.stringify(LOCAL_ACTUAL)) : null;
    var puntoSnap = (typeof PUNTO_ACTUAL !== "undefined" && PUNTO_ACTUAL)
      ? JSON.parse(JSON.stringify(PUNTO_ACTUAL)) : null;
    var tipoSnap  = typeof TIPO_TRABAJO   !== "undefined" ? TIPO_TRABAJO   : null;
    var tecSnap   = typeof TECNICO_NOMBRE !== "undefined" ? TECNICO_NOMBRE : "Raúl Romero";

    if (typeof _confirmarSinBase === "function") _confirmarSinBase();

    if (localSnap) {
      setTimeout(function() {
        if (typeof pfOnLocalCompletado === "function") {
          pfOnLocalCompletado(localSnap, puntoSnap, tipoSnap, tecSnap, "");
        }
      }, 300);
    }
  };

  // ── Coordinador de pfOnLocalCompletado ───────────────────
  // Centraliza el registro de visita + email
  window.pfOnLocalCompletado = function(local, punto, tipo, tecnico, nota) {
    if (!local) return;
    // Registrar visita/retiro en fichas
    if (typeof pfRegistrarRetiro  === "function" && tipo === "retiro") {
      pfRegistrarRetiro(local, punto, tecnico, nota || local.mision);
    } else if (typeof pfRegistrarVisita === "function") {
      pfRegistrarVisita(local, punto, tipo, tecnico, nota || "");
    }
    // Enviar email si hay uno ingresado
    var emailEl = document.getElementById("pf-email-enc");
    if (emailEl && emailEl.value && emailEl.value.includes("@")) {
      if (typeof pfEnviarEmailCertificado === "function") {
        var certNum = typeof CERT_CONTADOR !== "undefined"
          ? "CERT-" + (local.nombre||"").substring(0,8).toUpperCase().replace(/[^A-Z0-9]/g,"") + "-" + new Date().getFullYear() + "-" + String(CERT_CONTADOR).padStart(3,"0")
          : "—";
        pfEnviarEmailCertificado(certNum, local.nombre, emailEl.value);
      }
    }
    // Actualizar badge de retiros
    if (typeof pfActualizarBadge === "function") pfActualizarBadge();
  };

  // ── Fix: tabs del admin deben ser scrolleables en móvil ──
  window.addEventListener("load", function() {
    var tabBar = document.querySelector(".adm-tab");
    if (tabBar) {
      tabBar.style.overflowX   = "auto";
      tabBar.style.overflowY   = "hidden";
      tabBar.style.flexWrap    = "nowrap";
      tabBar.style.webkitOverflowScrolling = "touch";
      tabBar.style.scrollbarWidth = "none";
    }

    // Fix: adm-tab-btn no deben tener flex:1 cuando hay muchos tabs
    var style = document.createElement("style");
    style.textContent =
      ".adm-tab-btn { flex: none !important; min-width: 80px; white-space: nowrap; font-size: 12px !important; padding: 10px 10px !important; }" +
      ".adm-tab::-webkit-scrollbar { display: none; }";
    document.head.appendChild(style);

    // Fix: pfAbrirFicha — verificar que existe antes de llamar
    var _fichaOrig = window.pfAbrirFicha;
    window.pfAbrirFicha = function(nombre) {
      if (typeof _fichaOrig === "function") {
        _fichaOrig(nombre);
        // Agregar botón CRM después de que el modal cargue
        setTimeout(function() {
          var modal = document.getElementById("pf-ficha-modal");
          if (!modal || document.getElementById("pf-ficha-crm-btn")) return;
          var btn = document.createElement("div");
          btn.id = "pf-ficha-crm-btn";
          btn.style.cssText = "padding:0 12px 12px";
          btn.innerHTML = '<button onclick="pfCerrarFicha();pfAbrirCRM(\'' + nombre.replace(/'/g, "") + '\')" style="width:100%;padding:13px;border-radius:12px;border:none;background:var(--a);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">📋 Abrir CRM de este local</button>';
          var cont = modal.querySelector("div");
          if (cont) cont.appendChild(btn);
        }, 150);
      }
    };

    // Fix: badge de alertas al iniciar
    if (typeof pfActualizarBadge === "function") pfActualizarBadge();
  });

  }); // end load
})();