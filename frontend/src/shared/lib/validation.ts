import type { PublicUser } from './types'

export function validateUserSelection(user: PublicUser | null): boolean {
  return !!user
}

export function validateLibraryName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Tên thư viện không được để trống' }
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Tên thư viện không được quá 100 ký tự' }
  }
  return { isValid: true }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
