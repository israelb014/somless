// מסך הוספה/עריכה של מוצר.
import { useEffect, useRef, useState } from 'react'
import StatusRing from './StatusRing.jsx'
import { BackIcon } from './Icons.jsx'
import { STATUSES, STATUS_ORDER } from '../config.js'

export default function ProductForm({ initial, onSave, onCancel }) {
  const isEdit = Boolean(initial?.id)
  const [name, setName] = useState(initial?.name || '')
  const [brand, setBrand] = useState(initial?.brand || '')
  const [status, setStatus] = useState(initial?.status || 'contains')
  const [note, setNote] = useState(initial?.note || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  useEffect(() => {
    // בהוספה עם שם ממולא מראש — הפוקוס עובר ישר לבחירת סטטוס בעין המשתמש,
    // אבל שדה השם עדיין נבחר לעריכה מהירה.
    nameRef.current?.focus()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('חובה להזין שם מוצר')
      nameRef.current?.focus()
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({ name, brand, status, note })
    } catch (err) {
      console.error(err)
      setError('השמירה נכשלה. בדקו חיבור ונסו שוב.')
      setSaving(false)
    }
  }

  return (
    <div className="screen slide-in">
      <header className="screen__header">
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="חזרה">
          <BackIcon />
        </button>
        <h1 className="screen__title">{isEdit ? 'עריכת מוצר' : 'הוספת מוצר'}</h1>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">שם המוצר</span>
          <input
            ref={nameRef}
            className="field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמה: בייגלה ירושלמי"
            enterKeyHint="next"
            maxLength={120}
          />
        </label>

        <label className="field">
          <span className="field__label">
            מותג <span className="field__optional">(אופציונלי)</span>
          </span>
          <input
            className="field__input"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="לדוגמה: אחלה"
            maxLength={80}
          />
        </label>

        <fieldset className="field field--status">
          <legend className="field__label">סטטוס</legend>
          <div className="status-picker">
            {STATUS_ORDER.map((id) => {
              const s = STATUSES[id]
              const active = status === id
              return (
                <button
                  key={id}
                  type="button"
                  className={`status-option${active ? ' is-active' : ''}`}
                  style={{ '--status-color': s.color, '--status-tint': s.tint }}
                  aria-pressed={active}
                  onClick={() => setStatus(id)}
                >
                  <StatusRing status={id} size={40} animate={false} />
                  <span className="status-option__label">{s.shortLabel}</span>
                </button>
              )
            })}
          </div>
          <p className="field__hint">{STATUSES[status].hint}</p>
        </fieldset>

        <label className="field">
          <span className="field__label">
            הערה <span className="field__optional">(אופציונלי)</span>
          </span>
          <textarea
            className="field__input field__input--area"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="מה בדיוק נבדק? מה כתוב בתווית?"
            rows={3}
            maxLength={500}
          />
        </label>

        {error ? <p className="form__error">{error}</p> : null}

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={saving}>
            ביטול
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'שומר…' : 'שמירה'}
          </button>
        </div>
      </form>
    </div>
  )
}
