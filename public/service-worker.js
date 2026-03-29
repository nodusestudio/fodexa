/* Fodexa Service Worker */
const CACHE_NAME = 'fodexa-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache abierto');
      return cache.addAll(URLS_TO_CACHE).catch((error) => {
        console.log('Error al cachear archivos:', error);
        // Continuar incluso si algunos archivos fallan
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activándose...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar solicitudes
self.addEventListener('fetch', (event) => {
  // Solo cache para GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retornar del cache si existe
      if (response) {
        return response;
      }

      // Si no está en cache, hacer fetch
      return fetch(event.request)
        .then((response) => {
          // No cachear si no es una respuesta válida
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          // Cachear para futuras solicitudes (excepto URLs específicas)
          if (!event.request.url.includes('/api/') && !event.request.url.includes('firebase')) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch((error) => {
          console.log('Error en fetch:', error);
          // Retornar una página offline si está disponible
          return caches.match('/index.html');
        });
    })
  );
});

// Sincronización en background (opcional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí puedes sincronizar datos con Firebase
      Promise.resolve()
    );
  }
});

// Notificaciones push (opcional)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva notificación de Fodexa',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'fodexa-notification',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Fodexa', options)
  );
});
