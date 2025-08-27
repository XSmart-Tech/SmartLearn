import Papa from 'papaparse'
import type { Flashcard } from './types'

export function cardsToCSV(cards: Flashcard[]) {
  const rows = cards.map(c => ({ front: c.front, back: c.back, description: c.description ?? '' }))
  return Papa.unparse(rows)
}

export function csvToCards(csv: string) {
  interface CsvRow {
    front?: string
    back?: string
    description?: string
  }
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true })
  return (data as CsvRow[]).map((r) => ({
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2),
    front: String(r.front ?? '').trim(),
    back: String(r.back ?? '').trim(),
    description: r.description ? String(r.description) : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    libraryId: '' // Will be set when importing
  })) as Flashcard[]
}
