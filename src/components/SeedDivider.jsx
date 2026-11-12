// קו מפריד עשוי זרעים.
import SeedTrail from './SeedTrail.jsx'
import { useElementSize } from '../hooks/useElementSize.js'

export default function SeedDivider({ spacing = 8, size = 6.5, opacity = 0.85 }) {
  const [ref, { width }] = useElementSize()
  const h = size + 2

  return (
    <span ref={ref} className="seed-divider" aria-hidden="true">
      {width > 8 ? (
        <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} focusable="false">
          <SeedTrail
            d={`M2 ${h / 2} L${width - 2} ${h / 2}`}
            spacing={spacing}
            size={size}
            variant="toasted"
            opacity={opacity}
            jitter={0.7}
          />
        </svg>
      ) : null}
    </span>
  )
}
