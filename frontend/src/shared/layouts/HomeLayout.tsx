import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import Header from '@/shared/components/Header'
import Loader from '@/shared/ui/loader'
import NavigationLoader from '@/shared/ui/navigation-loader'
import Footer from '@/shared/components/Footer'
import { Container } from '@/shared/ui'

export default function HomeLayout() {
  return (
    <div className="min-h-full grid grid-rows-[auto,1fr]">
      <Header />
      <Container>
        <NavigationLoader />
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </Container>
      <Footer />
    </div>
  )
}
