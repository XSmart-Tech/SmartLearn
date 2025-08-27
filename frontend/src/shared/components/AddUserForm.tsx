import { useState } from 'react'
import { Button } from '@/shared/ui'
import { Loader2, Plus } from 'lucide-react'
import UserAutocomplete from './UserAutocomplete'
import { useUserSelection } from '@/shared/hooks/useUserSelection'
import { DIALOG_TEXTS, STATUS_MESSAGES } from '@/shared/lib/constants'
import type { PublicUser } from '@/shared/lib/types'

interface AddUserFormProps {
  ownerId: string
  uids: string[]
  onAdd: (user: PublicUser) => Promise<void>
}

export function AddUserForm({ ownerId, uids, onAdd }: AddUserFormProps) {
  const { target, setTarget, isSubmitting, setIsSubmitting } = useUserSelection()
  const [error, setError] = useState<string | null>(null)

  const canAdd = !!target && target.uid !== ownerId && !uids.includes(target.uid)

  const handleAdd = async () => {
    if (!target || !canAdd) return

    try {
      setIsSubmitting(true)
      setError(null)
      await onAdd(target)
      setTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getErrorMessage = () => {
    if (!target) return null
    if (target.uid === ownerId) return 'Không thể thêm chủ sở hữu.'
    if (uids.includes(target.uid)) return 'Người này đã có quyền truy cập.'
    return null
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="mt-4 rounded-xl p-3 bg-card border border-border">
      <div className="mb-2 text-xs font-medium text-muted-foreground">Thêm người</div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex-1">
          <UserAutocomplete onSelect={setTarget} />
        </div>
        <Button
          disabled={!canAdd || isSubmitting}
          onClick={handleAdd}
          className="h-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 px-4"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {isSubmitting ? STATUS_MESSAGES.ADDING_USER : DIALOG_TEXTS.ADD}
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
