import { H3, P } from '@/shared/ui'
import { BookOpen, Brain, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function FeaturesSection() {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <H3 className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 icon-home" /> {t('home.createLibrary')}
        </H3>
        <P className="mt-1 text-muted-foreground">{t('home.createLibraryDescription')}</P>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <H3 className="flex items-center gap-2">
          <Brain className="h-5 w-5 icon-brain" /> {t('home.effectiveLearning')}
        </H3>
        <P className="mt-1 text-muted-foreground">{t('home.effectiveLearningDescription')}</P>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <H3 className="flex items-center gap-2">
          <Share2 className="h-5 w-5 icon-refresh" /> {t('home.flexibleCollaboration')}
        </H3>
        <P className="mt-1 text-muted-foreground">{t('home.collaborationDescription')}</P>
      </div>
    </div>
  )
}
