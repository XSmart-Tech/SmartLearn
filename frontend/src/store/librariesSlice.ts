import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Library } from '@/lib/types'
import { getDocsCacheFirst, getDocCacheFirst } from '@/lib/firestoreCache'

export const fetchLibraries = createAsyncThunk('libraries/fetch', async (uid: string) => {
  // Fetch libraries owned by the user
  const ownerQ = query(collection(db, 'libraries'), where('ownerId', '==', uid))
  // Fetch libraries explicitly shared with the user (role viewer)
  // Use a field path like `share.<uid>` to query the map field
  const sharedQ = query(collection(db, 'libraries'), where(`share.${uid}`, '==', 'viewer'))

  // Run both cache-first queries in parallel
  const [ownerRes, sharedRes] = await Promise.all([getDocsCacheFirst(ownerQ), getDocsCacheFirst(sharedQ)])

  // Merge and dedupe by document id
  const docs = [...ownerRes.snap.docs, ...sharedRes.snap.docs]
  const seen = new Set<string>()
  const items: Library[] = []
  for (const d of docs) {
    if (seen.has(d.id)) continue
    seen.add(d.id)
    items.push({ id: d.id, ...(d.data() as DocumentData) } as Library)
  }
  return items
})

export const fetchLibraryById = createAsyncThunk('libraries/getById', async (id: string) => {
  const ref = doc(db, 'libraries', id)
  const { snap } = await getDocCacheFirst(ref as import('firebase/firestore').DocumentReference<DocumentData>)
  if (!snap.exists()) return null
  const data = snap.data() as DocumentData
  return { id: snap.id, ...(data as DocumentData) } as Library
})

export const createLibrary = createAsyncThunk('libraries/create', async (payload: { uid: string; name: string; description?: string }) => {
  const now = Date.now()
  const ref = await addDoc(collection(db, 'libraries'), {
    name: payload.name,
    description: payload.description ?? '',
    ownerId: payload.uid,
    share: {},
    createdAt: now,
    updatedAt: now,
  })
  return { id: ref.id, name: payload.name, description: payload.description ?? '', ownerId: payload.uid, share: {}, createdAt: now, updatedAt: now } as Library
})

export const updateLibrary = createAsyncThunk('libraries/update', async (payload: { id: string; patch: Partial<Library> }) => {
  const ref = doc(db, 'libraries', payload.id)
  await updateDoc(ref, { ...payload.patch, updatedAt: Date.now() })
  return { id: payload.id, patch: { ...payload.patch } }
})

export const removeLibrary = createAsyncThunk('libraries/remove', async (id: string) => {
  await deleteDoc(doc(db, 'libraries', id))
  return id
})

export const setShareRole = createAsyncThunk('libraries/share', async (payload: { id: string; uid: string; role: 'viewer' }) => {
  const ref = doc(db, 'libraries', payload.id)
  await updateDoc(ref, { [`share.${payload.uid}`]: payload.role, updatedAt: Date.now() })
  return payload
})

interface SliceState { items: Record<string, Library>; order: string[]; status: 'idle'|'loading'|'ready' }
const initial: SliceState = { items: {}, order: [], status: 'idle' }

const slice = createSlice({
  name: 'libraries',
  initialState: initial,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchLibraries.pending, (s) => { s.status = 'loading' })
    b.addCase(fetchLibraries.fulfilled, (s, a) => {
      s.status = 'ready'
      for (const lib of a.payload) s.items[lib.id] = lib
      s.order = a.payload.map(l => l.id)
    })
    b.addCase(fetchLibraryById.fulfilled, (s, a) => {
      if (a.payload) s.items[a.payload.id] = a.payload
      if (a.payload && !s.order.includes(a.payload.id)) s.order.unshift(a.payload.id)
    })
    b.addCase(createLibrary.fulfilled, (s, a) => { s.items[a.payload.id] = a.payload; s.order.unshift(a.payload.id) })
    b.addCase(updateLibrary.fulfilled, (s, a) => { const t = s.items[a.payload.id]; if (t) Object.assign(t, a.payload.patch) })
    b.addCase(removeLibrary.fulfilled, (s, a) => { delete s.items[a.payload]; s.order = s.order.filter(id => id !== a.payload) })
    b.addCase(setShareRole.fulfilled, (s, a) => { const t = s.items[a.payload.id]; if (t) { t.share[a.payload.uid] = a.payload.role } })
  }
})

export default slice.reducer