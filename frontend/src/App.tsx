import AppRouter from './router'
import { useAuth } from '@/hooks/useAuth'

export default function App() {
	// start the auth listener as soon as the app mounts so Redux has the
	// current user before protected routes evaluate. This prevents a
	// flash/redirect to home when the page is reloaded while logged in.
	useAuth()

	return <AppRouter />
}