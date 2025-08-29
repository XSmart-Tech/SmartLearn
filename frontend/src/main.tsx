import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './shared/store'
import App from './App'
import './index.css'
import './i18n'
import ThemeManager from './shared/lib/themeManager'

const Toaster = lazy(() => import('@/shared/ui').then(m => ({ default: m.Toaster })))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeManager />
      <App />
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
    </Provider>
  </StrictMode>
)
