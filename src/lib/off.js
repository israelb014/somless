// ---------------------------------------------------------------------------
// חיפוש ברקוד ב-Open Food Facts וניתוח שומשום.
//
// כלל ברזל: מ-OFF לעולם לא מוחזר "בטוח". היעדר שומשום ברשימת הרכיבים אומר
// רק שלא זוהה — לא שהמוצר אומת על ידי ההורים.
// ---------------------------------------------------------------------------

const ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product'
const TIMEOUT_MS = 4000

/** מילות מפתח לשומשום בשפות שרלוונטיות לתוויות בישראל ובאירופה. */
export const SESAME_WORDS = [
  'שומשום',
  'טחינה',
  'סומסום',
  'sesame',
  'tahini',
  'sésame',
  'sesam',
  'benne',
]

function hasSesameWord(text) {
  if (!text) return false
  const lower = String(text).toLowerCase()
  return SESAME_WORDS.some((w) => lower.includes(w.toLowerCase()))
}

function tagsHaveSesame(tags) {
  if (!Array.isArray(tags)) return false
  return tags.some((t) => hasSesameWord(t))
}

/** אוסף את כל שדות ingredients_text בכל השפות שהוחזרו. */
function allIngredientTexts(product) {
  return Object.keys(product)
    .filter((k) => k === 'ingredients_text' || k.startsWith('ingredients_text_'))
    .map((k) => product[k])
    .filter(Boolean)
}

/**
 * מנתח מוצר של OFF ומחזיר סטטוס + הראיה שהובילה אליו.
 * status: 'contains' | 'may_contain' | 'unverified'
 */
export function analyseOffProduct(product) {
  const allergens = [...(product.allergens_tags || []), ...(product.allergens_hierarchy || [])]
  const traces = [...(product.traces_tags || []), ...(product.traces_hierarchy || [])]
  const texts = allIngredientTexts(product)

  if (tagsHaveSesame(allergens)) {
    return { status: 'contains', evidence: 'שומשום מופיע ברשימת האלרגנים של המוצר' }
  }
  if (texts.some(hasSesameWord)) {
    return { status: 'contains', evidence: 'שומשום מופיע ברשימת הרכיבים' }
  }
  if (tagsHaveSesame(traces)) {
    return { status: 'may_contain', evidence: 'שומשום מופיע כ"עלול להכיל" (traces)' }
  }
  return {
    status: 'unverified',
    evidence: texts.length
      ? 'לא נמצא שומשום ברשימת הרכיבים שדווחה'
      : 'ל-Open Food Facts אין רשימת רכיבים למוצר הזה',
  }
}

/**
 * מחפש ברקוד ב-OFF. מחזיר null אם לא נמצא, אין רשת, או שחלף ה-timeout —
 * הקריאה לעולם לא זורקת החוצה.
 */
export async function lookupBarcode(barcode, { timeout = TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const url = `${ENDPOINT}/${encodeURIComponent(barcode)}.json`
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null

    const p = data.product
    const analysis = analyseOffProduct(p)
    return {
      barcode,
      name: p.product_name_he || p.product_name || p.generic_name || '',
      brand: (p.brands || '').split(',')[0].trim(),
      status: analysis.status,
      evidence: analysis.evidence,
      source: 'off',
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
