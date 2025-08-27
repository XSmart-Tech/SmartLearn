import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Flashcard } from "@/lib/types"
import FlipCard from "./FlipCard"
import { Play, Pause, Shuffle, ChevronLeft, ChevronRight, Repeat } from "lucide-react"
import { Button } from "@/components/ui"

type Props = {
  cards: Flashcard[]
  initialIndex?: number
}

export default function FlipDeck({ cards, initialIndex = 0 }: Props) {
  const [order, setOrder] = useState<number[]>([])
  const [isShuffled, setIsShuffled] = useState(false)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [inverted, setInverted] = useState(false)
  const [known, setKnown] = useState<Set<string>>(new Set())

  const total = cards.length

  // Autoplay state + timers
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<number | null>(null)
  const flippedRef = useRef<boolean>(flipped)
  const idxRef = useRef<number>(idx)
  // timing (ms) - small delay before flipping, show back, then advance
  const PRE_FLIP_MS = 5000
  const SHOW_BACK_MS = 5000
  const BETWEEN_MS = 450

  // 🔧 Reset lại order/idx/flipped mỗi khi cards thay đổi
  useEffect(() => {
    if (total === 0) {
      setOrder([])
      setIdx(0)
      setFlipped(false)
      return
    }
    const arr = cards.map((_, i) => i)
    setOrder(arr)
    // kẹp initialIndex trong [0, total-1]
    const start = Math.min(Math.max(initialIndex, 0), total - 1)
    setIdx(start)
    setFlipped(false)
  }, [cards, total, initialIndex])

  // 🔧 Nếu số thẻ giảm mà idx tràn, kẹp lại
  useEffect(() => {
    if (idx > total - 1) setIdx(Math.max(0, total - 1))
  }, [idx, total])

  const current = total > 0 && order.length > 0 ? cards[order[idx]] : undefined
  const progress = useMemo(() => (total === 0 ? 0 : ((idx + 1) / total) * 100), [idx, total])

  // shuffle helper (randomize indices)
  const doShuffle = useCallback(() => {
    if (total === 0) return
    const arr = cards.map((_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setOrder(arr)
  }, [cards, total])

  // toggle shuffle mode: when enabled, keep deck in shuffled order
  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const next = !prev
      if (next) {
        // enable shuffle
        doShuffle()
      } else {
        // disable shuffle -> restore natural order
        setOrder(cards.map((_, i) => i))
      }
      setIdx(0)
      setFlipped(false)
      return next
    })
  }, [cards, doShuffle])

  // toggle showing back first (swap front/back content)
  const toggleInvert = useCallback(() => {
    setInverted((v) => !v)
    // reset flip state so UI starts on the currently visible side
    setFlipped(false)
  }, [])

  const prev = useCallback(() => {
    setIdx((v) => Math.max(0, v - 1))
    setFlipped(false)
  }, [])
  const next = useCallback(() => {
    setIdx((v) => Math.min(total - 1, v + 1))
    setFlipped(false)
  }, [total])

  const markKnown = useCallback(() => {
    if (!current) return
    const s = new Set(known)
    s.add(current.id)
    setKnown(s)
    next()
  }, [current, known, next])

  const markUnknown = useCallback(() => {
    if (!current) return
    const s = new Set(known)
    s.delete(current.id)
    setKnown(s)
    next()
  }, [current, known, next])

  const cardRef = useRef<HTMLDivElement | null>(null)

  // Keyboard: ← → Space/Enter, 1/2, S
  // Keyboard: ← → Space/Enter, 1/2, S
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const tag = target.tagName
    const isFormField =
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      target.isContentEditable

    if (isFormField) return

    const k = e.key.toLowerCase()
    if (k === "arrowright") next()
    else if (k === "arrowleft") prev()
    else if (k === " " || k === "enter") {
      const active = document.activeElement
      if (cardRef.current && (cardRef.current === active || cardRef.current.contains(active))) {
        e.preventDefault()
        setFlipped(f => !f)
      }
    }
    else if (k === "1") markKnown()
    else if (k === "2") markUnknown()
    else if (k === "s") toggleShuffle()
    else if (k === "i") toggleInvert()
  }

  window.addEventListener("keydown", onKey)
  return () => window.removeEventListener("keydown", onKey)
}, [next, prev, markKnown, markUnknown, toggleShuffle, toggleInvert])


  // keep refs in sync for autoplay loop
  useEffect(() => { flippedRef.current = flipped }, [flipped])
  useEffect(() => { idxRef.current = idx }, [idx])

  // Autoplay effect: flip then advance until end
  useEffect(() => {
    // clear any existing timer
    const clear = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    if (!playing) {
      clear()
      return
    }

    let cancelled = false

    const step = () => {
      if (cancelled) return
      // if no current, stop
      if (!cards || cards.length === 0) {
        setPlaying(false)
        return
      }

      const currentIdx = idxRef.current
      const atLast = currentIdx >= total - 1

      if (!flippedRef.current) {
        // small delay before flipping to avoid abrupt changes
        timerRef.current = window.setTimeout(() => {
          setFlipped(true)
          // after showing back for SHOW_BACK_MS, continue
          timerRef.current = window.setTimeout(step, SHOW_BACK_MS)
        }, PRE_FLIP_MS)
      } else {
        // already flipped: if at last, stop after showing back
        if (atLast) {
          setPlaying(false)
          return
        }
        // advance to next card
        next()
        // give a small gap then flip next
        timerRef.current = window.setTimeout(step, BETWEEN_MS)
      }
    }

    // start immediately
    timerRef.current = window.setTimeout(step, 0)

    return () => { cancelled = true; clear() }
  }, [playing, cards, next, total])

  // Trạng thái rỗng (chưa fetch xong hoặc không có thẻ)
  if (!current) {
    return (
      <div className="text-center p-10">
  <div className="text-lg text-[var(--color-muted-foreground)]">Chưa có thẻ để học.</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[840px] space-y-4">
      {/* Header + Progress */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-[var(--color-muted-foreground)]">
          Thẻ {idx + 1}/{total} • Đã nhớ: <span className="font-medium text-[var(--color-success)]">{known.size}</span>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-[var(--color-muted)] border border-[var(--color-border)]">
          <div className="h-full transition-all" style={{ width: `${progress}%`, background: 'var(--color-primary)' }} />
        </div>
      </div>

      {/* Card */}
      <FlipCard
        front={<span className="whitespace-pre-wrap">{inverted ? current.back : current.front}</span>}
        back={<span className="whitespace-pre-wrap">{inverted ? current.front : current.back}</span>}
        description={current.description}
        flipped={flipped}
        onToggle={() => setFlipped((f) => !f)}
        containerRef={cardRef}
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button
          variant={isShuffled ? "default" : "secondary"}
          onClick={toggleShuffle}
          title="Xáo trộn"
          aria-label="Xáo trộn"
          aria-pressed={isShuffled}
        >
          <Shuffle className="size-4" />
        </Button>
        <Button
          variant={inverted ? "default" : "secondary"}
          onClick={toggleInvert}
          title="Đổi chỗ xem: back trước / front sau"
          aria-label="Đổi chỗ xem"
          aria-pressed={inverted}
        >
          <Repeat className="size-4" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => setPlaying(p => !p)}
          title={playing ? "Tạm dừng" : "Phát"}
          aria-label={playing ? "Tạm dừng" : "Phát"}
          aria-pressed={playing}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button variant="secondary" onClick={prev} disabled={idx === 0} title="Trước" aria-label="Trước">
          <ChevronLeft className="size-4" />
        </Button>
        {/* flip button removed: card is flipped by clicking the card or using Space/Enter */}
        <Button variant="secondary" onClick={next} disabled={idx === total - 1} title="Sau" aria-label="Sau">
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="default" onClick={markKnown} title="Nhớ" aria-label="Nhớ">Nhớ</Button>
        <Button variant="destructive" onClick={markUnknown} title="Chưa nhớ" aria-label="Chưa nhớ">Chưa nhớ</Button>
      </div>
    </div>
  )
}
