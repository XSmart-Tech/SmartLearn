import { H3, P } from '@/shared/ui'
import { useTranslation } from 'react-i18next'

interface CallToActionSectionProps {
  onGoToDashboard: () => void
  onGoToLibraries: () => void
}

export function CallToActionSection({ onGoToDashboard, onGoToLibraries }: CallToActionSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl border bg-gradient-to-r from-muted to-accent/20 p-6 text-center">
      <H3>{t('home.readyToStart')}</H3>
      <P className="text-muted-foreground">{t('home.gettingStarted')}</P>
      <div className="mt-3 flex justify-center gap-2">
        <button
          onClick={onGoToDashboard}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('home.start')}
        </button>
        <button
          onClick={onGoToLibraries}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          {t('home.browseLibraries')}
        </button>
      </div>
    </div>
  )
}
