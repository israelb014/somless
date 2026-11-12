// זרעי שומשום מפוזרים לאורך נתיב. הציר הארוך של הזרע מונח לאורך הנתיב.
import { useMemo } from 'react'
import { SEED_PATH, SEED_VARIANTS } from '../lib/seedShape.js'
import { pointsAlongPath } from '../lib/seedPlacement.js'

export default function SeedTrail({
  d,
  spacing = 7,
  size = 6.5,
  variant = 'cream',
  color = null,
  closed = false,
  opacity = 1,
  jitter = 0,
}) {
  const seeds = useMemo(() => pointsAlongPath(d, spacing, closed), [d, spacing, closed])
  const fill = color || SEED_VARIANTS[variant]?.light || '#F0DCB4'
  const k = size / 18

  return (
    <g opacity={opacity}>
      {seeds.map((p, i) => {
        // סטייה קטנה וקבועה לכל זרע — נראה מפוזר ביד, לא מכני
        const wobble = jitter ? ((i * 37) % 11) / 10 - 0.5 : 0
        const scale = jitter ? k * (0.86 + (((i * 23) % 7) / 7) * 0.3) : k
        return (
          <path
            key={i}
            d={SEED_PATH}
            fill={fill}
            transform={
              `translate(${(p.x + wobble * jitter).toFixed(2)} ${(p.y + wobble * jitter).toFixed(2)}) ` +
              `rotate(${(p.angle + 90).toFixed(1)}) scale(${scale.toFixed(4)}) translate(-6 -9)`
            }
          />
        )
      })}
    </g>
  )
}
