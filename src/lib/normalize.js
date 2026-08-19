// ---------------------------------------------------------------------------
// נרמול טקסט עברי לצורכי חיפוש.
// הסרת ניקוד/טעמים, המרת אותיות סופיות, הסרת גרשיים ומקפים, lowercase.
// ---------------------------------------------------------------------------

// ניקוד, טעמי מקרא ודגשים בטווח העברי
const HEBREW_DIACRITICS = /[\u0591-\u05C7]/g

// סימני ניקוד לטיניים משולבים (accents) שנוצרו מפירוק NFKD
const LATIN_DIACRITICS = /[\u0300-\u036F]/g

// גרשיים/גרש (עברית ולועזית) — נמחקים לגמרי, כך שג׳בנה → גבנה
const QUOTES = /[\u05F3\u05F4'"`\u00B4\u2018\u2019\u201C\u201D]/g

// מקפים, סימני פיסוק וסוגריים — הופכים לרווח, כדי לא להדביק מילים
const PUNCTUATION = /[\-\u2013\u2014_.,;:!?()\[\]{}\/\\|+*&]/g

const FINAL_LETTERS = {
  'ם': 'מ',
  'ן': 'נ',
  'ץ': 'צ',
  'ף': 'פ',
  'ך': 'כ',
}

/**
 * מנרמל מחרוזת לחיפוש. מחזיר מחרוזת נקייה עם רווח בודד בין מילים.
 */
export function normalize(input) {
  if (!input) return ''
  let s = String(input)

  // תווי תאימות (למשל אותיות עם ניקוד ב-Unicode מורכב) → צורה מפורקת
  s = s.normalize('NFKD')
  s = s.replace(HEBREW_DIACRITICS, '')
  s = s.replace(LATIN_DIACRITICS, '')
  s = s.replace(QUOTES, '')
  s = s.replace(PUNCTUATION, ' ')
  s = s.toLowerCase()

  // אותיות סופיות → רגילות
  let out = ''
  for (const ch of s) out += FINAL_LETTERS[ch] || ch

  return out.replace(/\s+/g, ' ').trim()
}

/** מפרק טקסט מנורמל למילים. */
export function tokenize(input) {
  const n = normalize(input)
  return n ? n.split(' ') : []
}
