// PREVIFUEGO — Generador PDF
// Separado de app.js para optimizar carga

// ════════════════════════════════════════════════════════════
//  GENERADOR PDF
// ════════════════════════════════════════════════════════════
function generarPDF() {
  // Si es ENTREGA, cargar foto ANTES del retiro del mismo local
  if (typeof TIPO_TRABAJO !== "undefined" && TIPO_TRABAJO === "entrega" && LOCAL_ACTUAL) {
    var fotoAntes = (typeof getFotoRetiro === "function") ? getFotoRetiro(LOCAL_ACTUAL.nombre) : null;
    if (fotoAntes && fotoAntes.fb64 && !FB64["antes"]) {
      FB64["antes"] = fotoAntes.fb64;
      FD["antes"]   = fotoAntes.fb64;
    }
  }
  if (NOV === null) { alert("Indica si hay novedades antes de continuar."); return; }
  if (NOV === "si" && ACCS.length === 0) { alert("Seleccionaste accesorios dañados pero no agregaste ninguno."); return; }
  var fc = 0;
  for (var k in FB64) { if (FB64[k]) fc++; }
  if (fc === 0) { alert("Necesitas al menos 1 foto para generar el certificado."); return; }

  mostrarCargando(true, "Generando certificado...", "Por favor espera");

  // Esperar compresión de fotos
  var intentos = 0;
  function esperarFotos() {
    var listas = 0, total = 0;
    for (var k in FD) { total++; if (FB64[k]) listas++; }
    if (listas >= total || intentos > 30) { cargarJsPDF(fc); }
    else { intentos++; setTimeout(esperarFotos, 150); }
  }
  setTimeout(esperarFotos, 300);
}

function cargarJsPDF(fc) {
  if (window.jspdf && window.jspdf.jsPDF) { hacerPDF(fc); return; }
  var s   = document.createElement("script");
  s.src   = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  s.onload  = function(){ hacerPDF(fc); };
  s.onerror = function(){ mostrarCargando(false); alert("Error cargando el generador de PDF. Verifica tu conexión a internet."); };
  document.head.appendChild(s);
}

function hacerPDF(fc) {
  try {
    var J   = window.jspdf.jsPDF;
    var doc = new J({orientation:"portrait", unit:"mm", format:"a4"});
    var PW=210, PH=297, ML=15, CW=180;
    var R=[158,18,18], NG=[26,24,28], GR=[88,86,90], BG=[246,246,246];

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
    // Buscar código real del cliente en base de datos
    var _cliDB = (typeof pfBuscarCliente === "function") ? pfBuscarCliente(LOCAL_ACTUAL.nombre) : null;
    var _codLocal = (_cliDB && _cliDB.codigo) ? _cliDB.codigo : (LOCAL_ACTUAL.nombre.substring(0,8).toUpperCase().replace(/[^A-Z0-9]/g,""));
    var CERT_NUM = _codLocal + "-MANT EXTINTORES-" + ANO;

    function fondoBase() {
      doc.setFillColor(255,255,255); doc.rect(0,0,PW,PH,"F");
      fR(); doc.rect(0,0,4,PH,"F");
      fR(); doc.rect(0,0,PW,7,"F");
    }

    function piePagina() {
      fN(); doc.rect(0,PH-10,PW,10,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(6.8); tW();
      doc.text("DIR: PORTETE #3007 Y GALLEGOS LARA  |  TEL: 04-2374822 · 0978997247 · 09835883325  |  EMAIL: ventas_previfuego@hotmail.com", PW/2, PH-3.8, {align:"center"});
    }

    function bloqueAutorizacion(yy) {
      // Verificar que cabe en la página
      if (yy > PH - 55) return yy;
      dR(); doc.setLineWidth(0.5); doc.line(ML,yy,ML+CW,yy); yy += 5;
      doc.setFillColor(253,251,251);
      dR(); doc.setLineWidth(0.3); doc.rect(ML,yy,CW,30,"FD");
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); tR();
      doc.text("AUTORIZADO POR:", ML+5, yy+7);
      doc.setFont("helvetica","bold"); doc.setFontSize(12); tN();
      doc.text("Alejandro Lopez", ML+5, yy+15);
      doc.setFont("helvetica","normal"); doc.setFontSize(9); tG();
      doc.text("Jefe de Operaciones  —  Previfuego / Pyroshield", ML+5, yy+22);
      doc.text("RUC: 0952773976001", ML+5, yy+28);
      return yy + 36;
    }

    // ── PÁG 1 ──────────────────────────────────────────────
    fondoBase();
    var y = 9;

    // Logo
    var lcdEl = document.getElementById("lcd");
    var b64   = lcdEl ? lcdEl.getAttribute("data-b64") : "";
    if (b64) { try { doc.addImage("data:image/png;base64,"+b64,"PNG",ML,y,24,24); } catch(e){} }

    // Número certificado
    doc.setFont("helvetica","bold"); doc.setFontSize(7); tR();
    doc.text(CERT_NUM, PW-5, 12, {align:"right"});

    // Datos reales del cliente
    var _empDB = (typeof pfBuscarCliente === "function") ? pfBuscarCliente(LOCAL_ACTUAL.nombre) : null;
    var _empresa = (_empDB && _empDB.razon) ? _empDB.razon : (LOCAL_ACTUAL.empresa || LOCAL_ACTUAL.nombre || "");
    var _ruc     = (_empDB && _empDB.ruc)   ? _empDB.ruc   : (LOCAL_ACTUAL.ruc || "—");
    var _marca   = (_empDB && _empDB.marca)  ? _empDB.marca  : "";
        // Header empresa
    var HX=ML+28, HW=PW-5-HX;
    doc.setFont("helvetica","bold"); doc.setFontSize(22); tR();
    var pW = doc.getTextWidth("PREVIFUEGO");
    doc.text("PREVIFUEGO", HX+(HW-pW)/2, y+9);
    dR(); doc.setLineWidth(0.5);
    doc.line(HX+(HW-pW)/2, y+11, HX+(HW-pW)/2+pW, y+11);
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tN();
    var sW = doc.getTextWidth("SEGURIDAD INDUSTRIAL Y CONTRA INCENDIOS");
    doc.text("SEGURIDAD INDUSTRIAL Y CONTRA INCENDIOS", HX+(HW-sW)/2, y+16);
    doc.setFont("helvetica","normal"); doc.setFontSize(6.2); tG();
    var iL = [
      "RUC.: 0952773976001  |  ASESORAMIENTO · RECARGA · MANTENIMIENTO · VENTAS",
      "PQS (ABC) · GAS CARBONICO · HALOTRON",
      "DISEÑO E INSTALACIÓN DE RED HIDRÁULICA CONTRA INCENDIOS",
      "SISTEMAS DE CO2 PARA COCINAS, GENERADORES, TRANSFORMADORES, ETC",
      "INSTALACIÓN DE LÁMPARAS DE EMERGENCIA Y DETECTORES DE HUMO"
    ];
    for (var i = 0; i < iL.length; i++) {
      var lw = doc.getTextWidth(iL[i]);
      doc.text(iL[i], HX+(HW-lw)/2, y+20+i*3.4);
    }

    // Separadores
    y = 48;
    dR(); doc.setLineWidth(0.9); doc.line(ML,y,PW-ML,y);
    dL(); doc.setLineWidth(0.3); doc.line(ML,y+1.8,PW-ML,y+1.8);
    y += 8;

    // Título
    doc.setFont("helvetica","bold"); doc.setFontSize(13); tN();
    var tits = ["CERTIFICADO DE INSPECCIÓN Y MANTENIMIENTO DE","EXTINTORES PORTÁTILES"];
    for (var i = 0; i < tits.length; i++) {
      var tw = doc.getTextWidth(tits[i]);
      var tx = ML+(CW-tw)/2;
      doc.text(tits[i], tx, y);
      dR(); doc.setLineWidth(0.35); doc.line(tx, y+1.2, tx+tw, y+1.2);
      y += 7.5;
    }
    y += 4;

    // Banner garantía
    doc.setFillColor(247,247,247);
    dL(); doc.setLineWidth(0.4); doc.rect(ML,y-3,CW,7.5,"FD");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); tG();
    doc.text("MEDIANTE EL PRESENTE, SE GARANTIZA EL TRABAJO REALIZADO BAJO EL SIGUIENTE DETALLE:", ML+3, y+1.5);
    y += 11;

    // Párrafo principal
    var localNom = LOCAL_ACTUAL.nombre.toUpperCase();
    var puntNom  = PUNTO_ACTUAL ? PUNTO_ACTUAL.nombre.toUpperCase() : localNom;
    var ptxt = "INSPECCIÓN Y MANTENIMIENTO DE EXTINTORES PORTÁTILES UBICADOS EN LOS DISTINTOS PUNTOS ESTRATÉGICOS DEL LOCAL «"+localNom+"» UBICADO EN "+puntNom+", SIGUIENDO LAS NORMAS NFPA10.";
    doc.setFont("helvetica","normal"); doc.setFontSize(9); tN();
    var ptxtL = doc.splitTextToSize(ptxt, CW);
    for (var i = 0; i < ptxtL.length; i++) { doc.text(ptxtL[i], ML, y); y += 4.8; }
    y += 5;

    // COMPRENDE
    fR(); doc.rect(ML, y-3.5, CW, 7.5, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(9.5); tW();
    doc.text("COMPRENDE:", ML+4, y+0.8);
    y += 7;

    doc.setFont("helvetica","normal"); doc.setFontSize(9); tN();
    var items = ["REVISION INTEGRAL DE LOS CILINDROS","INSPECCIÓN DE CABEZALES","INSPECCIÓN DE CORNETAS / MANGUERAS","PESAJE / TARA","MANTENIMIENTO PREVENTIVO-CORRECTIVO","RECARGA DEL AGENTE"];
    for (var i = 0; i < items.length; i++) {
      fR(); doc.rect(ML+3, y-2.2, 2.2, 2.2, "F");
      tN(); doc.text(items[i], ML+8, y);
      y += 5.5;
    }
    y += 5;

    // Tabla extintores — SOLO si hay extintores
    var exts = (LOCAL_ACTUAL.ext && LOCAL_ACTUAL.ext.length > 0) ? LOCAL_ACTUAL.ext : [];
    if (exts.length > 0) {
      var gmap = {};
      for (var i = 0; i < exts.length; i++) {
        var e   = exts[i];
        var cap = (e.w||e.capacidad||"").toUpperCase();
        var tip = (e.t||e.tipo||"").toUpperCase();
        var k   = cap+"|"+tip;
        if (!gmap[k]) gmap[k] = {cnt:0, cap:cap, tip:tip};
        gmap[k].cnt++;
      }
      var grps = [];
      for (var k in gmap) grps.push(gmap[k]);

      var cws = [18,36,28,50,48], cxs = [ML];
      for (var i = 1; i < cws.length; i++) cxs.push(cxs[i-1]+cws[i-1]);
      var rH = 9, tRows = grps.length;

      fN(); doc.rect(ML,y,CW,rH,"F");
      doc.setDrawColor(60,58,62); doc.setLineWidth(0.2);
      var vx = ML;
      for (var i = 0; i < cws.length; i++) { vx += cws[i]; if (vx < ML+CW) doc.line(vx,y,vx,y+rH); }
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tW();
      var heads = ["CANT.","CAPACIDAD","TIPO","ÚLTIMO MANT.","PRÓXIMO MANT."];
      for (var i = 0; i < heads.length; i++) {
        doc.text(heads[i], cxs[i]+cws[i]/2, y+rH-2.8, {align:"center", maxWidth:cws[i]-2});
      }
      y += rH;

      for (var r = 0; r < tRows; r++) {
        var ry = y+r*rH;
        if (r%2===0) { doc.setFillColor(255,255,255); } else { fBG(); }
        doc.rect(ML,ry,CW,rH,"F");
        dL(); doc.setLineWidth(0.2); doc.line(ML,ry+rH,ML+CW,ry+rH);
        var vx2 = ML;
        for (var i = 0; i < cws.length; i++) { vx2 += cws[i]; if (vx2 < ML+CW) doc.line(vx2,ry,vx2,ry+rH); }
        var g = grps[r];
        doc.setFont("helvetica","bold"); doc.setFontSize(10); tN();
        doc.text(String(g.cnt), cxs[0]+cws[0]/2, ry+rH-2.8, {align:"center"});
        doc.text(g.cap,         cxs[1]+cws[1]/2, ry+rH-2.8, {align:"center"});
        tR(); doc.text(g.tip,   cxs[2]+cws[2]/2, ry+rH-2.8, {align:"center"});
        tN();
        doc.text(MA,  cxs[3]+cws[3]/2, ry+rH-2.8, {align:"center"});
        doc.text(MAS, cxs[4]+cws[4]/2, ry+rH-2.8, {align:"center"});
      }
      var tablaYi = y-rH;
      y += tRows*rH;
      dR(); doc.setLineWidth(0.5); doc.rect(ML,tablaYi,CW,rH*(tRows+1),"S");
      y += 8;
    }
    // Si no hay extintores, NO dejar espacio vacío — continuar directo

    // Párrafo garantía
    doc.setFont("helvetica","normal"); doc.setFontSize(8.8); tN();
    var gar = "Los extintores detallados se encuentran operativos de acuerdo con la norma NFPA10 y normativa ecuatoriana vigente. Cada extintor cuenta con sus respectivos precintos y seguros metálicos, etiqueta de control de carga, accesorios en buen estado y agente extintor en óptimas condiciones, garantizando su funcionamiento con vigencia de un (1) año a partir de su último mantenimiento.";
    var garL = doc.splitTextToSize(gar, CW);
    for (var i = 0; i < garL.length; i++) { doc.text(garL[i], ML, y); y += 4.6; }
    y += 8;

    bloqueAutorizacion(y);
    piePagina();

    // ── PÁG 2 ──────────────────────────────────────────────
    doc.addPage();
    fondoBase();

    var evTit = "EVIDENCIA FOTOGRÁFICA — "+LOCAL_ACTUAL.nombre.toUpperCase().substring(0,30);
    doc.setFont("helvetica","bold"); doc.setFontSize(11); tN();
    doc.text(evTit, PW/2, 17, {align:"center"});
    var evW     = doc.getTextWidth(evTit);
    var lineLen = (CW - evW - 10) / 2;
    dR(); doc.setLineWidth(0.9);
    doc.line(ML, 19, ML+lineLen, 19);
    doc.line(PW-ML-lineLen, 19, PW-ML, 19);
    dL(); doc.setLineWidth(0.3); doc.line(ML, 20.5, PW-ML, 20.5);

    var p2y = 25;

    // Fotos — recolectar todas las que haya en FB64
    var fv = [], etiqU = [];
    var etiqFijas = ["ANTES","DESPUÉS","CILINDRO CO₂"];
    var keys = Object.keys(FB64).sort(function(a,b){ return parseInt(a)-parseInt(b); });
    for (var i = 0; i < keys.length; i++) {
      if (FB64[keys[i]]) {
        fv.push(FB64[keys[i]]);
        etiqU.push(etiqFijas[i] || "FOTO "+(i+1));
      }
    }

    if (fv.length > 0) {
      // Distribuir fotos: máx 2 por fila
      var fotasPorFila = fv.length === 1 ? 1 : 2;
      var fw = fv.length === 1 ? 100 : (CW - 5) / 2;
      var fh = fw * 0.75;
      for (var i = 0; i < fv.length; i++) {
        var col    = i % fotasPorFila;
        var fila   = Math.floor(i / fotasPorFila);
        var fx     = ML + col * (fw + 5) + (fv.length === 1 ? (CW-fw)/2 : 0);
        var fy     = p2y + fila * (fh + 12);
        try {
          doc.setFillColor(200,200,200); doc.rect(fx+1.5, fy+1.5, fw, fh, "F");
          fR(); doc.rect(fx-1, fy-1, fw+2, fh+2, "F");
          doc.addImage(fv[i], "JPEG", fx, fy, fw, fh);
          fR(); doc.rect(fx, fy+fh-7, fw, 7, "F");
          doc.setFont("helvetica","bold"); doc.setFontSize(7); tW();
          doc.text(etiqU[i]||"", fx+fw/2, fy+fh-2.5, {align:"center"});
        } catch(e) {}
      }
      var filas = Math.ceil(fv.length / fotasPorFila);
      p2y += filas * (fh + 12);
    }

    // Firma — con tamaño correcto
    if (FIRMADO && canvas && canvas.width > 50) {
      try {
        var sigData = canvas.toDataURL("image/png");
        dR(); doc.setLineWidth(0.5); doc.line(ML, p2y, ML+CW, p2y); p2y += 6;
        doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tR();
        doc.text("FIRMA DEL ENCARGADO:", ML, p2y); p2y += 5;
        doc.setFillColor(251,251,251);
        dR(); doc.setLineWidth(0.5); doc.rect(ML, p2y, 90, 30, "FD");
        doc.addImage(sigData, "PNG", ML, p2y, 90, 30);
        p2y += 34;
        doc.setFont("helvetica","normal"); doc.setFontSize(9.5); tN();
        doc.text("Encargado del local — "+LOCAL_ACTUAL.nombre, ML, p2y);
        p2y += 8;
      } catch(e) { p2y += 5; }
    }

    // Accesorios
    if (ACCS.length > 0) {
      dR(); doc.setLineWidth(0.5); doc.line(ML, p2y, ML+CW, p2y); p2y += 6;
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tR();
      doc.text("ACCESORIOS UTILIZADOS:", ML, p2y); p2y += 6;
      fN(); doc.rect(ML, p2y, CW, 7.5, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); tW();
      doc.text("DESCRIPCIÓN DEL ACCESORIO", ML+5, p2y+5);
      p2y += 7.5;
      for (var i = 0; i < ACCS.length; i++) {
        var ac = ACCS[i];
        if (i%2===0) { doc.setFillColor(255,255,255); } else { fBG(); }
        doc.rect(ML, p2y, CW, 7, "F");
        dL(); doc.setLineWidth(0.2); doc.line(ML, p2y+7, ML+CW, p2y+7);
        doc.setFont("helvetica","normal"); doc.setFontSize(9); tN();
        doc.text(ac.n, ML+5, p2y+4.8);
        p2y += 7;
      }
      dR(); doc.setLineWidth(0.4);
      doc.rect(ML, p2y-ACCS.length*7-7.5, CW, ACCS.length*7+7.5, "S");
      p2y += 8;
    }

    bloqueAutorizacion(p2y);
    piePagina();

    // ── GUARDAR ────────────────────────────────────────────
    var safeName = LOCAL_ACTUAL.nombre.replace(/[^a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑ]/g,"").trim().substring(0,20);
    var nom      = safeName+"-CERT-"+ANO+".pdf";
    var blob     = doc.output("blob");
    var blobUrl  = URL.createObjectURL(blob);
    URLS_GENERADAS.push(blobUrl);
    if (URLS_GENERADAS.length > 10) URL.revokeObjectURL(URLS_GENERADAS.shift());

    mostrarCargando(false);

    // Marcar local done
    PUNTOS[LOCAL_ACTUAL._pi].locales[LOCAL_ACTUAL._li].done = true;
    localStorage.setItem("pf_recorrido_data", JSON.stringify(PUNTOS));
    renderPuntos();

    var hora       = new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});
    var fechaLarga = new Date().toLocaleDateString("es-EC",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

    var senvS   = document.getElementById("senv-s");   if (senvS)   senvS.textContent   = LOCAL_ACTUAL.nombre;
    var senvHr  = document.getElementById("senv-hr");  if (senvHr)  senvHr.textContent  = hora+" — "+fechaLarga;
    var senvSub = document.getElementById("senv-sub"); if (senvSub) senvSub.textContent = "PDF listo para descargar";
    var stE     = document.getElementById("st-e");     if (stE)     stE.textContent     = (LOCAL_ACTUAL.ext&&LOCAL_ACTUAL.ext.length)||"—";
    var stF     = document.getElementById("st-f");     if (stF)     stF.textContent     = fc;
    var stA     = document.getElementById("st-a");     if (stA)     stA.textContent     = ACCS.length;
    var senvPdf = document.getElementById("senv-pdf"); if (senvPdf) senvPdf.textContent = nom;

    var dl = document.getElementById("senv-dl");
    if (dl) { dl.href = blobUrl; dl.download = nom; }

    if (ACCS.length > 0) {
      var tot = 0;
      for (var i = 0; i < ACCS.length; i++) tot += ACCS[i].p;
      var iva = tot * 0.15;
      var notaC = document.getElementById("nota-c");
      var notaM = document.getElementById("nota-m");
      if (notaC) notaC.style.display = "block";
      if (notaM) notaM.textContent = "Subtotal $"+tot.toFixed(2)+" + IVA $"+iva.toFixed(2)+" = $"+(tot+iva).toFixed(2);
    } else {
      var notaC = document.getElementById("nota-c");
      if (notaC) notaC.style.display = "none";
    }

    // Siguiente local
    var sig = null, sigPi = -1, sigLi = -1;
    outer: for (var i = 0; i < PUNTOS.length; i++) {
      for (var j = 0; j < PUNTOS[i].locales.length; j++) {
        if (!PUNTOS[i].locales[j].done) { sig=PUNTOS[i].locales[j]; sigPi=i; sigLi=j; break outer; }
      }
    }
    var sc = document.getElementById("sig-c");
    if (sc) {
      if (sig) sc.innerHTML = '<div class="sgn">'+(sigPi+1)+'</div><div><div class="sgnm">'+sig.nombre+'</div><div class="sgm">'+PUNTOS[sigPi].nombre+'</div></div>';
      else     sc.innerHTML = '<div style="font-size:15px;color:var(--v);font-weight:700">¡Recorrido completado! 🎉</div>';
    }

    // Historial
    var durPDF = detenerTimer();
    var histItem = {local:LOCAL_ACTUAL, punto:PUNTO_ACTUAL, hora:hora, fotos:fc, accs:ACCS.length, url:blobUrl, nombre:nom, certNum:CERT_NUM, duracion:durPDF, tipo:"cert"};
    HISTORIAL.unshift(histItem);
    guardarHistorialDia(histItem);
    renderHistorial();

    // Enviar accesorios a Sheets
    if (ACCS.length > 0) {
      var payload = {
        accion:"facturacion", fecha:new Date().toLocaleDateString("es-EC"),
        hora:hora, cliente:LOCAL_ACTUAL.nombre,
        punto:PUNTO_ACTUAL?PUNTO_ACTUAL.nombre:"", empresa:"",
        certificado:CERT_NUM,
        accesorios:ACCS.map(function(a){ return {nombre:a.n, precio:a.p}; })
      };
      fetch(SCRIPT_URL, {method:"POST", body:JSON.stringify(payload)}).catch(function(){});
    }

    ir("senv");

  } catch(err) {
    mostrarCargando(false);
    console.error(err);
    alert("Error generando el PDF: "+err.message);
  }
}

