// ---------------------------------------------------------------------------
// זיהוי ברקוד: BarcodeDetector מקומי כשקיים, אחרת zxing-wasm.
// ה-zxing נטען lazy — רק בכניסה למסך הסריקה — ולכן לא מכביד על טעינת
// האפליקציה. גם ה-wasm מגיע מהאתר עצמו, בלי CDN, כך שהוא נכנס ל-cache.
// ---------------------------------------------------------------------------

/** הפורמטים שמעניינים אותנו — ברקודים של מוצרי מזון. */
const NATIVE_FORMATS = ['ean_13', 'ean_8', 'upc_a']
const ZXING_FORMATS = ['EAN-13', 'EAN-8', 'UPC-A']

/** בודק ספרת ביקורת של EAN-13 / EAN-8 / UPC-A — מסנן קריאות שגויות. */
export function isValidBarcode(code) {
  if (!/^\d{8}$|^\d{12}$|^\d{13}$/.test(code)) return false
  const digits = code.split('').map(Number)
  const check = digits.pop()
  let sum = 0
  // המשקל מתחלף 3/1 מהספרה הימנית ביותר שלפני ספרת הביקורת
  for (let i = digits.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) {
    sum += digits[i] * w
  }
  return (10 - (sum % 10)) % 10 === check
}

async function nativeDetector() {
  if (typeof window === 'undefined' || !('BarcodeDetector' in window)) return null
  try {
    const supported = await window.BarcodeDetector.getSupportedFormats()
    const formats = NATIVE_FORMATS.filter((f) => supported.includes(f))
    if (!formats.length) return null
    const detector = new window.BarcodeDetector({ formats })
    return {
      kind: 'native',
      async detect(video) {
        const codes = await detector.detect(video)
        for (const c of codes) if (isValidBarcode(c.rawValue)) return c.rawValue
        return null
      },
    }
  } catch {
    return null
  }
}

async function zxingDetector() {
  const [reader, wasm] = await Promise.all([
    import('zxing-wasm/reader'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ])
  await reader.prepareZXingModule({
    overrides: {
      locateFile: (path, prefix) => (path.endsWith('.wasm') ? wasm.default : prefix + path),
    },
    fireImmediately: true,
  })

  let canvas = null
  let ctx = null

  return {
    kind: 'zxing',
    async detect(video) {
      const w = video.videoWidth
      const h = video.videoHeight
      if (!w || !h) return null
      if (!canvas) {
        canvas = document.createElement('canvas')
        ctx = canvas.getContext('2d', { willReadFrequently: true })
      }
      // מדגמים ברזולוציה מופחתת — מספיק לברקוד וחוסך עבודה לכל פריים
      const scale = Math.min(1, 640 / w)
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const results = await reader.readBarcodes(image, {
        formats: ZXING_FORMATS,
        tryHarder: true,
        maxNumberOfSymbols: 1,
      })
      for (const r of results) if (r.text && isValidBarcode(r.text)) return r.text
      return null
    },
  }
}

/** מחזיר גלאי מוכן לשימוש, או זורק אם אין שום דרך לזהות. */
export async function createDetector() {
  return (await nativeDetector()) || (await zxingDetector())
}
