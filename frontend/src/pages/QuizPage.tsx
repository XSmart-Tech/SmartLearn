// src/pages/QuizPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { fetchCards } from '@/store/cardsSlice'
import { fetchLibraries } from '@/store/librariesSlice'
import { Button, P, Small, Large } from '@/components/ui'

export default function QuizPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((s: RootState) => s.auth)

  const order = useSelector((s: RootState) => s.libraries.order)
  const libMap = useSelector((s: RootState) => s.libraries.items)
  const libs = order.map(id => libMap[id]).filter(Boolean)

  useEffect(() => { if (user?.uid && order.length === 0) dispatch(fetchLibraries(user.uid)) }, [dispatch, user?.uid, order.length])

  const [libId, setLibId] = useState<string | undefined>(() => localStorage.getItem('quiz.lib') || undefined)
  useEffect(() => {
    if (!libId) setLibId(order[0])
    else if (!order.includes(libId)) setLibId(order[0])
  }, [order, libId])
  useEffect(() => { if (libId) localStorage.setItem('quiz.lib', libId) }, [libId])

  const cards = useSelector((s: RootState) => (libId ? (s.cards.byLib[libId] ?? []) : []))
  useEffect(() => { if (libId) dispatch(fetchCards(libId)) }, [dispatch, libId])

  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  // quiz mode: 'mcq' = multiple choice, 'fill' = fill-in, 'both' = mixed
  const [mode, setMode] = useState<'mcq' | 'fill' | 'both'>(() => (localStorage.getItem('quiz.mode') as 'mcq'|'fill'|'both') || 'mcq')
  useEffect(() => { localStorage.setItem('quiz.mode', mode) }, [mode])
  // number of questions for the quiz (persisted)
  const [count, setCount] = useState<number>(() => {
    const v = parseInt(localStorage.getItem('quiz.count') || '')
    return Number.isFinite(v) && v > 0 ? v : 10
  })
  useEffect(() => { localStorage.setItem('quiz.count', String(count)) }, [count])
  // quiz lifecycle: started flag and the active shuffled subset
  const [started, setStarted] = useState(false)
  const [quizCards, setQuizCards] = useState<typeof cards>([])
  // for MCQ: feedback state: null = unanswered, true = correct, false = incorrect
  const [mcqResult, setMcqResult] = useState<boolean | null>(null)
  // for Fill-in: user input and result
  const [input, setInput] = useState('')
  const [fillResult, setFillResult] = useState<boolean | null>(null)
  // quiz results
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  // card index and derived data (use quizCards when started)
  const card = started ? quizCards[i] : cards[i]

  // per-card effective mode (keeps stable when mode === 'both')
  const [cardMode, setCardMode] = useState<'mcq' | 'fill'>(() => (mode === 'both' ? 'mcq' : mode))
  useEffect(() => {
    if (!card) return
    if (mode === 'both') setCardMode(Math.random() < 0.5 ? 'mcq' : 'fill')
    else setCardMode(mode)
  }, [mode, card])

  // reset quiz when library changes
  useEffect(() => {
    setStarted(false)
    setQuizCards([])
    setI(0)
    setShow(false)
  setFinished(false)
  setCorrectCount(0)
  }, [libId])

  // prepare choices (backs) for MCQ
  const choices = useMemo(() => {
    if (!card) return [] as string[]
    // collect other backs in the same library as distractors
    const others = cards.filter(c => c.id !== card.id).map(c => c.back)
    // unique
    const uniq = Array.from(new Set(others))
    // choose up to 3 distractors
    const picks: string[] = []
    while (picks.length < 3 && uniq.length > 0) {
      const idx = Math.floor(Math.random() * uniq.length)
      picks.push(uniq.splice(idx, 1)[0])
    }
    const all = [card.back, ...picks]
    // shuffle
    for (let j = all.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1))
      ;[all[j], all[k]] = [all[k], all[j]]
    }
    return all
  }, [card, cards])

  function maskAnswer(s: string) {
    // reveal first and last char of each word, mask rest with •
    return s.split(/(\s+)/).map(part => {
      if (/^\s+$/.test(part)) return part
      if (part.length <= 2) return part[0] + '•'.repeat(Math.max(0, part.length-1))
      return part[0] + '•'.repeat(part.length-2) + part[part.length-1]
    }).join('')
  }

  if (!user) return <P>Hãy đăng nhập để làm quiz.</P>
  if (order.length === 0) return <P>Chưa có thư viện nào. Hãy tạo thư viện trước.</P>
    if (!card) return (
      <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Small>Thư viện:</Small>
        <select value={libId} onChange={(e) => { setI(0); setShow(false); setLibId(e.target.value) }} className="rounded-xl border px-2 py-1 text-sm">
          {libs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <P>Thư viện này chưa có thẻ. Thêm thẻ để bắt đầu quiz.</P>
    </div>
  )

  return (
    <div >
  {/* header controls - when not started show pre-quiz form */}
      {!started ? (
        <div className="space-y-3 p-4 rounded-xl border">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Thư viện:</label>
            <select value={libId} onChange={(e) => { setI(0); setShow(false); setLibId(e.target.value) }} className="rounded-xl border px-2 py-1 text-sm">
              {libs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Chế độ quiz:</label>
            <select value={mode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setMode(e.target.value as 'mcq' | 'fill' | 'both'); setMcqResult(null); setFillResult(null); setInput(''); setShow(false) }} className="rounded-xl border px-2 py-1 text-sm">
              <option value="mcq">Trắc nghiệm</option>
              <option value="fill">Điền</option>
              <option value="both">Trộn (trắc nghiệm + điền)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Số câu:</label>
            <input type="number" min={1} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} className="w-24 rounded-xl border px-2 py-1 text-sm" />
            <div className="text-sm text-gray-500">Thẻ trong thư viện: {cards.length}</div>
            <div className="flex-0">
              <Button onClick={() => {
                // start quiz: shuffle and take subset
                const all = [...cards]
                for (let j = all.length - 1; j > 0; j--) {
                  const k = Math.floor(Math.random() * (j + 1))
                  ;[all[j], all[k]] = [all[k], all[j]]
                }
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
              }}>Bắt đầu</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Đang làm quiz — {i+1}/{quizCards.length}</div>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={() => {
              // restart
              const all = [...cards]
              for (let j = all.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1))
                ;[all[j], all[k]] = [all[k], all[j]]
              }
              const take = Math.min(count, all.length)
              setQuizCards(all.slice(0, take))
              setI(0)
              setShow(false)
              setMcqResult(null)
              setFillResult(null)
              setCorrectCount(0)
              setFinished(false)
              setInput('')
            }}>Làm lại</Button>
            <Button variant="destructive" onClick={() => { setStarted(false); setQuizCards([]); setI(0); setShow(false) }}>Thoát</Button>
          </div>
        </div>
      )}
      {/* show quiz UI only when started; when finished show summary */}
      {started ? (
        <>
            <div className="rounded-2xl border p-6 text-center">
              <Large>{card.front}</Large>
            {/* render by mode */}
            {(() => {
              const effectiveMode = cardMode
              if (effectiveMode === 'mcq') {
                return (
                  <div className="mt-4 space-y-3">
                    {choices.map((c, idx) => (
                      <div key={idx}>
                        <Button className="w-full" onClick={() => {
                          if (mcqResult !== null) return
                          const ok = c.trim() === card.back.trim()
                          setMcqResult(ok)
                          if (ok) setCorrectCount(n => n + 1)
                        }}>{c}</Button>
                      </div>
                    ))}
                    {mcqResult !== null && <Small>{mcqResult ? 'Chính xác 🎉' : 'Sai — đáp án đúng: ' + card.back}</Small>}
                  </div>
                )
              } else {
                // fill-in
                return (
                  <div className="mt-4 space-y-3">
                    <input value={input} onChange={(e) => setInput((e.target as HTMLInputElement).value)} className="w-full rounded-xl border px-3 py-2" placeholder="Nhập đáp án" />
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => {
                        if (fillResult !== null) return
                        const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
                        const ok = norm(input) === norm(card.back)
                        setFillResult(ok)
                        if (ok) setCorrectCount(n => n + 1)
                        setShow(true) // will reveal hint only for fill mode
                      }}>Kiểm tra</Button>
                    </div>
                    {fillResult !== null && <Small>{fillResult ? 'Chính xác 🎉' : 'Sai'}</Small>}
                    {show && <Small>{card.hint ?? maskAnswer(card.back)}</Small>}
                  </div>
                )
              }
            })()}
          </div>

          {cardMode === 'mcq' ? (
            <div className="flex gap-2 justify-center">
              <Button onClick={() => {
                setShow(false); setMcqResult(null); setFillResult(null); setInput('')
                if (i < quizCards.length - 1) setI(x => x + 1)
                else {
                  // finish quiz
                  setStarted(false)
                  setFinished(true)
                }
              }}>Tiếp</Button>
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              <Button onClick={() => {
                setShow(false); setMcqResult(null); setFillResult(null); setInput('')
                if (i < quizCards.length - 1) setI(x => x + 1)
                else {
                  // finish quiz
                  setStarted(false)
                  setFinished(true)
                }
              }}>Tiếp</Button>
              <Button onClick={() => { setShow((s) => !s) }}>{show ? 'Ẩn gợi ý' : 'Gợi ý'}</Button>
            </div>
          )}
        </>
      ) : finished ? (
        <div className="rounded-2xl border p-6 text-center space-y-4">
          <div className="text-2xl font-bold">Chúc mừng! Bạn đã hoàn thành quiz 🎉</div>
          <div className="text-lg">Điểm của bạn: {
            (() => {
              const total = quizCards.length || 1
              const raw = (correctCount / total) * 10
              const rounded = Math.round(raw * 10) / 10
              return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}/10`
            })()
          }</div>
          <div className="text-left">
            <div className="text-sm text-gray-600 mb-2">Đáp án các câu:</div>
            <div className="space-y-3">
              {quizCards.length === 0 ? <div className="text-sm text-gray-600">Không có câu hỏi.</div> : quizCards.map((c, idx) => (
                <div key={c.id} className="rounded-lg border p-3 bg-gray-50">
                  <div className="font-medium">{idx + 1}. {c.front}</div>
                  <div className="text-gray-700 mt-1">Đáp án: <span className="font-semibold">{c.back}</span></div>
                  {c.hint && <div className="text-sm text-gray-500 mt-1">Gợi ý: {c.hint}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => {
              // retake: reshuffle and start again
              const all = [...cards]
              for (let j = all.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1))
                ;[all[j], all[k]] = [all[k], all[j]]
              }
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
            }}>Làm lại</Button>
            <Button variant="secondary" onClick={() => { setFinished(false); setQuizCards([]); setI(0); setCorrectCount(0) }}>Quay lại</Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
