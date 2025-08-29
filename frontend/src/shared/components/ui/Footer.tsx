import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Facebook, Mail, Heart } from 'lucide-react'
import { Avatar, AvatarImage } from '@/shared/ui/avatar'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Muted } from '@/shared/ui/typography'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="relative mt-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      {/* Enhanced gradient border */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="bg-gradient-to-b from-card/80 via-card/60 to-card/40 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {/* Brand + Social */}
            <div className="space-y-6 lg:col-span-1">
              <Link to="/" className="group flex items-center gap-3 transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <Avatar className="ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                    <AvatarImage src="/logo.png" alt="SmartLearn" />
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent tracking-tight group-hover:opacity-90 transition-all duration-300 group-hover:from-violet-600 group-hover:via-fuchsia-600 group-hover:to-indigo-600">
                  SmartLearn
                </span>
              </Link>
              <Muted className="text-sm leading-relaxed max-w-sm">
                {t('common.footerDescription')}
              </Muted>
              <div className="flex items-center gap-3 pt-2">
                <Button asChild size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110">
                  <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="icon" variant="ghost" className="hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-300 hover:scale-110">
                  <a href="https://twitter.com/" target="_blank" rel="noreferrer" aria-label="Twitter">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="icon" variant="ghost" className="hover:bg-blue-600/10 hover:text-blue-600 transition-all duration-300 hover:scale-110">
                  <a href="https://facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="icon" variant="ghost" className="hover:bg-green-500/10 hover:text-green-500 transition-all duration-300 hover:scale-110">
                  <a href="mailto:hello@smartlearn.app" aria-label="Email">
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-4 lg:col-span-1">
              <h4 className="text-sm font-semibold tracking-wide text-foreground">{t('common.newsletterTitle')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('common.newsletterDescription')}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const data = new FormData(e.currentTarget)
                  alert(t('common.newsletterSuccess') + data.get('email'))
                  e.currentTarget.reset()
                }}
                className="flex gap-2"
              >
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  className="flex-1 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                />
                <Button
                  type="submit"
                  className="whitespace-nowrap bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105"
                  variant="default"
                >
                  {t('common.subscribe')}
                </Button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="space-y-4 lg:col-span-1">
              <h4 className="text-sm font-semibold tracking-wide text-foreground">{t('common.quickLinks')}</h4>
              <div className="grid grid-cols-2 gap-2">
                <FooterExt href="/app" label={t('navigation.dashboard')} />
                <FooterExt href="/app/libraries" label={t('navigation.libraries')} />
                <FooterExt href="/app/study" label={t('navigation.study')} />
                <FooterExt href="/app/settings" label={t('navigation.settings')} />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-border/50 pt-8 text-xs text-muted-foreground flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <p>© {year} SmartLearn. {t('common.allRightsReserved')}</p>
              <span className="text-primary animate-pulse">•</span>
              <p className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> for learning
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <FooterExt href="#" label={t('common.terms')} />
              <span aria-hidden>•</span>
              <FooterExt href="#" label={t('common.privacy')} />
              <span aria-hidden>•</span>
              <FooterExt href="#" label={t('common.contact')} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterExt({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative group"
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
    </a>
  )
}

