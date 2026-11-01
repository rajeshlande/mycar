/* myCar: cache the public shell, never authentication or financial API responses. */
const ROOT = new URL('./', self.registration.scope);
const PREFIX = `mycar:${ROOT.pathname}:`;
const CACHE = `${PREFIX}__BUILD_ID__`;
const local = path => new URL(path, ROOT).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const response = await fetch(local('precache.json'), { cache: 'reload' });
    if (!response.ok) throw new Error('The myCar offline manifest is unavailable.');
    const paths = await response.json();
    const urls = paths.map(path => new URL(path, ROOT)).filter(url => url.origin === ROOT.origin && url.pathname.startsWith(ROOT.pathname));
    const cache = await caches.open(CACHE);
    await cache.addAll(urls.map(url => url.href));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(request); }
      catch { return await caches.match(ROOT.href) || new Response('Reconnect once to prepare myCar for offline use.', { status: 503, headers: { 'Content-Type': 'text/plain' } }); }
    })());
    return;
  }
  const isAsset = url.pathname.startsWith(`${ROOT.pathname}assets/`);
  const isPublic = ['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'images/suv-forest.webp'].some(path => url.href === local(path));
  if (!isAsset && !isPublic) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Static assets are public. Ignore Vary (notably Vary: Origin) so a precached
    // module/script also satisfies the browser's later CORS-mode request offline.
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
    return response;
  })());
});
