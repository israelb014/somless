// מנוי חי (onSnapshot) על כל מוצרי המשפחה. המאגר קטן — נטען כולו לזיכרון,
// והחיפוש רץ מקומית על כל הקשה. Firestore offline persistence מחזיר את
// הנתונים מיידית גם ללא רשת.
import { useEffect, useMemo, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { productsCollection } from '../lib/products.js'
import { normalize, tokenize } from '../lib/normalize.js'
import { ACTIVE_ALLERGEN } from '../config.js'

/** מכין מוצר לחיפוש: שדות מנורמלים מחושבים מראש. */
function prepareProduct(id, data) {
  const name = data.name || ''
  const brand = data.brand || ''
  const nameNormalized = data.nameNormalized || normalize(name)
  const searchText = normalize(`${name} ${brand}`)
  const updatedAt = data.updatedAt?.toDate?.() || null
  return {
    id,
    ...data,
    name,
    brand,
    nameNormalized,
    searchText,
    searchTokens: tokenize(`${name} ${brand}`),
    status: data.allergens?.[ACTIVE_ALLERGEN] || null,
    updatedAtDate: updatedAt,
    updatedAtMs: updatedAt ? updatedAt.getTime() : 0,
  }
}

export function useProducts(enabled) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [fromCache, setFromCache] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setProducts([])
      setLoading(true)
      return
    }
    return onSnapshot(
      productsCollection(),
      { includeMetadataChanges: true },
      (snap) => {
        setProducts(snap.docs.map((d) => prepareProduct(d.id, d.data())))
        setFromCache(snap.metadata.fromCache)
        setLoading(false)
      },
      (err) => {
        console.error('products subscription failed', err)
        setLoading(false)
      }
    )
  }, [enabled])

  // ספירות לטאבים במסך הרשימה
  const counts = useMemo(() => {
    const c = { contains: 0, may_contain: 0, safe: 0 }
    for (const p of products) if (p.status && c[p.status] !== undefined) c[p.status]++
    return c
  }, [products])

  return { products, loading, fromCache, counts }
}
