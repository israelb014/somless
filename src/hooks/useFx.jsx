// Context של אפקטי השומשום: מתג משתמש (נשמר ב-IndexedDB),
// כיבוד prefers-reduced-motion, ו-burst אוטומטי על לחיצות.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getPref, setPref } from '../lib/localdb.js'
import * as fx from '../lib/particles.js'

const KEY = 'sesameFxEnabled'
const FxContext = createContext(null)

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

// אלמנטים שלחיצה עליהם מפעילה burst
const CLICKABLE = 'button, .product-card, .tab, .status-option, a[href]'

export function FxProvider({ children }) {
  const reduced = useRef(prefersReducedMotion())
  // ברירת מחדל: דלוק (אלא אם המשתמש ביקש פחות תנועה)
  const [enabled, setEnabledState] = useState(!reduced.current)

  useEffect(() => {
    if (reduced.current) {
      fx.setEnabled(false)
      return
    }
    getPref(KEY)
      .then((v) => {
        const on = v === undefined ? true : Boolean(v)
        setEnabledState(on)
        fx.setEnabled(on)
      })
      .catch(() => fx.setEnabled(true))
  }, [])

  const setEnabled = useCallback((value) => {
    setEnabledState(value)
    fx.setEnabled(value)
    setPref(KEY, value).catch(() => {})
  }, [])

  // burst גלובלי על לחיצות — נרשם פעם אחת, לא מעכב שום handler
  useEffect(() => {
    function onPointerDown(e) {
      if (!fx.isEnabled()) return
      const target = e.target?.closest?.(CLICKABLE)
      if (!target) return
      fx.burst(e.clientX, e.clientY)
    }
    document.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const value = {
    enabled,
    setEnabled,
    reduced: reduced.current,
    rain: fx.rain,
    pop: fx.pop,
    burst: fx.burst,
  }

  return <FxContext.Provider value={value}>{children}</FxContext.Provider>
}

export function useFx() {
  return useContext(FxContext) || { enabled: false, setEnabled: () => {}, reduced: true, rain: () => {}, pop: () => {}, burst: () => {} }
}
