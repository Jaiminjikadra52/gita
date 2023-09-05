// Service Worker installation
self.addEventListener('install', function(event) {
    event.waitUntil(caches.open('gitaji').then(function(cache) {
        return cache.addAll(['/', '/index.html', '/adhayay.html', '/style.css', '/script.js', '/favicon.ico', ]);
    }));
});

// Service Worker activation
self.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function(cacheNames) {
        return Promise.all(cacheNames.filter(function(cacheName) {
            // Clean up any outdated caches
            return cacheName !== 'gitaji';
        }).map(function(cacheName) {
            return caches.delete(cacheName);
        }));
    }));
});

// Intercept fetch requests
self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
        // Serve the cached response if available
        if (response) {
            return response;
        }

        // If the request is not cached, fetch it from the network
        return fetch(event.request);
    }));
});

const CACHE_NAME = 'gitaji';
const urlsToCache = [
    '/', 
    '/index.html', 
    '/adhayay.html', 
    '/style.css', 
    '/script.js', 
    '/logo.png', 
    '/audio.mp3', 
    '/favicon.ico', 
    '/knockout-3.5.1.js'
];

self.addEventListener('install', 
    event => {
        event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache)));
    }
);

self.addEventListener('fetch', event=>{
    event.respondWith(caches.match(event.request).then(response=>{
        // Cache hit - return response
        if (response) {
            return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response=>{
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME).then(cache=>{
                cache.put(event.request, responseToCache);
            }
            );

            return response;
        }
        ).catch(error=>{
            // Network request failed, return a fallback response
            return new Response('Network request failed. You are offline.');
        }
        );
    }
    ));
}
);

self.addEventListener('activate', event=>{
    event.waitUntil(caches.keys().then(cacheNames=>{
        return Promise.all(cacheNames.filter(cacheName=>{
            // Delete outdated caches
            return cacheName !== CACHE_NAME;
        }
        ).map(cacheName=>{
            return caches.delete(cacheName);
        }
        ));
    }
    ));
}
);
