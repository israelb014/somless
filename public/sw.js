/* SomLess service worker — קאשינג של ה-shell כדי שהאפליקציה תיפתח מיידית
   גם בקליטה גרועה. נתוני המוצרים מגיעים מ-Firestore offline persistence
   (IndexedDB) ולכן בקשות רשת של Firebase לא נתפסות כאן. */

const VERSION = 'somless-v1'
const SHELL_CACHE = `${VERSION}-shell`
const ASSET_CACHE = `${VERSION}-assets`

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
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

// דומיינים שאסור לקאש — תעבורת Firebase חייבת להגיע לרשת (או להיכשל
// ולהיפול ל-offline persistence).
function isFirebaseRequest(url) {
  return /(googleapis\.com|firebaseio\.com|firebaseapp\.com|google\.com|gstatic\.com)$/.test(
    url.hostname
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (isFirebaseRequest(url)) return

  // ניווטים: רשת קודם, ובנפילה — ה-shell מהקאש (SPA).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    )
    return
  }

  if (url.origin !== self.location.origin) return

  // נכסים סטטיים: cache-first עם רענון ברקע (stale-while-revalidate).
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
