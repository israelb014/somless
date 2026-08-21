// זרעים דקורטיביים באזור הכותרת, עם parallax עדין בגלילה.
// transform בלבד — אין reflow. מכובה ב-reduced-motion וכשהאנימציות כבויות.
import { useEffect, useRef } from 'react'
import SesameSeed from './SesameSeed.jsx'
import { useFx } from '../hooks/useFx.jsx'

const SEEDS = [
  { top: '6%', start: '6%', size: 16, rot: -24, factor: 0.16, variant: 'toasted' },
  { top: '18%', start: '88%', size: 13, rot: 32, factor: 0.26, variant: 'cream' },
  { top: '48%', start: '3%', size: 11, rot: 12, factor: 0.34, variant: 'cream' },
  { top: '60%', start: '93%', size: 15, rot: -40, factor: 0.2, variant: 'toasted' },
  { top: '80%', start: '14%', size: 10, rot: 54, factor: 0.42, variant: 'black' },
]

export default function HeroSeeds() {
  const ref = useRef(null)
  const { enabled, reduced } = useFx()
  const active = enabled && !reduced

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!active) {
      el.style.setProperty('--sy', '0px')
      return undefined
    }
    let ticking = false
    const update = () => {
      ticking = false
      el.style.setProperty('--sy', `${window.scrollY}px`)
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [active])

  return (
    <div className="hero-seeds" ref={ref} aria-hidden="true">
      {SEEDS.map((s, i) => (
        <span
          key={i}
          className="hero-seeds__seed"
          style={{ top: s.top, insetInlineStart: s.start, '--f': s.factor }}
        >
          <SesameSeed variant={s.variant} size={s.size} rotate={s.rot} />
        </span>
      ))}
    </div>
  )
}
