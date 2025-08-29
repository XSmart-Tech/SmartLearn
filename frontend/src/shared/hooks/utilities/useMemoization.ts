import { useMemo, useCallback } from 'react'

/**
 * Custom hook for memoizing expensive computations
 */
export function useMemoized<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps)
}

/**
 * Custom hook for memoizing callback functions
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps)
}

/**
 * Utility for creating stable object references
 */
export function useStableValue<T extends Record<string, unknown>>(
  value: T
): T {
  const deps = Object.values(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, deps)
}

/**
 * Utility for creating stable array references
 */
export function useStableArray<T>(array: readonly T[]): readonly T[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => array, array)
}
