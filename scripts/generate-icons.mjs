// ---------------------------------------------------------------------------
// יצירת אייקוני ה-PWA (PNG) ללא תלויות חיצוניות.
// הצורה מצוירת וקטורית (SDF) ונדגמת ב-supersampling לקבלת קצוות חלקים.
// הרצה:  npm run icons
// ---------------------------------------------------------------------------
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- גיאומטריה (הכל בקואורדינטות 0..1) ------------------------------------

const mix = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

function sdRoundedRect(px, py, halfW, halfH, r) {
  const qx = Math.abs(px - 0.5) - (halfW - r)
  const qy = Math.abs(py - 0.5) - (halfH - r)
  const ax = Math.max(qx, 0)
  const ay = Math.max(qy, 0)
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r
}

function sdRing(px, py, cx, cy, radius, halfStroke) {
  return Math.abs(Math.hypot(px - cx, py - cy) - radius) - halfStroke
}

function sdSegment(px, py, ax, ay, bx, by, halfStroke) {
  const vx = bx - ax
  const vy = by - ay
  const wx = px - ax
  const wy = py - ay
  const t = clamp01((wx * vx + wy * vy) / (vx * vx + vy * vy))
  return Math.hypot(wx - vx * t, wy - vy * t) - halfStroke
}

const GREEN = [34, 197, 94]
const BG_NEAR = [22, 35, 60]
const BG_FAR = [11, 15, 26]

/** צבע הסצנה בנקודה (x, y) — מחזיר [r, g, b, a]. */
function sample(x, y, { maskable }) {
  // רקע: מרובע מעוגל (או מלא, במצב maskable)
  const bgDist = maskable ? -1 : sdRoundedRect(x, y, 0.5, 0.5, 0.23)
  if (bgDist > 0) return [0, 0, 0, 0]

  // radial glow עדין, בדומה לרקע האפליקציה
  const glow = clamp01(1 - Math.hypot(x - 0.68, y - 0.18) / 0.95)
  const bg = BG_FAR.map((c, i) => Math.round(mix(c, BG_NEAR[i], glow * glow)))

  let color = bg
  let alpha = 1

  // טבעת + וי — אותה שפה ויזואלית של אינדיקטור הסטטוס באפליקציה
  const scale = maskable ? 0.78 : 1 // maskable: הצורה קטנה יותר, בתוך אזור הבטיחות
  const radius = 0.3 * scale
  const stroke = 0.078 * scale

  const ring = sdRing(x, y, 0.5, 0.5, radius, stroke / 2)
  const c1 = sdSegment(x, y, 0.5 - 0.13 * scale, 0.5 + 0.01 * scale, 0.5 - 0.035 * scale, 0.5 + 0.1 * scale, stroke / 2)
  const c2 = sdSegment(x, y, 0.5 - 0.035 * scale, 0.5 + 0.1 * scale, 0.5 + 0.14 * scale, 0.5 - 0.11 * scale, stroke / 2)
  const mark = Math.min(ring, c1, c2)

  if (mark < 0) color = GREEN
  else if (ring < 0.02) {
    // הילה רכה סביב הטבעת
    const t = clamp01(1 - ring / 0.02) * 0.18
    color = bg.map((c, i) => Math.round(mix(c, GREEN[i], t)))
  }

  return [color[0], color[1], color[2], alpha * 255]
}

function render(size, opts) {
  const SS = 4 // supersampling לכל ציר
  const buf = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / size
          const py = (y + (sy + 0.5) / SS) / size
          const [sr, sg, sb, sa] = sample(px, py, opts)
          const w = sa / 255
          r += sr * w
          g += sg * w
          b += sb * w
          a += sa
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

const targets = [
  ['icon-192.png', 192, { maskable: false }],
  ['icon-512.png', 512, { maskable: false }],
  ['icon-180.png', 180, { maskable: false }],
  ['icon-maskable-512.png', 512, { maskable: true }],
]

for (const [name, size, opts] of targets) {
  writeFileSync(join(OUT_DIR, name), render(size, opts))
  console.log(`✓ ${name} (${size}×${size})`)
}

// favicon וקטורי — אותה צורה, ללא תלות בגודל
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="11" fill="#0B0F1A"/>
  <circle cx="24" cy="24" r="14.4" fill="none" stroke="#22C55E" stroke-width="3.7"/>
  <path d="M17.7 24.5l4.5 4.5 8.3-9.5" fill="none" stroke="#22C55E" stroke-width="3.7"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
writeFileSync(join(OUT_DIR, 'favicon.svg'), favicon)
console.log('✓ favicon.svg')
