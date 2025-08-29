import { Link } from 'react-router-dom'
import { Container } from '@/shared/ui'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <Container>
      <h1 className="text-2xl font-bold mb-2">{t('common.pageNotFound')}</h1>
      <p className="mb-4">{t('common.pageNotFoundDescription')}</p>
      <div className="flex gap-4">
        <Link to="/" className="text-primary-600 underline">{t('common.backToHome')}</Link>
        <Link to="/app/settings" className="text-primary-600 underline">{t('common.goToSettings')}</Link>
      </div>
    </Container>
  )
}
