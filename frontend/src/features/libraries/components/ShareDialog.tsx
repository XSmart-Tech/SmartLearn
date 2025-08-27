import { Dialog } from '@/shared/ui'
import { useUserSelection } from '@/shared/hooks/useUserSelection'
import { UserSelectionForm } from '@/shared/components/UserSelectionForm'
import { DialogActions } from '@/shared/ui/DialogActions'
import { validateUserSelection } from '@/shared/lib/validation'
import { DIALOG_TEXTS } from '@/shared/lib/constants'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  onShare?: (uid: string) => void
}

export default function ShareDialog({ open, onClose, onShare }: ShareDialogProps) {
  const { target, setTarget, isSubmitting, setIsSubmitting, reset } = useUserSelection()

  const handleShare = async () => {
    if (!target || !onShare) return

    try {
      setIsSubmitting(true)
      await onShare(target.uid)
      reset()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <div className="space-y-4">
        <UserSelectionForm
          target={target}
          onSelect={setTarget}
        />
        <DialogActions
          onCancel={handleClose}
          onSave={handleShare}
          canSave={validateUserSelection(target)}
          isSubmitting={isSubmitting}
          saveText={DIALOG_TEXTS.SAVE}
          cancelText={DIALOG_TEXTS.CANCEL}
          loadingText={DIALOG_TEXTS.LOADING}
        />
      </div>
    </Dialog>
  )
}
