import { useEffect, useMemo, useState, useCallback, Suspense, lazy } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/shared/store'
import { fetchCards } from '@/shared/store/cardsSlice'
import { fetchLibraryById } from '@/shared/store/librariesSlice'
import type { CardsSliceState, Status } from '@/shared/store/cardsSlice'
import { getRecentLibraryIds, addRecentLibrary } from '@/shared/lib/recent'
import { useSearch } from '@/shared/hooks'
import { useTranslation } from 'react-i18next'
const QuizAnswers = lazy(() => import('@/features/study/components/QuizAnswers'))
import {
  Button,
  Input,
  P,
  Small,
  Large,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  Container,
} from '@/shared/ui'
const FlipDeck = lazy(() => import('@/features/study/components/FlipDeck'))
import { Loader2, RefreshCw, Search } from 'lucide-react'

/**
 * StudyPage – merged Study + Quiz in one page (no route change)
 * - Shared library & cards fetching
 * - Tab-like switch between "study" and "quiz"
 * - Keeps localStorage keys from original pages
 */

type Mode = 'mcq' | 'fill' | 'both'

type ViewTab = 'study' | 'quiz'

export default function StudyPageMerged() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((s: RootState) => s.auth)
  const { t } = useTranslation()

  const order = useSelector((s: RootState) => s.libraries.order)
  // libs list intentionally not shown in UI (library selection moved out of study/quiz pages)

  // Only fetch libraries when user explicitly needs them (not automatically)
  // useEffect(() => {
  //   if (user?.uid && order.length === 0) dispatch(fetchLibraries(user.uid))
  // }, [dispatch, user?.uid, order.length])

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
  const cardsError = useSelector((s: RootState) => {
    if (!libId) return null as string | null
    return (s.cards as CardsSliceState).byLibError?.[libId] ?? null
  }) as string | null

  useEffect(() => {
    if (libId && (cardsStatus === 'idle' || cardsStatus === 'error')) dispatch(fetchCards(libId))
  }, [dispatch, libId, cardsStatus])

  const cards = useMemo(() => selectedCards ?? [], [selectedCards])

  // ===== Page tab (read from localStorage; navigation happens from library page)
  const tab = (localStorage.getItem('study.tab') as ViewTab) || 'study'

  // ===== Study section state =====
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [shuffleOn, setShuffleOn] = useState(false)

  const { query, setQuery, filtered: searchFiltered } = useSearch(cards, {
    searchFields: ['front', 'back', 'description']
  })

  const filtered = useMemo(() => {
    const base = searchFiltered
    if (!shuffleOn) return base
    const copy = base.slice()
    const seed = shuffleSeed // reserved if you want seed-based shuffle later
    copy.sort(() => Math.random() - 0.5 + (seed % 2 === 0 ? 0 : 0))
    return copy
  }, [searchFiltered, shuffleOn, shuffleSeed])

  // ===== Quiz section state =====
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('quiz.mode') as Mode) || 'mcq')
  useEffect(() => { localStorage.setItem('quiz.mode', mode) }, [mode])

  const [count, setCount] = useState<number>(() => {
    const v = parseInt(localStorage.getItem('quiz.count') || '')
    return Number.isFinite(v) && v > 0 ? v : 10
  })
  useEffect(() => { localStorage.setItem('quiz.count', String(count)) }, [count])

  const [started, setStarted] = useState(false)
  const [quizCards, setQuizCards] = useState<typeof cards>([])
  const [mcqResult, setMcqResult] = useState<boolean | null>(null)
  const [input, setInput] = useState('')
  const [fillResult, setFillResult] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const activeList = started ? quizCards : cards
  const card = activeList[i]

  const [cardMode, setCardMode] = useState<'mcq' | 'fill'>(() => (mode === 'both' ? 'mcq' : mode))
  useEffect(() => {
    if (!card) return
    if (mode === 'both') setCardMode(Math.random() < 0.5 ? 'mcq' : 'fill')
    else setCardMode(mode)
  }, [mode, card])

  // reset quiz when change library
  useEffect(() => {
    setStarted(false); setQuizCards([]); setI(0); setShow(false); setFinished(false);
    setCorrectCount(0); setMcqResult(null); setFillResult(null); setInput('')
  }, [libId])

  // ===== Helpers =====
  const shuffleInPlace = <T,>(arr: T[]): T[] => {
    for (let j = arr.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1))
      ;[arr[j], arr[k]] = [arr[k], arr[j]]
    }
    return arr
  }

  const startQuiz = useCallback(() => {
    const all = shuffleInPlace([...cards])
    const take = Math.min(count, all.length)
    setQuizCards(all.slice(0, take))
    setI(0); setShow(false); setMcqResult(null); setFillResult(null); setInput('')
    setCorrectCount(0); setFinished(false); setStarted(true)
  }, [cards, count])

  const retakeQuiz = useCallback(() => {
    const all = shuffleInPlace([...cards])
    const take = Math.min(count, all.length)
    setQuizCards(all.slice(0, take))
    setI(0); setShow(false); setMcqResult(null); setFillResult(null); setInput('')
    setCorrectCount(0); setFinished(false); setStarted(true)
  }, [cards, count])

  const goNext = useCallback(() => {
    setShow(false); setMcqResult(null); setFillResult(null); setInput('')
    setI(prev => {
      if (prev < (quizCards.length - 1)) return prev + 1
      setStarted(false); setFinished(true)
      return prev
    })
  }, [quizCards.length])

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

  // Keyboard shortcuts for quiz
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tab !== 'quiz' || !started || !card) return
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
  }, [tab, started, card, cardMode, choices, mcqResult, fillResult, input, goNext])

  // ===== Guards =====
  if (!user) return <Container><P>{t('common.loginRequired')}</P></Container>
  if (order.length === 0) return <Container><P>{t('common.noLibraries')}</P></Container>

  return (
    <Container className="space-y-4">
      {/* Compact popover trigger for options (tab, search, mode, shuffle, quiz settings) */}
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">{t('common.options')}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-3">
              {/* tabs removed from popover: switch pages from library detail only */}

              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('study.searchPlaceholder')}
                  className="pl-8 w-[18rem]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Small>{t('study.mode')}</Small>
                <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as Mode)} className="ml-2">
                  <ToggleGroupItem value="mcq">MCQ</ToggleGroupItem>
                  <ToggleGroupItem value="fill">Fill</ToggleGroupItem>
                  <ToggleGroupItem value="both">Both</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex items-center gap-2">
                <Small>{t('study.questionCount')}</Small>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-28"
                />
                <Small className="text-muted-foreground">{t('study.cardsAvailable', { count: cards.length })}</Small>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Small>{t('study.shuffle')}</Small>
                  <Switch checked={shuffleOn} onCheckedChange={() => { setShuffleOn(s => !s); setShuffleSeed(x => x + 1) }} />
                </div>
                <Button variant="outline" onClick={() => libId && dispatch(fetchCards(libId))}><RefreshCw className="mr-2 h-4 w-4" />{t('study.reload')}</Button>
                <Button onClick={startQuiz} disabled={cards.length === 0}>{t('study.start')}</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Loading & error states (shared) */}
      {cardsStatus === 'loading' && (
        <div className="rounded-2xl border p-6 text-center text-muted-foreground bg-card">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
          {t('study.loadingCards')}
        </div>
      )}

      {cardsStatus === 'error' && (
        <div className="rounded-2xl border p-6 text-center bg-card">
          <P className="text-destructive-foreground">{cardsError ?? t('study.failedToLoadCards')}</P>
          <div className="mt-3">
            <Button onClick={() => libId && dispatch(fetchCards(libId))}>{t('study.tryAgain')}</Button>
          </div>
        </div>
      )}

      {/* STUDY content */}
      {tab === 'study' && cardsStatus === 'ready' && (
        filtered.length > 0 ? (
          <div className="rounded-2xl border p-4 bg-card">
            <div className="mb-3 flex items-center justify-between">
              <Small className="text-muted-foreground">{t('study.cardsCount', { count: filtered.length })}</Small>
            </div>
            <Suspense fallback={<Loader2 className="animate-spin" />}>
              <FlipDeck cards={filtered} />
            </Suspense>
          </div>
        ) : (
          <div className="rounded-2xl border p-10 text-center bg-card">
            <P>{t('study.noMatchingCards')}</P>
          </div>
        )
      )}

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
                {cardMode === 'mcq' ? (
                  <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {choices.map((c, idx) => {
                      const isCorrect = c.trim() === card.back.trim()
                      const locked = mcqResult !== null
                      const visual = locked
                        ? (isCorrect ? 'bg-card/50 border-success' : 'bg-card/50 border-destructive')
                        : 'bg-card'
                      const textVisual = locked
                        ? (isCorrect ? 'text-success-foreground' : 'text-destructive-foreground')
                        : ''
                      return (
                        <Button
                          key={idx}
                          className={`w-full justify-start text-left border text-foreground ${visual} ${textVisual} transition-all`}
                          disabled={locked}
                          aria-pressed={locked && isCorrect}
                          onClick={() => {
                            if (mcqResult !== null) return
                            const ok = isCorrect
                            setMcqResult(ok)
                            if (ok) setCorrectCount(n => n + 1)
                          }}
                        >
                          <span className="mr-2 rounded-md border px-2 py-0.5 text-xs tabular-nums bg-card/90 dark:bg-background">{idx + 1}</span>
                          {c}
                        </Button>
                      )
                    })}
                    {mcqResult !== null && (
                      <Small className={mcqResult ? 'text-success-foreground' : 'text-destructive-foreground'}>
                        {mcqResult ? t('study.correctAnswer') : t('study.wrongAnswer', { answer: card.back })}
                      </Small>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <input
                      value={input}
                      onChange={(e) => setInput((e.target as HTMLInputElement).value)}
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-4 focus:ring-primary/20"
                      placeholder={t('study.answerPlaceholder')}
                      aria-label={t('study.answerAriaLabel')}
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => {
                          if (fillResult !== null) return
                          const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
                          const ok = norm(input) === norm(card.back)
                          setFillResult(ok)
                          if (ok) setCorrectCount(n => n + 1)
                          setShow(true)
                        }}
                      >
                        {t('study.checkAnswer')} (Enter)
                      </Button>
                    </div>
                    {fillResult !== null && (
                      <Small className={fillResult ? 'text-success-foreground' : 'text-destructive-foreground'}>
                        {fillResult ? t('study.correct') : t('study.incorrect')}
                      </Small>
                    )}
                    {(show) && (
                      <div className="mt-1">
                        <Small className="text-muted-foreground">
                          {card.description ?? maskAnswer(card.back)}
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
                <Button variant="secondary" onClick={() => { setFinished(false); setQuizCards([]); setI(0); setCorrectCount(0) }}>{t('study.backToStudy')}</Button>
              </div>
            </div>
          ) : null}
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
