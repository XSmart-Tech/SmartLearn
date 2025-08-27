import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import Loader from '@/components/ui/loader'
import { toast } from 'sonner'

interface Props { children: React.ReactNode }

export default function RequireAuth({ children }: Props) {
	const location = useLocation()
	const user = useSelector((s: RootState) => s.auth.user)
	const status = useSelector((s: RootState) => s.auth.status)

	// While auth state is resolving, show a loader to avoid flicker/redirect.
	if (status === 'loading') return <Loader fullScreen />

	// If not logged in, redirect to login and preserve attempted location.
	if (!user) {
		toast.error('Bạn cần đăng nhập để truy cập trang này')
		return <Navigate to="/" state={{ from: location }} replace />
	}

	return <>{children}</>
}
