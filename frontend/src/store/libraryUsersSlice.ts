// src/store/libraryUsersSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { doc, onSnapshot, getDocFromCache, getDoc, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PublicUser } from '@/lib/types'
import type { RootState } from '@/store'

// ==== Kiểu dữ liệu ====

// Document trong Firestore của "libraries"
interface LibraryDoc {
  ownerId: string
  share: string[] | Record<string, unknown> | undefined
}

type LibEntry = {
  uids: string[]
  users: Record<string, PublicUser | undefined>
}
export type LibUsersState = { byLibrary: Record<string, LibEntry> }
const initialState: LibUsersState = { byLibrary: {} }

// ==== Runtime holders (không đưa vào Redux) ====
const libUnsubs = new Map<string, () => void>()
const libUidSubs = new Map<string, Map<string, () => void>>() // libraryId -> (uid -> unsub)

const norm = (uid: string, v: DocumentData): PublicUser => ({
  uid,
  displayName: v?.displayName ?? '',
  email: v?.email ?? '',
  photoURL: v?.photoURL ?? '',
})

async function getUserCacheFirst(uid: string): Promise<PublicUser | undefined> {
  const ref = doc(db, 'users', uid)
  try {
    const cs = await getDocFromCache(ref)
    if (cs.exists()) return norm(uid, cs.data())
  } catch { /* ignore */ }
  const ss = await getDoc(ref)
  return ss.exists() ? norm(uid, ss.data()) : undefined
}

// ==== Thunks ====
export const watchLibraryUsers = createAsyncThunk<
  void,
  { libraryId: string },
  { state: RootState }
>(
  'libraryUsers/watch',
  async ({ libraryId }, { dispatch, getState }) => {
    if (libUnsubs.has(libraryId)) return // đã chạy rồi
    const ref = doc(db, 'libraries', libraryId)

    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) return
      const data = snap.data() as LibraryDoc
      const ownerId: string = data.ownerId
      const shareArray: string[] = Array.isArray(data.share)
        ? data.share
        : Object.keys(data.share ?? {})
      const nextUids = Array.from(new Set([ownerId, ...shareArray].filter(Boolean)))

      const state = getState().libraryUsers
      const prevUids = state.byLibrary[libraryId]?.uids ?? []

      // Diff để chỉ thêm/bớt đúng listeners cần thiết
      const addUids = nextUids.filter(u => !prevUids.includes(u))
      const removeUids = prevUids.filter(u => !nextUids.includes(u))

      if (!libUidSubs.has(libraryId)) libUidSubs.set(libraryId, new Map())
      const uidMap = libUidSubs.get(libraryId)!

      // Remove listeners thừa
      for (const uid of removeUids) {
        uidMap.get(uid)?.()
        uidMap.delete(uid)
      }

      // Prefill cache & add listeners mới
      for (const uid of addUids) {
        const cached = await getUserCacheFirst(uid)
        dispatch(libraryUsersSlice.actions.setUser({ libraryId, uid, user: cached }))

        const uref = doc(db, 'users', uid)
        const uUnsub = onSnapshot(uref, (usnap) => {
          const user = usnap.exists() ? norm(uid, usnap.data()) : undefined
          dispatch(libraryUsersSlice.actions.setUser({ libraryId, uid, user }))
        })
        uidMap.set(uid, uUnsub)
      }

      // Cập nhật danh sách uids cho library (để render)
      dispatch(libraryUsersSlice.actions.setUids({ libraryId, uids: nextUids }))
    })

    libUnsubs.set(libraryId, unsub)
  }
)

export const unwatchLibraryUsers = createAsyncThunk(
  'libraryUsers/unwatch',
  async ({ libraryId }: { libraryId: string }) => {
    libUnsubs.get(libraryId)?.()
    libUnsubs.delete(libraryId)
    const uidMap = libUidSubs.get(libraryId)
    if (uidMap) {
      uidMap.forEach(u => u())
      libUidSubs.delete(libraryId)
    }
  }
)

// ==== Slice ====
const libraryUsersSlice = createSlice({
  name: 'libraryUsers',
  initialState,
  reducers: {
    setUids(state, action: PayloadAction<{ libraryId: string; uids: string[] }>) {
      const { libraryId, uids } = action.payload
      const entry = state.byLibrary[libraryId] ?? { uids: [], users: {} }
      entry.uids = uids
      state.byLibrary[libraryId] = entry
    },
    setUser(state, action: PayloadAction<{ libraryId: string; uid: string; user?: PublicUser }>) {
      const { libraryId, uid, user } = action.payload
      const entry = state.byLibrary[libraryId] ?? { uids: [], users: {} }
      entry.users[uid] = user
      state.byLibrary[libraryId] = entry
    },
  },
})

export const { reducer: libraryUsersReducer, actions: libraryUsersActions } = libraryUsersSlice

// ==== Selectors tiện dụng ====
export const selectLibraryEntry = (s: RootState, libraryId: string) =>
  s.libraryUsers.byLibrary[libraryId] ?? { uids: [], users: {} }

export const selectLibraryUser =
  (libraryId: string, uid: string) =>
  (s: RootState) =>
    (s.libraryUsers.byLibrary[libraryId]?.users ?? {})[uid]
