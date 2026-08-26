// Minimal service worker for TRBC Register.
// Exists only to satisfy Chrome's install/installability requirement.
// It does NOT cache anything, so the app always loads the latest
// deployed version — no stale-install problem.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// No fetch handler — all requests just go to the network as normal.
