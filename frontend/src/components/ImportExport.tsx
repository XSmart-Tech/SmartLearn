import { Button } from './ui/button'
import { cardsToCSV, csvToCards } from '@/lib/csv'
import type { Flashcard } from '@/lib/types'

export default function ImportExport({ cards, onImport }: { cards: Flashcard[]; onImport: (cards: Flashcard[]) => void }) {
  const onExport = () => {
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
      onImport(csvToCards(text))
    }
    input.click()
  }
  return (
    <div className="flex gap-2">
      <Button onClick={onPick}>Nhập CSV</Button>
      <Button onClick={onExport}>Xuất CSV</Button>
    </div>
  )
}