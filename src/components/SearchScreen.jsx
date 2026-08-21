// מסך ראשי: שדה חיפוש גדול עם autofocus ותוצאות חיות מתחתיו.
import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from './ProductCard.jsx'
import StatusRing from './StatusRing.jsx'
import { CloseIcon, PlusIcon, SearchIcon } from './Icons.jsx'
import { EmptySeedArt } from './SeedArt.jsx'
import SeedLogo from './SeedLogo.jsx'
import HeroSeeds from './HeroSeeds.jsx'
import { useFx } from '../hooks/useFx.jsx'
import { searchProducts } from '../lib/search.js'
import { DISCLAIMER } from '../config.js'

export default function SearchScreen({ products, onAdd, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const boxRef = useRef(null)
  const { pop } = useFx()

  // כל הקשה מקפיצה כמה זרעים מאזור שדה החיפוש.
  // רץ אחרי עדכון ה-state — לא מעכב את החיפוש עצמו באף מילישנייה.
  function handleChange(e) {
    setQuery(e.target.value)
    const box = boxRef.current
    if (!box) return
    const r = box.getBoundingClientRect()
    pop(r.left + r.width * (0.2 + Math.random() * 0.6), r.top + r.height * 0.5)
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // חיפוש מקומי על כל הקשה — המאגר קטן, אין דיבאונס ואין קריאת רשת.
  const results = useMemo(() => searchProducts(products, query), [products, query])
  const trimmed = query.trim()
  const showEmpty = trimmed.length > 0 && results.length === 0

  return (
    <div className="screen">
      <div className="search-hero">
        <HeroSeeds />
        <SeedLogo />
        <p className="search-hero__subtitle">יש בזה שומשום?</p>

        <div className="search-box" ref={boxRef}>
          <SearchIcon size={22} className="search-box__icon" />
          <input
            ref={inputRef}
            className="search-box__input"
            value={query}
            onChange={handleChange}
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
          <div className="empty-state fade-in">
            <EmptySeedArt width={210} />
            <p className="empty-state__text">
              הקלידו שם מוצר כדי לבדוק אם הוא מכיל שומשום.
            </p>
          </div>
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
          <ProductCard
            key={p.id}
            product={p}
            index={i}
            variant={i === 0 ? 'hero' : 'compact'}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* דיסקליימר קבוע בתחתית מסך התוצאות — דרישה קשיחה */}
      <p className="disclaimer-bar">{DISCLAIMER}</p>
    </div>
  )
}
