// Кут Авто: интернетсиз да ачылуу үчүн кичинекей кэш.
// Сайт файлдары адегенде интернеттен алынат (жаңылыктар дароо көрүнөт), интернет жок болсо кэштен ачылат.
const CACHE = 'kut-avto-v1';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(
      fetch(r)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); }
          return res;
        })
        .catch(() => caches.match(r).then((m) => m || caches.match('index.html')))
    );
  } else if (u.hostname.endsWith('googleapis.com') || u.hostname.endsWith('gstatic.com')) {
    e.respondWith(
      caches.match(r).then((m) => {
        const net = fetch(r).then((res) => { caches.open(CACHE).then((c) => c.put(r, res.clone())); return res; }).catch(() => m);
        return m || net;
      })
    );
  }
});
