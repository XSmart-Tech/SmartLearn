import { Button } from './ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarImage } from './ui/avatar'

export default function Header() {
  const { user, signInGoogle, signOutApp } = useAuth()
  return (
    <header className="flex items-center justify-between border-b p-3">
      <div className="font-semibold">⚡ Flashcards</div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Avatar>
              <AvatarImage
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName || 'User'}
              />
            </Avatar>
            <span className="text-sm">{user.displayName}</span>
            <Button onClick={() => signOutApp()}>Đăng xuất</Button>
          </>
        ) : (
          <Button onClick={() => signInGoogle()}>Đăng nhập</Button>
        )}
      </div>
    </header>
  )
}