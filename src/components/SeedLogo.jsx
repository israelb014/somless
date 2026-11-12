// הכותרת "סומלס": זרע מוזהב יושב בתוך המ"ם, ובכניסה הראשונה בכל session
// זרע נבקע ונפתח מעל המילה.
import { useId, useState } from 'react'
import { SEED_PATH, SEED_SEAM } from '../lib/seedShape.js'
import SesameSeed from './SesameSeed.jsx'
import { useFx } from '../hooks/useFx.jsx'

const SESSION_KEY = 'somless-logo-played'

function shouldPlay() {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false
    sessionStorage.setItem(SESSION_KEY, '1')
    return true
  } catch {
    return false
  }
}

export default function SeedLogo() {
  const { reduced } = useFx()
  const [play] = useState(() => (reduced ? false : shouldPlay()))
  const id = useId().replace(/:/g, '')

  return (
    <div className={`logo${play ? ' is-playing' : ''}`}>
      {play ? (
        <svg
          className="logo__seed"
          viewBox="0 0 12 18"
          width="40"
          height="60"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={`lg${id}`} x1="0.15" y1="0.05" x2="0.9" y2="0.95">
              <stop offset="0%" stopColor="#FFF7E7" />
              <stop offset="55%" stopColor="#F3CE86" />
              <stop offset="100%" stopColor="#B57F2C" />
            </linearGradient>
            <clipPath id={`cl${id}`}>
              <rect x="0" y="0" width="6" height="18" />
            </clipPath>
            <clipPath id={`cr${id}`}>
              <rect x="6" y="0" width="6" height="18" />
            </clipPath>
          </defs>
          <g className="logo__half logo__half--start" clipPath={`url(#cl${id})`}>
            <path d={SEED_PATH} fill={`url(#lg${id})`} />
            <path d={SEED_SEAM} fill="none" stroke="#8A5A18" strokeWidth="0.7" strokeLinecap="round" />
          </g>
          <g className="logo__half logo__half--end" clipPath={`url(#cr${id})`}>
            <path d={SEED_PATH} fill={`url(#lg${id})`} />
            <path d={SEED_SEAM} fill="none" stroke="#8A5A18" strokeWidth="0.7" strokeLinecap="round" />
          </g>
        </svg>
      ) : null}

      <h1 className="search-hero__title logo__title">
        <span>סו</span>
        <span className="logo__mem">
          מ
          <span className="logo__mem-seed" aria-hidden="true">
            <SesameSeed variant="toasted" size={13} rotate={-10} />
          </span>
        </span>
        <span>לס</span>
      </h1>
    </div>
  )
}
