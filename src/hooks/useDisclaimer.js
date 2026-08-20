// אישור הדיסקליימר נשמר על המכשיר (IndexedDB) — אין שרת ואין חשבון.
import { useEffect, useState } from 'react'
import { getPref, setPref } from '../lib/localdb.js'

const KEY = 'disclaimerAccepted'

export function useDisclaimer() {
  const [accepted, setAccepted] = useState(null) // null = עדיין נבדק

  useEffect(() => {
    let alive = true
    getPref(KEY)
      .then((v) => alive && setAccepted(Boolean(v)))
      .catch(() => alive && setAccepted(false))
    return () => {
      alive = false
    }
  }, [])

  async function accept() {
    try {
      await setPref(KEY, new Date().toISOString())
    } catch {
      // גם אם השמירה נכשלה (מצב פרטי בדפדפן) — לא חוסמים את המשתמש
    }
    setAccepted(true)
  }

  return { accepted, accept }
}
