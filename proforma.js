// ═══════════════════════════════════════════════════════════
//  PYROSHIELD — proforma.js  v1.0
//  Módulo completo de proformas para distribuidores
//  Flujo: Pendiente → Autorizada → Pend.Facturación → Factura Procesada → Finalizada
// ═══════════════════════════════════════════════════════════

// ── CATÁLOGO DE PRODUCTOS ────────────────────────────────────
var PF_PRODUCTOS_DIST = [
  {
    "id": "VENT10PQS",
    "nombre": "10LBS PQS",
    "desc": "EXTINTOR 10 LIBRAS - POLVO QUÍMICO SECO",
    "pbase": 12.89,
    "punit": 11.88,
    "stock": 874,
    "agotado": false,
    "tipo": "extintor"
  },
  {
    "id": "VENT20PQS",
    "nombre": "20LBS PQS",
    "desc": "EXTINTOR 20 LIBRAS - POLVO QUÍMICO SECO",
    "pbase": 21.35,
    "punit": 20.15,
    "stock": 0,
    "agotado": true,
    "tipo": "extintor"
  },
  {
    "id": "VENT50PQS",
    "nombre": "50LBS PQS",
    "desc": "EXTINTOR 50 LIBRAS - POLVO QUÍMICO SECO",
    "pbase": 169.05,
    "punit": 132.31,
    "stock": 7,
    "agotado": false,
    "tipo": "extintor"
  },
  {
    "id": "VENT100PQS",
    "nombre": "100LBS PQS",
    "desc": "EXTINTOR 100 LIBRAS - POLVO QUÍMICO SECO",
    "pbase": 216.05,
    "punit": 168.88,
    "stock": 26,
    "agotado": false,
    "tipo": "extintor"
  },
  {
    "id": "VENT150PQS",
    "nombre": "150LBS PQS",
    "desc": "EXTINTOR 150 LIBRAS - POLVO QUÍMICO SECO",
    "pbase": 280.25,
    "punit": 217.99,
    "stock": 12,
    "agotado": false,
    "tipo": "extintor"
  },
  {
    "id": "VENT5CO2",
    "nombre": "5LBS CO2",
    "desc": "EXTINTOR 5 LIBRAS - GAS CARBÓNICO CO2",
    "pbase": 26.7,
    "punit": 22.4,
    "stock": 59,
    "agotado": false,
    "tipo": "extintor"
  },
  {
    "id": "VENT10CO2",
    "nombre": "10LBS CO2",
    "desc": "EXTINTOR 10 LIBRAS - GAS CARBÓNICO CO2",
    "pbase": 34.65,
    "punit": 33.85,
    "stock": 0,
    "agotado": true,
    "tipo": "extintor"
  },
  {
    "id": "VENT20CO2C",
    "nombre": "20LBS CO2 CON CARRO",
    "desc": "EXTINTOR 20 LIBRAS CO2 CON CARRO - GAS CARBÓNICO",
    "pbase": 106.99,
    "punit": 104.99,
    "stock": 19,
    "agotado": false,
    "tipo": "extintor"
  },
  {
    "id": "VENT2.5AQ",
    "nombre": "2.5 GLNS AGUA QUIMICA",
    "desc": "EXTINTOR 2.5 GALONES - AGUA QUÍMICA",
    "pbase": 63.0,
    "punit": 61.25,
    "stock": 24,
    "agotado": false,
    "tipo": "extintor"
  },
  {
    "id": "CABPQS1020",
    "nombre": "CABEZAL PQS 10/20",
    "desc": "CABEZAL PARA EXTINTOR PQS 10-20 LBS",
    "pbase": 2.95,
    "punit": 2.8,
    "stock": 0,
    "agotado": true,
    "tipo": "accesorio"
  },
  {
    "id": "MANOPQS",
    "nombre": "MANOMETRO 195PSI",
    "desc": "MANÓMETRO 195 PSI PARA EXTINTOR PQS",
    "pbase": 0.85,
    "punit": 0.7,
    "stock": 0,
    "agotado": true,
    "tipo": "accesorio"
  },
  {
    "id": "MANG10PQS",
    "nombre": "MANGUERA 10PQS",
    "desc": "MANGUERA PARA EXTINTOR PQS 10 LBS",
    "pbase": 0.9,
    "punit": 0.8,
    "stock": 327,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "MANG20PQS",
    "nombre": "MANGUERA 20PQS",
    "desc": "MANGUERA PARA EXTINTOR PQS 20 LBS",
    "pbase": 0.9,
    "punit": 0.8,
    "stock": 679,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "CABCO2510",
    "nombre": "CABEZAL CO2 5/10",
    "desc": "CABEZAL PARA EXTINTOR CO2 5-10 LBS",
    "pbase": 7.8,
    "punit": 7.0,
    "stock": 222,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "CORN5CO2",
    "nombre": "CORNETA 5CO2",
    "desc": "CORNETA PARA EXTINTOR CO2 5 LBS",
    "pbase": 2.8,
    "punit": 2.2,
    "stock": 626,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "MANG10CO2",
    "nombre": "MANGUERA 10CO2",
    "desc": "MANGUERA CON CORNETA PARA EXTINTOR CO2 10 LBS",
    "pbase": 7.2,
    "punit": 6.4,
    "stock": 588,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "SOPCO2R",
    "nombre": "SOPORTE CO2 ROJO",
    "desc": "SOPORTE METÁLICO ROJO PARA EXTINTOR CO2",
    "pbase": 1.2,
    "punit": 1.15,
    "stock": 352,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "SOPPQS10",
    "nombre": "SOPORTE PQS 10",
    "desc": "SOPORTE METÁLICO PARA EXTINTOR PQS 10 LBS",
    "pbase": 0.98,
    "punit": 0.85,
    "stock": 440,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "SOPPQS20",
    "nombre": "SOPORTE PQS 20",
    "desc": "SOPORTE METÁLICO PARA EXTINTOR PQS 20 LBS",
    "pbase": 0.98,
    "punit": 0.85,
    "stock": 506,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "ABRPQS",
    "nombre": "ABRAZADERAS PLASTICAS",
    "desc": "ABRAZADERA PLÁSTICA PARA EXTINTOR",
    "pbase": 0.26,
    "punit": 0.24,
    "stock": 2619,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "CO2CABMAR",
    "nombre": "CO2 CABEZAL MARITIMO",
    "desc": "CABEZAL MARÍTIMO PARA EXTINTOR CO2",
    "pbase": 42.25,
    "punit": 38.46,
    "stock": 73,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "CO2DISRAP",
    "nombre": "CO2 DISPARO RAPIDO",
    "desc": "VÁLVULA DE DISPARO RÁPIDO PARA CO2",
    "pbase": 16.8,
    "punit": 13.95,
    "stock": 121,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "SEGPLAM",
    "nombre": "SEGUROS PLASTICOS AMARILLO",
    "desc": "SEGURO PLÁSTICO AMARILLO PARA EXTINTOR",
    "pbase": 0.08,
    "punit": 0.06,
    "stock": 14767,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "MANG15M",
    "nombre": "MANGUERA 15M",
    "desc": "MANGUERA CONTRA INCENDIOS 15 METROS DOBLE CHAQUETA",
    "pbase": 38.61,
    "punit": 36.98,
    "stock": 162,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "MANG30M",
    "nombre": "MANGUERA 30M",
    "desc": "MANGUERA CONTRA INCENDIOS 30 METROS DOBLE CHAQUETA",
    "pbase": 69.1,
    "punit": 64.28,
    "stock": 99,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "ANG112",
    "nombre": "ANGULAR 1 1/2",
    "desc": "VÁLVULA ANGULAR 1 1/2 PULGADAS",
    "pbase": 33.83,
    "punit": 31.48,
    "stock": 149,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "ANG212",
    "nombre": "ANGULAR 2 1/2",
    "desc": "VÁLVULA ANGULAR 2 1/2 PULGADAS",
    "pbase": 67.11,
    "punit": 61.26,
    "stock": 76,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "PIT112",
    "nombre": "PITON 1 1/2",
    "desc": "PITÓN 1 1/2 PULGADAS",
    "pbase": 19.8,
    "punit": 17.8,
    "stock": 168,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "NIP112",
    "nombre": "NIPLE 1 1/2",
    "desc": "NIPLE 1 1/2 PULGADAS",
    "pbase": 7.68,
    "punit": 6.88,
    "stock": 292,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "BRAZOPOR",
    "nombre": "BRAZO PORTAMANG",
    "desc": "BRAZO PORTAMANGUERA PARA GABINETE",
    "pbase": 12.91,
    "punit": 11.71,
    "stock": 97,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "HACHA",
    "nombre": "HACHA",
    "desc": "HACHA PARA EMERGENCIAS CONTRA INCENDIOS",
    "pbase": 12.4,
    "punit": 11.78,
    "stock": 70,
    "agotado": false,
    "tipo": "accesorio"
  },
  {
    "id": "SPANNER",
    "nombre": "SPANNER",
    "desc": "LLAVE SPANNER PARA ACOPLES DE MANGUERA",
    "pbase": 6.98,
    "punit": 5.98,
    "stock": 95,
    "agotado": false,
    "tipo": "accesorio"
  }
];

// ── BASE DE CLIENTES DISTRIBUIDORES (741) ────────────────────
var PF_CLIENTES_DIST = [{"ruc":"0993314374001","razon":"3HB SOCIEDAD ANÓNIMA","dir":"DECIMA Y FRANCISCO SEGURA","tel":"0999406665","correo":""},{"ruc":"0918186123001","razon":"ABAD SOLEDISPA LORENA GARDENIA","dir":"LA 21 Y LA 1","tel":"0999612118","correo":""},{"ruc":"0993366833001","razon":"ABARI S.A.S.","dir":"COOPERATIVA QUISQUIS, MZ49 SL1, DIAGONAL A LA FACSO","tel":"6000775, 0992094544","correo":"mpdcn8@gmail.com"},{"ruc":"1723496236001","razon":"ACOSTA LOPEZ ALINSON","dir":"PORTETE 4525 E/LA 20 Y LA 21AVA FEBRES CORDERO","tel":"","correo":""},{"ruc":"0992243619001","razon":"ADMINISTRACION DE RIESGOS AUDITORIA EN SEGURIDAD Y COBRANZAS ARASCO C.A.","dir":"CDLA GARZOTA 1 MZ 1 SL 6","tel":"2627480","correo":""},{"ruc":"0992927275001","razon":"AFREK S.A.","dir":"ESMERALDAS #1018 E/VELEZ Y HURTADO","tel":"046039006","correo":"matriz@cofreire.com"},{"ruc":"0993332208001","razon":"AGO S.A.S.","dir":"MAPASINGUE ESTE CALLE 8VA Y AV 1ERA","tel":"042003808, 2003808","correo":"agosas.contabilidad@gmail.com, ventas@agosas.com"},{"ruc":"0990645736001","razon":"AGROFORESTAL SALATI S.A.","dir":"AV. JOSE DE ANTEPARA 921 Y HURTADO","tel":"04-2523830","correo":""},{"ruc":"0903472298001","razon":"AGUILERA VIDAL VICTOR HUGO","dir":"MACHALA #2312 E/CAP. NAJERA Y CUENCA","tel":"","correo":""},{"ruc":"1311781288001","razon":"ALAY TOALA LUIS ALFREDO","dir":"VENEZUELA 3701 Y LA 11AVA","tel":"0983356399","correo":""},{"ruc":"0906116108001","razon":"ALBIN JOSE CRIOLLO REYES","dir":"AV MACHALA 2003 Y AYACUCHO","tel":"042364572","correo":""},{"ruc":"1317542338001","razon":"ALCIVAR LOOR ROXANNA NICOLLE","dir":"4 DE NOVIEMBRE E/LA 11 Y LA 12","tel":"0963959016","correo":""},{"ruc":"0993142905001","razon":"ALMODOBAR","dir":"AV. CARLOS JULIO AROSEMENA J-023","tel":"0983674528","correo":"marcecimendozaar@hotmail.com"},{"ruc":"0910694553001","razon":"ALVARADO AVILES XAVIER ANTONIO","dir":"PORTETE #2810 Y ABEL CASTILLO","tel":"","correo":"brauliobodero@gmail.com"},{"ruc":"0921970810001","razon":"ALVARADO TORRES JUAN CARLOS","dir":"GALLEGOS LARA 2210 Y PORTETE","tel":"0987312031","correo":""},{"ruc":"0910801406001","razon":"AMAGUAYA MACAS LUIS ALFREDO","dir":"PORTETE 2922 Y G. LARA","tel":"0959265810","correo":""},{"ruc":"0950473629001","razon":"AMAT BALON CRISTHIAN ALEXANDER","dir":"CDLA LA FERROVIARIA","tel":"","correo":""},{"ruc":"0605273010001","razon":"AMBOYA MALAN LUIS JORGE","dir":"LA 10MA Y ARGENTINA","tel":"0981844041","correo":""},{"ruc":"0918391136001","razon":"ANA MARIA ARELLANO ROMERO","dir":"MAPASINGUE ESTE CALLE 8VA 107 Y AV. PRIMERA","tel":"","correo":"maquinarias_macon@hotmail.com, maquinaria_macon@hotmail.com"},{"ruc":"0905184289001","razon":"ANA MARIA DOMINGUEZ VILLARREAL","dir":"GARCIA GOYENA #2543C Y GUERRERO VALENZUELA","tel":"236210","correo":""},{"ruc":"0922427174001","razon":"ANA NOVILLO RAMIREZ","dir":"CDLA RECREO MZ 222 V4","tel":"","correo":"cristiannovilloramirez@outlook.com"},{"ruc":"0919803171001","razon":"ANA ZORAYA CORNEJO PRADO","dir":"FLOR DE VERANO SL55 CHONGON","tel":"","correo":"zwet80@yahoo.it"},{"ruc":"0919921643001","razon":"ANDAGOYA JACOME ERWIN JAVIER","dir":"PORTETE #2716 Y ABEL CASTILLO","tel":"0985008150","correo":""},{"ruc":"1205642950001","razon":"ANDRADE BRAVO NATALIA EMPERATRIZ","dir":"PORTETE 3741 Y ENTRE LA 11VA Y 12 AVA","tel":"","correo":""},{"ruc":"1801238047001","razon":"ANDRADE RIBADENEIRA MARIO OSWALDO","dir":"PORTETE #2721 Y ABEL CASTILLO","tel":"2369021","correo":""},{"ruc":"0920188646001","razon":"ANDRADE VARGAS ANAHI","dir":"CHILE Y CLEMENTE BALLEN","tel":"0985144037","correo":"andrade.anahi97@gmail.com"},{"ruc":"0102990165001","razon":"ANGEL MESIAS GUZÑAY SIAVICHAY","dir":"CHIMBORAZO #3100 Y BOLIVIA #601","tel":"","correo":""},{"ruc":"1104526700001","razon":"ANGEL VINICIO BALCAZAR CAMPOVERDE","dir":"PORTETE #2617 Y BABAHOYO","tel":"","correo":""},{"ruc":"0909231698001","razon":"ANILEMA RAMOS ELIZABETH CRISTINA","dir":"AGUIRRE 2304 E/TUBGURAHUA Y LIZARDO GARCIA","tel":"","correo":"j.e.l.a12@outlook.com"},{"ruc":"0992852976001","razon":"ARAFISA S.A. ADMINISTRADORA DE FONDOS Y FIDEICOMISOS","dir":"JUNIN 114 Y MALECON SIMON BOLIVAR","tel":"","correo":""},{"ruc":"1711216216001","razon":"ARANA CEDEÑO FRANCISCA EUFEMIA","dir":"PORTETE 3310 Y NICOLAS SEGOVIA","tel":"0980948160","correo":""},{"ruc":"0920487766001","razon":"ARAUJO CHAVEZ LUIS ANDRES","dir":"VENEZUELA 3215 Y LA 7MA","tel":"0993079617","correo":"luisandres_publicidad@hotmail.com"},{"ruc":"0952750321001","razon":"ARBITO AREVALO ANDREA AZUCENA","dir":"LETAMENDI 2812 ENTRE ABEL CASTILLO Y GUERRERO VALENZUELA","tel":"0960955671","correo":""},{"ruc":"0940539729001","razon":"ARCE CHAGUAY SAIDA ELIZABETH","dir":"ALBORADA 9NA ETAPA MZ911 VILLA1","tel":"","correo":"saida1517@hotmail.com"},{"ruc":"1704920154001","razon":"ARCENTALES CONFORME MANUEL ANTONIO","dir":"LETAMENDI 4504 Y LA 19AVA","tel":"2468817","correo":""},{"ruc":"0992454733001","razon":"ARCENTALES Y ASOCIADOS","dir":"LETAMENDI Y LA 19AVA","tel":"2468817","correo":""},{"ruc":"0920929650001","razon":"ARMIJOS VERA RONNYE ISMAEL","dir":"BELLAVISTA","tel":"09888115951","correo":""},{"ruc":"1792134250001","razon":"ARQUIHABITAR INMOBILIARIA C.A.","dir":"AV. PAMPITE OE6-53 Y SIMON VALENZUELA, EDIF. YOO, 4TO PISO OF#405","tel":"022811831","correo":""},{"ruc":"0926201583001","razon":"ARTEAGA NARANJO MONICA ALEXANDRA","dir":"AV SAMUEL CISNEROS MZ17 SOLAR 46","tel":"0980926136","correo":""},{"ruc":"0993272515001","razon":"ARTHROMED S.A.","dir":"URB. RENACER MZ139 V13","tel":"","correo":"arthromed2050@gmail.com"},{"ruc":"0993272515001","razon":"ARTHROMED S.A.","dir":"URB. RENACER MZ139 V13","tel":"","correo":"arthromed2050@gmail.com"},{"ruc":"0926583808001","razon":"ASHLEY AREVALO ALAVA","dir":"METROPOLIS II E MZ 1367 VILLA42","tel":"","correo":""},{"ruc":"0992469943001","razon":"ASOCIACION AFROECUATORIANA MUJERES DE LUCHA","dir":"ABEL CASTILLO #805 E/ARGENTINA Y SAN MARTIN","tel":"","correo":""},{"ruc":"0993139114001","razon":"ASOCIACION DE PROPIETARIOS DEL CENTRO COMERCIAL MIX CENTER","dir":"AV. LEON FEBRES CORDERO S/N KM18, VIA A LA AURORA PASCUALES","tel":"043909136","correo":"administracion@mixcenter.ec"},{"ruc":"0603860099001","razon":"AUCANSHALA MORA RAUL RODRIGO","dir":"LEONIDAS PLAZA GUTIERREZ 3913 E/ LA A Y LA B","tel":"2334162","correo":""},{"ruc":"0190391906001","razon":"AUSTROPARTS CIA. LTDA.","dir":"AV. ESPAÑA #18-85 INTERSECCION SEGOVIA","tel":"072802053","correo":"ncenteno1@jacecuador.com"},{"ruc":"1790848027001","razon":"AVALUAC CIA. LTDA.","dir":"AV 9 DE OCTUBRE Y LOS RIOS, EDIF FINANSUR","tel":"042283850","correo":""},{"ruc":"0919832741001","razon":"AVEIGA SUAREZ MARCO ANTONIO","dir":"ALFREDO VALENZUELA 1202 Y AV 23 SO","tel":"098 687 8798","correo":"conseg.ecu@gmail.com"},{"ruc":"0915767339001","razon":"AVILA HURTADO LAURA ISABEL","dir":"LA 38AVA Y LA CH","tel":"","correo":""},{"ruc":"0906872742001","razon":"AVILES BRIONES JORGE ENRIQUE","dir":"AV. QUITO #1810 Y AYACUCHO","tel":"0993704934","correo":"docs.sumiseg@outlook.com"},{"ruc":"0925288185001","razon":"AVILES MITE VICTOR ANDRES","dir":"ACACIAS MZ C18 V8","tel":"0995889829","correo":""},{"ruc":"0919363713001","razon":"BAQUERIZO ASENCIO LAURA MABEL","dir":"LA 26 Y LA A","tel":"","correo":"asesoriasmabeltravel@gmail.com"},{"ruc":"0941752545001","razon":"BAQUERO CEBALLOS ELIZABETH MICHELL","dir":"PORTETE #3017 E/GALLEGOS LARA Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0941752545001","razon":"BAQUERO CEBALLOS ELIZABETH MICHELL","dir":"PORTETE #3017 E/GALLEGOS LARA Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"1202063333001","razon":"BARAHONA VEGA NARCISA DE FATIMA","dir":"CARCHI #2409 E/CALICUCHIMA Y MALDONADO","tel":"0985203177","correo":""},{"ruc":"0991254749001","razon":"BARLOTTINI S.A.","dir":"KM 11.5 EDIF. PARQUE INDUSTRIAL EL SAUCE MZ - E","tel":"","correo":""},{"ruc":"0914925771001","razon":"BARRERA BARAHONA SILVIA ELIZABETH","dir":"PORTETE 2832 Y GUERRERO VALENZUELA","tel":"0994084338","correo":""},{"ruc":"1792510457001","razon":"BAZFEX S.A.","dir":"AV. AMAZONAS Y NACIONES UNIDAS EDIF. LA PREVISORA PISO4 OF401","tel":"02-4514119","correo":"consuelo.parra@bazfex.com, alexander.palacio@bazfex.com, tesoreria@bazfex.com"},{"ruc":"1310031107001","razon":"BAZURTO ALVIA IDOLFO DISNEY","dir":"LEONIDAS PLAZA 2301 Y VENEZUELA","tel":"0993933464","correo":""},{"ruc":"0959076738001","razon":"BAZURTO PARRAGA ANDERSON ESTIVEN","dir":"PORTETE 2200 Y LEONIDAD PLAZA","tel":"0985454989","correo":""},{"ruc":"0913045928001","razon":"BECERRA TUMAILLE AZUCENA","dir":"LEONIDAS PLAZA #1932 Y ARGENTINA","tel":"2370623","correo":""},{"ruc":"0951585850001","razon":"BEDOY TORRES NOELIA PAOLA","dir":"RUMICHACA Y JUNIN","tel":"0969008578","correo":""},{"ruc":"0993328391001","razon":"BEMART S.A.S.","dir":"AV FRANCISCO DE ORELLANA Y AV JOSE SANTIAGO CASTILLO TORRE MILLENIUM","tel":"","correo":"BEMARTSAS@GMAIL.COM"},{"ruc":"0914329776001","razon":"BENALCAZAR CORTEZ GLADYS MIROSLABA","dir":"LA 23AVA 5005 Y HUANCAVILCA","tel":"09944118765","correo":""},{"ruc":"0954269700001","razon":"BENAVIDES CHAVEZ ARTURO RAUL","dir":"SOLAR 12","tel":"0969382144","correo":""},{"ruc":"0907660328001","razon":"BENITES SOLIS JAIME GALO","dir":"OMNIHOSPITAL","tel":"0985045009","correo":""},{"ruc":"0917103939001","razon":"BERREZUETA RIOS FERNANDO JAVIER","dir":"CHIMBORAZO 214 Y SAN MARTIN","tel":"","correo":"facturas@figuraysalud.com.ec"},{"ruc":"0992447729001","razon":"BESTLOGISTICS &amp; SOLUTIONS S.A.","dir":"NAHIM ISAIAS BARQUET SOLAR 6-7 Y MIGUEL H ALCIVAR - EDIFICIO ONYX PISO 3","tel":"","correo":""},{"ruc":"0992273429001","razon":"BONTEX S.A.","dir":"CHILE #329 Y AGUIRRE","tel":"042329207","correo":"bontexsa@hotmail.com"},{"ruc":"0952530301001","razon":"BORBOR OLVERA JACINTO ALFREDO","dir":"SAN MARTIN 2703 Y ABEL CASTILLO","tel":"","correo":""},{"ruc":"0921975066001","razon":"BOSQUEZ BOSQUEZ EDISON ROLANDO","dir":"SAMBORONDON EDIF XIMA PISO 1 OF 118","tel":"0990855812","correo":"dentalbosquez@hotmail.com"},{"ruc":"0958786774001","razon":"BRIONES CAJAMARCA KATHERINE NICOLE","dir":"MARTHA DE ROLDOS AV38 MZ705 SL30","tel":"0999160445","correo":""},{"ruc":"0703361014001","razon":"BUELE JARA ANGEL GIOVANNY","dir":"AV. LAS ESCLUSAS, LOS CIDROS MZ 2 SL 4 Y AV. 25 DE JULIO","tel":"2484198","correo":""},{"ruc":"0913146403001","razon":"BUENO QUILAMBAQUI JOSE CIPRIANO","dir":"4 DE NOVIEMBRE 4215 E/LA 17AVA Y LA 18AVA","tel":"0969975978","correo":""},{"ruc":"1792923298001","razon":"BULLS &amp; VITAMINS SUPPLEMENTS S.A.","dir":"C.C. PLAZA MAYOR","tel":"","correo":"Contabilidad@bull-corp.com"},{"ruc":"1792923298001","razon":"BULLS &amp; VITAMINS SUPPLEMENTS S.A.","dir":"C.C. PLAZA MAYOR","tel":"","correo":"Contabilidad@bull-corp.com"},{"ruc":"1309060703001","razon":"BURGOS ALAVA MARYURI MARIBEL","dir":"LEONIDAS PLAZA Y GARCIA GOYENA","tel":"0997600702","correo":""},{"ruc":"0400778379001","razon":"BYRON JAVIER ARGOTI ZAMBRANO","dir":"CC. MALL DEL SUR","tel":"","correo":""},{"ruc":"0914732540001","razon":"CABRERA MICOLTA ALBA GABRIELA","dir":"GALLEGOS LARA Y VENEZUELA ESQ.","tel":"0967825922","correo":""},{"ruc":"1105623480001","razon":"CACAY BENITEZ GERARDO DANIEL","dir":"PORTETE Y LA 12AVA","tel":"0961799077","correo":""},{"ruc":"0953762812001","razon":"CACAY BENITEZ MARICELA DEL CARMEN","dir":"PORTETE Y LA 24","tel":"","correo":""},{"ruc":"0911386480001","razon":"CAJAMARCA QUIZHPI SEGUNDO HERMEL","dir":"PORTETE 3301 Y LA 7MA","tel":"","correo":""},{"ruc":"0923993315001","razon":"CALDERON CAMPOS JAIME ALBERTO","dir":"NICOLAS SEGOVIA 1511 Y MALDONADO","tel":"","correo":""},{"ruc":"0926201054001","razon":"CALDERON RENTERIA ANGELICA DEL ROCIO","dir":"PORTETE 2611 E/LIZARDO GARCIA Y BABAHOYO","tel":"0980174140","correo":""},{"ruc":"0954400610001","razon":"CALLE DELGADO HECTOR GONZALO","dir":"VILLAVICENCIO 0102 Y HUANCAVILCA","tel":"","correo":""},{"ruc":"1202305254001","razon":"CAMACHO SANCHEZ JUAN ROBERTO","dir":"CDLA. LIMONAR MZ2381 SL9 ESQ","tel":"0997858033","correo":"gerente@jurocsan.com"},{"ruc":"0993375108001","razon":"CAMALANI S.A.S.","dir":"ROBLES 109 Y CHAMBERS","tel":"","correo":"valentina.orrantia@champmar.com"},{"ruc":"0990549591001","razon":"CAMARONERA AGROMARINA S.A.","dir":"ROBLES #109 Y CHAMBERS","tel":"","correo":"valentina.orrantia@champmar.com, andrea.torres@champmar.com, martha.montalvo@champmar.com,"},{"ruc":"0993118044001","razon":"CAMARONERA LAS DELICIAS CAMDELICIAS S.A.","dir":"KM 13.5 AV LEON FEBRES CORDERO S/N EDIF RIVER PLAZA OF203 PISO2","tel":"043901292","correo":"asistente1camdelicias@gmail.com, contador1camdelicias@gmail.com"},{"ruc":"0990497214001","razon":"CAMARONERA LEBAMA S.A.","dir":"ROBLES #109 Y CHAMBERS","tel":"","correo":"valentina.orrantia@champmar.com, andrea.torres@champmar.com"},{"ruc":"0918096769001","razon":"CAMPOS MANCERO ALBERTO JULIO","dir":"PORTETE Y LA 11AVA","tel":"0997022049","correo":""},{"ruc":"0910863042001","razon":"CAMPOVERDE SANCHEZ JOHNSON","dir":"LIZARDO GARCIA #2926 Y BOLIVIA","tel":"","correo":""},{"ruc":"0923306393001","razon":"CAMPOVERDE ZHAGUI JESSENIA MARLENE","dir":"DOMINGO COMIN Y CHAMBERS","tel":"0989737524","correo":""},{"ruc":"0902994466001","razon":"CAÑAR VICTOR MANUEL","dir":"SAN MARTIN 2813 Y GUERRERO VALENZUELA","tel":"0985110419","correo":""},{"ruc":"0916660012001","razon":"CANESSA VELASQUEZ GEOVANNY FRANCISCO","dir":"LA 16AVA Y CAMILO DESTRUGE","tel":"0984365470","correo":""},{"ruc":"0992855843001","razon":"CAPA DE ORO CAPDEORO S.A.","dir":"EL TRIUNFO - CALLE JUAN MONTALVO","tel":"042010610","correo":""},{"ruc":"0993247790001","razon":"CARGOFREIGHT LOGISTIC S.A.","dir":"ALBAN BORJA EDIF LA LINEA OF2","tel":"2205544","correo":"accounts@universalcargoecuador.com, apertura@universalcargoecuador.com"},{"ruc":"1716626484001","razon":"CARLOS ALBERTO LOPEZ RIOFRIO","dir":"C.C. MALL EL FORTIN LOCAL 264","tel":"","correo":"carlosalberto_new@hotmail.com"},{"ruc":"0914385463001","razon":"CARLOS LUIS BORJA SUCO","dir":"CALLE A Y LA 8VA","tel":"","correo":"carlosborjasuco@gmail.com"},{"ruc":"0916449853001","razon":"CARLOS TAYO SANCHEZ","dir":"PORTETE Y LA 29AVA","tel":"0983543207","correo":""},{"ruc":"0909117039001","razon":"CARMEN DEL ROCIO MARTINEZ PAREDES","dir":"DOMINGO SAVIO 832 Y GUERRERO VALENZUELA","tel":"","correo":""},{"ruc":"0910837632001","razon":"CARRANZA ORTIZ VICTOR NICOLAS","dir":"GENERAL GOMEZ 2809 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"1204563512001","razon":"CASTRO SOLIS LUBERLANIA EDELMIRA","dir":"PORTETE #3021 E/LEONIDAS PLAZA Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0923520290001","razon":"CATHERINE RINCON PALACIOS","dir":"KENNEDY VIEJA AV FRANCISCO BOLOÑA Y CALLE 2DA ESQ.","tel":"","correo":"amolina.lvk@gmail.com"},{"ruc":"0968533000001","razon":"CE-EAAC","dir":"KM 25 VIA DURAN TAMBO","tel":"042500824","correo":"ce-eaac@hotmail.com, ventas_previfuego@hotmail.com"},{"ruc":"0968533000001","razon":"CE-EAAC","dir":"KM 25 VIA DURAN TAMBO","tel":"042500824","correo":"ce-eaac@hotmail.com, ventas_previfuego@hotmail.com"},{"ruc":"0919905828001","razon":"CECILIA LORENA BARRETO ZAMBRANO","dir":"NICOLAS SEGOVIA #3009 Y DOMINGO SAVIO","tel":"3074368","correo":""},{"ruc":"1310836877001","razon":"CEDEÑO PINO MYRIAM LISETTE","dir":"CDLA LOS CEIBOS CENTER TORRE 1 PISO 3","tel":"","correo":""},{"ruc":"1310836877001","razon":"CEDEÑO PINO MYRIAM LISETTE","dir":"CEIBOS CENTER PISO 3 OF 301","tel":"","correo":"Infolcdental@gmail.com"},{"ruc":"0993402349001","razon":"CENTRO ODONTOPEDIATRICO INTEGRAL CENPEDINT S.A.S.","dir":"EDIFICIO CEIBOS CENTER","tel":"0958888191","correo":""},{"ruc":"0954018891001","razon":"CEPEDA GUAPI VILMA MARIBEL","dir":"LA 11AVA Y PORTETE ESQ","tel":"","correo":""},{"ruc":"0604876607001","razon":"CEPEDA YUQUILEMA MANUEL EFRAIN","dir":"12 AVA. 1523 Y CALICUCHIMA","tel":"0967815346","correo":""},{"ruc":"1702933944001","razon":"CEVALLOS ABARCA YEN ESPERANZA","dir":"VICTOR MANUEL RENDON Y CORDOVA","tel":"2566585","correo":""},{"ruc":"0910947175001","razon":"CEVALLOS GOMEZ FRANCO BOGOMIL","dir":"PICHINCHA #704 Y 10 DE AGOSTO","tel":"0998721373","correo":""},{"ruc":"0920959087001","razon":"CEVALLOS TOASA CINTHIA ALEXANDRA","dir":"LEONIDAS PLAZA GUTIERREZ 1714 Y F. MARCOS Y LETAMENDI","tel":"","correo":""},{"ruc":"0911128205001","razon":"CHACON MACIAS JOSE FRANCISCO","dir":"LORENZO DE GARAICOA 2816 Y CALICUCHIMA ESQUINA","tel":"","correo":"f_chaconm@hotmail.com"},{"ruc":"0905844320001","razon":"CHAGLIA ARISTEGA ROSA MARIA","dir":"CASA LAGUNA","tel":"0968226297","correo":""},{"ruc":"0910716125001","razon":"CHANE MARTINEZ MARCO ANTONIO","dir":"NUEVA KENNEDY 200 Y AVENIDA DEL PERIODISTA","tel":"","correo":"marco31_99@yahoo.com"},{"ruc":"0604418046001","razon":"CHARCO GUARACA MARIA INES","dir":"CDLA LOS ALMENDROS","tel":"","correo":""},{"ruc":"1793195539001","razon":"CHARTER LINK LOGISTICS ECUADOR S.A.S.","dir":"AV. PTM GILBERT EDIF THE POINT PUERTO SANTA ANA","tel":"","correo":""},{"ruc":"1793195539001","razon":"CHARTER LINK LOGISTICS ECUADOR S.A.S.","dir":"AV.P.J.M.GILBERT 8 Y PTO. SANTA ANA","tel":"","correo":"catherine.mejia@ctl.latam.com"},{"ruc":"0962544177001","razon":"CHEJADE LOPEZ MARILYN","dir":"BRISAS DEL RIO MZ D1 SL 6 AV JOSE MARIA EGAS MIRANDA LOCAL 2","tel":"0962671161","correo":""},{"ruc":"0930771811001","razon":"CHICAIZA GUERRERO CHRISTIAN ALONSO","dir":"JOSE MASCOTE 1401A Y CLEMENTE BALLEN","tel":"","correo":""},{"ruc":"0604229039001","razon":"CHICAIZA LUMISACA MARIA ROSA","dir":"GOMEZ RENDON #2724 E/GALLEGOS LARA Y LEONIDAS PLAZA","tel":"0993345353, 0982890038","correo":""},{"ruc":"0906743729001","razon":"CHONILLO AGUILAR GUSTAVO RICARDO","dir":"COLOMBIA 2627 Y LEONIDAS PLAZA","tel":"0994387462","correo":""},{"ruc":"0920353646001","razon":"CHRISTIAN PLUAS MARTINEZ","dir":"3ERCALLEJON SEDALANA Y LA 8VA","tel":"","correo":"angee_g29outlook.com"},{"ruc":"0603851908001","razon":"CHUCHO CEPEDA SARA MARIA","dir":"CDLA LAS ACACIAS MZ C17 V5","tel":"","correo":""},{"ruc":"0603851908001","razon":"CHUCHO CEPEDA SARA MARIA","dir":"CDLA LAS ACACIAS MZ C17 V5","tel":"","correo":""},{"ruc":"0917504714001","razon":"CHUYA ZHINDON ANGEL ROMAN","dir":"PORTETE Y LEONIDAS PLAZA","tel":"0993313448","correo":""},{"ruc":"1792870259001","razon":"CITYMAR","dir":"BENJAMIN CARRION SN Y FELIPE PEZO","tel":"","correo":"contabilidadurdesmar@gmail.com"},{"ruc":"0914585658001","razon":"CLAUDIA FAJARDO AVILES","dir":"LA 6TA Y SAN MARTIN","tel":"","correo":""},{"ruc":"0992986433002","razon":"CLINICA ODONTOLOGICA LAFAMILIA ODONTOLAFAM S.A.","dir":"COLINAS DE LOS CEIBOS","tel":"","correo":""},{"ruc":"0992897813001","razon":"CLINICA ODONTOLOGICA SU-RI-AN SA","dir":"VICTOR EMILIO ESTRADA #1009 ENTRE ILANES Y JIGUAS","tel":"880345","correo":"surian_odontologiaintegral@hotmail.com"},{"ruc":"0917454050001","razon":"COBOS PONCE SHIRLEY MELBA","dir":"LA JOYA","tel":"0982651360","correo":"cobosshirley@hotmail.com"},{"ruc":"1792489776001","razon":"COBRA FACIL FABRACILISA S.A.","dir":"AV. FRANCISCO DE ORELLANA Y EUGENIO ALMAZAN, KENNEDY NORTE MZ #103 SOL#03","tel":"02-3932400","correo":"asistentegye@recover.ec, vvilla@recover.ec"},{"ruc":"0104909106001","razon":"COCHANCELA SAGBAY CARLOS IVAN","dir":"LA 8VA Y AZUAY","tel":"0961230522","correo":""},{"ruc":"0992501545001","razon":"CODEANSA","dir":"AV DE LAS AMERICAS CDLA SIMON BOLIVAR MZ5 SL24","tel":"","correo":""},{"ruc":"0992501545001","razon":"CODEANSA","dir":"AV DE LAS AMERICAS CDLA SIMON BOLIVAR MZ5 SL24","tel":"","correo":""},{"ruc":"0924144769001","razon":"COELLO ALVARADO JONATHAN STEVEN","dir":"HUANCAVILCA 2407 Y TUNGURAHUA","tel":"0982686834","correo":""},{"ruc":"0990981167001","razon":"COLEGIO DE INGENIEROS COMERCIALES DEL GUAYAS","dir":"ALEJO LASCANO Y CARCHI","tel":"","correo":"contabilidad@cicog.com"},{"ruc":"0990981167001","razon":"COLEGIO DE INGENIEROS COMERCIALES DEL GUAYAS","dir":"ALEJO LASCANO Y CARCHI","tel":"","correo":"contabilidad@cicog.com"},{"ruc":"0190316025001","razon":"COMERCIAL CARLOS ROLDAN CIA. LTDA.","dir":"AV. ESPAÑA 899 Y SEVILLA","tel":"2599011","correo":"ncenteno1@jacecuador.com"},{"ruc":"0992901667001","razon":"COMPAÑIA DE SEGURIDAD INDUSTRIAL - CARSAGUE S.A.","dir":"SAUCES 6 MZ 264 VILLA 2","tel":"","correo":"Carsague10@hotmail.com"},{"ruc":"0992906901001","razon":"COMPAÑIA DE SEGURIDAD PRIVADA UNIDAD DE SEGURIDAD INTEGRAL UZI CIA. LTDA.","dir":"URB. GIRASOL MZ 103 SL4","tel":"0983375986","correo":""},{"ruc":"1790273482001","razon":"COMPANIA NACIONAL DE GAS CONGAS C.A.","dir":"CUSUBAMBA 484 Y AV. MALDONADO","tel":"","correo":"mespinoza@congasca.com"},{"ruc":"1790273482001","razon":"COMPANIA NACIONAL DE GAS CONGAS C.A.","dir":"S26 CUSUBAMBA OE1-424 Y OE2 LLACAO","tel":"","correo":"mespinoza@congasca.com"},{"ruc":"0993035696001","razon":"COMPAÑÍA SALAZAR &amp; RIVADENEIRA SSR CIA. LTDA.","dir":"C.C. RIOCENTRO EL DORADO","tel":"042326106","correo":"ivanrivadeneira@hotmail.com"},{"ruc":"0992219939001","razon":"CONSORCIO ARMAS &amp; CABRERA CIA. LTDA.","dir":"KM 20 VIA LA COSTA-RECINTO NUEVA ESPERANZA","tel":"0423729910","correo":"consorcioarmas@grupoarmas.com.ec, contabilidad@grupoarmas.com.ec, ventas@grupoarmas.com.ec"},{"ruc":"0992810998001","razon":"CONSORCIO JURIDICO ZAVALA MENA GILER GONZENBACH &amp; CIA. ABOGADOS","dir":"JOAQUIN ORRANTIA Y LEOPOLDO BENITES EDIF TRADE BUILDING PISO 4 OF 425","tel":"6037341","correo":""},{"ruc":"0993371643001","razon":"CONSORCIO TURBOLIMPIEZA","dir":"CDLA LOS OLIVOS","tel":"0998635780","correo":""},{"ruc":"0993379281001","razon":"CONSULCOMPU S.A.","dir":"C.C. POLICENTRO 97","tel":"","correo":""},{"ruc":"0990479100001","razon":"COOPERATIVA DE TRANSPORTE POSORJA","dir":"GUAYACANES MZ120B V6","tel":"6048249","correo":""},{"ruc":"0990479100001","razon":"COOPERATIVA DE TRANSPORTE POSORJA","dir":"GUAYACANES MZ120B V6","tel":"6048249","correo":""},{"ruc":"1890066123001","razon":"COOPERATIVA DE TRANSPORTES FLOTA PELILEO","dir":"AV. BENJAMIN ROSALES Y AV. DE LAS AMERICAS","tel":"","correo":"johapovedaramirez@hotmail.com"},{"ruc":"1890066123001","razon":"COOPERATIVA DE TRANSPORTES FLOTA PELILEO","dir":"AV. BENJAMIN ROSALES Y AV. DE LAS AMERICAS","tel":"","correo":"johapovedaramirez@hotmail.com"},{"ruc":"0990191557001","razon":"COOPERATIVA DE TRANSPORTES FRANCISCO DE PAULA ICAZA","dir":"LA 14 Y ALCEDO","tel":"0980255786","correo":""},{"ruc":"0990189951001","razon":"COOPERATIVA DE TRANSPORTES PEPSICORP","dir":"AZUAY #1001 E/AMBATO Y VILLAVICENCIO","tel":"4546885","correo":""},{"ruc":"0990677948001","razon":"COOPERATIVA TRANSPORTE PUBLICO DE PASAJEROS URBANO Y TURISMO TARQUI LTDA.","dir":"LIZARDO GARCIA 3016 Y BOLIVIA Y EL ORO","tel":"2368471","correo":"cooperativatarquiltda@gmail.com"},{"ruc":"0992879254001","razon":"COPACIGULF S.A.","dir":"AV. FRANCISCO DE ORELLANA, EDIF. BLUE TOWER","tel":"","correo":"jleon@aquagold.com.ec"},{"ruc":"0920633104001","razon":"CORAL RIVERA JOHANNA JANINA","dir":"CDLA EL MAESTRO MZ E8 V16","tel":"0988923362","correo":""},{"ruc":"0907075931001","razon":"CORDERO PADILLA GONZALO REMIGIO","dir":"PLAYAS","tel":"0991493917","correo":""},{"ruc":"0918508318001","razon":"CORDOVA MEDINA LEONCIO ELIECER","dir":"PORTETE 2702 Y BABAHOYO","tel":"0993425162","correo":""},{"ruc":"1791341899001","razon":"CORPMUNAB SOCIEDAD ANONIMA","dir":"AVENIDA 6 DE DICIEMBRE 59-161 Y SANTA LUCIA","tel":"","correo":""},{"ruc":"0900764317001","razon":"CORREA SUCONOTTA JAIME MAXIMINIO","dir":"AVENIDA MIRAFLORES","tel":"","correo":"documentosmiraflores@hotmail.com"},{"ruc":"0915085047001","razon":"COTO TORRES FRANCISCO JAVIER","dir":"GALLEGOS LARA #2008 E/ARGENTINA Y GENERAL GOMEZ","tel":"","correo":""},{"ruc":"0992981474001","razon":"COTRANCORJE S.A.","dir":"SAMBORONDON","tel":"0994255970","correo":""},{"ruc":"1708950892001","razon":"CRESPO VEGA VERONICA FABIOLA","dir":"AV. JUAN TANCA MARENGO Y AV. J. ORRANTIA","tel":"","correo":"fduran@proaudiogye.com"},{"ruc":"1390096522001","razon":"CRIADEROS DE ESPECIES BIOACUATICAS CRIESBIO S.A.","dir":"ROBLES 109 Y CHAMBERS","tel":"","correo":""},{"ruc":"0930632484001","razon":"CRUZ ANASTACIO BYRON MICHAEL","dir":"LA 16AVA Y 4 DE NOVIEMBRE","tel":"","correo":""},{"ruc":"0926829797001","razon":"CRUZ DURAZNO VANESSA PATRICIA","dir":"6 DE MARZO #1026 Y MANABI","tel":"0926829797001","correo":""},{"ruc":"0923814826001","razon":"CRUZ GANCHOZO JENNIFER ANDREINA","dir":"VENEZUELA 3007 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0914592910001","razon":"CUENCA RAMON LORENA CECIBEL","dir":"PORTETE #3615 Y LA 10MA","tel":"0993744309","correo":""},{"ruc":"0925694929001","razon":"CUMBE LEON NUBIA WENDY","dir":"CALLE 10MA #611 E/P. PABLO GOMEZ Y AYACUCHO","tel":"","correo":""},{"ruc":"1304112293001","razon":"DAGOBERTO PONCE ROMERO","dir":"RUMICHACA #924 E/9 DE OCTUBRE Y VELEZ","tel":"2511399","correo":""},{"ruc":"0600733620001","razon":"DAMIAN CARMITONGO LUIS HUMBERTO","dir":"PORTETE #3226 Y LA 7MA","tel":"0997472004","correo":""},{"ruc":"0911109023001","razon":"DAVILA DELGADO FRANCISCO DE JESUS","dir":"ABEL CASTILLO #614 Y LETAMENDI","tel":"","correo":""},{"ruc":"0922373097001","razon":"DAVILA RIVADENEIRA FRANCISCO JAVIER","dir":"ABEL CASTILLO #614 Y LETAMENDI","tel":"0981425691","correo":""},{"ruc":"0604770495001","razon":"DELGADO CELA DELIA VIVIANA","dir":"GOMEZ RENDON E/ LA 13 Y LA 14","tel":"0979941724","correo":""},{"ruc":"0603984501001","razon":"DELGADO CELA JORGE ERIBERTO","dir":"PORTETE Y BABAHOYO","tel":"","correo":""},{"ruc":"0909599599001","razon":"DELGADO INSUASTI WASHINGTON BERNARDO","dir":"CDLA BELLAVISTA MZ27 V35","tel":"","correo":"marberd29@gmail.com"},{"ruc":"0922160551001","razon":"DELGADO RODRIGUEZ LORENA VANESSA","dir":"HUANCAVILCA 1031 E/GUARANDA Y VILLAVICENCIO","tel":"0963864002","correo":""},{"ruc":"1792072018001","razon":"DELI INTERNACIONAL S.A.","dir":"COREA N°126 Y AVE. AMAZONAS, EDIF. BELMONTE PISO7","tel":"23955400","correo":"facturas.electronicas@kfc.com.ec, felipe.quinto@kfc.com.ec"},{"ruc":"0993397301001","razon":"DENTALBROWN S.A.S.","dir":"ALBORADA 11AVA ETAPA MZ10 VILLA 22","tel":"0999068170","correo":""},{"ruc":"1202843957001","razon":"DIANA SALTOS VITERI","dir":"KENNEDY NORTE","tel":"6045100","correo":"patologialab@hotmail.com"},{"ruc":"0963519434001","razon":"DIAZ MEDINA JORGE LUIS","dir":"PORTETE 3020A E/GALLEGOS LARA Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0965263130001","razon":"DIAZ MORI VICTOR ALEXANDER","dir":"C.C. AVALON PLAZA","tel":"","correo":"esquina.raicesdelperu@gmail.com"},{"ruc":"0926393703001","razon":"DIEGO LEON GOMEZ GIRALDO","dir":"AYACUCHO #4415 Y LA 17AVA ESQ","tel":"","correo":""},{"ruc":"0993314013001","razon":"DIGICLAROCORP S.A.","dir":"NAHIM ISAIAS S/N Y MIGUEL H. ALCIVAR - EDIFICIO ONYX","tel":"","correo":""},{"ruc":"0968506620001","razon":"DIRECCION DISTRITAL 09D04-FEBRES CORDERO SALUD","dir":"CALLE 10 Y AV. SEXTA","tel":"","correo":""},{"ruc":"0992678437001","razon":"DISCAVE S.A. DISTRIBUIDORA DE CARNE Y AVES","dir":"GUERRERO VALENZUELA 905 Y SAN MARTIN - ARGENTINA","tel":"0999509288","correo":"discavesa@gmail.com"},{"ruc":"0993358673001","razon":"DISTRIBUIDORA FARMACEUTICA MALDONADO DIALIM S.A.","dir":"GALLEGOS LARA 2202 E/PORTETE Y VENEZUELA","tel":"","correo":"dialimsa2021@gmail.com"},{"ruc":"0902057702001","razon":"DOMINGUEZ VILLARREAL WALTER GUILLERMO","dir":"GARCIA GOYENA #2543 Y GUERRERO VALENZUELA","tel":"2375662","correo":""},{"ruc":"0906005947001","razon":"DR. JAIME ALMEIDA CALDERON","dir":"PORTETE 3039 Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0926035445001","razon":"DR. PADILLA OROZCO JUAN CARLOS","dir":"LIZARDO GARCIA 4231B Y CALLEJON PARRA","tel":"","correo":""},{"ruc":"0993348627001","razon":"DUESAN","dir":"ATARAZANA","tel":"","correo":"servimera@gmail.com"},{"ruc":"0992217936001","razon":"DULCES, PASTELES Y TORTAS RADU S.A.","dir":"ALBORADA 12AVA ETAPA MZ 12-19 SOLAR 14","tel":"046005410","correo":"mantenimiento.radu@gmail.com"},{"ruc":"0924345820001","razon":"DUMANI GUAJALA DIANA JACKELINE","dir":"VIA DURAN TAMBO KM 1.5 LOT SAN ENRIQUE MZ2 SL3","tel":"0991239128","correo":"ventas_firesolutions@hotmail.com"},{"ruc":"0924816168001","razon":"DUMES ICAZA ANA ILIANA","dir":"ESMERALDAS Y 1ERO DE MAYO ESQ","tel":"0988457462","correo":""},{"ruc":"0992359064001","razon":"DUMILESA S.A.","dir":"C.C. HIPERMARKET MUCHO LOTE 2 AV NARCISA DE JESUS S/N LOCAL 5","tel":"042003632","correo":"produccion@sorbetto.ec"},{"ruc":"0993398836001","razon":"E&amp;A GLOBAL LIQUORS S.A.S.","dir":"THOMAS MARTINEZ Y BAQUERIZO MORENO","tel":"0959202389","correo":""},{"ruc":"1714680806001","razon":"ECHEVERRIA VELOZ FERNANDO","dir":"GALLEGOS LARA 618 Y AYACUCHO","tel":"","correo":""},{"ruc":"0190401030001","razon":"ECUABEIBEN CIA. LTDA.","dir":"AV. ESPAÑA 8-99 Y SEVILLA","tel":"2807317","correo":""},{"ruc":"0190413993001","razon":"ECUADBEICHI CIA LTDA","dir":"KM 4 1/2 VIA A DAULE","tel":"N/D","correo":"facturaciongye@ecuadbeichi.com, dccabreras1992@hotmail.com"},{"ruc":"0992982004001","razon":"ECUADORIANSHRIMPS S.A.","dir":"AV LEON FEBRES CORDERO KM 13.5","tel":"","correo":""},{"ruc":"0992497815001","razon":"EDIFICIO EQUILIBRIUM CENTRO DE ARMONIA","dir":"AV. JUAN TANCA MARENGO M. S/N Y AV JOSE ORANTIA","tel":"6004892","correo":"torresol1_cobranzas@hotmail.com"},{"ruc":"0993369398001","razon":"EDIFICIO TORRES DE LA COSTA","dir":"VIA A LA COSTA KM 11.5","tel":"","correo":""},{"ruc":"0992494867001","razon":"EDIFICIO TORRES DEL SOL 1","dir":"AV. JUAN TANCA MARENGO KM 1.5 Y ROMERO CASTILLO","tel":"042107054","correo":"torresol1_cobranzas@hotmail.com"},{"ruc":"0926062449001","razon":"EDISON DAVID FERNANDEZ VELEZ","dir":"PORTETE 3307 Y ALFREDO VALENZUELA","tel":"0980020081","correo":"lourdetouriz@gmail.com, antaresvision@outlok.com"},{"ruc":"1791881826001","razon":"EDUCATIONAL SOLUTIONS CIA. LTDA","dir":"CENTRO COMERCIAL GRAN ALBOCENTRO LOCAL H10","tel":"","correo":"lruiz@edu-sol.com"},{"ruc":"0603172255001","razon":"EFRAIN GUAMBO SHIGLA","dir":"LEONIDAS PLAZA #2101 E/PORTETE Y GRAL GOMEZ","tel":"","correo":""},{"ruc":"0921508107001","razon":"ELENA ALEXANDRA PALACIOS GUAPACASA","dir":"URDENOR 2 MZ1068 SOLAR 8-1","tel":"0986747411","correo":"palacios_elena@hotmail.com"},{"ruc":"0992876115001","razon":"ELINOC TRADE COMPANY CIA. LTDA ELINOCTRADE","dir":"CHILE 1001 Y MANUEL LUZARRAGA","tel":"","correo":"josuet_91@outlook.com"},{"ruc":"0990683980001","razon":"EMPACADORA CHAMPMAR S.A.","dir":"ROBLES 109 Y CHAMBERS","tel":"","correo":"valentina.orrantia@champmar.com, martha.montalvo@champmar.com"},{"ruc":"0993053910001","razon":"EMPACALLE S.A.","dir":"ROCAFUERTE Y JUAN MONTALVO","tel":"042515019","correo":"empacallesa@gmail.com, gia.gasparb@gmail.com"},{"ruc":"0925849622001","razon":"ENCALADA HUAYAMAVE JORGE WASHINGTON","dir":"PORTETE 3726 E/LA 11AVA Y LA 12AVA","tel":"","correo":"jorwenca@gmail.com"},{"ruc":"0925849622001","razon":"ENCALADA HUAYAMAVE JORGE WASHINGTON","dir":"PORTETE 3726 E/LA 11AVA Y LA 12AVA","tel":"","correo":"jorwenca@gmail.com"},{"ruc":"0911426450001","razon":"ENCALADA NOBOA ZOILA ELIZABETH","dir":"ARGENTINA #3137 Y LA 8VA","tel":"042366513","correo":""},{"ruc":"0930473855001","razon":"ENDARA MEJIA AURORA KATHERINE","dir":"MARACAIBO Y ANTEPARA","tel":"0985563678","correo":""},{"ruc":"0993393048001","razon":"EQUIA TECH S.A.S.","dir":"PUNTA ESMERALDA - GUAYAQUIL","tel":"","correo":"equia.ai@gmail.con"},{"ruc":"1790806952001","razon":"EQUIPROIN JACOME PAEZ CIA LTDA,","dir":"CARLOS JULIO AROSEMENA BODEGAS EQUIDOR","tel":"022504840","correo":"contabilidad@equiproin.com.ec, lpaez@equiproin.com.ec, ingenieria1gye@equiproin.com.ec"},{"ruc":"0930252358001","razon":"ESCOBAR HERRERA EDISON EDUARDO","dir":"CDLA BELLAVISTA MZ25","tel":"0982040787","correo":"escobaredison@hotmail.com"},{"ruc":"0993205966001","razon":"ESCOBAR JARAMILLO DANIELA","dir":"CDLA BELLAVISTA MZ25 V10","tel":"","correo":""},{"ruc":"0917335382001","razon":"ESCUDERO AREVALO CATALINA YAHAIRA","dir":"PORTETE 3021 Y LEONIDAS PLAZA","tel":"0997877568","correo":""},{"ruc":"0992157704001","razon":"ESCUELA PARTICULAR # 21 MADRE DE DIOS","dir":"COOP. CASITAS DEL GUASMO MZ29 SL12","tel":"042050508","correo":""},{"ruc":"0992157704001","razon":"ESCUELA PARTICULAR # 21 MADRE DE DIOS","dir":"COOP. CASITAS DEL GUASMO MZ29 SL12","tel":"042050508","correo":""},{"ruc":"0950865477001","razon":"ESPINEL MENDEZ KAREN DEL CARMEN","dir":"PORTETE Y GUERRERO VALENZUELA","tel":"0958960984","correo":""},{"ruc":"0909729295001","razon":"ESPINOZA DELGADO LAURA CECILIA","dir":"KM 8.5 VIA A LA COSTA","tel":"0999584203","correo":""},{"ruc":"0903913663001","razon":"ESPINOZA MARTINEZ TEMISTOCLES MARIANO","dir":"PORTETE 5506 Y CALLES 29VA. 30VA.","tel":"","correo":""},{"ruc":"0920805231001","razon":"ESPINOZA RAMIREZ ADRIANA MATILDE","dir":"COLOMBIA 2301 Y BABAHOYO","tel":"","correo":""},{"ruc":"0926999343001","razon":"ESPINOZA RODRIGUEZ THIAGO JAVIER","dir":"LOS RIOS 1815 E/P.P. GOMEZ Y AYACUCHO","tel":"","correo":""},{"ruc":"1306916378001","razon":"ESPINOZA ZAMBRANO ROCIO MARIBEL","dir":"VENEZUELA 2410 Y TUNGURAHUA","tel":"0992097256","correo":""},{"ruc":"0993306428001","razon":"ESTAVIVASA S.A.","dir":"URDESA CENTRAL CALLE 1ERA 12-45 Y COSTANERA","tel":"0983014805","correo":"katandazo@hotmail.com"},{"ruc":"0927547471001","razon":"ESTRADA ALVAREZ ANDREA STEPHANIA","dir":"GOMEZ RENDON Y LA 13AVA","tel":"0988916192","correo":""},{"ruc":"0991408843001","razon":"ESVELTS S.A.","dir":"LORENZO DE GARAICOA Y FEBRESCORDERO","tel":"2130838","correo":"asistente.ejecutiva@onlynatural.com.ec"},{"ruc":"0914872981001","razon":"EULALIA MARIA LOPEZ ROMERO","dir":"PORTETE #3011 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0993077852001","razon":"FAPLACA S.A.","dir":"VIA A DAULE KM 16.5","tel":"","correo":"admin@flapaca.com"},{"ruc":"0922350665001","razon":"FARRO ORRALA NURIA FABIOLA","dir":"GARCIA AVILES E/9DE OCTUBRE Y VELEZ","tel":"0985394814","correo":""},{"ruc":"0910733476001","razon":"FATIMA MERCEDES MEDIETA SEGURA","dir":"CORONEL #601 Y COLOMBIA ESQ","tel":"0992028406","correo":""},{"ruc":"0992916737001","razon":"FEBACRUZ S.A.","dir":"URB. RENACER MZ153 V35","tel":"","correo":""},{"ruc":"0992448253001","razon":"FERANSA S.A.","dir":"AV BENJAMIN CARRION, EDIF. CITY OFFICE, PISO 3 OF 322","tel":"0993742634","correo":""},{"ruc":"0966705444001","razon":"FERNANDEZ CONTRERAS CARLOS EDUARDO","dir":"GOMEZ RENDON 2831 Y LEONIDAS PLAZAS Y GUERRERO MARTINEZ","tel":"0986410414","correo":"fernandezcalo270@gmail.com"},{"ruc":"0905331823001","razon":"FERNANDEZ DELGADO JULIO HIPOLITO","dir":"GUERRERO VALENZUELA 1007 Y ARGENTINA","tel":"","correo":""},{"ruc":"0993335193001","razon":"FISKARE S.A.S.","dir":"PUERTO SANTA ANA - EDIF. ESPAZIO PISO6 DP.603","tel":"3862184","correo":"josephandinoleon@outlook.com"},{"ruc":"0993335193001","razon":"FISKARE S.A.S.","dir":"PUERTO SANTA ANA - EDIF. ESPAZIO PISO6 DP.603","tel":"3862184","correo":"josephandinoleon@outlook.com"},{"ruc":"0925829152001","razon":"FLORES GUEVARA DULCE MARIA","dir":"CDLA PUERTAS DEL SOL MZ2362 V25","tel":"0988807622","correo":""},{"ruc":"0913002341001","razon":"FLORES MARIN RICARDO ANTONIO","dir":"L. PLAZA GUTIERREZ 2202 Y PORTETE VENEZUELA","tel":"","correo":""},{"ruc":"0993384428001","razon":"FOOD SAVORY ECUAPER FOODSAVORYECUAPER S.A.S.","dir":"SAMANES 1","tel":"0997574598","correo":""},{"ruc":"0992185015001","razon":"FORTISUR S.A.","dir":"KM 1,5 VIA SAMBORONDON C.C. LA TORRE PISO1 D5","tel":"2831782","correo":""},{"ruc":"1711749042001","razon":"FRANCISCO IZURIETA","dir":"AV REPUBLICA E4-34 Y RUMIPAMBA","tel":"","correo":"arqgenia@arqgenia.la"},{"ruc":"0919853390001","razon":"FRANCO PEREZ CHRISTIAN LENIN","dir":"VENEZUELA Y LA 14","tel":"0987583223","correo":"intriseg_17@outlook.com"},{"ruc":"0900871252001","razon":"FRANCO REYES MARTHA ORFELINDA","dir":"SAUCES 4 MZ361 VILLA57","tel":"2620087","correo":""},{"ruc":"0914079066001","razon":"FREIRE KNUTH EDGARDO CRISTOBAL","dir":"LOJA Y GENERAL CORDOVA -LOCAL 5-B","tel":"","correo":"edgardo.facturas@cofreire.com, diorice.intriago@cofreire.com"},{"ruc":"0914543251001","razon":"FREIRE PEÑAFIEL ALLYSON MARIBEL","dir":"CDLA ALBORADA 12AVA ETAPA S/N MZ12-27","tel":"042272995","correo":""},{"ruc":"0921876512001","razon":"FREIRE PEÑAFIEL MARJORIE MARIANA","dir":"ESMERALDAS 1014 Y ENTRE VELEZ Y HURTADO","tel":"","correo":"matriz@cofreire.com"},{"ruc":"1700010364001","razon":"FREIRE TAMAYO MARCELO ENRIQUE","dir":"ESMERALDAS 1014 Y HURTADO Y VELEZ","tel":"","correo":"matriz@cofreire.com"},{"ruc":"0992559667001","razon":"FREPRIM S.A.","dir":"ESMERALDAS #1018 Y VELEZ","tel":"042374026","correo":"matriz@cofreire.com"},{"ruc":"0992781955001","razon":"FUMICAVEC CIA. LTDA.","dir":"GUAYAQUIL","tel":"","correo":"contabilidad@fumicavec.com"},{"ruc":"1206346627001","razon":"GABRIELA BALSECA ROMERO","dir":"PORTERE #2910 Y GUERRERO VALENZUELA","tel":"","correo":""},{"ruc":"0919157446001","razon":"GALARZA ORTIZ LEOPOLDO VICENTE","dir":"GUASMO CENTRAL","tel":"","correo":""},{"ruc":"0926504770001","razon":"GALEANO RAMIREZ MONICA","dir":"BOSQUES DE LA COSTA","tel":"","correo":""},{"ruc":"0919937292001","razon":"GALINDO FLORES EDUARDO RENAN","dir":"AV. PORTETE 3505 Y 9NA Y 10MA","tel":"","correo":""},{"ruc":"0919685180001","razon":"GALLEGOS ANDRADE EDISON IVAN","dir":"AYACUCHO 3308 Y LA 7MA","tel":"0958846729","correo":"manbangall@outlook.com"},{"ruc":"0907052344001","razon":"GARAY AVILA CARLOS ENRIQUE","dir":"ALFREDO VALENZUELA 605 Y PEDRO PABLO GOMEZ","tel":"093016825","correo":""},{"ruc":"0962435608001","razon":"GARCIA ALFONZO LUIS ALBERTO","dir":"NICOLAS AUGUSTO GONZALES Y CALLE 24","tel":"0992653480","correo":""},{"ruc":"0916094998001","razon":"GARCIA LOOR KLEBER REINALDO","dir":"BARRIO CRISTO VIVE CALLE PRINCIPAL","tel":"0958894313","correo":"audazservi@hotmail.com"},{"ruc":"0956814537001","razon":"GARCIA OSORIO MARIANA NOHEMI","dir":"CDLA SAUCES 7 SL2 MZ3","tel":"","correo":""},{"ruc":"0917397093001","razon":"GARCIA SANCHEZ MARIUXI IVET","dir":"LIZARDO GARCIA 1722 Y GOMEZ RENDON","tel":"5036908","correo":"neydavid@live.com"},{"ruc":"0992271744001","razon":"GARITZMO S.A.","dir":"CDLA.ADACE CALLE A Y LA 5TA","tel":"042280180","correo":"marcelor@on.net.ec, contabilidad1@producsol.com"},{"ruc":"0955096870001","razon":"GARMA ABAD SAUL ANTONIO","dir":"ESMERALDAS E/COLOMBIA Y VENEZUELA","tel":"","correo":""},{"ruc":"0911062636001","razon":"GARNICA CALDERON ROSA AURORA","dir":"MALDONADO Y GUERRERO VALENZUELA","tel":"0982579031","correo":""},{"ruc":"0907194849001","razon":"GARZON FRANCO LUIS ANTONIO","dir":"LEONIDAS PLAZA 1326 Y GOMEZ RENDON","tel":"0985511174","correo":""},{"ruc":"0906017405001","razon":"GARZON JARAMILLO MANUEL ENRIQUE","dir":"4 DE NOVIEMBRE E/LA 11AVA Y LA 12AVA","tel":"0979214273","correo":""},{"ruc":"0918189382001","razon":"GARZON RODRIGUEZ LOIDA ELIZABETH","dir":"4 DE NOVIEMBRE 2805 Y GALLEGOS LARA","tel":"0993217587","correo":""},{"ruc":"0992143576001","razon":"GASEC S.A.","dir":"KM 7.5 VIA DURAN TAMBO","tel":"04-3729940","correo":"melanie.malave@gasecsa.com, raquel.suarez@gasecsa.com"},{"ruc":"0914188164001","razon":"GINA ALEXANDRA ACOSTA VILCHE","dir":"7MA Y ARGENTINA","tel":"","correo":""},{"ruc":"0993054119001","razon":"GIOSPORTEC S.A.","dir":"ESMERALDAS 1014-1016 Y VELEZ","tel":"","correo":"matriz@cofreire.com"},{"ruc":"0910133636001","razon":"GIRALDO OLIVES NARCISA MARGARITA","dir":"COOP PROLETARIO CON TIERRA MZ361SL 7B","tel":"0997158433","correo":"giraldonarcisa65@gmail.com"},{"ruc":"1792993962001","razon":"GLOBALRESTAURANTS S.A.","dir":"MANUEL AMBROSI LOTE 10","tel":"022479328","correo":"ricardo@woktowalk.com, echicaiza@latablitadeltartaro.com, seguridadocupacionalcosta@latablitadeltartaro.com"},{"ruc":"0960000220001","razon":"GOBIERNO AUTONOMO DESCENTRALIZADO MUNICIPAL DE GUAYAQUIL","dir":"PICHINCHA 605 Y 10 DE AGOSTO - C. BALLEN","tel":"","correo":""},{"ruc":"0916352602001","razon":"GOMEZ ANGULO CARMEN IMELDA","dir":"LA 15AVA Y HUANCAVILCA","tel":"0997345760","correo":""},{"ruc":"1722286273001","razon":"GOMEZ VELOZ JESSICA GABRIELA","dir":"CHIMBORAZO E/LUQUE Y VELEZ","tel":"N/D","correo":""},{"ruc":"1722286273001","razon":"GOMEZ VELOZ JESSICA GABRIELA","dir":"CHIMBORAZO E/LUQUE Y VELEZ","tel":"","correo":""},{"ruc":"0924202278001","razon":"GONZALEZ JURADO MARJORIE ELIZABETH","dir":"LEONIDAS PLAZA 2202 E/ PORTETE Y VENEZUELA","tel":"0962749828","correo":""},{"ruc":"0903515690001","razon":"GONZALEZ MARIN MARIA LUISA ANTONIA","dir":"OLIVOS 2 MZ A V1","tel":"","correo":"lupege@hotmail.com"},{"ruc":"0941646796001","razon":"GONZALEZ MORALES ZAIRA THALIA","dir":"VENEZUELA #2709 Y ABEL CASTILLO","tel":"0994697071","correo":""},{"ruc":"0917725780001","razon":"GONZALEZ SANCHEZ ALEJANDRO JAVIER","dir":"COOP ELOY ALFARO MZ 3113 SOLAR 10","tel":"","correo":"agsextintores@gmail.com"},{"ruc":"0909377996001","razon":"GRACIA ARACELY ALVARADO FREIRE","dir":"KM 11 VIA A LA COSTA","tel":"042991827","correo":"canteralalorena5@hotmail.com"},{"ruc":"1005022783001","razon":"GRAMAL SANTILLAN JESSICA TATIANA","dir":"PORTETE E/LA 7MA Y LA 8VA","tel":"0994243120","correo":""},{"ruc":"0910369578001","razon":"GRANDA CORREA INES MARLENE","dir":"ALBORADA 12AVA ETAPA MZ1 V10","tel":"","correo":"marleneg2812@yahoo.ar"},{"ruc":"0941275497001","razon":"GRANDA VIDAL JESSENIA YOLANDA","dir":"CDLA GUANGALA SL6 MZ E33","tel":"","correo":""},{"ruc":"0992155825001","razon":"GRANPIR S.A.","dir":"DURAN CDLA FERROVIARIA 1","tel":"0987444554","correo":"contabilidadgranpir@gmail.es"},{"ruc":"0603324302001","razon":"GUANOLEMA MULLO MARIA JOSEFA","dir":"PORTETE 3241 Y GUERRERO MARTINEZ","tel":"0982864127","correo":""},{"ruc":"0918154238001","razon":"GUAPI GUAMAN RAUL","dir":"COOP CASITAS DEL GUASMO","tel":"","correo":""},{"ruc":"0962907630001","razon":"GUERRERO GARCIA LUIS AUGUSTO","dir":"CENTRO COMERCIAL RIOCENTRO NORTE","tel":"0963295859","correo":""},{"ruc":"0201460979001","razon":"GUINGLA CAIZA LUIS ALEXANDER","dir":"CAMILO DESTRUGE 2217 Y BABAHOYO","tel":"","correo":"acfriodalexx@gmail.com"},{"ruc":"0920615051001","razon":"GUTIERREZ FLORES FELIX DANIEL","dir":"FERTISA CALLE PRINCIPAL","tel":"","correo":""},{"ruc":"0964137350001","razon":"GUZMAN URDANETA MARIEL JOSEFINA","dir":"GARZOTA","tel":"","correo":""},{"ruc":"1790580113001","razon":"H.O.V. HOTELERA QUITO SA","dir":"MALECON Y ROCA","tel":"","correo":""},{"ruc":"0909622466001","razon":"HAMILTON NOBOA","dir":"LA 7MA #2011 E/GRAL GOMEZ Y ARGENTINA","tel":"","correo":""},{"ruc":"0909622466001","razon":"HAMILTON NOBOA","dir":"LA 7MA #2011 E/GRAL GOMEZ Y ARGENTINA","tel":"","correo":""},{"ruc":"0602731655001","razon":"HEREDIA CONDO MARQUES FABIAN","dir":"SUCRE 101 Y MALECON","tel":"","correo":""},{"ruc":"0966506172001","razon":"HERNANDEZ GOMEZ CARLOS LUIS","dir":"PORTETE 2822 Y A CASTILLO Y G VALENZUELA","tel":"0978759750","correo":""},{"ruc":"0920337813001","razon":"HERNANDEZ MONAR SILVIA ELIZABETH","dir":"PORTETE #3024 E/LEONIDAS PLAZA Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0924001241001","razon":"HERRERA CABRERA BYRON WALTER","dir":"GALLEGOS LARA 1927 Y ARGENTINA","tel":"0993610744","correo":""},{"ruc":"0962886404001","razon":"HERRERA UZCANGA CARLOS ALEJANDRO","dir":"PORTETE #2822 Y ABEL CASTILLO","tel":"","correo":""},{"ruc":"1793087981001","razon":"HIGIENECO HGNCO S.A.S.","dir":"PORTETE 5422 Y LA 29AVA","tel":"","correo":""},{"ruc":"1793087981001","razon":"HIGIENECO HGNCO S.A.S.","dir":"PORTETE 5422 Y LA 29AVA","tel":"","correo":""},{"ruc":"0993372873001","razon":"HIPPOMARK S.A.S.","dir":"CDLA ALBATROS MZ25 SL8 Y CALLE PELICANO ESTE #100","tel":"","correo":""},{"ruc":"0990293244001","razon":"HOLCIM ECUADOR S.A.","dir":"AV. BARCELONA S/N Y JOSE RODRIGUEZ BONIN","tel":"","correo":""},{"ruc":"0993109673001","razon":"HOME&amp;HEALTH SERVICES S.A.","dir":"URB. NUEVO PANORAMA","tel":"","correo":"Info@gorilla-express.com, vicentevelasco1988@gmail.com"},{"ruc":"0993109673001","razon":"HOME&amp;HEALTH SERVICES S.A.","dir":"URB. NUEVO PANORAMA","tel":"","correo":"Info@gorilla-express.com, vicentevelasco1988@gmail.com"},{"ruc":"0915678304001","razon":"HUACON QUIÑONEZ JULIO WINTER","dir":"KM 15.5 VIA A DAULE","tel":"","correo":""},{"ruc":"0930168331001","razon":"HUANG XIUXIANG","dir":"CUENCA #5018 Y LA 24AVA","tel":"","correo":""},{"ruc":"1721472163001","razon":"HUGO SALAZAR GRANJA","dir":"DAULE","tel":"","correo":""},{"ruc":"1721472163001","razon":"HUGO SALAZAR GRANJA","dir":"DAULE","tel":"","correo":""},{"ruc":"0925417909001","razon":"HURTADO PRADO ERWIN CRISTOBAL","dir":"CDLA LOS ALMENDROS MZ Q","tel":"0939889578","correo":""},{"ruc":"0992659076001","razon":"HURTADO ZULUAGA LUIS ALFONSO","dir":"COOP EL FORTIN SL17 MZ1556","tel":"0967278190","correo":""},{"ruc":"0962717146001","razon":"HURTADO ZULUAGA NELSON DE JESUS","dir":"LA 29AVA Y ROSENDO AVILES ESQ","tel":"0996218004","correo":""},{"ruc":"0960867281001","razon":"HURTADO ZULUAGA WILLIAM ALEXANDER","dir":"GALLEGOS LARA 2841 Y R. CHAMBERS - 4 NOVIEMBRE","tel":"0995755943","correo":""},{"ruc":"0993369392001","razon":"ICELAND &amp; MARKET S.A.","dir":"MILAGRO VIA A NARANJITO ENTRADA AL COLEGIO OTTO AROSEMENA","tel":"0989133162","correo":""},{"ruc":"0928710664001","razon":"IDROVO MIRANDA KAREN ISABEL","dir":"AV. PORTETE 3017 E/ GALLEGOS LARA Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0928710664001","razon":"IDROVO MIRANDA KAREN ISABEL","dir":"AV. PORTETE 3017 Y ENTRE GALLEGOS LARA Y LEONIDAS PLAZA","tel":"0980493611","correo":""},{"ruc":"0991434240001","razon":"IGLESIA DE DIOS PENTECOSTAL MOVIMIENTO INTERNACIONAL REGION ECUADOR","dir":"LA K YLA 28AVA","tel":"3095082","correo":""},{"ruc":"0993381020001","razon":"IKURA ASIAN FOOD S.A.S.","dir":"C.C BUENA VISTA PLAZA BL 1 P.A. 1 LOCAL 1-2-3 Y VIA SAMBORONDON","tel":"","correo":""},{"ruc":"0993389338001","razon":"IKURAKORP S.A.S.","dir":"CENTRO DE OPERACIONES ALMAX 3","tel":"","correo":"facturacion@ikurarest.com"},{"ruc":"0993053104001","razon":"IMCOMFE S.A.","dir":"GARCIA GOYENA #2620 Y GALLEGOS LARA","tel":"5030623","correo":""},{"ruc":"0991098127001","razon":"IMPORTADORA DEL MONTE","dir":"KM 5.5 VIA DURAN - BABAHOYO SOLAR2","tel":"N/D","correo":"jxespinoza@delmonte.com.ec, mortiz@delmonte.com.ec, aruiz@delmonte.com.ec"},{"ruc":"0990011451001","razon":"IMPORTADORA FEDERAL S.A.","dir":"LUQUE #314 Y CHIMBORAZO","tel":"042324159","correo":"rfiore@imporfederal.com, federal@imporfederal.com"},{"ruc":"0992936908001","razon":"IMPORTADORA JARAMILLO&amp;MIELES S.A.","dir":"AV NARCISA DE JESUS NEXUS 1 CENTRO DE NEGOCIOS NEXUS 1 MZ 6422 SL3 MZ 6422 SL3 Y JUNTO A LA URBANIZACION LA ROMAREDA","tel":"","correo":""},{"ruc":"0993096180001","razon":"IMPORTADORA LAP SAN IMLAPSAN S.A.","dir":"PARQUE CALIFORNIA 1","tel":"N/D","correo":"adiminlapsan@gmail.com"},{"ruc":"0190157075001","razon":"IMPORTADORA ROLORTIZ CIA. LTDA.","dir":"COOP 9 DE OCTUBRE AV25 DE JULIO VIA PUERTO MARITIMO","tel":"043841294","correo":"administracion_gye@rolortiz.com"},{"ruc":"0992785306001","razon":"INDUASERTIVA S.A.","dir":"GUERRERO MARTINEZ 2218 Y PORTETE VENEZUELA","tel":"","correo":""},{"ruc":"0992234024001","razon":"INDUSTRIA DE FIDEO NAPOLITANO S.A. INFINASA","dir":"NICOLAS SEGOVIA #2839 E/ 4 DE NOVIEMBRE Y CHAMBE","tel":"04601057","correo":""},{"ruc":"0190379434001","razon":"INDUSTRIA ECUATORIANA DE ARTEFACTOS S.A. ECUARTEFACTOS","dir":"AV. GIL RAMIREZ DAVALOS 5-32 Y ARMENILLAS","tel":"","correo":"asistente.contable@ecuartefactos.com contador@ecuartefactos.com jefe.importaciones@socelec.com.ec"},{"ruc":"0990790345001","razon":"INDUSTRIAL Y COMERCIAL TCM","dir":"ANTEPARA #921 Y HURTADO 2DO PISO","tel":"042523830","correo":"agerencia@tcmcom.com"},{"ruc":"0993125490001","razon":"INDUSTRIALES Y MARITIMOS SEGUMAR-SCI S.A.","dir":"JOSE DE ANTEPARA 4402 Y CHAVEZ FRANCO","tel":"","correo":"operaciones@segumar.org"},{"ruc":"0990881561001","razon":"INDUTORRES S.A.","dir":"DURAN","tel":"","correo":"luis.pilligua@indutorres.com, vanessa.orobio@indutorres.com"},{"ruc":"0933028458001","razon":"INFANTE LOPEZ MAGALY JOSEFINA","dir":"PORTETE Y GUERRERO VALENZUELA","tel":"0963176548","correo":""},{"ruc":"0911282853001","razon":"ING BUSTOS CASTILLO FRANKLIN EMILIO","dir":"ARGENTINA E/AV QUITO Y MACHALA","tel":"0423774704","correo":""},{"ruc":"0903180503001","razon":"ING. MARCO ANTONIO CHANE LEON","dir":"CDLA NUEVA KENNEDY AV DEL PERIODISTA #200 Y FCO DE ICAZA B","tel":"042285067","correo":"marco31_99@yahoo.com"},{"ruc":"0991292314001","razon":"INMOBILIARIA JEUGON","dir":"TUNGURAHUA 508 Y AV. 9 DE OCTUBRE","tel":"","correo":"c.i.ollantay@gmail.com"},{"ruc":"0990062900001","razon":"INMOBILIARIA KHOURY CIA. LTDA.","dir":"CHILE #329 Y AGUIRRE","tel":"042329207","correo":"bontexsa@hotmail.com"},{"ruc":"0990872988001","razon":"INMOBILIARIA KURMA S.A.","dir":"CHILE #329 Y AGUIRRE","tel":"042329207","correo":"bontexsa@hotmail.com"},{"ruc":"0991058044001","razon":"INMOBILIARIA TODUBRI S.A.","dir":"HUANCAVILCA #2128 E/LOS RIOS Y TULCAN","tel":"","correo":""},{"ruc":"0993396809001","razon":"INNOVASAFE S.A.S.","dir":"VIA DURAN TAMBO S/N Y URBANIZACION JARDINES DE PANORAMAZ F21-F","tel":"","correo":""},{"ruc":"0992806354001","razon":"INSTITUTO SECULAR DE SCHOENSTATT HERMANAS DE MARIA","dir":"URB. CIUDAD CELESTE","tel":"0992700212","correo":""},{"ruc":"1791415132001","razon":"INT FOOD SERVICES CORP S.A.","dir":"COREA N°126 Y AVE. AMAZONAS, EDIF. BELMONTE PISO7","tel":"23955400","correo":"facturas.electronicas@kfc.com.ec"},{"ruc":"0917204661001","razon":"IRIGOYEN HERMAN EDUARDO ARTURO","dir":"BUENA VISTA","tel":"099 913 8593","correo":""},{"ruc":"1707758833001","razon":"IVÁN RIVADENEIRA GUEVARA","dir":"C.C. RIOCENTRO EL DORADO","tel":"2326106","correo":"ivanrivadeneira@hotmail.com"},{"ruc":"0904237898001","razon":"IZQUIERDO MOREIRA JORGE ADALBERTO","dir":"PUERTO LOPEZ - MANABI","tel":"0985124754","correo":""},{"ruc":"0922673835001","razon":"JACKELINE GAVILANES GUADALUPE","dir":"LA 22 Y LA Q","tel":"","correo":""},{"ruc":"0910354430001","razon":"JACQUELINE DEL ROCIO GALLEGOS GALLEGOS","dir":"PORTETE 3318 E/LA 7MA Y LA 8VA","tel":"2373189","correo":""},{"ruc":"1314878123001","razon":"JAMA CEVALLOS ANDERSON ARIEL","dir":"LA 11AVA E/ARGENTINA Y SAN MARTIN","tel":"0995762342","correo":""},{"ruc":"0913899530001","razon":"JAVIER ISMAEL BRAVO TUTIVEN","dir":"LA 39AVA Y CALLEJON PARRA","tel":"","correo":"Javierbravotutiven@gmail.com"},{"ruc":"0913137899001","razon":"JAZMIN MARCELA PALACIOS VERDESOTO","dir":"LA 8VA #1607 E/VENEZUELA Y COLOMBIA","tel":"","correo":""},{"ruc":"0918431982001","razon":"JAZMIN MARIBEL GANCHOZO LOOR","dir":"GARCIA GOYENA 2613 E/ GUERRERO VALENZUELA Y GALLEGOS LARA","tel":"2368500","correo":"jaznes91@hotmail.com"},{"ruc":"0916897499001","razon":"JEREZ RONQUILLO FABIAN RUBEN","dir":"BOLIVIA Y GUERRERO MARTINEZ","tel":"","correo":""},{"ruc":"0910637164001","razon":"JIBAJA DIAZ SONIA GIOCONDA","dir":"PORTETE #4213 E/LA 17AVA Y LA 18AVA","tel":"0993761287","correo":""},{"ruc":"0926576943001","razon":"JIMENEZ CHAVEZ KARLA MARIELA","dir":"VENEZUELA 3307 Y LA 7MA","tel":"","correo":""},{"ruc":"0967279191001","razon":"JIMENEZ FORERO JESUS DANIEL","dir":"GUERRERO VALENZUELA Y VENEZUELA","tel":"0995005012","correo":""},{"ruc":"0908900087001","razon":"JIMENEZ ITURRALDE SILVANA DEL ROCIO","dir":"SUCRE #101 Y MALECON SIMON BOLIVAR 1802","tel":"","correo":""},{"ruc":"0930264494001","razon":"JIMENEZ RAMIREZ DANNY FERNANDO","dir":"SAUCES 6","tel":"0989936631","correo":""},{"ruc":"0908894603001","razon":"JIMENEZ RODRIGUEZ NENE MARLENE","dir":"PORTETE #3028 Y LEONIDAS PLAZA","tel":"2759100","correo":""},{"ruc":"0908888928001","razon":"JORGE ARCE ICAZA","dir":"ALBORADA 13AVA ETAPA","tel":"","correo":""},{"ruc":"0910861897001","razon":"JORGE LUIS RUILOVA PARRA","dir":"CDLA IETEL MZ2 SL5","tel":"","correo":""},{"ruc":"0910861897001","razon":"JORGE LUIS RUILOVA PARRA","dir":"CDLA IETEL MZ2 SL5","tel":"","correo":""},{"ruc":"0918251463001","razon":"JOSE ANTONIO TOBAR LOPEZ","dir":"PORTETE 323 Y LA 7MA","tel":"2193388","correo":""},{"ruc":"0918251463001","razon":"JOSE ANTONIO TOBAR LOPEZ","dir":"PORTETE 323 Y LA 7MA","tel":"2193388","correo":""},{"ruc":"0910601749001","razon":"JOUVIN MARTILLO ANDRES HUMBERTO","dir":"GUASMO SUR COOP. REINO UNIDO","tel":"0999297650","correo":""},{"ruc":"0924763550001","razon":"JUELA YAUCAN MARIA CECILIA","dir":"KM 17 VIA A LA COSTA - PUERTO HONDO","tel":"0968833636","correo":""},{"ruc":"0906820162001","razon":"JULIO CAJAS SANCHEZ","dir":"FLORESTA 3 MZ #203 VILLA 1","tel":"043849694","correo":""},{"ruc":"0912014586001","razon":"JULIO MELGAR BAJAÑA","dir":"LEONIDAS PLAZA #2301 Y VENEZUELA","tel":"","correo":""},{"ruc":"0905294708001","razon":"JURADO FIERRO CESAR VICTOR JULIO","dir":"JUNIN 726 Y XIMENA","tel":"","correo":"ventasyrecargasjurado@hotmail.com"},{"ruc":"0957433477001","razon":"JURADO QUIJIJE SAMUEL ALEJANDRO","dir":"JUNIN #726 Y XIMENA","tel":"","correo":"juradoenterprise@hotmail.com"},{"ruc":"0992751231001","razon":"JUST RESOURCES ECUADOR S.A.","dir":"ROCAFUERTE Y JUAN MONTALVO","tel":"042515019","correo":"ggaspar@grupotoroasado.com, mery-pincay.1284@hotmail.com"},{"ruc":"0992751231001","razon":"JUST RESOURCES ECUADOR S.A.","dir":"ROCAFUERTE Y JUAN MONTALVO","tel":"042515019","correo":"ggaspar@grupotoroasado.com, mery-pincay.1284@hotmail.com"},{"ruc":"0991153837001","razon":"KEBLUSEK S.A.","dir":"AV. DEL EJERCITO #615 Y 1ERO DE MAYO","tel":"","correo":"flor.quito@ipsp-profremar.com"},{"ruc":"0912068228001","razon":"KLEBER ALAVA MURILLO","dir":"LA 40 Y CALLEJON G","tel":"","correo":""},{"ruc":"0912068228001","razon":"KLEBER ALAVA MURILLO","dir":"LA 40 Y CALLEJON G","tel":"","correo":""},{"ruc":"0993004391001","razon":"KOREA MOTORS LHG IMPORT S.A.","dir":"AYACUCHO 2216 Y TUNGURAHUA ESQ NE","tel":"","correo":""},{"ruc":"0993390489001","razon":"KUBOX S.A.S.","dir":"AV 9 DE OCTUBRE Y TUNGURAHUA / MALECON DEL SALADO BLOQUE NORTE LOCAL #3","tel":"0978660526","correo":"conta@kubox.ec"},{"ruc":"0905885455001","razon":"LAAZ VELEZ JESUS ENRIQUE","dir":"4 DE NOVIEMBRE #2707 Y CALLEJON ESPIRITU SANTO","tel":"","correo":""},{"ruc":"0918043050001","razon":"LAFFERTE ALANIZ NEXO EGIDIO","dir":"CDLA. ALBORADA 13 AVA ETAPA SL30 MZ13","tel":"","correo":"Sepro@gye.satnet.net, sepro.matriz@seproecuador.com"},{"ruc":"0919661330001","razon":"LAFFERTE TACLE PAMELA MELISSA","dir":"ALBORADA ETAPA13","tel":"0999659269","correo":"pmlafferte@hotmail.com"},{"ruc":"0992823739001","razon":"LAJETSE S.A.","dir":"VICENTE NORERO DE LUCCA SOLAR 1-30 Y 1ER CALLEJON 13A","tel":"","correo":"andrea_garcia2910@hotmail.com"},{"ruc":"0604413096001","razon":"LALON MOROCHO MANUEL JESUS","dir":"17 AVA. Y FRANCISCO DE MARCOS","tel":"","correo":""},{"ruc":"0791733448001","razon":"LANPAC CIA. LTDA.","dir":"","tel":"","correo":""},{"ruc":"1793067379001","razon":"LANSAX COMERCIAL S.A.S.","dir":"C.C. PLAZA QUIL","tel":"","correo":"xavier.landazuri@lansaxcapital.com"},{"ruc":"0955495833001","razon":"LARREA RIZO JORGE LUIS","dir":"GENERAL GOMEZ /E BABAHOYO Y ABEL CASTILLO","tel":"","correo":"wonderglassecuadorgye@gmail.com"},{"ruc":"0903755379001","razon":"LATORRE RUGEL BENEDICTO","dir":"EL ORO #2113 E/ CARCHI Y TUNGURAHUA","tel":"","correo":""},{"ruc":"0990058229001","razon":"LAVANDERIA SECOMATICO SA","dir":"BOYACA Y COLON ESQ","tel":"042445168","correo":"info@secomatico.com.ec"},{"ruc":"0992171863001","razon":"LEGATORIE S.A.","dir":"HUANCAVILCA #2128 E/ LOS RIOS Y TULCAN","tel":"","correo":""},{"ruc":"0931252324001","razon":"LEON VARGAS FELIPE EDUARDO","dir":"PORTETE #3125B Y GUERRERO MARTINEZ","tel":"","correo":""},{"ruc":"0993192570001","razon":"LICEO PANAMERICANO LPSA S.A.","dir":"DOLORES SUCRE #302 Y NICOLAS AUGUSTO GONZALES","tel":"","correo":"pmurgueitio@liceopanamericano.edu.ec"},{"ruc":"1715347686001","razon":"LIN SHAOSHAN","dir":"AYACUCHO 3001 Y GALLEGOS LARA","tel":"0991819805","correo":""},{"ruc":"0911296291001","razon":"LINO BRIONES LEONERY ABAD","dir":"LOS RIOS 3418 E/PORTETE Y VENEZUELA","tel":"0939423376","correo":""},{"ruc":"0993033081001","razon":"LITTLEITALY ECUADOR CIA. LTDA.","dir":"C.C. MALL DEL SOL","tel":"","correo":"dorisgarciamadrid@gmail.com"},{"ruc":"1717158008001","razon":"LIUT JATIVA SANTIAGO ANDRES","dir":"VICTOR EMILIO ESTRADA #0096-11 Y LAURELES","tel":"","correo":"Info@gorilla-express.com, vicentevelasco1988@gmail.com"},{"ruc":"0953293875001","razon":"LLERENA AMON ANDREA YOMAIRA","dir":"AYACUCHO Y CARCHI","tel":"0993294018","correo":""},{"ruc":"0920008646001","razon":"LLERENA ERAZO KARINA DEL ROCIO","dir":"ALBORADA 3ERA ETAPA MZ BW SOLAR 7","tel":"","correo":""},{"ruc":"0919225235001","razon":"LLUGUAY POMA ALEXANDRA PAULINA","dir":"VENEZUELA E/BABAHOYO Y LIZARDO GARCIA","tel":"","correo":""},{"ruc":"0919225235001","razon":"LLUGUAY POMA ALEXANDRA PAULINA","dir":"VENEZUELA E/BABAHOYO Y LIZARDO GARCIA","tel":"","correo":""},{"ruc":"0993141224001","razon":"LOAIZA CARRERA ALIANZA DE SERVICIOS ALCASERVICIOS Y LOGÍSTICA S.A.","dir":"TARIFA KM 10.5 VIA SAMBORONDON EDIF PLAZA PROYECTO OF23","tel":"","correo":"administracion@alca.com.ec"},{"ruc":"0701769176001","razon":"LOAYZA APOLO ELENA MERCEDES","dir":"LETAMENDI 3221 Y GUERRERO MARTINEZ","tel":"0997283823","correo":""},{"ruc":"0914003041001","razon":"LOJA ALBARRACIN MIGUEL ALBERTO","dir":"LA 18AVA #1721 Y PORTETE","tel":"042468551","correo":""},{"ruc":"0926711722001","razon":"LOPEZ ALVARADO DANIEL ALEJANDRO","dir":"SAUCES 8 MZ493F VILLA11","tel":"","correo":"danny_lopez_87@hotmail.com"},{"ruc":"0924050065001","razon":"LOPEZ DEL ROSARIO CARLA PAULINA","dir":"PORTETE Y LA 10MA","tel":"0991150862","correo":""},{"ruc":"0924862725001","razon":"LOPEZ GUTIERREZ SARA LILIANA","dir":"AV. TRUJILLO","tel":"0993899970","correo":"saru_planb_ds@hotmail.com"},{"ruc":"0902355718001","razon":"LOPEZ VERA NELLY ERNESTINA","dir":"ARGENTINA #3305 Y LA 10MA","tel":"0991449568","correo":""},{"ruc":"0993395020001","razon":"LOPEZLCORP S.A.S.","dir":"22AVA Y ENTRE ARGENTINA Y PORTETE","tel":"0969395670","correo":""},{"ruc":"0907587562001","razon":"LORENTZEN GUERRERO JOHN RYCHARD","dir":"CDLA GUAYACANEZ MZ 237 S.1","tel":"098 732 4925","correo":"ventas-corp@richardlorentzen.com, contabilidad@richardlorentzen.com, contabilidad-rilorsa@richardlorentzen.com"},{"ruc":"0909598005001","razon":"LUCERO BARREIRO JORGE LUIS","dir":"COLOMBIA 2625 E/GALLEGOS LARA Y LEONIDAS PLAZA","tel":"0998425495","correo":""},{"ruc":"0910378504001","razon":"LUCERO BERRONES MOISES","dir":"6 DE MARZO #2609 Y FCO DE MARCOS","tel":"2401921","correo":"oxiweld2009@hotmail.com"},{"ruc":"0909980005001","razon":"LUIS GAVILANES PALACIOS","dir":"PORTETE #3023 Y LEONIDAS PLAZA","tel":"0999515243","correo":""},{"ruc":"0919469544001","razon":"LUIS LEON AGUILERA","dir":"COOP PAJARO AZUL SL8 MZ165","tel":"","correo":""},{"ruc":"0919469544001","razon":"LUIS LEON AGUILERA","dir":"COOP PAJARO AZUL SL8 MZ165","tel":"","correo":""},{"ruc":"0957093255001","razon":"LUSPA CHIPANTIZA JACQUELINE ZULAY","dir":"CDLA LUIS MOREJON ALMEIDA SOLAR 3 Y MANZANA A1","tel":"0964152724","correo":""},{"ruc":"0602609679001","razon":"MACAS AMAGUAYA SEGUNDO PABLO","dir":"MANABI 323A E/CHILE Y ELOY ALFARO","tel":"0980253827","correo":""},{"ruc":"0916645633001","razon":"MACIAS BRAVO JACKSON ORLANDO","dir":"PORTETE #3110 E/LEONIDAS PLAZA Y GUERRERO MARTINEZ","tel":"","correo":""},{"ruc":"1311798274001","razon":"MACIAS ROBLES GREGORIA ANTONIA","dir":"PORTETE #3104 Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0922620323001","razon":"MACIAS VERGARA DEXY ROXANNA","dir":"GALLEGOS LARA 2831 E/4 DE NOVIEMBRE Y AZUAY","tel":"","correo":""},{"ruc":"0992664967001","razon":"MACROBIO S.A.","dir":"S/N","tel":"","correo":""},{"ruc":"0914002530001","razon":"MAGALLANES LEON EDISON RAFAEL","dir":"6 MARZO E/ALCEDO Y P.P. GOMEZ","tel":"0996568423","correo":""},{"ruc":"0924463003001","razon":"MAGALLANES RODRIGUEZ ESTRELLA MARISOL","dir":"PORTETE Y LA 8VA","tel":"0993058407","correo":""},{"ruc":"0900659053001","razon":"MANCHENO MASSON RAFAEL IGNACIO","dir":"CDLA. URDESA CENTRAL, MZ 102, SL1","tel":"","correo":""},{"ruc":"0918282864001","razon":"MANCHENO MEJIA GRACE ELIZABETH","dir":"LEONIDAS PLAZA #2862 E/CHAMBERS Y AV 4DE NOVIEMBRE","tel":"","correo":""},{"ruc":"0925143810001","razon":"MANUEL TOABANDA NUÑEZ","dir":"BATALLON DEL SUBURBIO - LA 23 Y LA P","tel":"","correo":""},{"ruc":"0990751528001","razon":"MAQUINAS Y SUMINISTROS MAQSUM C. LTDA.","dir":"AV. CARLOS JULIO AROSEMENA KM 2.5","tel":"0999484437","correo":"xorellana@maqsum.com.ec"},{"ruc":"0902285832001","razon":"MARCATOMA TIXI IGNACIO","dir":"PORTETE 3115 Y L. PLAZA","tel":"0979625125","correo":""},{"ruc":"0914552070001","razon":"MARCELO FREIRE PEÑAFIEL","dir":"ESMERALDAS 1018 Y VELEZ","tel":"2374019","correo":"matriz@cofreire.com"},{"ruc":"0990638861001","razon":"MARCELO FREIRE S.A.","dir":"ESMERALDAS #1014 E/VELEZ Y HURTADO","tel":"042374019","correo":"matriz@cofreire.com"},{"ruc":"0918521865001","razon":"MARCILLO PLAZA MARIO ALBERTO","dir":"COOP GUERRERO DEL FORTIN","tel":"","correo":"marcillo_mario@yahoo.es"},{"ruc":"0918521865001","razon":"MARCILLO PLAZA MARIO ALBERTO","dir":"COOP GUERRERO DEL FORTIN","tel":"","correo":"marcillo_mario@yahoo.es"},{"ruc":"0919029090001","razon":"MARCOS ANDRADE RUIZ","dir":"VENEZUELA #2921A Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0903492767001","razon":"MARFETAN ELSA LEONOR","dir":"LOS RIOS #2606 Y GOMEZ RENDON","tel":"","correo":""},{"ruc":"0915902829001","razon":"MARIA DOLORES PERAGALLO MOLINA","dir":"LA 7MA #201 Y 10 DE AGOSTO","tel":"2365449","correo":""},{"ruc":"1201223417001","razon":"MARIA ELITA PORTILLA","dir":"LIZARDO GARCIA #4132 E/SEDALANA Y ORIENTE","tel":"2233892","correo":""},{"ruc":"0940292204001","razon":"MARIA GABRIELA RODRIGUEZ ARBITO","dir":"GENERAL GOMEZ #2615 Y ABEL CASTILLO","tel":"","correo":""},{"ruc":"0940292204001","razon":"MARIA GABRIELA RODRIGUEZ ARBITO","dir":"GENERAL GOMEZ #2615 Y ABEL CASTILLO","tel":"","correo":""},{"ruc":"0907215198001","razon":"MARIA ORMEÑO BAJAÑA","dir":"GENERAL GOMEZ Y ABEL CASTILLO","tel":"","correo":""},{"ruc":"0916315179001","razon":"MARITZA ALEXANDRA BRAVO SUPO","dir":"ARGENTINA 1313 E/ MACHALA Y QUITO","tel":"","correo":""},{"ruc":"0916315179001","razon":"MARITZA ALEXANDRA BRAVO SUPO","dir":"ARGENTINA 1313 E/ MACHALA Y QUITO","tel":"","correo":""},{"ruc":"1804138475001","razon":"MARITZA FREIRE PAUCAR","dir":"PORTETE #3601 Y LA 10MA","tel":"","correo":""},{"ruc":"1804138475001","razon":"MARITZA FREIRE PAUCAR","dir":"PORTETE #3601 Y LA 10MA","tel":"","correo":""},{"ruc":"0903482545001","razon":"MARTHA CECILIA CASTILLO VALDEZ","dir":"GARCIA AVILES Y AGUIRRE","tel":"042512892","correo":"matriz@joyeriamarthita.com.ec"},{"ruc":"0910354455001","razon":"MARTHA ELIZABETH GALLEGOS GALLEGOS","dir":"PORTETE 3318 E/LA 7MA Y LA 8VA","tel":"042373189","correo":""},{"ruc":"0930371331001","razon":"MARTINEZ PALACIOS IRIS NATHALI","dir":"25 AVA #1508 E/ VENEZUELA Y COLOMBIA","tel":"","correo":""},{"ruc":"0908117039001","razon":"MARTINEZ PAREDES CARMEN DEL ROCIO","dir":"DOMINGO SAVIO Y GUERRERO VALENZUELA","tel":"0979568808","correo":""},{"ruc":"0927704478001","razon":"MARTINEZ RAMIREZ FRANKLIN DAVID","dir":"CUATRO DE NOVIEMBRE 2715 Y GALLEGOS LARA","tel":"0967399671","correo":""},{"ruc":"0904211703001","razon":"MARTINEZ SANCHEZ TERESA DE LOURDES","dir":"GALLEGOS LARA #2711 E/ EL ORO Y AZUAY","tel":"4609658","correo":""},{"ruc":"0993375585001","razon":"MARU GASTROLOUNGE S.A.S.","dir":"AV. ARCOS PLAZA LOTE 12121","tel":"","correo":""},{"ruc":"0993141658001","razon":"MARVICLIMA","dir":"AV VICENTE TRUJILLO Y CARCHI","tel":"","correo":"contabilidad@marvickima.com"},{"ruc":"0993141658001","razon":"MARVICLIMA","dir":"AV VICENTE TRUJILLO Y CARCHI","tel":"","correo":"contabilidad@marvickima.com"},{"ruc":"0993383841001","razon":"MARYAH SPA S.A.S.","dir":"C.C. LAS VITRINAS","tel":"","correo":""},{"ruc":"0700257918001","razon":"MATAILO VALAREZO VICTOR HUGO","dir":"CAMILO DESTUJE 2605 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0700257918001","razon":"MATAILO VALAREZO VICTOR HUGO","dir":"CAMILO DESTUJE 2605 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0902552520001","razon":"MATAMOROS ROJAS BETTY DELIA","dir":"LA 11AVA Y CRISTOBAL COLON","tel":"4630347","correo":""},{"ruc":"0952179505001","razon":"MATUTE JIMENEZ RICHARD KEVIN","dir":"PORTETE E/LEONIDAS PLAZA Y GALLEGOS LARA","tel":"0959282903","correo":""},{"ruc":"0925648917001","razon":"MAURATH URGILES DANA AZUCENA","dir":"JOSE DE LA CUADRA Y AV TULCAN ESQ","tel":"0991396538","correo":""},{"ruc":"0992730900001","razon":"MAXIMA SEGURIDAD INTEGRAL CIA. LTDA. MSI","dir":"ALFREDO VALENZUELA 1203 Y AV 23 SO","tel":"","correo":"info@msicialtda.com"},{"ruc":"0931461636001","razon":"MEDINA ALVARADO EMILIANO JESUS","dir":"PORTETE 2902 Y GUERRERO VALENZUELA","tel":"0961105963","correo":""},{"ruc":"0913606455001","razon":"MEDINA GAMBOA ROBERTO JAMIL","dir":"PORTETE 2910B E/GUERRERO VALENZUELA Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0913606455001","razon":"MEDINA GAMBOA ROBERTO JAMIL","dir":"PORTETE 2910B E/GUERRERO VALENZUELA Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0917967572001","razon":"MEDINA TORRES MICHAEL GONZALO","dir":"PORTETE Y LA 8VA","tel":"0986535721","correo":""},{"ruc":"0301171302001","razon":"MEJIA SOLIS LUIS ORLANDO","dir":"LA 11AVA #1001 Y CALICUCHIMA","tel":"","correo":""},{"ruc":"0301171302001","razon":"MEJIA SOLIS LUIS ORLANDO","dir":"LA 11AVA #1001 Y CALICUCHIMA","tel":"0967586072","correo":"sarachila06@gmail.com"},{"ruc":"0601888449001","razon":"MELENA MORENO RAUL MARCELO","dir":"EL ORO Y RAFAEL GUERRERO VALENZUELA","tel":"","correo":"rmelenar@hotmail.com"},{"ruc":"0911568822001","razon":"MELGAR BAJAÑA VICTOR HUGO","dir":"LEONIDAS PLAZA #2301 E/VENEZUELA Y COLOMBIA","tel":"","correo":""},{"ruc":"0905502050001","razon":"MENA OCHOA CARLOS PATRICIO","dir":"LA 29AVA #1107 Y LETAMENDI","tel":"0967480166","correo":""},{"ruc":"0953985041001","razon":"MENDEZ MENDES AIDA LIZBETH","dir":"LA 29AVA Y ROSENDO AVILES","tel":"0967614218","correo":""},{"ruc":"0930619424001","razon":"MENDEZ MENDEZ CRISTIAN ALONSO","dir":"PORTETE 2709 Y BABAHOYO","tel":"0986563408","correo":""},{"ruc":"0920412376001","razon":"MENDEZ MENDIETA MARIA GUADALUPE","dir":"LA 24AVA Y CALLE Q","tel":"0996929044","correo":""},{"ruc":"0950798298001","razon":"MENDIETA LONDA MARILIN ELIZABETH","dir":"AV QUITO #2824 Y LETAMENDI","tel":"0969901999","correo":""},{"ruc":"0903395739001","razon":"MENDOZA ALVEAR VICTOR MIGUEL","dir":"COOP 7 LAGUITOS MZ 1467 V10","tel":"0994138697","correo":"victor.mendoza50@hotmail.com"},{"ruc":"0918826561001","razon":"MENDOZA BARAHONA FERNANDO XAVIER","dir":"COOP 7 LAGUITOS MZ 1467 V10","tel":"0994138697","correo":""},{"ruc":"0923871388001","razon":"MENDOZA FELIX CRISTOPHER ALEXANDER","dir":"LOMAS DE SARGENTILLO","tel":"0988324844","correo":""},{"ruc":"0927628149001","razon":"MENDOZA MUÑOZ MARY ARIANA","dir":"URBANOR MZ101 LOCAL 12","tel":"0992415104","correo":"segurimen@hotmail.com"},{"ruc":"1311406894001","razon":"MERA MERO BETTY ALEXANDRA","dir":"29VA Y CALLE K","tel":"0968606657","correo":""},{"ruc":"0903270304001","razon":"MERCEDES ROSADO GUERRERO","dir":"GRAL GOMEZ #2723 E/ABEL CASTILLO Y GUERRERO VALENZUELA","tel":"2450907","correo":""},{"ruc":"0913158705001","razon":"MERCHAN RICAURTE CECIVEL MARGARITA","dir":"VIA A LA COSTA KM 11.5 C.C. BLUE COAST LOCAL 5","tel":"0939689261","correo":""},{"ruc":"0914357249001","razon":"MERCHAN VILLAMAR LUIS WILMER","dir":"ABEL CASTILLO Y GENERAL GOMEZ","tel":"0986763319","correo":""},{"ruc":"0905890984001","razon":"MERELO MORAN NELSON ANDRES","dir":"FLORESTA 3","tel":"0996733029","correo":""},{"ruc":"0904580982001","razon":"MERO LAAZ MILTON NAPOLEON","dir":"CALLEJON LA 8VA Y CALLEJON ROBLES CHAMBERS","tel":"4600626","correo":""},{"ruc":"0904580982001","razon":"MERO LAAZ MILTON NAPOLEON","dir":"CALLEJON LA 8VA Y CALLEJON ROBLES CHAMBERS","tel":"4600626","correo":""},{"ruc":"0906839469001","razon":"MERO SANCHEZ CARMEN LOURDES","dir":"GUASMO NORTE COOP 24 DE MAYO MZ228 SL19","tel":"0982837088","correo":""},{"ruc":"0913146726001","razon":"MEZA PEÑA JOSE VICENTE","dir":"CORONEL #1706 Y VENEZUELA","tel":"6022030","correo":""},{"ruc":"0800602849001","razon":"MINA VERNAZA RICHARD","dir":"5 DE AGOSTO Y PEDRO CHIRIBOGA","tel":"0993474092","correo":""},{"ruc":"0992941103001","razon":"MISION CRISTIANA EVANGELICA DIOS HABLA AL MUNDO","dir":"CAPITAN NAJERA E LA 15 Y LA 16","tel":"0995986121","correo":""},{"ruc":"0992669535001","razon":"MISION EVANGELICA CRISTO LA LUZ DIVINA","dir":"GUASMO SUR COOP. UNION BANANERA BLOQUE 1 MZ25 SL7","tel":"","correo":"m.ecristolaluzdivina@hotmail.com"},{"ruc":"0925793861001","razon":"MITE GUILLEN TATIANA DEL PILAR","dir":"HIDEYO NOGUCHI 347 Y SEBASTIAN DE BENALCAZAR","tel":"","correo":""},{"ruc":"0962003992001","razon":"MOLINA ALCALA ANGEL ESTEBAN","dir":"GRAL GOMEZ #2729 Y GUERRERO VALENZUELA","tel":"0998990115","correo":""},{"ruc":"0919640789001","razon":"MOLINA HERNANDEZ RITA ANDREA","dir":"NUEVE DE OCTUBRE 308 Y GENERAL CORDOVA, EDIF. SAN FRACISCO 300, LOCAL 12","tel":"","correo":""},{"ruc":"0912122272001","razon":"MONCAYO HERNANDEZ EDWIN ALDRIN","dir":"LA 37AVA Y GARCIA GOYENA","tel":"0985400127","correo":"semacon@hotmail.es"},{"ruc":"0911830826001","razon":"MONCAYO TOMALA LORENA MERCEDES","dir":"NOGUCHI Y FRANCO DAVILA","tel":"","correo":""},{"ruc":"0918239864001","razon":"MONTALVAN GUALE PEDRO EBERTO","dir":"LA 10MA Y AYACUCHU","tel":"0992076782","correo":""},{"ruc":"0925739997001","razon":"MONTENEGRO SALAS VICTOR MANUEL","dir":"AV 9 DE OCTUBRE #308 Y GRAL CORDOVA","tel":"2308156","correo":"raulmolina2660@gmail.com"},{"ruc":"1100464898001","razon":"MONTERO PARDO ANGEL SALVADOR","dir":"GALLEGOS LARA 1929 Y ARGENTINA","tel":"2365124","correo":""},{"ruc":"0914895537001","razon":"MONTESDEOCA MEJIA CESAR ANTONIO","dir":"VENEZUELA 2835 Y GUERRERO VALENZUELA","tel":"04236526","correo":""},{"ruc":"0914895537001","razon":"MONTESDEOCA MEJIA CESAR ANTONIO","dir":"VENEZUELA 2835 Y GUERRERO VALENZUELA","tel":"04236526","correo":""},{"ruc":"0961304524001","razon":"MONTOYA ACEVEDO ANDRES FELIPE","dir":"COOP JUSTICIA Y LIBERTAD MZ1495 SL23","tel":"","correo":"montoyaacevedoa@gmail.com"},{"ruc":"0961304524001","razon":"MONTOYA ACEVEDO ANDRES FELIPE","dir":"COOP JUSTICIA Y LIBERTAD MZ1495 SL23","tel":"","correo":"montoyaacevedoa@gmail.com"},{"ruc":"1206290296001","razon":"MORA MILLAN SAMUEL OLMEDO","dir":"PORTETE E/LIZARDO GARCIA Y BABAHOYO","tel":"0981169021","correo":""},{"ruc":"0929048718001","razon":"MORAN ZAMBRANO GERSON ORLANDO","dir":"PASCUALES","tel":"0961618066","correo":""},{"ruc":"1201488416001","razon":"MOREIRA CERVANTES MARIELA ELIZABETH","dir":"LOS ALMENDROS - AV. ERNESTO ALBAN MZ19 V22","tel":"0998288611","correo":""},{"ruc":"0951039031001","razon":"MOREIRA GONZALEZ JOSE ANTONIO","dir":"LEONIDAS PLAZA 2202 Y PORTETE","tel":"0998625324","correo":""},{"ruc":"0602675613001","razon":"MORENO ALDAZ MARIA SOLEDAD","dir":"PUSUQUI","tel":"3431119","correo":"soledadmoreno979@gmail.com"},{"ruc":"0914969779001","razon":"MORENO PERALTA JORGE JOHN","dir":"OCTAVA Y FRANCISCO DE MARCOS","tel":"0992204299","correo":""},{"ruc":"0922902143001","razon":"MOSCOSO VASQUEZ KARLA VANESSA","dir":"ANDRES MARIN 1018 Y CAPITAN NAJERA","tel":"","correo":"Karmoseg@hotmail.com"},{"ruc":"0916685019001","razon":"MOSQUERA PEÑAFIEL MERCEDES DEL ROCIO","dir":"MIRAFLORES CALLE 6TAY EL SALADO","tel":"0981608004","correo":""},{"ruc":"0992762152001","razon":"MULTITECNOS S.A.","dir":"KM 14.5 AV. MIGUEL YUNEZ - CENTRO DE OPERACIONES ALMAX II","tel":"","correo":"contabilidad1@multitecnos.com"},{"ruc":"0992923172001","razon":"MUNDICABLES S.A.","dir":"TNT. LEDESMA ENTRE AYACUCHO Y PEDRO PABLO GOMEZ","tel":"2368213","correo":"contabilidad@autocables.info"},{"ruc":"2350255879001","razon":"MUÑOZ BARBERAN EVELYN ROXANA","dir":"AV LAS AGUAS Y COSTANERA","tel":"0980300557","correo":""},{"ruc":"0919952366001","razon":"MUÑOZ SUAREZ MARCELO EFREN","dir":"COOP NUEVA PROSPERINA MZ2167 S2","tel":"","correo":""},{"ruc":"0920173002001","razon":"MURILLO BAJAÑA ALBERTO GREGORIO","dir":"CUENCA 1609 E/ MACHALA Y JOSE DE ANTEPARA","tel":"","correo":""},{"ruc":"0908809015001","razon":"NARANJO ORTIZ ELSIE ELIZABETH","dir":"LA 7MA #2300 Y VENEZUELA","tel":"","correo":""},{"ruc":"0913435178001","razon":"NAULA GORDILLO CARLOS SALVADOR","dir":"CAMILO DESTRUGE Y GUERRERO MARTINEZ","tel":"","correo":""},{"ruc":"0908440316001","razon":"NAVARRO TORO GERMAN ENRIQUE","dir":"SN SOLAR 4 Y SN","tel":"","correo":""},{"ruc":"1306025543001","razon":"NELLY AMELIA MERCHAN GOMEZ","dir":"AV LOS ANGELES MZ481 SL2","tel":"","correo":""},{"ruc":"1103497325001","razon":"NELSON ESTUARDO CACAY LUZURIAGA","dir":"PORTETE Y ABEL CASTILLO","tel":"","correo":""},{"ruc":"0911273878001","razon":"NEVAREZ TELLO ALBA JULISSA","dir":"PORTETE 2916 E/ GALLEGOS LARA Y GUERRERO VALENZUELA","tel":"094115243","correo":"multiservmse@gmail.com"},{"ruc":"1001050556001","razon":"NIETO SANTANA DORA MERCEDES","dir":"CDLA LA SAIBA MZ C VILLA12","tel":"0939292659","correo":""},{"ruc":"0905531422001","razon":"NIEVES VERA CRISTINA ELIZABETH","dir":"ARGENTINA 2707 Y GUERRERO VALENZUELA","tel":"0999398187","correo":""},{"ruc":"0901457416001","razon":"NILA GRACIA FREIRE MONTJOY","dir":"KM 11 VIA A LA COSTA","tel":"042991827","correo":"canteralalorena5@hotmail.com"},{"ruc":"0922474796001","razon":"NIXON PONCE GARCIA","dir":"PORTETE Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0926103094001","razon":"NORMAN JOHN ACUÑA BAILON","dir":"QUISQUIS 1606A Y TUNGURAHUA","tel":"","correo":"john_a_bailon@hotmail.com"},{"ruc":"0993247812001","razon":"NOVA INTEGRAL SA","dir":"","tel":"","correo":""},{"ruc":"1790374343001","razon":"NOVOPAN DEL ECUADOR S.A.","dir":"CALLE 19H NO DR FERNANDO GUTIERREZ INTERSECCION NA VIA A DAULE KM 8 1/2","tel":"042590820","correo":"psanchez@pelikano.com, lprado@pelikano.com, fmendoza@pelikano.com"},{"ruc":"1712004595001","razon":"NUÑEZ RIZO SONIA JULIETA","dir":"ALIANZA #402 Y LA 13AVA","tel":"09892015004","correo":""},{"ruc":"0991385568001","razon":"OFERSERVI S.A.","dir":"LUIS URDANETA 312 Y ESCOBEDO","tel":"","correo":"ventas@oferservi.com"},{"ruc":"1103013940001","razon":"OLGA PIEDAD RAMON TANDAZO","dir":"LA 36AVA E/LA CH Y LA D","tel":"042665341","correo":"piedadramon_72@hotmail.com"},{"ruc":"1103013940001","razon":"OLGA PIEDAD RAMON TANDAZO","dir":"LA 36AVA E/LA CH Y LA D","tel":"042665341","correo":"piedadramon_72@hotmail.com"},{"ruc":"0931713697001","razon":"OLMEDO MORALES MIKE DANIEL","dir":"24AVA Y VENEZUELA","tel":"","correo":"extinprocec93@gmail.com"},{"ruc":"0992778342001","razon":"OMFERTSA NUCLEOS DEL ECUADOR S.A.","dir":"CARRETERA PRINCIPAL S/N Y RETORNO 6","tel":"0999157293","correo":""},{"ruc":"0903775906001","razon":"ORDEN YUPA FRANCISCO","dir":"MEDARDO ANGEL SILVA #2509 E/LA 20 Y LA 21","tel":"","correo":""},{"ruc":"0102197738001","razon":"ORDOÑEZ LUIS ENRIQUE","dir":"PORTETE 3200A Y GUERRERO MARTINEZ","tel":"","correo":""},{"ruc":"0918211111001","razon":"ORTEGA LARREA GALO EDUARDO","dir":"MALDONADO E/LA 31 Y LA 32AVA","tel":"0989585165","correo":"controldfire@gmail.com"},{"ruc":"0801310772001","razon":"ORTIZ ESTUPIÑAN CARMEN EUGENIA","dir":"VENEZUELA Y LA 7MA","tel":"0990756897","correo":""},{"ruc":"0900411877001","razon":"ORTIZ GARCIA JAIME ALEXANDER","dir":"DURAN","tel":"","correo":"Gkary74@hotmail.com"},{"ruc":"0953406188001","razon":"ORTIZ GOMEZ IVAN ALEJANDRO","dir":"SAUCES 8 MZ 454 F32 - SOLAR 4","tel":"0968208770","correo":"prosuinortiz@gmail.com"},{"ruc":"0927105411001","razon":"ORTIZ SILVA WALTER ANDRES","dir":"VILLAVICENCIO 2200 E/ AZUAY Y EL ORO","tel":"0979489131","correo":"liamandres007@gmail.com"},{"ruc":"0924667553001","razon":"OSCAR HIDALGO GARCIA","dir":"PORTETE #5327 Y LA 28AVA","tel":"","correo":""},{"ruc":"1101194528001","razon":"PACHECO LOAIZA BRIGIDA","dir":"CALLEJON 11 #2344 E/4 DE NOVIEMBRE Y DOMINGO SAVIO","tel":"","correo":""},{"ruc":"1101194528001","razon":"PACHECO LOAIZA BRIGIDA","dir":"CALLEJON 11 #2344 E/4 DE NOVIEMBRE Y DOMINGO SAVIO","tel":"","correo":""},{"ruc":"0904098175001","razon":"PADILLA RENDON CLARA MATILDE","dir":"GARCIA GOYENA 2723 Y LEONIDAS PLAZA","tel":"2363349","correo":""},{"ruc":"0951035534001","razon":"PALMA DE LA CRUZ BILLY MICHAEL","dir":"4 DE NOVIEMBRE #086 E/ LA 9NA Y LA 10MA","tel":"0987264281","correo":""},{"ruc":"0957555279001","razon":"PANCHANA CRUZ CARLOS EDUARDO","dir":"LA 17 Y GOMEZ RENDON","tel":"0969588965","correo":""},{"ruc":"1791957342001","razon":"PAPIZZEC S.A.","dir":"NACIONES UNIDAS E10-50 Y SEIS DE MARZO","tel":"022250044","correo":"facturas@papajohns.com.ec, jvillacis@papajohns.com.ec"},{"ruc":"0992657677001","razon":"PARADAIS S.A.","dir":"URDESA","tel":"0991363546","correo":""},{"ruc":"1801058379001","razon":"PAREDES RODRIGUEZ ANGEL EDUARDO","dir":"GENERAL GOMEZ 1700 Y GARCIA MORENO","tel":"0988025421","correo":"paredes9angel@gmail.com"},{"ruc":"1308064482001","razon":"PARRAGA MENDOZA DIOFFRE NERI","dir":"SAN MARTIN Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0927421578001","razon":"PAUCAR CUJILEMA VERONICA JESSICA","dir":"PORTETE 4304 Y CALLES 17AVA - 18AVA.","tel":"0981246637","correo":""},{"ruc":"0912241973001","razon":"PEDRO GONZABAY VILLAMAR","dir":"BOLIVIA 2518 E/ABEL CASTILLO Y GUERRERO VALENZUELA","tel":"2192879","correo":"Klevergonzabay-@hotmail.com"},{"ruc":"0953618436001","razon":"PEÑA CASQUETE LUIS EDUARDO","dir":"RUMICHACA Y AGUIRRE","tel":"","correo":"penal3774@gmail.com"},{"ruc":"0916947567001","razon":"PEÑAFIEL GOMEZ SANTA ISABEL","dir":"LA 26AVA #2201 Y MARACAIBO","tel":"0959784046","correo":""},{"ruc":"1710565779001","razon":"PERES MORALES RUTH ELIZABETH","dir":"C.C. RIOCENTRO EL DORADO","tel":"","correo":""},{"ruc":"0954000030001","razon":"PEREZ FALCONES DANIELA MARGARITA","dir":"BOLIVIA 3011 Y NICOLAS SEGOVIA","tel":"","correo":""},{"ruc":"0927195248001","razon":"PEREZ MORENO LUIS FERNANDO","dir":"KENNEDY NORTE - AV. MIGUEL H ALCIVAR","tel":"0961487813","correo":""},{"ruc":"0993376699001","razon":"PHYSIOFREIRE S.A.S.","dir":"CDLA KENNEDY VIEJA CALLE AV. SAN JORGE #605 Y CALLE 7MA OESTE","tel":"","correo":"administracion@physiofreire.com"},{"ruc":"0959167438001","razon":"PICANTERIA MILTIÑO","dir":"SAMANES 5 MZ 9281 V11","tel":"","correo":""},{"ruc":"0604338830001","razon":"PILAMUNGA CAIZAGUANO HILDA LEONOR","dir":"PORTETE Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0602613671001","razon":"PILATAXI CACHUPUS ROSENDO","dir":"PORTETE Y G.VALENZUELA - G.LARA","tel":"2190764","correo":""},{"ruc":"0921685970001","razon":"PIMENTEL VALLEJO DIEGO ANDRES","dir":"MOCOLI, ARRECIFE","tel":"","correo":"diegopimentelv97@gmail.com"},{"ruc":"0924750946001","razon":"PIN REYES FELIX WILLIAM","dir":"GENERAL GOMEZ 2828 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0993107344001","razon":"PLASTIC COMPANY IH S.A.","dir":"KM5,5 VIA DURAN - BABAHOYO","tel":"","correo":"gerenciaihpc@outlook.com"},{"ruc":"0993107344001","razon":"PLASTIC COMPANY IH S.A.","dir":"KM5,5 VIA DURAN - BABAHOYO","tel":"","correo":"gerenciaihpc@outlook.com"},{"ruc":"0953672144001","razon":"PLUAS VITERI ALLISSON THAIZ","dir":"JOSE DE ANTEPARA Y CHAVEZ FRANCO","tel":"","correo":"alisonpluas@gmail.com"},{"ruc":"0993187607001","razon":"POLYKRET CONSTRU","dir":"KM 3,5 AV JUAN TANCA MARENGO","tel":"","correo":""},{"ruc":"0800971343001","razon":"PRADO PEÑA RICHARD ENRIQUE","dir":"AV. FELIPE PEZO CAMPUZANO Y AV DEL SANTUARIO","tel":"","correo":"seiprado@hotmail.com"},{"ruc":"0992750030001","razon":"PRIMEFENIX S.A.","dir":"KENNEDY NORTE AV. FRANCISCO DE ORELLANA EDIF WTC TORRE A/ PISO6 OFIC601","tel":"042631249","correo":"primefenixsa.gye@gmail.com"},{"ruc":"0993388441001","razon":"PROBANEN S.A.S.","dir":"MUCHO LOTE 2 PLAZA VICTORIA MZ 2943 V6","tel":"0958915884","correo":"probanen2024@gmail.com"},{"ruc":"0992361751001","razon":"PROCORPORATION S.A.","dir":"HUANCAVILCA #2128 E/LOS RIOS Y TULCAN","tel":"042280180","correo":""},{"ruc":"0993371439001","razon":"PROCUNSA S.A.S.","dir":"BOSQUES DE LA COSTA","tel":"0990119072","correo":""},{"ruc":"1792025435001","razon":"PRODUCCIONES Y EVENTOS NOVOEVENTOS S.A.","dir":"COREA N°126 Y AVE. AMAZONAS","tel":"3355400","correo":"facturas.electronicas@kfc.com.ec"},{"ruc":"0992802707001","razon":"PRODUCIR Y EXPORTAR PREXPORT S.A.","dir":"HUANCAVILCA #2128 E/LOS RIOS Y TULCAN","tel":"","correo":""},{"ruc":"0992701692001","razon":"PRODUCSOL S.A.","dir":"CDLA.ADACE CALLE A Y LA 5TA","tel":"042280180","correo":"marcelor@on.net.ec, contabilidad1@producsol.com"},{"ruc":"1792141486001","razon":"PROMOTORA ECUATORIANA DE CAFÉ DE COLOMBIA S.A.","dir":"COREA N°126 Y AV. AMAZONAS EDIFICIO BELMONTE PISO 7","tel":"23955400","correo":"facturas.electronicas@kfc.com.ec, felipe.quinto@kfc.com.ec"},{"ruc":"0700916109001","razon":"QUEVEDO QUEVEDO MANUEL ESPIRITU","dir":"ARGENTINA #3119 E/LA 7MA Y LA 8VA","tel":"367245","correo":""},{"ruc":"0702220732001","razon":"QUEZADA ARIAS FREDY ROBALINO","dir":"PROSPERINA","tel":"0997046852","correo":""},{"ruc":"0941457798001","razon":"QUIÑONEZ RODRIGUEZ JOSHUE JAMPIER","dir":"URB. SAN ANTONIO","tel":"0968780650","correo":""},{"ruc":"0943943738001","razon":"QUISHPE LLUGUAY MELANY LISBETH","dir":"VENEZUELA 2505 Y ENTRE LIZARDO GARCIA Y TUNGURAHUA","tel":"0992831295","correo":""},{"ruc":"0907686620001","razon":"QUIZHPE SANCHEZ MANUEL JESUS","dir":"LIZARDO GARCIA 4121 Y SEDALANA","tel":"0939157758","correo":"emanuel59@hotmail.com"},{"ruc":"0906351119001","razon":"RAMIREZ CARRASCO WILLIAM RODOLFO","dir":"LOS RIOS Y LA A","tel":"","correo":""},{"ruc":"0906351119001","razon":"RAMIREZ CARRASCO WILLIAM RODOLFO","dir":"LOS RIOS Y LA A","tel":"","correo":""},{"ruc":"0915382923001","razon":"RAMIREZ PATIÑO KARINA DEL CARMEN","dir":"GUAYAQUIL","tel":"0992081580","correo":""},{"ruc":"0961307394001","razon":"RAMIREZ WENDDY COROMOTO","dir":"LA PROSPERINA CALLE 4 - E/LA 2DA Y LA 3RA","tel":"0979300779","correo":""},{"ruc":"0926797572001","razon":"RAMIREZ ZULUAGA TIBERIO ADOLFO","dir":"GUERRERO MARTINEZ Y LA A","tel":"","correo":""},{"ruc":"0911199180001","razon":"RAMOS DAVILA ALEXANDRA MARIBEL","dir":"SAUCES VI","tel":"","correo":"alexramos21@gmail.com"},{"ruc":"0920738150001","razon":"RAMOS TRIVIÑO WILSON DAVID","dir":"CDLA MARTHA DE ROLDOS","tel":"0997911449","correo":""},{"ruc":"0900028101001","razon":"RAZA PARRA VICENTE GUILLERMO","dir":"AZUAY 1812 Y ABEL CASTILLO","tel":"","correo":""},{"ruc":"0992714921001","razon":"RAZACROSSFIT S.A.","dir":"KM 4.5 AV DEL BOMBERO DENTRO DE FEDENADOR","tel":"0985979412","correo":""},{"ruc":"0992958987001","razon":"RESTAURANTE RESTACOST S.A.","dir":"ROCAFUERTE Y JUAN MONTALVO","tel":"N/D","correo":"alexander.palacio@bazfex.com"},{"ruc":"0993396887001","razon":"RESTAURANTES ASIATICOS DEL ECUADOR RESASEC S.A.S.","dir":"KM 14.5 VIA SAMBORONDON LOTE 6 Y VIA SAMBORONDON","tel":"","correo":""},{"ruc":"0918133125001","razon":"REYES CASTILLO VICENTE OCTAVIO","dir":"C.C. MALL DEL SOL","tel":"","correo":""},{"ruc":"0902743608001","razon":"REYES CASTRO YOLANDA","dir":"MARACAIBO 1229 Y MACHALA","tel":"2347523","correo":""},{"ruc":"0902743608001","razon":"REYES CASTRO YOLANDA","dir":"MARACAIBO 1229 Y MACHALA","tel":"2347523","correo":""},{"ruc":"0922039318001","razon":"REYES RODRIGUEZ SERGIO ANDRES","dir":"VIA A LA COSTA 3 Y VIA A LA COSTA","tel":"","correo":"sergio_reyser@hotmail.com"},{"ruc":"0917066185001","razon":"REYES SUAREZ PEDRO CESAR","dir":"LIZARDO GARCIA Y DOMINGO SAVIO","tel":"0992904050","correo":""},{"ruc":"0907655294001","razon":"REYES VACA EFRAIN","dir":"CDLA PEDRO MENENDEZ MZ 5 SL21","tel":"0980285376","correo":"efreinreyesv539@gmail.com"},{"ruc":"0992208104001","razon":"REYSER S.A.","dir":"URB. VIA AL SOL VIA A LA COSTA MZ574 VILLA3","tel":"042426880","correo":"sergio_reyser@hotmail.com"},{"ruc":"0992649356001","razon":"RICASOPA S.A. RISOSA","dir":"NICOLAS SEGOVIA #2839 Y 4 DE NOVIEMBRE","tel":"","correo":""},{"ruc":"0992649356001","razon":"RICASOPA S.A. RISOSA","dir":"NICOLAS SEGOVIA #2839 Y 4 DE NOVIEMBRE","tel":"","correo":""},{"ruc":"0919266122001","razon":"RICAURTE PERERO PAUL LEONARDO","dir":"GUASMO OESTE DIGNIDAD POPULAR MALVINAS MZ4250 SL28","tel":"","correo":"christianalfredo91@hotmail.com"},{"ruc":"0909098394001","razon":"RIVADENEIRA LAZO CARLA PAMELA","dir":"C.C. RIOCENTRO ENTRE RIOS - PUNTILLA","tel":"","correo":""},{"ruc":"0909098394001","razon":"RIVADENEIRA LAZO CARLA PAMELA","dir":"C.C. RIOCENTRO ENTRE RIOS - PUNTILLA","tel":"","correo":""},{"ruc":"0903925410001","razon":"RIVERA VALLEJO CARLOS RAMON","dir":"EDIFICIO XIMA 2DO PISO OF229 SAMBORONDON","tel":"","correo":""},{"ruc":"0951202233001","razon":"ROBERTH ALEXANDER VERA MUZO","dir":"COOP TECHO PARS TODOS SL 26 MZB","tel":"","correo":""},{"ruc":"0923011159001","razon":"RODITI CAPUTI MARIA FERNANDA","dir":"ESMERALDAS 1014 Y VELEZ","tel":"0984886425","correo":""},{"ruc":"0912254653001","razon":"RODRIGUEZ JAIME MARIELLA DE LOURDES","dir":"ZAPOTAL CALLE SAN PEDRO","tel":"0994570898","correo":"rodriguezjaimemarieladelourde@gmail.com"},{"ruc":"1391792751001","razon":"RODRÍGUEZ OLEAS DISTRIBUCIONES ECUADOR ROLDEG S.A.","dir":"KM32 VIA DURAN-TAMBO","tel":"","correo":""},{"ruc":"0902925239001","razon":"RODRIGUEZ VELASCO ROSA ANTONIA","dir":"PORTETE #3014 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0910023779001","razon":"RODRIGUEZ VILLARREAL PEDRO MARCELO","dir":"ABDON CALDERON Y JUAN CHANALATA","tel":"0997001916","correo":""},{"ruc":"0917074858001","razon":"RONQUILLO ROMERO MIRIAM DEL ROCIO","dir":"LUQUE #611 E/ BOYACA Y GARCIA AVILES","tel":"","correo":"_dr_rr@hotmail.com"},{"ruc":"0103220331001","razon":"ROSA GORDILLO SAAVEDRA","dir":"COLOMBIA Y GUERRERO MARTINEZ ESQ","tel":"","correo":""},{"ruc":"0909916371001","razon":"ROSADO ORTIZ CARLOS ALONSO","dir":"LA 8VA E/PORTETE Y VENEZUELA","tel":"5167523","correo":""},{"ruc":"0932127079001","razon":"ROSADO QUIZHPI FELIX XAVIER","dir":"AV MACHALA E/HUANCAVILCA Y CAPITAN NAJERA","tel":"0980498186","correo":""},{"ruc":"0931731293001","razon":"RUEDA MOYOTA MICHELLE ESTEFANIA","dir":"LA 12 Y 4 DE NOVIEMBRE LOCAL 5","tel":"","correo":"michelle_rueda95@outlook.es"},{"ruc":"0604488445001","razon":"SAGÑAY MALAN LUIS ALFREDO","dir":"SALINAS Y PORTETE","tel":"","correo":""},{"ruc":"0604488445001","razon":"SAGÑAY MALAN LUIS ALFREDO","dir":"SALINAS Y PORTETE","tel":"","correo":""},{"ruc":"0990343462001","razon":"SAL-MOS SALINAS MOSQUIÑAÑA S.A.","dir":"ROBLES 109 Y CHAMBERS","tel":"","correo":"valentina.orrantia@champmar.com, martha.montalvo@champmar.com"},{"ruc":"0603937210001","razon":"SALAO SALAO GUILLERMO","dir":"4 DE NOVIEMBRE 4259 Y CALLE 15AVA. Y CALLE 16AVA.","tel":"","correo":""},{"ruc":"0905238051001","razon":"SALAZAR CAJAMARCA LUPE ISABEL","dir":"CALICUCHIMA #1606 Y GARCIA MORENO","tel":"042372362","correo":""},{"ruc":"0913155222001","razon":"SALAZAR PIEDRAHITA DIANA MARIA","dir":"GOMEZ RENDON Y LA 23AVA","tel":"","correo":""},{"ruc":"0992685123001","razon":"SALESCOMPANY S.A.","dir":"CHIMBORAZO 212 Y SAN MARTIN","tel":"","correo":""},{"ruc":"2000059341001","razon":"SALGADO LEON LISBETH ESTEFANIA","dir":"QUISQUIS #1439 Y HECTOR TOSCANO","tel":"","correo":""},{"ruc":"0990973571001","razon":"SAMISA SERVICIOS AEREOS Y MARITIMOS INTERNACIONALES S.A.","dir":"AV. RODRIGO CHAVEZ G PARQUE EMPRESARIAL COLON TERCERA ETAPA EDIF PACIFIC PLAZA PISO 1 OFIC 101","tel":"","correo":"facturacion@samisa.com.ec, Contabilidad@samisa.com.ec"},{"ruc":"0922114418001","razon":"SANCHEZ ESPAÑA LISETTE MIRIAM","dir":"LORENZO DE GARAICOA Y ARGENTINA","tel":"0969852544","correo":"pharmapoint2022@gmail.com"},{"ruc":"0913511804001","razon":"SANCHEZ MORAN MIRYAM CELESTE","dir":"PORTETE 2731 Y ABEL CASTILLO","tel":"","correo":""},{"ruc":"0911639987001","razon":"SANCHEZ PAZMIÑO JAVIER ARQUIMIDES","dir":"AZUAY 1217 Y LOS RIOS","tel":"","correo":""},{"ruc":"0918465428001","razon":"SANCHEZ SALINAS NELSON FRANCISCO","dir":"GALLEGOS LARA #3100B Y AYACUCHO","tel":"0994793625","correo":""},{"ruc":"0951094796001","razon":"SANTOS SUAREZ DENISSE ALEXIS","dir":"COMUNA VALDIVIA MANGLAR ALTO","tel":"0981817227","correo":""},{"ruc":"0905420477001","razon":"SARA MARCA CARDENAS","dir":"GOMEZ RENDON #2701 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"0905420477001","razon":"SARA MARCA CARDENAS","dir":"GOMEZ RENDON #2701 Y GALLEGOS LARA","tel":"","correo":""},{"ruc":"1600639031001","razon":"SARABIA COELLO ANDREA GABRIELA","dir":"RUMICHACA Y 9 DE OCTUBRE","tel":"","correo":""},{"ruc":"1201744669001","razon":"SARABIA VALDIVIEZO JORGE GINNIO","dir":"GOMEZ RENDON Y LA 33AVA","tel":"","correo":""},{"ruc":"1201744669001","razon":"SARABIA VALDIVIEZO JORGE GINNIO","dir":"GOMEZ RENDON Y LA 33AVA","tel":"","correo":""},{"ruc":"2490407858001","razon":"SEGUINVIA S.A.S.","dir":"AVENIDA 12 SN Y ENTRE CALLES 10 Y 11","tel":"","correo":""},{"ruc":"0991265147001","razon":"SEGURIDAD E IMPLEMENTOS INDUSTRIALES DEL ECUADOR (SEGUINDUSTRIAS DEL ECUADOR CIA. LTDA.)","dir":"LORENZO DE GARAYCOA 301 Y MANUEL GALECIO","tel":"","correo":"seguindustrias@hotmail.com"},{"ruc":"1792098424001","razon":"SEMEBAR S.A.","dir":"CATALINA ALDAZ Y PORTUGAL","tel":"6000250","correo":"hganan@semebar.com"},{"ruc":"0993276405001","razon":"SEPAD SERVICIO DE ENFERMERAS PROFESIONALES A DOMICILIO CIA.LTDA.","dir":"URDESA - MONJAS Y AV QUINTA","tel":"0994206643","correo":""},{"ruc":"0993388256001","razon":"SERELOMAT S.A.S.","dir":"","tel":"","correo":"edercobos42@gmail.com"},{"ruc":"0915983126001","razon":"SERRANO LAINEZ AMADA MARIA","dir":"MARTHA DE ROLDOS MZ710 V10","tel":"","correo":""},{"ruc":"0992146435001","razon":"SERSIL S.A.","dir":"SUCRE 101 Y MALECON SIMON BOLIVAR","tel":"","correo":""},{"ruc":"0992727500001","razon":"SERVIORDER S.A.","dir":"NAHIM ISAIAS BARQUET SOLAR 6-7 Y MIGUEL H ALCIVAR - EDIFICIO ONYX PISO 3","tel":"","correo":""},{"ruc":"1792049504001","razon":"SHEMLON S.A.","dir":"COREA N°126 Y AVE. AMAZONAS, EDIF. BELMONTE PISO7","tel":"23955400","correo":"facturas.electronicas@kfc.com.ec, felipe.quinto@kfc.com.ec"},{"ruc":"1793207908001","razon":"SHIATSUCORP S.A.S.","dir":"JOSE MARIA BOTADANO N57-79 Y MARIA BUSTAMANTE","tel":"022406550","correo":"facturas@shiatsucorp.com"},{"ruc":"0920320892001","razon":"SIMBAÑA QUIROZ DORIS ADRIANA","dir":"CERRO SAN EDUARDO M630 SL6","tel":"","correo":""},{"ruc":"0920320892001","razon":"SIMBAÑA QUIROZ DORIS ADRIANA","dir":"CERRO SAN EDUARDO M630 SL6","tel":"","correo":""},{"ruc":"0992683813001","razon":"SOCIABOSS S.A.","dir":"AV. CARLOS JULIO AROSEMENA KM 2.5 S/N - GUAYAQUIL","tel":"042221418","correo":"contabilidad@lemaler.com"},{"ruc":"1792210666001","razon":"SOCIEDAD DE HECHO SAMBAC","dir":"KM 0,2 C.C. BUENA VISTA PLAZA LOCAL 8-9-10 VIA SAMBORONDON","tel":"042838650","correo":"contabilidadurdesmar@gmail.com, camiloandrade1291@hotmail.com"},{"ruc":"0190370585001","razon":"SOCIEDAD ELECTRONICA S.A. SOCELEC","dir":"VIA DURAN BOLICHE KM 5 1/2","tel":"","correo":"asistente.contable@ecuartefactos.com, contador@ecuartefactos.com, jefe.importaciones@socelec.com.ec"},{"ruc":"1792420482001","razon":"SOLAR EAR ECUADOR SOLEARECUADOR CIA. LTDA.","dir":"VOZ ANDES Y AV. AMERICA EDIF ANDARA","tel":"023317088","correo":"pamela.borja@obi.ec"},{"ruc":"0953657509001","razon":"SOLIS MINA KAREN ZULAY","dir":"CAPITAN NAJERA 2802 Y PASAJE ANDRES MARIN","tel":"","correo":""},{"ruc":"0905824801001","razon":"SOLORZANO CEVALLOS NEBARDO RAFAEL","dir":"VENEZUELA 2605 Y LIZARDO GARCIA","tel":"","correo":""},{"ruc":"0922155981001","razon":"SOTOMAYOR BUSTAMANTE HARRYNSON ENMANUEL","dir":"CDLA ATARAZANA AV DEMOCRACIA Y SUFRAGIO","tel":"0980295611","correo":"ccolumnato@gmail.com"},{"ruc":"0928286848001","razon":"STEVEN BARRERA RODRIGUEZ","dir":"PORTETE #3030 Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0992295155001","razon":"STYLEX S.A.","dir":"CDLA. LOS ALMENDROS MZ. B VILLA 11","tel":"6000716","correo":""},{"ruc":"0992295155001","razon":"STYLEX S.A.","dir":"CDLA. LOS ALMENDROS MZ. B VILLA 11","tel":"6000716","correo":""},{"ruc":"0906309661001","razon":"SUAREZ CUELLO PEDRO GUILLERMO","dir":"LA 17AVA E/LETAMENDI Y SAN MARTIN","tel":"0993761287","correo":""},{"ruc":"0931168751001","razon":"SUAREZ CUEVA JORGE EDUARDO","dir":"LA A E/LA 9NA Y LA 10MA","tel":"0988423336","correo":""},{"ruc":"0932213341001","razon":"SUAREZ LAINEZ PEDRO LUIS","dir":"PORTETE 3020 E/GALLEGOS LARA Y LEONIDAS PLAZA","tel":"0999371242","correo":""},{"ruc":"0916545957001","razon":"SUAREZ RUIZ DANILO MAURICIO","dir":"URDESA CENTRAL","tel":"0991823472","correo":"dsuarez@vapeclub.ec"},{"ruc":"0911335032001","razon":"SUCONOTHA ALVARADO MONICA HERMINIA","dir":"BASTION POPULAR BLOQUE 11","tel":"0993485161","correo":""},{"ruc":"0993344036001","razon":"SUMSERVIFLEX S.A.","dir":"GUAYAQUIL","tel":"0986810079","correo":""},{"ruc":"0905389715001","razon":"SUSANA ROMERO GUEVARA","dir":"MAPASINGUE ESTE CALLE 8VA #107 Y AV PRIMERA","tel":"042003808","correo":"maquinaria_macon@hotmail.com"},{"ruc":"1792256267001","razon":"SUSHICORP S.A.S.","dir":"AV INTEROCEANICA S/N Y Y FRANCISCO DE ORELLANA ESQ","tel":"24011700","correo":"darwin.garcia@sushicorp.ec, leslie.tacuri@sushicorp.ec, douglas.casa@kobesushi.com.ec"},{"ruc":"0950575027001","razon":"TADAY GUASHPA DINA MARISOL","dir":"PORTETE E/GALLEGOS LARA Y LEONIDAS PLAZA","tel":"","correo":""},{"ruc":"0904524451001","razon":"TAPIA VERDESOTO MARIA DE LOURDES","dir":"COLOMBIA 2923 Y NICOLAS SEGOVIA - CALLE 8AVA.","tel":"","correo":""},{"ruc":"0190469271001","razon":"TAPROOM S.A.","dir":"OCTAVIO CHACON 3-09 Y 2DA TRANSVERSAL","tel":"072800068","correo":""},{"ruc":"0602247470001","razon":"TARCO TARCO MANUEL ROSALINO","dir":"4 DE NOVIEMBRE #2249 Y LA 11AVA","tel":"0982042936","correo":""},{"ruc":"0190061884001","razon":"TECNICENTRO DEL AUSTRO S.A.TEDASA","dir":"PANAMERICANA NORTE S/N Y AV. DE LAS AMÉRICAS","tel":"","correo":"kteran@tedasa.com"},{"ruc":"0991241027001","razon":"TECNOLOGIA Y SISTEMAS INDUSTRIALES CONTRA INCENDIO TECSIND CIA. LTDA.","dir":"AV. FRANCISCO DE ORELLANA SOLAR 1","tel":"","correo":"contabilidad@tecsindecuador.com"},{"ruc":"1310370844001","razon":"TEJENA MACIAS MIGUEL ANGEL","dir":"25 AVA E/LA D Y LA E","tel":"","correo":""},{"ruc":"1201969902001","razon":"THALIA ROBAYO","dir":"LIZARDO GARCIA #1089 Y FRANCISCO SEGURA","tel":"","correo":""},{"ruc":"0990017514001","razon":"TIENDAS INDUSTRIALES ASOCIADAS TIA S. A.","dir":"CHIMBORAZO 217 Y LUQUE","tel":"(04)2598830","correo":"ivette.imbaquingo@tia.com.ec"},{"ruc":"0601216575001","razon":"TIERRA CARRASCO LUIS GERARDO","dir":"CHILE Y OLMEDO","tel":"","correo":"josue_91@outlook.com"},{"ruc":"0602927394001","razon":"TIERRA VILEMA JORGE ENRIQUE","dir":"CHILE #1007 Y OLMEDO","tel":"","correo":""},{"ruc":"0918358623001","razon":"TIGRERO PANCHANA ANTHONY MICHEL","dir":"CDLA LOS ALAMOS MZ0112 SL13","tel":"099509855","correo":""},{"ruc":"0912099983001","razon":"TIGUA RIVERA WALTER RAUL","dir":"PORTETE Y LA 26","tel":"","correo":""},{"ruc":"0927865444001","razon":"TORO VILLAFUERTE MAURICIO LEONARDO","dir":"VENEZUELA 2906 Y GUERRERO VALENZUELA","tel":"","correo":""},{"ruc":"0918290156001","razon":"TORRES FIERRO MAYRA PAOLA","dir":"PEDRO MONCAYO 1224 Y CLEMENTE BALLEN","tel":"0992259269","correo":""},{"ruc":"0905698155001","razon":"TORRES LOPEZ PIEDAD ROCIO","dir":"CLDA URBASUR","tel":"0999678881","correo":""},{"ruc":"0914381819001","razon":"TORRES VACA FRANCISCO ANTONIO","dir":"CALICUCHIMA 1507 Y JOSE DE ANTEPARA","tel":"","correo":""},{"ruc":"0993366752001","razon":"TORTAMANIA S.A.S","dir":"COOPERATIVA GALLEGOS LARA MZT2 SL16","tel":"","correo":"contabilidad@tortamaniaecuador.com"},{"ruc":"0909612053001","razon":"TOVAR REINA MARIA CRUZ","dir":"AV. DEL PERIODISTA #200 Y FRANCISCO DE ICAZA BUSTAMANTE","tel":"222378","correo":"orozcotobarandrea@gmail.com"},{"ruc":"0992879580001","razon":"TRANSPORTE DE CARGA PESADA EVOLUCARG S.A.","dir":"CUSUBAMBA 484 Y AV. MALDONADO","tel":"","correo":"mespinoza@congasca.com"},{"ruc":"1759674862001","razon":"TREJO GODOY MARYERY ALEXANDRA","dir":"VENEZUELA #3009 E/LEONIDAS PLAZA Y GALLEGOS LARA","tel":"","correo":"maryerymarcelo@gmail.com"},{"ruc":"0923145866001","razon":"TRONCOSO MOREIRA MARICELA LISBETH","dir":"PORTETE Y LA 8VA","tel":"","correo":""},{"ruc":"1205837162001","razon":"TROYA ALBAN GABRIEL JONAS","dir":"SECTOR LA SIRIA 1 1 Y LAS JUNTAS","tel":"","correo":""},{"ruc":"0905024287001","razon":"TRUJILLO BRITO FRANKLIN MAURICE","dir":"MEDARDO ANGEL SILVA #916 Y LEONIDAS PLAZA","tel":"","correo":"fmgy@hotmail.com"},{"ruc":"0922529888001","razon":"TRUJILLO GUERRERO FRANKLIN JORGE","dir":"AV FCO DE ORELLANA","tel":"0993087608","correo":"ventas@extintores.ec"},{"ruc":"1793195330001","razon":"TSS NU S.A.S.","dir":"CALLE: LA NIÑA INTERSECCION: AV AMAZONAS EDIFICIO: EDIFICIO PRADERA NUMERO DE PISO: E4-43","tel":"0960444142","correo":"facturacion@nuarquitectura.com"},{"ruc":"0908258825001","razon":"TUMBACO FRANCO MARIANO ORLANDO","dir":"GUERRERO MARTINEZ 2002 Y ARGENTINA - GENERAL GOMEZ","tel":"0989025010","correo":""},{"ruc":"0908340573001","razon":"UBILLUS ESPINOZA ELSA SORAYA","dir":"LETAMENDI Y LA 16AVA","tel":"","correo":""},{"ruc":"0992255668001","razon":"UNIDAD EDUCATIVA PARTICULAR SAN LUIS REY DE FRANCIA","dir":"ARGENTINA #4119 E/SALINAS(18AVA.) Y SAMBORONDON (19AVA.), GUAYAQUIL","tel":"042478640","correo":"colecturia@sanluisreydefrancia.com.ec"},{"ruc":"1792730635001","razon":"URDESMAR RESTAURANTES CIA. LTDA.","dir":"MIGUEL H. ALCIVAR, KENNEDY NORTE","tel":"","correo":"contabilidadurdesmar@gmail.com"},{"ruc":"1716779895001","razon":"URGILEZ COBO ELSA AMERICA","dir":"PEDRO PABLO GOMEZ #2117 Y GALLEGOS LARA","tel":"0989778107","correo":"sarachila06@gmail.com"},{"ruc":"0905910360001","razon":"VALENCIA MONAR VICENTE ALFREDO","dir":"GALLEGOS LARA 2649 Y EL ORO","tel":"3869877","correo":""},{"ruc":"0912063955001","razon":"VALVERDE ESTRADA MARJORIE LORENA","dir":"CDLA BASE NAVAL NORTE","tel":"0969085449","correo":""},{"ruc":"0909473225001","razon":"VALVERDE MITE FRANKLIN GERARDO","dir":"14VA S/N Y 1ER CLLJN Y SEDALANA","tel":"","correo":""},{"ruc":"1307404051001","razon":"VANONI MERELO ESTHER YOLANDA","dir":"PORTETE #3307 E/LA 7MA Y LA 8VA","tel":"0978795227","correo":""},{"ruc":"1793206131001","razon":"VAPEX S.A.S.","dir":"QUITO - TUMBACO","tel":"","correo":"vapexsas@gmail.com"},{"ruc":"0925121485001","razon":"VARGAS CAMINOS IVAN FERNANDO","dir":"CDLA. SIMON BOLIVAR MZ5 SOLAR88","tel":"","correo":"ivan_777_48@hotmail.com"},{"ruc":"0925121485001","razon":"VARGAS CAMINOS IVAN FERNANDO","dir":"CDLA. SIMON BOLIVAR MZ5 SOLAR88","tel":"","correo":"ivan_777_48@hotmail.com"},{"ruc":"0992881968001","razon":"VARGASLAND CIA. LTDA.","dir":"HUANCAVILCA 310 Y CHILE","tel":"","correo":""},{"ruc":"0908853674001","razon":"VASCONEZ SIERRA LUIS AUGUSTO","dir":"PEDRO PABLO GOMEZ #516 Y AV MACHAL","tel":"","correo":""},{"ruc":"0907921118001","razon":"VASQUEZ VILLENA MARCOS VINICIO","dir":"CARCHI #3410 Y CAMILO DESTRUJE","tel":"0994878943","correo":"marcosvasquezvillena@yahoo.com"},{"ruc":"0904570330001","razon":"VELASTEGUI PAREDES NORMA","dir":"SEDALANA #116 Y LA 14AVA","tel":"","correo":""},{"ruc":"0906178652001","razon":"VELEZ ALEJANDRO JOSE ANDRES","dir":"LA 25AVA #613 E/ LA 18 Y LA 19","tel":"0991123009","correo":""},{"ruc":"0921377875001","razon":"VELEZ MACIAS JICCY JEOCONDA","dir":"VENEZUELA 1217 Y GUERRERO VALENZUELA","tel":"0989882561","correo":""},{"ruc":"0919602706001","razon":"VELEZ PONCE JESSICA JAZMIN","dir":"ACUARELA DEL RIO MZ1163 CASA26","tel":"0989150933","correo":"drajazminvelezp14@gmail.com"},{"ruc":"1203966013001","razon":"VELIZ LLAGUNO BAYRON BERON","dir":"PORTETE 2124 Y LOS RIOS","tel":"","correo":"velizllagunobyronberon@gmail.com"},{"ruc":"0955394697001","razon":"VELOZ VELASCO RUBEN DARIO","dir":"LA 13AVA Y PORTETE SOLAR 6","tel":"0986044019","correo":""},{"ruc":"0952264752001","razon":"VERA BAJAÑA VICTOR JAVIER","dir":"PORTETE E/LA 26AVA Y LA 27AVA","tel":"0939548573","correo":"Vv4675232@gmail.com"},{"ruc":"0927814426001","razon":"VERA CARDENAS FRANK CARLOS","dir":"LA 21 Y COLOMBIA","tel":"0987875666","correo":""},{"ruc":"0910700434001","razon":"VERA RAMIREZ JORGE JOSE","dir":"4 DE NOVIEMBRE Y LA 16AVA","tel":"2331063","correo":""},{"ruc":"0301208773001","razon":"VERGARA RIVERA JORGE ALBERTO","dir":"FEBRES CORDERO 3304 E/LA 10MA Y LA 11AVA","tel":"","correo":""},{"ruc":"0917365140001","razon":"VILLAMAR RUIZ LUIS KENNY","dir":"PASEO SHOPPING DURAN TAMBO","tel":"0997785797","correo":""},{"ruc":"0921674354001","razon":"VILLARREAL TRIVIÑO IVAN GEOVANNY","dir":"ARGENTINA #4305 E/LA 20 Y LA 21","tel":"0978886504","correo":""},{"ruc":"0931668479001","razon":"VIÑANSACA MOSQUERA MARIA CAROLINA","dir":"PORTETE #3301 Y LA 7MA","tel":"","correo":""},{"ruc":"0926071879001","razon":"VIVAR HERRERA DANIELA RAQUEL","dir":"MUCHO LOTE 2, MZ 2943, VILLA 6","tel":"0958915884","correo":""},{"ruc":"0909196727001","razon":"VIZUETA GARCIA NESTOR FRANKLIN","dir":"GOMEZ RENDON 5004 E/LA 27AVA YLA 28AVA","tel":"","correo":""},{"ruc":"0911328037001","razon":"YAGUAL AGUIRRE ANA MARIA","dir":"AV. PEDRO MENEDEZ S/N Y PABLO MAZZINI","tel":"0991493917","correo":""},{"ruc":"0919862474001","razon":"YAGUAL CASTELLANOS LILIAM YOLANDA","dir":"ISLA TRINITARIA","tel":"","correo":"lilianyoli@hotmail.com"},{"ruc":"0911691145001","razon":"YAGUAL PLUAS ISABEL MERCEDES","dir":"LA 23AVA Y LA P","tel":"0995201272","correo":""},{"ruc":"0908397003001","razon":"YANEZ BUSTAMANTE JULIO ALBERTO","dir":"CLDA SOPEÑA","tel":"","correo":""},{"ruc":"1310826134001","razon":"YISSELA PARRAGA PARRAGA","dir":"VENEZUELA #3500A Y LA 9NA","tel":"","correo":"yissel26@live.com"},{"ruc":"1310826134001","razon":"YISSELA PARRAGA PARRAGA","dir":"VENEZUELA #3500A Y LA 9NA","tel":"","correo":"yissel26@live.com"},{"ruc":"0993405221001","razon":"YOIPURA S.A.S.","dir":"ENTRE RIOS","tel":"0979751069","correo":""},{"ruc":"0602282477001","razon":"YUPANQUI YUQUILEMA HUMBERTO","dir":"BOLIVIA #3023 Y CALLEJON OCTAVA","tel":"0985134182","correo":""},{"ruc":"1726174558001","razon":"ZAMBRANO LOOR VALENTINA MARGARITA","dir":"AV 6 DE DICIEMBRE H59-161 Y STA LUCIA EDIF MABEL","tel":"","correo":"rrhhcorpmunab@gmail.com"},{"ruc":"0926000423001","razon":"ZAMBRANO MERCHAN ANDY RAFAEL","dir":"KM 12.5 VIA A MA COSTA C.C. LAGUNA PLAZA","tel":"0981759758","correo":""},{"ruc":"0501388169001","razon":"ZAMBRANO NETO EZEQUIEL LUCIANO","dir":"FRANCISCO ALBORNOZ N8-149 Y LEONIDAS PUEBLA","tel":"","correo":"zambrano.l@hotmail.com"},{"ruc":"0933100919001","razon":"ZAMBRANO SUAREZ JOHN JAIRO","dir":"GOMEZ RENDON Y CALLE 17AVA","tel":"0998603146","correo":""},{"ruc":"0993384517001","razon":"ZAMBRANO SUAREZ JOHN JAIRO","dir":"GOMEZ RENDON Y LA 17AVA","tel":"","correo":""},{"ruc":"1307649424001","razon":"ZAMBRANO VELEZ MARIA AUXILIADORA","dir":"TUNGURAHUA 508 Y AV. 9 OCTUBRE","tel":"","correo":""},{"ruc":"0930662226001","razon":"ZAMORA BRICEÑO WILFREDO DANIEL","dir":"LOS RIOS BABAHOYO KM 1.5","tel":"0979751069","correo":""},{"ruc":"0905801080001","razon":"ZHINGRI ORTEGA NANCY MIROPE","dir":"GUASMO SUR","tel":"","correo":""},{"ruc":"0909617805001","razon":"ZULETA CASACOMBA SANDRA MARISOL","dir":"GALLEGOS LARA 2420 E/COLOMBIA Y CAMILO DESTRUJE","tel":"042361889","correo":""},{"ruc":"0909097230001","razon":"ZULOAGA JORDAN BETTY JANET","dir":"COLON #1503 Y LA 11AVA","tel":"0988126822","correo":""},{"ruc":"0993322229001","razon":"ZUNTI ENTERPRISE S.A.","dir":"SANTA LEONOR MZ14 V15","tel":"","correo":""},{"ruc":"0914439609001","razon":"ZURITA YONG HECTOR RENATO","dir":"CDLA. FUENTE DEL RIO","tel":"0984979573","correo":""}];

// ── ESTADO GLOBAL ────────────────────────────────────────────
var PF_PROF_ITEMS     = [];   // ítems de la proforma en edición
var PF_PROF_CLIENTE   = null; // cliente seleccionado
var PF_PROF_TIPO      = "dist"; // dist | cli
var PF_PROF_EDITANDO  = null; // id de proforma en edición (null = nueva)
var PF_IVA_PROF       = 0.15;

// ── NUMERACIÓN ───────────────────────────────────────────────
function pfProformaNumero() {
  var n = parseInt(localStorage.getItem("pf_prof_count") || "7999") + 1;
  localStorage.setItem("pf_prof_count", String(n));
  return n;
}
function pfProformaNumFmt(n) {
  return "001-002-" + String(n).padStart(7, "0");
}

// ── STORAGE ──────────────────────────────────────────────────
var PF_PROF_KEY = "pf_proformas";
function pfGetProformas() {
  try { return JSON.parse(localStorage.getItem(PF_PROF_KEY) || "[]"); } catch(e) { return []; }
}
function pfSaveProformas(arr) {
  try { localStorage.setItem(PF_PROF_KEY, JSON.stringify(arr)); } catch(e) {
    if (e.name === "QuotaExceededError") pfModal("⚠️ Almacenamiento lleno. Haz un backup desde Perfil.");
  }
}

// ── ESTADOS ──────────────────────────────────────────────────
var PF_PROF_ESTADOS = {
  pendiente:     { label: "Pendiente",           color: "var(--n)",  bg: "var(--nc)", ico: "⏳" },
  autorizada:    { label: "Autorizada",           color: "var(--a)",  bg: "var(--ac)", ico: "✅" },
  pend_factura:  { label: "Pend. Facturación",    color: "#1A5FAA",   bg: "#EAF2FF",   ico: "📄" },
  facturada:     { label: "Factura Procesada",    color: "var(--v)",  bg: "var(--vc)", ico: "🧾" },
  finalizada:    { label: "Finalizada",           color: "var(--g3)", bg: "var(--g1)", ico: "🏁" }
};

// ════════════════════════════════════════════════════════════
//  TAB PRINCIPAL — INYECTAR EN ADMIN
// ════════════════════════════════════════════════════════════
function pfInyectarProformas() {
  var tabBar = document.querySelector(".adm-tab");
  var admScr = document.getElementById("sadmin");
  if (!tabBar || !admScr) return;

  if (!document.getElementById("adm-t15")) {
    var btn = document.createElement("button");
    btn.id = "adm-t15"; btn.className = "adm-tab-btn";
    btn.textContent = "📋 Proformas";
    btn.onclick = function(){ admTab(15); };
    tabBar.appendChild(btn);
  }
  if (!document.getElementById("adm-p15")) {
    var panel = document.createElement("div");
    panel.id = "adm-p15"; panel.className = "adm-panel";
    panel.innerHTML = '<div id="pf-prof-contenido"><div style="padding:40px 16px;text-align:center;color:var(--g3)">Cargando proformas...</div></div>';
    admScr.appendChild(panel);
  }
  if (window.PF_TAB_HANDLERS) window.PF_TAB_HANDLERS[15] = function(){ pfRenderTabProformas(); };
}

// ════════════════════════════════════════════════════════════
//  RENDER TAB PRINCIPAL — KANBAN DE ESTADOS
// ════════════════════════════════════════════════════════════
function pfRenderTabProformas() {
  var el = document.getElementById("pf-prof-contenido");
  if (!el) return;

  var proformas = pfGetProformas();
  var filtro    = window._pfProfFiltro || "todas";

  // Contadores por estado
  var contadores = { pendiente:0, autorizada:0, pend_factura:0, facturada:0, finalizada:0 };
  proformas.forEach(function(p){ if (contadores[p.estado] !== undefined) contadores[p.estado]++; });

  var h = '';
  // Header
  h += '<div style="padding:12px 12px 0">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
  h += '<div style="font-size:16px;font-weight:700">Proformas Pyroshield</div>';
  h += '<button onclick="pfAbrirNuevaProforma()" style="padding:8px 16px;border-radius:10px;border:none;background:var(--r);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">+ Nueva</button>';
  h += '</div>';

  // Filtros por estado
  h += '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch">';
  var filtros = [
    {id:"todas",      label:"Todas",             cnt: proformas.length},
    {id:"pendiente",  label:"⏳ Pendiente",       cnt: contadores.pendiente},
    {id:"autorizada", label:"✅ Autorizada",      cnt: contadores.autorizada},
    {id:"pend_factura",label:"📄 Pend. Fact.",    cnt: contadores.pend_factura},
    {id:"facturada",  label:"🧾 Facturada",       cnt: contadores.facturada},
    {id:"finalizada", label:"🏁 Finalizada",      cnt: contadores.finalizada},
  ];
  filtros.forEach(function(f){
    var activo = filtro === f.id;
    h += '<button onclick="window._pfProfFiltro=\''+f.id+'\';pfRenderTabProformas()" ';
    h += 'style="flex-shrink:0;padding:6px 12px;border-radius:20px;border:1.5px solid '+(activo?'var(--r)':'var(--bo)')+';';
    h += 'background:'+(activo?'var(--r)':'#fff')+';color:'+(activo?'#fff':'var(--g4)')+';';
    h += 'font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">';
    h += f.label + (f.cnt > 0 ? ' ('+f.cnt+')' : '') + '</button>';
  });
  h += '</div></div>';

  // Lista de proformas
  var lista = filtro === "todas" ? proformas : proformas.filter(function(p){ return p.estado === filtro; });
  lista = lista.slice().reverse(); // más recientes primero

  if (lista.length === 0) {
    h += '<div style="padding:40px 16px;text-align:center;color:var(--g3);font-size:14px">';
    h += filtro === "todas" ? 'No hay proformas aún.<br><br><button onclick="pfAbrirNuevaProforma()" style="padding:10px 20px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">+ Crear primera proforma</button>' : "No hay proformas en este estado.";
    h += '</div>';
  } else {
    h += '<div style="padding:0 12px 80px">';
    lista.forEach(function(prof) {
      h += pfRenderTarjetaProforma(prof);
    });
    h += '</div>';
  }

  el.innerHTML = h;
}

function pfRenderTarjetaProforma(prof) {
  var est   = PF_PROF_ESTADOS[prof.estado] || PF_PROF_ESTADOS.pendiente;
  var total = pfCalcTotalProforma(prof.items);
  var h = '';

  h += '<div style="background:#fff;border-radius:16px;border:1.5px solid var(--bo);margin-bottom:10px;overflow:hidden">';

  // Header tarjeta
  h += '<div style="padding:12px 14px;border-bottom:1px solid var(--bo);display:flex;justify-content:space-between;align-items:center">';
  h += '<div style="flex:1;min-width:0">';
  h += '<div style="font-size:12px;color:var(--g3);font-weight:600;margin-bottom:2px">'+prof.num+'</div>';
  h += '<div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(prof.cliente.razon||prof.cliente.nombre||"—")+'</div>';
  h += '<div style="font-size:11px;color:var(--g3);margin-top:2px">'+prof.fecha+' · '+(prof.items?prof.items.length:0)+' ítem(s)</div>';
  h += '</div>';
  h += '<div style="text-align:right;flex-shrink:0;margin-left:10px">';
  h += '<div style="font-size:16px;font-weight:700;color:var(--r)">$'+total.total.toFixed(2)+'</div>';
  h += '<div style="display:inline-block;padding:3px 8px;border-radius:20px;background:'+est.bg+';color:'+est.color+';font-size:10px;font-weight:700;margin-top:3px">'+est.ico+' '+est.label+'</div>';
  h += '</div></div>';

  // Acciones según estado
  h += '<div style="padding:10px 14px;display:flex;gap:8px;flex-wrap:wrap">';

  h += '<button onclick="pfVerProforma(\''+prof.id+'\',true)" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;min-width:80px">👁 Ver</button>';

  if (prof.estado === "pendiente") {
    h += '<button onclick="pfAutorizarProforma(\''+prof.id+'\',true)" style="flex:2;padding:8px;border-radius:10px;border:none;background:var(--ac);color:var(--a);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">✅ Cliente autorizó</button>';
    h += '<button onclick="pfEditarProforma(\''+prof.id+'\')" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;min-width:80px">✏️ Editar</button>';
  }
  if (prof.estado === "autorizada") {
    h += '<button onclick="pfAsignarARecorrido(\''+prof.id+'\',true)" style="flex:2;padding:8px;border-radius:10px;border:none;background:var(--r);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">📍 Agregar al recorrido</button>';
    h += '<button onclick="pfConvertirAFactura(\''+prof.id+'\',true)" style="flex:2;padding:8px;border-radius:10px;border:none;background:#1A5FAA;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">🧾 Emitir factura</button>';
  }
  if (prof.estado === "pend_factura") {
    h += '<button onclick="pfConvertirAFactura(\''+prof.id+'\',true)" style="flex:2;padding:8px;border-radius:10px;border:none;background:#1A5FAA;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">🧾 Emitir factura electrónica</button>';
  }
  if (prof.estado === "facturada") {
    h += '<button onclick="pfFinalizarProforma(\''+prof.id+'\',true)" style="flex:2;padding:8px;border-radius:10px;border:none;background:var(--v);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">🏁 Dar por finalizada</button>';
  }

  h += '<button onclick="pfEliminarProforma(\''+prof.id+'\',true)" style="padding:8px 10px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:12px;cursor:pointer;color:var(--r)">🗑</button>';
  h += '</div></div>';
  return h;
}

// ════════════════════════════════════════════════════════════
//  NUEVA PROFORMA — FORMULARIO
// ════════════════════════════════════════════════════════════
function pfAbrirNuevaProforma(tipo) {
  PF_PROF_ITEMS    = [];
  PF_PROF_CLIENTE  = null;
  PF_PROF_TIPO     = tipo || "dist";
  PF_PROF_EDITANDO = null;
  pfRenderFormProforma();
}

function pfEditarProforma(id) {
  var prof = pfGetProformas().find(function(p){ return p.id === id; });
  if (!prof) return;
  PF_PROF_ITEMS    = JSON.parse(JSON.stringify(prof.items || []));
  PF_PROF_CLIENTE  = JSON.parse(JSON.stringify(prof.cliente || {}));
  PF_PROF_TIPO     = prof.tipo || "dist";
  PF_PROF_EDITANDO = id;
  pfRenderFormProforma();
}

function pfRenderFormProforma() {
  var el = document.getElementById("pf-prof-contenido");
  if (!el) return;

  var h = '';
  h += '<div style="padding:12px">';

  // Header
  h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h += '<button onclick="pfRenderTabProformas()" style="padding:6px 12px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">‹ Volver</button>';
  h += '<div style="font-size:16px;font-weight:700">'+(PF_PROF_EDITANDO ? "Editar Proforma" : "Nueva Proforma")+'</div>';
  h += '</div>';

  // Selector tipo (Distribuidor / Cliente) — Cliente placeholder
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">';
  h += '<button id="prof-tipo-dist" onclick="PF_PROF_TIPO=\'dist\';pfActualizarTipoProforma()" ';
  h += 'style="padding:10px;border-radius:12px;border:2px solid '+(PF_PROF_TIPO==="dist"?"var(--r)":"var(--bo)")+';background:'+(PF_PROF_TIPO==="dist"?"var(--rc)":"#fff")+';font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;color:'+(PF_PROF_TIPO==="dist"?"var(--r)":"var(--g4)")+'">🏢 Distribuidor</button>';
  h += '<button id="prof-tipo-cli" onclick="pfModal(\'Proforma para clientes finales próximamente.\');" ';
  h += 'style="padding:10px;border-radius:12px;border:2px solid var(--bo);background:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;color:var(--g3);opacity:0.6">👤 Cliente (pronto)</button>';
  h += '</div>';

  // Buscador de cliente
  h += '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Cliente</div>';

  var cliSelName = PF_PROF_CLIENTE ? (PF_PROF_CLIENTE.razon || PF_PROF_CLIENTE.nombre) : "";
  h += '<div id="prof-cli-wrap">';
  if (PF_PROF_CLIENTE) {
    h += '<div style="background:var(--ac);border:1.5px solid var(--a);border-radius:12px;padding:10px 14px;margin-bottom:8px">';
    h += '<div style="font-size:13px;font-weight:700;color:var(--a)">'+(PF_PROF_CLIENTE.razon||"—")+'</div>';
    h += '<div style="font-size:11px;color:var(--g4);margin-top:2px">RUC: '+(PF_PROF_CLIENTE.ruc||"—")+' · '+(PF_PROF_CLIENTE.dir||"").substring(0,40)+'</div>';
    h += '<button onclick="PF_PROF_CLIENTE=null;pfRenderFormProforma()" style="margin-top:6px;padding:4px 10px;border-radius:8px;border:none;background:var(--r);color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">Cambiar cliente</button>';
    h += '</div>';
  } else {
    h += '<input id="prof-cli-search" type="text" placeholder="Buscar por nombre o RUC..." oninput="pfBuscarClienteDist(this.value)" ';
    h += 'style="width:100%;padding:10px 12px;border:1.5px solid var(--bo);border-radius:12px;font-family:inherit;font-size:14px;margin-bottom:6px">';
    h += '<div id="prof-cli-results" style="max-height:200px;overflow-y:auto;background:#fff;border-radius:12px;border:1.5px solid var(--bo);display:none"></div>';
    h += '<div style="margin-top:6px;font-size:11px;color:var(--g3)">¿No aparece? <button onclick="pfAgregarClienteDistTemp()" style="background:none;border:none;color:var(--a);font-weight:700;cursor:pointer;font-size:11px;font-family:inherit">+ Agregar manualmente</button></div>';
  }
  h += '</div>';

  // ── TABLA DE ÍTEMS ──
  h += '<div style="font-size:11px;font-weight:700;color:var(--g3);letter-spacing:1px;text-transform:uppercase;margin:14px 0 6px">Productos</div>';

  // Headers tabla
  h += '<div style="display:grid;grid-template-columns:1fr 48px 68px 68px 28px;gap:4px;padding:0 0 4px;border-bottom:1px solid var(--bo);margin-bottom:4px">';
  h += '<div style="font-size:10px;font-weight:700;color:var(--g3)">PRODUCTO</div>';
  h += '<div style="font-size:10px;font-weight:700;color:var(--g3);text-align:center">CANT.</div>';
  h += '<div style="font-size:10px;font-weight:700;color:var(--g3);text-align:right">P. UNIT.</div>';
  h += '<div style="font-size:10px;font-weight:700;color:var(--g3);text-align:right">TOTAL</div>';
  h += '<div></div>';
  h += '</div>';

  h += '<div id="prof-items-lista">';
  if (PF_PROF_ITEMS.length === 0) {
    h += '<div style="padding:12px 0;text-align:center;font-size:13px;color:var(--g3)">Sin ítems aún</div>';
  } else {
    PF_PROF_ITEMS.forEach(function(item, idx) {
      h += pfRenderItemProforma(item, idx);
    });
  }
  h += '</div>';

  // Buscador de productos
  h += '<div style="margin-top:8px;background:var(--g1);border-radius:12px;padding:10px">';
  h += '<input id="prof-prod-search" type="text" placeholder="🔍 Agregar producto..." oninput="pfBuscarProductoDist(this.value)" ';
  h += 'style="width:100%;padding:8px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:13px">';
  h += '<div id="prof-prod-results" style="max-height:220px;overflow-y:auto;margin-top:6px"></div>';
  h += '</div>';

  // Totales
  var calc = pfCalcTotalProforma(PF_PROF_ITEMS);
  h += '<div style="background:#fff;border-radius:14px;border:1.5px solid var(--bo);padding:12px 14px;margin-top:12px">';
  h += '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span style="color:var(--g4)">Precio de lista:</span><span style="font-weight:600">$'+calc.pbase.toFixed(2)+'</span></div>';
  h += '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span style="color:var(--r)">Descuento:</span><span style="font-weight:600;color:var(--r)">-$'+calc.desc.toFixed(2)+'</span></div>';
  h += '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span>Subtotal:</span><span style="font-weight:700">$'+calc.subtotal.toFixed(2)+'</span></div>';
  h += '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px"><span style="color:var(--g4)">IVA 15%:</span><span>$'+calc.iva.toFixed(2)+'</span></div>';
  h += '<div style="display:flex;justify-content:space-between;padding:6px 0 0;border-top:2px solid var(--r);margin-top:4px"><span style="font-size:16px;font-weight:700;color:var(--r)">TOTAL:</span><span style="font-size:18px;font-weight:700;color:var(--r)">$'+calc.total.toFixed(2)+'</span></div>';
  h += '</div>';

  // Campo condición de pago y validez
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">';
  h += '<div><div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:4px">CONDICIÓN DE PAGO</div>';
  h += '<input id="prof-pago" type="text" value="'+(PF_PROF_EDITANDO ? (pfGetProformas().find(function(p){return p.id===PF_PROF_EDITANDO;})||{}).pago||"CRÉDITO 30 DÍAS" : "CRÉDITO 30 DÍAS")+'" style="width:100%;padding:9px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:13px"></div>';
  h += '<div><div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:4px">VÁLIDA POR</div>';
  h += '<input id="prof-validez" type="text" value="'+(PF_PROF_EDITANDO ? (pfGetProformas().find(function(p){return p.id===PF_PROF_EDITANDO;})||{}).validez||"10 días" : "10 días")+'" style="width:100%;padding:9px 12px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:13px"></div>';
  h += '</div>';

  // Botones
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">';
  h += '<button onclick="pfGuardarProforma(false)" style="padding:14px;border-radius:14px;border:1.5px solid var(--bo);background:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;color:var(--g4)">💾 Guardar</button>';
  h += '<button onclick="pfGuardarProforma(true)" style="padding:14px;border-radius:14px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">📄 Guardar y descargar PDF</button>';
  h += '</div>';
  h += '<div style="height:80px"></div>';
  h += '</div>';

  el.innerHTML = h;
}

function pfRenderItemProforma(item, idx) {
  var sub = (item.cant * item.punit).toFixed(2);
  var agotado = item.stock === 0 ? ' style="opacity:0.6"' : '';
  var h = '';
  h += '<div id="prof-item-'+idx+'" style="display:grid;grid-template-columns:1fr 48px 68px 68px 28px;gap:4px;align-items:center;padding:6px 0;border-bottom:1px solid var(--g1)">';
  h += '<div'+agotado+'>';
  h += '<div style="font-size:12px;font-weight:700;line-height:1.3">'+(item.nombre||item.desc||item.id)+'</div>';
  h += '<div style="font-size:10px;color:var(--g3)">'+item.id+(item.stock===0?" · ⚠️ Agotado":"")+'</div>';
  h += '</div>';
  h += '<input type="number" min="1" max="9999" value="'+item.cant+'" ';
  h += 'onchange="pfActualizarCantItem('+idx+',this.value)" ';
  h += 'style="width:100%;padding:6px 4px;border:1.5px solid var(--bo);border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;text-align:center">';
  h += '<div style="text-align:right">';
  h += '<div style="font-size:11px;color:var(--g3);text-decoration:line-through">$'+item.pbase.toFixed(2)+'</div>';
  h += '<div style="font-size:13px;font-weight:700;color:var(--v)">$'+item.punit.toFixed(2)+'</div>';
  h += '</div>';
  h += '<div style="text-align:right;font-size:13px;font-weight:700">$'+sub+'</div>';
  h += '<button onclick="pfRemoverItemProforma('+idx+')" style="padding:4px;border:none;background:none;color:var(--r);cursor:pointer;font-size:16px">×</button>';
  h += '</div>';
  return h;
}

// ── BÚSQUEDA DE CLIENTES ─────────────────────────────────────
function pfBuscarClienteDist(q) {
  var res = document.getElementById("prof-cli-results");
  if (!res) return;
  if (!q || q.length < 2) { res.style.display = "none"; return; }
  var q2 = q.toLowerCase().trim();
  // #AUDIO FIX: buscar por cualquier palabra del nombre
  var palabras = q2.split(/\s+/).filter(function(p){ return p.length >= 2; });
  var matches = PF_CLIENTES_DIST.filter(function(c){
    var razon = (c.razon||"").toLowerCase();
    var ruc   = (c.ruc||"");
    if (ruc.indexOf(q) !== -1) return true;
    if (razon.indexOf(q2) !== -1) return true;
    // Buscar por palabras individuales
    return palabras.length > 0 && palabras.every(function(p){ return razon.indexOf(p) !== -1; });
  }).slice(0, 10);
  if (!matches.length) { res.innerHTML = '<div style="padding:10px;font-size:13px;color:var(--g3)">No encontrado</div>'; res.style.display = "block"; return; }
  res.style.display = "block";
  res.innerHTML = matches.map(function(c){
    var esc = (c.razon||"").replace(/'/g,"&#39;").replace(/"/g,"&quot;");
    var ruc = (c.ruc||"").replace(/'/g,"&#39;");
    var dir = (c.dir||"").replace(/'/g,"&#39;").replace(/"/g,"&quot;");
    var cor = (c.correo||"").replace(/'/g,"&#39;");
    var tel = (c.tel||"").replace(/'/g,"&#39;");
    return '<button onclick="pfSeleccionarClienteDist(\''+esc+'\',\''+ruc+'\',\''+dir+'\',\''+cor+'\',\''+tel+'\')" '+
      'style="width:100%;padding:8px 12px;border:none;border-bottom:1px solid var(--g1);background:#fff;text-align:left;cursor:pointer;font-family:inherit">'+
      '<div style="font-size:13px;font-weight:700">'+c.razon+'</div>'+
      '<div style="font-size:11px;color:var(--g3)">'+c.ruc+' · '+(c.dir||"").substring(0,35)+'</div>'+
      '</button>';
  }).join("");
}

function pfSeleccionarClienteDist(razon, ruc, dir, correo, tel) {
  PF_PROF_CLIENTE = { razon:razon, ruc:ruc, dir:dir, correo:correo, tel:tel };
  pfRenderFormProforma();
}

function pfAgregarClienteDistTemp() {
  pfModal("Usa el botón '+ Nuevo cliente' en el tab ⚙ Config para agregar clientes temporales.");
}

// ── BÚSQUEDA DE PRODUCTOS ────────────────────────────────────
function pfBuscarProductoDist(q) {
  var res = document.getElementById("prof-prod-results");
  if (!res) return;
  if (!q || q.length < 1) { res.innerHTML = pfRenderCatalogoCompleto(); return; }
  var q2 = q.toLowerCase();
  var matches = PF_PRODUCTOS_DIST.filter(function(p){
    return (p.nombre||"").toLowerCase().indexOf(q2) !== -1 ||
           (p.id||"").toLowerCase().indexOf(q2) !== -1 ||
           (p.desc||"").toLowerCase().indexOf(q2) !== -1;
  });
  res.innerHTML = pfRenderListaProductos(matches);
}

function pfRenderCatalogoCompleto() {
  var extintores = PF_PRODUCTOS_DIST.filter(function(p){ return p.tipo === "extintor"; });
  var accesorios = PF_PRODUCTOS_DIST.filter(function(p){ return p.tipo !== "extintor"; });
  var h = '';
  h += '<div style="font-size:10px;font-weight:700;color:var(--g3);padding:4px 0;letter-spacing:1px">EXTINTORES</div>';
  h += pfRenderListaProductos(extintores);
  h += '<div style="font-size:10px;font-weight:700;color:var(--g3);padding:8px 0 4px;letter-spacing:1px">ACCESORIOS Y EQUIPOS</div>';
  h += pfRenderListaProductos(accesorios);
  return h;
}

function pfRenderListaProductos(lista) {
  return lista.map(function(p){
    var agotado = p.stock === 0;
    var yaEnLista = PF_PROF_ITEMS.some(function(i){ return i.id === p.id; });
    return '<button onclick="pfAgregarProductoProforma(\''+p.id+'\')" '+
      'style="width:100%;padding:7px 10px;border:none;border-bottom:1px solid var(--g1);background:'+(yaEnLista?"var(--ac)":"#fff")+';text-align:left;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px">'+
      '<div style="flex:1">'+
      '<div style="font-size:12px;font-weight:700;color:'+(agotado?"var(--g3)":"var(--ng)")+'">'+p.nombre+(agotado?' <span style="color:var(--r);font-size:10px">⚠️ Agotado</span>':'')+'</div>'+
      '<div style="font-size:10px;color:var(--g3)">'+p.id+' · Stock: '+p.stock+'</div>'+
      '</div>'+
      '<div style="text-align:right">'+
      '<div style="font-size:10px;color:var(--g3);text-decoration:line-through">$'+p.pbase.toFixed(2)+'</div>'+
      '<div style="font-size:13px;font-weight:700;color:var(--v)">$'+p.punit.toFixed(2)+'</div>'+
      '</div>'+
      (yaEnLista?'<div style="font-size:10px;color:var(--a);font-weight:700">✓</div>':'')+
      '</button>';
  }).join("") || '<div style="padding:8px;font-size:12px;color:var(--g3)">Sin resultados</div>';
}

function pfAgregarProductoProforma(prodId) {
  var prod = PF_PRODUCTOS_DIST.find(function(p){ return p.id === prodId; });
  if (!prod) return;
  var existe = PF_PROF_ITEMS.findIndex(function(i){ return i.id === prodId; });
  if (existe !== -1) {
    PF_PROF_ITEMS[existe].cant++;
  } else {
    PF_PROF_ITEMS.push({
      id: prod.id, nombre: prod.nombre, desc: prod.desc,
      pbase: prod.pbase, punit: prod.punit,
      cant: 1, stock: prod.stock
    });
  }
  pfActualizarListaItems();
}

function pfRemoverItemProforma(idx) {
  PF_PROF_ITEMS.splice(idx, 1);
  pfActualizarListaItems();
}

function pfActualizarCantItem(idx, val) {
  var cant = parseInt(val);
  if (!cant || cant < 1) cant = 1;
  PF_PROF_ITEMS[idx].cant = cant;
  pfActualizarTotalesProforma();
}

function pfActualizarListaItems() {
  var lista = document.getElementById("prof-items-lista");
  if (lista) {
    if (PF_PROF_ITEMS.length === 0) {
      lista.innerHTML = '<div style="padding:12px 0;text-align:center;font-size:13px;color:var(--g3)">Sin ítems aún</div>';
    } else {
      lista.innerHTML = PF_PROF_ITEMS.map(function(item, idx){ return pfRenderItemProforma(item, idx); }).join("");
    }
  }
  pfActualizarTotalesProforma();
  // Refrescar resultados de búsqueda
  var srch = document.getElementById("prof-prod-search");
  if (srch) pfBuscarProductoDist(srch.value);
}

function pfActualizarTotalesProforma() {
  var calc = pfCalcTotalProforma(PF_PROF_ITEMS);
  var actualizar = function(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  // Buscar divs de totales y actualizarlos (si están en el DOM)
  pfRenderTotalesInline(calc);
}

function pfRenderTotalesInline(calc) {
  // #AUDIO FIX: actualizar totales en tiempo real sin re-render completo
  var ids = {
    "prof-res-pbase":    "$" + calc.pbase.toFixed(2),
    "prof-res-desc":     "-$" + calc.desc.toFixed(2),
    "prof-res-subtotal": "$" + calc.subtotal.toFixed(2),
    "prof-res-iva":      "$" + calc.iva.toFixed(2),
    "prof-res-total":    "$" + calc.total.toFixed(2)
  };
  Object.keys(ids).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = ids[id];
  });
  // Si no existen los elementos, inyectar el bloque de totales
  if (!document.getElementById("prof-res-total")) {
    var contenedor = document.getElementById("prof-totales-wrap");
    if (contenedor) {
      contenedor.innerHTML = pfRenderTotalesHTML(calc);
    }
  }
}

function pfRenderTotalesHTML(calc) {
  var rows = [
    ["Precio de lista:", "$" + calc.pbase.toFixed(2), "prof-res-pbase"],
    ["Descuento:", "-$" + calc.desc.toFixed(2), "prof-res-desc"],
    ["Subtotal:", "$" + calc.subtotal.toFixed(2), "prof-res-subtotal"],
    ["IVA " + (PF_IVA_PROF*100).toFixed(0) + "%:", "$" + calc.iva.toFixed(2), "prof-res-iva"],
    ["TOTAL:", "$" + calc.total.toFixed(2), "prof-res-total"]
  ];
  var h = '<div style="background:#fff;border-radius:12px;border:1.5px solid var(--bo);padding:12px 14px;margin:0 12px 12px">';
  rows.forEach(function(r, i) {
    var bold = i === rows.length - 1;
    h += '<div style="display:flex;justify-content:space-between;padding:4px 0;'+(i>0?'border-top:1px solid var(--g1)':'')+'">';
    h += '<span style="font-size:13px;color:var(--g4)">'+r[0]+'</span>';
    h += '<span id="'+r[2]+'" style="font-size:13px;font-weight:'+(bold?'700':'600')+';color:'+(bold?'var(--r)':'var(--ng)')+'">'+r[1]+'</span>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

function pfActualizarTipoProforma() {
  var btn = document.getElementById("prof-tipo-dist");
  if (btn) {
    btn.style.borderColor   = "var(--r)";
    btn.style.background    = "var(--rc)";
    btn.style.color         = "var(--r)";
  }
}

// ── CÁLCULO DE TOTALES ───────────────────────────────────────
function pfCalcTotalProforma(items) {
  if (!items || !items.length) return { pbase:0, desc:0, subtotal:0, iva:0, total:0 };
  var pbase    = items.reduce(function(s,i){ return s + i.pbase * i.cant; }, 0);
  var subtotal = items.reduce(function(s,i){ return s + i.punit * i.cant; }, 0);
  var desc     = pbase - subtotal;
  var iva      = subtotal * PF_IVA_PROF;
  return { pbase:pbase, desc:desc, subtotal:subtotal, iva:iva, total:subtotal+iva };
}

// ════════════════════════════════════════════════════════════
//  GUARDAR PROFORMA
// ════════════════════════════════════════════════════════════
function pfGuardarProforma(generarPDF) {
  if (!PF_PROF_CLIENTE) { pfModal("Selecciona un cliente primero."); return; }
  if (!PF_PROF_ITEMS.length) { pfModal("Agrega al menos un producto."); return; }

  var pagoEl    = document.getElementById("prof-pago");
  var validezEl = document.getElementById("prof-validez");
  var pago    = pagoEl    ? pagoEl.value.trim()    : "CRÉDITO 30 DÍAS";
  var validez = validezEl ? validezEl.value.trim() : "15 días";

  var proformas = pfGetProformas();
  var ahora = new Date();
  var ec    = new Date(ahora.toLocaleString("en-US", {timeZone:"America/Guayaquil"}));
  var fecha = String(ec.getDate()).padStart(2,"0") + "/" +
              String(ec.getMonth()+1).padStart(2,"0") + "/" + ec.getFullYear();

  var calc = pfCalcTotalProforma(PF_PROF_ITEMS);

  if (PF_PROF_EDITANDO) {
    // Actualizar existente
    var idx = proformas.findIndex(function(p){ return p.id === PF_PROF_EDITANDO; });
    if (idx !== -1) {
      proformas[idx].items    = JSON.parse(JSON.stringify(PF_PROF_ITEMS));
      proformas[idx].cliente  = JSON.parse(JSON.stringify(PF_PROF_CLIENTE));
      proformas[idx].pago     = pago;
      proformas[idx].validez  = validez;
      proformas[idx].total    = calc.total;
      proformas[idx].editadoEn = fecha;
    }
  } else {
    // Nueva proforma
    var numInt = pfProformaNumero();
    var prof = {
      id:       "prof_" + Date.now() + "_" + Math.random().toString(36).substr(2,5),
      num:      pfProformaNumFmt(numInt),
      numInt:   numInt,
      tipo:     PF_PROF_TIPO,
      fecha:    fecha,
      fechaISO: ec.toISOString(),
      cliente:  JSON.parse(JSON.stringify(PF_PROF_CLIENTE)),
      items:    JSON.parse(JSON.stringify(PF_PROF_ITEMS)),
      pago:     pago,
      validez:  validez,
      subtotal: calc.subtotal,
      iva:      calc.iva,
      total:    calc.total,
      estado:   "pendiente",
      notas:    []
    };
    proformas.push(prof);
    PF_PROF_EDITANDO = prof.id;
  }

  pfSaveProformas(proformas);

  // Sincronizar con Sheets
  pfSincronizarProforma(PF_PROF_EDITANDO);

  if (generarPDF) {
    pfGenerarPDFProforma(PF_PROF_EDITANDO);
  } else {
    pfModal("✅ Proforma guardada correctamente.");
    pfRenderTabProformas();
  }
}

// ════════════════════════════════════════════════════════════
//  GENERACIÓN PDF PROFORMA (jsPDF)
// ════════════════════════════════════════════════════════════
function pfGenerarPDFProforma(profId) {
  var prof = pfGetProformas().find(function(p){ return p.id === profId; });
  if (!prof) { pfModal("Proforma no encontrada."); return; }

  if (typeof cargarJsPDF === "function") {
    cargarJsPDF(null, function(){ pfHacerPDFProforma(prof); });
  } else if (window.jspdf && window.jspdf.jsPDF) {
    pfHacerPDFProforma(prof);
  } else {
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = function(){ pfHacerPDFProforma(prof); };
    document.head.appendChild(s);
  }
}

function pfHacerPDFProforma(prof) {
  var jsPDF = window.jspdf.jsPDF;
  var doc   = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  var W = 210, H = 297;
  var MAR = 8;
  var CW  = W - MAR*2; // 194mm

  var cli  = prof.cliente || {};
  var calc = pfCalcTotalProforma(prof.items);

  // Colores
  var ROJO  = [192, 57, 43];
  var NEGRO = [17, 17, 17];
  var GRIS1 = [74, 74, 74];
  var GRIS2 = [138, 138, 138];
  var GRIS3 = [232, 232, 232];
  var GRIS4 = [245, 245, 245];
  var VERDE = [22, 101, 52];
  var VBG   = [220, 252, 231];
  var VERD2 = [0,0,0]; // negro para texto

  function setFill(rgb) { doc.setFillColor(rgb[0],rgb[1],rgb[2]); }
  function setDraw(rgb) { doc.setDrawColor(rgb[0],rgb[1],rgb[2]); }
  function setTxt(rgb)  { doc.setTextColor(rgb[0],rgb[1],rgb[2]); }

  var y = 0;

  // ── LÍNEA ROJA SUPERIOR ──
  setFill(ROJO); doc.rect(0, 0, W, 2.5, "F");
  // ── FRANJA LATERAL IZQUIERDA ──
  setFill(ROJO); doc.rect(0, 0, 3.5, H, "F");

  // ── HEADER ──
  y = 5;
  // Logo background negro
  setFill(NEGRO); doc.roundedRect(MAR, y, 30, 30, 3, 3, "F");

  // Nombre empresa
  var EX = MAR + 33;
  setTxt(NEGRO); doc.setFont("helvetica","bold"); doc.setFontSize(24);
  doc.text("PYROSHIELD", EX, y + 9);

  // Línea roja bajo nombre
  setFill(ROJO); doc.rect(EX, y + 10.5, 72, 1.2, "F");

  doc.setFont("helvetica","bold"); doc.setFontSize(7); setTxt(GRIS1);
  doc.text("SEGURIDAD INDUSTRIAL Y PROTECCIÓN CONTRA INCENDIOS", EX, y + 15);
  doc.setFont("helvetica","normal"); doc.setFontSize(7); setTxt(NEGRO);
  doc.text("RUC: 0952773976001", EX, y + 20);
  setTxt(GRIS1);
  doc.text("PORTETE #3007 Y GALLEGOS LARA, GUAYAQUIL - ECUADOR", EX, y + 24);
  doc.text("Tel: 04-2374822  ·  0978997247  ·  0983588325", EX, y + 28);
  doc.text("ventas_pyroshield@hotmail.com", EX, y + 32);

  // ── CAJA PROFORMA (derecha) ──
  var BX = W - MAR - 58, BY = y, BW = 58, BH = 35;
  setFill([255,255,255]); setDraw(GRIS3); doc.setLineWidth(0.5);
  doc.roundedRect(BX, BY, BW, BH, 2, 2, "FD");
  // Header rojo caja
  setFill(ROJO); doc.roundedRect(BX, BY, BW, 10, 2, 2, "F");
  doc.rect(BX, BY+5, BW, 5, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(14); setTxt([255,255,255]);
  doc.text("PROFORMA", BX+BW/2, BY+7, {align:"center"});

  setDraw(GRIS3); doc.setLineWidth(0.4);
  doc.line(BX+3, BY+11.5, BX+BW-3, BY+11.5);
  doc.setFont("helvetica","normal"); doc.setFontSize(6.5); setTxt(GRIS2);
  doc.text("RUC: 0952773976001", BX+BW/2, BY+15, {align:"center"});
  // Badge número
  setFill(GRIS4); doc.roundedRect(BX+4, BY+17.5, BW-8, 7.5, 2, 2, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(10); setTxt(NEGRO);
  doc.text("N° " + prof.num, BX+BW/2, BY+22.5, {align:"center"});
  doc.setLineWidth(0.4); setDraw(GRIS3);
  doc.line(BX+3, BY+27, BX+BW-3, BY+27);
  doc.setFont("helvetica","normal"); doc.setFontSize(7); setTxt(GRIS1);
  doc.text(prof.fecha, BX+BW/2, BY+31, {align:"center"});
  // Badge tipo
  setFill([253,236,234]); doc.roundedRect(BX+3, BY+32, BW-6, 5.5, 2, 2, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(6.5); setTxt(ROJO);
  // #AUDIO FIX: CLIENTE PREFERENCIAL va al lado de la razón social, no aquí

  y += 38;

  // ── DATOS CLIENTE ──
  var CLI_H = 35;
  setFill(GRIS4); doc.rect(MAR, y, CW, CLI_H, "F");
  setDraw(GRIS3); doc.setLineWidth(0.4);
  doc.rect(MAR, y, CW, CLI_H, "D");

  // Header datos
  setFill(NEGRO); doc.rect(MAR, y, CW, 7.5, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); setTxt([255,255,255]);
  doc.text("DATOS DEL COMPRADOR", MAR+3, y+5.5);

  // Badge tipo en header
  var tipoLabel = "CLIENTE PREFERENCIAL"; // #AUDIO FIX: cambiar a CLIENTE PREFERENCIAL
  var tipoW = doc.getTextWidth(tipoLabel) + 7;
  setFill(ROJO); doc.roundedRect(W-MAR-tipoW-0.5, y+1, tipoW, 5, 1.5, 1.5, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(6.5); setTxt([255,255,255]);
  doc.text(tipoLabel, W-MAR-tipoW/2-0.5, y+4.5, {align:"center"});

  // Grid 2 columnas
  var MID = MAR + CW*0.55;
  setDraw(GRIS3); doc.setLineWidth(0.4);
  doc.line(MID, y+7.5, MID, y+CLI_H-1);

  var CAMPOS_IZQ = [
    ["RAZÓN SOCIAL / NOMBRES", (cli.razon||"—").substring(0,50)],
    ["IDENTIFICACIÓN (RUC)",   cli.ruc||"—"],
    ["DIRECCIÓN",              (cli.dir||"—").substring(0,50)],
    ["CORREO ELECTRÓNICO",     (cli.correo||"—").substring(0,40)],
  ];
  var CAMPOS_DER = [
    ["FECHA DE EMISIÓN", prof.fecha],
    ["VÁLIDA HASTA",     pfSumarDias(prof.fecha, 15)],
    ["CONDICIÓN DE PAGO",prof.pago||"CRÉDITO 30 DÍAS"],
    ["TELÉFONO",         cli.tel||"—"],
  ];
  var RHC = (CLI_H - 7.5) / 4;
  for (var i = 0; i < 4; i++) {
    var yy = y + 7.5 + i * RHC;
    if (i > 0) { setDraw(GRIS3); doc.setLineWidth(0.25); doc.line(MAR+1, yy, W-MAR-1, yy); }
    doc.setFont("helvetica","bold"); doc.setFontSize(5.5); setTxt(GRIS2);
    doc.text(CAMPOS_IZQ[i][0], MAR+2.5, yy+3.5);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); setTxt(NEGRO);
    doc.text(CAMPOS_IZQ[i][1], MAR+2.5, yy+8);
    doc.setFont("helvetica","bold"); doc.setFontSize(5.5); setTxt(GRIS2);
    doc.text(CAMPOS_DER[i][0], MID+2, yy+3.5);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); setTxt(NEGRO);
    doc.text(CAMPOS_DER[i][1], MID+2, yy+8);
  }
  y += CLI_H + 2;

  // ── TABLA DE ÍTEMS ──
  var COL_W = [26, 67, 14, 24, 22, 24, 17];
  var HDRS  = ["COD. PRINCIPAL","DESCRIPCIÓN","CANT.","P. BASE","DESCUENTO","P. UNIT.","SUBTOTAL"];
  var ROW_H = 8.5;

  // Header
  setFill(NEGRO); doc.rect(MAR, y, CW, 9, "F");
  var xc = MAR;
  for (var ci = 0; ci < HDRS.length; ci++) {
    if (ci > 0) { setDraw([58,58,58]); doc.setLineWidth(0.25); doc.line(xc, y, xc, y+9); }
    doc.setFont("helvetica","bold"); doc.setFontSize(6.5); setTxt([255,255,255]);
    doc.text(HDRS[ci], xc + COL_W[ci]/2, y+6.2, {align:"center"});
    xc += COL_W[ci];
  }
  y += 9;

  // Filas
  var MAX_ROWS = 16;
  var itemsToRender = (prof.items||[]).slice(0, MAX_ROWS);
  for (var ri = 0; ri < MAX_ROWS; ri++) {
    var item = itemsToRender[ri];
    var bg = ri % 2 === 0 ? [255,255,255] : [245,245,245];
    setFill(bg); doc.rect(MAR, y, CW, ROW_H, "F");
    setDraw(GRIS3); doc.setLineWidth(0.25); doc.line(MAR, y+ROW_H, MAR+CW, y+ROW_H);
    var mid_y = y + ROW_H/2 - 1;
    xc = MAR;
    for (var ci2 = 0; ci2 < COL_W.length-1; ci2++) {
      xc += COL_W[ci2];
      doc.line(xc, y, xc, y+ROW_H);
    }
    if (item) {
      xc = MAR;
      // COD
      setFill(GRIS3); doc.roundedRect(xc+2, y+1.5, COL_W[0]-4, ROW_H-3, 1.5, 1.5, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(6.5); setTxt(GRIS1);
      doc.text(item.id, xc+COL_W[0]/2, mid_y, {align:"center"});
      xc += COL_W[0];
      // DESC
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5); setTxt(NEGRO);
      doc.text((item.desc||item.nombre||"").substring(0,38), xc+2, mid_y);
      xc += COL_W[1];
      // CANT
      doc.setFont("helvetica","bold"); doc.setFontSize(9); setTxt(NEGRO);
      doc.text(String(item.cant), xc+COL_W[2]/2, mid_y, {align:"center"});
      xc += COL_W[2];
      // P.BASE — sin tachado, solo texto normal gris
      setFill([254,243,199]); doc.roundedRect(xc+2, y+1.5, COL_W[3]-4, ROW_H-3, 1.5, 1.5, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5); setTxt([146,64,14]);
      doc.text("$ "+item.pbase.toFixed(2), xc+COL_W[3]/2, mid_y, {align:"center"});
      xc += COL_W[3];
      // DESCUENTO
      var descUnit = item.pbase - item.punit;
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); setTxt(ROJO);
      doc.text("- $ "+descUnit.toFixed(2), xc+COL_W[4]/2, mid_y, {align:"center"});
      xc += COL_W[4];
      // P.UNIT — badge verde
      setFill(VBG); doc.roundedRect(xc+2, y+1.5, COL_W[5]-4, ROW_H-3, 1.5, 1.5, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(8); setTxt(VERDE);
      doc.text("$ "+item.punit.toFixed(2), xc+COL_W[5]/2, mid_y, {align:"center"});
      xc += COL_W[5];
      // SUBTOTAL
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); setTxt(NEGRO);
      doc.text("$ "+(item.cant*item.punit).toFixed(2), xc+COL_W[6]-2, mid_y, {align:"right"});
    }
    y += ROW_H;
  }
  // Borde exterior tabla
  setDraw(NEGRO); doc.setLineWidth(0.7);
  doc.rect(MAR, y - MAX_ROWS*ROW_H - 9, CW, MAX_ROWS*ROW_H + 9, "D");

  y += 2;

  // ── TOTALES + INFO ──
  var TOT_H   = 38;
  var INFO_W  = CW * 0.52;
  var TOT_W   = CW - INFO_W - 2;
  var TOT_X   = MAR + INFO_W + 2;

  // Panel info
  setFill(GRIS4); doc.rect(MAR, y, INFO_W, TOT_H, "F");
  setDraw(GRIS3); doc.setLineWidth(0.4); doc.rect(MAR, y, INFO_W, TOT_H, "D");
  setFill(NEGRO); doc.rect(MAR, y, INFO_W, 7.5, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); setTxt([255,255,255]);
  doc.text("INFORMACIÓN ADICIONAL", MAR+3, y+5.5);
  var notas = [
    "• Valores expresados SIN IVA. IVA 15% incluido en el total.",
    "• Proforma válida por " + (prof.validez||"15 días") + " desde la emisión.",
    "• Stock sujeto a disponibilidad al momento del pedido.",
    "• Precios preferenciales para distribuidores registrados.",
    "• No incluye transporte salvo indicación expresa.",
  ];
  doc.setFont("helvetica","normal"); doc.setFontSize(6.5); setTxt(GRIS1);
  notas.forEach(function(n, ni){ doc.text(n, MAR+2.5, y+12+ni*5); });

  // Panel totales
  setFill([255,255,255]); doc.rect(TOT_X, y, TOT_W, TOT_H, "F");
  setDraw(GRIS3); doc.rect(TOT_X, y, TOT_W, TOT_H, "D");

  var ROWS_T = [
    ["Precio de Lista",         "$ "+calc.pbase.toFixed(2),    GRIS1, GRIS1, false],
    ["(-) Descuento Aplicado",  "$ "+calc.desc.toFixed(2),     GRIS1, ROJO,  false],
    ["Subtotal Sin Impuestos",  "$ "+calc.subtotal.toFixed(2), NEGRO, NEGRO, true],
    ["IVA 15%",                 "$ "+calc.iva.toFixed(2),      GRIS1, GRIS1, false],
    ["VALOR TOTAL",             "$ "+calc.total.toFixed(2),    [255,255,255],[255,255,255], "resalt"],
  ];
  var rh = TOT_H / ROWS_T.length;
  ROWS_T.forEach(function(row, ri) {
    var yy = y + (ri+0.5)*rh;
    if (row[4] === "resalt") {
      setFill(ROJO); doc.rect(TOT_X, y+ri*rh, TOT_W, rh, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(10); setTxt(row[2]);
      doc.text(row[0], TOT_X+4, yy);
      doc.setFontSize(13); setTxt(row[3]);
      doc.text(row[1], TOT_X+TOT_W-3, yy, {align:"right"});
    } else {
      if (ri > 0) { setDraw(GRIS3); doc.setLineWidth(0.3); doc.line(TOT_X+2, y+ri*rh, TOT_X+TOT_W-2, y+ri*rh); }
      doc.setFont("helvetica", row[4]?"bold":"normal"); doc.setFontSize(7.5);
      setTxt(row[2]); doc.text(row[0], TOT_X+4, yy);
      doc.setFont("helvetica","bold"); doc.setFontSize(9);
      setTxt(row[3]); doc.text(row[1], TOT_X+TOT_W-3, yy, {align:"right"});
    }
  });

  y += TOT_H + 2;

  // ── TOTAL EN LETRAS ──
  setFill(GRIS4); doc.rect(MAR, y, CW, 7.5, "F");
  setDraw(GRIS3); doc.rect(MAR, y, CW, 7.5, "D");
  doc.setFont("helvetica","bold"); doc.setFontSize(7); setTxt(GRIS2);
  doc.text("SON:", MAR+2, y+5.5);
  doc.setFont("helvetica","bold"); doc.setFontSize(7); setTxt(NEGRO);
  var letras = pfNumALetrasProf(calc.total);
  doc.text(letras.substring(0, 90), MAR+13, y+5.5);
  y += 9;

  // ── FIRMAS ──
  var FIRMA_H = 17;
  setFill(GRIS4); doc.rect(MAR, y, CW, FIRMA_H, "F");
  setDraw(GRIS3); doc.rect(MAR, y, CW, FIRMA_H, "D");

  var MF = MAR + CW/2;
  // Línea cliente
  setDraw(NEGRO); doc.setLineWidth(0.6);
  doc.line(MAR+8, y+12, MF-8, y+12);
  doc.setFont("helvetica","normal"); doc.setFontSize(6.5); setTxt(GRIS2);
  doc.text("Firma y Sello del Cliente", (MAR+8+MF-8)/2, y+15.5, {align:"center"});

  // Separador
  setDraw(GRIS3); doc.setLineWidth(0.4);
  doc.line(MF, y+1, MF, y+FIRMA_H-1);

  // Línea empresa
  setDraw(NEGRO); doc.setLineWidth(0.6);
  doc.line(MF+8, y+12, W-MAR-8, y+12);
  doc.setFont("helvetica","bold"); doc.setFontSize(6.5); setTxt(GRIS1);
  doc.text("ALEJANDRO LÓPEZ — JEFE DE OPERACIONES", (MF+8+W-MAR-8)/2, y+15.5, {align:"center"});
  doc.setFont("helvetica","normal"); doc.setFontSize(6); setTxt(GRIS2);
  doc.text("Pyroshield  ·  RUC: 0952773976001", (MF+8+W-MAR-8)/2, y+18.5, {align:"center"});
  doc.setFont("helvetica","normal"); doc.setFontSize(6.5); setTxt(GRIS1);
  doc.text("Documento generado electrónicamente", (MF+8+W-MAR-8)/2, y+4, {align:"center"});

  // ── PIE ──
  setFill(NEGRO); doc.rect(0, H-9, W, 9, "F");
  setFill(ROJO);  doc.rect(0, H-9.8, W, 1, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(6); setTxt(GRIS3);
  doc.text("PYROSHIELD  ·  PORTETE #3007 Y GALLEGOS LARA, GUAYAQUIL  |  04-2374822 · 0978997247 · 0983588325  |  ventas_pyroshield@hotmail.com", W/2, H-4, {align:"center"});

  // Descargar
  var nombreArch = "PROFORMA_PYROSHIELD_" + prof.num.replace(/[-:]/g,"_") + ".pdf";
  doc.save(nombreArch);
  pfModal("✅ Proforma " + prof.num + " descargada correctamente.");
  pfRenderTabProformas();
}

// ── HELPER: FECHA + DÍAS ─────────────────────────────────────
function pfSumarDias(fechaStr, dias) {
  try {
    var p = fechaStr.split("/");
    var d = new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
    d.setDate(d.getDate() + dias);
    return String(d.getDate()).padStart(2,"0") + "/" +
           String(d.getMonth()+1).padStart(2,"0") + "/" + d.getFullYear();
  } catch(e) { return fechaStr; }
}

// ── HELPER: NÚMERO EN LETRAS ─────────────────────────────────
function pfNumALetrasProf(n) {
  n = Math.round(n * 100) / 100;
  var entero = Math.floor(n);
  var cents  = Math.round((n - entero) * 100);
  var u = ["","UNO","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE","DIEZ",
           "ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO",
           "DIECINUEVE","VEINTE"];
  var d = ["","","VEINTI","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"];
  var c = ["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS",
           "SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"];
  function e2l(n) {
    if (n === 0) return "CERO";
    if (n <= 20) return u[n];
    if (n < 30) { var sp={21:"VEINTIÚN",22:"VEINTIDÓS",23:"VEINTITRÉS",26:"VEINTISÉIS"}; return sp[n]||"VEINTI"+u[n-20].toLowerCase(); }
    if (n < 100) return d[Math.floor(n/10)] + (n%10 ? " Y "+u[n%10] : "");
    if (n === 100) return "CIEN";
    if (n < 1000) return c[Math.floor(n/100)] + (n%100 ? " "+e2l(n%100) : "");
    if (n < 2000) return "MIL" + (n%1000 ? " "+e2l(n%1000) : "");
    return e2l(Math.floor(n/1000)) + " MIL" + (n%1000 ? " "+e2l(n%1000) : "");
  }
  return e2l(entero) + " CON " + String(cents).padStart(2,"0") + "/100 USD";
}

// ════════════════════════════════════════════════════════════
//  FLUJO DE ESTADOS
// ════════════════════════════════════════════════════════════
function pfAutorizarProforma(id) {
  pfConfirm("✅ ¿Confirmar que el cliente autorizó esta proforma?\nCambiará a estado AUTORIZADA y aparecerá en Pendientes de Recorrido.", function() {
    pfCambiarEstadoProforma(id, "autorizada");
    pfModal("✅ Proforma autorizada.\nAparece ahora en: tab Proformas → filtro ✅ Autorizada\nY en la sección \"Pendientes de incluir en recorrido\".");
  });
}

function pfAsignarARecorrido(id) {
  var prof = pfGetProformas().find(function(p){ return p.id === id; });
  if (!prof) return;

  // Mostrar modal de selección de fecha/jornada
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:520;display:flex;align-items:center;justify-content:center;padding:20px";

  var ahora = new Date();
  var ec    = new Date(ahora.toLocaleString("en-US",{timeZone:"America/Guayaquil"}));
  var hoy   = String(ec.getDate()).padStart(2,"0")+"/"+String(ec.getMonth()+1).padStart(2,"0")+"/"+ec.getFullYear();

  var itemsResumen = (prof.items||[]).slice(0,3).map(function(i){ return i.cant+"× "+i.nombre; }).join(", ");
  if ((prof.items||[]).length > 3) itemsResumen += " y " + ((prof.items||[]).length-3) + " más";

  ov.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:24px 20px;max-width:340px;width:100%">' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:4px">📍 Agregar al recorrido</div>' +
    '<div style="font-size:13px;color:var(--g4);margin-bottom:14px">'+(prof.cliente.razon||"").substring(0,40)+'</div>' +
    '<div style="font-size:12px;font-weight:700;color:var(--g3);margin-bottom:4px">ÍTEMS A ENTREGAR</div>' +
    '<div style="font-size:12px;color:var(--ng);background:var(--g1);border-radius:10px;padding:8px 12px;margin-bottom:14px">'+itemsResumen+'</div>' +
    '<div style="font-size:12px;font-weight:700;color:var(--g3);margin-bottom:4px">JORNADA</div>' +
    '<select id="asig-jornada" style="width:100%;padding:10px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:8px;background:#fff">' +
    '<option value="manana">☀️ Jornada Mañana</option>' +
    '<option value="tarde">🌆 Jornada Tarde</option>' +
    '</select>' +
    '<div style="font-size:12px;font-weight:700;color:var(--g3);margin-bottom:4px">POSICIÓN EN EL RECORRIDO</div>' +
    '<input id="asig-pos" type="number" min="1" value="1" placeholder="Nº de punto" style="width:100%;padding:10px;border:1.5px solid var(--bo);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:14px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    '<button id="asig-cancel" style="padding:13px;border-radius:12px;border:1.5px solid var(--bo);background:var(--g1);color:var(--g4);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Cancelar</button>' +
    '<button id="asig-ok" style="padding:13px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">✅ Agregar</button>' +
    '</div></div>';

  document.body.appendChild(ov);
  ov.querySelector('#asig-cancel').onclick = function(){ document.body.removeChild(ov); };
  ov.querySelector('#asig-ok').onclick = function(){
    var jornada = ov.querySelector('#asig-jornada').value;
    var pos     = parseInt(ov.querySelector('#asig-pos').value) || 1;
    document.body.removeChild(ov);
    pfAgregarEntregaPendiente(id, jornada, pos);
  };
}

function pfAgregarEntregaPendiente(profId, jornada, posicion) {
  var prof = pfGetProformas().find(function(p){ return p.id === profId; });
  if (!prof) return;

  // Guardar en lista de entregas pendientes
  var pendientes = [];
  try { pendientes = JSON.parse(localStorage.getItem("pf_entregas_pendientes") || "[]"); } catch(e){}

  // Verificar si ya existe
  var yaExiste = pendientes.some(function(e){ return e.profId === profId; });
  if (!yaExiste) {
    pendientes.push({
      id:       "ep_" + Date.now(),
      profId:   profId,
      profNum:  prof.num,
      cliente:  prof.cliente,
      items:    prof.items,
      jornada:  jornada,
      posicion: posicion,
      fecha:    new Date().toLocaleDateString("es-EC"),
      estado:   "pendiente_recorrido"
    });
    localStorage.setItem("pf_entregas_pendientes", JSON.stringify(pendientes));
  }

  // Cambiar estado de la proforma a pendiente_factura (entrega programada)
  pfCambiarEstadoProforma(profId, "pend_factura");

  // Generar texto del punto de recorrido
  var textoRecorrido = pfGenerarTextoEntrega(prof, jornada, posicion);

  // Mostrar con opción de copiar
  var ov2 = document.createElement("div");
  ov2.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:520;display:flex;align-items:center;justify-content:center;padding:20px";
  ov2.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:24px 20px;max-width:360px;width:100%">' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:4px">✅ Entrega programada</div>' +
    '<div style="font-size:13px;color:var(--g4);margin-bottom:12px">Copia este texto y pégalo en el recorrido</div>' +
    '<div style="background:var(--g1);border-radius:12px;padding:12px;font-size:12px;font-family:monospace;white-space:pre-wrap;max-height:180px;overflow-y:auto;margin-bottom:14px" id="texto-rec-prev">'+textoRecorrido+'</div>' +
    '<button onclick="pfCopiarTexto(\'texto-rec-prev\')" style="width:100%;padding:13px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:8px">📋 Copiar texto del recorrido</button>' +
    '<button id="cerrar-ep" style="width:100%;padding:13px;border-radius:12px;border:1.5px solid var(--bo);background:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;color:var(--g4)">Cerrar</button>' +
    '</div>';
  document.body.appendChild(ov2);
  ov2.querySelector('#cerrar-ep').onclick = function(){
    document.body.removeChild(ov2);
    pfRenderTabProformas();
  };
}

function pfGenerarTextoEntrega(prof, jornada, pos) {
  var cli = prof.cliente || {};
  var txt = "Punto "+pos+" — "+(cli.razon||"CLIENTE")+"\n";
  txt += "Misión: Entrega\n";
  (prof.items||[]).forEach(function(item){
    txt += "- "+item.cant+"x "+item.nombre+"\n";
  });
  return txt;
}

function pfCopiarTexto(elId) {
  var el = document.getElementById(elId);
  if (!el) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.textContent).then(function(){
      pfModal("✅ Texto copiado al portapapeles.");
    }).catch(function(){
      pfModal("Copia manualmente el texto del recuadro.");
    });
  } else {
    pfModal("Copia manualmente el texto del recuadro.");
  }
}

function pfConvertirAFactura(id) {
  var prof = pfGetProformas().find(function(p){ return p.id === id; });
  if (!prof) return;

  pfConfirm("🧾 ¿Emitir factura electrónica en Azur/SRI para esta proforma?\nCliente: "+(prof.cliente.razon||"—")+"\nTotal: $"+pfCalcTotalProforma(prof.items).total.toFixed(2), function() {
    // Construir payload para Azur (mismo formato que nota.js)
    var cli  = prof.cliente || {};
    var calc = pfCalcTotalProforma(prof.items);
    var tipoId = (cli.ruc||"").replace(/[^0-9]/g,"").length === 13 ? "04" :
                 (cli.ruc||"").replace(/[^0-9]/g,"").length === 10 ? "05" : "07";

    var payload = {
      accion:      "emitir_factura_azur",
      token:       localStorage.getItem("pf_token") || "",
      local:       cli.razon || "CLIENTE",
      razon:       cli.razon || "CONSUMIDOR FINAL",
      ruc:         (cli.ruc||"").replace(/[^0-9]/g,""),
      tipoId:      tipoId,
      dir:         cli.dir || "GUAYAQUIL",
      correo:      cli.correo || "",
      items: (prof.items||[]).map(function(i){
        return {
          cod:  i.id,
          desc: i.desc || i.nombre,
          cant: i.cant,
          puni: i.punit,
          desc_val: (i.pbase - i.punit)
        };
      }),
      subtotal:    calc.subtotal,
      iva:         calc.iva,
      total:       calc.total,
      pago:        prof.pago || "CRÉDITO 30 DÍAS",
      profNum:     prof.num
    };

    mostrarCargando && mostrarCargando(true, "Emitiendo factura en Azur...");

    fetch(SCRIPT_URL, {
      method:  "POST",
      body:    JSON.stringify(payload)
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      mostrarCargando && mostrarCargando(false);
      if (data.ok) {
        pfCambiarEstadoProforma(id, "facturada");
        // Guardar clave de acceso
        var proformas = pfGetProformas();
        var idx = proformas.findIndex(function(p){ return p.id === id; });
        if (idx !== -1) {
          proformas[idx].claveAcceso = data.claveAcceso || "";
          proformas[idx].numFactura  = data.secuencial  || "";
          pfSaveProformas(proformas);
        }
        pfModal("✅ Factura emitida correctamente.\nClave de acceso: " + (data.claveAcceso||"").substring(0,20) + "...");
        pfRenderTabProformas();
      } else {
        pfModal("❌ Error al emitir factura: " + (data.msg||"Error desconocido"));
      }
    })
    .catch(function(err){
      mostrarCargando && mostrarCargando(false);
      pfModal("❌ Error de conexión: " + err.message);
    });
  });
}

function pfFinalizarProforma(id) {
  pfConfirm("🏁 ¿Dar por finalizada esta proforma?\nPasará al historial de proformas cerradas.", function() {
    pfCambiarEstadoProforma(id, "finalizada");
    pfModal("🏁 Proforma finalizada y archivada.");
    pfRenderTabProformas();
  });
}

function pfEliminarProforma(id) {
  pfConfirm("🗑 ¿Eliminar esta proforma permanentemente?\nEsta acción no se puede deshacer.", function() {
    var proformas = pfGetProformas().filter(function(p){ return p.id !== id; });
    pfSaveProformas(proformas);
    pfModal("Proforma eliminada.");
    pfRenderTabProformas();
  });
}

function pfCambiarEstadoProforma(id, nuevoEstado) {
  var proformas = pfGetProformas();
  var idx = proformas.findIndex(function(p){ return p.id === id; });
  if (idx === -1) return;
  proformas[idx].estado = nuevoEstado;
  proformas[idx]["fecha_"+nuevoEstado] = new Date().toLocaleDateString("es-EC");
  pfSaveProformas(proformas);
  pfSincronizarProforma(id);
}

// ── VER PROFORMA DETALLE ─────────────────────────────────────
function pfVerProforma(id) {
  var prof = pfGetProformas().find(function(p){ return p.id === id; });
  if (!prof) return;
  var calc = pfCalcTotalProforma(prof.items);
  var est  = PF_PROF_ESTADOS[prof.estado] || PF_PROF_ESTADOS.pendiente;
  var h = '';
  h += '<div style="padding:12px">';
  h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h += '<button onclick="pfRenderTabProformas()" style="padding:6px 12px;border-radius:10px;border:1.5px solid var(--bo);background:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">‹ Volver</button>';
  h += '<div style="flex:1"><div style="font-size:16px;font-weight:700">'+prof.num+'</div>';
  h += '<div style="display:inline-block;padding:3px 8px;border-radius:20px;background:'+est.bg+';color:'+est.color+';font-size:11px;font-weight:700">'+est.ico+' '+est.label+'</div></div>';
  h += '<button onclick="pfGenerarPDFProforma(\''+id+'\''+')" style="padding:8px 14px;border-radius:10px;border:none;background:var(--r);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">📄 PDF</button>';
  h += '</div>';

  // Datos cliente
  h += '<div style="background:var(--g1);border-radius:14px;padding:12px 14px;margin-bottom:10px">';
  h += '<div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:6px">CLIENTE</div>';
  h += '<div style="font-size:14px;font-weight:700">'+(prof.cliente.razon||"—")+'</div>';
  h += '<div style="font-size:12px;color:var(--g4);margin-top:2px">RUC: '+(prof.cliente.ruc||"—")+'</div>';
  h += '<div style="font-size:12px;color:var(--g4)">'+((prof.cliente.dir||"").substring(0,50))+'</div>';
  h += '</div>';

  // Ítems
  h += '<div style="font-size:11px;font-weight:700;color:var(--g3);margin-bottom:6px">PRODUCTOS</div>';
  h += '<div style="background:#fff;border-radius:14px;border:1.5px solid var(--bo);overflow:hidden;margin-bottom:10px">';
  (prof.items||[]).forEach(function(item, i) {
    h += '<div style="padding:8px 12px;'+(i>0?'border-top:1px solid var(--g1)':'')+';display:flex;justify-content:space-between;align-items:center">';
    h += '<div><div style="font-size:13px;font-weight:700">'+item.nombre+'</div>';
    h += '<div style="font-size:11px;color:var(--g3)">'+item.id+' · Cant: '+item.cant+'</div></div>';
    h += '<div style="text-align:right"><div style="font-size:11px;color:var(--g3)">P.Unit: $'+item.punit.toFixed(2)+'</div>';
    h += '<div style="font-size:13px;font-weight:700">$'+(item.cant*item.punit).toFixed(2)+'</div></div></div>';
  });
  h += '</div>';

  // Total
  h += '<div style="background:#fff;border-radius:14px;border:1.5px solid var(--bo);padding:12px 14px;margin-bottom:14px">';
  h += '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px"><span style="color:var(--g4)">Precio de lista:</span><span>$'+calc.pbase.toFixed(2)+'</span></div>';
  h += '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px"><span style="color:var(--r)">Descuento:</span><span style="color:var(--r)">-$'+calc.desc.toFixed(2)+'</span></div>';
  h += '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px"><span>Subtotal:</span><span style="font-weight:700">$'+calc.subtotal.toFixed(2)+'</span></div>';
  h += '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px"><span style="color:var(--g4)">IVA 15%:</span><span>$'+calc.iva.toFixed(2)+'</span></div>';
  h += '<div style="display:flex;justify-content:space-between;padding:6px 0 0;border-top:2px solid var(--r);margin-top:4px"><span style="font-size:16px;font-weight:700;color:var(--r)">TOTAL:</span><span style="font-size:18px;font-weight:700;color:var(--r)">$'+calc.total.toFixed(2)+'</span></div>';
  h += '</div>';

  // Acciones
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  if (prof.estado === "pendiente") {
    h += '<button onclick="pfAutorizarProforma(\''+id+'\''+')" style="flex:1;padding:12px;border-radius:12px;border:none;background:var(--ac);color:var(--a);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">✅ Cliente autorizó</button>';
    h += '<button onclick="pfEditarProforma(\''+id+'\''+')" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--bo);background:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">✏️ Editar</button>';
  }
  if (prof.estado === "autorizada") {
    h += '<button onclick="pfAsignarARecorrido(\''+id+'\''+')" style="flex:2;padding:12px;border-radius:12px;border:none;background:var(--r);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">📍 Agregar al recorrido</button>';
    h += '<button onclick="pfConvertirAFactura(\''+id+'\''+')" style="flex:2;padding:12px;border-radius:12px;border:none;background:#1A5FAA;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">🧾 Emitir factura</button>';
  }
  if (prof.estado === "pend_factura") {
    h += '<button onclick="pfConvertirAFactura(\''+id+'\''+')" style="flex:1;padding:12px;border-radius:12px;border:none;background:#1A5FAA;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">🧾 Emitir factura</button>';
  }
  if (prof.estado === "facturada") {
    h += '<button onclick="pfFinalizarProforma(\''+id+'\''+')" style="flex:1;padding:12px;border-radius:12px;border:none;background:var(--v);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">🏁 Finalizar</button>';
  }
  h += '</div>';
  h += '<div style="height:80px"></div></div>';

  var el = document.getElementById("pf-prof-contenido");
  if (el) el.innerHTML = h;
}

// ── SINCRONIZAR CON SHEETS ───────────────────────────────────
function pfSincronizarProforma(id) {
  var prof = pfGetProformas().find(function(p){ return p.id === id; });
  if (!prof) return;
  fetch(SCRIPT_URL, {
    method:  "POST",
    body: JSON.stringify({
      accion:  "guardar_proforma",
      token:   localStorage.getItem("pf_token") || "",
      id:      prof.id,
      num:     prof.num,
      fecha:   prof.fecha,
      cliente: prof.cliente,
      items:   prof.items,
      subtotal:prof.subtotal,
      iva:     prof.iva,
      total:   prof.total,
      estado:  prof.estado,
      pago:    prof.pago
    })
  }).catch(function(){});  // silencioso — es solo sincronización
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener("load", function() {
  pfInyectarProformas();
});
