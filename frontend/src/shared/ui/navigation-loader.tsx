import { useNavigation } from 'react-router-dom'
import Loader from './loader'

export default function NavigationLoader() {
  const nav = useNavigation?.()
  const state = (nav && typeof nav === 'object' && 'state' in nav) ? (nav as { state: string }).state : null
  if (!state) return null
  if (state === 'loading' || state === 'submitting') {
    return <Loader fullScreen />
  }

  return null
}
