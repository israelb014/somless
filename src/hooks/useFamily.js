// בדיקת הרשאה: המשתמש המחובר חייב להופיע ב-members של מסמך המשפחה.
// ה-whitelist נאכף ב-Security Rules; כאן רק מזהים את המצב כדי להציג מסך מתאים.
import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import { FAMILY_ID } from '../config.js'

export function useFamily(user) {
  const [state, setState] = useState('checking') // checking | allowed | denied | missing
  const [family, setFamily] = useState(null)

  useEffect(() => {
    if (!user) {
      setState('checking')
      setFamily(null)
      return
    }
    const ref = doc(db, 'families', FAMILY_ID)
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setFamily(null)
          setState('missing')
          return
        }
        setFamily({ id: snap.id, ...snap.data() })
        setState('allowed')
      },
      () => {
        // permission-denied = המייל לא ברשימת ה-whitelist
        setFamily(null)
        setState('denied')
      }
    )
  }, [user])

  return { state, family }
}
