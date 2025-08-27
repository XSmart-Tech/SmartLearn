import type { Flashcard } from '@/shared/lib/types'

export type SortField = 'front' | 'back' | 'createdAt' | 'updatedAt'
export type SortOrder = 'asc' | 'desc'

export function sortCards(cards: Flashcard[], sortBy: SortField, sortOrder: SortOrder): Flashcard[] {
  return [...cards].sort((a, b) => {
    let aVal: string | number = ''
    let bVal: string | number = ''

    switch (sortBy) {
      case 'front':
        aVal = a.front.toLowerCase()
        bVal = b.front.toLowerCase()
        break
      case 'back':
        aVal = a.back.toLowerCase()
        bVal = b.back.toLowerCase()
        break
      case 'createdAt':
        aVal = new Date(a.createdAt).getTime()
        bVal = new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
        aVal = new Date(a.updatedAt).getTime()
        bVal = new Date(b.updatedAt).getTime()
        break
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    } else {
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    }
  })
}
