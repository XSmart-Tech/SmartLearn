"use client"

import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/shared/store'
import {
  watchLibraryUsers, unwatchLibraryUsers,
  selectLibraryEntryMemoized
} from '@/shared/store/libraryUsersSlice'
import type { PublicUser } from '@/shared/lib/types'
import { Button } from '@/shared/ui'
import { setShareRole, setUnshareRole } from '@/shared/store/librariesSlice'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle} from '@/shared/ui/dialog'
import { UserRow } from '@/shared/components/UserRow'
import { AddUserForm } from '@/shared/components/AddUserForm'
import { EmptyShareState } from './EmptyShareState'
import { MemberCount } from '@/shared/components/MemberCount'

export default function ShareManager({
  libraryId,
  ownerId,
  share,
  shareRoles,
  isOwner = false,
  mountOnOpen = true,       
  trigger = <Button variant="secondary">Chia sẻ</Button>, // UI nút mở
}: {
  libraryId: string
  ownerId: string
  share: string[] | Record<string, unknown> | undefined
  shareRoles?: Record<string, 'contributor' | 'viewer'>
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

  const shareRolesProp = useMemo(() => {
    return shareRoles || {}
  }, [shareRoles])

  const libEntry = useSelector((s: RootState) => selectLibraryEntryMemoized(s, libraryId))
  const uids = libEntry.uids.length
    ? libEntry.uids
    : Array.from(new Set([ownerId, ...shareUidsProp]))

  // ——— Nội dung phần thân (UI giống bản bạn đang dùng) ———
  const Body = () => {
    const ownerFirst = uids[0] === ownerId ? uids : [ownerId, ...uids.filter((u: string) => u !== ownerId)]
    const membersCount = Math.max(ownerFirst.length - 1, 0)

    const onAdd = async (user: PublicUser, role: 'contributor' | 'viewer' = 'viewer') => {
      await dispatch(setShareRole({ id: libraryId, uid: user.uid, role })).unwrap?.()
    }

    return (
      <div className="space-y-0">
        <MemberCount count={membersCount} showOwnerBadge={isOwner} />

        {/* List */}
        <ul className="divide-y border-t border-border">
          <UserRow libraryId={libraryId} uid={ownerId} role="owner" isOwner={isOwner} />
          {ownerFirst.filter((u: string) => u !== ownerId).map((uid: string) => {
            const userRole = shareRolesProp[uid] || 'viewer'
            return (
              <UserRow
                key={uid}
                libraryId={libraryId}
                uid={uid}
                role={userRole}
                isOwner={isOwner}
                onRemove={async () => {
                  await dispatch(setUnshareRole({ id: libraryId, uid })).unwrap?.()
                }}
              />
            )
          })}
        </ul>

        {/* Empty */}
        {ownerFirst.filter((u: string) => u !== ownerId).length === 0 && (
          <EmptyShareState />
        )}

        {/* Add member */}
        {isOwner && (
          <AddUserForm
            ownerId={ownerId}
            uids={uids}
            onAdd={onAdd}
          />
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
