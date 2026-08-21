// כרטיס מוצר בשני מצבים:
//  hero    — ההתאמה הטובה ביותר: טבעת גדולה שנבנית מזרעים, טיפוגרפיה גדולה
//            ונגיעת gradient בגוון הסטטוס.
//  compact — שורה נמוכה: אייקון קטן (טבעת סטטית), שם, תג.
//
// גוף הכרטיס מציג שם, מותג, תג סטטוס ואייקון סטטוס בלבד. ההערה, מקור
// הרשומה והפעולות חיים במגירה שנפתחת מכפתור ה-i.
import { useId, useState } from 'react'
import StatusRing from './StatusRing.jsx'
import { EditIcon, InfoIcon, PhoneIcon, TrashIcon } from './Icons.jsx'
import { STATUSES } from '../config.js'
import { relativeDay } from '../lib/format.js'

const SOURCE_LABEL = {
  seed: 'רשומת פתיחה מהמאגר',
  'seed-edited': 'רשומת פתיחה שנערכה',
  family: 'נוסף על ידי המשפחה',
  local: 'הוספה מהמכשיר הזה',
  user: 'הוספה מהמכשיר הזה',
}

function LocalTag() {
  return (
    <span className="local-pill">
      <PhoneIcon size={13} />
      מקומי
    </span>
  )
}

export default function ProductCard({ product, onEdit, onDelete, index = 0, variant = 'compact' }) {
  const [open, setOpen] = useState(false)
  const drawerId = useId().replace(/:/g, '')
  const status = STATUSES[product.status]
  const color = status?.color || '#B99B6A'
  const hero = variant === 'hero'

  const source = SOURCE_LABEL[product.source] || 'מקור לא ידוע'

  return (
    <article
      className={`card product-card product-card--${hero ? 'hero' : 'compact'} fade-in`}
      style={{ '--status-color': color, animationDelay: `${Math.min(index, 8) * 35}ms` }}
    >
      <StatusRing status={product.status} size={hero ? 72 : 38} animate={hero} />

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        {product.brand ? <p className="product-card__brand">{product.brand}</p> : null}

        {hero ? (
          <div className="product-card__tags">
            <span className="status-pill status-pill--lg">{status?.label || 'לא ידוע'}</span>
            {product.isLocal ? <LocalTag /> : null}
          </div>
        ) : null}
      </div>

      {!hero ? (
        <div className="product-card__tags product-card__tags--inline">
          <span className="status-pill">{status?.shortLabel || 'לא ידוע'}</span>
          {product.isLocal ? <LocalTag /> : null}
        </div>
      ) : null}

      <button
        type="button"
        className={`icon-btn icon-btn--info${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={drawerId}
        aria-label={`פרטים על ${product.name}`}
      >
        <InfoIcon size={hero ? 20 : 18} />
      </button>

      {open ? (
        <div className="product-card__drawer" id={drawerId}>
          {product.note ? <p className="drawer__note">{product.note}</p> : null}
          <p className="drawer__meta">
            {source}
            {product.isLocal && product.updatedAtDate
              ? ` · עודכן ${relativeDay(product.updatedAtDate)}`
              : ''}
          </p>

          {product.isLocal ? (
            <div className="drawer__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEdit(product)}>
                <EditIcon size={18} />
                עריכה
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm drawer__delete"
                onClick={() => onDelete(product)}
              >
                <TrashIcon size={18} />
                מחיקה
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
