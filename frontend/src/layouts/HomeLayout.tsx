import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Loader from '@/components/ui/loader'
import NavigationLoader from '@/components/ui/navigation-loader'
import Footer from '@/components/Footer'

export default function HomeLayout() {
  return (
    <div className="min-h-full grid grid-rows-[auto,1fr]">
      <Header />
      <main className="p-4">
        <NavigationLoader />
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}