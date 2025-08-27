import { Outlet } from 'react-router-dom'
import { Container } from '@/shared/ui'

export default function StudyLayout() {
  return (
      <Container>
        <Outlet />
      </Container>
  )
}
