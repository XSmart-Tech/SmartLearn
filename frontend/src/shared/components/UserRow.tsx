import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/shared/store'
import { selectLibraryUser } from '@/shared/store/libraryUsersSlice'
import { Avatar, AvatarImage, AvatarFallback, Button } from '@/shared/ui'
import { Loader2, UserMinus } from 'lucide-react'
import { STATUS_MESSAGES } from '@/shared/lib/constants'

interface UserRowProps {
  libraryId: string
  uid: string
  role: 'owner' | 'member'
  isOwner: boolean
  onRemove?: () => Promise<void>
}

export function UserRow({ libraryId, uid, role, isOwner, onRemove }: UserRowProps) {
  const u = useSelector((s: RootState) => selectLibraryUser(libraryId, uid)(s))
  const name = u?.displayName || (role === 'owner' ? 'Chủ sở hữu' : uid)
  const email = u?.email || (role === 'owner' ? 'owner' : '—')
  const initial = (u?.displayName || uid || '?').slice(0, 1).toUpperCase()
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    if (!onRemove) return
    try {
      setRemoving(true)
      await onRemove()
    } finally {
      setRemoving(false)
    }
  }

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
          onClick={handleRemove}
          disabled={removing}
          className="h-9 rounded-lg px-3"
        >
          {removing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserMinus className="mr-2 h-4 w-4" />}
          {removing ? STATUS_MESSAGES.REMOVING_USER : 'Gỡ'}
        </Button>
      )}
    </li>
  )
}
