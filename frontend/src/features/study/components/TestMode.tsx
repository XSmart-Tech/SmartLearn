import { useCallback, useEffect, useMemo, useState } from "react"
import type { Flashcard } from "@/shared/lib/types"
import { Button } from "@/shared/ui"
import { useTranslation } from "react-i18next"
import { ChevronRight, RotateCcw, CheckCircle, XCircle } from "lucide-react"

type Props = {
  cards: Flashcard[]
  onComplete?: (results: { correct: number; total: number }) => void
}

type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank'

export default function TestMode({ cards, onComplete }: Props) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice')

  const currentCard = useMemo(() => {
    if (cards.length === 0) return null
    return cards[currentIndex]
  }, [cards, currentIndex])

  // Generate multiple choice options
  const options = useMemo(() => {
    if (!currentCard) return []

    const correctAnswer = currentCard.back
    const otherCards = cards.filter(card => card.id !== currentCard.id)
    const wrongOptions = otherCards
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(card => card.back)

    const allOptions = [correctAnswer, ...wrongOptions]
    return allOptions.sort(() => Math.random() - 0.5)
  }, [currentCard, cards])

  // Generate true/false question
  const trueFalseQuestion = useMemo(() => {
    if (!currentCard) return null

    const isCorrect = Math.random() > 0.5
    const statement = isCorrect ? currentCard.back : cards.find(c => c.id !== currentCard.id)?.back || "Wrong answer"

    return {
      statement,
      isCorrect,
      correctAnswer: currentCard.back
    }
  }, [currentCard, cards])

  const progress = useMemo(() => {
    return cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0
  }, [currentIndex, cards.length])

  const correctCount = useMemo(() => {
    return results.filter(Boolean).length
  }, [results])

  const handleAnswer = useCallback((answer: string) => {
    if (!currentCard || showResult) return

    let isCorrect = false

    if (questionType === 'multiple-choice') {
      isCorrect = answer === currentCard.back
    } else if (questionType === 'true-false') {
      isCorrect = (answer === 'true') === trueFalseQuestion?.isCorrect
    } else if (questionType === 'fill-blank') {
      isCorrect = answer.trim().toLowerCase() === currentCard.back.trim().toLowerCase()
    }

    const newResults = [...results, isCorrect]
    setResults(newResults)
    setShowResult(true)

    // Auto-advance after showing result
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowResult(false)
        // Randomize question type for next question
        const types: QuestionType[] = ['multiple-choice', 'true-false', 'fill-blank']
        setQuestionType(types[Math.floor(Math.random() * types.length)])
      } else {
        setIsComplete(true)
        onComplete?.({
          correct: newResults.filter(Boolean).length,
          total: cards.length
        })
      }
    }, 2000)
  }, [currentCard, showResult, results, currentIndex, cards.length, onComplete, questionType, trueFalseQuestion])

  const restart = useCallback(() => {
    setCurrentIndex(0)
    setShowResult(false)
    setResults([])
    setIsComplete(false)
    setQuestionType('multiple-choice')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResult) return

      if (questionType === 'multiple-choice' && options.length > 0) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= options.length) {
          e.preventDefault()
          handleAnswer(options[num - 1])
        }
      } else if (questionType === 'true-false') {
        if (e.key.toLowerCase() === 't') {
          e.preventDefault()
          handleAnswer('true')
        } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault()
          handleAnswer('false')
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleAnswer, showResult, questionType, options])

  if (isComplete) {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-3xl font-bold text-blue-600">
          📝 {t('study.testCompleted')}
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
            {t('study.takeAgain')}
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

      {/* Question */}
      <div className="bg-card border rounded-xl p-8 space-y-6">
        <div className="text-center">
          <div className="text-lg text-muted-foreground mb-4">
            {questionType === 'multiple-choice' && t('study.multipleChoice')}
            {questionType === 'true-false' && t('study.trueFalse')}
            {questionType === 'fill-blank' && t('study.fillBlank')}
          </div>

          <div className="text-2xl font-semibold mb-6">{currentCard.front}</div>

          {!showResult ? (
            <div className="space-y-4">
              {questionType === 'multiple-choice' && (
                <div className="grid gap-3">
                  {options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left p-4 h-auto"
                      onClick={() => handleAnswer(option)}
                    >
                      <span className="mr-3 rounded-full border px-2 py-0.5 text-xs">
                        {index + 1}
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {questionType === 'true-false' && (
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAnswer('true')}
                    className="px-8"
                  >
                    ✅ {t('study.true')}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAnswer('false')}
                    className="px-8"
                  >
                    ❌ {t('study.false')}
                  </Button>
                </div>
              )}

              {questionType === 'fill-blank' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t('study.typeAnswer')}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement
                        handleAnswer(target.value)
                      }
                    }}
                    autoFocus
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {t('study.pressEnter')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                {results[currentIndex] ? (
                  <CheckCircle className="w-16 h-16 text-green-600" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-600" />
                )}
              </div>

              <div className="text-center">
                {results[currentIndex] ? (
                  <div className="text-green-600 font-medium text-lg">
                    {t('study.correct')}
                  </div>
                ) : (
                  <div className="text-red-600 font-medium text-lg">
                    {t('study.incorrect')}
                  </div>
                )}
              </div>

              {!results[currentIndex] && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    {t('study.correctAnswer')}:
                  </div>
                  <div className="font-medium">{currentCard.back}</div>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    if (currentIndex < cards.length - 1) {
                      setCurrentIndex(currentIndex + 1)
                      setShowResult(false)
                    } else {
                      setIsComplete(true)
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {currentIndex < cards.length - 1 ? t('study.nextQuestion') : t('study.finish')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        {questionType === 'multiple-choice' && t('study.multipleChoiceInstructions')}
        {questionType === 'true-false' && t('study.trueFalseInstructions')}
        {questionType === 'fill-blank' && t('study.fillBlankInstructions')}
      </div>
    </div>
  )
}
