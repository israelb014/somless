// ---------------------------------------------------------------------------
// חיפוש מקומי על המאגר (המאגר קטן — אין צורך בשרת).
// מיון: התאמה מדויקת → מתחיל ב- → מכיל → fuzzy (Levenshtein ≤ 2).
// ---------------------------------------------------------------------------
import { normalize, tokenize } from './normalize.js'

/** אורך מילה מינימלי שממנו מותרת התאמת fuzzy. */
const MIN_FUZZY_LEN = 4
/** מרחק עריכה מקסימלי מותר. */
const MAX_DISTANCE = 2

/**
 * מרחק Levenshtein עם קיטום מוקדם (מימוש קצר, ללא ספריות).
 * מחזיר ערך > limit אם המרחק גדול מהמותר.
 */
export function levenshtein(a, b, limit = MAX_DISTANCE) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > limit) return limit + 1

  // שורה אחת בלבד בזיכרון
  let prev = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    const curr = new Array(b.length + 1)
    curr[0] = i
    let rowMin = curr[0]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    if (rowMin > limit) return limit + 1 // קיטום — אין סיכוי להשתפר
    prev = curr
  }
  return prev[b.length]
}

// דרגות התאמה (נמוך = טוב יותר)
const RANK = { EXACT: 0, STARTS_WITH: 1, CONTAINS: 2, FUZZY: 3 }

/**
 * מדרג מוצר בודד מול שאילתה מנורמלת.
 * מחזיר { rank, distance } או null אם אין התאמה כלל.
 */
function scoreProduct(product, query, queryTokens) {
  const haystack = product.searchText // שם + מותג, מנורמל
  const name = product.nameNormalized

  if (name === query) return { rank: RANK.EXACT, distance: 0 }
  if (name.startsWith(query)) return { rank: RANK.STARTS_WITH, distance: 0 }
  if (haystack.includes(query)) return { rank: RANK.CONTAINS, distance: 0 }

  // fuzzy — כל מילה בשאילתה צריכה למצוא מילה קרובה במוצר
  const words = product.searchTokens
  let total = 0
  for (const qt of queryTokens) {
    if (qt.length < MIN_FUZZY_LEN) return null
    let best = MAX_DISTANCE + 1
    for (const w of words) {
      // מילים קצרות ("עם", "ללא") לא משתתפות ב-fuzzy — הן יוצרות רעש
      if (w.length < MIN_FUZZY_LEN) continue
      if (w.includes(qt) || qt.includes(w)) { best = 0; break }
      const d = levenshtein(qt, w, MAX_DISTANCE)
      if (d < best) best = d
      if (best === 0) break
    }
    if (best > MAX_DISTANCE) return null
    total += best
  }
  return { rank: RANK.FUZZY, distance: total }
}

/**
 * מחפש מוצרים. products הם אובייקטים עם שדות החיפוש המחושבים מראש
 * (ראו prepareProduct ב-useProducts).
 */
export function searchProducts(products, rawQuery) {
  const query = normalize(rawQuery)
  if (!query) return []
  const queryTokens = tokenize(rawQuery)

  const results = []
  for (const p of products) {
    const score = scoreProduct(p, query, queryTokens)
    if (score) results.push({ ...p, _rank: score.rank, _distance: score.distance })
  }

  results.sort((a, b) => {
    if (a._rank !== b._rank) return a._rank - b._rank
    if (a._distance !== b._distance) return a._distance - b._distance
    // שובר שוויון: שם קצר יותר קודם, ואז לפי עדכון אחרון
    if (a.name.length !== b.name.length) return a.name.length - b.name.length
    return (b.updatedAtMs || 0) - (a.updatedAtMs || 0)
  })

  return results
}
