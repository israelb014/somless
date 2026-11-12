/* SomLess service worker.
   שומר בקאש את ה-shell ואת המאגר (data/products.json) כדי שהאפליקציה
   תיפתח מיידית ותעבוד בסופר גם ללא קליטה. אין שרת ואין נתוני משתמש כאן —
   ההוספות המקומיות חיות ב-IndexedDB. */

const VERSION = 'somless-v8'
const SHELL_CACHE = `${VERSION}-shell`
const ASSET_CACHE = `${VERSION}-assets`

// scope תלוי במקום שבו האתר מתארח (שורש או תת-נתיב כמו /somless/)
const BASE = new URL('./', self.registration.scope).pathname
const url = (path) => BASE + path
const INDEX = url('index.html')

const SHELL_URLS = [
  BASE,
  INDEX,
  url('manifest.webmanifest'),
  url('data/products.json'),
  url('tahini-bowl.png'),
  url('icons/favicon.svg'),
  url('icons/icon-192.png'),
  url('icons/icon-512.png'),
  url('icons/icon-maskable-192.png'),
  url('icons/icon-maskable-512.png'),
  url('icons/icon-180.png'),
]

/**
 * נכסי הבנייה נושאים hash בשם, ובטעינה הראשונה הם נטענים לפני שה-worker
 * שולט בעמוד — ולכן לא נכנסים לקאש מעצמם. כאן קוראים את index.html
 * ולומדים מתוכו את שמות ה-JS וה-CSS, כדי שהאפליקציה תעלה גם בלי רשת.
 */
async function precacheBuildAssets(cache) {
  try {
    const res = await fetch(INDEX, { cache: 'reload' })
    if (!res.ok) return
    const html = await res.clone().text()
    await cache.put(INDEX, res)
    const urls = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1])
    await Promise.all(
      urls.map((u) => cache.add(new URL(u, self.registration.scope).href).catch(() => {}))
    )
  } catch {
    // אין רשת בזמן ההתקנה — ה-worker יתפוס את הנכסים בטעינה הבאה
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll נכשל אם קובץ אחד נופל — לכן כל קובץ נשמר בנפרד
      .then(async (cache) => {
        await Promise.all(SHELL_URLS.map((u) => cache.add(u).catch(() => {})))
        await precacheBuildAssets(cache)
      })
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const requestUrl = new URL(request.url)
  if (requestUrl.origin !== self.location.origin) return

  // ניווטים: רשת קודם, ובנפילה — ה-shell מהקאש
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put(INDEX, copy))
          return response
        })
        .catch(() => caches.match(INDEX).then((r) => r || caches.match(BASE)))
    )
    return
  }

  // המאגר: רשת קודם (כדי לקבל עדכונים), ובנפילה — הגרסה השמורה
  if (requestUrl.pathname === url('data/products.json')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // נכסים סטטיים: cache-first עם רענון ברקע
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone()
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
