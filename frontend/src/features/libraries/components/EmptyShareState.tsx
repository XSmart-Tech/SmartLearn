import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface EmptyShareStateProps {
  message?: string
  description?: string
}

export function EmptyShareState({
  message,
  description
}: EmptyShareStateProps) {
  const { t } = useTranslation()
  
  const displayMessage = message || t('common.notSharedYet')
  const displayDescription = description || t('common.addPeopleToShare')
  
  return (
    <div className="mt-3 rounded-xl border-dashed border border-border bg-card p-4 text-center">
      <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <div className="text-sm font-medium text-card-foreground">{displayMessage}</div>
      <div className="mt-1 text-xs text-muted-foreground">{displayDescription}</div>
    </div>
  )
}
