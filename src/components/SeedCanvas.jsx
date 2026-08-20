// הקנבס הגלובלי היחיד של כל הפרטיקלים. שקוף ללחיצות.
import { useEffect, useRef } from 'react'
import { attachCanvas } from '../lib/particles.js'

export default function SeedCanvas() {
  const ref = useRef(null)
  useEffect(() => attachCanvas(ref.current), [])
  return <canvas ref={ref} className="seed-canvas" aria-hidden="true" />
}
