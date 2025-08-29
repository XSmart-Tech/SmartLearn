import { Button } from '@/shared/ui'
import { PopoverMenuItem } from '@/shared/components'
import type { Flashcard } from '@/shared/lib/types'
import { useTranslation } from 'react-i18next'
import { Upload, Download } from 'lucide-react'

export default function ImportExport({
  cards,
  onImport,
  inPopover = false
}: {
  cards: Flashcard[];
  onImport: (cards: Flashcard[]) => void;
  inPopover?: boolean;
}) {
  const { t } = useTranslation()
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

  if (inPopover) {
    return (
      <>
        <PopoverMenuItem onClick={onPick}>
          <Upload className="mr-2 h-3 w-3" />
          {t('common.importCsv')}
        </PopoverMenuItem>
        <PopoverMenuItem onClick={onExport}>
          <Download className="mr-2 h-3 w-3" />
          {t('common.exportCsv')}
        </PopoverMenuItem>
      </>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={onPick}>{t('common.importCsv')}</Button>
      <Button onClick={onExport}>{t('common.exportCsv')}</Button>
    </div>
  )
}
