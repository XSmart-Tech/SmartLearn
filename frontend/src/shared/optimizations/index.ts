// Performance optimizations and utilities
export { LazyWrapper } from '../components/utilities/LazyWrapper'
export { ErrorBoundary, DefaultErrorFallback } from '../components/utilities/ErrorBoundary'
export { LoadingButton } from '../components/ui/LoadingButton'
export { OptimizedImage } from '../components/ui/OptimizedImage'
export { VirtualizedList } from '../components/ui/VirtualizedList'
export { MemoButton, MemoCard, MemoInput } from '../components/ui/MemoComponents'

// Custom hooks for performance
export { useFormValidation } from '../hooks/form/useFormValidation'
export { useDebouncedSearch } from '../hooks/utilities/useDebouncedSearch'
export { useLocalStorage } from '../hooks/utilities/useOptimizedLocalStorage'
export { useApiCache } from '../hooks/data/useApiCache'
export { useDashboardLogic } from '../../features/dashboard/hooks/useDashboardLogic'

// Lazy loaded components
export * from '../lib/lazyComponents'
