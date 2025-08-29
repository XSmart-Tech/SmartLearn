import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Container,
} from '@/shared/ui'
import LibraryDialog from '@/features/libraries/components/LibraryDialog'
import { PageHeader } from '@/shared/components'
import { useDashboardLogic } from '../hooks/useDashboardLogic'
import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation()
  const {
    recentLibraries,
    uid,
    onCreateLibrary,
    onStartStudy,
    navigate
  } = useDashboardLogic()

  return (
    <Container className="space-y-4">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.welcome')}
      />

      {/* Main row: Quick Actions + Recent libraries */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.recentLibraries')}</CardTitle>
            <CardDescription>{t('dashboard.recentLibrariesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {recentLibraries.map((lib) => (
                <li key={lib.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{lib.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{lib.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">{new Date(lib.updatedAt ?? lib.createdAt ?? 0).toLocaleDateString()}</div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/app/libraries/${lib.id}`)}>{t('dashboard.open')}</Button>
                  </div>
                </li>
              ))}
              {recentLibraries.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">{t('dashboard.noRecentLibraries')}</li>
              )}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/app/libraries')}>{t('dashboard.goToLibraries')}</Button>
          </CardFooter>
        </Card>
        <Card className="shadow lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            <CardDescription>{t('dashboard.quickActionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-wrap">
              <LibraryDialog mode="create" onCreate={onCreateLibrary} disabled={!uid} />
              <Button variant="ghost" onClick={onStartStudy}>{t('dashboard.startStudy')}</Button>
            </div>
            <div className="text-sm text-muted-foreground">{t('dashboard.tip')}</div>
          </CardContent>
        </Card>


      </section>
    </Container>
  )
}
