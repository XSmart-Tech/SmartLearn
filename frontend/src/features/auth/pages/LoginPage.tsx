import { Button, Container } from '@/shared/ui'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function LoginPage() {
  const { user, signInGoogle } = useAuth()
  if (user) return <Container>Đã đăng nhập</Container>
  return (
    <Container className="grid place-items-center">
      <Button onClick={() => signInGoogle()}>Đăng nhập Google</Button>
    </Container>
  )
}
