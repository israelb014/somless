// ניווט תחתון: חיפוש · הוספה · רשימה.
import { ListIcon, PlusIcon, SearchIcon } from './Icons.jsx'

export default function BottomNav({ view, onNavigate, onAdd }) {
  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      <button
        type="button"
        className={`bottom-nav__item${view === 'search' ? ' is-active' : ''}`}
        onClick={() => onNavigate('search')}
      >
        <SearchIcon size={22} />
        <span>חיפוש</span>
      </button>

      <button type="button" className="bottom-nav__fab" onClick={() => onAdd('')} aria-label="הוספת מוצר">
        <PlusIcon size={26} />
      </button>

      <button
        type="button"
        className={`bottom-nav__item${view === 'list' ? ' is-active' : ''}`}
        onClick={() => onNavigate('list')}
      >
        <ListIcon size={22} />
        <span>רשימה</span>
      </button>
    </nav>
  )
}
