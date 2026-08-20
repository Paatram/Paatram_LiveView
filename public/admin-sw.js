const CACHE_NAME = "paatram-admin-v1";
const ADMIN_SHELL = "/admin-paatram-7m4x";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([
    ADMIN_SHELL,
    "/admin-icon-192.png",
    "/admin-icon-512.png",
  ])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("paatram-admin-") && key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || request.mode !== "navigate" || url.origin !== self.location.origin || !url.pathname.startsWith(ADMIN_SHELL)) return;

  event.respondWith(
    fetch(request).catch(() => caches.match(ADMIN_SHELL)),
  );
});
