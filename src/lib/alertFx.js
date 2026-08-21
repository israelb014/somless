// ---------------------------------------------------------------------------
// התראת סריקה: צליל (Web Audio בלבד, בלי קובצי אודיו) ורטט.
//
// ה-AudioContext חייב להיווצר ולהתעורר בתוך ג'סטת משתמש, אחרת הדפדפן חוסם
// את הצליל. primeAudio() נקרא בלחיצה על טאב הסריקה.
// ---------------------------------------------------------------------------

let audioCtx = null

export function primeAudio() {
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) return
    if (!audioCtx) audioCtx = new Ctor()
    if (audioCtx.state === 'suspended') audioCtx.resume()
  } catch {
    audioCtx = null
  }
}

function beep(startAt, freq, duration, gainPeak = 0.22) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(freq, startAt)
  // מעטפת רכה — בלי קליקים בקצוות
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(gainPeak, startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start(startAt)
  osc.stop(startAt + duration + 0.02)
}

/** 'contains' — שני צפצופים יורדים (~0.6s). 'may_contain' — צפצוף בודד. */
export function playAlert(status) {
  if (!audioCtx || audioCtx.state !== 'running') return
  const t = audioCtx.currentTime + 0.01
  if (status === 'contains') {
    beep(t, 880, 0.24)
    beep(t + 0.32, 590, 0.26)
  } else if (status === 'may_contain') {
    beep(t, 720, 0.26, 0.18)
  }
}

export function vibrateAlert(status) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  if (status === 'contains') navigator.vibrate([200, 100, 200, 100, 400])
  else if (status === 'may_contain') navigator.vibrate([200, 100, 200])
}

/** התראה מלאה. prefers-reduced-motion לא משתיק — הוא רק מכבה את ה-pulse. */
export function fireAlert(status, enabled) {
  if (!enabled) return
  playAlert(status)
  vibrateAlert(status)
}
