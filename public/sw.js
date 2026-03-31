const APP_SHELL_CACHE = 'qa-trainer-app-shell-v2';
const RUNTIME_CACHE = 'qa-trainer-runtime-v2';

const APP_SHELL_URLS = ['./', './index.html'];

function normalizeAssetUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('//')) {
    return null;
  }

  if (rawUrl.startsWith('/')) {
    return `.${rawUrl}`;
  }

  if (rawUrl.startsWith('./') || rawUrl.startsWith('../')) {
    return rawUrl;
  }

  return `./${rawUrl}`;
}

function looksLikeStaticAsset(url) {
  return (
    url.includes('/assets/') ||
    /\.(?:css|js|mjs|json|png|jpg|jpeg|svg|webp|woff|woff2|ttf|map)$/i.test(url)
  );
}

async function getInstallAssetUrls() {
  const urls = new Set(APP_SHELL_URLS);

  try {
    const response = await fetch('./index.html', { cache: 'no-store' });
    if (!response.ok) {
      return Array.from(urls);
    }

    const html = await response.text();
    const assetLinkPattern = /(?:src|href)=["']([^"']+)["']/g;

    for (const match of html.matchAll(assetLinkPattern)) {
      const normalized = normalizeAssetUrl(match[1]);
      if (!normalized) {
        continue;
      }

      if (looksLikeStaticAsset(normalized)) {
        urls.add(normalized);
      }
    }
  } catch (_error) {
    // Fallback to minimal shell list if index parsing fails.
  }

  return Array.from(urls);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    getInstallAssetUrls()
      .then((urls) => caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(urls)))
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

async function cacheFirst(request, url) {
  const cached =
    (await caches.match(request)) ||
    (await caches.match(url.pathname)) ||
    (await caches.match(`.${url.pathname}`));
  if (cached) {
    void fetch(request)
      .then(async (response) => {
        if (response && response.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(request, response.clone());
        }
      })
      .catch(() => {
        // Ignore background revalidation errors.
      });

    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (_error) {
    const fallback =
      (await caches.match(request)) ||
      (await caches.match(url.pathname)) ||
      (await caches.match(`.${url.pathname}`));
    if (fallback) {
      return fallback;
    }

    return new Response('', { status: 503, statusText: 'Offline cache miss' });
  }
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
    const cached = (await caches.match(request)) || (await caches.match('./index.html'));
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
    event.respondWith(cacheFirst(request, url));
  }
});
