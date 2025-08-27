import { Button } from '@/shared/ui'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Avatar, AvatarImage } from '@/shared/ui'
import { Link } from 'react-router-dom'

export default function Header() {
  const { user, signInGoogle, signOutApp } = useAuth()

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-card/70 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-md shadow-sm transition-transform group-hover:scale-105"
          />
          <span
            className="text-xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent tracking-tight group-hover:opacity-90 transition-opacity"
          >
            SmartLearn
          </span>
        </Link>

        {/* User / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border bg-card px-2 py-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName || 'User'}
                  />
                </Avatar>
                <span className="hidden max-w-[160px] truncate text-sm md:block">
                  {user.displayName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOutApp()}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => signInGoogle()} className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="h-4 w-4" aria-hidden="true" focusable="false">
                <path d="M533.5 278.4c0-17.7-1.4-35-4.2-51.6H272v97.7h147.1c-6.4 34.8-25 64.3-53.4 84v69.8h86.1c50.3-46.4 79.7-114.4 79.7-199.9z" fill="#4285F4" />
                <path d="M272 544.3c72.6 0 133.7-24.1 178.2-65.4l-86.1-69.8c-24 16.1-54.9 25.6-92.1 25.6-70.8 0-130.7-47.8-152.2-112.1H31.8v70.4C75.9 487 168.1 544.3 272 544.3z" fill="#34A853" />
                <path d="M119.8 324.7c-10.6-31.6-10.6-65.2 0-96.8V157.5H31.8C-18.7 219.4-18.6 324.7 31.8 386.6l88-61.9z" fill="#FBBC05" />
                <path d="M272 107.1c39.5 0 75 13.6 103 40.4l77.4-77.4C398.1 24.7 340.6 0 272 0 168.1 0 75.9 57.3 31.8 144.2l88 61.9C141.3 154.9 201.2 107.1 272 107.1z" fill="#EA4335" />
              </svg>
              <span>Đăng nhập</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
