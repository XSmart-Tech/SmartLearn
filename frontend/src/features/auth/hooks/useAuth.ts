import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/shared/store'
import { setLoading, setUser } from '@/shared/store/authSlice'
import { signInGoogle, signOutApp, watchAuth, ensureUserProfile } from '@/shared/lib/firebase'
import { toast } from 'sonner'
// import { useNavigate } from 'react-router-dom'

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
      toast.success('\u0110\u0103ng nh\u1eadp th\u00e0nh c\u00f4ng')
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
  // Note: navigation after sign-out should be handled by the caller (router
  // context may not be available when this hook is used at app root).
    } catch (err: unknown) {
      console.error('signOutApp error', err)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Đăng xuất thất bại')
      throw err
    }
  }

  return { user, status, signInGoogle: signIn, signOutApp: signOut }
}
