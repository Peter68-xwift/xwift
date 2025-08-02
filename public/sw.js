const CACHE_NAME = "swift-investment-v1";
const urlsToCache = [
  "/",
  "/user-dashboard",
  "/user-dashboard/wallet",
  "/user-dashboard/packages",
  "/user-dashboard/profile",
  "/static/css/main.css",
  "/logo.jpg",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache");
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
