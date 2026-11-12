// ערימת זרעים סטטית לתחתית מסך הדיסקליימר.
import { SEED_PATH, SEED_SEAM, SEED_VARIANTS } from '../lib/seedShape.js'

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
