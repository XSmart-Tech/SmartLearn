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
    ? "truncate text-gray-900 dark:text-gray-100 border-0"
    : ""

  const descriptionClassName = descriptionComponent === 'P'
    ? "text-muted-foreground truncate"
    : "block text-muted-foreground"

  return (
    <div className={wrapperClassName}>
      <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 ${className}`}>
        <div className="flex-1 min-w-0">
          <TitleComponent className={titleClassName}>{title}</TitleComponent>
          <DescriptionComponent className={descriptionClassName}>
            {description}
          </DescriptionComponent>
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2 md:flex-wrap sm:ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
