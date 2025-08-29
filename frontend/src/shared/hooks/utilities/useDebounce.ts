import { useState, useEffect, useMemo } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  const searchActions = useMemo(() => ({
    setSearchTerm,
    clearSearch: () => setSearchTerm(''),
  }), [])

  return {
    searchTerm,
    debouncedSearchTerm,
    ...searchActions,
  }
}
