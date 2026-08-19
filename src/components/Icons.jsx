// כל האייקונים באפליקציה — inline SVG בלבד (ללא אימוג'י, ללא CDN).
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function SearchIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  )
}

export function PlusIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ListIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CloseIcon({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function EditIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M4 20h4l10-10a2.5 2.5 0 10-3.5-3.5L4.5 16.5 4 20z" />
    </svg>
  )
}

export function TrashIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
    </svg>
  )
}

export function BackIcon({ size = 24, ...p }) {
  // חץ "חזרה" בממשק RTL — מצביע ימינה
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function LogoutIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" />
      <path d="M9 8l-4 4 4 4M5 12h10" />
    </svg>
  )
}

export function CloudOffIcon({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M17.5 18H7a4 4 0 01-.5-7.97" />
      <path d="M8.6 6.6A5 5 0 0117 9a3.5 3.5 0 013 3.4" />
      <path d="M3 3l18 18" />
    </svg>
  )
}

export function ShieldIcon({ size = 28, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M12 3l7 3v5.5c0 4.2-2.9 7.9-7 9.5-4.1-1.6-7-5.3-7-9.5V6l7-3z" />
      <path d="M9.2 12l2 2 3.6-3.8" />
    </svg>
  )
}

export function InfoIcon({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.6v.6" />
    </svg>
  )
}

export function GoogleIcon({ size = 20, ...p }) {
  // לוגו Google הרשמי — צבעים מקוריים, ללא stroke
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...p} aria-hidden="true">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h11.9c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.5-9.5 6.5-16.5z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C8 41.2 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.6 28.2c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3A22 22 0 002 24c0 3.5.8 6.9 2.3 9.9l7.3-5.7z" />
      <path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8 6.8 4.3 13.8l7.3 5.7c1.8-5.2 6.6-8.8 12.4-8.8z" />
    </svg>
  )
}
