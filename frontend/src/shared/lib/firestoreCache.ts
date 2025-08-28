import { DocumentReference, Query, getDocFromCache, getDoc, getDocsFromCache, getDocs, onSnapshot, type QuerySnapshot, DocumentSnapshot } from 'firebase/firestore'
import { deduplicateQuery, throttleRequest } from './connectionPool'

export async function getDocCacheFirst<T>(ref: DocumentReference<T>) {
  try {
    const snap = await getDocFromCache(ref)
    if (snap.exists()) return { from: 'cache', snap }
  } catch { /* empty */ }

  // Use deduplication and throttling for server requests
  return deduplicateQuery(`doc_${ref.path}`, async () => {
    return throttleRequest(async () => {
      const snap = await getDoc(ref)
      return { from: 'server', snap }
    })
  })
}

export async function getDocsCacheFirst<T>(query: Query<T>) {
  let cacheSnap: QuerySnapshot<T> | null = null
  try {
    cacheSnap = await getDocsFromCache(query)
    // If cache has data and is not empty, return it immediately
    if (cacheSnap && !cacheSnap.empty) {
      return { from: 'cache', snap: cacheSnap }
    }
  } catch {
    cacheSnap = null
  }

  // Use deduplication and throttling for server requests
  return deduplicateQuery(`query_${query}`, async () => {
    return throttleRequest(async () => {
      const snap = await getDocs(query)
      return { from: 'server', snap }
    })
  })
}

export async function getDocsServerOnly<T>(query: Query<T>) {
  return deduplicateQuery(`query_server_${query}`, async () => {
    return throttleRequest(async () => {
      const snap = await getDocs(query)
      return { from: 'server', snap }
    })
  })
}

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
