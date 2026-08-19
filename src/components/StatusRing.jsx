// אינדיקטור הסטטוס: טבעת SVG צבעונית עם אייקון בפנים.
// X = מכיל, ! = עלול להכיל, ✓ = בטוח, ? = לא במאגר.
import { STATUSES } from '../config.js'

const UNKNOWN = { color: '#94A3B8', tint: 'rgba(148, 163, 184, 0.12)', label: 'לא במאגר' }

function InnerGlyph({ status }) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  if (status === 'contains') {
    return <path d="M17.5 17.5l13 13M30.5 17.5l-13 13" {...stroke} />
  }
  if (status === 'may_contain') {
    return (
      <>
        <path d="M24 15.5v11.5" {...stroke} />
        <circle cx="24" cy="32.5" r="1.9" fill="currentColor" />
      </>
    )
  }
  if (status === 'safe') {
    return <path d="M16.5 24.5l5.2 5.2L31.5 19" {...stroke} />
  }
  // לא נמצא במאגר
  return (
    <>
      <path d="M19.5 20a4.6 4.6 0 119 1.4c-.7 2-3.6 2.6-3.6 5.1" {...stroke} />
      <circle cx="24.6" cy="32.3" r="1.9" fill="currentColor" />
    </>
  )
}

export default function StatusRing({ status, size = 48, animate = true }) {
  const meta = STATUSES[status] || UNKNOWN
  const r = 20
  const circumference = 2 * Math.PI * r

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={meta.label}
      style={{ color: meta.color, flexShrink: 0 }}
    >
      <circle cx="24" cy="24" r="22" fill={meta.tint} />
      <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3.5" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={0}
        transform="rotate(-90 24 24)"
        className={animate ? 'ring-draw' : undefined}
        style={animate ? { '--ring-len': circumference } : undefined}
      />
      <InnerGlyph status={status} />
    </svg>
  )
}
