// STOCKLAB service worker — static-asset cache only.
//
// Caches the app shell on install and serves a stale-while-revalidate
// strategy for previously visited /stock/[ticker] pages. Dynamic data is
// always fetched fresh; user-specific data is never cached.

const CACHE_VERSION = "stocklab-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STOCK_CACHE = `${CACHE_VERSION}-stock`;

const SHELL_ASSETS = [
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
  "/apple-touch-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate for stock detail pages.
  if (url.pathname.startsWith("/stock/")) {
    event.respondWith(staleWhileRevalidate(request, STOCK_CACHE));
    return;
  }

  // Cache-first for static shell assets.
  if (SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // Default: network only — never cache user-specific or API data.
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    })
    .catch(() => cached);
  return cached ?? fetchPromise;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.status === 200) {
    cache.put(request, response.clone()).catch(() => undefined);
  }
  return response;
}
