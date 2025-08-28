import { useEffect, useMemo, useState, useRef } from 'react'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { PublicUser } from '@/shared/lib/types'
import { Avatar, AvatarImage, AvatarFallback, H4 } from '@/shared/ui'

// Optimized user fetching with reduced listeners
function useOptimizedUsers(uids: string[], realtime = false) {
  const [map, setMap] = useState<Record<string, PublicUser>>({})
  const listenersRef = useRef<Map<string, () => void>>(new Map())
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentListeners = listenersRef.current

    // Clean up listeners for users not in the new list
    const currentUids = new Set(currentListeners.keys())
    const newUids = new Set(uids)

    for (const uid of currentUids) {
      if (!newUids.has(uid)) {
        const unsubscribe = currentListeners.get(uid)
        unsubscribe?.()
        currentListeners.delete(uid)
      }
    }

    // Debounce updates to reduce re-renders
    const updateUsers = (updates: Record<string, PublicUser>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setMap(prev => ({ ...prev, ...updates }))
      }, 100)
    }

    const run = async () => {
      const entries = await Promise.all(uids.map(async (uid) => {
        if (currentListeners.has(uid)) return null // Already have listener

        const ref = doc(db, 'users', uid)
        if (realtime) {
          const unsub = onSnapshot(ref, (snap) => {
            const v = snap.data() as PublicUser | undefined
            updateUsers({ [uid]: { uid, displayName: v?.displayName ?? '', email: v?.email ?? '', photoURL: v?.photoURL ?? '' } })
          })
          currentListeners.set(uid, unsub)
        } else {
          const snap = await getDoc(ref)
          const v = snap.data() as PublicUser | undefined
          return [uid, { uid, displayName: v?.displayName ?? '', email: v?.email ?? '', photoURL: v?.photoURL ?? '' }] as const
        }
        return null
      }))

      if (!realtime) {
        const next: Record<string, PublicUser> = {}
        for (const e of entries) if (e) next[e[0]] = e[1]
        setMap(next)
      }
    }

    run()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      for (const unsub of currentListeners.values()) {
        unsub()
      }
      currentListeners.clear()
    }
  }, [uids, realtime])

  return map
}

export default function ShareList({ ownerId, share, realtime = false }: { ownerId: string; share: string[] | Record<string, unknown> | undefined; realtime?: boolean }) {
  const shareUids = useMemo(() => {
    if (Array.isArray(share)) return share
    if (share && typeof share === 'object') return Object.keys(share)
    return [] as string[]
  }, [share])

  const uids = useMemo(() => {
    const s = new Set<string>([ownerId, ...shareUids])
    return Array.from(s)
  }, [ownerId, shareUids])

  const users = useOptimizedUsers(uids, realtime)

  return (
    <div className="rounded-2xl border p-3">
      <H4 className="text-sm font-semibold mb-2">Quyền chia sẻ</H4>
      <ul className="space-y-1">
        <li className="flex items-center gap-2 text-sm">
          <Avatar>
            {users[ownerId]?.photoURL ? (
              <AvatarImage src={users[ownerId]?.photoURL} alt={users[ownerId]?.displayName || 'Owner'} />
            ) : (
              <AvatarFallback>{(users[ownerId]?.displayName || 'O').slice(0, 1)}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <span className="font-medium">{users[ownerId]?.displayName || 'Chủ sở hữu'}</span>
            <span className="text-gray-500 ml-1">({users[ownerId]?.email ?? 'owner'})</span>
          </div>
          <span className="text-xs rounded-full border px-2 py-0.5">owner</span>
        </li>
        {shareUids.map((uid) => (
          <li key={uid} className="flex items-center gap-2 text-sm">
            <Avatar>
              {users[uid]?.photoURL ? (
                <AvatarImage src={users[uid]?.photoURL} alt={users[uid]?.displayName || uid} />
              ) : (
                <AvatarFallback>{(users[uid]?.displayName || uid).slice(0, 1)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <span className="font-medium">{users[uid]?.displayName || uid}</span>
              <span className="text-gray-500 ml-1">({users[uid]?.email || '—'})</span>
            </div>
            <span className="text-xs rounded-full border px-2 py-0.5">member</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
