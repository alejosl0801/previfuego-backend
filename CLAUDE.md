# CLAUDE.md — Previfuego Field

## Qué es
PWA single-file (HTML/JS/CSS) para operaciones de campo de Previfuego (mantenimiento
y recarga de extintores, Guayaquil). Hospedada en GitHub Pages. Backend en Google
Apps Script + Google Sheet. La usan: Alejandro (admin), Raúl y Juan (técnicos de
campo, Android), Fabiola (administración / solo taller).

## Infraestructura
- GitHub Pages: https://alejosl0801.github.io/previfuego-backend/
- Backend Apps Script (SCRIPT_URL activa):
  https://script.google.com/macros/s/AKfycbwiIAupZxy2T33EiDHbwkLBHTw0Q2Uv98r8pc9L351b6lXwY_mOD6kI2tvfzqdIUdxG/exec
- Sheet ID: 1H3OQmaJtqVWHqVrI_hX2h8ZL_-a6RRobQww7IuGMhp0
- Credenciales: ver con Alejandro (no versionar)
- Usuarios: alejandro (admin), raul/juan (técnicos), fabiola (soloTaller)

> Nota de seguridad: token y contraseña viven en el código cliente (PWA pública en
> GitHub Pages), por lo que ya son visibles. Si se requiere seguridad real, mover la
> validación al backend y rotar credenciales.

## Estructura de archivos
- index.html — 12 pantallas; carga todos los scripts con ?v=N (cache-busting)
- app.js — núcleo (~2900 líneas): login, recorrido, pizarra, taller, tareas, fotos, firma
- clientes.js — catálogo de locales (datos fiscales + campo `mes`). 346 locales
- Code.gs — backend Apps Script. NO está en el repo de Pages para ejecución; vive en
  Apps Script (el archivo del repo es la copia fuente; al cambiarlo hay que RE-DESPLEGAR)
- coordinator.js — coordina pantalla de firma y los PF_TAB_HANDLERS
- crm.js, dashboard.js, inteligencia.js — paneles admin (CRM, dashboard, calendario)
- mejoras2.js — semáforo de mantenimiento/recarga (pfRenderSemaforo, pfProximoMantenimiento)
- nota.js — nota de entrega (PDF)
- pdf.js — certificado de mantenimiento (PDF, solo Grupo KFC)
- proforma.js — proformas de PyroShield (catálogo, PDF, recorrido)
- retiros.js — retiros de extintores al taller
- extras.js — marca de agua en fotos, firma con GPS, backup local
- logo.js — LOGO_B64 (Previfuego, bombero rojo) + PYS_LOGO_B64 (PyroShield, bombero amarillo)
- style.css, manifest.json, sw.js (service worker), icon-192.png, icon-512.png

## Reglas de negocio CRÍTICAS
- Grupo KFC + Sushicorp (razón "SUSHICORP") + Casa Res (razón "SHEMLON", códigos R):
  mantenimiento ANUAL, recarga cada 3 AÑOS.
- Ciclo recarga KFC: Oct2024–Sep2025 → próxima Oct2026–Sep2027.
- Casa Res: ciclo en MAYO (R003/R008/R010 → May2026; R004 → May2025).
- Semáforos SEPARADOS: tab Mantenimiento y tab Recarga.
- Certificados (pdf.js) solo se generan para Grupo KFC.
- Formato certificado: CERT-COD-AÑO-NNN. PDF: "COD-MANT DE EXTINTORES - AÑO.pdf".
- Colores marca: rojo R[158,18,18], negro [26,24,28], gris [88,86,90].

### Mes de mantenimiento/recarga es POR EXTINTOR (no por cliente)
El mes es por **extintor**, no por local. La hoja **EXTINTORES** del Sheet tiene los
**1617 extintores** con su mes individual, así que **un local puede aparecer en varios
meses** (ej. SOCELEC: feb/may/ago). El modelo viejo "un mes por local" (campo `mes` en
clientes.js) es la fuente de respaldo; el modelo por extintor se sirve desde el backend
(ver endpoints abajo).

### Sistema CO2 fijo
Un local **TIENE sistema CO2 fijo** si tiene al menos un extintor **CO2 de capacidad
EXACTAMENTE 50, 75 o 100 lbs**. Los CO2 de **5, 10 o 20 lbs son portátiles** y NO
cuentan como sistema. Un local puede tener 2 o más cilindros grandes, pero sigue siendo
**UN solo sistema**: se reporta el número de cilindros (`numCilindrosCO2`), no se cuentan
como sistemas separados. Implementado en `getExtintores` (Code.gs): campos calculados
`tieneSistemaCO2` (boolean) y `numCilindrosCO2` (number).

## Backend (Apps Script) — hoja EXTINTORES y endpoints
Hoja **EXTINTORES**, columnas:
`MES | NOMBRE DEL LOCAL | UBICACIÓN EN EL LOCAL | TIPO | CAPACIDAD | TRABAJO (M/R) | AÑO RECARGA | PRECIO`
Los KFC tienen ubicación real; los independientes dicen "SIN UBICACIÓN".

Endpoints GET (solo lectura, sin token):
- `?accion=extintores_mes&mes=MAYO` → `getExtintoresPorMes(mes)` → `{ok, mes, total, extintores[]}`
- `?accion=extintores_local&nombre=KFC URDESA` → `getExtintores(nombreLocal)` →
  `{ok, local, exacto, total, tieneSistemaCO2, numCilindrosCO2, extintores[]}`
- `?accion=recorrido_texto&fecha=dd/MM/yyyy` → recorrido publicado (con fallback al más
  reciente y `exacto:false` si no hay match de fecha)

## Validación obligatoria antes de commit
- `node --check <archivo>.js` en cada archivo tocado (Code.gs: validar copiándolo a `.js`).
- ESLint `no-undef` sobre el bundle (clientes, logo, app, pdf, nota, retiros, dashboard,
  extras, mejoras2, crm, inteligencia, proforma, coordinator). Debe quedar en 0. Los
  globales asignados a `window.X = function(){}` deben referenciarse con `window.X` para
  evitar falsos positivos de no-undef.
- CRÍTICO: `node --check` NO detecta un `}` mal puesto que cuadra globalmente. Usar acorn
  para contar funciones top-level de app.js: si baja de ~130 a ~15, hay un `}` faltante
  que está atrapando funciones dentro de otra (rompe toda la app).

## Despliegue
1. Commit/push a GitHub (Pages publica solo el frontend).
2. Code.gs: pegar en Apps Script y RE-DESPLEGAR (Implementar → Administrar
   implementaciones → Nueva versión). Guardar con Ctrl+S NO basta.
3. Al cambiar archivos, subir el número `?v=N` en index.html Y `CACHE_VERSION` en sw.js
   (deben coincidir) para invalidar caché en los celulares. Versión actual: 5.0.

## Estilo de trabajo esperado
- Validar siempre (node --check + ESLint + acorn) antes de dar algo por terminado.
- No inventar datos de clientes/extintores; si faltan, preguntar.
- No meter features grandes a presión; preferir cambios incrementales y probados.
- Reproducir el bug antes de arreglarlo y verificar el después cuando se pueda.
