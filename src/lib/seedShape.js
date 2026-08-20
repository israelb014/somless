// ---------------------------------------------------------------------------
// הגיאומטריה של זרע השומשום — מקור אמת יחיד ל-SVG ול-canvas כאחד.
// טיפה אליפטית עם חוד עדין למעלה, בתוך viewBox של 12×18.
// ---------------------------------------------------------------------------

export const SEED_W = 12
export const SEED_H = 18
export const SEED_VIEWBOX = `0 0 ${SEED_W} ${SEED_H}`

/** קו המתאר של הזרע. */
export const SEED_PATH =
  'M6 0.7 C8.9 3.4 10.5 7.3 10.5 10.8 C10.5 14.8 8.5 17.3 6 17.3 ' +
  'C3.5 17.3 1.5 14.8 1.5 10.8 C1.5 7.3 3.1 3.4 6 0.7 Z'

/** קו התפר הדק באמצע. */
export const SEED_SEAM = 'M6 3.6 C6.5 7 6.5 11.4 6 15.0'

/** הבהוב אור עדין בצד אחד. */
export const SEED_SHINE = 'M4.5 4.6 C3.4 7.2 3.0 10.2 3.3 12.7'

/** שלושת הגוונים. */
export const SEED_VARIANTS = {
  cream: { light: '#FFF7E7', dark: '#E4C88F', seam: '#C6A469', shine: '#FFFDF6' },
  toasted: { light: '#F3CE86', dark: '#B57F2C', seam: '#8A5A18', shine: '#FFE9BE' },
  black: { light: '#5A4940', dark: '#1A120C', seam: '#7A6558', shine: '#8A776A' },
}

export const VARIANT_NAMES = ['cream', 'toasted', 'black']
