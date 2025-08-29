import { useState } from 'react'
import { Button } from '@/shared/ui'
import { Loader2, Plus } from 'lucide-react'
import { UserAutocomplete } from '@/shared/components/user'
import { useUserSelection } from '@/shared/hooks'
import type { PublicUser } from '@/shared/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { useTranslation } from 'react-i18next'

interface AddUserFormProps {
  ownerId: string
  uids: string[]
  onAdd: (user: PublicUser, role: 'contributor' | 'viewer') => Promise<void>
}

export function AddUserForm({ ownerId, uids, onAdd }: AddUserFormProps) {
  const { t } = useTranslation()
  const { target, setTarget, isSubmitting, setIsSubmitting } = useUserSelection()
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'contributor' | 'viewer'>('viewer')

  const canAdd = !!target && target.uid !== ownerId && !uids.includes(target.uid)

  const handleAdd = async () => {
    if (!target || !canAdd) return

    try {
      setIsSubmitting(true)
      setError(null)
      await onAdd(target, role)
      setTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errorOccurred'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getErrorMessage = () => {
    if (!target) return null
    if (target.uid === ownerId) return t('common.cannotAddOwner')
    if (uids.includes(target.uid)) return t('common.userAlreadyHasAccess')
    return null
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="mt-4 rounded-xl p-3 bg-card border border-border">
      <div className="mb-2 text-xs font-medium text-muted-foreground">{t('common.addPerson')}</div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex-1">
          <UserAutocomplete onSelect={setTarget} />
        </div>
        <Select value={role} onValueChange={(value: 'contributor' | 'viewer') => setRole(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">{t('common.viewer')}</SelectItem>
            <SelectItem value="contributor">{t('common.contributor')}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          disabled={!canAdd || isSubmitting}
          onClick={handleAdd}
          className="h-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 px-4"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {isSubmitting ? t('common.addingUser') : t('common.add')}
        </Button>
      </div>
      {(error || errorMessage) && (
        <div className="mt-2 text-sm text-red-500">
          {error || errorMessage}
        </div>
      )}
    </div>
  )
}
