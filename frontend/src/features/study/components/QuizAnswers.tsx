import type { Flashcard } from '@/shared/lib/types'
import { cn } from '@/shared/lib/utils'

interface QuizAnswersProps {
  cards: Flashcard[]
  className?: string
}

export default function QuizAnswers({ cards, className }: QuizAnswersProps) {
  if (cards.length === 0) {
    return <div className="text-sm text-muted-foreground">Không có câu hỏi.</div>
  }

  return (
    <div className={cn("space-y-3", className)}>
      {cards.map((c, idx) => (
        <div key={c.id} className="rounded-lg border p-3 bg-card">
          <div className="font-medium text-card-foreground">{idx + 1}. {c.front}</div>
          <div className="text-card-foreground mt-1">Đáp án: <span className="font-semibold">{c.back}</span></div>
          {c.description && <div className="text-sm text-muted-foreground mt-1">Mô tả: {c.description}</div>}
        </div>
      ))}
    </div>
  )
}
