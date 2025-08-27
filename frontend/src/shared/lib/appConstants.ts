// App-wide constants
export const APP_CONFIG = {
  name: 'SmartLearn',
  version: '1.0.0',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  debounceDelay: 300,
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const

// Theme constants
export const THEME_MODES = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const

export type ThemeMode = typeof THEME_MODES[keyof typeof THEME_MODES]

// Sort constants
export const SORT_ORDERS = {
  asc: 'asc',
  desc: 'desc',
} as const

export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS]

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  libraryName: /^[a-zA-Z0-9\s\-_]{1,50}$/,
} as const

// API constants
export const API_ENDPOINTS = {
  libraries: '/libraries',
  cards: '/cards',
  users: '/users',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  recentLibraries: 'smartlearn_recent_libraries',
  userPreferences: 'smartlearn_user_preferences',
  theme: 'smartlearn_theme',
} as const
