import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { setLoading, setUser } from '@/store/authSlice'
import { signInGoogle, signOutApp, watchAuth, ensureUserProfile } from '@/lib/firebase'

export function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector((s: RootState) => s.auth.user)
  const status = useSelector((s: RootState) => s.auth.status)
  useEffect(() => {
    dispatch(setLoading())
    return watchAuth((u) => {
      dispatch(setUser(u))
      if (u) ensureUserProfile(u).catch(() => {})
    })
  }, [dispatch])
  return { user, status, signInGoogle, signOutApp }
}