// Common types used across the app
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface Library extends BaseEntity {
  name: string
  description?: string
  ownerId: string
  share: string[]
  cardCount?: number
  isPublic?: boolean
}

export interface Flashcard extends BaseEntity {
  front: string
  back: string
  libraryId: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  lastReviewed?: Date
  nextReview?: Date
}

export interface StudySession {
  id: string
  libraryId: string
  cardsStudied: number
  correctAnswers: number
  totalTime: number
  completedAt: Date
}

export interface AppError {
  code: string
  message: string
  details?: unknown
}

// Form types
export interface FormField {
  value: string
  error?: string
  touched?: boolean
}

export interface FormState {
  isSubmitting: boolean
  isValid: boolean
  errors: Record<string, string>
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Component prop types
export interface ComponentWithChildren {
  children: React.ReactNode
}

export interface ComponentWithClassName {
  className?: string
}

export interface ComponentWithVariant<T = string> {
  variant?: T
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
}[Keys]
