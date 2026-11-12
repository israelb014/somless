// ---------------------------------------------------------------------------
// פיזור זרעי שומשום לאורך נתיב SVG כלשהו.
// מכאן נגזרים כל הרכיבים ה"עשויים שומשום": מסגרות, קווים מפרידים ואייקונים.
// המדידה נעשית פעם אחת לכל נתיב ונשמרת ב-cache.
// ---------------------------------------------------------------------------

const cache = new Map()
let measurer = null

function pathElement() {
  if (measurer) return measurer
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.style.position = 'absolute'
  svg.style.visibility = 'hidden'
  svg.style.pointerEvents = 'none'
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  svg.appendChild(path)
  document.body.appendChild(svg)
  measurer = path
  return measurer
}

/**
 * מחזיר נקודות לאורך הנתיב עם הזווית המשיקית בכל נקודה.
 * closed — נתיב סגור, בלי לשכפל את נקודת ההתחלה בסוף.
 */
export function pointsAlongPath(d, spacing, closed = false) {
  const key = `${d}|${spacing}|${closed}`
  const hit = cache.get(key)
  if (hit) return hit

  const out = []
  try {
    const path = pathElement()
    path.setAttribute('d', d)
    const total = path.getTotalLength()
    if (total > 0) {
      const count = Math.max(2, Math.round(total / spacing))
      const step = closed ? total / count : total / (count - 1)
      const delta = Math.min(0.5, total / 100)
      for (let i = 0; i < count; i++) {
        const at = i * step
        const pt = path.getPointAtLength(at)
        const a = path.getPointAtLength(Math.max(at - delta, 0))
        const b = path.getPointAtLength(Math.min(at + delta, total))
        out.push({
          x: pt.x,
          y: pt.y,
          angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
        })
      }
    }
  } catch {
    // בלי DOM אין מה למדוד — מחזירים רשימה ריקה והרכיב פשוט לא מצייר
  }
  cache.set(key, out)
  return out
}

/** נתיב של מלבן מעוגל — משמש למסגרות שדות ולכרטיסים. */
export function roundedRectPath(w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  return (
    `M${radius} 0 H${w - radius} A${radius} ${radius} 0 0 1 ${w} ${radius} ` +
    `V${h - radius} A${radius} ${radius} 0 0 1 ${w - radius} ${h} ` +
    `H${radius} A${radius} ${radius} 0 0 1 0 ${h - radius} ` +
    `V${radius} A${radius} ${radius} 0 0 1 ${radius} 0 Z`
  )
}
