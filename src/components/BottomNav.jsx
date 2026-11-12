// ניווט תחתון: חיפוש (ראשון מימין) · סריקה · רשימה · שלי.
// הלשונית הפעילה מסומנת בשלושה זרעים מוזהבים מעליה.
import {
  SeedBarcodeIcon,
  SeedInboxIcon,
  SeedListIcon,
  SeedSearchIcon,
} from './SeedIcons.jsx'
import SesameSeed from './SesameSeed.jsx'

const ITEMS = [
  { id: 'search', label: 'חיפוש', Icon: SeedSearchIcon },
  { id: 'scan', label: 'סריקה', Icon: SeedBarcodeIcon },
  { id: 'list', label: 'רשימה', Icon: SeedListIcon },
  { id: 'mine', label: 'שלי', Icon: SeedInboxIcon },
]

function ActiveSeeds() {
  return (
    <span className="bottom-nav__active-seeds" aria-hidden="true">
      <SesameSeed variant="toasted" size={9} rotate={-20} />
      <SesameSeed variant="toasted" size={10} rotate={2} />
      <SesameSeed variant="toasted" size={9} rotate={22} />
    </span>
  )
}

export default function BottomNav({ view, onNavigate, localCount }) {
  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      {ITEMS.map(({ id, label, Icon }) => {
        const active = view === id
        return (
          <button
            key={id}
            type="button"
            className={`bottom-nav__item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(id)}
          >
            {active ? <ActiveSeeds /> : null}
            <span className="bottom-nav__icon">
              <Icon size={27} />
              {id === 'mine' && localCount > 0 ? (
                <span className="bottom-nav__badge">{localCount}</span>
              ) : null}
            </span>
            <span className="bottom-nav__label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
