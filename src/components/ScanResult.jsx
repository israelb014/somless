// תוצאת הסריקה. "מכיל" ו"עלול להכיל" משתלטים על כל המסך עם צליל ורטט;
// שאר המצבים מוצגים כפאנל רגיל. הדיסקליימר נשאר בכל המצבים.
import { useEffect } from 'react'
import StatusRing from './StatusRing.jsx'
import { CloseIcon, PlusIcon, RefreshIcon } from './Icons.jsx'
import { fireAlert } from '../lib/alertFx.js'
import { STATUSES, DISCLAIMER } from '../config.js'

const UNVERIFIED_TEXT =
  'לא זוהה שומשום ברשימת הרכיבים — לא אומת על ידכם, בדקו את האריזה'

function OffSourceTag() {
  return <span className="scan-source">מקור: Open Food Facts</span>
}

export default function ScanResult({
  result,
  soundEnabled,
  onRescan,
  onClose,
  onAddProduct,
  onLinkBarcode,
}) {
  const { kind, barcode } = result

  // מה הסטטוס שמניע את ההתראה
  const status =
    kind === 'known' ? result.product.status : kind === 'off' ? result.off.status : null
  const alarming = status === 'contains' || status === 'may_contain'

  const name =
    kind === 'known' ? result.product.name : kind === 'off' ? result.off.name || 'מוצר ללא שם' : ''
  const brand = kind === 'known' ? result.product.brand : kind === 'off' ? result.off.brand : ''

  useEffect(() => {
    if (alarming) fireAlert(status, soundEnabled)
  }, [alarming, status, soundEnabled])

  const meta = STATUSES[status]

  // --- השתלטות על המסך: מכיל / עלול להכיל ---
  if (alarming) {
    return (
      <div
        className={`scan-alert scan-alert--${status}`}
        style={{ '--status-color': meta.color }}
        role="alertdialog"
        aria-label={meta.label}
      >
        <div className="scan-alert__inner">
          <StatusRing status={status} size={128} />
          <p className="scan-alert__status">{meta.label}</p>
          <h2 className="scan-alert__name">{name}</h2>
          {brand ? <p className="scan-alert__brand">{brand}</p> : null}

          {kind === 'off' ? (
            <>
              <p className="scan-alert__evidence">{result.off.evidence}</p>
              <OffSourceTag />
            </>
          ) : null}

          <p className="scan-alert__disclaimer">{DISCLAIMER}</p>

          <div className="scan-alert__actions">
            <button type="button" className="btn btn--primary btn--block" onClick={onRescan}>
              <RefreshIcon size={20} />
              סריקה נוספת
            </button>
            <button type="button" className="btn btn--ghost btn--block" onClick={onClose}>
              <CloseIcon size={20} />
              סגירה
            </button>
          </div>

          {kind === 'off' ? (
            <button
              type="button"
              className="scan-alert__save"
              onClick={() =>
                onAddProduct({ name, brand, status, barcode, note: result.off.evidence })
              }
            >
              שמירה במאגר שלי
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  // --- שאר המצבים: פאנל רגיל ---
  return (
    <div className="scan-panel-wrap" role="dialog" aria-label="תוצאת סריקה">
      <div className="card scan-panel scale-in">
        {kind === 'known' ? (
          <>
            <StatusRing status={result.product.status} size={64} />
            <h2 className="scan-panel__name">{result.product.name}</h2>
            {result.product.brand ? (
              <p className="scan-panel__brand">{result.product.brand}</p>
            ) : null}
            <span className="status-pill status-pill--lg" style={{ '--status-color': meta?.color }}>
              {meta?.label || 'לא ידוע'}
            </span>
          </>
        ) : null}

        {kind === 'off' ? (
          <>
            <StatusRing status="unknown" size={64} />
            <h2 className="scan-panel__name">{name}</h2>
            {brand ? <p className="scan-panel__brand">{brand}</p> : null}
            <p className="scan-panel__text">{UNVERIFIED_TEXT}</p>
            <OffSourceTag />
          </>
        ) : null}

        {kind === 'unknown' ? (
          <>
            <StatusRing status="unknown" size={64} />
            <h2 className="scan-panel__name">מוצר לא מזוהה</h2>
            <p className="scan-panel__text">
              הברקוד {barcode} לא נמצא במאגר שלכם ולא ב-Open Food Facts. אפשר להוסיף אותו
              עכשיו — הברקוד כבר משויך.
            </p>
          </>
        ) : null}

        <p className="scan-panel__code">ברקוד {barcode}</p>

        <div className="scan-panel__actions">
          {kind !== 'known' ? (
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() =>
                onAddProduct({
                  name: kind === 'off' ? name : '',
                  brand: kind === 'off' ? brand : '',
                  // מ-OFF לעולם לא מגיע "בטוח" — ברירת המחדל שמרנית
                  status: 'may_contain',
                  barcode,
                  note: kind === 'off' ? result.off.evidence : '',
                })
              }
            >
              <PlusIcon size={20} />
              {kind === 'off' ? 'שמירה במאגר שלי' : 'הוספה ידנית'}
            </button>
          ) : null}

          {kind === 'off' && result.suggestion ? (
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => onLinkBarcode(result.suggestion, barcode)}
            >
              שיוך הברקוד ל"{result.suggestion.name}"
            </button>
          ) : null}

          <button type="button" className="btn btn--ghost btn--block" onClick={onRescan}>
            <RefreshIcon size={20} />
            סריקה נוספת
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={onClose}>
            <CloseIcon size={20} />
            סגירה
          </button>
        </div>

        <p className="scan-panel__disclaimer">{DISCLAIMER}</p>
      </div>
    </div>
  )
}
