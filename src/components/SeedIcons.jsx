// אייקוני הניווט והמתגים — כל קו בנוי מזרעי שומשום.
import SeedTrail from './SeedTrail.jsx'
import { SEED_PATH } from '../lib/seedShape.js'

function Dot({ x, y, size = 4.4, fill, rotate = 0 }) {
  const k = size / 18
  return (
    <path
      d={SEED_PATH}
      fill={fill}
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${k}) translate(-6 -9)`}
    />
  )
}

function Frame({ size, children, label }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      {children}
    </svg>
  )
}

const C = 'currentColor'

/** זכוכית מגדלת */
export function SeedSearchIcon({ size = 24 }) {
  return (
    <Frame size={size}>
      <SeedTrail d="M10.3 4.6a5.7 5.7 0 100 11.4 5.7 5.7 0 000-11.4Z" spacing={2.1} size={3.9} color={C} closed />
      <SeedTrail d="M14.6 14.6 L19.6 19.6" spacing={2.1} size={3.9} color={C} />
    </Frame>
  )
}

/** ברקוד עם סוגריים בפינות */
export function SeedBarcodeIcon({ size = 24 }) {
  const bars = [8.2, 11, 13.4, 16]
  return (
    <Frame size={size}>
      {bars.map((x) => (
        <SeedTrail key={x} d={`M${x} 8.4 L${x} 15.8`} spacing={2.1} size={3.7} color={C} />
      ))}
      <SeedTrail d="M6.6 7.2 L4.6 7.2 L4.6 9.2" spacing={2.1} size={3.7} color={C} />
      <SeedTrail d="M17.6 7.2 L19.6 7.2 L19.6 9.2" spacing={2.1} size={3.7} color={C} />
      <SeedTrail d="M6.6 17 L4.6 17 L4.6 15" spacing={2.1} size={3.7} color={C} />
      <SeedTrail d="M17.6 17 L19.6 17 L19.6 15" spacing={2.1} size={3.7} color={C} />
    </Frame>
  )
}

/** רשימה */
export function SeedListIcon({ size = 24 }) {
  const rows = [7.4, 12, 16.6]
  return (
    <Frame size={size}>
      {rows.map((y) => (
        <g key={y}>
          <Dot x={4.6} y={y} size={4.2} fill={C} rotate={90} />
          <SeedTrail d={`M8.4 ${y} L19.4 ${y}`} spacing={2.1} size={3.7} color={C} />
        </g>
      ))}
    </Frame>
  )
}

/** תיבה — מסך "שלי" */
export function SeedInboxIcon({ size = 24 }) {
  return (
    <Frame size={size}>
      <SeedTrail
        d="M6 5.2 H18 A2.4 2.4 0 0 1 20.4 7.6 V16.4 A2.4 2.4 0 0 1 18 18.8 H6 A2.4 2.4 0 0 1 3.6 16.4 V7.6 A2.4 2.4 0 0 1 6 5.2 Z"
        spacing={2.3}
        size={3.7}
        color={C}
        closed
      />
      <SeedTrail d="M3.8 12.4 H8.4 L9.8 14.4 H14.2 L15.6 12.4 H20.2" spacing={2.2} size={3.5} color={C} />
    </Frame>
  )
}

/** שמש — מעבר למצב בהיר */
export function SeedSunIcon({ size = 22 }) {
  const rays = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    rays.push(
      <Dot
        key={i}
        x={(12 + Math.cos(a) * 8.6).toFixed(2)}
        y={(12 + Math.sin(a) * 8.6).toFixed(2)}
        size={4.4}
        fill={C}
        rotate={(a * 180) / Math.PI + 90}
      />
    )
  }
  return (
    <Frame size={size}>
      <SeedTrail d="M12 7.2a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6Z" spacing={2.1} size={3.6} color={C} closed />
      {rays}
    </Frame>
  )
}

/** ירח — מעבר למצב כהה */
export function SeedMoonIcon({ size = 22 }) {
  return (
    <Frame size={size}>
      <SeedTrail
        d="M19.4 14.6A8.2 8.2 0 0 1 9.4 4.3 8.6 8.6 0 1 0 19.4 14.6Z"
        spacing={2.2}
        size={3.8}
        color={C}
        closed
      />
    </Frame>
  )
}
