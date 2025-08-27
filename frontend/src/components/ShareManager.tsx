"use client"

import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import {
  watchLibraryUsers, unwatchLibraryUsers,
  selectLibraryEntry, selectLibraryUser
} from '@/store/libraryUsersSlice'
import type { PublicUser } from '@/lib/types'
import { Avatar, AvatarImage, AvatarFallback, Button, Small } from '@/components/ui'
import { setShareRole, setUnshareRole } from '@/store/librariesSlice'
import UserAutocomplete from './UserAutocomplete'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { ShieldCheck, UserMinus, Loader2, Plus } from 'lucide-react'

export default function ShareManager({
  libraryId,
  ownerId,
  share,
  isOwner = false,
  mountOnOpen = true,       
  trigger = <Button variant="secondary">Chia sẻ</Button>, // UI nút mở
}: {
  libraryId: string
  ownerId: string
  share: string[] | Record<string, unknown> | undefined
  realtime?: boolean
  isOwner?: boolean
  mountOnOpen?: boolean
  trigger?: React.ReactNode
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [open, setOpen] = useState(false)

  // Chỉ theo dõi khi: (không dùng dialog) hoặc (dialog đang mở)
  useEffect(() => {
    const shouldWatch = !mountOnOpen || open
    if (!shouldWatch) return
    dispatch(watchLibraryUsers({ libraryId }))
    return () => { dispatch(unwatchLibraryUsers({ libraryId })) }
  }, [dispatch, libraryId, mountOnOpen, open])

  // Fallback uids từ prop share nếu store chưa kịp sync
  const shareUidsProp = useMemo(() => {
    if (Array.isArray(share)) return share
    if (share && typeof share === 'object') return Object.keys(share)
    return [] as string[]
  }, [share])

  const libEntry = useSelector((s: RootState) => selectLibraryEntry(s, libraryId))
  const uids = libEntry.uids.length
    ? libEntry.uids
    : Array.from(new Set([ownerId, ...shareUidsProp]))

  // ——— Nội dung phần thân (UI giống bản bạn đang dùng) ———
  const Body = () => {
    const ownerFirst = uids[0] === ownerId ? uids : [ownerId, ...uids.filter(u => u !== ownerId)]
    const membersCount = Math.max(ownerFirst.length - 1, 0)

    const [target, setTarget] = useState<PublicUser | null>(null)
    const [adding, setAdding] = useState(false)
    const canAdd = !!target && target.uid !== ownerId && !uids.includes(target.uid)

    const onAdd = async () => {
      if (!target || !canAdd) return
      try {
        setAdding(true)
        await dispatch(setShareRole({ id: libraryId, uid: target.uid })).unwrap?.()
        setTarget(null)
      } finally {
        setAdding(false)
      }
    }

    return (
      <div className="space-y-0">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground border-border bg-card">
              {membersCount} thành viên
            </span>
            {isOwner && (
              <span className="hidden rounded-full px-2 py-0.5 text-xs bg-primary text-primary-foreground md:inline">
                Bạn là chủ sở hữu
              </span>
            )}
          </div>
        </div>

  {/* List */}
  <ul className="divide-y border-t border-border">
          <UserRow libraryId={libraryId} uid={ownerId} role="owner" isOwner={isOwner} />
          {ownerFirst.filter(u => u !== ownerId).map(uid => (
            <UserRow
              key={uid}
              libraryId={libraryId}
              uid={uid}
              role="member"
              isOwner={isOwner}
              onRemove={async () => {
                await dispatch(setUnshareRole({ id: libraryId, uid })).unwrap?.()
              }}
            />
          ))}
        </ul>

        {/* Empty */}
        {ownerFirst.filter(u => u !== ownerId).length === 0 && (
          <div className="mt-3 rounded-xl border-dashed border border-border bg-card p-4 text-center">
            <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium text-card-foreground">Chưa chia sẻ cho ai</div>
            <div className="mt-1 text-xs text-muted-foreground">Thêm người để cùng quản lý/thực hành thẻ.</div>
          </div>
        )}

        {/* Add member */}
        {isOwner && (
          <div className="mt-4 rounded-xl p-3 bg-card border border-border">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Thêm người</div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="flex-1">
                <UserAutocomplete onSelect={(u) => setTarget(u)} />
              </div>
              <Button
                disabled={!canAdd || adding}
                onClick={onAdd}
                className="h-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 px-4"
              >
                {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {adding ? 'Đang thêm…' : 'Thêm'}
              </Button>
            </div>
            {!canAdd && target && (
              <Small className="mt-2 block text-muted-foreground">
                {target.uid === ownerId
                  ? 'Không thể thêm chủ sở hữu.'
                  : uids.includes(target.uid)
                  ? 'Người này đã có quyền truy cập.'
                  : null}
              </Small>
            )}
          </div>
        )}
      </div>
    )
  }

  // Skeleton khi mở dialog và chưa có uids từ store
  const NeedsSkeleton = mountOnOpen && open && libEntry.uids.length === 0

  if (!mountOnOpen) {
    // Render trực tiếp (không dialog; theo dõi ngay từ lúc mount)
    return <Body />
  }

  // Dùng chính ShareManager làm Dialog + trigger; chỉ fetch khi open = true
  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Quản lý chia sẻ</DialogTitle>
        </DialogHeader>

        {NeedsSkeleton ? (
          <div className="space-y-2">
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted/20" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted/20" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted/20" />
          </div>
        ) : (
          <Body />
        )}
      </DialogContent>
    </Dialog>
  )
}

function UserRow({
  libraryId, uid, role, isOwner, onRemove,
}: { libraryId: string; uid: string; role: 'owner' | 'member'; isOwner: boolean; onRemove?: () => Promise<void> }) {
  const u = useSelector((s: RootState) => selectLibraryUser(libraryId, uid)(s))
  const name = u?.displayName || (role === 'owner' ? 'Chủ sở hữu' : uid)
  const email = u?.email || (role === 'owner' ? 'owner' : '—')
  const initial = (u?.displayName || uid || '?').slice(0, 1).toUpperCase()
  const [removing, setRemoving] = useState(false)

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar className="h-9 w-9">
        {u?.photoURL ? <AvatarImage src={u.photoURL} alt={name} /> : <AvatarFallback>{initial}</AvatarFallback>}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-card-foreground">{name}</span>
          <span className={[
            'shrink-0 rounded-full border px-2 py-0.5 text-[11px] border-border',
            role === 'owner' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground bg-card'
          ].join(' ')}>
            {role}
          </span>
        </div>
        <div className="truncate text-xs text-muted-foreground">{email}</div>
      </div>

      {role === 'member' && isOwner && onRemove && (
        <Button
          variant="destructive"
          onClick={async () => { setRemoving(true); try { await onRemove() } finally { setRemoving(false) } }}
          disabled={removing}
          className="h-9 rounded-lg px-3"
        >
          {removing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserMinus className="mr-2 h-4 w-4" />}
          {removing ? 'Đang gỡ…' : 'Gỡ'}
        </Button>
      )}
    </li>
  )
}
