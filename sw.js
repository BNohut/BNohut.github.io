const CACHE_NAME = 'feedback-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo.png',
  '/images/happy.png',
  '/images/smile.png',
  '/images/exp.png',
  '/images/sad-blue.png',
  '/images/sad.png',
  'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900',
  'https://cdn.jsdelivr.net/npm/vuetify@3.8.2/dist/vuetify.min.css',
  'https://js.pusher.com/8.4.0/pusher.min.js',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdn.jsdelivr.net/npm/vuetify@3.8.2/dist/vuetify.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
}); 