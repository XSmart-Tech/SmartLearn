import type { PublicUser } from './types'
import type { TFunction } from 'i18next'

export function validateUserSelection(user: PublicUser | null): boolean {
  return !!user
}

export function validateLibraryName(name: string, t?: TFunction): { isValid: boolean; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) {
    return { isValid: false, error: t ? t('common.libraryRequired') : 'Tên thư viện không được để trống' }
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: t ? t('common.libraryNameTooLong') : 'Tên thư viện không được quá 100 ký tự' }
  }
  return { isValid: true }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
