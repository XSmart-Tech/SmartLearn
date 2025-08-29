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
import { useFormSubmission } from '@/shared/hooks'
import { ValidatedInput } from '@/shared/components'
import { validateLibraryName } from '@/shared/lib/validation'
import type { Library } from '@/shared/lib/types'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
    const validation = validateLibraryName(trimmedName, t)
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
  }, [name, description, mode, library, onCreate, onUpdate, t])

  const { submit, isSubmitting } = useFormSubmission(handleSubmit)

  const isValid = validateLibraryName(name.trim(), t).isValid

  return (
    <Dialog>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button disabled={disabled}>{t('common.createLibrary')} {t('common.add')}</Button>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('common.createLibrary') : t('common.editLibrary')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('common.enterLibraryDetails')
              : t('common.updateLibraryDetails')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ValidatedInput
            value={name}
            onChange={setName}
            placeholder={t('common.libraryName')}
            label={t('common.libraryName')}
            validator={validateLibraryName}
            required
            autoFocus
          />
          <ValidatedInput
            value={description}
            onChange={setDescription}
            placeholder={t('common.libraryDescriptionOptional')}
            label={t('common.libraryDescription')}
            type="textarea"
            rows={3}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={submit}
              disabled={disabled || !isValid || isSubmitting}
            >
              {isSubmitting
                ? (mode === 'create' ? t('common.creatingLibrary') : t('common.updatingLibrary'))
                : (mode === 'create' ? t('common.create') : t('common.edit'))
              }
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
