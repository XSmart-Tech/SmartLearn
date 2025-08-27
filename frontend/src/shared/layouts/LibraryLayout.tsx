import { Container } from '@/shared/ui'
import { Outlet } from 'react-router-dom'

export default function LibraryLayout() {
  return (
    <Container>
      <Outlet />
    </Container>
  )
}
