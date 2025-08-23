import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { user, signInGoogle } = useAuth()
  if (user) return <div>Đã đăng nhập</div>
  return (
    <div className="grid place-items-center"> <Button onClick={() => signInGoogle()}>Đăng nhập Google</Button> </div>
  )
}