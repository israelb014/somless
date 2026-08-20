// טעינת המאגר: המרכזי (products.json) + ההוספות המקומיות (IndexedDB),
// מאוחדים לרשימה אחת שמוזנת לחיפוש.
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createLocalProduct,
  loadCentralDb,
  loadLocalProducts,
  prepareProduct,
  removeLocalProduct,
  saveLocalProduct,
} from '../lib/products.js'

export function useProducts() {
  const [central, setCentral] = useState([])
  const [dbMeta, setDbMeta] = useState(null)
  const [local, setLocal] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([loadCentralDb(), loadLocalProducts()]).then(([db, locals]) => {
      if (!alive) return
      setCentral(db.products.map((p) => prepareProduct(p, false)))
      setDbMeta({ version: db.version, updatedAt: db.updatedAt })
      setLocal(locals.map((p) => prepareProduct(p, true)))
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  // ההוספות המקומיות קודמות למרכזיות בעלות אותו שם — ההורה בדק בעצמו.
  const products = useMemo(() => {
    const localNames = new Set(local.map((p) => p.nameNormalized))
    return [...local, ...central.filter((p) => !localNames.has(p.nameNormalized))]
  }, [central, local])

  const counts = useMemo(() => {
    const c = { contains: 0, may_contain: 0, safe: 0 }
    for (const p of products) if (p.status && c[p.status] !== undefined) c[p.status]++
    return c
  }, [products])

  const addLocal = useCallback(async (values) => {
    const saved = await createLocalProduct(values)
    setLocal((prev) => [...prev, prepareProduct(saved, true)])
  }, [])

  const updateLocal = useCallback(async (product, values) => {
    const saved = await saveLocalProduct(product, values)
    setLocal((prev) => prev.map((p) => (p.id === saved.id ? prepareProduct(saved, true) : p)))
  }, [])

  const deleteLocal = useCallback(async (id) => {
    await removeLocalProduct(id)
    setLocal((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { products, local, counts, loading, dbMeta, addLocal, updateLocal, deleteLocal }
}
