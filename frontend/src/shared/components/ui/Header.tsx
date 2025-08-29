import { Button } from '@/shared/ui'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, LogOut } from 'lucide-react'

export default function Header() {
  const { user, signInGoogle, signOutApp } = useAuth()
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-3 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent tracking-tight group-hover:opacity-90 transition-all duration-300 group-hover:from-violet-600 group-hover:via-fuchsia-600 group-hover:to-indigo-600">
            SmartLearn
          </span>
        </Link>

        {/* User / Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:bg-card/70">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                  <AvatarImage
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
                    {user.displayName}
                  </span>
                  <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {user.email}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOutApp()}
                className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => signInGoogle()}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="h-4 w-4" aria-hidden="true" focusable="false">
                <path d="M533.5 278.4c0-17.7-1.4-35-4.2-51.6H272v97.7h147.1c-6.4 34.8-25 64.3-53.4 84v69.8h86.1c50.3-46.4 79.7-114.4 79.7-199.9z" fill="currentColor" />
                <path d="M272 544.3c72.6 0 133.7-24.1 178.2-65.4l-86.1-69.8c-24 16.1-54.9 25.6-92.1 25.6-70.8 0-130.7-47.8-152.2-112.1H31.8v70.4C75.9 487 168.1 544.3 272 544.3z" fill="currentColor" />
                <path d="M119.8 324.7c-10.6-31.6-10.6-65.2 0-96.8V157.5H31.8C-18.7 219.4-18.6 324.7 31.8 386.6l88-61.9z" fill="currentColor" />
                <path d="M272 107.1c39.5 0 75 13.6 103 40.4l77.4-77.4C398.1 24.7 340.6 0 272 0 168.1 0 75.9 57.3 31.8 144.2l88 61.9C141.3 154.9 201.2 107.1 272 107.1z" fill="currentColor" />
              </svg>
              <span className="font-medium">{t('auth.login')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
