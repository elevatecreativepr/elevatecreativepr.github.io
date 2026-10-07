/* Elevate Creative — service worker de la PWA.
   Estrategia: sirve la copia guardada al instante y actualiza en segundo plano,
   así la app abre rápido y sigue funcionando sin internet. */
const CACHE = 'elevate-pwa-v1';
const CORE = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
  'assets/logo-lockup.png',
  'assets/logo-icon.jpg',
  'assets/equipo-angel.jpg',
  'assets/equipo-joshua.jpg',
  'assets/equipo-jonathan.jpg',
  'assets/foto-accion.jpg',
  'assets/foto-mascota.jpg',
  'assets/foto-banquillo.jpg',
  'assets/hero-bg.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => {
      const refresh = fetch(event.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || refresh;
    })
  );
});
