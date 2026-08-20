// ---------------------------------------------------------------------------
// רכיב הליבה: זרע שומשום. כל שומשום באפליקציה נגזר מכאן.
// שלושה גוונים (קרם / זהוב קלוי / שחור), או צבע יחיד מפורש דרך color.
// ---------------------------------------------------------------------------
import { useId } from 'react'
import {
  SEED_PATH,
  SEED_SEAM,
  SEED_SHINE,
  SEED_VARIANTS,
  SEED_VIEWBOX,
  SEED_W,
  SEED_H,
} from '../lib/seedShape.js'

export default function SesameSeed({
  variant = 'cream',
  size = 18,
  rotate = 0,
  color = null, // עוקף את הגוון — לשימוש בטבעת הסטטוס
  seam = true,
  className,
  style,
  ...rest
}) {
  const id = useId().replace(/:/g, '')
  const v = SEED_VARIANTS[variant] || SEED_VARIANTS.cream
  const width = (size * SEED_W) / SEED_H

  return (
    <svg
      width={width}
      height={size}
      viewBox={SEED_VIEWBOX}
      className={className}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {color ? null : (
        <defs>
          <linearGradient id={`g${id}`} x1="0.15" y1="0.05" x2="0.9" y2="0.95">
            <stop offset="0%" stopColor={v.light} />
            <stop offset="55%" stopColor={v.light} />
            <stop offset="100%" stopColor={v.dark} />
          </linearGradient>
        </defs>
      )}

      <path d={SEED_PATH} fill={color || `url(#g${id})`} />

      {seam ? (
        <path
          d={SEED_SEAM}
          fill="none"
          stroke={color ? 'rgba(0,0,0,0.28)' : v.seam}
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.75"
        />
      ) : null}

      <path
        d={SEED_SHINE}
        fill="none"
        stroke={color ? 'rgba(255,255,255,0.5)' : v.shine}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity={color ? 0.45 : 0.6}
      />
    </svg>
  )
}
