// מסך "ההוספות שלי": מה שנוסף מהמכשיר הזה, וייצוא שלו כ-JSON.
// המאגר המרכזי מתעדכן דרך Claude Code — ראו את ההסבר בתחתית המסך.
import { useState } from 'react'
import ProductCard from './ProductCard.jsx'
import { CheckIcon, CopyIcon, ShareIcon } from './Icons.jsx'
import { EmptySeedArt } from './SeedArt.jsx'
import { exportLocalProducts } from '../lib/products.js'

export default function MyAdditionsScreen({ local, dbMeta, scanSound, onEdit, onDelete }) {
  const [status, setStatus] = useState('') // '' | 'shared' | 'copied' | 'failed'
  const [payload, setPayload] = useState('')

  const items = [...local].sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0))

  async function share() {
    const json = exportLocalProducts(items)
    const title = items.length === 1 ? 'סומלס — הוספה אחת' : `סומלס — ${items.length} הוספות`

    // 1. Web Share API (הדרך הטבעית בטלפון)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: json })
        setStatus('shared')
        return
      } catch (err) {
        if (err?.name === 'AbortError') return // המשתמש ביטל
      }
    }
    // 2. העתקה ללוח
    try {
      await navigator.clipboard.writeText(json)
      setStatus('copied')
      return
    } catch {
      // 3. גיבוי אחרון — מציגים את ה-JSON לבחירה ידנית
      setPayload(json)
      setStatus('failed')
    }
  }

  return (
    <div className="screen">
      <header className="screen__header screen__header--plain">
        <h1 className="screen__title">ההוספות שלי</h1>
      </header>

      {items.length === 0 ? (
        <div className="empty-state fade-in">
          <EmptySeedArt width={200} />
          <p className="empty-state__title">עדיין לא הוספתם כלום מהמכשיר הזה</p>
          <p className="empty-state__text">
            מוצר שתוסיפו יישמר כאן על הטלפון בלבד, ויופיע בתוצאות עם התג "מקומי".
          </p>
        </div>
      ) : (
        <>
          <div className="additions-bar card">
            <div>
              <p className="additions-bar__count">
                {items.length === 1 ? 'הוספה אחת במכשיר הזה' : `${items.length} הוספות במכשיר הזה`}
              </p>
              <p className="additions-bar__hint">שתפו את הקובץ כדי לצרף אותן למאגר המשפחתי.</p>
            </div>
            <button type="button" className="btn btn--primary" onClick={share}>
              {status === 'shared' || status === 'copied' ? <CheckIcon size={20} /> : <ShareIcon size={20} />}
              {status === 'copied' ? 'הועתק' : status === 'shared' ? 'שותף' : 'שיתוף'}
            </button>
          </div>

          {status === 'copied' ? (
            <p className="additions-note">
              <CopyIcon size={16} />
              ה-JSON הועתק ללוח — הדביקו אותו בהודעה.
            </p>
          ) : null}

          {status === 'failed' ? (
            <textarea
              className="field__input field__input--area additions-fallback"
              readOnly
              rows={8}
              value={payload}
              onFocus={(e) => e.target.select()}
              aria-label="JSON של ההוספות להעתקה ידנית"
            />
          ) : null}

          <div className="results">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </>
      )}

      {scanSound ? (
        <div className="settings-card card">
          <h2 className="settings-card__title">הגדרות</h2>
          <label className="settings-row">
            <span>
              צליל ורטט בסריקה
              <span className="settings-row__hint">
                התראה קולית ורטט כשנסרק מוצר שמכיל או עלול להכיל שומשום
              </span>
            </span>
            <input
              type="checkbox"
              className="settings-switch"
              checked={scanSound.enabled}
              onChange={(e) => scanSound.setEnabled(e.target.checked)}
            />
          </label>
        </div>
      ) : null}

      <div className="update-note card">
        <h2 className="update-note__title">עדכון המאגר המרכזי</h2>
        <p>
          המאגר המשפחתי הוא קובץ בריפו. כדי לצרף אליו הוספות — שתפו את ה-JSON
          ושלחו אותו בהודעה ל-Claude Code עם הבקשה "מזג את ההוספות לתוך
          data/products.json". הפריסה מתעדכנת אוטומטית.
        </p>
        {dbMeta ? (
          <p className="update-note__meta">
            גרסת מאגר {dbMeta.version} · עודכן {dbMeta.updatedAt}
          </p>
        ) : null}
      </div>
    </div>
  )
}
