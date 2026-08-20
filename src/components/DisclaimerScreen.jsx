// מסך פתיחה ראשון — אישור הדיסקליימר נשמר על המכשיר (IndexedDB).
import { useState } from 'react'
import { InfoIcon, ShieldIcon } from './Icons.jsx'
import { DISCLAIMER } from '../config.js'

export default function DisclaimerScreen({ onAccept }) {
  const [busy, setBusy] = useState(false)

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
          <ShieldIcon size={40} />
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
    </div>
  )
}
