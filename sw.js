const CACHE_NAME = "nethunter-iptv-v1";

const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./channels.json",
    "./manifest.json"
];

// Install
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS))
    );

    self.skipWaiting();

});

// Activate
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys => {

            return Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }

                })

            );

        })
    );

    self.clients.claim();

});

// Fetch
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request)

        .then(response => {

            if (response) {
                return response;
            }

            return fetch(event.request)

            .then(networkResponse => {

                const cloned =
                networkResponse.clone();

                caches.open(CACHE_NAME)

                .then(cache => {

                    cache.put(
                        event.request,
                        cloned
                    );

                });

                return networkResponse;

            })

            .catch(() => {

                return caches.match(
                    "./index.html"
                );

            });

        })

    );

});
