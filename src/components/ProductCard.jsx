// כרטיס מוצר בשלושה מצבים:
//  hero — ההתאמה הטובה ביותר במסך החיפוש
//  tile — שאר תוצאות החיפוש, שלושה בשורה
//  row  — שורות במסכי הרשימה ו"שלי"
//
// הכרטיס מציג שם, מותג, תג סטטוס וטבעת זרעים. ההערה, מקור הרשומה
// והפעולות נפתחים במגירה.
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

function Drawer({ product, source, onEdit, onDelete, id }) {
  return (
    <div className="product-card__drawer" id={id}>
      {product.note ? <p className="drawer__note">{product.note}</p> : null}
      <p className="drawer__meta">
        {source}
        {product.isLocal && product.updatedAtDate
          ? ` · עודכן ${relativeDay(product.updatedAtDate)}`
          : ''}
      </p>
      {product.barcodes?.length ? (
        <p className="drawer__meta" dir="ltr">
          {product.barcodes.join(', ')}
        </p>
      ) : null}

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
  )
}

export default function ProductCard({ product, onEdit, onDelete, index = 0, variant = 'row' }) {
  const [open, setOpen] = useState(false)
  const drawerId = useId().replace(/:/g, '')
  const status = STATUSES[product.status]
  const color = status?.color || '#B99B6A'
  const source = SOURCE_LABEL[product.source] || 'מקור לא ידוע'
  const style = { '--status-color': color, animationDelay: `${Math.min(index, 8) * 35}ms` }

  // --- אריח: שלושה בשורה, נפתח לרוחב מלא בלחיצה ---
  if (variant === 'tile') {
    return (
      <div
        className={`card product-card product-card--tile fade-in${open ? ' is-open' : ''}`}
        style={style}
      >
        <button
          type="button"
          className="product-card__tileface"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={drawerId}
        >
          <StatusRing status={product.status} size={56} animate={false} />
          <span className="product-card__name">{product.name}</span>
          {product.brand ? <span className="product-card__brand">{product.brand}</span> : null}
          <span className="status-pill status-pill--sm">{status?.label || 'לא ידוע'}</span>
          {product.isLocal ? <LocalTag /> : null}
        </button>
        {open ? (
          <Drawer product={product} source={source} onEdit={onEdit} onDelete={onDelete} id={drawerId} />
        ) : null}
      </div>
    )
  }

  const hero = variant === 'hero'

  return (
    <article
      className={`card product-card product-card--${hero ? 'hero' : 'row'} fade-in`}
      style={style}
    >
      <StatusRing status={product.status} size={hero ? 76 : 40} animate={hero} />

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

      {/* בשורות התגית יושבת באותה שורה כדי לשמור אותן נמוכות */}
      {!hero ? (
        <div className="product-card__tags product-card__tags--inline">
          <span className="status-pill">{status?.label || 'לא ידוע'}</span>
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
        <Drawer product={product} source={source} onEdit={onEdit} onDelete={onDelete} id={drawerId} />
      ) : null}
    </article>
  )
}
