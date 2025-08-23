// src/pages/StudyPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { fetchCards, updateCard } from '@/store/cardsSlice'
import { fetchLibraries } from '@/store/librariesSlice'
import { reviewSM2 } from '@/lib/sm2'
import { Button, P, Small, Large } from '@/components/ui'

export default function StudyPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((s: RootState) => s.auth)

  // danh sách thư viện trong store
  const order = useSelector((s: RootState) => s.libraries.order)
  const libMap = useSelector((s: RootState) => s.libraries.items)
  const libs = order.map(id => libMap[id]).filter(Boolean)

  // nạp thư viện (cache-first đã cấu hình ở Firestore)
  useEffect(() => { if (user?.uid && order.length === 0) dispatch(fetchLibraries(user.uid)) }, [dispatch, user?.uid, order.length])

  // thư viện đang chọn (giữ trong localStorage)
  const [libId, setLibId] = useState<string | undefined>(() => localStorage.getItem('study.lib') || undefined)
  useEffect(() => {
    if (!libId) setLibId(order[0])
    else if (!order.includes(libId)) setLibId(order[0])
  }, [libId, order]) // khi danh sách thay đổi
  useEffect(() => { if (libId) localStorage.setItem('study.lib', libId) }, [libId])

  // thẻ của thư viện đang chọn
  const cards = useSelector((s: RootState) => (libId ? (s.cards.byLib[libId] ?? []) : []))
  useEffect(() => { if (libId) dispatch(fetchCards(libId)) }, [dispatch, libId])

  const dueNow = useMemo(() => {
    const now = Date.now()
    return cards.filter(c => (c.dueAt ?? 0) <= now)
  }, [cards])

  const [current, setCurrent] = useState(0)
  const card = dueNow[current]

  const answer = (q: 0|1|2|3|4|5) => {
    if (!card) return
    const state = { easiness: card.easiness ?? 2.5, interval: card.interval ?? 0, repetition: card.repetition ?? 0, dueAt: card.dueAt ?? Date.now() }
    const next = reviewSM2(state, q)
    dispatch(updateCard({ id: card.id, patch: next }))
    setCurrent(i => i + 1)
  }

  if (!user) return <P>Hãy đăng nhập để học.</P>
  if (order.length === 0) return <P>Chưa có thư viện nào. Hãy tạo thư viện và thêm thẻ.</P>

  return (
    <div>
      <div className="flex items-center gap-2">
        <Small>Thư viện:</Small>
        <select value={libId} onChange={(e) => setLibId(e.target.value)} className="rounded-xl border px-2 py-1 text-sm">
          {libs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {card ? (
        <>
          <div className="rounded-2xl border p-6 text-center">
            <Large>{card.front}</Large>
            <Small>{card.back}</Small>
          </div>
          <div className="grid grid-cols-6 gap-2 text-xs">
            {([0,1,2,3,4,5] as (0 | 1 | 2 | 3 | 4 | 5)[]).map((q) => <Button key={q} onClick={() => answer(q)}>{q}</Button>)}
          </div>
        </>
      ) : (
        <div>Không còn thẻ đến hạn. Tuyệt!</div>
      )}
    </div>
  )
}
