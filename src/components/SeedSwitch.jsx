// מתג שהידית שלו היא זרע שומשום. משמש לכל המתגים באפליקציה.
import SesameSeed from './SesameSeed.jsx'

export default function SeedSwitch({ checked, onChange, label, hint, id }) {
  return (
    <div className="settings-row">
      <label className="settings-row__text" htmlFor={id}>
        {label}
        {hint ? <span className="settings-row__hint">{hint}</span> : null}
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`seed-switch${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="seed-switch__knob">
          <SesameSeed variant={checked ? 'toasted' : 'cream'} size={21} rotate={checked ? 12 : -12} />
        </span>
      </button>
    </div>
  )
}
