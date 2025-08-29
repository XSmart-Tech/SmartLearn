import type { ReactNode } from 'react'
import { Large, Small, H2, P } from '@/shared/ui'

interface PageHeaderProps {
  title: string
  description: string
  actions?: ReactNode
  className?: string
  wrapperClassName?: string
  titleComponent?: 'Large' | 'H2'
  descriptionComponent?: 'Small' | 'P'
}

export default function PageHeader({
  title,
  description,
  actions,
  className = '',
  wrapperClassName = '',
  titleComponent = 'Large',
  descriptionComponent = 'Small'
}: PageHeaderProps) {
  const TitleComponent = titleComponent === 'H2' ? H2 : Large
  const DescriptionComponent = descriptionComponent === 'P' ? P : Small

  const titleClassName = titleComponent === 'H2'
    ? "truncate text-foreground border-0 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent"

  const descriptionClassName = descriptionComponent === 'P'
    ? "text-muted-foreground truncate"
    : "block text-muted-foreground"

  return (
    <div className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ${wrapperClassName}`}>
      <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-card/50 via-card/30 to-card/50 backdrop-blur-sm border border-border/50 shadow-lg ${className}`}>
        <div className="flex-1 min-w-0 space-y-2">
          <TitleComponent className={`${titleClassName} font-bold tracking-tight`}>
            {title}
          </TitleComponent>
          <DescriptionComponent className={`${descriptionClassName} text-base leading-relaxed`}>
            {description}
          </DescriptionComponent>
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-3 sm:ml-4 md:ml-6 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-200">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
