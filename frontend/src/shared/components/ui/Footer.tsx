import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Facebook, Mail } from 'lucide-react'
import { Avatar, AvatarImage } from '@/shared/ui/avatar'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Muted } from '@/shared/ui/typography'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="relative mt-12">
      {/* viền gradient mảnh */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="bg-card/70 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 border-t">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Brand + Social */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/logo.png" alt="SmartLearn" />
                </Avatar>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                  SmartLearn
                </span>
              </Link>
              <Muted className="text-sm leading-relaxed max-w-sm">
                {t('common.footerDescription')}
              </Muted>
              <div className="flex items-center gap-2 pt-1">
                <Button asChild size="icon" variant="ghost">
                  <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="icon" variant="ghost">
                  <a href="https://twitter.com/" target="_blank" rel="noreferrer" aria-label="Twitter">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="icon" variant="ghost">
                  <a href="https://facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="icon" variant="ghost">
                  <a href="mailto:hello@smartlearn.app" aria-label="Email">
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Newsletter */}
            <div className="grid gap-3">
              <h4 className="text-sm font-semibold tracking-wide">{t('common.newsletterTitle')}</h4>
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
                <Input name="email" type="email" required placeholder="you@domain.com" />
                <Button type="submit" className="whitespace-nowrap" variant="default">
                  {t('common.subscribe')}
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 border-t pt-6 text-xs text-muted-foreground flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© {year} SmartLearn. {t('common.allRightsReserved')}</p>
            <div className="flex flex-wrap items-center gap-3">
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
      className="text-sm text-muted-foreground hover:text-foreground transition"
    >
      {label}
    </a>
  )
}

