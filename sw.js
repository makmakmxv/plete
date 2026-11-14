const CACHE_NAME = "plete-2.2";

const FILES = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "fares.json",
  "manifest.json",
  "images/cityhall.jpg",
  "images/icon-192.png",
  "images/icon-512.png",
  "fonts/Poppins-Medium.ttf",
  "fonts/Poppins-SemiBold.ttf",
  "fonts/Poppins-Bold.ttf",
  "about.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(FILES.map(file => cache.add(file).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(saved => {
      if (saved) return saved;
      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") return caches.match("index.html");
      });
    })
  );
});