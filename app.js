// ============================================================
//  PREVIFUEGO — APPS SCRIPT BACKEND v2.1
//  Archivo: Code.gs
//  Estructura RECORRIDOS:
//  A=FECHA | B=TÉCNICO | C=PUNTO1 | D=MISIÓN1 | E=PUNTO2 | F=MISIÓN2
//  G=PUNTO3 | H=MISIÓN3 | I=PUNTO4 | J=MISIÓN4 | K=PUNTO5 | L=MISIÓN5
//  M=NOTAS GENERALES | N=PUBLICADO
// ============================================================

var SS_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// ── ENTRY POINT ──────────────────────────────────────────────
function doGet(e) {
  var accion = e && e.parameter && e.parameter.accion ? e.parameter.accion : "";
  var fecha  = e && e.parameter && e.parameter.fecha  ? e.parameter.fecha  : "";
  if (accion === "recorrido") return respuesta(getRecorrido(fecha));
  if (accion === "clientes")  return respuesta(getClientes());
  return respuesta({ ok: false, error: "Accion no reconocida" });
}

function doPost(e) {
  try {
    var data   = JSON.parse(e.postData.contents);
    var accion = data.accion || "facturacion";
    if (accion === "facturacion") {
      guardarFacturacion(data);
      return respuesta({ ok: true, msg: "Guardado en FACTURACION" });
    }
    return respuesta({ ok: false, error: "Accion POST no reconocida" });
  } catch (err) {
    return respuesta({ ok: false, error: err.message });
  }
}

function respuesta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET RECORRIDO DEL DÍA ────────────────────────────────────
function getRecorrido(fechaParam) {
  var ss    = SpreadsheetApp.openById(SS_ID);
  var shRec = ss.getSheetByName("📅 RECORRIDOS");
  var shCli = ss.getSheetByName("CLIENTES");
  var shExt = ss.getSheetByName("EXTINTORES");

  if (!shRec) return { ok: false, error: "Hoja RECORRIDOS no encontrada" };
  if (!shCli) return { ok: false, error: "Hoja CLIENTES no encontrada" };
  if (!shExt) return { ok: false, error: "Hoja EXTINTORES no encontrada" };

  // Fecha a buscar
  var hoy;
  if (fechaParam && fechaParam.length > 0) {
    hoy = fechaParam;
  } else {
    var d = new Date();
    hoy = String(d.getDate()).padStart(2,"0") + "/" +
          String(d.getMonth()+1).padStart(2,"0") + "/" +
          d.getFullYear();
  }

  // Buscar fila del día con PUBLICADO = SI
  // Estructura: A=FECHA B=TÉCNICO C=PUNTO1 D=MISIÓN1 E=PUNTO2 F=MISIÓN2
  //             G=PUNTO3 H=MISIÓN3 I=PUNTO4 J=MISIÓN4 K=PUNTO5 L=MISIÓN5
  //             M=NOTAS N=PUBLICADO
  var recData = shRec.getDataRange().getValues();
  var recRow  = null;
  for (var i = 2; i < recData.length; i++) {
    var fila      = recData[i];
    var fechaFila = fila[0] ? String(fila[0]).trim() : "";
    var publicado = fila[13] ? String(fila[13]).trim().toUpperCase() : ""; // col N = índice 13

    if (fila[0] instanceof Date) {
      var fd = fila[0];
      fechaFila = String(fd.getDate()).padStart(2,"0") + "/" +
                  String(fd.getMonth()+1).padStart(2,"0") + "/" +
                  fd.getFullYear();
    }
    if (fechaFila === hoy && publicado === "SI") { recRow = fila; break; }
  }

  if (!recRow) {
    return { ok: false, sin_recorrido: true, fecha: hoy,
             msg: "No hay recorrido publicado para hoy" };
  }

  // Extraer pares CÓDIGO + MISIÓN
  // índices: [2,3] [4,5] [6,7] [8,9] [10,11]
  var pares = [];
  var pairIdx = [[2,3],[4,5],[6,7],[8,9],[10,11]];
  for (var p = 0; p < pairIdx.length; p++) {
    var ci = pairIdx[p][0], mi = pairIdx[p][1];
    var cod    = recRow[ci] ? String(recRow[ci]).trim() : "";
    var mision = recRow[mi] ? String(recRow[mi]).trim() : "";
    if (cod && cod.length > 0) pares.push({ cod: cod, mision: mision });
  }

  if (pares.length === 0) {
    return { ok: false, error: "El recorrido publicado no tiene puntos" };
  }

  // Leer CLIENTES — mapa por CÓDIGO (col B, índice 1)
  var cliData = shCli.getDataRange().getValues();
  var cliMap  = {};
  for (var i = 2; i < cliData.length; i++) {
    var r   = cliData[i];
    var cod = r[1] ? String(r[1]).trim() : "";
    if (cod) {
      cliMap[cod] = {
        codigo:       cod,
        codigo_ec:    r[2]  ? String(r[2]).trim()  : "",
        grupo:        r[3]  ? String(r[3]).trim()  : "",
        marca:        r[4]  ? String(r[4]).trim()  : "",
        nombre:       r[5]  ? String(r[5]).trim()  : "",
        razon_social: r[6]  ? String(r[6]).trim()  : "",
        ruc:          r[7]  ? String(r[7]).trim()  : "",
        responsable:  r[8]  ? String(r[8]).trim()  : "",
        mes_visita:   r[9]  ? String(r[9]).trim()  : "",
        freq_mant:    r[10] ? String(r[10]).trim() : "",
        freq_recarga: r[11] ? String(r[11]).trim() : "",
        ult_mant:     r[12] ? formatFecha(r[12])   : "",
        prox_mant:    r[13] ? formatFecha(r[13])   : "",
        ult_recarga:  r[14] ? formatFecha(r[14])   : "",
        prox_recarga: r[15] ? formatFecha(r[15])   : ""
      };
    }
  }

  // Leer EXTINTORES — mapa por NOMBRE DEL LOCAL (col C, índice 2)
  var extData = shExt.getDataRange().getValues();
  var extMap  = {};
  for (var i = 2; i < extData.length; i++) {
    var r     = extData[i];
    var local = r[2] ? String(r[2]).trim() : "";
    if (!local) continue;
    if (!extMap[local]) extMap[local] = [];
    extMap[local].push({
      ubicacion:   r[3]  ? String(r[3]).trim()  : "",
      tipo:        r[4]  ? String(r[4]).trim()  : "",
      capacidad:   r[5]  ? String(r[5]).trim()  : "",
      trabajo:     r[6]  ? String(r[6]).trim()  : "",
      ult_mant:    r[7]  ? formatFecha(r[7])    : "",
      ano_recarga: r[8]  ? String(r[8]).trim()  : "",
      co2_fijo:    r[9]  ? String(r[9]).trim()  : "",
      observacion: r[10] ? String(r[10]).trim() : "",
      precio:      r[11] ? r[11]                : 0
    });
  }

  // Armar puntos
  var puntos = [];
  for (var i = 0; i < pares.length; i++) {
    var cod    = pares[i].cod;
    var mision = pares[i].mision;
    var cli    = cliMap[cod] || null;

    if (!cli) {
      puntos.push({
        num: i+1, id: i+1,
        codigo: cod, nombre: cod,
        empresa: "Cliente", direccion: "",
        responsable: "", grupo: "", marca: "",
        tipo: "M", kfc: false,
        mision: mision || "Realizar mantenimiento de extintores en el sitio.",
        extintores: [], sin_datos: true
      });
      continue;
    }

    var exts        = extMap[cli.nombre] || [];
    var tipoTrabajo = "M";
    for (var e = 0; e < exts.length; e++) {
      if (exts[e].trabajo === "R") { tipoTrabajo = "R"; break; }
    }

    // Misión: si Alejandro escribió algo en RECORRIDOS → esa.
    // Si no → misión automática según tipo de trabajo.
    var misionFinal = mision && mision.length > 0
      ? mision
      : (tipoTrabajo === "M"
          ? "Realizar mantenimiento preventivo-correctivo de extintores en el sitio."
          : "Retirar extintores para recarga en taller. Dejar provisionales y emitir recibo de constancia.");

    puntos.push({
      num:          i+1,
      id:           i+1,
      codigo:       cod,
      nombre:       cli.nombre,
      empresa:      cli.razon_social,
      direccion:    cli.codigo_ec || cod,
      responsable:  cli.responsable,
      grupo:        cli.grupo,
      marca:        cli.marca,
      tipo:         tipoTrabajo,
      kfc:          cli.grupo === "Grupo KFC",
      mision:       misionFinal,
      freq_mant:    cli.freq_mant,
      freq_recarga: cli.freq_recarga,
      ult_mant:     cli.ult_mant,
      prox_mant:    cli.prox_mant,
      ult_recarga:  cli.ult_recarga,
      prox_recarga: cli.prox_recarga,
      extintores:   exts,
      sin_datos:    false
    });
  }

  var tecnico = recRow[1]  ? String(recRow[1]).trim()  : "Raúl Romero";
  var notas   = recRow[12] ? String(recRow[12]).trim() : "";

  return {
    ok: true, fecha: hoy,
    tecnico: tecnico, notas: notas,
    total: puntos.length, puntos: puntos
  };
}

// ── GET CLIENTES ─────────────────────────────────────────────
function getClientes() {
  var ss    = SpreadsheetApp.openById(SS_ID);
  var shCli = ss.getSheetByName("CLIENTES");
  if (!shCli) return { ok: false, error: "Hoja CLIENTES no encontrada" };
  var data     = shCli.getDataRange().getValues();
  var clientes = [];
  for (var i = 2; i < data.length; i++) {
    var r   = data[i];
    var cod = r[1] ? String(r[1]).trim() : "";
    if (!cod) continue;
    clientes.push({
      codigo:       cod,
      nombre:       r[5] ? String(r[5]).trim() : "",
      razon_social: r[6] ? String(r[6]).trim() : "",
      ruc:          r[7] ? String(r[7]).trim() : "",
      grupo:        r[3] ? String(r[3]).trim() : "",
      marca:        r[4] ? String(r[4]).trim() : "",
      responsable:  r[8] ? String(r[8]).trim() : "",
      mes_visita:   r[9] ? String(r[9]).trim() : ""
    });
  }
  return { ok: true, total: clientes.length, clientes: clientes };
}

// ── GUARDAR FACTURACIÓN ──────────────────────────────────────
function guardarFacturacion(data) {
  var ss = SpreadsheetApp.openById(SS_ID);
  var sh = ss.getSheetByName("💰 FACTURACIÓN");
  if (!sh) return;
  var accs     = data.accesorios || [];
  var subtotal = 0;
  for (var i = 0; i < accs.length; i++) subtotal += (accs[i].precio || 0);
  var iva   = subtotal * 0.15;
  var total = subtotal + iva;
  var accsStr = accs.map(function(a){ return a.nombre+" $"+a.precio.toFixed(2); }).join(" | ");
  sh.appendRow([
    data.fecha       || "",
    data.hora        || "",
    data.cliente     || "",
    data.codigo      || "",
    data.empresa     || "",
    data.certificado || "",
    accsStr,
    subtotal.toFixed(2),
    iva.toFixed(2),
    total.toFixed(2)
  ]);
}

// ── HELPER ───────────────────────────────────────────────────
function formatFecha(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return String(val.getDate()).padStart(2,"0") + "/" +
           String(val.getMonth()+1).padStart(2,"0") + "/" +
           val.getFullYear();
  }
  return String(val).trim();
}
