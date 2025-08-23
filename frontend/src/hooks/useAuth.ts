import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { setLoading, setUser } from '@/store/authSlice'
import { signInGoogle, signOutApp, watchAuth, ensureUserProfile } from '@/lib/firebase'
import { toast } from 'sonner'

export function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector((s: RootState) => s.auth.user)
  const status = useSelector((s: RootState) => s.auth.status)
  useEffect(() => {
    dispatch(setLoading())
    return watchAuth((u) => {
      // convert firebase User to a small serializable shape
      if (u) {
        const small = { uid: u.uid, email: u.email ?? null, displayName: u.displayName ?? null, photoURL: u.photoURL ?? null }
        dispatch(setUser(small))
        ensureUserProfile(u).catch(() => {})
      } else {
        dispatch(setUser(null))
      }
    })
  }, [dispatch])
  // wrap the raw firebase calls so we can show toast notifications on success/failure
  const signIn = async () => {
    try {
      await signInGoogle()
      toast.success('Đăng nhập thành công')
    } catch (err: unknown) {
      console.error('signInGoogle error', err)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Đăng nhập thất bại')
      throw err
    }
  }

  const signOut = async () => {
    try {
      await signOutApp()
      toast.success('Đăng xuất thành công')
    } catch (err: unknown) {
      console.error('signOutApp error', err)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Đăng xuất thất bại')
      throw err
    }
  }

  return { user, status, signInGoogle: signIn, signOutApp: signOut }
}