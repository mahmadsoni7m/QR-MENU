/**
 * service-worker.js
 * ---------------------------------------------------------
 * Кэши оддии "app shell" барои дидани меню offline.
 * ФИРИСТОДАНИ ФАРМОИШ ҳамеша интернет талаб мекунад, зеро огоҳиномаи
 * Telegram танҳо тавассути шабака кор мекунад — ин файл онро intercept
 * намекунад (дархостҳо ба Worker cross-origin ҳастанд).
 * ---------------------------------------------------------
 */
const CACHE_VERSION = 'qr-menu-v1';
const CORE_ASSETS = [
  './',
  'index.html',
  'qr.html',
  'success.html',
  'manifest.json',
  'css/style.css',
  'js/config.js',
  'js/cart.js',
  'js/menu.js',
  'js/app.js',
  'js/qr.js',
  'data/menu.js',
  'assets/images/favicon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Танҳо GET ва фақат дархостҳои ҳамон origin-ро кэш мекунем.
  // Дархостҳо ба Cloudflare Worker (фармоиш) ба origin-и дигар мераванд ва
  // ин ҷо ҳеҷ гоҳ intercept намешаванд.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  if (req.mode === 'navigate') {
    // Network-first барои саҳифаҳо, то ҳамеша нусхаи охирин нишон дода шавад,
    // вале агар offline бошад — аз кэш баргардонида мешавад.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('index.html')))
    );
    return;
  }

  // Cache-first барои дигар static assets (css/js/icons)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached);
    })
  );
});
