import { useCallback, useEffect, useMemo, useState } from "react"
import type { Flashcard } from "@/shared/lib/types"
import { Button } from "@/shared/ui"
import { useTranslation } from "react-i18next"
import { RotateCcw, CheckCircle } from "lucide-react"

type Props = {
  cards: Flashcard[]
  onComplete?: (results: { correct: number; total: number }) => void
}

type MatchItem = {
  id: string
  text: string
  type: 'front' | 'back'
  matched: boolean
  selected: boolean
}

export default function MatchMode({ cards, onComplete }: Props) {
  const { t } = useTranslation()
  const [items, setItems] = useState<MatchItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [isComplete, setIsComplete] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // Initialize match items
  useEffect(() => {
    const matchItems: MatchItem[] = []
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5)

    shuffledCards.forEach((card) => {
      matchItems.push({
        id: `front-${card.id}`,
        text: card.front,
        type: 'front',
        matched: false,
        selected: false
      })
      matchItems.push({
        id: `back-${card.id}`,
        text: card.back,
        type: 'back',
        matched: false,
        selected: false
      })
    })

    // Shuffle the items
    for (let i = matchItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[matchItems[i], matchItems[j]] = [matchItems[j], matchItems[i]]
    }

    setItems(matchItems)
    setSelectedItems([])
    setMatchedPairs(new Set())
    setIsComplete(false)
    setAttempts(0)
  }, [cards])

  const handleItemClick = useCallback((itemId: string) => {
    if (selectedItems.length >= 2) return

    const item = items.find(i => i.id === itemId)
    if (!item || item.matched) return

    const newSelected = [...selectedItems, itemId]
    setSelectedItems(newSelected)

    // Update visual selection
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, selected: true } : i
    ))

    // Check for match when 2 items selected
    if (newSelected.length === 2) {
      setAttempts(prev => prev + 1)

      const [firstId, secondId] = newSelected
      const firstItem = items.find(i => i.id === firstId)
      const secondItem = items.find(i => i.id === secondId)

      if (firstItem && secondItem) {
        const firstCardId = firstId.split('-')[1]
        const secondCardId = secondId.split('-')[1]

        const isMatch = firstCardId === secondCardId && firstItem.type !== secondItem.type

        setTimeout(() => {
          if (isMatch) {
            // Correct match
            setMatchedPairs(prev => new Set([...prev, firstCardId]))
            setItems(prev => prev.map(i =>
              newSelected.includes(i.id)
                ? { ...i, matched: true, selected: false }
                : i
            ))

            // Check if all pairs are matched
            const totalPairs = cards.length
            if (matchedPairs.size + 1 >= totalPairs) {
              setIsComplete(true)
              onComplete?.({
                correct: matchedPairs.size + 1,
                total: totalPairs
              })
            }
          } else {
            // Wrong match - deselect
            setItems(prev => prev.map(i =>
              newSelected.includes(i.id)
                ? { ...i, selected: false }
                : i
            ))
          }

          setSelectedItems([])
        }, 1000)
      }
    }
  }, [selectedItems, items, matchedPairs, cards.length, onComplete])

  const restart = useCallback(() => {
    const matchItems: MatchItem[] = []
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5)

    shuffledCards.forEach((card) => {
      matchItems.push({
        id: `front-${card.id}`,
        text: card.front,
        type: 'front',
        matched: false,
        selected: false
      })
      matchItems.push({
        id: `back-${card.id}`,
        text: card.back,
        type: 'back',
        matched: false,
        selected: false
      })
    })

    // Shuffle the items
    for (let i = matchItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[matchItems[i], matchItems[j]] = [matchItems[j], matchItems[i]]
    }

    setItems(matchItems)
    setSelectedItems([])
    setMatchedPairs(new Set())
    setIsComplete(false)
    setAttempts(0)
  }, [cards])

  const progress = useMemo(() => {
    return cards.length > 0 ? (matchedPairs.size / cards.length) * 100 : 0
  }, [matchedPairs.size, cards.length])

  if (isComplete) {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-3xl font-bold text-purple-600">
          🎯 {t('study.matchCompleted')}
        </div>
        <div className="space-y-2">
          <div className="text-xl">{t('study.allPairsMatched')}</div>
          <div className="text-muted-foreground">
            {t('study.attempts')}: {attempts}
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={restart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('study.playAgain')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t('study.matchedPairs')}: {matchedPairs.size}/{cards.length}</span>
          <span>{t('study.attempts')}: {attempts}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Match Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            disabled={item.matched || selectedItems.length >= 2}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${item.matched
                ? 'bg-green-100 border-green-300 text-green-800'
                : item.selected
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-card border-border hover:border-primary hover:bg-muted'
              }
              ${item.matched || selectedItems.length >= 2 ? 'cursor-not-allowed' : 'cursor-pointer'}
              disabled:opacity-50
            `}
          >
            <div className="flex items-start gap-2">
              {item.matched && (
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-sm leading-relaxed break-words">
                {item.text}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        {t('study.matchInstructions')}
      </div>

      {/* Selected items indicator */}
      {selectedItems.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {t('study.selectedItems')}: {selectedItems.length}/2
        </div>
      )}
    </div>
  )
}
