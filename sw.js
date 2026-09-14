// Service worker for TRBC Register — offline-capable.
//
// Strategy: network-first, falling back to cache.
//   - Online: every request goes to the network as before, so you always
//     get the latest deployed version (no stale-install problem).
//   - Offline: if the network request fails, serve the last successfully
//     cached copy instead of letting the browser show its own
//     "no internet" page.
// Every successful network response is written into the cache, so the
// cache is kept fresh automatically every time you're online — nothing
// extra to maintain.

const CACHE_NAME = 'trbc-shell-v1'; // bump this string on future deploys
                                     // to force old cached copies to clear

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle simple GET requests; let everything else (POST, etc.,
  // including Firestore's own network calls) pass straight through.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Nothing cached for this request (e.g. first-ever offline load) —
          // fall back to the cached app shell so the app still opens.
          return caches.match('./index.html');
        })
      )
  );
});
