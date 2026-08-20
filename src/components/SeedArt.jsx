// איורים בנויים מזרעים: ערימת שומשום עם זכוכית מגדלת (מצב ריק),
// וערימה סטטית לתחתית מסך הדיסקליימר.
import { SEED_PATH, SEED_SEAM, SEED_VARIANTS } from '../lib/seedShape.js'

// מספרים קבועים — אין Math.random ברינדור, כדי שהאיור יהיה יציב
const HEAP = [
  [46, 116, 12, -8], [62, 118, 13, 22], [78, 115, 12, -30], [94, 118, 13, 10],
  [110, 116, 12, 35], [54, 106, 12, 48], [70, 104, 13, -18], [86, 105, 12, 28],
  [102, 106, 12, -42], [62, 94, 12, 14], [78, 92, 13, -26], [94, 94, 12, 40],
  [70, 82, 12, -12], [86, 82, 12, 30], [78, 71, 12, 4],
]

function Seed({ x, y, h, rot, variant = 'cream', opacity = 1 }) {
  const v = SEED_VARIANTS[variant]
  const k = h / 18
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${k}) translate(-6 -9)`}
      opacity={opacity}
    >
      <path d={SEED_PATH} fill={v.light} />
      <path d={SEED_PATH} fill={v.dark} opacity="0.35" />
      <path d={SEED_SEAM} fill="none" stroke={v.seam} strokeWidth="0.8" strokeLinecap="round" />
    </g>
  )
}

/** מצב ריק / אין תוצאות — ערימת שומשומים עם זכוכית מגדלת מזרעים. */
export function EmptySeedArt({ width = 220 }) {
  const lensSeeds = 16
  const cx = 150
  const cy = 54
  const r = 30

  return (
    <svg
      width={width}
      viewBox="0 0 220 140"
      className="seed-art"
      aria-hidden="true"
      focusable="false"
    >
      {/* צל רך מתחת לערימה */}
      <ellipse cx="78" cy="125" rx="48" ry="8" fill="rgba(0,0,0,0.28)" />

      {HEAP.map(([x, y, h, rot], i) => (
        <Seed
          key={i}
          x={x}
          y={y}
          h={h}
          rot={rot}
          variant={i % 4 === 0 ? 'toasted' : i % 7 === 0 ? 'black' : 'cream'}
        />
      ))}

      {/* ידית הזכוכית */}
      <line
        x1={cx - 20}
        y1={cy + 20}
        x2="112"
        y2="96"
        stroke="var(--gold)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* עדשה */}
      <circle cx={cx} cy={cy} r={r - 4} fill="rgba(255,240,210,0.07)" />
      <Seed x={cx - 7} y={cy + 2} h={17} rot={-22} variant="cream" />
      <Seed x={cx + 8} y={cy - 4} h={15} rot={28} variant="toasted" />
      {Array.from({ length: lensSeeds }, (_, i) => {
        const a = (i / lensSeeds) * 360
        const rad = (a * Math.PI) / 180
        return (
          <Seed
            key={`l${i}`}
            x={cx + r * Math.sin(rad)}
            y={cy - r * Math.cos(rad)}
            h={11}
            rot={a}
            variant="toasted"
          />
        )
      })}
    </svg>
  )
}

/** ערימה סטטית בתחתית מסך הדיסקליימר. */
export function SeedDrift({ count = 30 }) {
  const seeds = []
  for (let i = 0; i < count; i++) {
    // פיזור דטרמיניסטי — נראה אקראי, יציב בין רינדורים
    const x = ((i * 37) % 100) + (i % 3) * 1.7
    const row = i % 3
    const y = 30 - row * 8 - ((i * 13) % 5)
    seeds.push(
      <Seed
        key={i}
        x={x}
        y={y}
        h={7 + ((i * 7) % 4)}
        rot={(i * 53) % 360}
        variant={i % 4 === 0 ? 'toasted' : i % 9 === 0 ? 'black' : 'cream'}
        opacity={0.55 + (row * 0.15)}
      />
    )
  }
  return (
    <svg
      viewBox="0 0 100 34"
      preserveAspectRatio="none"
      className="seed-drift"
      aria-hidden="true"
      focusable="false"
    >
      {seeds}
    </svg>
  )
}
