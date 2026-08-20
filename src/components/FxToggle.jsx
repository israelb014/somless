// מתג "אנימציות שומשום" — נשמר ב-IndexedDB, ברירת מחדל דלוק.
import SesameSeed from './SesameSeed.jsx'
import { useFx } from '../hooks/useFx.jsx'

export default function FxToggle({ withLabel = false }) {
  const { enabled, setEnabled, reduced } = useFx()

  // כשהמערכת מבקשת פחות תנועה — אין מה להציע
  if (reduced) return null

  return (
    <button
      type="button"
      className={`fx-toggle${enabled ? ' is-on' : ''}`}
      onClick={() => setEnabled(!enabled)}
      aria-pressed={enabled}
      title="אנימציות שומשום"
    >
      <span className="fx-toggle__seeds" aria-hidden="true">
        <SesameSeed variant="toasted" size={15} rotate={-18} />
        <SesameSeed variant="cream" size={15} rotate={14} />
      </span>
      <span className={withLabel ? 'fx-toggle__label' : 'sr-only'}>
        אנימציות שומשום {enabled ? 'פועלות' : 'כבויות'}
      </span>
    </button>
  )
}
