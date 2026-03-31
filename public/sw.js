const APP_SHELL_CACHE = 'qa-trainer-app-shell-v1';
const RUNTIME_CACHE = 'qa-trainer-runtime-v1';

const APP_SHELL_URLS = ['./', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const expectedCaches = new Set([APP_SHELL_CACHE, RUNTIME_CACHE]);

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!expectedCaches.has(key)) {
              return caches.delete(key);
            }

            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAssetRequest(request, url) {
  if (request.destination === 'script' || request.destination === 'style') {
    return true;
  }

  if (request.destination === 'font' || request.destination === 'image') {
    return true;
  }

  return url.pathname.includes('/assets/');
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }

  return response;
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(APP_SHELL_CACHE);
      cache.put('./index.html', response.clone());
    }
    return response;
  } catch (_error) {
    const cached = await caches.match('./index.html');
    if (cached) {
      return cached;
    }

    throw _error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticAssetRequest(request, url)) {
    event.respondWith(cacheFirst(request));
  }
});
