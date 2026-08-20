// ניווט תחתון: חיפוש · רשימה · ההוספות שלי · הוספה.
import { InboxIcon, ListIcon, PlusIcon, SearchIcon } from './Icons.jsx'

const ITEMS = [
  { id: 'search', label: 'חיפוש', Icon: SearchIcon },
  { id: 'list', label: 'רשימה', Icon: ListIcon },
  { id: 'mine', label: 'שלי', Icon: InboxIcon },
]

export default function BottomNav({ view, onNavigate, onAdd, localCount }) {
  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      {ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`bottom-nav__item${view === id ? ' is-active' : ''}`}
          aria-current={view === id ? 'page' : undefined}
          onClick={() => onNavigate(id)}
        >
          <span className="bottom-nav__icon">
            <Icon size={22} />
            {id === 'mine' && localCount > 0 ? (
              <span className="bottom-nav__badge">{localCount}</span>
            ) : null}
          </span>
          <span>{label}</span>
        </button>
      ))}

      <button
        type="button"
        className="bottom-nav__item bottom-nav__item--add"
        onClick={() => onAdd('')}
      >
        <span className="bottom-nav__icon bottom-nav__icon--accent">
          <PlusIcon size={22} />
        </span>
        <span>הוספה</span>
      </button>
    </nav>
  )
}
