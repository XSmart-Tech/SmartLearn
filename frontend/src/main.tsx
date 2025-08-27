import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import './index.css'
import { Toaster } from '@/components/ui'
import ThemeManager from './lib/themeManager'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeManager />
      <App />
      <Toaster />
    </Provider>
  </StrictMode>
)