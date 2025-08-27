import { createHashRouter, RouterProvider, type RouteMatch } from 'react-router-dom'
import { Suspense } from 'react'
import { store } from '@/shared/store'
import Loader from '@/shared/ui/loader'
import RequireAuth from '@/features/auth/components/RequireAuth'


function ErrorElement({ error }: { error?: unknown }) {
  console.error('route error', error)
  return <div className="p-6">Đã có lỗi xảy ra: {String(error ?? 'Unknown')}</div>
}
const router = createHashRouter([
  {
    path: '/',
    lazy: () => import('@/shared/layouts/HomeLayout').then(m => ({ element: <m.default /> })),
    errorElement: <ErrorElement />,
    children: [
      { index: true, lazy: () => import('@/features/home/pages/HomePage').then(m => ({ element: <m.default /> })) },
    ],
  },
  // Catch-all for any unmatched route at the root level
  { path: '*', lazy: () => import('@/shared/pages/NotFoundPage').then(m => ({ element: <m.default /> })), errorElement: <ErrorElement /> },
  {
    path: '/app',
    lazy: () => import('@/shared/layouts/DashboardLayout').then(m => ({ element: <m.default /> })),
    handle: { crumb: 'App' },
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        lazy: () => import('@/features/dashboard/pages/DashboardPage').then(m => ({ element: <RequireAuth><m.default /></RequireAuth> })),
        handle: { crumb: 'Dashboard' },
      },
      {
        path: 'libraries',
        lazy: () => import('@/shared/layouts/LibraryLayout').then(m => ({ element: <RequireAuth><m.default /></RequireAuth> })),
        handle: { crumb: 'Libraries' },
        children: [
          { index: true, lazy: () => import('@/features/libraries/pages/LibrariesPage').then(m => ({ element: <RequireAuth><m.default /></RequireAuth> })) },
          {
            path: ':id',
            lazy: () => import('@/features/libraries/pages/LibraryDetailPage').then(m => ({ element: <RequireAuth><m.default /></RequireAuth> })),
            handle: {
              crumb: (match: RouteMatch) => {
                const id = match.params.id as string | undefined
                if (!id) return 'Thư viện'
                try {
                  const state = store.getState()
                  const lib = state.libraries?.items?.[id]
                  return lib?.name ?? 'Thư viện'
                } catch {
                  return `Library ${id}`
                }
              }
            },
          },
        ],
      },
      {
        path: 'study',
        lazy: () => import('@/shared/layouts/StudyLayout').then(m => ({ element: <RequireAuth><m.default /></RequireAuth> })),
        handle: { crumb: 'Study' },
        children: [
          { index: true, lazy: () => import('@/features/study/pages/StudyPage').then(m => ({ element: <m.default /> })), handle: { crumb: 'Session' } },
          { path: 'quiz', lazy: () => import('@/features/quiz/pages/QuizPage').then(m => ({ element: <m.default /> })), handle: { crumb: 'Quiz' } }
        ]
      },
      {
        path: 'quiz',
        lazy: () => import('@/features/quiz/pages/QuizPage').then(m => ({ element: <RequireAuth><m.default /></RequireAuth> })),
        handle: { crumb: 'Quiz' },
      },
      {
        path: 'settings',
        lazy: () => import('@/features/settings/pages/SettingsPage').then(m => ({ element: <RequireAuth><m.default /></RequireAuth> })),
        handle: { crumb: 'Settings' },
      },
      { path: '*', element: <div className="p-4">Không tìm thấy trang</div> },
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
