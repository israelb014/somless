// אינדיקטור הסטטוס: הטבעת נבנית מזרעי שומשום קטנים שמתמקמים
// בזה אחר זה סביב המעגל, בצבע הסטטוס.
import { SEED_PATH, SEED_SEAM } from '../lib/seedShape.js'
import { STATUSES } from '../config.js'

const UNKNOWN = { color: '#B99B6A', label: 'לא במאגר' }

const SEEDS = 14
const RING_R = 18
const SEED_H = 7
const BUILD_MS = 400

function RingSeeds({ color, animate }) {
  const k = SEED_H / 18
  return (
    <g>
      {Array.from({ length: SEEDS }, (_, i) => {
        const a = (i / SEEDS) * 360
        const rad = (a * Math.PI) / 180
        const x = 24 + RING_R * Math.sin(rad)
        const y = 24 - RING_R * Math.cos(rad)
        // המיקום נשאר על ה-g החיצוני; האנימציה רצה על g פנימי, אחרת
        // ה-transform של ה-CSS דורס את טרנספורם המיקום ומקריס את הזרעים
        return (
          <g
            key={i}
            transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${a.toFixed(1)}) scale(${k.toFixed(4)}) translate(-6 -9)`}
          >
            <g
              className={animate ? 'ring-seed' : undefined}
              style={animate ? { animationDelay: `${((i * BUILD_MS) / SEEDS).toFixed(0)}ms` } : undefined}
            >
              <path d={SEED_PATH} fill={color} />
              <path
                d={SEED_SEAM}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </g>
          </g>
        )
      })}
    </g>
  )
}

function InnerGlyph({ status, color }) {
  const s = {
    fill: 'none',
    stroke: color,
    strokeWidth: 3.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  if (status === 'contains') return <path d="M18.4 18.4l11.2 11.2M29.6 18.4L18.4 29.6" {...s} />
  if (status === 'may_contain') {
    return (
      <>
        <path d="M24 16.6v10.2" {...s} />
        <circle cx="24" cy="31.6" r="1.8" fill={color} />
      </>
    )
  }
  if (status === 'safe') return <path d="M17.6 24.4l4.8 4.8L30.6 19.4" {...s} />
  return (
    <>
      <path d="M20.2 20.6a4.2 4.2 0 118.2 1.3c-.6 1.8-3.3 2.4-3.3 4.6" {...s} />
      <circle cx="24.7" cy="31.4" r="1.8" fill={color} />
    </>
  )
}

export default function StatusRing({ status, size = 48, animate = true }) {
  const meta = STATUSES[status] || UNKNOWN
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={meta.label}
      style={{ flexShrink: 0 }}
    >
      {/* דיסק כהה — מבטיח שצבעי הסטטוס בולטים גם על כרטיס קרם */}
      <circle cx="24" cy="24" r="23" fill="var(--disc)" />
      <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      <RingSeeds color={meta.color} animate={animate} />
      <InnerGlyph status={status} color={meta.color} />
    </svg>
  )
}
