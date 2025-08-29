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
import { BookOpen, Plus, Clock, TrendingUp } from 'lucide-react'

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
    <Container className="space-y-8">
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <PageHeader
          title={t('dashboard.title')}
          description={t('dashboard.welcome')}
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{recentLibraries.length}</p>
                <p className="text-sm text-muted-foreground">{t('dashboard.totalLibraries')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10 text-accent-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-foreground">0</p>
                <p className="text-sm text-muted-foreground">{t('dashboard.studySessions')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover:shadow-lg hover:shadow-success/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10 text-success">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">0%</p>
                <p className="text-sm text-muted-foreground">{t('dashboard.progress')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main row: Quick Actions + Recent libraries */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">

        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{t('dashboard.recentLibraries')}</CardTitle>
            </div>
            <CardDescription className="text-base">{t('dashboard.recentLibrariesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/50">
              {recentLibraries.map((lib, index) => (
                <li
                  key={lib.id}
                  className="py-4 flex items-center justify-between hover:bg-muted/30 rounded-lg px-3 -mx-3 transition-all duration-200 animate-in fade-in-0 slide-in-from-left-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate text-foreground hover:text-primary transition-colors duration-200">
                      {lib.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate mt-1">
                      {lib.description}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      {new Date(lib.updatedAt ?? lib.createdAt ?? 0).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/app/libraries/${lib.id}`)}
                      className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                    >
                      {t('dashboard.open')}
                    </Button>
                  </div>
                </li>
              ))}
              {recentLibraries.length === 0 && (
                <li className="py-8 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium mb-2">{t('dashboard.noRecentLibraries')}</div>
                  <div className="text-sm">{t('dashboard.getStarted')}</div>
                </li>
              )}
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              onClick={() => navigate('/app/libraries')}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {t('dashboard.goToLibraries')}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{t('dashboard.quickActions')}</CardTitle>
            </div>
            <CardDescription className="text-base">{t('dashboard.quickActionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <LibraryDialog
                mode="create"
                onCreate={onCreateLibrary}
                disabled={!uid}
              />
              <Button
                variant="outline"
                onClick={onStartStudy}
                className="w-full justify-start hover:bg-accent/50 hover:border-accent/50 transition-all duration-300 hover:scale-105"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {t('dashboard.startStudy')}
              </Button>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="text-sm text-muted-foreground italic">
                💡 {t('dashboard.tip')}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </Container>
  )
}
