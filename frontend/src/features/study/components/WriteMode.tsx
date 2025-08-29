import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Flashcard } from "@/shared/lib/types"
import { Button } from "@/shared/ui"
import { useTranslation } from "react-i18next"
import { ChevronRight, RotateCcw } from "lucide-react"

type Props = {
  cards: Flashcard[]
  onComplete?: (results: { correct: number; total: number }) => void
}

export default function WriteMode({ cards, onComplete }: Props) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const currentCard = useMemo(() => {
    if (cards.length === 0) return null
    return cards[currentIndex]
  }, [cards, currentIndex])

  const progress = useMemo(() => {
    return cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0
  }, [currentIndex, cards.length])

  const correctCount = useMemo(() => {
    return results.filter(Boolean).length
  }, [results])

  const handleSubmit = useCallback(() => {
    if (!currentCard || showAnswer) return

    const isCorrect = input.trim().toLowerCase() === currentCard.back.trim().toLowerCase()
    const newResults = [...results, isCorrect]
    setResults(newResults)
    setShowAnswer(true)

    // Auto-advance after showing answer
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setInput("")
        setShowAnswer(false)
      } else {
        setIsComplete(true)
        onComplete?.({
          correct: newResults.filter(Boolean).length,
          total: cards.length
        })
      }
    }, 2000)
  }, [currentCard, input, showAnswer, results, currentIndex, cards.length, onComplete])

  const handleSkip = useCallback(() => {
    if (!currentCard || showAnswer) return

    const newResults = [...results, false]
    setResults(newResults)
    setShowAnswer(true)

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setInput("")
        setShowAnswer(false)
      } else {
        setIsComplete(true)
        onComplete?.({
          correct: newResults.filter(Boolean).length,
          total: cards.length
        })
      }
    }, 1000)
  }, [currentCard, showAnswer, results, currentIndex, cards.length, onComplete])

  const restart = useCallback(() => {
    setCurrentIndex(0)
    setInput("")
    setShowAnswer(false)
    setResults([])
    setIsComplete(false)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSubmit()
      }
      if (e.key === "Escape") {
        handleSkip()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSubmit, handleSkip])

  // Focus input when card changes
  useEffect(() => {
    if (inputRef.current && !showAnswer) {
      inputRef.current.focus()
    }
  }, [currentIndex, showAnswer])

  if (isComplete) {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-3xl font-bold text-green-600">
          ✍️ {t('study.writeCompleted')}
        </div>
        <div className="space-y-2">
          <div className="text-xl">{t('study.finalScore')}: {correctCount}/{cards.length}</div>
          <div className="text-muted-foreground">
            {t('study.accuracy')}: {Math.round((correctCount / cards.length) * 100)}%
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={restart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('study.writeAgain')}
          </Button>
        </div>
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="text-center p-8">
        <div className="text-muted-foreground">{t('study.noCardsToStudy')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('study.progress')}: {currentIndex + 1}/{cards.length}</span>
          <span>{t('study.correct')}: {correctCount}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-card border rounded-xl p-8 space-y-6">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-6">{currentCard.front}</div>

          {!showAnswer ? (
            <div className="space-y-4">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('study.writeAnswer')}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
                autoFocus
              />
              <div className="flex gap-3 justify-center">
                <Button onClick={handleSubmit} disabled={!input.trim()}>
                  {t('study.checkAnswer')} (Ctrl+Enter)
                </Button>
                <Button variant="outline" onClick={handleSkip}>
                  {t('study.skip')} (Esc)
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-lg font-medium">{currentCard.back}</div>
                {currentCard.description && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {currentCard.description}
                  </div>
                )}
              </div>

              <div className="text-center">
                {results[currentIndex] ? (
                  <div className="text-green-600 font-medium">
                    ✅ {t('study.correct')}
                  </div>
                ) : (
                  <div className="text-red-600 font-medium">
                    ❌ {t('study.incorrect')}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    if (currentIndex < cards.length - 1) {
                      setCurrentIndex(currentIndex + 1)
                      setInput("")
                      setShowAnswer(false)
                    } else {
                      setIsComplete(true)
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {currentIndex < cards.length - 1 ? t('study.nextCard') : t('study.finish')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        {t('study.writeInstructions')}
      </div>
    </div>
  )
}
