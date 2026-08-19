// כתיבה/מחיקה של מוצרים ב-Firestore. כל שמירה מעדכנת updatedAt ו-updatedBy.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { ACTIVE_ALLERGEN, FAMILY_ID } from '../config.js'
import { normalize } from './normalize.js'

export function productsCollection(familyId = FAMILY_ID) {
  return collection(db, 'families', familyId, 'products')
}

function userLabel(user) {
  return (user?.email || '').toLowerCase() || user?.uid || 'unknown'
}

/**
 * יוצר מוצר חדש.
 * allergens נשמר כמפה כדי לתמוך בעתיד בכמה אלרגנים.
 */
export function createProduct({ name, brand, status, note }, user, familyId = FAMILY_ID) {
  const trimmed = name.trim()
  return addDoc(productsCollection(familyId), {
    name: trimmed,
    nameNormalized: normalize(trimmed),
    brand: (brand || '').trim(),
    allergens: { [ACTIVE_ALLERGEN]: status },
    note: (note || '').trim(),
    source: 'user',
    createdAt: serverTimestamp(),
    createdBy: userLabel(user),
    updatedAt: serverTimestamp(),
    updatedBy: userLabel(user),
  })
}

/** מעדכן מוצר קיים, תוך שמירה על שאר האלרגנים במפה. */
export function saveProduct(product, { name, brand, status, note }, user, familyId = FAMILY_ID) {
  const trimmed = name.trim()
  const ref = doc(db, 'families', familyId, 'products', product.id)
  return updateDoc(ref, {
    name: trimmed,
    nameNormalized: normalize(trimmed),
    brand: (brand || '').trim(),
    allergens: { ...(product.allergens || {}), [ACTIVE_ALLERGEN]: status },
    note: (note || '').trim(),
    source: product.source === 'seed' ? 'seed-edited' : product.source || 'user',
    updatedAt: serverTimestamp(),
    updatedBy: userLabel(user),
  })
}

export function removeProduct(productId, familyId = FAMILY_ID) {
  return deleteDoc(doc(db, 'families', familyId, 'products', productId))
}
