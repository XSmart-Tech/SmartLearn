import { Card, CardContent, H1, P } from '@/shared/ui'
import { ArrowRight, Brain, Zap, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HeroSectionProps {
  onGoToDashboard: () => void
  onGoToLibraries: () => void
}

export function HeroSection({ onGoToDashboard, onGoToLibraries }: HeroSectionProps) {
  const { t } = useTranslation()

  return (
    <Card className="rounded-2xl border bg-card/70 p-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <H1 className="text-left leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                {t('home.heroTitle')}
              </span>
            </H1>
            <P className="mt-3 text-left text-muted-foreground">
              {t('home.description')}
            </P>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5" /> {t('home.offlineFeature')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <Brain className="h-3.5 w-3.5" /> {t('home.srsFeature')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <Share2 className="h-3.5 w-3.5" /> {t('home.realtimeFeature')}
              </span>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onGoToDashboard}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t('home.startLearning')} <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onGoToLibraries}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                {t('common.viewLibraries')}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
