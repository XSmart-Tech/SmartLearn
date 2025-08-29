import { Dialog } from '@/shared/ui'
import { useUserSelection } from '@/shared/hooks'
import { UserSelectionForm } from '@/shared/components'
import { DialogActions } from '@/shared/ui/DialogActions'
import { validateUserSelection } from '@/shared/lib/validation'
import { useTranslation } from 'react-i18next'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  onShare?: (uid: string) => void
}

export default function ShareDialog({ open, onClose, onShare }: ShareDialogProps) {
  const { target, setTarget, isSubmitting, setIsSubmitting, reset } = useUserSelection()
  const { t } = useTranslation()

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
          saveText={t('common.save')}
          cancelText={t('common.cancel')}
          loadingText={t('common.processing')}
        />
      </div>
    </Dialog>
  )
}
