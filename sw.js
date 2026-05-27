// PREVIFUEGO FIELD — Service Worker v1.0
// #011 FIX: soporte offline básico
const CACHE_NAME = 'previfuego-v3.4';
const ASSETS = [
  '/previfuego-backend/',
  '/previfuego-backend/index.html',
  '/previfuego-backend/app.js',
  '/previfuego-backend/clientes.js',
  '/previfuego-backend/pdf.js',
  '/previfuego-backend/nota.js',
  '/previfuego-backend/crm.js',
  '/previfuego-backend/inteligencia.js',
  '/previfuego-backend/dashboard.js',
  '/previfuego-backend/retiros.js',
  '/previfuego-backend/extras.js',
  '/previfuego-backend/mejoras2.js',
  '/previfuego-backend/coordinator.js',
  '/previfuego-backend/logo.js',
  '/previfuego-backend/style.css',
  '/previfuego-backend/manifest.json'
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
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Guardar en caché si es exitoso
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline y no está en caché — devolver index.html como fallback
        return caches.match('/previfuego-backend/index.html');
      });
    })
  );
});
