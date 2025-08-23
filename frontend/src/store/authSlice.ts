import { createSlice } from '@reduxjs/toolkit'
import type { User } from 'firebase/auth'

interface AuthState { user: User | null; status: 'idle'|'loading'|'ready' }
const initial: AuthState = { user: null, status: 'idle' }

const slice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    setUser(s, a: { payload: User | null }) { s.user = a.payload; s.status = 'ready' },
    setLoading(s) { s.status = 'loading' },
  },
})

export const { setUser, setLoading } = slice.actions
export default slice.reducer