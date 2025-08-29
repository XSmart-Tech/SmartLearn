import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { Header, Footer } from '@/shared/components'
import { Loader, NavigationLoader } from '@/shared/ui'
import { Container } from '@/shared/ui'

export default function HomeLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      <main className="flex-1 flex flex-col">
        <Container className="flex-1 max-w-full px-4 md:px-6 py-8 md:py-12">
          <NavigationLoader />
          <Suspense fallback={<Loader />}>
            <div className="animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
              <Outlet />
            </div>
          </Suspense>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
