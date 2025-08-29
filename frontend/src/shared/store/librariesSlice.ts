import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  deleteField,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { Library } from '@/shared/lib/types'
import { getDocsCacheFirst, getDocCacheFirst } from '@/shared/lib/firestoreCache'
import { toast } from 'sonner'

/* ================= Thunks ================= */

export const fetchLibraries = createAsyncThunk<Library[], string>(
  'libraries/fetch',
  async (uid: string) => {
    const ownerQ  = query(collection(db, 'libraries'), where('ownerId', '==', uid))
    const sharedQ = query(collection(db, 'libraries'), where('share', 'array-contains', uid))

    const [ownerRes, sharedRes] = await Promise.all([
      getDocsCacheFirst(ownerQ),
      getDocsCacheFirst(sharedQ),
    ])

    const seen = new Set<string>()
    const items: Library[] = []
    for (const d of [...ownerRes.snap.docs, ...sharedRes.snap.docs]) {
      if (seen.has(d.id)) continue
      seen.add(d.id)
      items.push({ id: d.id, ...(d.data() as DocumentData) } as Library)
    }
    items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    return items
  }
)

export const fetchLibraryById = createAsyncThunk<Library | null, string>(
  'libraries/getById',
  async (id: string) => {
    const ref = doc(db, 'libraries', id)
    const { snap } = await getDocCacheFirst(
      ref as import('firebase/firestore').DocumentReference<DocumentData>
    )
    if (!snap.exists()) return null
    const data = snap.data() as DocumentData
    return { id: snap.id, ...(data as DocumentData) } as Library
  }
)

export const createLibrary = createAsyncThunk<
  Library,
  { uid: string; name: string; description?: string }
>('libraries/create', async (payload) => {
  const now = Date.now()
  const ref = await addDoc(collection(db, 'libraries'), {
    name: payload.name,
    description: payload.description ?? '',
    ownerId: payload.uid,
    share: [],
    shareRoles: {},
    createdAt: now,
    updatedAt: now,
  })
  return {
    id: ref.id,
    name: payload.name,
    description: payload.description ?? '',
    ownerId: payload.uid,
    share: [],
    shareRoles: {},
    createdAt: now,
    updatedAt: now,
  } as Library
})

export const updateLibrary = createAsyncThunk<
  { id: string; patch: Partial<Library> },
  { id: string; patch: Partial<Library> }
>('libraries/update', async (payload) => {
  const ref = doc(db, 'libraries', payload.id)
  await updateDoc(ref, { ...payload.patch, updatedAt: Date.now() })
  return { id: payload.id, patch: { ...payload.patch } }
})

export const removeLibrary = createAsyncThunk<string, string>(
  'libraries/remove',
  async (id: string) => {
    await deleteDoc(doc(db, 'libraries', id))
    return id
  }
)

export const setShareRole = createAsyncThunk<
  { id: string; uid: string; role: 'contributor' | 'viewer' },
  { id: string; uid: string; role: 'contributor' | 'viewer' }
>('libraries/share', async (payload) => {
  const ref = doc(db, 'libraries', payload.id)
  await updateDoc(ref, {
    share: arrayUnion(payload.uid),
    [`shareRoles.${payload.uid}`]: payload.role,
    updatedAt: Date.now()
  })
  return payload
})

export const setUnshareRole = createAsyncThunk<
  { id: string; uid: string },
  { id: string; uid: string }
>('libraries/unshare', async (payload) => {
  const ref = doc(db, 'libraries', payload.id)
  await updateDoc(ref, {
    share: arrayRemove(payload.uid),
    [`shareRoles.${payload.uid}`]: deleteField(),
    updatedAt: Date.now()
  })
  return payload
})

export const updateUserRole = createAsyncThunk<
  { id: string; uid: string; role: 'contributor' | 'viewer' },
  { id: string; uid: string; role: 'contributor' | 'viewer' }
>('libraries/updateRole', async (payload) => {
  const ref = doc(db, 'libraries', payload.id)
  await updateDoc(ref, {
    [`shareRoles.${payload.uid}`]: payload.role,
    updatedAt: Date.now()
  })
  return payload
})

/* ================= Slice ================= */

interface SliceState {
  items: Record<string, Library>
  order: string[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
}
const initial: SliceState = { items: {}, order: [], status: 'idle', error: null }

const slice = createSlice({
  name: 'libraries',
  initialState: initial,
  reducers: {
    resetLibraries: () => initial,
  },
  extraReducers: (b) => {
    b.addCase(fetchLibraries.pending, (s) => {
      s.status = 'loading'
      s.error = null
    })
    b.addCase(fetchLibraries.fulfilled, (s, a) => {
      s.status = 'ready'
      s.error = null
      const nextItems: Record<string, Library> = {}
      const nextOrder: string[] = []
      for (const lib of a.payload) {
        nextItems[lib.id] = lib
        nextOrder.push(lib.id)
      }
      s.items = nextItems
      s.order = nextOrder
    })
    b.addCase(fetchLibraries.rejected, (s, a) => {
      s.status = 'error'
      s.error = a.error?.message ?? 'Không tải được danh sách thư viện.'
      toast.error('Không thể tải danh sách thư viện')
    })

    b.addCase(fetchLibraryById.fulfilled, (s, a) => {
      if (!a.payload) return
      s.items[a.payload.id] = a.payload
      if (!s.order.includes(a.payload.id)) s.order.unshift(a.payload.id)
    })

    b.addCase(createLibrary.fulfilled, (s, a) => {
      s.items[a.payload.id] = a.payload
      if (!s.order.includes(a.payload.id)) s.order.unshift(a.payload.id)
      toast.success(`Đã tạo thư viện "${a.payload.name}" thành công`)
    })

    b.addCase(createLibrary.rejected, (_s, a) => {
      toast.error(a.error?.message ?? 'Không thể tạo thư viện')
    })

    b.addCase(updateLibrary.fulfilled, (s, a) => {
      const t = s.items[a.payload.id]
      if (t) Object.assign(t, a.payload.patch)
      toast.success('Đã cập nhật thư viện thành công')
    })

    b.addCase(updateLibrary.rejected, (_s, a) => {
      toast.error(a.error?.message ?? 'Không thể cập nhật thư viện')
    })

    b.addCase(removeLibrary.fulfilled, (s, a) => {
      delete s.items[a.payload]
      s.order = s.order.filter((id) => id !== a.payload)
      toast.success('Đã xóa thư viện thành công')
    })

    b.addCase(removeLibrary.rejected, (_s, a) => {
      toast.error(a.error?.message ?? 'Không thể xóa thư viện')
    })

    b.addCase(setShareRole.fulfilled, (s, a) => {
      const t = s.items[a.payload.id]
      if (t) {
        if (!Array.isArray(t.share)) t.share = []
        if (!t.share.includes(a.payload.uid)) t.share.push(a.payload.uid)
        if (!t.shareRoles) t.shareRoles = {}
        t.shareRoles[a.payload.uid] = a.payload.role
      }
    })

    b.addCase(setUnshareRole.fulfilled, (s, a) => {
      const t = s.items[a.payload.id]
      if (t && Array.isArray(t.share)) {
        t.share = t.share.filter((u) => u !== a.payload.uid)
        if (t.shareRoles) delete t.shareRoles[a.payload.uid]
      }
    })

    b.addCase(updateUserRole.fulfilled, (s, a) => {
      const t = s.items[a.payload.id]
      if (t && t.shareRoles) {
        t.shareRoles[a.payload.uid] = a.payload.role
      }
    })
  },
})

export const { resetLibraries } = slice.actions
export default slice.reducer

// Memoized selectors
export const selectLibraries = createSelector(
  (state: { libraries: SliceState }) => state.libraries.order,
  (state: { libraries: SliceState }) => state.libraries.items,
  (order, items) => order.map((id) => items[id]).filter(Boolean)
)
