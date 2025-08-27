import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("gradient-bg rounded-xl border-dashed border-2 p-8 text-center", className)}>
      {icon && (
        <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <div className="text-lg font-medium mb-2">{title}</div>
      <div className="text-muted-foreground mb-4">{description}</div>
      {action}
    </div>
  )
}
