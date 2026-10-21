// オフラインでも遊べるようにする。ページは毎回ネットを先に見て（更新がすぐ届く）、つながらなければ前に保存した分を出す。
// 絵やアイコンは保存した分を先に使う。中身を変えたら VERSION を上げると古い保存を捨てる
const VERSION = 'qd-1.0';
const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  'assets/faces/asagi.png', 'assets/faces/nadeshiko.png', 'assets/faces/shion.png', 'assets/faces/yamabuki.png',
  'assets/foes/bard.png', 'assets/foes/bat.png', 'assets/foes/biblion.png', 'assets/foes/statue.png',
  'assets/bg/bard.webp', 'assets/bg/bat.webp', 'assets/bg/biblion.webp', 'assets/bg/statue.webp',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
