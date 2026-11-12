// טבעת זרעים לבנים שמתפזרת החוצה בפיצוץ קצר ונעצרת, עם סימן אזהרה במרכז.
import { useMemo } from 'react'
import { SEED_PATH } from '../lib/seedShape.js'

const SEEDS = 54
const VIEW = 300
const CENTER = VIEW / 2

export default function AlertBurst({ color, animate = true, size = 260 }) {
  const seeds = useMemo(() => {
    const out = []
    for (let i = 0; i < SEEDS; i++) {
      // פיזור דטרמיניסטי — נראה אקראי, יציב בין רינדורים
      const a = (i / SEEDS) * Math.PI * 2 + ((i * 7) % 11) * 0.012
      const ring = 86 + ((i * 13) % 5) * 7
      const spread = 1 + ((i * 17) % 9) * 0.035
      out.push({
        a,
        from: ring * 0.52,
        to: ring * spread,
        scale: 0.82 + ((i * 23) % 7) / 16,
        rot: ((i * 53) % 360),
        delay: ((i * 29) % 13) * 0.014,
      })
    }
    return out
  }, [])

  return (
    <svg
      className={`alert-burst${animate ? ' is-bursting' : ''}`}
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      aria-hidden="true"
      focusable="false"
    >
      {seeds.map((s, i) => {
        const k = (11 * s.scale) / 18
        const fx = CENTER + Math.cos(s.a) * s.from
        const fy = CENTER + Math.sin(s.a) * s.from
        const tx = Math.cos(s.a) * (s.to - s.from)
        const ty = Math.sin(s.a) * (s.to - s.from)
        return (
          <g
            key={i}
            className="alert-burst__seed"
            style={{ '--tx': `${tx.toFixed(1)}px`, '--ty': `${ty.toFixed(1)}px`, animationDelay: `${s.delay}s` }}
          >
            <path
              d={SEED_PATH}
              fill="#FFF6E2"
              transform={`translate(${fx.toFixed(1)} ${fy.toFixed(1)}) rotate(${s.rot}) scale(${k.toFixed(3)}) translate(-6 -9)`}
            />
          </g>
        )
      })}

      {/* סימן האזהרה במרכז */}
      <circle cx={CENTER} cy={CENTER} r="56" fill="rgba(0,0,0,0.18)" />
      <path
        d="M150 118 L182 174 H118 Z"
        fill="none"
        stroke="#FFF6E2"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <path d="M150 138 V153" stroke={color} strokeWidth="9" strokeLinecap="round" />
      <circle cx="150" cy="164" r="5" fill={color} />
    </svg>
  )
}
