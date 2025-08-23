import { useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PublicUser } from '@/lib/types'
import { Avatar, AvatarImage, AvatarFallback, H4 } from '@/components/ui'

function useUsers(uids: string[], realtime = false) {
  const [map, setMap] = useState<Record<string, PublicUser>>({})
  useEffect(() => {
    const unsubscribes: (() => void)[] = []
    let cancelled = false
    const run = async () => {
      const entries = await Promise.all(uids.map(async (uid) => {
        const ref = doc(db, 'users', uid)
        if (realtime) {
          const unsub = onSnapshot(ref, (snap) => {
            const v = snap.data() as PublicUser | undefined
            setMap(m => ({ ...m, [uid]: { uid, displayName: v?.displayName ?? '', email: v?.email ?? '', photoURL: v?.photoURL ?? '' } }))
          })
          unsubscribes.push(unsub)
        } else {
          const snap = await getDoc(ref)
          const v = snap.data() as PublicUser | undefined
          return [uid, { uid, displayName: v?.displayName ?? '', email: v?.email ?? '', photoURL: v?.photoURL ?? '' }] as const
        }
      }))
      if (!realtime && !cancelled) {
        const next: Record<string, PublicUser> = {}
        for (const e of entries) if (e) next[e[0]] = e[1]
        setMap(next)
      }
    }
    run()
    return () => { cancelled = true; unsubscribes.forEach(u => u()) }
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
  const users = useUsers(uids, realtime)

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