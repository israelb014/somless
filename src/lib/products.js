// ---------------------------------------------------------------------------
// שכבת הנתונים: איחוד המאגר המרכזי (data/products.json, לקריאה בלבד)
// עם ההוספות המקומיות של המכשיר (IndexedDB).
// ---------------------------------------------------------------------------
import { ACTIVE_ALLERGEN } from '../config.js'
import { normalize, tokenize } from './normalize.js'
import bundledDb from '../../data/products.json'
import { deleteLocalProduct, getLocalProducts, newLocalId, putLocalProduct } from './localdb.js'

/** כתובת המאגר המרכזי — יחסית ל-base של האתר (עובד גם תחת תת-נתיב). */
export const PRODUCTS_URL = `${import.meta.env.BASE_URL}data/products.json`

/** מכין מוצר לחיפוש: שדות מנורמלים מחושבים מראש. */
export function prepareProduct(raw, isLocal) {
  const name = raw.name || ''
  const brand = raw.brand || ''
  const updatedAt = raw.updatedAt ? new Date(raw.updatedAt) : null
  return {
    ...raw,
    name,
    brand,
    isLocal: Boolean(isLocal),
    nameNormalized: normalize(name),
    searchText: normalize(`${name} ${brand}`),
    searchTokens: tokenize(`${name} ${brand}`),
    status: raw.allergens?.[ACTIVE_ALLERGEN] || null,
    barcodes: Array.isArray(raw.barcodes) ? raw.barcodes : [],
    updatedAtDate: updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : null,
    updatedAtMs: updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt.getTime() : 0,
  }
}

/**
 * טוען את המאגר המרכזי. מנסה רשת/קאש של ה-service worker, ונופל לעותק
 * המצורף ל-bundle — כך שהאפליקציה שמישה מיד גם בהרצה ראשונה ללא רשת.
 */
export async function loadCentralDb() {
  try {
    const res = await fetch(PRODUCTS_URL, { cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data?.products)) throw new Error('malformed products.json')
    return data
  } catch (err) {
    console.warn('נפילה לעותק המצורף של המאגר:', err)
    return bundledDb
  }
}

export function loadLocalProducts() {
  return getLocalProducts().catch((err) => {
    console.warn('IndexedDB לא זמין:', err)
    return []
  })
}

/** יוצר הוספה מקומית חדשה ומחזיר את הרשומה שנשמרה. */
export async function createLocalProduct({ name, brand, status, note, barcodes }) {
  const now = new Date().toISOString()
  const record = {
    id: newLocalId(),
    name: name.trim(),
    brand: (brand || '').trim(),
    allergens: { [ACTIVE_ALLERGEN]: status },
    note: (note || '').trim(),
    barcodes: normaliseBarcodes(barcodes),
    source: 'local',
    createdAt: now,
    updatedAt: now,
  }
  await putLocalProduct(record)
  return record
}

/** מעדכן הוספה מקומית קיימת. updatedAt מתעדכן אוטומטית. */
export async function saveLocalProduct(product, { name, brand, status, note, barcodes }) {
  const record = {
    ...product,
    name: name.trim(),
    brand: (brand || '').trim(),
    allergens: { ...(product.allergens || {}), [ACTIVE_ALLERGEN]: status },
    note: (note || '').trim(),
    barcodes: normaliseBarcodes(barcodes ?? product.barcodes),
    updatedAt: new Date().toISOString(),
  }
  // שדות עזר של החיפוש לא נשמרים ב-IndexedDB
  delete record.isLocal
  delete record.nameNormalized
  delete record.searchText
  delete record.searchTokens
  delete record.status
  delete record.updatedAtDate
  delete record.updatedAtMs
  await putLocalProduct(record)
  return record
}

export function removeLocalProduct(id) {
  return deleteLocalProduct(id)
}

/** מנקה ומייחד רשימת ברקודים. */
export function normaliseBarcodes(list) {
  if (!Array.isArray(list)) return []
  return [...new Set(list.map((b) => String(b).trim()).filter(Boolean))]
}

/** מאתר מוצר לפי ברקוד. הוספות מקומיות קודמות למאגר המרכזי. */
export function findByBarcode(products, barcode) {
  const code = String(barcode).trim()
  if (!code) return null
  return (
    products.find((p) => p.isLocal && p.barcodes?.includes(code)) ||
    products.find((p) => p.barcodes?.includes(code)) ||
    null
  )
}

/** מייצא את ההוספות המקומיות כ-JSON למיזוג לתוך data/products.json. */
export function exportLocalProducts(localProducts) {
  return JSON.stringify(
    {
      kind: 'somless-additions',
      version: 1,
      exportedAt: new Date().toISOString(),
      products: localProducts.map((p) => ({
        name: p.name,
        brand: p.brand || '',
        allergens: { [ACTIVE_ALLERGEN]: p.status },
        note: p.note || '',
        barcodes: p.barcodes || [],
        source: 'local',
      })),
    },
    null,
    2
  )
}
