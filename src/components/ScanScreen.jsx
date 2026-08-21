// מסך הסריקה: מצלמה אחורית, זיהוי ברקוד, ואז צינור הזיהוי —
// מאגר מקומי → Open Food Facts → לא מזוהה.
import { useCallback, useEffect, useRef, useState } from 'react'
import ScanTarget from './ScanTarget.jsx'
import ScanResult from './ScanResult.jsx'
import SeedSpinner from './SeedSpinner.jsx'
import { CameraOffIcon, SearchIcon } from './Icons.jsx'
import { createDetector } from '../lib/barcode.js'
import { lookupBarcode } from '../lib/off.js'
import { findByBarcode } from '../lib/products.js'
import { searchProducts } from '../lib/search.js'
import { DISCLAIMER } from '../config.js'

const SCAN_INTERVAL_MS = 240

export default function ScanScreen({ products, soundEnabled, onAddProduct, onLinkBarcode, onGoSearch }) {
  // starting | scanning | denied | unsupported | looking | result
  const [phase, setPhase] = useState('starting')
  const [result, setResult] = useState(null)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(0)
  const busyRef = useRef(false)
  const aliveRef = useRef(true)
  // הרשימה מתעדכנת תוך כדי סריקה — ref מונע אתחול מחדש של המצלמה
  const productsRef = useRef(products)
  productsRef.current = products

  /** עצירה מלאה של המצלמה — חובה, לא להשאיר נורה דולקת ברקע. */
  const stopCamera = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = 0
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    const video = videoRef.current
    if (video) {
      video.pause()
      video.srcObject = null
    }
  }, [])

  const handleBarcode = useCallback(
    async (barcode) => {
      stopCamera()
      if (!aliveRef.current) return

      // א. המאגר שלנו — עובד גם בלי רשת
      const known = findByBarcode(productsRef.current, barcode)
      if (known) {
        setResult({ kind: 'known', barcode, product: known })
        setPhase('result')
        return
      }

      // ב. Open Food Facts
      setPhase('looking')
      const off = await lookupBarcode(barcode)
      if (!aliveRef.current) return

      if (off) {
        // ז. אם השם תואם למוצר קיים — מציעים לשייך את הברקוד אליו
        const match = off.name ? searchProducts(productsRef.current, off.name)[0] : null
        setResult({ kind: 'off', barcode, off, suggestion: match || null })
      } else {
        // ג. לא נמצא, או שאין רשת / חלף ה-timeout
        setResult({ kind: 'unknown', barcode })
      }
      setPhase('result')
    },
    [stopCamera]
  )

  const start = useCallback(async () => {
    setResult(null)
    setPhase('starting')
    let detector
    try {
      detector = await createDetector()
    } catch {
      if (aliveRef.current) setPhase('unsupported')
      return
    }
    if (!aliveRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      if (!aliveRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      await video.play().catch(() => {})
      setPhase('scanning')

      timerRef.current = setInterval(async () => {
        if (busyRef.current || !videoRef.current) return
        busyRef.current = true
        try {
          const code = await detector.detect(videoRef.current)
          if (code) handleBarcode(code)
        } catch {
          // פריים בודד שנכשל אינו מעניין — ממשיכים לפריים הבא
        } finally {
          busyRef.current = false
        }
      }, SCAN_INTERVAL_MS)
    } catch {
      if (aliveRef.current) setPhase('denied')
    }
  }, [handleBarcode])

  useEffect(() => {
    aliveRef.current = true
    start()
    return () => {
      aliveRef.current = false
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // עצירת המצלמה גם כשהטאב יורד לרקע
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') stopCamera()
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [stopCamera])

  function rescan() {
    setResult(null)
    start()
  }

  return (
    <div className="screen scan-screen">
      <div className="scan-stage">
        <video ref={videoRef} className="scan-video" muted playsInline />

        {phase === 'scanning' ? (
          <>
            <ScanTarget />
            <p className="scan-hint">כוונו לברקוד המוצר</p>
          </>
        ) : null}

        {phase === 'starting' ? (
          <div className="scan-overlay">
            <SeedSpinner size={52} />
            <p>מפעיל מצלמה…</p>
          </div>
        ) : null}

        {phase === 'looking' ? (
          <div className="scan-overlay">
            <SeedSpinner size={52} />
            <p>בודק את הברקוד…</p>
          </div>
        ) : null}

        {phase === 'denied' || phase === 'unsupported' ? (
          <div className="scan-overlay scan-overlay--message">
            <span className="scan-overlay__mark">
              <CameraOffIcon size={30} />
            </span>
            <h2 className="scan-overlay__title">
              {phase === 'denied' ? 'אין גישה למצלמה' : 'הסריקה לא נתמכת במכשיר הזה'}
            </h2>
            <p className="scan-overlay__text">
              {phase === 'denied'
                ? 'אפשר לאשר מצלמה בהגדרות הדפדפן, או פשוט לחפש לפי שם — זה עובד תמיד.'
                : 'אפשר לחפש את המוצר לפי שם — החיפוש עובד בכל מכשיר.'}
            </p>
            <button type="button" className="btn btn--primary" onClick={onGoSearch}>
              <SearchIcon size={20} />
              חיפוש לפי שם
            </button>
          </div>
        ) : null}
      </div>

      {phase === 'result' && result ? (
        <ScanResult
          result={result}
          soundEnabled={soundEnabled}
          onRescan={rescan}
          onClose={onGoSearch}
          onAddProduct={onAddProduct}
          onLinkBarcode={onLinkBarcode}
        />
      ) : null}

      <p className="disclaimer-bar">{DISCLAIMER}</p>
    </div>
  )
}
