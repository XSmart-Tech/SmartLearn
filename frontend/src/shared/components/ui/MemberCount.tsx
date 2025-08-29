interface MemberCountProps {
  count: number
  showOwnerBadge?: boolean
}

import { useTranslation } from 'react-i18next'

export function MemberCount({ count, showOwnerBadge = true }: MemberCountProps) {
  const { t } = useTranslation()
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground border-border bg-card">
          {t('common.memberCount', { count })}
        </span>
        {showOwnerBadge && (
          <span className="hidden rounded-full px-2 py-0.5 text-xs bg-primary text-primary-foreground md:inline">
            {t('common.ownerBadge')}
          </span>
        )}
      </div>
    </div>
  )
}
