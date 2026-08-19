// פורמט תאריכים בעברית.
const formatter = new Intl.DateTimeFormat('he-IL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDate(date) {
  if (!date) return ''
  return formatter.format(date)
}

/** "לפני 3 ימים" / "היום" — טקסט קצר לכרטיס. */
export function relativeDay(date) {
  if (!date) return ''
  const days = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (days <= 0) return 'היום'
  if (days === 1) return 'אתמול'
  if (days < 30) return `לפני ${days} ימים`
  return formatDate(date)
}
