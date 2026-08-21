// חלון המטרה של הסריקה: פינות זהובות מודגשות וזרעי שומשום עדינים סביבו.
import SesameSeed from './SesameSeed.jsx'

const CORNERS = ['tl', 'tr', 'bl', 'br']
const SEEDS = [
  { top: '-26px', start: '6%', size: 14, rot: -22, variant: 'toasted' },
  { top: '-16px', start: '82%', size: 11, rot: 34, variant: 'cream' },
  { bottom: '-24px', start: '18%', size: 12, rot: 48, variant: 'cream' },
  { bottom: '-28px', start: '72%', size: 13, rot: -36, variant: 'toasted' },
]

export default function ScanTarget() {
  return (
    <div className="scan-target" aria-hidden="true">
      {CORNERS.map((c) => (
        <span key={c} className={`scan-target__corner scan-target__corner--${c}`} />
      ))}
      {SEEDS.map((s, i) => (
        <span
          key={i}
          className="scan-target__seed"
          style={{ top: s.top, bottom: s.bottom, insetInlineStart: s.start }}
        >
          <SesameSeed variant={s.variant} size={s.size} rotate={s.rot} />
        </span>
      ))}
    </div>
  )
}
