// דיאלוג אישור (משמש למחיקת מוצר).
export default function ConfirmDialog({ title, message, confirmLabel = 'מחיקה', onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div
        className="card dialog scale-in"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dialog__title">{title}</h2>
        <p className="dialog__message">{message}</p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            ביטול
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
