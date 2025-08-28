import { useState, useCallback, useEffect } from 'react'
import { collection, query, where, orderBy, limit, startAfter, getDocs, type QueryDocumentSnapshot, type DocumentData, type QueryConstraint } from 'firebase/firestore'
import { db } from './firebase'

export interface PaginationOptions {
  pageSize?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  items: T[]
  hasMore: boolean
  lastDoc?: QueryDocumentSnapshot<DocumentData>
}

export class Paginator {
  private collectionName: string
  private baseQuery: QueryConstraint[] = []
  private options: Required<PaginationOptions>

  constructor(
    collectionName: string,
    baseConstraints: QueryConstraint[] = [],
    options: PaginationOptions = {}
  ) {
    this.collectionName = collectionName
    this.baseQuery = baseConstraints
    this.options = {
      pageSize: options.pageSize || 20,
      orderBy: options.orderBy || 'updatedAt',
      orderDirection: options.orderDirection || 'desc'
    }
  }

  async getFirstPage<T>(): Promise<PaginatedResult<T>> {
    const q = query(
      collection(db, this.collectionName),
      ...this.baseQuery,
      orderBy(this.options.orderBy, this.options.orderDirection),
      limit(this.options.pageSize)
    )

    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
    const hasMore = snapshot.docs.length === this.options.pageSize

    return {
      items,
      hasMore,
      lastDoc: hasMore ? snapshot.docs[snapshot.docs.length - 1] : undefined
    }
  }

  async getNextPage<T>(lastDoc: QueryDocumentSnapshot<DocumentData>): Promise<PaginatedResult<T>> {
    const q = query(
      collection(db, this.collectionName),
      ...this.baseQuery,
      orderBy(this.options.orderBy, this.options.orderDirection),
      startAfter(lastDoc),
      limit(this.options.pageSize)
    )

    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
    const hasMore = snapshot.docs.length === this.options.pageSize

    return {
      items,
      hasMore,
      lastDoc: hasMore ? snapshot.docs[snapshot.docs.length - 1] : undefined
    }
  }
}

// Utility functions for common pagination patterns
export function createLibrariesPaginator(uid: string, options?: PaginationOptions): Paginator {
  return new Paginator('libraries', [
    where('ownerId', '==', uid)
  ], options)
}

export function createSharedLibrariesPaginator(uid: string, options?: PaginationOptions): Paginator {
  return new Paginator('libraries', [
    where('share', 'array-contains', uid)
  ], options)
}

export function createCardsPaginator(libraryId: string, options?: PaginationOptions): Paginator {
  return new Paginator('cards', [
    where('libraryId', '==', libraryId)
  ], options)
}

// Hook for managing pagination state
export function usePagination<T>(
  paginator: Paginator,
  autoLoad = true
): {
  items: T[]
  loading: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
} {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)

  const loadFirstPage = useCallback(async () => {
    if (loading) return

    setLoading(true)
    try {
      const result = await paginator.getFirstPage<T>()
      setItems(result.items)
      setHasMore(result.hasMore)
      setLastDoc(result.lastDoc || null)
    } catch (error) {
      console.error('Error loading first page:', error)
    } finally {
      setLoading(false)
    }
  }, [paginator, loading])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !lastDoc) return

    setLoading(true)
    try {
      const result = await paginator.getNextPage<T>(lastDoc)
      setItems((prev: T[]) => [...prev, ...result.items])
      setHasMore(result.hasMore)
      setLastDoc(result.lastDoc || null)
    } catch (error) {
      console.error('Error loading next page:', error)
    } finally {
      setLoading(false)
    }
  }, [paginator, loading, hasMore, lastDoc])

  const refresh = useCallback(async () => {
    setLastDoc(null)
    setHasMore(true)
    await loadFirstPage()
  }, [loadFirstPage])

  const reset = useCallback(() => {
    setItems([])
    setHasMore(true)
    setLastDoc(null)
  }, [])

  useEffect(() => {
    if (autoLoad) {
      loadFirstPage()
    }
  }, [autoLoad, loadFirstPage])

  return {
    items,
    loading,
    hasMore,
    loadMore,
    refresh,
    reset
  }
}
