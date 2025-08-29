import { createHashRouter, RouterProvider, type RouteMatch } from 'react-router-dom'
import { Suspense } from 'react'
import { store } from '@/shared/store'
import Loader from '@/shared/ui/loader'
import RequireAuth from '@/features/auth/components/RequireAuth'
import { useTranslation } from 'react-i18next'
import NotFoundPage from '@/shared/pages/NotFoundPage'
import {
  HomePage,
  DashboardPage,
  LibrariesPage,
  LibraryDetailPage,
  StudyPage,
  QuizPage,
  SettingsPage,
  HomeLayout,
  DashboardLayout,
  LibraryLayout,
  StudyLayout
} from '@/shared/lib/lazyComponents'


function ErrorElement({ error }: { error?: unknown }) {
  const { t } = useTranslation()
  console.error('route error', error)
  return <div className="p-6">{t('common.errorOccurred', { error: String(error ?? 'Unknown') })}</div>
}


const router = createHashRouter([
  {
    path: '/',
    lazy: () => Promise.resolve({ element: <HomeLayout /> }),
    errorElement: <ErrorElement />,
    children: [
      { index: true, lazy: () => Promise.resolve({ element: <HomePage /> }) },
    ],
  },
  // Catch-all for any unmatched route at the root level
  { path: '*', lazy: () => Promise.resolve({ element: <NotFoundPage /> }), errorElement: <ErrorElement /> },
  {
    path: '/app',
    lazy: () => Promise.resolve({ element: <DashboardLayout /> }),
    handle: { crumb: 'app' },
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        lazy: () => Promise.resolve({ element: <RequireAuth><DashboardPage /></RequireAuth> }),
        handle: { crumb: 'dashboard' },
      },
      {
        path: 'libraries',
        lazy: () => Promise.resolve({ element: <RequireAuth><LibraryLayout /></RequireAuth> }),
        handle: { crumb: 'libraries' },
        children: [
          { index: true, lazy: () => Promise.resolve({ element: <RequireAuth><LibrariesPage /></RequireAuth> }) },
          {
            path: 'demo',
            lazy: () => import('@/features/libraries/pages/LibrariesDemoPage').then(module => ({ element: <RequireAuth><module.default /></RequireAuth> })),
            handle: { crumb: 'demo' },
          },
          {
            path: 'showcase',
            lazy: () => import('@/features/libraries/pages/ComponentsShowcasePage').then(module => ({ element: <RequireAuth><module.default /></RequireAuth> })),
            handle: { crumb: 'showcase' },
          },
          {
            path: ':id',
            lazy: () => Promise.resolve({ element: <RequireAuth><LibraryDetailPage /></RequireAuth> }),
            handle: {
              crumb: (match: RouteMatch) => {
                const id = match.params.id as string | undefined
                if (!id) return 'library'
                try {
                  const state = store.getState()
                  const lib = state.libraries?.items?.[id]
                  return lib?.name ?? 'library'
                } catch {
                  return 'library'
                }
              }
            },
          },
        ],
      },
      {
        path: 'study',
        lazy: () => Promise.resolve({ element: <RequireAuth><StudyLayout /></RequireAuth> }),
        handle: { crumb: 'study' },
        children: [
          { index: true, lazy: () => Promise.resolve({ element: <StudyPage /> }), handle: { crumb: 'session' } },
          { path: 'quiz', lazy: () => Promise.resolve({ element: <QuizPage /> }), handle: { crumb: 'quiz' } }
        ]
      },
      {
        path: 'quiz',
        lazy: () => Promise.resolve({ element: <RequireAuth><QuizPage /></RequireAuth> }),
        handle: { crumb: 'quiz' },
      },
      {
        path: 'settings',
        lazy: () => Promise.resolve({ element: <RequireAuth><SettingsPage /></RequireAuth> }),
        handle: { crumb: 'settings' },
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function AppRouter() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
