// ---------------------------------------------------------------------------
// יצירת אייקוני ה-PWA (PNG) ללא תלויות חיצוניות.
// האייקון: זרע שומשום זהוב על רקע חום-שחור עם glow חם.
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

const BG_FAR = hex('#140F0B')
const BG_NEAR = hex('#2A1D12')
const SEED_LIGHT = hex('#F7DCA0')
const SEED_DARK = hex('#B57F2C')
const SEAM_COLOR = hex('#7A4E14')
const GLOW = hex('#D9A441')

function sdRoundedRect(px, py, half, r) {
  const qx = Math.abs(px - 0.5) - (half - r)
  const qy = Math.abs(py - 0.5) - (half - r)
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
}

/** צבע הסצנה בנקודה (x, y) בטווח 0..1 — מחזיר [r, g, b, a]. */
function sample(x, y, { maskable }) {
  if (!maskable && sdRoundedRect(x, y, 0.5, 0.23) > 0) return [0, 0, 0, 0]

  // רקע חם עם radial glow, כמו באפליקציה
  const glow = clamp01(1 - Math.hypot(x - 0.66, y - 0.2) / 0.95)
  let color = BG_FAR.map((c, i) => Math.round(mix(c, BG_NEAR[i], glow * glow)))

  // הזרע: מסובב קלות, ממורכז
  const scale = maskable ? 0.5 : 0.64 // גובה הזרע כשבר מהאייקון
  const ang = (-13 * Math.PI) / 180
  const dx = x - 0.5
  const dy = y - 0.5
  const rx = dx * Math.cos(ang) - dy * Math.sin(ang)
  const ry = dx * Math.sin(ang) + dy * Math.cos(ang)

  // למרחב הזרע (0..12, 0..18)
  const sx = (rx / scale) * SEED_H + SEED_W / 2
  const sy = (ry / scale) * SEED_H + SEED_H / 2

  // הילה זהובה רכה סביב הזרע
  const halo = clamp01(1 - Math.hypot(rx, ry) / (scale * 0.85))
  if (halo > 0) color = color.map((c, i) => Math.round(mix(c, GLOW[i], halo * halo * 0.28)))

  if (sx > -1 && sx < SEED_W + 1 && sy > -1 && sy < SEED_H + 1) {
    if (insidePolygon(sx, sy, SEED_POLY)) {
      // gradient קרם→זהוב לאורך האלכסון
      const t = clamp01((sx / SEED_W) * 0.55 + (sy / SEED_H) * 0.65 - 0.12)
      color = SEED_LIGHT.map((c, i) => Math.round(mix(c, SEED_DARK[i], t)))
      // קו התפר
      const seam = distanceToPolyline(sx, sy, SEAM_POLY)
      if (seam < 0.42) {
        const k = (1 - seam / 0.42) * 0.75
        color = color.map((c, i) => Math.round(mix(c, SEAM_COLOR[i], k)))
      }
    }
  }

  return [color[0], color[1], color[2], 255]
}

function render(size, opts) {
  const SS = 4
  const buf = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [pr, pg, pb, pa] = sample(
            (x + (sx + 0.5) / SS) / size,
            (y + (sy + 0.5) / SS) / size,
            opts
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

for (const [name, size, opts] of [
  ['icon-192.png', 192, { maskable: false }],
  ['icon-512.png', 512, { maskable: false }],
  ['icon-180.png', 180, { maskable: false }],
  ['icon-maskable-512.png', 512, { maskable: true }],
]) {
  writeFileSync(join(OUT_DIR, name), render(size, opts))
  console.log(`✓ ${name} (${size}×${size})`)
}

// favicon וקטורי — אותה צורה בדיוק
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="11" fill="#140F0B"/>
  <circle cx="30" cy="14" r="26" fill="#D9A441" opacity="0.16"/>
  <g transform="translate(24 24) rotate(-13) scale(1.75) translate(-6 -9)">
    <linearGradient id="s" x1="0.15" y1="0.05" x2="0.9" y2="0.95">
      <stop offset="0%" stop-color="#F7DCA0"/>
      <stop offset="100%" stop-color="#B57F2C"/>
    </linearGradient>
    <path d="${SEED_PATH}" fill="url(#s)"/>
    <path d="${SEED_SEAM}" fill="none" stroke="#7A4E14" stroke-width="0.7" stroke-linecap="round" opacity="0.8"/>
  </g>
</svg>
`
writeFileSync(join(OUT_DIR, 'favicon.svg'), favicon)
console.log('✓ favicon.svg')
