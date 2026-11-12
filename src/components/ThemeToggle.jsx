// מתג שמש/ירח — האייקונים בנויים מזרעי שומשום.
import { SeedMoonIcon, SeedSunIcon } from './SeedIcons.jsx'
import { useTheme } from '../hooks/useTheme.jsx'

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
      {light ? <SeedMoonIcon size={21} /> : <SeedSunIcon size={21} />}
      <span className="sr-only">{light ? 'מצב בהיר פעיל' : 'מצב כהה פעיל'}</span>
    </button>
  )
}
