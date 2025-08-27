import { ShieldCheck } from 'lucide-react'

interface EmptyShareStateProps {
  message?: string
  description?: string
}

export function EmptyShareState({
  message = 'Chưa chia sẻ cho ai',
  description = 'Thêm người để cùng quản lý/thực hành thẻ.'
}: EmptyShareStateProps) {
  return (
    <div className="mt-3 rounded-xl border-dashed border border-border bg-card p-4 text-center">
      <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <div className="text-sm font-medium text-card-foreground">{message}</div>
      <div className="mt-1 text-xs text-muted-foreground">{description}</div>
    </div>
  )
}
