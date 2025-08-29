// Shared Components Barrel Export

// Export from organized folders
export * from './forms'
export * from './navigation'
export * from './ui'
export * from './dialogs'
export * from './user'

// Utilities - selective export to avoid conflicts
export { ErrorBoundary, DefaultErrorFallback } from './utilities/ErrorBoundary'
export { default as ImportExport } from './utilities/ImportExport'
export { LanguageSwitcher } from './utilities/LanguageSwitcher'
export { LazyWrapper } from './utilities/LazyWrapper'
// Note: optimized.tsx exports are skipped to avoid conflicts with MemoComponents

// Re-export types from ui
export type { SortOption, GridColumns } from './ui'
export type { CardItem } from './ui/CardList'
