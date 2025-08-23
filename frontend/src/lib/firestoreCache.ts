import { DocumentReference, Query, getDocFromCache, getDoc, getDocsFromCache, getDocs, onSnapshot } from 'firebase/firestore'

export async function getDocCacheFirst<T>(ref: DocumentReference<T>) {
  try {
    const snap = await getDocFromCache(ref)
    if (snap.exists()) return { from: 'cache', snap }
  } catch { /* empty */ }
  const snap = await getDoc(ref)
  return { from: 'server', snap }
}

export async function getDocsCacheFirst<T>(query: Query<T>) {
  let cacheSnap: QuerySnapshot<T> | null = null
  try {
    cacheSnap = await getDocsFromCache(query)
  } catch {
    cacheSnap = null
  }

  try {
    const snap = await getDocs(query)
    return { from: 'server', snap }
  } catch (err) {
    if (cacheSnap) return { from: 'cache', snap: cacheSnap }
    throw err
  }
}

import { DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'

export function subscribeOptional<T>(
  enabled: boolean,
  queryOrRef: Query<T> | DocumentReference<T>,
  cb: (snapshot: QuerySnapshot<T> | DocumentSnapshot<T>) => void
) {
  if (!enabled) return () => {}
  if ('where' in queryOrRef) {
    return onSnapshot(queryOrRef as Query<T>, cb)
  } else {
    return onSnapshot(queryOrRef as DocumentReference<T>, cb)
  }
}