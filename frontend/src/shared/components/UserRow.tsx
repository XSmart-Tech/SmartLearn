import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/shared/store'
import { selectLibraryUser } from '@/shared/store/libraryUsersSlice'
import { updateUserRole } from '@/shared/store/librariesSlice'
import { Avatar, AvatarImage, AvatarFallback, Button } from '@/shared/ui'
import { Loader2, UserMinus } from 'lucide-react'
import { STATUS_MESSAGES } from '@/shared/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

interface UserRowProps {
  libraryId: string
  uid: string
  role: 'owner' | 'contributor' | 'viewer'
  isOwner: boolean
  onRemove?: () => Promise<void>
}

export function UserRow({ libraryId, uid, role, isOwner, onRemove }: UserRowProps) {
  const dispatch = useDispatch<AppDispatch>()
  const u = useSelector((s: RootState) => selectLibraryUser(libraryId, uid)(s))
  const name = u?.displayName || (role === 'owner' ? 'Chủ sở hữu' : uid)
  const email = u?.email || (role === 'owner' ? 'owner' : '—')
  const initial = (u?.displayName || uid || '?').slice(0, 1).toUpperCase()
  const [removing, setRemoving] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(false)

  const handleRemove = async () => {
    if (!onRemove) return
    try {
      setRemoving(true)
      await onRemove()
    } finally {
      setRemoving(false)
    }
  }

  const handleRoleChange = async (newRole: 'contributor' | 'viewer') => {
    if (newRole === role || !isOwner) return
    try {
      setUpdatingRole(true)
      await dispatch(updateUserRole({ id: libraryId, uid, role: newRole })).unwrap()
    } finally {
      setUpdatingRole(false)
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
          {role === 'owner' ? (
            <span className={[
              'shrink-0 rounded-full border px-2 py-0.5 text-[11px] border-border',
              'bg-primary text-primary-foreground'
            ].join(' ')}>
              {role}
            </span>
          ) : isOwner ? (
            <Select
              value={role}
              onValueChange={handleRoleChange}
              disabled={updatingRole}
            >
              <SelectTrigger className="h-6 w-24 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className={[
              'shrink-0 rounded-full border px-2 py-0.5 text-[11px] border-border',
              'text-muted-foreground bg-card'
            ].join(' ')}>
              {role}
            </span>
          )}
        </div>
        <div className="truncate text-xs text-muted-foreground">{email}</div>
      </div>

      {role !== 'owner' && isOwner && onRemove && (
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
