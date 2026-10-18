const CACHE_NAME = 'vis-shell-v6';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './css/styles.css',
  './js/supabase-config.js',
  './js/db.js',
  './js/common.js',
  './js/extended.js',
  './js/public.js',
  './js/program.js',
  './js/pwa.js',
  './js/auth.js',
  './js/login.js',
  './assets/institute-logo.jpg',
  './manifest.webmanifest',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    const shellPage = ['index.html', 'login.html'].includes(url.pathname.split('/').pop());
    if (!shellPage) {
      event.respondWith(fetch(request));
      return;
    }
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
