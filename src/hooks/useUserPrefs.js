// העדפות פר-משתמש נשמרות ב-Firestore (לא ב-localStorage) —
// כרגע רק אישור הדיסקליימר, כדי שיסונכרן בין מכשירים.
import { useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { FAMILY_ID } from '../config.js'

export function useUserPrefs(user, enabled) {
  const [prefs, setPrefs] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !enabled) {
      setPrefs(null)
      setLoading(true)
      return
    }
    const ref = doc(db, 'families', FAMILY_ID, 'users', user.uid)
    return onSnapshot(
      ref,
      (snap) => {
        setPrefs(snap.exists() ? snap.data() : {})
        setLoading(false)
      },
      () => setLoading(false)
    )
  }, [user, enabled])

  async function acceptDisclaimer() {
    if (!user) return
    const ref = doc(db, 'families', FAMILY_ID, 'users', user.uid)
    await setDoc(
      ref,
      {
        email: (user.email || '').toLowerCase(),
        displayName: user.displayName || '',
        disclaimerAcceptedAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  return {
    prefs,
    loading,
    disclaimerAccepted: Boolean(prefs?.disclaimerAcceptedAt),
    acceptDisclaimer,
  }
}
