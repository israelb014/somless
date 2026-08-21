// ---------------------------------------------------------------------------
// יצירת אייקוני ה-PWA (PNG) ללא תלויות חיצוניות.
//
// האייקון: זרע שומשום זהוב-קרם יחיד במרכז ריבוע מלא, על רקע חום-שחור עם
// radial glow זהוב עדין מהמרכז. בלי טקסט, בלי פינות מעוגלות (מערכות ההפעלה
// חותכות בעצמן), בלי שום אלמנט נוסף.
//
// הזרע תופס 58% מגובה האייקון. רדיוס העיגול החוסם שלו הוא 0.349 מהגודל,
// לעומת אזור הבטיחות של maskable שהוא 0.400 — כך ששום חלק לא נחתך גם
// במסכה עגולה של אנדרואיד. אותו ציור משמש את שני ה-purposes.
//
// הצורה נלקחת מ-src/lib/seedShape.js — מקור אמת יחיד עם האפליקציה.
// הרצה:  npm run icons
// ---------------------------------------------------------------------------
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SEED_PATH, SEED_SEAM, SEED_W, SEED_H } from '../src/lib/seedShape.js'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

// --- כתיבת PNG (RGBA, 8 ביט) ----------------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(width, height, rgba) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- שיטוח נתיב ה-SVG לפוליגון --------------------------------------------
// הנתיבים משתמשים רק ב-M / C / Z, ולכן די בפרסר זעיר.

function flatten(d, steps = 26) {
  const tokens = d.match(/[MCZmcz]|-?\d*\.?\d+/g)
  const pts = []
  let i = 0
  let cur = [0, 0]
  let start = [0, 0]
  while (i < tokens.length) {
    const cmd = tokens[i++]
    if (cmd === 'M') {
      cur = [parseFloat(tokens[i++]), parseFloat(tokens[i++])]
      start = cur
      pts.push(cur)
    } else if (cmd === 'C') {
      const p1 = [parseFloat(tokens[i++]), parseFloat(tokens[i++])]
      const p2 = [parseFloat(tokens[i++]), parseFloat(tokens[i++])]
      const p3 = [parseFloat(tokens[i++]), parseFloat(tokens[i++])]
      for (let s = 1; s <= steps; s++) {
        const t = s / steps
        const u = 1 - t
        pts.push([
          u * u * u * cur[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
          u * u * u * cur[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
        ])
      }
      cur = p3
    } else if (cmd === 'Z' || cmd === 'z') {
      pts.push(start)
    }
  }
  return pts
}

const SEED_POLY = flatten(SEED_PATH)
const SEAM_POLY = flatten(SEED_SEAM)

function insidePolygon(px, py, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function distanceToPolyline(px, py, poly) {
  let best = Infinity
  for (let i = 1; i < poly.length; i++) {
    const [ax, ay] = poly[i - 1]
    const [bx, by] = poly[i]
    const vx = bx - ax
    const vy = by - ay
    const wx = px - ax
    const wy = py - ay
    const len2 = vx * vx + vy * vy
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2))
    const dx = wx - vx * t
    const dy = wy - vy * t
    const d = Math.hypot(dx, dy)
    if (d < best) best = d
  }
  return best
}

// --- הסצנה ----------------------------------------------------------------

const mix = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))

const BG_FAR = hex('#100B07')
const BG_NEAR = hex('#2E2013')
const SEED_LIGHT = hex('#FFF3D6')
const SEED_MID = hex('#F0CE8C')
const SEED_DARK = hex('#B07C２B'.replace('２','2'))
const SEAM_COLOR = hex('#8A5A18')

/** גובה הזרע כשבר מגובה האייקון — בתוך אזור הבטיחות של maskable. */
const SEED_HEIGHT = 0.58
const SEED_TILT = (-12 * Math.PI) / 180

/** צבע הסצנה בנקודה (x, y) בטווח 0..1 — מחזיר [r, g, b, a]. */
function sample(x, y) {
  // רקע: ריבוע מלא, radial glow זהוב מהמרכז
  const d = Math.hypot(x - 0.5, y - 0.5) / 0.72
  const glow = clamp01(1 - d)
  let color = BG_FAR.map((c, i) => Math.round(mix(c, BG_NEAR[i], glow * glow)))

  // הזרע: ממורכז, מוטה קלות
  const dx = x - 0.5
  const dy = y - 0.5
  const rx = dx * Math.cos(SEED_TILT) - dy * Math.sin(SEED_TILT)
  const ry = dx * Math.sin(SEED_TILT) + dy * Math.cos(SEED_TILT)

  // למרחב הזרע (0..12, 0..18)
  const sx = (rx / SEED_HEIGHT) * SEED_H + SEED_W / 2
  const sy = (ry / SEED_HEIGHT) * SEED_H + SEED_H / 2

  if (sx > -1 && sx < SEED_W + 1 && sy > -1 && sy < SEED_H + 1) {
    if (insidePolygon(sx, sy, SEED_POLY)) {
      // gradient קרם→זהוב לאורך האלכסון, כמו בקומפוננטה
      const t = clamp01((sx / SEED_W) * 0.5 + (sy / SEED_H) * 0.72 - 0.16)
      color =
        t < 0.5
          ? SEED_LIGHT.map((c, i) => Math.round(mix(c, SEED_MID[i], t / 0.5)))
          : SEED_MID.map((c, i) => Math.round(mix(c, SEED_DARK[i], (t - 0.5) / 0.5)))

      // קו התפר
      const seam = distanceToPolyline(sx, sy, SEAM_POLY)
      if (seam < 0.4) {
        const k = (1 - seam / 0.4) * 0.6
        color = color.map((c, i) => Math.round(mix(c, SEAM_COLOR[i], k)))
      }
    }
  }

  return [color[0], color[1], color[2], 255]
}

function render(size) {
  const SS = 4
  const buf = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [pr, pg, pb, pa] = sample(
            (x + (sx + 0.5) / SS) / size,
            (y + (sy + 0.5) / SS) / size
          )
          const w = pa / 255
          r += pr * w; g += pg * w; b += pb * w; a += pa
        }
      }
      const n = SS * SS
      const aSum = a / n
      const wSum = aSum / 255 || 1
      const i = (y * size + x) * 4
      buf[i] = Math.round(r / n / wSum)
      buf[i + 1] = Math.round(g / n / wSum)
      buf[i + 2] = Math.round(b / n / wSum)
      buf[i + 3] = Math.round(aSum)
    }
  }
  return encodePng(size, size, buf)
}

mkdirSync(OUT_DIR, { recursive: true })

// כל הגדלים שה-manifest וה-HTML מפנים אליהם.
// ה-maskable זהה בציור — הזרע ממילא יושב בתוך אזור הבטיחות.
for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-maskable-192.png', 192],
  ['icon-maskable-512.png', 512],
  ['icon-180.png', 180],
]) {
  writeFileSync(join(OUT_DIR, name), render(size))
  console.log(`✓ ${name} (${size}×${size})`)
}

// favicon וקטורי — אותה צורה בדיוק
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="72%">
      <stop offset="0%" stop-color="#2E2013"/>
      <stop offset="100%" stop-color="#100B07"/>
    </radialGradient>
    <linearGradient id="seed" x1="0.15" y1="0.05" x2="0.9" y2="0.95">
      <stop offset="0%" stop-color="#FFF3D6"/>
      <stop offset="50%" stop-color="#F0CE8C"/>
      <stop offset="100%" stop-color="#B07C2B"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" fill="url(#bg)"/>
  <g transform="translate(24 24) rotate(-12) scale(1.5467) translate(-6 -9)">
    <path d="${SEED_PATH}" fill="url(#seed)"/>
    <path d="${SEED_SEAM}" fill="none" stroke="#8A5A18" stroke-width="0.6" stroke-linecap="round" opacity="0.65"/>
  </g>
</svg>
`
writeFileSync(join(OUT_DIR, 'favicon.svg'), favicon)
console.log('✓ favicon.svg')
