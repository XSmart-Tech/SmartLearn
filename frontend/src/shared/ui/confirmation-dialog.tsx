import { Button } from '@/shared/ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui'
import { useTranslation } from 'react-i18next'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: 'alert' | 'dialog'
  destructive?: boolean
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  variant = 'alert',
  destructive = true,
}: ConfirmationDialogProps) {
  const { t } = useTranslation()

  const defaultConfirmText = confirmText ?? t('common.delete')
  const defaultCancelText = cancelText ?? t('common.cancel')
  if (variant === 'alert') {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">{defaultCancelText}</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
                {defaultConfirmText}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>{defaultCancelText}</Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm}>{defaultConfirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
