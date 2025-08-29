import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { Header, Footer } from '@/shared/components'
import { Loader, NavigationLoader } from '@/shared/ui'
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
