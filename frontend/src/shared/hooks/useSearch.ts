import { useState, useMemo } from 'react'
import { useDebounce } from './useDebounce'

interface UseSearchOptions<T> {
  searchFields?: (keyof T)[]
  customFilter?: (item: T, query: string) => boolean
  debounceDelay?: number
}

export function useSearch<T>(
  items: T[],
  options: UseSearchOptions<T> = {}
) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, options.debounceDelay ?? 300)

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return items

    if (options.customFilter) {
      return items.filter(item => options.customFilter!(item, q))
    }

    if (options.searchFields) {
      return items.filter(item => {
        return options.searchFields!.some(field => {
          const value = item[field]
          return String(value).toLowerCase().includes(q)
        })
      })
    }

    // Default: search in all string fields
    return items.filter(item => {
      return Object.values(item as Record<string, unknown>).some(value => {
        return typeof value === 'string' && value.toLowerCase().includes(q)
      })
    })
  }, [items, debouncedQuery, options])

  return {
    query,
    setQuery,
    filtered,
    hasFilter: debouncedQuery.trim().length > 0
  }
}
