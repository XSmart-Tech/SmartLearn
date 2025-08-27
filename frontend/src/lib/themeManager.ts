import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export default function ThemeManager(): null {
  const theme = useSelector((s: RootState) => s.theme.mode)

  useEffect(() => {
    const root = document.documentElement
    const apply = (mode: string) => {
      if (mode === 'system') {
        // Mirror system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
        root.classList.toggle('light', !prefersDark)
        root.style.colorScheme = prefersDark ? 'dark' : 'light'
        try { localStorage.setItem('theme', 'system') } catch (err) { console.error('persist theme', err) }
      } else {
        root.classList.toggle('dark', mode === 'dark')
        root.classList.toggle('light', mode === 'light')
        root.style.colorScheme = mode === 'dark' ? 'dark' : 'light'
        try { localStorage.setItem('theme', mode) } catch (err) { console.error('persist theme', err) }
      }
    }

    apply(theme)

    // if system, listen to changes
    let m: MediaQueryList | null = null
    if (theme === 'system') {
      m = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e?: MediaQueryListEvent) => { void e; apply('system') }
      // helper type for older browsers' API (avoid `any` to satisfy linter)
      type LegacyMediaQueryList = {
        addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void | null
        removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void | null
      }
      const legacy = m as unknown as LegacyMediaQueryList

      // modern
  if (m.addEventListener) m.addEventListener('change', handler)
  else legacy.addListener?.call(m, handler)

      return () => {
        if (m) {
          const legacyRem = m as unknown as LegacyMediaQueryList
          if (m.removeEventListener) m.removeEventListener('change', handler)
          else legacyRem.removeListener?.call(m, handler)
        }
      }
    }

    return undefined
  }, [theme])

  return null
}
