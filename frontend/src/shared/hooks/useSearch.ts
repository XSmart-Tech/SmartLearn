import { useState, useMemo } from 'react'

interface UseSearchOptions<T> {
  searchFields?: (keyof T)[]
  customFilter?: (item: T, query: string) => boolean
}

export function useSearch<T>(
  items: T[],
  options: UseSearchOptions<T> = {}
) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
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
  }, [items, query, options])

  return {
    query,
    setQuery,
    filtered,
    hasFilter: query.trim().length > 0
  }
}
