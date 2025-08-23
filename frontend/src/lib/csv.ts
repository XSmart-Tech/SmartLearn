import Papa from 'papaparse'
import type { Flashcard } from './types'

export function cardsToCSV(cards: Flashcard[]) {
  const rows = cards.map(c => ({ front: c.front, back: c.back, hint: c.hint ?? '', tags: (c.tags ?? []).join('|') }))
  return Papa.unparse(rows)
}

export function csvToCards(csv: string) {
  interface CsvRow {
    front?: string
    back?: string
    hint?: string
    tags?: string
  }
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true })
  return (data as CsvRow[]).map((r) => ({
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2),
    front: String(r.front ?? '').trim(),
    back: String(r.back ?? '').trim(),
    hint: r.hint ? String(r.hint) : undefined,
    tags: r.tags ? String(r.tags).split('|').map((t) => t.trim()).filter(Boolean) : [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })) as Flashcard[]
}