import { useEffect, useRef, useState } from 'react'

// Tiny SWR-like cache-first hook for non-Firestore fetchers
const cache = new Map<string, unknown>()
export function useSWRCache<T>(key: string, fetcher: () => Promise<T>, revalidateMs = 30000) {
  const [data, setData] = useState<T | undefined>(() => cache.get(key) as T | undefined)
  const [loading, setLoading] = useState(!cache.has(key))
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        if (!cache.has(key)) setLoading(true)
        const value = await fetcher()
        cache.set(key, value)
        if (!cancelled) setData(value)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    timer.current = window.setInterval(run, revalidateMs)
    return () => { cancelled = true; if (timer.current) window.clearInterval(timer.current) }
  }, [key, fetcher, revalidateMs])

  return { data, loading, mutate: (v: T) => { cache.set(key, v); setData(v) } }
}
