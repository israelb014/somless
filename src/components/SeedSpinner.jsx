// ספינר טעינה: זרעי שומשום מסתובבים במעגל.
import SesameSeed from './SesameSeed.jsx'

const COUNT = 8

export default function SeedSpinner({ size = 54 }) {
  const radius = size / 2 - size * 0.11
  return (
    <div className="seed-spinner" style={{ width: size, height: size }} aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * 360
        return (
          <span
            key={i}
            className="seed-spinner__seed"
            style={{
              transform: `rotate(${angle}deg) translateY(-${radius}px)`,
              animationDelay: `${(i / COUNT) * 0.8}s`,
            }}
          >
            <SesameSeed variant={i % 3 === 0 ? 'toasted' : 'cream'} size={size * 0.24} />
          </span>
        )
      })}
    </div>
  )
}
