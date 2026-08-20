// ---------------------------------------------------------------------------
// מנוע הפרטיקלים: canvas יחיד גלובלי לכל אפקטי השומשום.
//
// כללים קשיחים:
//  · אפס עבודה כשאין אנימציה פעילה — ה-rAF נעצר לגמרי והקנבס מנוקה.
//  · pooling: אובייקטי הפרטיקלים ממוחזרים, אין הקצאות בלולאה.
//  · הזרעים מצוירים מ-sprites שנוצרים פעם אחת, לא path+gradient לכל פרטיקל.
//  · הקנבס הוא pointer-events: none — לעולם לא חוסם לחיצות.
// ---------------------------------------------------------------------------
import { SEED_PATH, SEED_SEAM, SEED_VARIANTS, SEED_W, SEED_H } from './seedShape.js'

const MAX_PARTICLES = 240
const SPRITE_H = 64

let canvas = null
let ctx = null
let dpr = 1
let viewW = 0
let viewH = 0
let rafId = null
let lastTs = 0
let enabled = true

const active = []
const pool = []
const sprites = {}

// --- sprites -------------------------------------------------------------

function buildSprite(variant) {
  const v = SEED_VARIANTS[variant]
  const scale = SPRITE_H / SEED_H
  const w = Math.ceil(SEED_W * scale)
  const h = SPRITE_H
  const c = document.createElement('canvas')
  c.width = Math.ceil(w * 2)
  c.height = Math.ceil(h * 2)
  const g = c.getContext('2d')
  g.scale(scale * 2, scale * 2)

  const grad = g.createLinearGradient(SEED_W * 0.15, 0, SEED_W * 0.9, SEED_H)
  grad.addColorStop(0, v.light)
  grad.addColorStop(0.55, v.light)
  grad.addColorStop(1, v.dark)

  const body = new Path2D(SEED_PATH)
  g.fillStyle = grad
  g.fill(body)

  const seam = new Path2D(SEED_SEAM)
  g.strokeStyle = v.seam
  g.lineWidth = 0.7
  g.lineCap = 'round'
  g.globalAlpha = 0.75
  g.stroke(seam)
  g.globalAlpha = 1

  return { canvas: c, w, h }
}

function spriteFor(variant) {
  if (!sprites[variant]) sprites[variant] = buildSprite(variant)
  return sprites[variant]
}

// --- מחזור חיים של הקנבס --------------------------------------------------

export function attachCanvas(el) {
  canvas = el
  ctx = el.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  return () => {
    window.removeEventListener('resize', resize)
    stop()
    canvas = null
    ctx = null
  }
}

function resize() {
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  viewW = window.innerWidth
  viewH = window.innerHeight
  canvas.width = Math.floor(viewW * dpr)
  canvas.height = Math.floor(viewH * dpr)
  canvas.style.width = `${viewW}px`
  canvas.style.height = `${viewH}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

export function setEnabled(value) {
  enabled = Boolean(value)
  if (!enabled) clearAll()
}

export function isEnabled() {
  return enabled
}

function clearAll() {
  while (active.length) pool.push(active.pop())
  stop()
}

function stop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (ctx) ctx.clearRect(0, 0, viewW, viewH)
  lastTs = 0
}

// --- pooling --------------------------------------------------------------

function take() {
  return pool.pop() || {
    x: 0, y: 0, vx: 0, vy: 0, rot: 0, vrot: 0, size: 0,
    gravity: 0, sway: 0, swayPhase: 0, swaySpeed: 0,
    life: 0, maxLife: 0, fadeIn: 0, variant: 'cream',
  }
}

function spawn(p) {
  if (active.length >= MAX_PARTICLES) {
    pool.push(p)
    return
  }
  active.push(p)
}

function ensureRunning() {
  if (rafId === null && active.length > 0) {
    lastTs = 0
    rafId = requestAnimationFrame(frame)
  }
}

// --- לולאת האנימציה -------------------------------------------------------

function frame(ts) {
  if (!ctx) {
    rafId = null
    return
  }
  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 1 / 30) : 1 / 60
  lastTs = ts

  ctx.clearRect(0, 0, viewW, viewH)

  for (let i = active.length - 1; i >= 0; i--) {
    const p = active[i]
    p.life += dt

    if (p.life >= p.maxLife) {
      active.splice(i, 1)
      pool.push(p)
      continue
    }

    p.vy += p.gravity * dt
    p.swayPhase += p.swaySpeed * dt
    p.x += (p.vx + Math.sin(p.swayPhase) * p.sway) * dt
    p.y += p.vy * dt
    p.rot += p.vrot * dt

    // הופעה רכה בהתחלה, dissolve בסוף
    const t = p.life / p.maxLife
    let alpha = 1
    if (p.fadeIn > 0 && p.life < p.fadeIn) alpha = p.life / p.fadeIn
    if (t > 0.72) alpha *= 1 - (t - 0.72) / 0.28

    if (alpha <= 0.01) continue

    const s = spriteFor(p.variant)
    const h = p.size
    const w = (h * s.w) / s.h

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.drawImage(s.canvas, -w / 2, -h / 2, w, h)
    ctx.restore()
  }

  if (active.length === 0) {
    stop()
    return
  }
  rafId = requestAnimationFrame(frame)
}

// --- אפקטים ---------------------------------------------------------------

const VARIANTS = ['cream', 'cream', 'toasted', 'toasted', 'black']
const pick = () => VARIANTS[(Math.random() * VARIANTS.length) | 0]
const rand = (a, b) => a + Math.random() * (b - a)

/** 1. מטר שומשומים על כל המסך — מעבר בין מסכים. */
export function rain(count = 78) {
  if (!enabled || !ctx) return
  const n = Math.min(count, MAX_PARTICLES - active.length)
  for (let i = 0; i < n; i++) {
    const p = take()
    p.size = rand(9, 20)
    p.x = rand(-20, viewW + 20)
    p.y = rand(-viewH * 0.55, -20)
    p.vx = rand(-25, 25)
    p.vy = rand(viewH * 0.9, viewH * 1.9)
    p.gravity = 420
    p.sway = rand(18, 55)
    p.swayPhase = rand(0, Math.PI * 2)
    p.swaySpeed = rand(2.4, 4.6)
    p.rot = rand(0, Math.PI * 2)
    p.vrot = rand(-4.5, 4.5)
    p.life = 0
    p.maxLife = rand(0.72, 0.9)
    p.fadeIn = 0.08
    p.variant = pick()
    spawn(p)
  }
  ensureRunning()
}

/** 2. הקלדה — 2–3 זרעים קטנים מתעופפים משדה החיפוש. */
export function pop(x, y, count = 0) {
  if (!enabled || !ctx) return
  const n = count || 2 + ((Math.random() * 2) | 0)
  for (let i = 0; i < n; i++) {
    const p = take()
    p.size = rand(6, 10)
    p.x = x + rand(-14, 14)
    p.y = y + rand(-6, 6)
    p.vx = rand(-90, 90)
    p.vy = rand(-260, -150)
    p.gravity = 620
    p.sway = rand(6, 18)
    p.swayPhase = rand(0, Math.PI * 2)
    p.swaySpeed = rand(3, 6)
    p.rot = rand(0, Math.PI * 2)
    p.vrot = rand(-9, 9)
    p.life = 0
    p.maxLife = rand(0.45, 0.62)
    p.fadeIn = 0
    p.variant = pick()
    spawn(p)
  }
  ensureRunning()
}

/** 3. לחיצה — burst בקשת עם כבידה. */
export function burst(x, y, count = 0) {
  if (!enabled || !ctx) return
  const n = count || 8 + ((Math.random() * 5) | 0)
  for (let i = 0; i < n; i++) {
    // קשת כלפי מעלה, מפוזרת סביב האנך
    const angle = -Math.PI / 2 + rand(-1.05, 1.05)
    const speed = rand(170, 360)
    const p = take()
    p.size = rand(7, 13)
    p.x = x
    p.y = y
    p.vx = Math.cos(angle) * speed
    p.vy = Math.sin(angle) * speed
    p.gravity = 980
    p.sway = 0
    p.swayPhase = 0
    p.swaySpeed = 0
    p.rot = rand(0, Math.PI * 2)
    p.vrot = rand(-12, 12)
    p.life = 0
    p.maxLife = rand(0.6, 0.8)
    p.fadeIn = 0
    p.variant = pick()
    spawn(p)
  }
  ensureRunning()
}
