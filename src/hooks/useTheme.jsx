// ערכת נושא: כהה (ברירת מחדל) / טחינה בהירה.
// ברירת המחדל נגזרת מ-prefers-color-scheme; בחירת המשתמש נשמרת ב-IndexedDB.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getPref, setPref } from '../lib/localdb.js'

const KEY = 'theme'
const ThemeContext = createContext(null)

const THEME_COLOR = { dark: '#140F0B', light: '#F7EDDC' }

function systemTheme() {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

function apply(theme) {
  document.documentElement.dataset.theme = theme
  // ה-manifest סטטי; מה שמשנה את צבע סרגל הדפדפן הוא תג ה-meta
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[theme])
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme
      : systemTheme()
  )
  const [chosen, setChosen] = useState(false)

  // טעינת ההעדפה השמורה
  useEffect(() => {
    let alive = true
    getPref(KEY)
      .then((v) => {
        if (!alive) return
        if (v === 'light' || v === 'dark') {
          setChosen(true)
          setThemeState(v)
          apply(v)
        } else {
          apply(systemTheme())
        }
      })
      .catch(() => apply(systemTheme()))
    return () => {
      alive = false
    }
  }, [])

  // כל עוד המשתמש לא בחר במפורש — עוקבים אחרי הגדרת המערכת
  useEffect(() => {
    if (chosen) return
    const mq = window.matchMedia?.('(prefers-color-scheme: light)')
    if (!mq) return
    const onChange = () => {
      const next = systemTheme()
      setThemeState(next)
      apply(next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [chosen])

  const setTheme = useCallback((next) => {
    setChosen(true)
    setThemeState(next)
    apply(next)
    setPref(KEY, next).catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext) || { theme: 'dark', setTheme: () => {}, toggle: () => {} }
}
