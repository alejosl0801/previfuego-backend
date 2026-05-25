// ── DATOS ──
var ACCESORIOS=[
  {id:"abrazadera",n:"Abrazadera plástica",p:1.50},
  {id:"manometro",n:"Manómetro PQS",p:2.80},
  {id:"cabezal_pqs",n:"Cabezal extintor PQS",p:8.80},
  {id:"manguera_pqs",n:"Manguera PQS",p:4.80},
  {id:"corneta_co2_5",n:"Corneta CO₂ 5 lbs",p:8.80},
  {id:"manguera_co2_10",n:"Manguera CO₂ 10 lbs",p:13.80},
  {id:"empaque",n:"Empaque válvula",p:1.50},
  {id:"soporte",n:"Soporte metálico",p:5.00},
  {id:"piton",n:"Pitón",p:1.50},
  {id:"tubo_sifon",n:"Tubo sifón",p:2.00},
  {id:"boquilla",n:"Boquilla",p:1.00},
  {id:"valvula_pqs",n:"Válvula PQS",p:3.00},
  {id:"pintura",n:"Pintura sintética",p:2.00},
  {id:"letrero",n:"Letrero señalética",p:3.50},
  {id:"soporte_pared",n:"Soporte de pared",p:5.00}
];

var PUNTOS=[
  {id:1,num:1,n:"KFC Mall del Sur P/B",cod:"K-059",emp:"INT FOOD SERVICES CORP SA",dir:"MALL DEL SUR, PLANTA BAJA",kfc:true,tipo:"M",done:false,ext:[
    {l:"Cocina freidoras",t:"CO2",w:"50 lbs"},
    {l:"Cocina entrada",t:"CO2",w:"50 lbs"},
    {l:"Salón P/B",t:"PQS",w:"20 lbs"},
    {l:"Terraza GLP",t:"PQS",w:"20 lbs"}
  ]},
  {id:2,num:2,n:"KFC Portete y la 17",cod:"K-096",emp:"INT FOOD SERVICES CORP SA",dir:"AV. PORTETE ENTRE 16AVA Y 17AVA",kfc:true,tipo:"M",done:false,ext:[
    {l:"Cocina freidoras",t:"CO2",w:"50 lbs"},
    {l:"Cocina entrada",t:"CO2",w:"50 lbs"},
    {l:"Salón caj P/A",t:"PQS",w:"20 lbs"},
    {l:"Terraza GLP",t:"PQS",w:"20 lbs"}
  ]},
  {id:3,num:3,n:"Menestras Garzota",cod:"M-035",emp:"SHEMLON S.A.",dir:"GARZOTA, AV. PRINCIPAL",kfc:true,tipo:"M",done:false,ext:[
    {l:"Cocina tipo K",t:"TIPO K",w:"2.5 gls"},
    {l:"Salón principal",t:"PQS",w:"10 lbs"},
    {l:"Bodega",t:"CO2",w:"5 lbs"}
  ]},
  {id:4,num:4,n:"Novocentro Durán",cod:null,emp:"Cliente recurrente",dir:"DURÁN, VÍA PRINCIPAL",kfc:false,tipo:"R",done:false,ext:[]},
  {id:5,num:5,n:"Papa Johns Samborondón",cod:null,emp:"Cliente recurrente",dir:"SAMBORONDÓN PLAZA",kfc:false,tipo:"M",done:false,ext:[]}
];

// ── ESTADO ──
var PA=null;
var FD={1:null,2:null,3:null};
var FB64={1:null,2:null,3:null};
var ACCS=[],NOV=null,FIRMADO=false,HISTORIAL=[];
var canvas,ctx,drawing=false,trazado=false;
var CERT_CONTADOR=parseInt(sessionStorage.getItem("certCount")||"0");
var URLS_GENERADAS=[];

// ── NAVEGACIÓN ──
function ir(id){
  document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active");});
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}

// ── FECHA ──
function initFecha(){
  var d=new Date();
  var dias=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  var meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  document.getElementById("s1f").textContent=dias[d.getDay()]+" "+d.getDate()+" "+meses[d.getMonth()];
}

// ── LOGO ──
function initLogos(){
  if(typeof LOGO_B64==="undefined")return;
  var el=document.getElementById("lcd");
  if(el)el.setAttribute("data-b64",LOGO_B64);
  var logoIds=["logo-img-s1","logo-img-shist","logo-img-sperf"];
  var src="data:image/png;base64,"+LOGO_B64;
  logoIds.forEach(function(id){
    var img=document.getElementById(id);
    if(img)img.src=src;
  });
}

// ── PUNTOS ──
function renderPuntos(){
  var lista=document.getElementById("s1list");
  var comp=0;
  for(var i=0;i<PUNTOS.length;i++){if(PUNTOS[i].done)comp++;}
  document.getElementById("s1p").textContent=comp+"/"+PUNTOS.length+" misiones";
  document.getElementById("s1pf").style.width=(comp/PUNTOS.length*100)+"%";
  var html="<div class=\"slbl\">Jornada de hoy</div>";
  for(var i=0;i<PUNTOS.length;i++){
    var p=PUNTOS[i];
    var tags="";
    if(p.tipo==="M")tags+="<span class=\"tg tm\">Mantenimiento</span>";
    if(p.tipo==="R")tags+="<span class=\"tg trc\">Recarga</span>";
    if(p.kfc)tags+="<span class=\"tg tk\">Grupo KFC</span>";
    html+="<div class=\"cd"+(p.done?" dn":"")+"\" onclick=\"abrirPunto("+p.id+")\">";
    html+="<div class=\"pr\">";
    html+="<div class=\"pn\">"+(p.done?"✓":p.num)+"</div>";
    html+="<div class=\"pi\">";
    html+="<div class=\"pnm\">"+p.n+"</div>";
    html+="<div class=\"psb\">"+(p.cod?p.cod+" · ":"")+(p.done?"Completado":p.emp)+"</div>";
    html+="</div>";
    html+="<div class=\"pch\">"+(p.done?"✓":"›")+"</div>";
    html+="</div>";
    if(tags)html+="<div class=\"tgs\">"+tags+"</div>";
    html+="</div>";
  }
  lista.innerHTML=html;
}

function abrirPunto(id){
  var found=null;
  for(var i=0;i<PUNTOS.length;i++){if(PUNTOS[i].id===id){found=PUNTOS[i];break;}}
  PA=found;
  if(!PA)return;
  // Limpiar estado anterior completamente
  FD={1:null,2:null,3:null};
  FB64={1:null,2:null,3:null};
  ACCS=[];
  NOV=null;
  FIRMADO=false;
  resetFotosUI();
  borrarFirma();
  // Resetear novedades UI
  document.getElementById("btn-nov").className="nb";
  document.getElementById("btn-ok").className="nb";
  document.getElementById("acc-sec").style.display="none";
  document.getElementById("acc-lista").innerHTML="";
  document.getElementById("acc-tot").textContent="$0.00";
  // Llenar datos
  document.getElementById("s2t").textContent=PA.n;
  document.getElementById("s2s").textContent="Punto "+PA.num+" de "+PUNTOS.length;
  document.getElementById("s2c").textContent=(PA.cod||"")+(PA.cod?" · ":"")+PA.emp;
  document.getElementById("s2n").textContent=PA.n;
  document.getElementById("s2-badge").textContent=PA.done?"Completado":"Pendiente";
  var now=new Date();
  document.getElementById("s2e").textContent=(PA.tipo==="M"?"Mantenimiento":"Recarga")+" · "+now.toLocaleDateString("es-EC",{day:"numeric",month:"long",year:"numeric"});
  document.getElementById("s2m").textContent=PA.tipo==="M"?"Realizar mantenimiento preventivo-correctivo de extintores en el sitio.":"Retirar extintores para recarga en taller. Dejar provisionales y emitir recibo de constancia.";
  var extSec=document.getElementById("s2es");
  var extDiv=document.getElementById("s2el");
  if(PA.ext&&PA.ext.length>0){
    extSec.style.display="block";
    var eh="<div class=\"ext-h\">"+PA.ext.length+" extintor"+(PA.ext.length>1?"es":"")+"</div>";
    for(var i=0;i<PA.ext.length;i++){
      var e=PA.ext[i];
      eh+="<div class=\"erow\"><span class=\"eloc\">"+e.l+"</span><span class=\"etip\">"+e.t+"</span><span class=\"ew\">"+e.w+"</span><div class=\"eck\" id=\"eck_"+id+"_"+i+"\" onclick=\"toggleExt("+id+","+i+")\"></div></div>";
    }
    extDiv.innerHTML=eh;
  }else{
    extSec.style.display="none";
  }
  document.getElementById("s2cb").style.display=PA.kfc?"block":"none";
  document.getElementById("sfott").textContent=PA.n;
  document.getElementById("sfirt").textContent=PA.n;
  ir("s2");
}

function toggleExt(pid,idx){
  var el=document.getElementById("eck_"+pid+"_"+idx);
  el.classList.toggle("ok");
  el.textContent=el.classList.contains("ok")?"✓":"";
}

function confirmarSin(){
  if(!PA)return;
  if(confirm("¿Marcar «"+PA.n+"» como completado sin certificado?"))completarSin();
}

function completarSin(){
  if(!PA)return;
  for(var i=0;i<PUNTOS.length;i++){
    if(PUNTOS[i].id===PA.id){PUNTOS[i].done=true;break;}
  }
  renderPuntos();
  ir("s1");
}

// ── FOTOS ──
function resetFotosUI(){
  var slots=["fs1","fs2f","fs3f"];
  for(var n=1;n<=3;n++){
    document.getElementById(slots[n-1]).className="fs2"+(n===3?"":" fpend");
    document.getElementById("fn"+n).className="fnum "+(n===3?"fngr":"fnpnd");
    document.getElementById("fn"+n).textContent=n;
    document.getElementById("fb"+n).className="fbg "+(n===3?"fbop":"fbpd");
    document.getElementById("fb"+n).textContent=n===3?"Opcional":"Pendiente";
    var prev=document.getElementById("fp"+n);
    prev.className="fprev";
    document.getElementById("fpc"+n).style.display="";
    var imgs=prev.querySelectorAll("img");
    for(var j=0;j<imgs.length;j++)imgs[j].remove();
    document.getElementById("fi"+n).value="";
  }
  actualizarFotos();
}

function abrirCam(n){
  var inp=document.getElementById("fi"+n);
  inp.setAttribute("capture","environment");
  inp.click();
}

function abrirGal(n){
  var inp=document.getElementById("fi"+n);
  inp.removeAttribute("capture");
  inp.click();
}

function fotoOk(n,input){
  if(!input.files||!input.files[0])return;
  var file=input.files[0];
  var url=URL.createObjectURL(file);
  FD[n]=url;
  var img=new Image();
  img.onload=function(){
    var cvs=document.createElement("canvas");
    var MAX=900,w=img.width,h=img.height;
    if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}
    if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}
    cvs.width=w;cvs.height=h;
    cvs.getContext("2d").drawImage(img,0,0,w,h);
    FB64[n]=cvs.toDataURL("image/jpeg",0.65);
  };
  img.src=url;
  var slots=["fs1","fs2f","fs3f"];
  document.getElementById(slots[n-1]).className="fs2 fok";
  document.getElementById("fn"+n).className="fnum fnok";
  document.getElementById("fn"+n).textContent="✓";
  document.getElementById("fb"+n).className="fbg fbok";
  document.getElementById("fb"+n).textContent="Lista";
  var prev=document.getElementById("fp"+n);
  prev.className="fprev has";
  document.getElementById("fpc"+n).style.display="none";
  var imgEl=document.createElement("img");
  imgEl.src=url;
  prev.insertBefore(imgEl,prev.firstChild);
  actualizarFotos();
}

function actualizarFotos(){
  var c=0;
  for(var n=1;n<=3;n++){if(FD[n])c++;}
  document.getElementById("sfc").textContent=c+"/3";
  document.getElementById("sfpf").style.width=(c/3*100)+"%";
}

function irFirma(){
  var c=0;
  for(var n=1;n<=3;n++){if(FD[n])c++;}
  if(c===0){alert("Necesitas al menos 1 foto para continuar.");return;}
  ir("sfir");
}

// ── FIRMA ──
function initFirma(){
  canvas=document.getElementById("cnv");
  canvas.width=canvas.offsetWidth||336;
  canvas.height=130;
  ctx=canvas.getContext("2d");
  ctx.strokeStyle="#1C1C1A";
  ctx.lineWidth=2.5;
  ctx.lineCap="round";
  ctx.lineJoin="round";
  function gp(e){
    var r=canvas.getBoundingClientRect();
    var sx=canvas.width/r.width,sy=canvas.height/r.height;
    if(e.touches)return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};
    return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};
  }
  canvas.addEventListener("mousedown",function(e){e.preventDefault();drawing=true;var p=gp(e);ctx.beginPath();ctx.moveTo(p.x,p.y);});
  canvas.addEventListener("mousemove",function(e){e.preventDefault();if(!drawing)return;trazado=true;var p=gp(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
  canvas.addEventListener("mouseup",function(){drawing=false;if(trazado)marcarFirmado();});
  canvas.addEventListener("touchstart",function(e){e.preventDefault();drawing=true;var p=gp(e);ctx.beginPath();ctx.moveTo(p.x,p.y);},{passive:false});
  canvas.addEventListener("touchmove",function(e){e.preventDefault();if(!drawing)return;trazado=true;var p=gp(e);ctx.lineTo(p.x,p.y);ctx.stroke();},{passive:false});
  canvas.addEventListener("touchend",function(){drawing=false;if(trazado)marcarFirmado();});
}

function marcarFirmado(){
  document.getElementById("fpw").classList.add("sig");
  document.getElementById("fsub").textContent="Firma registrada ✓";
  FIRMADO=true;
}

function borrarFirma(){
  if(!ctx)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  trazado=false;
  FIRMADO=false;
  document.getElementById("fpw").classList.remove("sig");
  document.getElementById("fsub").textContent="Dibuja la firma con el dedo";
}

// ── NOVEDADES ──
function selNov(v){
  NOV=v;
  document.getElementById("btn-nov").className="nb"+(v==="si"?" sn":"");
  document.getElementById("btn-ok").className="nb"+(v==="no"?" so":"");
  document.getElementById("acc-sec").style.display=v==="si"?"block":"none";
}

function renderAccSel(){
  var h="";
  for(var i=0;i<ACCESORIOS.length;i++){
    var a=ACCESORIOS[i];
    h+="<div class=\"asi\" onclick=\"addAcc('"+a.id+"')\"><div class=\"asn\">"+a.n+"</div><div class=\"asp\">$"+a.p.toFixed(2)+"</div></div>";
  }
  document.getElementById("asel-list").innerHTML=h;
}

function abrirSel(){
  document.getElementById("asel").classList.add("open");
  document.getElementById("ov").classList.add("show");
}

function cerrarSel(){
  document.getElementById("asel").classList.remove("open");
  document.getElementById("ov").classList.remove("show");
}

function addAcc(id){
  var found=null;
  for(var i=0;i<ACCESORIOS.length;i++){if(ACCESORIOS[i].id===id){found=ACCESORIOS[i];break;}}
  if(!found)return;
  ACCS.push({id:found.id,n:found.n,p:found.p,uid:Date.now()+"_"+Math.random()});
  renderAccList();
  cerrarSel();
}

function rmAcc(uid){
  ACCS=ACCS.filter(function(a){return a.uid!==uid;});
  renderAccList();
}

function renderAccList(){
  var h="",tot=0;
  for(var i=0;i<ACCS.length;i++){
    var a=ACCS[i];
    tot+=a.p;
    h+="<div class=\"ait\"><span class=\"anm\">"+a.n+"</span><span class=\"apr\">$"+a.p.toFixed(2)+"</span><span class=\"arm\" onclick=\"rmAcc('"+a.uid+"')\">✕</span></div>";
  }
  document.getElementById("acc-lista").innerHTML=h;
  document.getElementById("acc-tot").textContent="$"+tot.toFixed(2);
}

// ── PDF ──
function generarPDF(){
  if(NOV===null){alert("Por favor indica si hay novedades o no antes de continuar.");return;}
  var fc=0;
  for(var n=1;n<=3;n++){if(FB64[n])fc++;}
  if(fc===0){alert("Necesitas al menos 1 foto para generar el certificado.");return;}
  document.getElementById("lov").classList.add("show");
  setTimeout(function(){
    if(!window.jspdf){
      var s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload=function(){hacerPDF(fc);};
      s.onerror=function(){
        document.getElementById("lov").classList.remove("show");
        alert("Error cargando el generador de PDF. Verifica tu conexión a internet.");
      };
      document.head.appendChild(s);
    }else{
      hacerPDF(fc);
    }
  },200);
}

function hacerPDF(fc){
  try{
    var J=window.jspdf.jsPDF;
    var doc=new J({orientation:"portrait",unit:"mm",format:"a4"});
    var PW=210,PH=297,ML=15,CW=180;
    // Paleta consistente
    var R=[158,18,18];
    var NG=[26,24,28];
    var GR=[88,86,90];
    var BG=[246,246,246];
    function fR(){doc.setFillColor(R[0],R[1],R[2]);}
    function fN(){doc.setFillColor(NG[0],NG[1],NG[2]);}
    function fBG(){doc.setFillColor(BG[0],BG[1],BG[2]);}
    function tR(){doc.setTextColor(R[0],R[1],R[2]);}
    function tN(){doc.setTextColor(NG[0],NG[1],NG[2]);}
    function tG(){doc.setTextColor(GR[0],GR[1],GR[2]);}
    function tW(){doc.setTextColor(255,255,255);}
    function dR(){doc.setDrawColor(R[0],R[1],R[2]);}
    function dL(){doc.setDrawColor(200,198,196);}
    var now=new Date();
    var MES=String(now.getMonth()+1).padStart(2,"0");
    var ANO=now.getFullYear();
    var MA=MES+"/"+ANO,MAS=MES+"/"+(ANO+1);
    CERT_CONTADOR++;
    sessionStorage.setItem("certCount",CERT_CONTADOR);
    var codBase=(PA.cod||PA.n.substring(0,4).toUpperCase()).replace("-","").replace(" ","");
    var CERT_NUM="CERT-"+codBase+"-"+ANO+"-"+String(CERT_CONTADOR).padStart(3,"0");

    function fondoBase(){
      doc.setFillColor(255,255,255);doc.rect(0,0,PW,PH,"F");
      fR();doc.rect(0,0,4,PH,"F");
      fR();doc.rect(0,0,PW,7,"F");
    }

    function piePagina(){
      fN();doc.rect(0,PH-10,PW,10,"F");
      doc.setFont("helvetica","bold");doc.setFontSize(6.8);tW();
      doc.text("DIR: PORTETE #3007 Y GALLEGOS LARA  |  TEL: 04-2374822 · 0978997247 · 09835883325  |  ventas_previfuego@hotmail.com",PW/2,PH-3.8,{align:"center"});
    }

    function bloqueAutorizacion(yy){
      dR();doc.setLineWidth(0.5);doc.line(ML,yy,ML+CW,yy);
      yy+=5;
      doc.setFillColor(253,251,251);
      dR();doc.setLineWidth(0.3);
      doc.rect(ML,yy,CW,22,"FD");
      doc.setFont("helvetica","bold");doc.setFontSize(7.5);tR();
      doc.text("AUTORIZADO POR:",ML+5,yy+6);
      doc.setFont("helvetica","bold");doc.setFontSize(12);tN();
      doc.text("Alejandro Lopez",ML+5,yy+13);
      doc.setFont("helvetica","normal");doc.setFontSize(9);tG();
      doc.text("Jefe de Operaciones  —  Previfuego / Pyroshield",ML+5,yy+18);
      doc.text("RUC: 0952773976001",ML+5,yy+22);
      return yy+28;
    }

    // ── PAG 1 ──
    fondoBase();
    var HBOT=48;
    var y=9;
    // Logo
    var lcdEl=document.getElementById("lcd");
    var b64=lcdEl?lcdEl.getAttribute("data-b64"):"";
    if(b64){try{doc.addImage("data:image/png;base64,"+b64,"PNG",ML,y,24,24);}catch(e){}}
    // Cert num
    doc.setFont("helvetica","bold");doc.setFontSize(7);tR();
    doc.text(CERT_NUM,PW-5,12,{align:"right"});
    // PREVIFUEGO
    var HX=ML+28;
    var HW=PW-5-HX;
    doc.setFont("helvetica","bold");doc.setFontSize(22);tR();
    var pW=doc.getTextWidth("PREVIFUEGO");
    doc.text("PREVIFUEGO",HX+(HW-pW)/2,y+9);
    dR();doc.setLineWidth(0.5);
    doc.line(HX+(HW-pW)/2,y+11,HX+(HW-pW)/2+pW,y+11);
    doc.setFont("helvetica","bold");doc.setFontSize(8.5);tN();
    var sW=doc.getTextWidth("SEGURIDAD INDUSTRIAL Y CONTRA INCENDIOS");
    doc.text("SEGURIDAD INDUSTRIAL Y CONTRA INCENDIOS",HX+(HW-sW)/2,y+16);
    doc.setFont("helvetica","normal");doc.setFontSize(6.2);tG();
    var iL=[
      "RUC.: 0952773976001  |  ASESORAMIENTO · RECARGA · MANTENIMIENTO · VENTAS",
      "PQS (ABC) · GAS CARBONICO · HALOTRON",
      "DISENO E INSTALACION DE RED HIDRAULICA CONTRA INCENDIOS",
      "SISTEMAS DE CO2 PARA COCINAS, GENERADORES, TRANSFORMADORES, ETC",
      "INSTALACION DE LAMPARAS DE EMERGENCIA Y DETECTORES DE HUMO"
    ];
    for(var i=0;i<iL.length;i++){
      var lw=doc.getTextWidth(iL[i]);
      doc.text(iL[i],HX+(HW-lw)/2,y+20+i*3.4);
    }
    // Separador
    y=HBOT;
    dR();doc.setLineWidth(0.9);doc.line(ML,y,PW-ML,y);
    dL();doc.setLineWidth(0.3);doc.line(ML,y+1.8,PW-ML,y+1.8);
    y+=8;
    // Título
    doc.setFont("helvetica","bold");doc.setFontSize(13);tN();
    var tits=["CERTIFICADO DE INSPECCION Y MANTENIMIENTO DE","EXTINTORES PORTATILES"];
    for(var i=0;i<tits.length;i++){
      var tw=doc.getTextWidth(tits[i]);
      var tx=ML+(CW-tw)/2;
      doc.text(tits[i],tx,y);
      dR();doc.setLineWidth(0.35);doc.line(tx,y+1.2,tx+tw,y+1.2);
      y+=7.5;
    }
    y+=4;
    // Recuadro garantía
    doc.setFillColor(247,247,247);
    dL();doc.setLineWidth(0.4);doc.rect(ML,y-3,CW,7.5,"FD");
    doc.setFont("helvetica","bold");doc.setFontSize(8);tG();
    doc.text("MEDIANTE EL PRESENTE, SE GARANTIZA EL TRABAJO REALIZADO BAJO EL SIGUIENTE DETALLE:",ML+3,y+1.5);
    y+=11;
    // Párrafo principal
    var cod2=(PA.cod||"").replace("-","").replace(" ","");
    var ptxt="INSPECCION Y MANTENIMIENTO DE EXTINTORES PORTATILES UBICADOS EN LOS DISTINTOS PUNTOS ESTRATEGICOS DEL LOCAL "+cod2+" PERTENECIENTE A LA EMPRESA "+PA.emp+", UBICADO EN "+PA.dir+", SIGUIENDO LAS NORMAS NFPA10.";
    doc.setFont("helvetica","normal");doc.setFontSize(9);tN();
    var ptxtL=doc.splitTextToSize(ptxt,CW);
    for(var i=0;i<ptxtL.length;i++){doc.text(ptxtL[i],ML,y);y+=4.8;}
    y+=5;
    // COMPRENDE
    fR();doc.rect(ML,y-3.5,CW,7.5,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(9.5);tW();
    doc.text("COMPRENDE:",ML+4,y+0.8);
    y+=7;
    doc.setFont("helvetica","normal");doc.setFontSize(9);tN();
    var items=[
      "REVISION INTEGRAL DE LOS CILINDROS",
      "INSPECCION DE CABEZALES",
      "INSPECCION DE CORNETAS / MANGUERAS",
      "PESAJE / TARA",
      "MANTENIMIENTO PREVENTIVO-CORRECTIVO",
      "RECARGA DEL AGENTE"
    ];
    for(var i=0;i<items.length;i++){
      fR();doc.rect(ML+3,y-2.2,2.2,2.2,"F");
      tN();doc.text(items[i],ML+8,y);
      y+=5.5;
    }
    y+=5;
    // Tabla extintores
    var gmap={};
    for(var i=0;i<PA.ext.length;i++){
      var e=PA.ext[i];
      var k=e.w+"|"+e.t;
      if(!gmap[k])gmap[k]={cnt:0,cap:e.w.toUpperCase(),tip:e.t.toUpperCase()};
      gmap[k].cnt++;
    }
    var grps=Object.values(gmap);
    var cws=[18,36,28,50,48],cxs=[ML];
    for(var i=1;i<cws.length;i++)cxs.push(cxs[i-1]+cws[i-1]);
    var rH=9,tRows=grps.length;
    // Header negro
    fN();doc.rect(ML,y,CW,rH,"F");
    doc.setDrawColor(60,58,62);doc.setLineWidth(0.2);
    var vx=ML;
    for(var i=0;i<cws.length;i++){vx+=cws[i];if(vx<ML+CW)doc.line(vx,y,vx,y+rH);}
    doc.setFont("helvetica","bold");doc.setFontSize(8.5);tW();
    var heads=["CANT.","CAPACIDAD","TIPO","ULTIMO MANT.","PROXIMO MANT."];
    for(var i=0;i<heads.length;i++){
      doc.text(heads[i],cxs[i]+cws[i]/2,y+rH-2.8,{align:"center",maxWidth:cws[i]-2});
    }
    y+=rH;
    // Filas
    for(var r=0;r<tRows;r++){
      var ry=y+r*rH;
      if(r%2===0){doc.setFillColor(255,255,255);}else{fBG();}
      doc.rect(ML,ry,CW,rH,"F");
      dL();doc.setLineWidth(0.2);doc.line(ML,ry+rH,ML+CW,ry+rH);
      var vx2=ML;
      for(var i=0;i<cws.length;i++){vx2+=cws[i];if(vx2<ML+CW)doc.line(vx2,ry,vx2,ry+rH);}
      var g=grps[r];
      doc.setFont("helvetica","bold");doc.setFontSize(10);tN();
      doc.text(String(g.cnt),cxs[0]+cws[0]/2,ry+rH-2.8,{align:"center"});
      doc.text(g.cap,cxs[1]+cws[1]/2,ry+rH-2.8,{align:"center"});
      tR();
      doc.text(g.tip,cxs[2]+cws[2]/2,ry+rH-2.8,{align:"center"});
      doc.text(MA,cxs[3]+cws[3]/2,ry+rH-2.8,{align:"center"});
      doc.text(MAS,cxs[4]+cws[4]/2,ry+rH-2.8,{align:"center"});
    }
    dR();doc.setLineWidth(0.5);doc.rect(ML,y-rH,CW,rH*(tRows+1),"S");
    y+=tRows*rH+8;
    // Párrafo garantía
    doc.setFont("helvetica","normal");doc.setFontSize(8.8);tN();
    var gar="Los extintores detallados se encuentran operativos de acuerdo con la norma NFPA10 y normativa ecuatoriana vigente. Cada extintor cuenta con sus respectivos precintos y seguros metalicos, etiqueta de control de carga, accesorios en buen estado y agente extintor en optimas condiciones, garantizando su funcionamiento con vigencia de un (1) año a partir de su ultimo mantenimiento.";
    var garL=doc.splitTextToSize(gar,CW);
    for(var i=0;i<garL.length;i++){doc.text(garL[i],ML,y);y+=4.6;}
    y+=8;
    bloqueAutorizacion(y);
    piePagina();

    // ── PAG 2 ──
    doc.addPage();
    fondoBase();
    var codEv=(PA.cod||PA.n.substring(0,4).toUpperCase()).replace("-","").replace(" ","");
    doc.setFont("helvetica","bold");doc.setFontSize(11);tN();
    var evTit="EVIDENCIA FOTOGRAFICA — "+codEv;
    var evW=doc.getTextWidth(evTit);
    doc.text(evTit,PW/2,17,{align:"center"});
    var lineLen=(CW-evW-10)/2;
    dR();doc.setLineWidth(0.9);
    doc.line(ML,19,ML+lineLen,19);
    doc.line(PW-ML-lineLen,19,PW-ML,19);
    dL();doc.setLineWidth(0.3);doc.line(ML,20.5,PW-ML,20.5);
    var p2y=25;
    // Fotos
    var fotosArr=[FB64[1],FB64[2],FB64[3]];
    var fv=[],etiqU=[];
    var etiq=["ANTES","DESPUES","CILINDRO CO2"];
    for(var i=0;i<fotosArr.length;i++){
      if(fotosArr[i]){fv.push(fotosArr[i]);etiqU.push(etiq[i]);}
    }
    if(fv.length>0){
      var maxFW=fv.length===1?90:CW;
      var fw=(maxFW-(fv.length-1)*5)/fv.length;
      var fh=fw*0.75;
      var totalW=fv.length*fw+(fv.length-1)*5;
      var fStartX=ML+(CW-totalW)/2;
      var fy=p2y;
      for(var i=0;i<fv.length;i++){
        try{
          var fx=fStartX+i*(fw+5);
          doc.setFillColor(200,200,200);doc.rect(fx+1.5,fy+1.5,fw,fh,"F");
          fR();doc.rect(fx-1,fy-1,fw+2,fh+2,"F");
          doc.addImage(fv[i],"JPEG",fx,fy,fw,fh);
          fR();doc.rect(fx,fy+fh-7,fw,7,"F");
          doc.setFont("helvetica","bold");doc.setFontSize(7);tW();
          doc.text(etiqU[i]||"",fx+fw/2,fy+fh-2.5,{align:"center"});
        }catch(e){}
      }
      p2y=fy+fh+10;
    }
    // Firma
    if(FIRMADO&&canvas){
      try{
        var sigData=canvas.toDataURL("image/png");
        dR();doc.setLineWidth(0.5);doc.line(ML,p2y,ML+CW,p2y);p2y+=6;
        doc.setFont("helvetica","bold");doc.setFontSize(8.5);tR();
        doc.text("FIRMA DEL ENCARGADO:",ML,p2y);p2y+=5;
        doc.setFillColor(251,251,251);
        dL();doc.setLineWidth(0.4);doc.rect(ML,p2y,82,26,"FD");
        doc.addImage(sigData,"PNG",ML+1,p2y+1,80,24);
        p2y+=28;
        doc.setFont("helvetica","normal");doc.setFontSize(8.5);tN();
        doc.text("Encargado del local — "+PA.n,ML,p2y);
        p2y+=12;
      }catch(e){p2y+=5;}
    }
    // Accesorios SIN precios
    if(ACCS.length>0){
      dR();doc.setLineWidth(0.5);doc.line(ML,p2y,ML+CW,p2y);p2y+=6;
      doc.setFont("helvetica","bold");doc.setFontSize(8.5);tR();
      doc.text("ACCESORIOS UTILIZADOS:",ML,p2y);p2y+=6;
      fN();doc.rect(ML,p2y,CW,7.5,"F");
      doc.setFont("helvetica","bold");doc.setFontSize(8.5);tW();
      doc.text("DESCRIPCION DEL ACCESORIO",ML+5,p2y+5);
      p2y+=7.5;
      for(var i=0;i<ACCS.length;i++){
        var ac=ACCS[i];
        if(i%2===0){doc.setFillColor(255,255,255);}else{fBG();}
        doc.rect(ML,p2y,CW,7,"F");
        dL();doc.setLineWidth(0.2);doc.line(ML,p2y+7,ML+CW,p2y+7);
        doc.setFont("helvetica","normal");doc.setFontSize(9);tN();
        doc.text(ac.n,ML+5,p2y+4.8);
        p2y+=7;
      }
      dR();doc.setLineWidth(0.4);
      doc.rect(ML,p2y-ACCS.length*7-7.5,CW,ACCS.length*7+7.5,"S");
      p2y+=12;
    }
    bloqueAutorizacion(p2y);
    piePagina();

    // ── GENERAR Y DESCARGAR ──
    var cf=(PA.cod||PA.n.substring(0,4).toUpperCase()).replace("-","").replace(" ","");
    var nom=cf+"-MANTT DE EXTINTORES - "+ANO+".pdf";
    var blob=doc.output("blob");
    var url=URL.createObjectURL(blob);
    URLS_GENERADAS.push(url);
    // Limpiar URLs viejas si hay más de 10
    if(URLS_GENERADAS.length>10){
      URL.revokeObjectURL(URLS_GENERADAS.shift());
    }
    document.getElementById("lov").classList.remove("show");
    // Marcar punto como completado
    for(var i=0;i<PUNTOS.length;i++){
      if(PUNTOS[i].id===PA.id){PUNTOS[i].done=true;break;}
    }
    renderPuntos();
    var hora=new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});
    var fecha=new Date().toLocaleDateString("es-EC",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    document.getElementById("senv-s").textContent=PA.cod||PA.n;
    document.getElementById("senv-hr").textContent=hora+" — "+fecha;
    document.getElementById("senv-sub").textContent="PDF listo para descargar";
    document.getElementById("st-e").textContent=PA.ext.length||"—";
    document.getElementById("st-f").textContent=fc;
    document.getElementById("st-a").textContent=ACCS.length;
    document.getElementById("senv-pdf").textContent=nom;
    var dl=document.getElementById("senv-dl");
    dl.href=url;
    dl.download=nom;
    dl.textContent="⬇ Descargar: "+nom;
    // Nota accesorios con total e IVA (solo en pantalla, no en PDF)
    if(ACCS.length>0){
      var tot=0;
      for(var i=0;i<ACCS.length;i++)tot+=ACCS[i].p;
      var iva=tot*0.15;
      document.getElementById("nota-c").style.display="block";
      document.getElementById("nota-m").textContent="Subtotal $"+tot.toFixed(2)+" + IVA $"+iva.toFixed(2)+" = $"+(tot+iva).toFixed(2);
    }else{
      document.getElementById("nota-c").style.display="none";
    }
    // Siguiente punto
    var sig=null;
    for(var i=0;i<PUNTOS.length;i++){if(!PUNTOS[i].done){sig=PUNTOS[i];break;}}
    var sc=document.getElementById("sig-c");
    if(sig){
      sc.innerHTML="<div class=\"sgn\">"+sig.num+"</div><div><div class=\"sgnm\">"+sig.n+"</div><div class=\"sgm\">"+(sig.tipo==="M"?"Mantenimiento":"Recarga")+(sig.kfc?" · Grupo KFC":" · Cliente")+"</div></div>";
    }else{
      sc.innerHTML="<div style=\"font-size:15px;color:var(--v);font-weight:700\">¡Recorrido completado!</div>";
    }
    // Historial
    HISTORIAL.unshift({punto:PA,hora:hora,fotos:fc,accs:ACCS.length,url:url,nombre:nom,certNum:CERT_NUM});
    renderHistorial();
    // Enviar a Google Sheets
    if(ACCS.length>0){
      var payload={
        fecha:new Date().toLocaleDateString("es-EC"),
        hora:hora,
        cliente:PA.n,
        codigo:PA.cod||"",
        empresa:PA.emp,
        certificado:CERT_NUM,
        accesorios:ACCS.map(function(a){return{nombre:a.n,precio:a.p};})
      };
      fetch("https://script.google.com/macros/s/AKfycbypW0EMJMzjmnQ2STJI9nZY1tZr2J0f7KS6iLDiQ--mu4grdACTdpdF3hYOy_m9zw3dfg/exec",{
        method:"POST",
        body:JSON.stringify(payload)
      }).catch(function(err){console.warn("Google Sheets:",err);});
    }
    ir("senv");
    // Descarga automática — solo en Android, iOS la bloquea
    try{dl.click();}catch(e){}
  }catch(err){
    document.getElementById("lov").classList.remove("show");
    console.error(err);
    alert("Error generando el PDF: "+err.message);
  }
}

// ── HISTORIAL ──
function renderHistorial(){
  var lista=document.getElementById("hist-l");
  if(HISTORIAL.length===0){
    lista.innerHTML="<div class=\"empty\">Aún no hay certificados hoy</div>";
    return;
  }
  var h="<div class=\"slbl\">Hoy</div>";
  for(var i=0;i<HISTORIAL.length;i++){
    var hi=HISTORIAL[i];
    h+="<div class=\"cd\">";
    h+="<div style=\"padding:13px 14px;display:flex;align-items:center;gap:12px\">";
    h+="<div style=\"width:36px;height:36px;border-radius:11px;background:var(--rc);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;color:var(--r);font-weight:700\">PDF</div>";
    h+="<div style=\"flex:1\"><div style=\"font-size:15px;font-weight:700\">"+hi.punto.n+"</div>";
    h+="<div style=\"font-size:12px;color:var(--g3);margin-top:2px\">"+hi.hora+" · "+hi.fotos+" foto(s)"+(hi.accs>0?" · "+hi.accs+" accesorio(s)":"")+"</div></div>";
    h+="<a href=\""+hi.url+"\" download=\""+hi.nombre+"\" style=\"font-size:10px;font-weight:700;background:var(--ac);color:var(--a);padding:4px 8px;border-radius:10px;text-decoration:none\">⬇ PDF</a>";
    h+="</div></div>";
  }
  lista.innerHTML=h;
}

function irSig(){
  var sig=null;
  for(var i=0;i<PUNTOS.length;i++){if(!PUNTOS[i].done){sig=PUNTOS[i];break;}}
  if(sig)abrirPunto(sig.id);
  else ir("s1");
}

// ── INIT ──
window.onload=function(){
  initLogos();
  initFecha();
  renderPuntos();
  initFirma();
  renderAccSel();
};
