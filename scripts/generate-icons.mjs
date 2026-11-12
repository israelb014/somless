// ---------------------------------------------------------------------------
// יצירת אייקוני ה-PWA מתוך assets/icon-source.png — הריבוע המעוגל עם הזרע
// וטבעת השומשום, בלי תלויות חיצוניות.
//
//   any       — המקור כפי שהוא (פינות שקופות; מערכות ההפעלה חותכות בעצמן)
//   maskable  — התוכן מוקטן ל-78% על רקע אחיד #1E1610, בתוך אזור הבטיחות
//
// הרצה:  npm run icons
// ---------------------------------------------------------------------------
import { deflateSync, inflateSync } from 'node:zlib'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SEED_PATH, SEED_SEAM } from '../src/lib/seedShape.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'icons')
const SOURCE = join(ROOT, 'assets', 'icon-source.png')
const MASKABLE_BG = [0x1e, 0x16, 0x10]

// --- CRC + chunks ---------------------------------------------------------

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

// --- decode (RGBA/8, כל חמשת הפילטרים) -----------------------------------

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

function decodePng(buf) {
  let pos = 8
  let width = 0
  let height = 0
  let colorType = 6
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      colorType = data[9]
    } else if (type === 'IDAT') idat.push(data)
    pos += 12 + len
  }
  if (colorType !== 6) throw new Error(`expected RGBA source, got colour type ${colorType}`)

  const raw = inflateSync(Buffer.concat(idat))
  const bpp = 4
  const stride = width * bpp
  const out = Buffer.alloc(stride * height)
  let off = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[off++]
    const row = raw.subarray(off, off + stride)
    off += stride
    const cur = out.subarray(y * stride, (y + 1) * stride)
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0
      const b = prev ? prev[i] : 0
      const c = prev && i >= bpp ? prev[i - bpp] : 0
      let v = row[i]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) v += paeth(a, b, c)
      cur[i] = v & 0xff
    }
  }
  return { width, height, px: out }
}

/** הקטנה בממוצע שטח — חדה ונקייה לאייקונים. */
function resize(src, size) {
  const out = Buffer.alloc(size * size * 4)
  const ratio = src.width / size
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * ratio)
    const y1 = Math.min(Math.ceil((y + 1) * ratio), src.height)
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * ratio)
      const x1 = Math.min(Math.ceil((x + 1) * ratio), src.width)
      let r = 0, g = 0, b = 0, a = 0, n = 0
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * src.width + sx) * 4
          const al = src.px[i + 3] / 255
          r += src.px[i] * al
          g += src.px[i + 1] * al
          b += src.px[i + 2] * al
          a += src.px[i + 3]
          n++
        }
      }
      const i = (y * size + x) * 4
      const alpha = a / n
      const w = alpha / 255 || 1
      out[i] = Math.round(r / n / w)
      out[i + 1] = Math.round(g / n / w)
      out[i + 2] = Math.round(b / n / w)
      out[i + 3] = Math.round(alpha)
    }
  }
  return { width: size, height: size, px: out }
}

/** מרכיב את התוכן המוקטן על רקע אחיד — גרסת maskable. */
function onSolid(img, size, scale) {
  const inner = resize(img, Math.round(size * scale))
  const out = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    out[i * 4] = MASKABLE_BG[0]
    out[i * 4 + 1] = MASKABLE_BG[1]
    out[i * 4 + 2] = MASKABLE_BG[2]
    out[i * 4 + 3] = 255
  }
  const off = Math.round((size - inner.width) / 2)
  for (let y = 0; y < inner.height; y++) {
    for (let x = 0; x < inner.width; x++) {
      const s = (y * inner.width + x) * 4
      const alpha = inner.px[s + 3] / 255
      if (alpha === 0) continue
      const d = ((y + off) * size + (x + off)) * 4
      for (let k = 0; k < 3; k++) {
        out[d + k] = Math.round(inner.px[s + k] * alpha + out[d + k] * (1 - alpha))
      }
    }
  }
  return { width: size, height: size, px: out }
}

mkdirSync(OUT_DIR, { recursive: true })
const source = decodePng(readFileSync(SOURCE))
console.log(`source ${source.width}×${source.height}`)

for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-180.png', 180],
]) {
  const img = size === source.width ? source : resize(source, size)
  writeFileSync(join(OUT_DIR, name), encodePng(size, size, img.px))
  console.log(`✓ ${name} (${size}×${size})`)
}

for (const [name, size] of [
  ['icon-maskable-192.png', 192],
  ['icon-maskable-512.png', 512],
]) {
  const img = onSolid(source, size, 0.78)
  writeFileSync(join(OUT_DIR, name), encodePng(size, size, img.px))
  console.log(`✓ ${name} (${size}×${size}, safe zone)`)
}

// favicon — אותו רעיון בווקטור: זרע מרכזי וטבעת זרעים
const RING = 22
const ringSeeds = Array.from({ length: RING }, (_, i) => {
  const a = (i / RING) * 360
  const rad = (a * Math.PI) / 180
  const x = (24 + 17.4 * Math.sin(rad)).toFixed(2)
  const y = (24 - 17.4 * Math.cos(rad)).toFixed(2)
  return `<g transform="translate(${x} ${y}) rotate(${a.toFixed(1)}) scale(0.26) translate(-6 -9)"><path d="${SEED_PATH}" fill="#EFE0C0"/></g>`
}).join('')

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="bg" cx="50%" cy="46%" r="70%">
      <stop offset="0%" stop-color="#3A2A1C"/>
      <stop offset="100%" stop-color="#191109"/>
    </radialGradient>
    <linearGradient id="seed" x1="0.2" y1="0.05" x2="0.85" y2="0.95">
      <stop offset="0%" stop-color="#FFF6E2"/>
      <stop offset="55%" stop-color="#F0DCB0"/>
      <stop offset="100%" stop-color="#C9A463"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="11" fill="url(#bg)"/>
  ${ringSeeds}
  <g transform="translate(24 24) rotate(-10) scale(1.15) translate(-6 -9)">
    <path d="${SEED_PATH}" fill="url(#seed)"/>
    <path d="${SEED_SEAM}" fill="none" stroke="#B4914E" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>
  </g>
</svg>
`
writeFileSync(join(OUT_DIR, 'favicon.svg'), favicon)
console.log('✓ favicon.svg')
