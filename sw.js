// Treino & Dieta — Service Worker
// Ao publicar uma atualização, mude VERSION (e APP_VERSION no index.html).
// O cache guarda só os arquivos do app. Seus registros ficam no localStorage e NÃO são apagados aqui.
const VERSION='1.2.0';
const CACHE = 'treino-dieta-' + VERSION;
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('treino-dieta-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro (pega a versão nova quando há internet); sem internet, usa o cache.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(m => m || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
        .then(m => m || caches.match('./')))
  );
});
