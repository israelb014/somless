// מסך ראשי: שדה חיפוש גדול עם autofocus ותוצאות חיות מתחתיו.
import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from './ProductCard.jsx'
import StatusRing from './StatusRing.jsx'
import { CloseIcon, PlusIcon, SearchIcon } from './Icons.jsx'
import { searchProducts } from '../lib/search.js'
import { DISCLAIMER } from '../config.js'

export default function SearchScreen({ products, loading, onAdd, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // חיפוש מקומי על כל הקשה — המאגר קטן, אין דיבאונס ואין קריאת רשת.
  const results = useMemo(() => searchProducts(products, query), [products, query])
  const trimmed = query.trim()
  const showEmpty = trimmed.length > 0 && results.length === 0 && !loading

  return (
    <div className="screen">
      <div className="search-hero">
        <h1 className="search-hero__title">סומלס</h1>
        <p className="search-hero__subtitle">יש בזה שומשום?</p>

        <div className="search-box">
          <SearchIcon size={22} className="search-box__icon" />
          <input
            ref={inputRef}
            className="search-box__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="שם מוצר…"
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="search"
            aria-label="חיפוש מוצר"
          />
          {query ? (
            <button
              type="button"
              className="icon-btn search-box__clear"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="ניקוי חיפוש"
            >
              <CloseIcon size={20} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="results">
        {!trimmed ? (
          <p className="results__placeholder">
            הקלידו שם מוצר כדי לבדוק אם הוא מכיל שומשום.
          </p>
        ) : null}

        {showEmpty ? (
          <div className="card unknown-card scale-in">
            <StatusRing status="unknown" size={52} />
            <div className="unknown-card__body">
              <h3 className="unknown-card__title">לא נמצא במאגר — בדקו את התווית</h3>
              <p className="unknown-card__text">
                המוצר "{trimmed}" לא קיים במאגר המשפחתי.
              </p>
            </div>
            <button type="button" className="btn btn--primary btn--block" onClick={() => onAdd(trimmed)}>
              <PlusIcon size={20} />
              הוסף מוצר
            </button>
          </div>
        ) : null}

        {results.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      {/* דיסקליימר קבוע בתחתית מסך התוצאות — דרישה קשיחה */}
      <p className="disclaimer-bar">{DISCLAIMER}</p>
    </div>
  )
}
