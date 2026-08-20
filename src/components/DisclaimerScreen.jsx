// מסך פתיחה ראשון — אישור הדיסקליימר נשמר על המכשיר (IndexedDB).
import { useEffect, useState } from 'react'
import { InfoIcon } from './Icons.jsx'
import SesameSeed from './SesameSeed.jsx'
import { SeedDrift } from './SeedArt.jsx'
import { useFx } from '../hooks/useFx.jsx'
import { DISCLAIMER } from '../config.js'

export default function DisclaimerScreen({ onAccept }) {
  const [busy, setBusy] = useState(false)
  const { rain } = useFx()

  // השומשומים נופלים פעם אחת בפתיחה ונערמים בתחתית המסך
  useEffect(() => {
    const t = setTimeout(() => rain(90), 150)
    return () => clearTimeout(t)
  }, [rain])

  async function accept() {
    setBusy(true)
    try {
      await onAccept()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen screen--center">
      <div className="gate fade-in">
        <div className="gate__mark">
          <SesameSeed variant="toasted" size={40} rotate={-14} />
        </div>
        <h1 className="gate__title">לפני שמתחילים</h1>
        <p className="gate__disclaimer">{DISCLAIMER}</p>
        <ul className="gate__list">
          <li>
            <InfoIcon size={18} />
            <span>המאגר נבנה ידנית על ידי ההורים ואינו רשמי.</span>
          </li>
          <li>
            <InfoIcon size={18} />
            <span>"נבדק ובטוח" נכון רק למותג ולאריזה שנבדקו.</span>
          </li>
          <li>
            <InfoIcon size={18} />
            <span>יצרנים משנים מתכונים וקווי ייצור ללא הודעה.</span>
          </li>
        </ul>
        <button type="button" className="btn btn--primary btn--block" onClick={accept} disabled={busy}>
          {busy ? 'רגע…' : 'הבנתי, בואו נתחיל'}
        </button>
      </div>
      <SeedDrift />
    </div>
  )
}
