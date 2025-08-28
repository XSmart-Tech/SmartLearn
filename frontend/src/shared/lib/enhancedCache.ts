import { createApi, type BaseQueryFn, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { db } from '@/shared/lib/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  getDoc
} from 'firebase/firestore'
import type { Library, Flashcard, PublicUser } from '@/shared/lib/types'

// Query parameter types
interface LibrariesParams {
  uid: string
}

interface CardsParams {
  libraryId: string
}

interface LibraryParams {
  id: string
}

interface UsersParams {
  term: string
}

type QueryParams = LibrariesParams | CardsParams | LibraryParams | UsersParams

// Cache entry with timestamp
interface CacheEntry<T> {
  data: T
  timestamp: number
  serverTimestamp?: number
}

// Global cache store
class CacheStore {
  private static instance: CacheStore | null = null
  private cache = new Map<string, CacheEntry<unknown>>()
  private cacheTimestamps = new Map<string, number>()

  static getInstance(): CacheStore {
    if (!CacheStore.instance) {
      CacheStore.instance = new CacheStore()
    }
    return CacheStore.instance
  }

  set<T>(key: string, data: T, serverTimestamp?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      serverTimestamp
    })
  }

  get<T>(key: string): CacheEntry<T> | null {
    return (this.cache.get(key) as CacheEntry<T>) || null
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
    this.cacheTimestamps.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.cacheTimestamps.clear()
  }

  // Check if cache is stale compared to server timestamp
  isStale(key: string, serverTimestamp?: number): boolean {
    if (!serverTimestamp) return false

    const entry = this.cache.get(key)
    if (!entry || !entry.serverTimestamp) return true

    return entry.serverTimestamp < serverTimestamp
  }

  // Get all cache keys
  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

const cacheStore = CacheStore.getInstance()

// Enhanced Firebase base query with intelligent caching
const firebaseCacheFirstQuery: BaseQueryFn<
  { type: string; params?: QueryParams; forceRefresh?: boolean },
  unknown,
  FetchBaseQueryError
> = async ({ type, params, forceRefresh = false }) => {
  try {
    const cacheKey = `${type}_${JSON.stringify(params)}`

    // If not forcing refresh, try cache first
    if (!forceRefresh) {
      const cached = cacheStore.get(cacheKey)
      if (cached) {
        // Check if cache is stale by comparing with server
        const isStale = await checkCacheStale(type, params, cached.serverTimestamp)
        if (!isStale) {
          return { data: cached.data }
        }
      }
    }

    // Fetch from server
    const result = await fetchFromFirebase(type, params)

    // Cache the result with server timestamp
    if (result.serverTimestamp) {
      cacheStore.set(cacheKey, result.data, result.serverTimestamp)
    }

    return { data: result.data }
  } catch (error) {
    return {
      error: {
        status: 500,
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Check if cache is stale by comparing with server timestamp
async function checkCacheStale(type: string, params: QueryParams | undefined, cachedServerTimestamp?: number): Promise<boolean> {
  if (!params || !cachedServerTimestamp) return true

  try {
    switch (type) {
      case 'libraries': {
        const uid = (params as LibrariesParams).uid
        const ownerQ = query(collection(db, 'libraries'), where('ownerId', '==', uid))
        const sharedQ = query(collection(db, 'libraries'), where('share', 'array-contains', uid))

        const [ownerSnap, sharedSnap] = await Promise.all([
          getDocs(ownerQ),
          getDocs(sharedQ)
        ])

        const allDocs = [...ownerSnap.docs, ...sharedSnap.docs]
        const latestTimestamp = Math.max(
          ...allDocs.map(d => d.data().updatedAt || 0),
          ...allDocs.map(d => d.data().createdAt || 0)
        )

        return latestTimestamp > cachedServerTimestamp
      }

      case 'cards': {
        const libraryId = (params as CardsParams).libraryId
        const q = query(collection(db, 'cards'), where('libraryId', '==', libraryId))
        const snap = await getDocs(q)

        const latestTimestamp = Math.max(
          ...snap.docs.map(d => d.data().updatedAt || 0),
          ...snap.docs.map(d => d.data().createdAt || 0)
        )

        return latestTimestamp > cachedServerTimestamp
      }

      case 'library': {
        const id = (params as LibraryParams).id
        const docSnap = await getDoc(doc(db, 'libraries', id))
        if (!docSnap.exists()) return true

        const data = docSnap.data()
        const docTimestamp = data.updatedAt || data.createdAt || 0

        return docTimestamp > cachedServerTimestamp
      }

      default:
        return false
    }
  } catch {
    return true // Assume stale if we can't check
  }
}

// Fetch data from Firebase
async function fetchFromFirebase(type: string, params: QueryParams | undefined): Promise<{ data: unknown; serverTimestamp?: number }> {
  if (!params) return { data: null }

  switch (type) {
    case 'libraries': {
      const uid = (params as LibrariesParams).uid
      const ownerQ = query(collection(db, 'libraries'), where('ownerId', '==', uid))
      const sharedQ = query(collection(db, 'libraries'), where('share', 'array-contains', uid))

      const [ownerRes, sharedRes] = await Promise.all([
        getDocs(ownerQ),
        getDocs(sharedQ)
      ])

      const seen = new Set<string>()
      const items: Library[] = []
      let latestTimestamp = 0

      for (const d of [...ownerRes.docs, ...sharedRes.docs]) {
        if (seen.has(d.id)) continue
        seen.add(d.id)
        const data = d.data() as Omit<Library, 'id'>
        items.push({ id: d.id, ...data })

        const docTimestamp = data.updatedAt || data.createdAt || 0
        if (docTimestamp > latestTimestamp) {
          latestTimestamp = docTimestamp
        }
      }

      items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))

      return { data: items, serverTimestamp: latestTimestamp }
    }

    case 'cards': {
      const libraryId = (params as CardsParams).libraryId
      const q = query(collection(db, 'cards'), where('libraryId', '==', libraryId))
      const snap = await getDocs(q)

      const items = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Flashcard, 'id'>)
      })) as Flashcard[]

      const latestTimestamp = Math.max(
        ...items.map(card => card.updatedAt || card.createdAt || 0)
      )

      items.sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))

      return { data: items, serverTimestamp: latestTimestamp }
    }

    case 'library': {
      const id = (params as LibraryParams).id
      const docSnap = await getDoc(doc(db, 'libraries', id))

      if (!docSnap.exists()) {
        return { data: null }
      }

      const data = docSnap.data()
      const library = { id: docSnap.id, ...data } as Library
      const serverTimestamp = data.updatedAt || data.createdAt || Date.now()

      return { data: library, serverTimestamp }
    }

    case 'users': {
      const term = (params as UsersParams).term
      const q = term.trim().toLowerCase()
      if (!q) return { data: [] }

      const col = collection(db, 'users')
      const results: Record<string, PublicUser> = {}

      const emailSnap = await getDocs(
        query(col, where('emailLower', '==', q))
      )

      emailSnap.forEach(d => {
        const v = d.data() as PublicUser
        results[d.id] = {
          uid: d.id,
          displayName: v.displayName ?? '',
          email: v.email ?? '',
          photoURL: v.photoURL ?? ''
        }
      })

      return { data: Object.values(results) }
    }

    default:
      throw new Error(`Unknown query type: ${type}`)
  }
}

// Create the enhanced API slice
export const enhancedApiSlice = createApi({
  reducerPath: 'enhancedApi',
  baseQuery: firebaseCacheFirstQuery,
  tagTypes: ['Library', 'Card', 'User', 'EnhancedLibrary', 'EnhancedCard'],
  endpoints: (builder) => ({
    // Enhanced Libraries with intelligent caching
    fetchLibraries: builder.query<Library[], string>({
      query: (uid) => ({ type: 'libraries', params: { uid } }),
      providesTags: (result) =>
        result ? result.map(lib => ({ type: 'EnhancedLibrary' as const, id: lib.id })) : ['EnhancedLibrary'],
    }),

    fetchLibraryById: builder.query<Library | null, string>({
      query: (id) => ({ type: 'library', params: { id } }),
      providesTags: (result) =>
        result ? [{ type: 'EnhancedLibrary', id: result.id }] : ['EnhancedLibrary'],
    }),

    // Enhanced Cards with intelligent caching
    fetchCards: builder.query<Flashcard[], string>({
      query: (libraryId) => ({ type: 'cards', params: { libraryId } }),
      providesTags: (result) =>
        result ? result.map(card => ({ type: 'EnhancedCard' as const, id: card.id })) : ['EnhancedCard'],
    }),

    // Enhanced Users search
    searchUsers: builder.query<PublicUser[], string>({
      query: (term) => ({ type: 'users', params: { term } }),
      providesTags: ['User'],
    }),

    // Force refresh any cached data
    refreshLibraries: builder.query<Library[], string>({
      query: (uid) => ({ type: 'libraries', params: { uid }, forceRefresh: true }),
    }),

    refreshCards: builder.query<Flashcard[], string>({
      query: (libraryId) => ({ type: 'cards', params: { libraryId }, forceRefresh: true }),
    }),

    refreshLibrary: builder.query<Library | null, string>({
      query: (id) => ({ type: 'library', params: { id }, forceRefresh: true }),
    }),
  }),
})

// Export hooks
export const {
  useFetchLibrariesQuery,
  useFetchLibraryByIdQuery,
  useFetchCardsQuery,
  useSearchUsersQuery,
  useRefreshLibrariesQuery,
  useRefreshCardsQuery,
  useRefreshLibraryQuery,
} = enhancedApiSlice

// Export cache management functions
export const cacheManager = {
  clear: () => cacheStore.clear(),
  delete: (key: string) => cacheStore.delete(key),
  has: (key: string) => cacheStore.has(key),
  keys: () => cacheStore.keys(),
  get: <T>(key: string) => cacheStore.get<T>(key),
}

// Export the reducer
export default enhancedApiSlice.reducer
