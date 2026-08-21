// מתג שמש/ירח — inline SVG בלבד.
import { useTheme } from '../hooks/useTheme.jsx'

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const light = theme === 'light'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={light}
      title={light ? 'מעבר למצב כהה' : 'מעבר למצב בהיר'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="theme-toggle__icon">
        {light ? (
          // ירח — לחיצה תעביר למצב כהה
          <path d="M20 14.2A8.2 8.2 0 019.8 4a8.4 8.4 0 106.9 12.6" {...stroke} />
        ) : (
          // שמש — לחיצה תעביר למצב בהיר
          <>
            <circle cx="12" cy="12" r="4.2" {...stroke} />
            <path
              d="M12 3.2v1.8M12 19v1.8M3.2 12h1.8M19 12h1.8M5.9 5.9l1.3 1.3M16.8 16.8l1.3 1.3M18.1 5.9l-1.3 1.3M7.2 16.8l-1.3 1.3"
              {...stroke}
            />
          </>
        )}
      </svg>
      <span className="sr-only">{light ? 'מצב בהיר פעיל' : 'מצב כהה פעיל'}</span>
    </button>
  )
}
