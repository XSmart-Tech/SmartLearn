import { lazy } from 'react'

// Lazy load feature components
export const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
export const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
export const LibrariesPage = lazy(() => import('@/features/libraries/pages/LibrariesPage'))
export const LibraryDetailPage = lazy(() => import('@/features/libraries/pages/LibraryDetailPage'))
export const StudyPage = lazy(() => import('@/features/study/pages/StudyPage'))
export const QuizPage = lazy(() => import('@/features/quiz/pages/QuizPage'))
export const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))

// Lazy load layouts
export const HomeLayout = lazy(() => import('@/shared/layouts/HomeLayout'))
export const DashboardLayout = lazy(() => import('@/shared/layouts/DashboardLayout'))
export const LibraryLayout = lazy(() => import('@/shared/layouts/LibraryLayout'))
export const StudyLayout = lazy(() => import('@/shared/layouts/StudyLayout'))

// Lazy load shared components
export const Toaster = lazy(() => import('@/shared/ui').then(m => ({ default: m.Toaster })))
