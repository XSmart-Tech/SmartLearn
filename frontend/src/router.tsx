import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomeLayout from '@/layouts/HomeLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import StudyLayout from '@/layouts/StudyLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const LibrariesPage = lazy(() => import('@/pages/LibrariesPage'))
const LibraryDetailPage = lazy(() => import('@/pages/LibraryDetailPage'))
const StudyPage = lazy(() => import('@/pages/StudyPage'))
const QuizPage = lazy(() => import('@/pages/QuizPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
  {
    path: '/app',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'libraries', element: <LibrariesPage /> },
      { path: 'libraries/:id', element: <LibraryDetailPage /> },
      { path: 'study', element: <StudyLayout />, children: [
        { index: true, element: <StudyPage /> },
        { path: 'quiz', element: <QuizPage /> }
      ] },
      { path: 'quiz', element: <QuizPage /> },
      { path: '*', element: <div className="p-4">Không tìm thấy trang</div> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
