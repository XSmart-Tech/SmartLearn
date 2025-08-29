import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/shared/store'
import { fetchCards } from '@/shared/store/cardsSlice'
// import { fetchLibraries } from '@/shared/store/librariesSlice'
import { Button, P, Small, Large, Popover, PopoverTrigger, PopoverContent, Container } from '@/shared/ui'
import { getRecentLibraryIds, addRecentLibrary } from '@/shared/lib/recent'
import QuizAnswers from '@/features/study/components/QuizAnswers'
import { useTranslation } from 'react-i18next'

type Mode = 'mcq' | 'fill' | 'both'

export default function QuizPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((s: RootState) => s.auth)

  const order = useSelector((s: RootState) => s.libraries.order)

  // libraries are available via global store when needed; no select in popover

  // Only fetch libraries when user explicitly needs them (not automatically)
  // useEffect(() => {
  //   if (user?.uid && order.length === 0) dispatch(fetchLibraries(user.uid))
  // }, [dispatch, user?.uid, order.length])

  const [libId, setLibId] = useState<string | undefined>(() => undefined)
  useEffect(() => {
    let mounted = true
    void (async () => {
      if (!libId) {
        try {
          const ids = await getRecentLibraryIds(3)
          if (!mounted) return
          if (ids && ids.length > 0) {
            const candidate = ids.find((id) => order.includes(id)) ?? ids[0]
            if (candidate) {
              setLibId(candidate)
              return
            }
          }
        } catch {
          // ignore
        }

        if (!mounted) return
        if (order.length > 0) setLibId(order[0])
      } else {
        if (libId && !order.includes(libId) && order.length > 0) setLibId(order[0])
      }
    })()
    return () => { mounted = false }
  }, [order, libId])
  useEffect(() => { if (libId) { void addRecentLibrary(libId) } }, [libId])

  // cards cho thư viện chọn
  const selectedCards = useSelector((s: RootState) => (libId ? s.cards.byLib[libId] : undefined))
  const cards = useMemo(() => selectedCards ?? [], [selectedCards])

  useEffect(() => { if (libId) dispatch(fetchCards(libId)) }, [dispatch, libId])

  // ======= Quiz state =======
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const mode = (localStorage.getItem('quiz.mode') as Mode) || 'mcq'

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

  // ======= Helpers (copied from StudyPage logic) =======
  const shuffleInPlace = <T,>(arr: T[]): T[] => {
    for (let j = arr.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1))
      ;[arr[j], arr[k]] = [arr[k], arr[j]]
    }
    return arr
  }

  const startQuiz = () => {
    const all = shuffleInPlace([...cards])
    const take = Math.min(count, all.length)
    setQuizCards(all.slice(0, take))
    setI(0)
    setShow(false)
    setMcqResult(null)
    setFillResult(null)
    setInput('')
    setCorrectCount(0)
    setFinished(false)
    setStarted(true)
  }

  const retakeQuiz = () => {
    const all = shuffleInPlace([...cards])
    const take = Math.min(count, all.length)
    setQuizCards(all.slice(0, take))
    setI(0)
    setShow(false)
    setMcqResult(null)
    setFillResult(null)
    setInput('')
    setCorrectCount(0)
    setFinished(false)
    setStarted(true)
  }

  const goNext = () => {
    setShow(false); setMcqResult(null); setFillResult(null); setInput('')
    setI(prev => {
      if (prev < (quizCards.length - 1)) return prev + 1
      setStarted(false)
      setFinished(true)
      return prev
    })
  }

  const maskAnswer = (s: string) => {
    return s.split(/(\s+)/).map(part => {
      if (/^\s+$/.test(part)) return part
      if (part.length <= 2) return part[0] + '•'.repeat(Math.max(0, part.length - 1))
      return part[0] + '•'.repeat(part.length - 2) + part[part.length - 1]
    }).join('')
  }

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

  // mode hiệu dụng theo từng thẻ (ổn định trong cả vòng đời câu)
  const [cardMode, setCardMode] = useState<'mcq' | 'fill'>(() => (mode === 'both' ? 'mcq' : mode))
  useEffect(() => {
    if (!card) return
    if (mode === 'both') setCardMode(Math.random() < 0.5 ? 'mcq' : 'fill')
    else setCardMode(mode)
  }, [mode, card])

  // reset khi đổi thư viện
  useEffect(() => {
    setStarted(false)
    setQuizCards([])
    setI(0)
    setShow(false)
    setFinished(false)
    setCorrectCount(0)
    setMcqResult(null)
    setFillResult(null)
    setInput('')
  }, [libId])

  // ======= Helpers =======
  if (!user) return <Container><P>{t('common.loginRequired')}</P></Container>
  if (order.length === 0) {
    return (
      <Container>
        <div className="rounded-2xl border p-6">
          <P>{t('common.noLibraries')}</P>
        </div>
      </Container>
    )
  }

  if (!card) {
    return (
      <Container className="space-y-4">
        <div className="flex justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost">{t('common.options')}</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Small>{t('study.mode')}</Small>
                  <div className="text-sm">{mode === 'mcq' ? t('study.mcqMode') : mode === 'fill' ? t('study.fillMode') : t('study.bothMode')}</div>
                </div>

                  <div className="flex items-center gap-2">
                    <Small>{t('quiz.questionCount')}</Small>
                    <input type="number" min={1} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} className="w-24 rounded-xl border px-2 py-1 text-sm" />
                    <Small className="text-muted-foreground">{t('quiz.hasCards', { count: cards.length })}</Small>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={startQuiz} disabled={cards.length === 0}>{t('quiz.start')}</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="rounded-2xl border p-6 text-center">
          <P>{t('study.libraryHasNoCards')}</P>
        </div>
      </Container>
    )
  }

  // ======= UI =======
  // progress and total are computed inline where needed to avoid unused variables
  const score10 = (() => {
    const t = quizCards.length || 1
    const raw = (correctCount / t) * 10
    const rounded = Math.round(raw * 10) / 10
    return Number.isInteger(rounded) ? `${rounded.toFixed(0)}/10` : `${rounded.toFixed(1)}/10`
  })()

  return (
    <Container className="space-y-4">
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">{t('common.options')}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Small>{t('study.mode')}</Small>
                <div className="text-sm">{mode === 'mcq' ? t('study.mcqMode') : mode === 'fill' ? t('study.fillMode') : t('study.bothMode')}</div>
              </div>

              <div className="flex items-center gap-2">
                <Small>{t('study.questionCount')}</Small>
                <input type="number" min={1} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} className="w-24 rounded-xl border px-2 py-1 text-sm" />
                <Small className="text-muted-foreground">{t('study.availableCards', { count: cards.length })}</Small>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {!started ? (
                  <Button onClick={startQuiz} disabled={cards.length === 0}>{t('study.startQuiz')}</Button>
                ) : (
                  <>
                    <Small className="text-muted-foreground hidden sm:block">{t('study.quizProgress', { current: i + 1, total: quizCards.length })} · {t('study.correct')}: {correctCount}</Small>
                    <Button variant="secondary" onClick={retakeQuiz}>{t('study.retakeQuiz')}</Button>
                    <Button variant="destructive" onClick={() => { setStarted(false); setQuizCards([]); setI(0); setShow(false) }}>{t('common.exit')}</Button>
                  </>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* progress bar */}
      {started && (
        <div className="rounded-xl border p-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">{t('study.progress')}</span>
            <div className="relative h-2 flex-1 rounded-full bg-muted overflow-hidden">
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

      {/* vùng câu hỏi – cố định min-h để tránh nhảy */}
      <div className="rounded-2xl border p-6 text-center min-h-[260px] flex flex-col justify-center">
        <Large className="leading-relaxed">{card.front}</Large>

        {cardMode === 'mcq' ? (
          // render choices in a responsive grid: 1 column on very small screens, 2 columns on sm+ so 4 choices become 2x2
          <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
            {choices.map((c, idx) => {
              const isCorrect = c.trim() === card.back.trim()
              const locked = mcqResult !== null
              const visual = locked
                ? (isCorrect
                    ? 'bg-success/10 border-success'
                    : 'bg-destructive/10 border-destructive')
                : 'bg-card'
              const textVisual = locked
                ? (isCorrect ? 'text-success-foreground' : 'text-destructive-foreground')
                : ''
              return (
                <Button
                  key={idx}
                  // ensure text remains readable against colored backgrounds
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
                  <span className="mr-2 rounded-md border px-2 py-0.5 text-xs tabular-nums bg-white/90 dark:bg-neutral-900/60">{idx + 1}</span>
                  {c}
                </Button>
              )
            })}
            {mcqResult !== null && (
                <Small className={mcqResult ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}>
                {mcqResult ? 'Chính xác 🎉' : `Sai — đáp án đúng: ${card.back}`}
              </Small>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <input
              value={input}
              onChange={(e) => setInput((e.target as HTMLInputElement).value)}
              className="w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40"
              placeholder="Nhập đáp án"
              aria-label="Nhập đáp án"
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
                Kiểm tra (Enter)
              </Button>
            </div>
            {fillResult !== null && (
              <Small className={fillResult ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}>
                {fillResult ? t('study.correct') : t('study.incorrect')}
              </Small>
            )}
            {/* description */}
            {(show) && (
              <div className="mt-1">
                <Small className="text-muted-foreground">
                  {card.description ?? maskAnswer(card.back)}
                </Small>
              </div>
            )}
          </div>
        )}
      </div>

      {/* hành động dưới */}
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
        <div className="rounded-2xl border p-6 space-y-4">
            <div className="text-center space-y-1">
            <div className="text-2xl font-bold">{t('study.quizCompleted')}</div>
            <div className="text-lg">{t('study.yourScore')}: {score10}</div>
            <div className="flex items-center gap-3 justify-center text-sm text-muted-foreground">
              <span>{t('study.total')}: {quizCards.length}</span>
              <span>{t('study.correct')}: {correctCount}</span>
              <span>{t('study.incorrect')}: {Math.max(0, quizCards.length - correctCount)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${Math.round((correctCount / Math.max(1, quizCards.length)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-left">
            <div className="text-sm text-muted-foreground mb-2">{t('study.answers')}:</div>
            <QuizAnswers cards={quizCards} />
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={retakeQuiz}>{t('study.retakeQuiz')}</Button>
            <Button variant="secondary" onClick={() => { setFinished(false); setQuizCards([]); setI(0); setCorrectCount(0) }}>{t('study.backToStudy')}</Button>
          </div>
        </div>
      ) : null}
    </Container>
  )
}


