// ---------------------------------------------------------------------------
// אחסון מקומי של הוספות המשתמש — IndexedDB, ללא ספריות חיצוניות.
// המאגר המרכזי (data/products.json) הוא לקריאה בלבד; כל מה שנוסף מהטלפון
// נשמר כאן, על המכשיר הזה בלבד, ומיוצא בשיתוף למיזוג עתידי.
// ---------------------------------------------------------------------------

const DB_NAME = 'somless'
const DB_VERSION = 1
const STORE = 'localProducts'
const PREFS = 'prefs'

let dbPromise = null

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) {
      reject(new Error('IndexedDB is not available'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(PREFS)) {
        db.createObjectStore(PREFS)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(mode, run, storeName = STORE) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        const request = run(store)
        transaction.oncomplete = () => resolve(request?.result)
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      })
  )
}

export function getLocalProducts() {
  return tx('readonly', (store) => store.getAll()).then((rows) => rows || [])
}

export function putLocalProduct(product) {
  return tx('readwrite', (store) => store.put(product))
}

export function deleteLocalProduct(id) {
  return tx('readwrite', (store) => store.delete(id))
}

/** העדפות פשוטות (מפתח → ערך), למשל אישור הדיסקליימר. */
export function getPref(key) {
  return tx('readonly', (store) => store.get(key), PREFS)
}

export function setPref(key, value) {
  return tx('readwrite', (store) => store.put(value, key), PREFS)
}

/** מזהה ייחודי להוספה מקומית, ללא תלות ב-crypto.randomUUID. */
export function newLocalId() {
  if (globalThis.crypto?.randomUUID) return `local-${crypto.randomUUID()}`
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
