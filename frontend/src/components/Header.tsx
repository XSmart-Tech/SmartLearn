import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarImage } from '@/components/ui'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Header() {
  const { user, signInGoogle, signOutApp } = useAuth()
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-card/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md p-2 gradient-bg text-primary-foreground shadow-sm">⚡</div>
            <div className="font-semibold text-lg">Flashcards</div>
          </Link>
        </div>

        <div className="hidden flex-1 items-center gap-3 md:flex">
          <div className="relative flex w-full max-w-lg items-center rounded-lg border border-border bg-input px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Tìm thư viện, thẻ, hoặc chủ đề..."
              className="w-full bg-transparent text-sm placeholder:opacity-70 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full bg-card p-1">
                <Avatar>
                  <AvatarImage
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName || 'User'}
                  />
                </Avatar>
                <span className="hidden text-sm md:block">{user.displayName}</span>
              </div>
              <Button variant="ghost" onClick={() => signOutApp()}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button onClick={() => signInGoogle()}>Đăng nhập</Button>
          )}
        </div>
      </div>
    </header>
  )
}