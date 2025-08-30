import { useEffect, useMemo, useState, useCallback, Suspense, lazy } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/shared/store'
import { fetchCards } from '@/shared/store/cardsSlice'
import { fetchLibraryById } from '@/shared/store/librariesSlice'
import type { CardsSliceState, Status } from '@/shared/store/cardsSlice'
import { getRecentLibraryIds, addRecentLibrary } from '@/shared/lib/recent'
import { useTranslation } from 'react-i18next'
const QuizAnswers = lazy(() => import('@/features/study/components/QuizAnswers'))
import {
  Button,
  P,
  Small,
  Large,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Container,
  Badge,
} from '@/shared/ui'
import { Loader2 } from 'lucide-react'

/**
 * QuizPage – Quiz with different question types
 * - Library & cards fetching
 * - Question types: write (fill-in-the-blank) and test (multiple choice)
 * - Keeps localStorage keys from original pages
 */

type QuestionType = 'write' | 'test'

type ViewTab = 'quiz' | 'study'

export default function QuizPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((s: RootState) => s.auth)
  const { t } = useTranslation()

  const order = useSelector((s: RootState) => s.libraries.order)
  // libs list intentionally not shown in UI (library selection moved out of study/quiz pages)

  // ===== Shared: library selection =====
  // prefer recent libraries (IndexedDB) -> Redux order[0]
  const [libId, setLibId] = useState<string | undefined>(() => undefined)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!libId) {
        // try recent entries first
        try {
          const ids = await getRecentLibraryIds(3)
          if (!mounted) return
          if (ids && ids.length > 0) {
            // prefer the first recent that exists in current order, otherwise take the newest recent
            const candidate = ids.find((id) => order.includes(id)) ?? ids[0]
            if (candidate) {
              setLibId(candidate)
              // ensure library is loaded into redux if not present
              if (!order.includes(candidate)) dispatch(fetchLibraryById(candidate))
              return
            }
          }
        } catch {
          // ignore errors reading IndexedDB
        }

  // fallback to redux order
  if (!mounted) return
  if (order.length > 0) setLibId(order[0])
      } else {
        // selected lib might have been removed; fallback to first available
        if (libId && !order.includes(libId) && order.length > 0) setLibId(order[0])
      }
    })()
    return () => { mounted = false }
  }, [libId, order, dispatch])
  // Persist chosen library to recent list in IndexedDB
  useEffect(() => {
    if (!libId) return
    void addRecentLibrary(libId)
  }, [libId])

  // ===== Cards data =====
  const selectedCards = useSelector((s: RootState) => (libId ? s.cards.byLib?.[libId] : undefined))
  const cardsStatus = useSelector((s: RootState) => {
    if (!libId) return 'idle' as Status
    const st = (s.cards as CardsSliceState).byLibStatus?.[libId]
    return st ?? (selectedCards ? 'ready' : 'idle')
  }) as Status

  useEffect(() => {
    if (libId && (cardsStatus === 'idle' || cardsStatus === 'error')) dispatch(fetchCards(libId))
  }, [dispatch, libId, cardsStatus])

  const cards = useMemo(() => selectedCards ?? [], [selectedCards])

  // ===== Page tab (read from localStorage; navigation happens from library page)
  const [tab, setTab] = useState<ViewTab>((localStorage.getItem('study.tab') as ViewTab) || 'quiz')

  // ===== Quiz section state =====
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>(() => {
    const saved = localStorage.getItem('quiz.selectedQuestionTypes')
    return saved ? JSON.parse(saved) : ['write']
  })
  useEffect(() => {
    localStorage.setItem('quiz.selectedQuestionTypes', JSON.stringify(selectedQuestionTypes))
  }, [selectedQuestionTypes])

  // Current question type for this card (randomly selected from selected types)
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>(() => {
    const saved = localStorage.getItem('quiz.selectedQuestionTypes')
    const types = saved ? JSON.parse(saved) : ['write']
    return types.length > 0 ? types[0] : 'write'
  })

  const [count] = useState<number>(() => {
    const v = parseInt(localStorage.getItem('quiz.count') || '')
    return Number.isFinite(v) && v > 0 ? v : 10
  })
  useEffect(() => { localStorage.setItem('quiz.count', String(count)) }, [count])

  const [started, setStarted] = useState(false)
  const [quizCards, setQuizCards] = useState<typeof cards>([])
  const [mcqResult, setMcqResult] = useState<boolean | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [fillResult, setFillResult] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  // ===== Study mode state =====
  const [studyBatchSize] = useState(8)
  const [studyWrongCards, setStudyWrongCards] = useState<typeof cards>([])
  const [studyCurrentBatch, setStudyCurrentBatch] = useState<typeof cards>([])
  const [studyBatchIndex, setStudyBatchIndex] = useState(0)
  const [studyFinished, setStudyFinished] = useState(false)
  const [studyStarted, setStudyStarted] = useState(false)

  const activeList = started ? quizCards : studyStarted ? studyCurrentBatch : cards
  const card = activeList[i]

  const [cardMode, setCardMode] = useState<'mcq' | 'fill'>(() => {
    if (currentQuestionType === 'write') return 'fill'
    if (currentQuestionType === 'test') return 'mcq'
    return 'fill'
  })
  useEffect(() => {
    if (!card) return
    if (currentQuestionType === 'write') setCardMode('fill')
    else if (currentQuestionType === 'test') setCardMode('mcq')
  }, [currentQuestionType, card])

  // Function to randomly select a question type from selected types
  const selectRandomQuestionType = useCallback((): QuestionType => {
    if (selectedQuestionTypes.length === 0) return 'write'
    if (selectedQuestionTypes.length === 1) return selectedQuestionTypes[0]
    const randomIndex = Math.floor(Math.random() * selectedQuestionTypes.length)
    return selectedQuestionTypes[randomIndex]
  }, [selectedQuestionTypes])

  // Update current question type when card changes
  useEffect(() => {
    if (!card) return
    const newType = selectRandomQuestionType()
    setCurrentQuestionType(newType)
  }, [card, selectRandomQuestionType])

  // Update current question type when selected types change
  useEffect(() => {
    if (selectedQuestionTypes.length === 1) {
      setCurrentQuestionType(selectedQuestionTypes[0])
    } else if (selectedQuestionTypes.length > 1 && !selectedQuestionTypes.includes(currentQuestionType)) {
      // If current type is not in selected types anymore, pick a new one
      setCurrentQuestionType(selectedQuestionTypes[0])
    }
  }, [selectedQuestionTypes, currentQuestionType])

  // ===== Helpers =====
  const shuffleInPlace = <T,>(arr: T[]): T[] => {
    for (let j = arr.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1))
      ;[arr[j], arr[k]] = [arr[k], arr[j]]
    }
    return arr
  }

  const retakeQuiz = useCallback(() => {
    const all = shuffleInPlace([...cards])
    const take = Math.min(count, all.length)
    setQuizCards(all.slice(0, take))
    setI(0); setShow(false); setMcqResult(null); setFillResult(null); setInput('')
    setCorrectCount(0); setFinished(false); setStarted(true)
  }, [cards, count])

  const startStudy = useCallback(() => {
    const all = shuffleInPlace([...cards])
    const initialBatch = all.slice(0, studyBatchSize)
    setStudyCurrentBatch(initialBatch)
    setStudyWrongCards([])
    setStudyBatchIndex(0)
    setStudyFinished(false)
    setStudyStarted(true)
    setI(0); setShow(false); setMcqResult(null); setFillResult(null); setInput('')
    setCorrectCount(0)
  }, [cards, studyBatchSize])

  const goNext = useCallback(() => {
    setShow(false); setMcqResult(null); setFillResult(null); setInput('')
    if (tab === 'study') {
      const isCorrect = (cardMode === 'mcq' ? mcqResult : fillResult) === true
      if (!isCorrect) {
        setStudyWrongCards(prev => [...prev, card])
      }
      setI(prev => {
        if (prev < (studyCurrentBatch.length - 1)) return prev + 1
        // Kết thúc batch
        const newBatch = [...studyWrongCards]
        const remainingCards = cards.filter(c => !studyCurrentBatch.includes(c) && !studyWrongCards.includes(c))
        const newCardsCount = Math.min(4, remainingCards.length)
        const newCards = shuffleInPlace(remainingCards).slice(0, newCardsCount)
        newBatch.push(...newCards)
        if (newBatch.length === 0) {
          setStudyFinished(true)
          setStudyStarted(false)
          return prev
        }
        setStudyCurrentBatch(shuffleInPlace(newBatch))
        setStudyWrongCards([])
        setStudyBatchIndex(prevBatch => prevBatch + 1)
        return 0
      })
    } else {
      setI(prev => {
        if (prev < (quizCards.length - 1)) return prev + 1
        setStarted(false); setFinished(true)
        return prev
      })
    }
  }, [tab, cardMode, mcqResult, fillResult, card, studyCurrentBatch, studyWrongCards, cards, quizCards.length])

  const maskAnswer = (s: string) => {
    return s.split(/(\s+)/).map(part => {
      if (/^\s+$/.test(part)) return part
      if (part.length <= 2) return part[0] + '•'.repeat(Math.max(0, part.length - 1))
      return part[0] + '•'.repeat(part.length - 2) + part[part.length - 1]
    }).join('')
  }

  // MCQ choices
  const choices = useMemo(() => {
    if (!card) return [] as string[]
    const others = cards.filter(c => c.id !== card.id).map(c => c.back)
    const uniq = Array.from(new Set(others))
    const picks: string[] = []
    while (picks.length < 3 && uniq.length > 0) {
      const idx = Math.floor(Math.random() * uniq.length)
      picks.push(uniq.splice(idx, 1)[0])
    }
    const all = shuffleInPlace([card.back, ...picks])
    return all
  }, [card, cards])

  // Keyboard shortcuts for quiz and study
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((tab !== 'quiz' && tab !== 'study') || !started && !studyStarted || !card) return
      if (cardMode === 'mcq') {
        if (e.key >= '1' && e.key <= '9') {
          const idx = Number(e.key) - 1
          if (idx < choices.length && mcqResult === null) {
            const c = choices[idx]
            const ok = c.trim() === card.back.trim()
            setMcqResult(ok)
            if (ok) setCorrectCount(n => n + 1)
          }
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          if (mcqResult !== null) goNext()
        }
      } else {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          if (fillResult === null) {
            const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
            const ok = norm(input) === norm(card.back)
            setFillResult(ok)
            if (ok) setCorrectCount(n => n + 1)
            setShow(true)
          }
        } else if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault()
          if (fillResult !== null) goNext()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tab, started, studyStarted, card, cardMode, choices, mcqResult, fillResult, input, goNext])

  // ===== Guards =====
  if (!user) return <Container><P>{t('common.loginRequired')}</P></Container>
  if (order.length === 0) return <Container><P>{t('common.noLibraries')}</P></Container>

  return (
    <Container className="space-y-4">
      {/* Compact popover trigger for options (search, question type, quiz settings) */}
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">{t('common.options')}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div>
                  <Small>{t('study.questionType')}</Small>
                  <p className="text-xs text-muted-foreground mt-1">{t('study.selectQuestionType')}</p>
                  {selectedQuestionTypes.length > 1 && (
                    <p className="text-xs text-primary mt-1">
                      {t('study.mixedMode')}: {selectedQuestionTypes.map(type => 
                        type === 'write' ? t('study.write') : t('study.test')
                      ).join(', ')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'write', label: '✍️ ' + t('study.write') },
                    { value: 'test', label: '📝 ' + t('study.test') },
                  ].map((type) => (
                    <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuestionTypes.includes(type.value as QuestionType)}
                        onChange={(e) => {
                          const isChecked = e.target.checked
                          const questionType = type.value as QuestionType
                          if (isChecked) {
                            // Add to selected types
                            setSelectedQuestionTypes(prev => [...prev, questionType])
                          } else {
                            // Remove from selected types, but ensure at least one is selected
                            setSelectedQuestionTypes(prev => {
                              const newTypes = prev.filter(t => t !== questionType)
                              return newTypes.length > 0 ? newTypes : [questionType] // Keep at least one
                            })
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Small>{t('study.mode')}</Small>
                <div className="flex gap-2">
                  <Button variant={tab === 'quiz' ? 'default' : 'outline'} size="sm" onClick={() => { setTab('quiz'); localStorage.setItem('study.tab', 'quiz') }}>Quiz</Button>
                  <Button variant={tab === 'study' ? 'default' : 'outline'} size="sm" onClick={() => { setTab('study'); localStorage.setItem('study.tab', 'study') }}>Study</Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* QUIZ content */}
      {tab === 'quiz' && (
        <div className="space-y-4">
          {started && (
            <div className="rounded-xl border p-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">{t('study.progress')}</span>
                <div className="relative h-2 flex-1 rounded-full bg-muted/20 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary transition-all"
                    style={{ width: `${Math.round(((i) / Math.max(1, quizCards.length)) * 100)}%` }}
                    aria-hidden
                  />
                </div>
                <span className="tabular-nums">{i + 1}/{quizCards.length}</span>
                <span className="ml-3 text-muted-foreground">{t('study.correct')}: {correctCount}</span>
              </div>
            </div>
          )}

          <div className="rounded-2xl border p-6 text-center min-h-[260px] flex flex-col justify-center bg-card">
            {!card ? (
              <P>{t('study.libraryHasNoCards')}</P>
            ) : (
              <>
                <Large className="leading-relaxed">{card.front}</Large>
                {started && selectedQuestionTypes.length > 1 && (
                  <div className="text-sm text-muted-foreground mb-2">
                    {currentQuestionType === 'write' ? '✍️ ' + t('study.write') : '📝 ' + t('study.test')}
                  </div>
                )}
                {cardMode === 'mcq' ? (
                  <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {choices.map((c, idx) => {
                      const isCorrect = c.trim() === card.back.trim()
                      const isSelected = c.trim() === selectedChoice?.trim()
                      const locked = mcqResult !== null
                      const visual = locked
                        ? (isCorrect
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-500 shadow-md'
                            : (isSelected ? 'bg-red-100 dark:bg-red-900/30 border-red-500' : 'bg-card/50 border-muted'))
                        : 'bg-card'
                      const textVisual = locked
                        ? (isCorrect ? 'text-green-800 dark:text-green-200' : (isSelected ? 'text-red-800 dark:text-red-200' : 'text-muted-foreground'))
                        : ''
                      return (
                        <Button
                          key={idx}
                          className={`w-full justify-start text-left border text-foreground ${visual} ${textVisual} transition-all`}
                          disabled={locked}
                          aria-pressed={locked && isCorrect}
                          onClick={() => {
                            if (mcqResult !== null) return
                            setSelectedChoice(c)
                            const ok = isCorrect
                            setMcqResult(ok)
                            if (ok) setCorrectCount(n => n + 1)
                          }}
                        >
                          <span className={`mr-2 rounded-md border px-2 py-0.5 text-xs tabular-nums ${locked ? (isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300' : (isSelected ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300')) : 'bg-card/90 dark:bg-background'}`}>{idx + 1}</span>
                          {c}
                        </Button>
                      )
                    })}
                    {mcqResult !== null && (
                      <Badge variant={mcqResult ? "default" : "destructive"} className="mt-2">
                        {mcqResult ? t('study.correctAnswer') : t('study.wrongAnswer', { answer: card.back })}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <input
                      value={input}
                      onChange={(e) => setInput((e.target as HTMLInputElement).value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && fillResult !== true) {
                          const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
                          const ok = norm(input) === norm(card.back)
                          setFillResult(ok)
                          if (ok) {
                            setCorrectCount(n => n + 1)
                            setTimeout(() => goNext(), 1500)
                          } else {
                            setShow(true)
                          }
                        }
                      }}
                      disabled={fillResult === true}
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-4 focus:ring-primary/20"
                      placeholder={t('study.answerPlaceholder')}
                      aria-label={t('study.answerAriaLabel')}
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        disabled={fillResult === true}
                        onClick={() => {
                          const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
                          const ok = norm(input) === norm(card.back)
                          setFillResult(ok)
                          if (ok) {
                            setCorrectCount(n => n + 1)
                            setTimeout(() => goNext(), 1500)
                          } else {
                            setShow(true)
                          }
                        }}
                      >
                        {t('study.checkAnswer')} (Enter)
                      </Button>
                    </div>
                    {fillResult !== null && (
                      <Small className={fillResult ? 'text-success-foreground' : 'text-destructive-foreground'}>
                        {fillResult ? t('study.correctAnswer') : t('study.wrongAnswer', { answer: card.back })}
                      </Small>
                    )}
                    {(show) && (
                      <div className="mt-1">
                        <Small className="text-muted-foreground">
                          {fillResult === false ? card.back : (card.description ?? maskAnswer(card.back))}
                        </Small>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {started ? (
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  if (cardMode === 'mcq' && mcqResult === null) return
                  if (cardMode === 'fill' && fillResult === null) return
                  goNext()
                }}
              >
                {t('study.next')} {cardMode === 'fill' ? '(Shift+Enter)' : '(Enter)'}
              </Button>
              {cardMode === 'fill' && (
                <Button variant="secondary" onClick={() => setShow(s => !s)}>
                  {show ? t('study.hideHint') : t('study.showHint')}
                </Button>
              )}
            </div>
          ) : finished ? (
            <div className="rounded-2xl border p-6 space-y-4 bg-card">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">{t('study.quizCompleted')}</div>
                <FinalScore correctCount={correctCount} total={quizCards.length} />
              </div>

              <div className="text-left">
                <div className="text-sm text-muted-foreground mb-2">{t('study.answers')}:</div>
                <Suspense fallback={<Loader2 className="animate-spin" />}>
                  <QuizAnswers cards={quizCards} />
                </Suspense>
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={retakeQuiz}>{t('study.retakeQuiz')}</Button>
                <Button variant="secondary" onClick={() => { setFinished(false); setQuizCards([]); setI(0); setCorrectCount(0) }}>{t('study.backToQuiz')}</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              <Button onClick={retakeQuiz}>{t('study.startQuiz')}</Button>
            </div>
          )}
        </div>
      )}

      {/* STUDY content */}
      {tab === 'study' && (
        <div className="space-y-4">
          {studyStarted && (
            <div className="rounded-xl border p-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">{t('study.progress')}</span>
                <div className="relative h-2 flex-1 rounded-full bg-muted/20 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary transition-all"
                    style={{ width: `${Math.round(((i) / Math.max(1, studyCurrentBatch.length)) * 100)}%` }}
                    aria-hidden
                  />
                </div>
                <span className="tabular-nums">{i + 1}/{studyCurrentBatch.length}</span>
                <span className="ml-3 text-muted-foreground">{t('study.correct')}: {correctCount}</span>
                <span className="ml-3 text-muted-foreground">{t('study.batch')}: {studyBatchIndex + 1}</span>
              </div>
            </div>
          )}

          <div className="rounded-2xl border p-6 text-center min-h-[260px] flex flex-col justify-center bg-card">
            {!card ? (
              <P>{t('study.libraryHasNoCards')}</P>
            ) : (
              <>
                <Large className="leading-relaxed">{card.front}</Large>
                {studyStarted && selectedQuestionTypes.length > 1 && (
                  <div className="text-sm text-muted-foreground mb-2">
                    {currentQuestionType === 'write' ? '✍️ ' + t('study.write') : '📝 ' + t('study.test')}
                  </div>
                )}
                {cardMode === 'mcq' ? (
                  <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {choices.map((c, idx) => {
                      const isCorrect = c.trim() === card.back.trim()
                      const isSelected = c.trim() === selectedChoice?.trim()
                      const locked = mcqResult !== null
                      const visual = locked
                        ? (isCorrect ? 'bg-green-50 dark:bg-green-950/20 border-green-500' : (isSelected ? 'bg-red-50 dark:bg-red-950/20 border-red-500' : 'bg-card/50 border-muted'))
                        : 'bg-card'
                      const textVisual = locked
                        ? (isCorrect ? 'text-green-700 dark:text-green-300' : (isSelected ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground'))
                        : ''
                      return (
                        <Button
                          key={idx}
                          className={`w-full justify-start text-left border text-foreground ${visual} ${textVisual} transition-all`}
                          disabled={locked}
                          aria-pressed={locked && isCorrect}
                          onClick={() => {
                            if (mcqResult !== null) return
                            setSelectedChoice(c)
                            const ok = isCorrect
                            setMcqResult(ok)
                            if (ok) setCorrectCount(n => n + 1)
                          }}
                        >
                          <span className={`mr-2 rounded-md border px-2 py-0.5 text-xs tabular-nums ${locked ? (isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-300') : 'bg-card/90 dark:bg-background'}`}>{idx + 1}</span>
                          {c}
                        </Button>
                      )
                    })}
                    {mcqResult !== null && (
                      <Badge variant={mcqResult ? "default" : "destructive"} className="mt-2">
                        {mcqResult ? t('study.correctAnswer') : t('study.wrongAnswer', { answer: card.back })}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <input
                      value={input}
                      onChange={(e) => setInput((e.target as HTMLInputElement).value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && fillResult !== true) {
                          const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
                          const ok = norm(input) === norm(card.back)
                          setFillResult(ok)
                          if (ok) {
                            setCorrectCount(n => n + 1)
                            setTimeout(() => goNext(), 1500)
                          } else {
                            setShow(true)
                          }
                        }
                      }}
                      disabled={fillResult === true}
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-4 focus:ring-primary/20"
                      placeholder={t('study.answerPlaceholder')}
                      aria-label={t('study.answerAriaLabel')}
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        disabled={fillResult === true}
                        onClick={() => {
                          const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
                          const ok = norm(input) === norm(card.back)
                          setFillResult(ok)
                          if (ok) {
                            setCorrectCount(n => n + 1)
                            setTimeout(() => goNext(), 1500)
                          } else {
                            setShow(true)
                          }
                        }}
                      >
                        {t('study.checkAnswer')} (Enter)
                      </Button>
                    </div>
                    {fillResult !== null && (
                      <Badge variant={fillResult ? "default" : "destructive"} className="mt-2">
                        {fillResult ? t('study.correct') : `Sai — đáp án đúng: ${card.back}`}
                      </Badge>
                    )}
                    {(show) && (
                      <div className="mt-1">
                        <Small className="text-muted-foreground">
                          {fillResult === false ? card.back : (card.description ?? maskAnswer(card.back))}
                        </Small>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {studyStarted ? (
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  if (cardMode === 'mcq' && mcqResult === null) return
                  if (cardMode === 'fill' && fillResult === null) return
                  goNext()
                }}
              >
                {t('study.next')} {cardMode === 'fill' ? '(Shift+Enter)' : '(Enter)'}
              </Button>
              {cardMode === 'fill' && (
                <Button variant="secondary" onClick={() => setShow(s => !s)}>
                  {show ? t('study.hideHint') : t('study.showHint')}
                </Button>
              )}
            </div>
          ) : studyFinished ? (
            <div className="rounded-2xl border p-6 space-y-4 bg-card">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">{t('study.studyCompleted')}</div>
                <FinalScore correctCount={correctCount} total={cards.length} />
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={startStudy}>{t('study.restartStudy')}</Button>
                <Button variant="secondary" onClick={() => { setStudyFinished(false); setStudyCurrentBatch([]); setI(0); setCorrectCount(0) }}>{t('study.backToStudy')}</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              <Button onClick={startStudy}>{t('study.startStudy')}</Button>
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

function FinalScore({ correctCount, total }: { correctCount: number; total: number }) {
  const { t } = useTranslation()
  const score10 = (() => {
    const t = total || 1
    const raw = (correctCount / t) * 10
    const rounded = Math.round(raw * 10) / 10
    return Number.isInteger(rounded) ? `${rounded.toFixed(0)}/10` : `${rounded.toFixed(1)}/10`
  })()
  return (
    <>
      <div className="text-lg">{t('study.yourScore')}: {score10}</div>
  <div className="flex items-center gap-3 justify-center text-sm text-muted-foreground">
        <span>{t('study.total')}: {total}</span>
        <span>{t('study.correct')}: {correctCount}</span>
        <span>{t('study.incorrect')}: {Math.max(0, total - correctCount)}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted/20 overflow-hidden">
        <div className="h-full bg-success transition-all" style={{ width: `${Math.round((correctCount / Math.max(1, total)) * 100)}%` }} />
      </div>
    </>
  )
}
