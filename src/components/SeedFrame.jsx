// מסגרת עשויה זרעי שומשום סביב אלמנט (שדה חיפוש, שדה טופס, כרטיס).
// ה-SVG נמדד בפיקסלים אמיתיים כדי שהזרעים לא יימתחו.
import SeedTrail from './SeedTrail.jsx'
import { roundedRectPath } from '../lib/seedPlacement.js'
import { useElementSize } from '../hooks/useElementSize.js'

export default function SeedFrame({ radius = 26, spacing = 9, size = 7.5, className = '' }) {
  const [ref, { width, height }] = useElementSize()
  const inset = size / 2
  const w = Math.max(width - inset * 2, 0)
  const h = Math.max(height - inset * 2, 0)
  const ready = w > 4 && h > 4

  return (
    <span ref={ref} className={`seed-frame ${className}`} aria-hidden="true">
      {ready ? (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} focusable="false">
          <g transform={`translate(${inset} ${inset})`}>
            <SeedTrail
              d={roundedRectPath(w, h, radius)}
              spacing={spacing}
              size={size}
              variant="cream"
              closed
              jitter={0.6}
            />
          </g>
        </svg>
      ) : null}
    </span>
  )
}
