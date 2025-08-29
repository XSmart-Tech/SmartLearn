import { Small } from '@/shared/ui'
import { UserAutocomplete } from '@/shared/components/user'
import type { PublicUser } from '@/shared/lib/types'
import { useTranslation } from 'react-i18next'

interface UserSelectionFormProps {
  target: PublicUser | null
  onSelect: (user: PublicUser | null) => void
  label?: string
}

export function UserSelectionForm({
  target,
  onSelect,
  label
}: UserSelectionFormProps) {
  const { t } = useTranslation()
  
  const displayLabel = label || t('common.selectUser')
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{displayLabel}</label>
      <UserAutocomplete onSelect={onSelect} />
      {target && (
        <Small className="text-sm text-muted-foreground block">
          {t('common.selectedUser', { 
            name: target.displayName || target.email, 
            email: target.email 
          })}
        </Small>
      )}
    </div>
  )
}
