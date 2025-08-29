import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Flashcard } from "@/shared/lib/types"
import { Button } from "@/shared/ui"
import { useTranslation } from "react-i18next"
import { ChevronRight } from "lucide-react"

type Props = {
  cards: Flashcard[]
  onComplete?: (results: { correct: number; total: number }) => void
}

type CardState = {
  id: string
  attempts: number
  correct: boolean
  lastShown: number
  nextShow: number
  difficulty: number // 0-1, lower is easier
}

export default function LearnMode({ cards, onComplete }: Props) {
  const { t } = useTranslation()
  const [cardStates, setCardStates] = useState<Map<string, CardState>>(new Map())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [input, setInput] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize card states
  useEffect(() => {
    const initialStates = new Map<string, CardState>()
    cards.forEach((card) => {
      initialStates.set(card.id, {
        id: card.id,
        attempts: 0,
        correct: false,
        lastShown: Date.now(),
        nextShow: Date.now(),
        difficulty: 0.5
      })
    })
    setCardStates(initialStates)
    setCurrentIndex(0)
    setShowAnswer(false)
    setInput("")
    setIsComplete(false)
  }, [cards])

  // Get current card and its state
  const currentCard = useMemo(() => {
    if (cards.length === 0) return null
    return cards[currentIndex]
  }, [cards, currentIndex])

  const currentCardState = useMemo(() => {
    if (!currentCard) return null
    return cardStates.get(currentCard.id)
  }, [currentCard, cardStates])

  // Calculate next card to show based on spaced repetition
  const getNextCardIndex = useCallback(() => {
    const now = Date.now()
    let bestIndex = -1
    let bestPriority = -1

    cards.forEach((card, index) => {
      const state = cardStates.get(card.id)
      if (!state) return

      // Skip cards that are scheduled for later
      if (state.nextShow > now) return

      // Calculate priority based on difficulty and time since last shown
      const timeSinceLastShown = now - state.lastShown
      const priority = (1 - state.difficulty) * (timeSinceLastShown / 60000) // minutes

      if (priority > bestPriority) {
        bestPriority = priority
        bestIndex = index
      }
    })

    return bestIndex
  }, [cards, cardStates])

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentCard || !currentCardState || showAnswer) return

    const isCorrect = input.trim().toLowerCase() === currentCard.back.trim().toLowerCase()

    setCardStates(prev => {
      const newStates = new Map(prev)
      const state = newStates.get(currentCard.id)!
      const newAttempts = state.attempts + 1

      // Update difficulty based on performance
      let newDifficulty = state.difficulty
      if (isCorrect) {
        newDifficulty = Math.max(0, state.difficulty - 0.1)
      } else {
        newDifficulty = Math.min(1, state.difficulty + 0.2)
      }

      // Calculate next show time based on spaced repetition
      const interval = isCorrect
        ? Math.max(1, Math.pow(2, newAttempts - 1)) * 60000 // minutes
        : 30000 // 30 seconds for wrong answers

      newStates.set(currentCard.id, {
        ...state,
        attempts: newAttempts,
        correct: isCorrect,
        lastShown: Date.now(),
        nextShow: Date.now() + interval,
        difficulty: newDifficulty
      })

      return newStates
    })

    setShowAnswer(true)

    // Focus input for next answer
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [currentCard, currentCardState, input, showAnswer])

  // Move to next card
  const handleNext = useCallback(() => {
    const nextIndex = getNextCardIndex()

    if (nextIndex === -1) {
      // All cards completed
      const results = Array.from(cardStates.values())
      const correct = results.filter(state => state.correct).length
      setIsComplete(true)
      onComplete?.({ correct, total: cards.length })
    } else {
      setCurrentIndex(nextIndex)
      setShowAnswer(false)
      setInput("")
    }
  }, [getNextCardIndex, cardStates, cards.length, onComplete])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!showAnswer) {
          handleSubmit()
        } else {
          handleNext()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSubmit, handleNext, showAnswer])

  if (isComplete) {
    const results = Array.from(cardStates.values())
    const correct = results.filter(state => state.correct).length
    const totalAttempts = results.reduce((sum, state) => sum + state.attempts, 0)

    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-3xl font-bold text-green-600">
          🎉 {t('study.completed')}
        </div>
        <div className="space-y-2">
          <div className="text-xl">{t('study.finalScore')}: {correct}/{cards.length}</div>
          <div className="text-muted-foreground">
            {t('study.totalAttempts')}: {totalAttempts}
          </div>
        </div>
        <Button onClick={() => window.location.reload()}>
          {t('study.studyAgain')}
        </Button>
      </div>
    )
  }

  if (!currentCard || !currentCardState) {
    return (
      <div className="text-center p-8">
        <div className="text-muted-foreground">{t('study.noCardsToStudy')}</div>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / cards.length) * 100
  const correctCards = Array.from(cardStates.values()).filter(state => state.correct).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('study.progress')}: {currentIndex + 1}/{cards.length}</span>
          <span>{t('study.correct')}: {correctCards}</span>
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
          <div className="text-2xl font-semibold mb-4">{currentCard.front}</div>

          {!showAnswer ? (
            <div className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('study.typeAnswer')}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex gap-3 justify-center">
                <Button onClick={handleSubmit} disabled={!input.trim()}>
                  {t('study.checkAnswer')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAnswer(true)}
                >
                  {t('study.showAnswer')}
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

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  {t('study.nextCard')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-muted-foreground">
        {t('study.attempts')}: {currentCardState.attempts}
      </div>
    </div>
  )
}
