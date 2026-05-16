
const CACHE = 'travel-helper-v1';
const ASSETS = ['./index.html','./styles.css','./src/app.js','./src/travel-core.mjs','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith('travel-helper-')).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => { const url = new URL(event.request.url); if (url.origin !== location.origin) return; event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request))); });
