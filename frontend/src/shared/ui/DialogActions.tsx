import { Button } from '@/shared/ui'

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
  cancelText = 'Hủy',
  saveText = 'Lưu',
  loadingText = 'Đang lưu...'
}: DialogActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
      <Button onClick={onCancel} variant="outline" disabled={isSubmitting}>
        {cancelText}
      </Button>
      <Button
        disabled={!canSave || isSubmitting}
        onClick={onSave}
        className="bg-gray-900 text-white disabled:opacity-50"
      >
        {isSubmitting ? loadingText : saveText}
      </Button>
    </div>
  )
}
