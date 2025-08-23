import { useEffect, useRef, useState } from 'react'
import { searchUsers } from '@/lib/firebase'
import type { PublicUser } from '@/lib/types'
import { Input } from './ui/input'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'

export default function UserAutocomplete({ onSelect }: { onSelect: (u: PublicUser) => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PublicUser[]>([])
  const debounced = useDebounce(q, 200)
  const boxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!debounced) { setItems([]); return }
      const r = await searchUsers(debounced)
      if (!cancelled) setItems(r)
    })()
    return () => { cancelled = true }
  }, [debounced])

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const select = (u: PublicUser) => { onSelect(u); setQ(u.displayName || u.email); setOpen(false) }

  return (
    <div className="relative" ref={boxRef}>
      <Input placeholder="Nhập tên hoặc email" value={q} onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setOpen(true) }} />
      {open && items.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border bg-white shadow">
          {items.map(u => (
            <button key={u.uid} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50" onClick={() => select(u)}>
              <Avatar>
                {u.photoURL ? (
                  <AvatarImage src={u.photoURL} alt={u.displayName || u.email} />
                ) : (
                  <AvatarFallback>{(u.displayName || u.email).slice(0, 1)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{u.displayName || u.email}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function useDebounce<T>(value: T, ms = 200) {
  const [v, setV] = useState(value)
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t) }, [value, ms])
  return v
}
