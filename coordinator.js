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

  // Guardar el admTab original de app.js y extenderlo con handlers de módulos
  var _admTabBase = window.admTab;
  window.admTab = function(n) {
    // app.js ya desactiva/activa hasta MAX_TABS — llamarlo directamente
    if (typeof _admTabBase === "function") _admTabBase(n);
    // Ejecutar handler del módulo si existe (evitar re-ejecutar tab 1,2,3 que app.js ya maneja)
    if (window.PF_TAB_HANDLERS[n] && n > 3) {
      window.PF_TAB_HANDLERS[n]();
    }
  };

  // Registrar tabs de cada módulo
  // Tab 1 = Recorrido, Tab 2 = Pizarra, Tab 3 = Avance (app.js)
  window.PF_TAB_HANDLERS[1] = function() { /* solo activar panel */ };
  window.PF_TAB_HANDLERS[2] = function() { if (typeof renderPizarra === "function") renderPizarra(); };
  window.PF_TAB_HANDLERS[3] = function() { /* app.js ya maneja tab 3 */ };
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
  // Tab 11 = Taller (app.js)
  window.PF_TAB_HANDLERS[11] = function() {
    if (typeof pfRenderTaller === "function") pfRenderTaller();
  };
  // Tab 12 = Tareas (app.js)
  window.PF_TAB_HANDLERS[12] = function() {
    if (typeof pfRenderTareas === "function") pfRenderTareas();
  };
  // Tab 13 = Config precios + clientes (app.js #019 #088)
  window.PF_TAB_HANDLERS[13] = function() {
    if (typeof pfRenderConfigPrecios === "function") pfRenderConfigPrecios();
  };

  // ── Coordinador de irFirma ────────────────────────────────
  // irFirma base en app.js ya maneja _DESTINO_FIRMA y actualizarBotonFirma.
  // Solo necesitamos agregar los hooks de módulos externos.
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

    // #083 FIX: ejecutar inmediatamente con snapshot, sin setTimeout que puede ejecutar en local equivocado
    if (localSnap && typeof pfOnLocalCompletado === "function") {
      try {
        pfOnLocalCompletado(localSnap, puntoSnap, tipoSnap, tecSnap, "");
      } catch(e) { console.warn("pfOnLocalCompletado error:", e); }
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

  // ── Fix: tabs del admin scrolleables en móvil ── (#081 FIX: era load anidado, ahora directo)
  (function() {
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
      ".adm-tab-btn { min-width: 80px; white-space: nowrap; }" + // #103 FIX: flex:none ya en CSS, quitar !important duplicado
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
  })();


  // Inyectar tab 13 Config
  (function() {
    var tabBar = document.querySelector(".adm-tab");
    var admScr = document.getElementById("sadmin");
    if (!tabBar || !admScr) return;
    if (document.getElementById("adm-t13")) return;

    // Botón tab
    var btn = document.createElement("button");
    btn.id = "adm-t13"; btn.className = "adm-tab-btn";
    btn.textContent = "⚙ Config";
    btn.onclick = function(){ admTab(13); };
    tabBar.appendChild(btn);

    // Panel
    var panel = document.createElement("div");
    panel.id = "adm-p13"; panel.className = "adm-panel";
    panel.innerHTML =
      '<div style="padding:12px 0">' +
      '<div class="slbl">Precios de accesorios</div>' +
      '<div id="pf-config-precios"><div style="padding:40px 16px;text-align:center;color:var(--g3)">Cargando...</div></div>' +
      '<div class="slbl">Clientes</div>' +
      '<div style="padding:0 12px 12px">' +
      '<button type="button" onclick="pfAbrirFormNuevoCliente()" style="width:100%;padding:14px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">➕ Agregar nuevo cliente</button>' +
      '</div>' +
      '<div class="slbl">Azur — Facturación Electrónica</div>' +
      '<div style="margin:0 12px 10px;background:#fff;border-radius:14px;border:1.5px solid var(--bo);padding:14px">' +
      '<div style="font-size:12px;color:var(--g4);margin-bottom:10px">Pega tu api_key de Azur aquí. Se guarda en Google y nunca aparece en GitHub.</div>' +
      '<input id="azur-apikey-inp" type="password" placeholder="API_1_1_xxxxxxxxxxxxxxx" style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:monospace;font-size:13px;box-sizing:border-box;margin-bottom:8px">' +
      '<button type="button" onclick="pfGuardarAzurKey()" style="width:100%;padding:12px;border-radius:10px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">💾 Guardar api_key</button>' +
      '<div style="font-size:11px;color:var(--g3);margin-top:6px">Una vez guardada no aparece en pantalla por seguridad.</div>' +
      '</div>' +
      '<div style="height:80px"></div></div>';
    admScr.appendChild(panel);

    window.PF_TAB_HANDLERS[13] = function() {
      if (typeof pfRenderConfigPrecios === "function") pfRenderConfigPrecios();
    };
  })();



  // Inyectar tab 14 — Historial de Facturas Azur
  (function() {
    var tabBar = document.querySelector(".adm-tab");
    var admScr = document.getElementById("sadmin");
    if (!tabBar || !admScr) return;
    if (document.getElementById("adm-t14")) return;

    var btn = document.createElement("button");
    btn.id = "adm-t14"; btn.className = "adm-tab-btn";
    btn.textContent = "📄 Facturas";
    btn.onclick = function(){ admTab(14); };
    tabBar.appendChild(btn);

    var panel = document.createElement("div");
    panel.id = "adm-p14"; panel.className = "adm-panel";
    panel.innerHTML =
      '<div style="padding:12px 0">' +
      '<div class="slbl">Facturas emitidas</div>' +
      '<div id="pf-facturas-lista"><div style="padding:40px 16px;text-align:center;color:var(--g3)">Cargando...</div></div>' +
      '<div style="height:80px"></div></div>';
    admScr.appendChild(panel);

    window.PF_TAB_HANDLERS[14] = function() { pfRenderHistorialFacturas(); };
  })();

  // Función guardar api_key Azur (llama a Code.gs)
  window.pfGuardarAzurKey = function() {
    var inp = document.getElementById("azur-apikey-inp");
    if (!inp) return;
    var key = (inp.value || "").trim();
    // #87 FIX: validar formato api_key de Azur (comienza con API_)
    if (!key || key.length < 10) { pfModal("⚠️ La api_key parece inválida. Debe tener al menos 10 caracteres."); return; }
    if (key.indexOf("API_") !== 0 && key.indexOf("api_") !== 0) {
      pfModal("⚠️ La api_key debe comenzar con 'API_'. Revisa que copiaste el valor correcto desde Azur → Configuración.");
      return;
    }

    pfConfirm("¿Guardar esta api_key de Azur en el servidor?\n\nNo se puede recuperar desde la app una vez guardada, pero puede sobreescribirse.", function() {
      fetch(SCRIPT_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" }, // BAJO FIX
        body: JSON.stringify({ accion: "guardar_azur_key", azur_key: key })
      })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d.ok) {
          inp.value = "";
          pfModal("✅ api_key de Azur guardada correctamente.\nYa puedes emitir facturas desde la nota de entrega.");
        } else {
          pfModal("❌ Error: " + (d.msg || "Error desconocido"));
        }
      })
      .catch(function(e){ pfModal("❌ Error de conexión: " + e.message); });
    });
  };

  // Función render historial de facturas
  window.pfRenderHistorialFacturas = function() {
    var el = document.getElementById("pf-facturas-lista");
    if (!el) return;

    var facturas = [];
    try { facturas = JSON.parse(localStorage.getItem("pf_facturas_emitidas") || "[]"); } catch(e) {}

    if (!facturas.length) {
      el.innerHTML = '<div style="padding:40px 16px;text-align:center;color:var(--g3);font-size:14px">No hay facturas emitidas aún.<br><br>Genera una nota de entrega y presiona<br>"Emitir Factura Electrónica".</div>';
      return;
    }

    var h = '';
    facturas.forEach(function(f, idx) {
      h += '<div style="margin:0 12px 8px;background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 14px">';
      h += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">';
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="font-size:14px;font-weight:700;color:var(--ng);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (f.local || f.cliente || "—") + '</div>';
      h += '<div style="font-size:12px;color:var(--g4);margin-top:2px">' + (f.cliente || "") + ' · ' + (f.fecha || "") + '</div>';
      h += '<div style="font-family:monospace;font-size:10px;color:var(--g3);margin-top:4px;word-break:break-all">' + (f.claveAcceso || "—") + '</div>';
      h += '</div>';
      h += '<div style="font-size:15px;font-weight:700;color:var(--v);flex-shrink:0">$' + (parseFloat(f.total || 0).toFixed(2)) + '</div>';
      h += '</div>';
      if (f.claveAcceso) {
        h += '<div style="margin-top:8px"><button onclick="pfConsultarFactura(\"' + (f.claveAcceso||'').replace(/"/g,'') + '\")" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--bo);background:var(--g1);color:var(--g4);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">🔍 Consultar estado en Azur</button></div>'; // #39 FIX: comillas escapadas
      }
      h += '</div>';
    });

    el.innerHTML = h;
  };

  // Consultar estado de factura en Azur
  window.pfConsultarFactura = function(claveAcceso) {
    mostrarCargando(true, "Consultando Azur...", "");
    fetch(SCRIPT_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" }, // BAJO FIX
      body: JSON.stringify({ accion: "consultar_comprobante", claveAcceso: claveAcceso })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      mostrarCargando(false);
      if (d.ok && d.data) {
        var info = d.data;
        var msg = "Estado del comprobante:\n\n";
        msg += "Estado: " + (info.estado || info.ESTADO || JSON.stringify(info));
        pfModal(msg);
      } else {
        pfModal("❌ " + (d.msg || "No se pudo consultar el estado"));
      }
    })
    .catch(function(e){
      mostrarCargando(false);
      pfModal("❌ Error: " + e.message);
    });
  };


  }); // end load
})();