import type { Flashcard } from '@/shared/lib/types'
import { cn } from '@/shared/lib/utils'
import { useTranslation } from 'react-i18next'

interface QuizAnswersProps {
  cards: Flashcard[]
  className?: string
}

export default function QuizAnswers({ cards, className }: QuizAnswersProps) {
  const { t } = useTranslation()

  if (cards.length === 0) {
    return <div className="text-sm text-muted-foreground">{t('study.noQuestions')}</div>
  }

  return (
    <div className={cn("space-y-3", className)}>
      {cards.map((c, idx) => (
        <div key={c.id} className="rounded-lg border p-3 bg-card">
          <div className="font-medium text-card-foreground">{idx + 1}. {c.front}</div>
          <div className="text-card-foreground mt-1">{t('study.answer')}: <span className="font-semibold">{c.back}</span></div>
          {c.description && <div className="text-sm text-muted-foreground mt-1">{t('common.description')}: {c.description}</div>}
        </div>
      ))}
    </div>
  )
}
