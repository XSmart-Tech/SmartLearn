import { Card, Small } from '@/shared/ui'
import { useTranslation } from 'react-i18next'

export function StatsSection() {
  const { t } = useTranslation()

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Card className="rounded-xl border p-4 text-center">
        <div className="text-2xl font-semibold">5 phút</div>
        <Small className="text-muted-foreground">{t('home.createCardsTime')}</Small>
      </Card>
      <Card className="rounded-xl border p-4 text-center">
        <div className="text-2xl font-semibold">3 phút/ngày</div>
        <Small className="text-muted-foreground">{t('home.dailyReview')}</Small>
      </Card>
      <Card className="rounded-xl border p-4 text-center">
        <div className="text-2xl font-semibold">Realtime</div>
        <Small className="text-muted-foreground">{t('home.smoothCollaboration')}</Small>
      </Card>
      <Card className="rounded-xl border p-4 text-center">
        <div className="text-2xl font-semibold">Offline</div>
        <Small className="text-muted-foreground">vẫn hoạt động ổn định</Small>
      </Card>
    </div>
  )
}
