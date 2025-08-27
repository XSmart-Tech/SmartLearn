"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { searchUsers } from "@/shared/lib/firebase"
import type { PublicUser } from "@/shared/lib/types"
import { Input, Avatar, AvatarImage, AvatarFallback, Button, Small } from "@/shared/ui"
import { Search, X, Loader2 } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover"

export default function UserAutocomplete({
  onSelect,
  className = "",
  maxHeight = 320, // tối đa chiều cao list
}: {
  onSelect: (u: PublicUser) => void
  className?: string
  maxHeight?: number
}) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const cacheRef = useRef<Map<string, PublicUser[]>>(new Map())
  const seqRef = useRef(0)

  // width của popover = width trigger
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const [triggerW, setTriggerW] = useState<number>(0)

  useEffect(() => {
    if (!triggerRef.current) return
    const ro = new ResizeObserver(() => {
      const w = triggerRef.current?.getBoundingClientRect().width ?? 0
      setTriggerW(w)
    })
    ro.observe(triggerRef.current)
    setTriggerW(triggerRef.current.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const isLikelyEmail = useMemo(() => /\S+@\S+\.\S+/.test(q.trim()), [q])

  const runSearch = async (termRaw?: string) => {
    const term = (termRaw ?? q).trim().toLowerCase()
    if (!term) {
      setItems([]); setActiveIdx(-1); setOpen(false)
      return
    }

    const cached = cacheRef.current.get(term)
    if (cached) {
      setItems(cached)
      setActiveIdx(cached.length ? 0 : -1)
      setOpen(cached.length > 0)
      return
    }

    const seq = ++seqRef.current
    setLoading(true)
    try {
      const res = await searchUsers(term)
      if (seq === seqRef.current) {
        cacheRef.current.set(term, res)
        setItems(res)
        setActiveIdx(res.length ? 0 : -1)
        setOpen(res.length > 0)
      }
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }

  const select = (u: PublicUser) => {
    onSelect(u)
    setQ(u.displayName || u.email || "")
    setOpen(false)
    setActiveIdx(-1)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (open && activeIdx >= 0 && activeIdx < items.length) {
        select(items[activeIdx])
      } else {
        runSearch()
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!open && items.length > 0) setOpen(true)
      setActiveIdx((i) => (items.length ? (i + 1) % items.length : -1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (!open && items.length > 0) setOpen(true)
      setActiveIdx((i) => (items.length ? (i - 1 + items.length) % items.length : -1))
    } else if (e.key === "Escape") {
      setOpen(false); setActiveIdx(-1)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Trigger chỉ bao BÓ CỤ input để định vị; KHÔNG chứa dòng mẹo */}
      <PopoverTrigger asChild>
        <div ref={triggerRef} className={`relative ${className}`}>
          {/* icon trái – luôn bám giữa theo chiều cao input */}
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-gray-400" />
          </span>

          <Input
            placeholder="Tìm theo email hoặc tên (nhấn Enter)"
            value={q}
            onFocus={() => { if (items.length > 0) setOpen(true) }}
            onChange={(e) => { setQ(e.target.value); setOpen(false); setActiveIdx(-1) }}
            onKeyDown={onKeyDown}
            className="h-11 w-full rounded-xl pl-10 pr-24 text-[15px] shadow-sm focus-visible:ring-2"
          />

          {/* cụm X + Tìm – canh giữa theo input, không lệ thuộc chiều cao wrapper */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            {q && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg p-0 pointer-events-auto"
                onClick={() => { setQ(""); setItems([]); setOpen(false); setActiveIdx(-1) }}
                aria-label="Xóa"
                title="Xóa"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => runSearch()}
              disabled={loading || !q.trim()}
              className="h-8 rounded-lg px-3 pointer-events-auto"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tìm"}
            </Button>
          </div>
        </div>
      </PopoverTrigger>

      {/* Dòng mẹo đặt NGOÀI Trigger để không đội chiều cao vùng định vị */}
      {isLikelyEmail && (
        <div className="mt-1 text-xs text-gray-500">
          Mẹo: bạn đã nhập email đầy đủ — nhấn Enter để tìm nhanh.
        </div>
      )}

      {/* Content = dropdown; width khớp trigger */}
      <PopoverContent
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()} // giữ focus ở input
        className="p-0 z-[60] w-[var(--popover-w)] rounded-2xl border bg-white shadow-xl ring-1 ring-black/5"
        style={{ ["--popover-w"]: `${triggerW || 240}px` } as Record<string, string>}
      >
        {items.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500">Không có kết quả</div>
        ) : (
          <ul
            className="max-h-[320px] overflow-y-auto py-1"
            style={{ maxHeight }}
            role="listbox"
            aria-label="Kết quả tìm kiếm người dùng"
          >
            {items.map((u, idx) => {
              const active = idx === activeIdx
              return (
                <li key={u.uid}>
                  <button
                    type="button"
                    onClick={() => select(u)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={[
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition",
                      active ? "bg-gray-100" : "hover:bg-gray-50"
                    ].join(" ")}
                    role="option"
                    aria-selected={active}
                  >
                    <Avatar className="h-7 w-7">
                      {u.photoURL
                        ? <AvatarImage src={u.photoURL} alt={u.displayName || u.email} />
                        : <AvatarFallback>{(u.displayName || u.email || "?").slice(0,1).toUpperCase()}</AvatarFallback>}
                    </Avatar>
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-medium">
                          {u.displayName || u.email}
                        </div>
                        <Small className="truncate text-gray-600">{u.email}</Small>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-gray-600">
                        User
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
