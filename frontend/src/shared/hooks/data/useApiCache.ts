import { useState, useEffect, useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface UseApiCacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum cache size
}

export function useApiCache<T>(
  key: string,
  options: UseApiCacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map())

  const get = useCallback((cacheKey: string): T | null => {
    const entry = cacheRef.current.get(cacheKey)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(cacheKey)
      setCache(new Map(cacheRef.current))
      return null
    }

    return entry.data
  }, [])

  const set = useCallback((cacheKey: string, data: T, customTtl?: number) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl ?? ttl
    }

    // Check cache size limit
    if (cacheRef.current.size >= maxSize) {
      const firstKey = cacheRef.current.keys().next().value
      if (firstKey) {
        cacheRef.current.delete(firstKey)
      }
    }

    cacheRef.current.set(cacheKey, entry)
    setCache(new Map(cacheRef.current))
  }, [ttl, maxSize])

  const remove = useCallback((cacheKey: string) => {
    cacheRef.current.delete(cacheKey)
    setCache(new Map(cacheRef.current))
  }, [])

  const clear = useCallback(() => {
    cacheRef.current.clear()
    setCache(new Map())
  }, [])

  const cleanup = useCallback(() => {
    const now = Date.now()
    const keysToDelete: string[] = []

    cacheRef.current.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => cacheRef.current.delete(key))
    if (keysToDelete.length > 0) {
      setCache(new Map(cacheRef.current))
    }
  }, [])

  // Cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(cleanup, 60000) // Clean every minute
    return () => clearInterval(interval)
  }, [cleanup])

  return {
    get: (cacheKey?: string) => get(cacheKey ?? key),
    set: (data: T, cacheKey?: string, customTtl?: number) => set(cacheKey ?? key, data, customTtl),
    remove: (cacheKey?: string) => remove(cacheKey ?? key),
    clear,
    size: cache.size,
    has: (cacheKey?: string) => cacheRef.current.has(cacheKey ?? key)
  }
}
