import { useCallback, useState, useEffect } from 'react'
import { Button } from '@/shared/ui'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/ui/dialog'
import { useFormSubmission } from '@/shared/hooks/useFormSubmission'
import { ValidatedInput } from '@/shared/components/ValidatedInput'
import { validateLibraryName } from '@/shared/lib/validation'
import { DIALOG_TEXTS, STATUS_MESSAGES } from '@/shared/lib/constants'
import type { Library } from '@/shared/lib/types'

interface LibraryDialogProps {
  mode: 'create' | 'edit'
  library?: Library
  onCreate?: (name: string, description?: string) => Promise<void> | void
  onUpdate?: (id: string, name: string, description: string) => Promise<void> | void
  disabled?: boolean
  children?: React.ReactNode
}

export default function LibraryDialog({
  mode,
  library,
  onCreate,
  onUpdate,
  disabled,
  children,
}: LibraryDialogProps) {
  const [name, setName] = useState(mode === 'edit' ? library?.name || '' : '')
  const [description, setDescription] = useState(mode === 'edit' ? library?.description || '' : '')

  useEffect(() => {
    if (mode === 'edit' && library) {
      setName(library.name)
      setDescription(library.description ?? '')
    } else if (mode === 'create') {
      setName('')
      setDescription('')
    }
  }, [mode, library])

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim()
    const validation = validateLibraryName(trimmedName)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    if (mode === 'create' && onCreate) {
      await onCreate(trimmedName, description.trim() || undefined)
      setName('')
      setDescription('')
    } else if (mode === 'edit' && library && onUpdate) {
      await onUpdate(library.id, trimmedName, description.trim())
    }
  }, [name, description, mode, library, onCreate, onUpdate])

  const { submit, isSubmitting } = useFormSubmission(handleSubmit)

  const isValid = validateLibraryName(name.trim()).isValid

  return (
    <Dialog>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button disabled={disabled}>{DIALOG_TEXTS.CREATE} thư viện</Button>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo thư viện mới' : 'Chỉnh sửa thư viện'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Nhập tên thư viện và mô tả (tùy chọn).'
              : 'Cập nhật tên và mô tả thư viện.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ValidatedInput
            value={name}
            onChange={setName}
            placeholder="Tên thư viện"
            label="Tên thư viện"
            validator={validateLibraryName}
            required
            autoFocus
          />
          <ValidatedInput
            value={description}
            onChange={setDescription}
            placeholder="Mô tả thư viện (tùy chọn)"
            label="Mô tả thư viện"
            type="textarea"
            rows={3}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{DIALOG_TEXTS.CANCEL}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={submit}
              disabled={disabled || !isValid || isSubmitting}
            >
              {isSubmitting
                ? (mode === 'create' ? STATUS_MESSAGES.CREATING_LIBRARY : STATUS_MESSAGES.UPDATING_LIBRARY)
                : (mode === 'create' ? DIALOG_TEXTS.CREATE : DIALOG_TEXTS.UPDATE)
              }
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
