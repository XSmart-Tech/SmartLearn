import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'
import { Container } from '@/shared/ui'
import { HeroSection } from '../components/HeroSection'
import { StatsSection } from '../components/StatsSection'
import { HowItWorksSection } from '../components/HowItWorksSection'
import { FAQSection } from '../components/FAQSection'
import { CallToActionSection } from '../components/CallToActionSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  function goIfAuth(path: string, message: string) {
    if (!user) {
      toast(message)
      return
    }
    navigate(path)
  }

  const handleGoToDashboard = () => goIfAuth('/app', t('common.loginRequiredDashboard'))
  const handleGoToLibraries = () => goIfAuth('/app/libraries', t('common.loginRequiredLibraries'))

  return (
    <Container size="xl" padding="md" className="relative space-y-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent),radial-gradient(60%_40%_at_80%_10%,rgba(16,185,129,0.16),transparent)]"
        aria-hidden="true"
      />

      <HeroSection
        onGoToDashboard={handleGoToDashboard}
        onGoToLibraries={handleGoToLibraries}
      />

      <StatsSection />

      <HowItWorksSection />

      <FAQSection />

      <CallToActionSection
        onGoToDashboard={handleGoToDashboard}
        onGoToLibraries={handleGoToLibraries}
      />

      <FeaturesSection />
    </Container>
  )
}
