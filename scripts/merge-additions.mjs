// ---------------------------------------------------------------------------
// מיזוג ההוספות שהמשתמשים שיתפו מהטלפון לתוך data/products.json.
//
//   npm run merge -- additions.json
//   cat additions.json | npm run merge
//
// המיזוג מזהה כפילויות לפי שם מנורמל: מוצר קיים מתעדכן, חדש נוסף בסוף.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalize } from '../src/lib/normalize.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DB_PATH = join(ROOT, 'data', 'products.json')
const VALID = ['contains', 'may_contain', 'safe']

function readInput() {
  const file = process.argv[2]
  if (file) return readFileSync(file, 'utf8')
  try {
    return readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

const rawInput = readInput().trim()
if (!rawInput) {
  console.error('שימוש: npm run merge -- additions.json   (או הזרמה ב-stdin)')
  process.exit(1)
}

let incoming
try {
  const parsed = JSON.parse(rawInput)
  incoming = Array.isArray(parsed) ? parsed : parsed.products
} catch (err) {
  console.error('✗ JSON לא תקין:', err.message)
  process.exit(1)
}
if (!Array.isArray(incoming)) {
  console.error('✗ לא נמצא מערך products בקלט')
  process.exit(1)
}

const db = JSON.parse(readFileSync(DB_PATH, 'utf8'))
const byName = new Map(db.products.map((p) => [normalize(p.name), p]))

let added = 0
let updated = 0
let skipped = 0

for (const item of incoming) {
  const name = (item?.name || '').trim()
  const status = item?.allergens?.[db.allergen] || item?.status
  if (!name || !VALID.includes(status)) {
    skipped++
    continue
  }
  const key = normalize(name)
  const incomingCodes = Array.isArray(item.barcodes) ? item.barcodes.map(String) : []
  const existing = byName.get(key)
  if (existing) {
    existing.name = name
    existing.brand = (item.brand || existing.brand || '').trim()
    existing.allergens = { ...existing.allergens, [db.allergen]: status }
    existing.note = (item.note || '').trim()
    // ברקודים מצטברים — שיוך שנעשה בטלפון לא הולך לאיבוד
    const merged = [...new Set([...(existing.barcodes || []), ...incomingCodes])]
    if (merged.length) existing.barcodes = merged
    existing.source = 'family'
    updated++
    continue
  }
  const maxId = db.products.reduce((max, p) => {
    const n = Number.parseInt(String(p.id).replace(/\D/g, ''), 10)
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)
  const record = {
    id: `p${String(maxId + 1).padStart(3, '0')}`,
    name,
    brand: (item.brand || '').trim(),
    allergens: { [db.allergen]: status },
    note: (item.note || '').trim(),
    source: 'family',
  }
  if (incomingCodes.length) record.barcodes = [...new Set(incomingCodes)]
  db.products.push(record)
  byName.set(key, record)
  added++
}

db.version = (db.version || 0) + 1
db.updatedAt = new Date().toISOString().slice(0, 10)

writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n')
console.log(`✓ נוספו ${added}, עודכנו ${updated}, דולגו ${skipped}`)
console.log(`✓ המאגר עכשיו בגרסה ${db.version} עם ${db.products.length} מוצרים`)
