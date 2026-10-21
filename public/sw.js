// SIMRS Modern Safe Service Worker
// Strictly caches static assets (app shell, fonts, icons).
// NEVER caches clinical data, patient medical records, lab results, or tokens.

const CACHE_NAME = "simrs-static-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // STRICT SECURITY CHECK: DO NOT CACHE API, Supabase, or Clinical Mutating Requests
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api") ||
    url.hostname.includes("supabase.co") ||
    url.pathname.includes("/patients") ||
    url.pathname.includes("/medical-records") ||
    url.pathname.includes("/prescriptions") ||
    url.pathname.includes("/billing")
  ) {
    // Network only for all clinical & transactional operations
    return;
  }

  // Network first with cache fallback for static shell
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match("/");
        });
      })
  );
});
