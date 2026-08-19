// כרטיס מוצר: טבעת סטטוס, שם, מותג, הערה, תאריך עדכון ופעולות עריכה/מחיקה.
import StatusRing from './StatusRing.jsx'
import { EditIcon, TrashIcon } from './Icons.jsx'
import { STATUSES } from '../config.js'
import { relativeDay } from '../lib/format.js'

export default function ProductCard({ product, onEdit, onDelete, index = 0 }) {
  const status = STATUSES[product.status]
  const color = status?.color || '#94A3B8'

  return (
    <article
      className="card product-card fade-in"
      style={{ '--status-color': color, animationDelay: `${Math.min(index, 8) * 35}ms` }}
    >
      <StatusRing status={product.status} size={48} />

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        {product.brand ? <p className="product-card__brand">{product.brand}</p> : null}

        <span className="status-pill" style={{ color, background: status?.tint }}>
          {status?.label || 'לא ידוע'}
        </span>

        {product.note ? <p className="product-card__note">{product.note}</p> : null}

        <p className="product-card__meta">
          עודכן {relativeDay(product.updatedAtDate) || '—'}
          {product.updatedBy ? ` · ${product.updatedBy.split('@')[0]}` : ''}
        </p>
      </div>

      <div className="product-card__actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onEdit(product)}
          aria-label={`עריכת ${product.name}`}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={() => onDelete(product)}
          aria-label={`מחיקת ${product.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  )
}
