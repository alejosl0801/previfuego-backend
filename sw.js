// PREVIFUEGO FIELD — Service Worker v1.0
// #011 FIX: soporte offline básico
const CACHE_VERSION = '5.3'; // v5.3 — proformas solo desde portal PyroShield, sin botón crear en Field
const CACHE_NAME = 'previfuego-v' + CACHE_VERSION;
// #11 #12 FIX: no cachear script.google.com, no incluir iconos que no existen
const ASSETS = [
  '/previfuego-backend/',
  '/previfuego-backend/index.html',
  '/previfuego-backend/app.js',
  '/previfuego-backend/clientes.js',
  '/previfuego-backend/pdf.js',
  '/previfuego-backend/nota.js',
  '/previfuego-backend/crm.js',
  '/previfuego-backend/dashboard.js',
  '/previfuego-backend/retiros.js',
  '/previfuego-backend/extras.js',
  '/previfuego-backend/mejoras2.js',
  '/previfuego-backend/coordinator.js',
  '/previfuego-backend/logo.js',
  '/previfuego-backend/style.css',
  '/previfuego-backend/inteligencia.js',
  '/previfuego-backend/proforma.js',
  '/previfuego-backend/manifest.json',
  '/previfuego-backend/icon-192.png',
  '/previfuego-backend/icon-512.png'
  // Nota: script.google.com NUNCA debe cachearse (es la API de Apps Script)
];

// Instalar: cachear todos los assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).catch(function(err) {
      console.warn('SW install error:', err);
    })
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first para assets estáticos, network-first para API
self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  
  // API calls: siempre red, sin caché
  if (url.indexOf('script.google.com') !== -1) {
    event.respondWith(fetch(event.request).catch(function() {
      return new Response(JSON.stringify({ok:false, msg:'Sin conexión'}), {
        headers: {'Content-Type': 'application/json'}
      });
    }));
    return;
  }

  // Assets: cache-first
  // #112 FIX: stale-while-revalidate para JS/CSS — sirve caché y actualiza en background
  // #43 FIX: ignoreSearch:true para que los scripts versionados (?v=N) hagan match en caché
  var isJSorCSS = /\.(js|css)(\?.*)?$/.test(url);
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function(cached) {
      var fetchPromise = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function() {
        // #167 FIX: solo usar fallback HTML para requests de navegación, no para API
      if (event.request.mode === "navigate") return caches.match('/previfuego-backend/index.html');
      return new Response("", { status: 503 });
      });
      // Para JS/CSS: servir caché inmediatamente y actualizar en background
      return (cached && isJSorCSS) ? cached : (fetchPromise.catch(function(){ return cached; }));
    })
  );
});

// ── F4: NOTIFICACIONES PUSH ───────────────────────────────────
self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) { data = { title: 'Previfuego', body: event.data ? event.data.text() : 'Nueva notificación' }; }
  var title   = data.title || 'Previfuego Field';
  var options = {
    body:    data.body    || 'Tienes una notificación',
    icon:    '/previfuego-backend/icon-192.png',
    badge:   '/previfuego-backend/icon-192.png',
    tag:     data.tag     || 'previfuego-notif',
    data:    data.url     || '/previfuego-backend/',
    vibrate: [200, 100, 200],
    actions: data.actions || []
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = event.notification.data || '/previfuego-backend/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(cls) {
      for (var i = 0; i < cls.length; i++) {
        if (cls[i].url.indexOf('previfuego-backend') !== -1 && 'focus' in cls[i]) {
          return cls[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
