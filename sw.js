self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('static-v1').then(cache => {
            return cache.addAll([
                '/', './src/master.css', './images/logo-192x192.png'
                
            ])
        })
    )
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});


// self.addEventListener('activate', e => {
//     console.log('Service worker activating');
// });
