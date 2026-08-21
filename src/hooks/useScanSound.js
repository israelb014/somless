// מתג "צליל ורטט בסריקה" — נשמר ב-IndexedDB, ברירת מחדל דלוק.
import { useCallback, useEffect, useState } from 'react'
import { getPref, setPref } from '../lib/localdb.js'

const KEY = 'scanAlertSound'

export function useScanSound() {
  const [enabled, setEnabledState] = useState(true)

  useEffect(() => {
    let alive = true
    getPref(KEY)
      .then((v) => {
        if (alive && v !== undefined) setEnabledState(Boolean(v))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const setEnabled = useCallback((value) => {
    setEnabledState(value)
    setPref(KEY, value).catch(() => {})
  }, [])

  return { enabled, setEnabled }
}
