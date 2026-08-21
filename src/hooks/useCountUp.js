// ספירה מ-0 לערך היעד. עם prefers-reduced-motion מציג מיד את הערך הסופי.
import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, { duration = 500, enabled = true } = {}) {
  const [value, setValue] = useState(enabled ? 0 : target)
  const raf = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return undefined
    }
    let start = 0
    const step = (ts) => {
      if (!start) start = ts
      const t = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, enabled])

  return value
}
