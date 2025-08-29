import { Button } from '@/shared/ui'
import { useTranslation } from 'react-i18next'

interface DialogActionsProps {
  onCancel: () => void
  onSave: () => void
  canSave: boolean
  isSubmitting?: boolean
  cancelText?: string
  saveText?: string
  loadingText?: string
}

export function DialogActions({
  onCancel,
  onSave,
  canSave,
  isSubmitting = false,
  cancelText,
  saveText,
  loadingText
}: DialogActionsProps) {
  const { t } = useTranslation()

  const defaultCancelText = cancelText ?? t('common.cancel')
  const defaultSaveText = saveText ?? t('common.save')
  const defaultLoadingText = loadingText ?? t('common.loadingSave')

  return (
    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
      <Button onClick={onCancel} variant="outline" disabled={isSubmitting}>
        {defaultCancelText}
      </Button>
      <Button
        disabled={!canSave || isSubmitting}
        onClick={onSave}
        className="bg-primary text-primary-foreground disabled:opacity-50"
      >
        {isSubmitting ? defaultLoadingText : defaultSaveText}
      </Button>
    </div>
  )
}
