/* SomLess service worker.
   שומר בקאש את ה-shell ואת המאגר (data/products.json) כדי שהאפליקציה
   תיפתח מיידית ותעבוד בסופר גם ללא קליטה. אין שרת ואין נתוני משתמש כאן —
   ההוספות המקומיות חיות ב-IndexedDB. */

const VERSION = 'somless-v6'
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
  url('icons/favicon.svg'),
  url('icons/icon-192.png'),
  url('icons/icon-512.png'),
  url('icons/icon-maskable-192.png'),
  url('icons/icon-maskable-512.png'),
  url('icons/icon-180.png'),
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll נכשל אם קובץ אחד נופל — לכן כל קובץ נשמר בנפרד
      .then((cache) => Promise.all(SHELL_URLS.map((u) => cache.add(u).catch(() => {}))))
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
