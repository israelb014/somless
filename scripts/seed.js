// ---------------------------------------------------------------------------
// סקריפט seed — מריצים פעם אחת.
//
// משתמש ב-firebase-admin (הדרך הפשוטה: לא צריך להתחבר, ולא נחסם על ידי
// ה-Security Rules). דורש Service Account key מ:
//   Firebase Console → Project settings → Service accounts → Generate new private key
//
// הרצה:
//   FAMILY_ID=family-main \
//   MEMBER_EMAILS="aba@gmail.com,ima@gmail.com" \
//   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
//   npm run seed
//
// הסקריפט אידמפוטנטי: מוצר שכבר קיים (לפי שם מנורמל) לא ייווצר שוב.
// ---------------------------------------------------------------------------
import { existsSync, readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { normalize } from '../src/lib/normalize.js'
import { SEED_NOTE, seedEntries } from './seed-data.js'

const FAMILY_ID = process.env.FAMILY_ID || 'family-main'
const ALLERGEN = 'sesame'
const MEMBER_EMAILS = (process.env.MEMBER_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json'

if (MEMBER_EMAILS.length === 0) {
  console.error('✗ חסר MEMBER_EMAILS — רשימת המיילים המורשים, מופרדים בפסיק.')
  process.exit(1)
}
if (!existsSync(KEY_PATH)) {
  console.error(`✗ לא נמצא Service Account key בנתיב: ${KEY_PATH}`)
  console.error('  Firebase Console → Project settings → Service accounts → Generate new private key')
  process.exit(1)
}

initializeApp({ credential: cert(JSON.parse(readFileSync(KEY_PATH, 'utf8'))) })
const db = getFirestore()

async function run() {
  const familyRef = db.collection('families').doc(FAMILY_ID)

  // 1. מסמך המשפחה + ה-whitelist (נאכף ב-firestore.rules)
  await familyRef.set(
    {
      name: 'משפחה',
      members: MEMBER_EMAILS,
      allergens: [ALLERGEN],
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
  console.log(`✓ משפחה "${FAMILY_ID}" עם ${MEMBER_EMAILS.length} משתמשים מורשים`)

  // 2. מוצרים קיימים — למניעת כפילויות
  const productsRef = familyRef.collection('products')
  const existing = new Set()
  const snap = await productsRef.get()
  snap.forEach((doc) => existing.add(doc.get('nameNormalized') || normalize(doc.get('name'))))

  let created = 0
  let skipped = 0
  let batch = db.batch()
  let batchCount = 0

  for (const entry of seedEntries()) {
    const nameNormalized = normalize(entry.name)
    if (existing.has(nameNormalized)) {
      skipped++
      continue
    }
    existing.add(nameNormalized)
    batch.set(productsRef.doc(), {
      name: entry.name,
      nameNormalized,
      brand: '',
      allergens: { [ALLERGEN]: entry.status },
      note: SEED_NOTE,
      source: 'seed',
      createdAt: FieldValue.serverTimestamp(),
      createdBy: 'seed',
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: 'seed',
    })
    created++
    if (++batchCount === 400) {
      await batch.commit()
      batch = db.batch()
      batchCount = 0
    }
  }

  if (batchCount > 0) await batch.commit()

  console.log(`✓ נוצרו ${created} מוצרים, דולגו ${skipped} קיימים`)
  console.log('✓ הרשימה הלבנה (safe) נשארת ריקה — רק ההורים מוסיפים אליה')
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error('✗ ה-seed נכשל:', err)
    process.exit(1)
  }
)
