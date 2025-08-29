import { Container } from '@/shared/ui'
import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import Loader from '@/shared/ui/loader'

export default function LibraryLayout() {
  return (
    <Container className="max-w-full py-8">
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </div>
    </Container>
  )
}
