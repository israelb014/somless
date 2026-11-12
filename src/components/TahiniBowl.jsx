// מצב ריק: קערת הטחינה, עם כמה זרעים מפוזרים סביבה בקוד.
import SesameSeed from './SesameSeed.jsx'

const AROUND = [
  { top: '4%', start: '6%', size: 15, rot: -28, variant: 'toasted' },
  { top: '16%', start: '86%', size: 12, rot: 34, variant: 'cream' },
  { bottom: '12%', start: '2%', size: 11, rot: 52, variant: 'cream' },
  { bottom: '2%', start: '78%', size: 13, rot: -14, variant: 'toasted' },
  { top: '46%', start: '94%', size: 10, rot: 18, variant: 'black' },
]

export default function TahiniBowl({ width = 196 }) {
  return (
    <div className="tahini-bowl" style={{ width }} aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}tahini-bowl.png`} alt="" width={width} />
      {AROUND.map((s, i) => (
        <span
          key={i}
          className="tahini-bowl__seed"
          style={{ top: s.top, bottom: s.bottom, insetInlineStart: s.start }}
        >
          <SesameSeed variant={s.variant} size={s.size} rotate={s.rot} />
        </span>
      ))}
    </div>
  )
}
