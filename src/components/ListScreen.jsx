// מסך רשימה מלאה: טאבים לפי סטטוס, ממוינים לפי עדכון אחרון, עם ספירה.
import { useMemo, useState } from 'react'
import ProductCard from './ProductCard.jsx'
import { EmptySeedArt } from './SeedArt.jsx'
import { useCountUp } from '../hooks/useCountUp.js'
import { useFx } from '../hooks/useFx.jsx'
import { STATUSES, STATUS_ORDER } from '../config.js'

function TabCount({ value, animate }) {
  const shown = useCountUp(value, { duration: 500, enabled: animate })
  return <span className="tab__count">{shown}</span>
}

export default function ListScreen({ products, counts, onEdit, onDelete }) {
  const [tab, setTab] = useState('contains')
  const { reduced } = useFx()

  const items = useMemo(
    () =>
      products
        .filter((p) => p.status === tab)
        .sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0)),
    [products, tab]
  )

  return (
    <div className="screen">
      <header className="screen__header screen__header--plain">
        <h1 className="screen__title">כל המוצרים</h1>
      </header>

      <div className="tabs" role="tablist">
        {STATUS_ORDER.map((id) => {
          const s = STATUSES[id]
          const active = tab === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              className={`tab${active ? ' is-active' : ''}`}
              style={{ '--status-color': s.color, '--status-tint': s.tint }}
              onClick={() => setTab(id)}
            >
              <span className="tab__label">{s.shortLabel}</span>
              <TabCount value={counts[id] || 0} animate={!reduced} />
            </button>
          )
        })}
      </div>

      <div className="results">
        {items.length === 0 ? (
          <div className="empty-state fade-in">
            <EmptySeedArt width={200} />
            <p className="empty-state__text">
              {tab === 'safe'
                ? 'הרשימה הלבנה מתחילה ריקה — הוסיפו מוצרים שבדקתם בעצמכם מול התווית.'
                : 'אין עדיין מוצרים בקטגוריה הזו.'}
            </p>
          </div>
        ) : (
          items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  )
}
