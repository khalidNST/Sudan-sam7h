// يخلي اللعبة تشتغل أوفلاين بعد أول تحميل.
// لما تعدّل الأسئلة أو الصور، غيّر رقم الإصدار هنا عشان الأجهزة تحدّث نسختها.
const VERSION = 'v7';
const CACHE = `sudan-challenge-${VERSION}`;
const CORE = ['./', 'index.html', 'css/app.css?v=7', 'js/app.js?v=7', 'data/questions.json', 'manifest.webmanifest', 'public/icons/icon-192.png', 'public/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    // نحفظ كل صور الأسئلة مسبقًا
    const data = await (await fetch('data/questions.json')).json();
    const imgs = [...new Set(data.questions.map(q => q.image).filter(Boolean))];
    await Promise.all(imgs.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const put = r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; };
  const isAsset = /\.(webp|png|jpg|woff2?|ttf)$/.test(url.pathname) || url.host.includes('gstatic.com');
  if (isAsset) {
    // الصور والخطوط: الكاش أولًا (ما تتغير كثير)
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(put)));
  } else {
    // الصفحة والكود والأسئلة: الشبكة أولًا عشان التعديلات توصل، والكاش لو ما فيه نت
    // cache: 'no-cache' يتجاوز كاش المتصفح عشان ما يجيب نسخة قديمة من الكود
    const fresh = req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req, { cache: 'no-cache' });
    e.respondWith(fresh.then(put).catch(() => caches.match(req, { ignoreSearch: true })
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
  }
});
