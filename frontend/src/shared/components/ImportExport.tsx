import { Button } from '@/shared/ui'
import type { Flashcard } from '@/shared/lib/types'

export default function ImportExport({ cards, onImport }: { cards: Flashcard[]; onImport: (cards: Flashcard[]) => void }) {
  const onExport = async () => {
    // Dynamic import for CSV functionality
    const { cardsToCSV } = await import('@/shared/lib/csv')
    const csv = cardsToCSV(cards)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flashcards.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  const onPick = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,text/csv'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      // Dynamic import for CSV functionality
      const { csvToCards } = await import('@/shared/lib/csv')
      onImport(csvToCards(text))
    }
    input.click()
  }
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={onPick}>Nhập CSV</Button>
      <Button onClick={onExport}>Xuất CSV</Button>
    </div>
  )
}
