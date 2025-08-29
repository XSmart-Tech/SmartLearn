import { H3, P } from '@/shared/ui'
import { BookOpen, Brain, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function HowItWorksSection() {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <H3 className="mb-3">Cách hoạt động</H3>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="mb-2 font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('home.createCard')}
          </div>
          <P className="text-muted-foreground">{t('home.createCardDescription')}</P>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-2 font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {t('home.srsStudy')}
          </div>
          <P className="text-muted-foreground">{t('home.srsDescription')}</P>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-2 font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            {t('home.sharing')}
          </div>
          <P className="text-muted-foreground">{t('home.sharingDescription')}</P>
        </div>
      </div>
    </div>
  )
}
