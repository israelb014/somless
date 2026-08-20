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


export function PhoneIcon({ size = 16, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.8 5.6h2.4" />
    </svg>
  )
}

export function ShareIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <circle cx="17.5" cy="5.8" r="2.8" />
      <circle cx="6.5" cy="12" r="2.8" />
      <circle cx="17.5" cy="18.2" r="2.8" />
      <path d="M9 10.7l6-3.4M9 13.3l6 3.4" />
    </svg>
  )
}

export function CopyIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M15 6.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h.5" />
    </svg>
  )
}

export function InboxIcon({ size = 22, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M4 13l2.2-7.3A2 2 0 018.1 4h7.8a2 2 0 011.9 1.4L20 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5z" />
      <path d="M4 13h4l1.2 2.2h5.6L16 13h4" />
    </svg>
  )
}

export function CheckIcon({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}
