import { createSlice } from '@reduxjs/toolkit'

// Keep only a small, serializable shape of the firebase user in the store.
export interface SerializableUser { uid: string; email: string | null; displayName: string | null; photoURL: string | null }
interface AuthState { user: SerializableUser | null; status: 'idle'|'loading'|'ready' }
const initial: AuthState = { user: null, status: 'idle' }

const slice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    // payload should be the serializable shape or null
    setUser(s, a: { payload: SerializableUser | null }) { s.user = a.payload; s.status = 'ready' },
    setLoading(s) { s.status = 'loading' },
  },
})

export const { setUser, setLoading } = slice.actions
export default slice.reducer