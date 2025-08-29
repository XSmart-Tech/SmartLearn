import { useState } from 'react'

export function useDialogState(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen)

  const openDialog = () => setOpen(true)
  const closeDialog = () => setOpen(false)
  const toggleDialog = () => setOpen(prev => !prev)

  return {
    open,
    setOpen,
    openDialog,
    closeDialog,
    toggleDialog
  }
}
