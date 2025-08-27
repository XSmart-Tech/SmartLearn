import { Small } from '@/shared/ui'
import UserAutocomplete from './UserAutocomplete'
import type { PublicUser } from '@/shared/lib/types'

interface UserSelectionFormProps {
  target: PublicUser | null
  onSelect: (user: PublicUser | null) => void
  label?: string
}

export function UserSelectionForm({
  target,
  onSelect,
  label = 'Chọn người dùng:'
}: UserSelectionFormProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <UserAutocomplete onSelect={onSelect} />
      {target && (
        <Small className="text-sm text-gray-600 block">
          Đã chọn: <b>{target.displayName || target.email}</b> ({target.email})
        </Small>
      )}
    </div>
  )
}
