// מודד אלמנט כדי שאפשר יהיה לפזר זרעים לאורך המסגרת שלו בלי לעוות אותם.
import { useEffect, useRef, useState } from 'react'

export function useElementSize() {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect
      setSize((prev) =>
        Math.abs(prev.width - r.width) < 1 && Math.abs(prev.height - r.height) < 1
          ? prev
          : { width: r.width, height: r.height }
      )
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size]
}
