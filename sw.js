const CACHE = 'fitlog-v6';
const ASSETS = ['./','./index.html','./styles.css','./manifest.webmanifest','./icon.svg','./src/app.js','./src/core.mjs','./src/exercises.mjs'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('openfoodfacts.org')) return; // keep nutrition database live/network-first
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
