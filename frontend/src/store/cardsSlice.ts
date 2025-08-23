import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addDoc, collection, deleteDoc, doc, query, updateDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Flashcard } from '@/lib/types'
import { getDocsCacheFirst } from '@/lib/firestoreCache'

export const fetchCards = createAsyncThunk<Flashcard[], string>('cards/fetch', async (libraryId: string) => {
  const q = query(collection(db, 'cards'), where('libraryId', '==', libraryId))
  const { snap } = await getDocsCacheFirst(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Flashcard, 'id'>) })) as Flashcard[]
})

type CreateCardArg = { libraryId: string; card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> }
export const createCard = createAsyncThunk<Flashcard, CreateCardArg>('cards/create', async (payload: CreateCardArg) => {
  const now = Date.now()
  const docRef = await addDoc(collection(db, 'cards'), { ...payload.card, libraryId: payload.libraryId, createdAt: now, updatedAt: now })
  return { id: docRef.id, ...payload.card, libraryId: payload.libraryId, createdAt: now, updatedAt: now } as Flashcard
})

type UpdateCardArg = { id: string; patch: Partial<Flashcard> }
export const updateCard = createAsyncThunk<UpdateCardArg, UpdateCardArg>('cards/update', async (payload: UpdateCardArg) => {
  await updateDoc(doc(db, 'cards', payload.id), { ...payload.patch, updatedAt: Date.now() })
  return payload
})

export const removeCard = createAsyncThunk<string, string>('cards/remove', async (id: string) => {
  await deleteDoc(doc(db, 'cards', id))
  return id
})

interface SliceState { byLib: Record<string, Flashcard[]>; status: 'idle'|'loading'|'ready' }
const initial: SliceState = { byLib: {}, status: 'idle' }

const slice = createSlice({
  name: 'cards',
  initialState: initial,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCards.pending, (s) => { s.status = 'loading' })
    b.addCase(fetchCards.fulfilled, (s, a) => {
      s.status = 'ready'
      const libId = a.meta.arg
      s.byLib[libId] = a.payload
    })
    b.addCase(createCard.fulfilled, (s, a) => {
      const libId = a.payload.libraryId
      s.byLib[libId] = [a.payload, ...(s.byLib[libId] ?? [])]
    })
    b.addCase(updateCard.fulfilled, (s, a) => {
      const { id, patch } = a.payload
      for (const libId of Object.keys(s.byLib)) {
        const arr = s.byLib[libId]
        const idx = arr.findIndex(c => c.id === id)
        if (idx >= 0) arr[idx] = { ...arr[idx], ...patch }
      }
    })
    b.addCase(removeCard.fulfilled, (s, a) => {
      for (const libId of Object.keys(s.byLib)) s.byLib[libId] = (s.byLib[libId] ?? []).filter(c => c.id !== a.payload)
    })
  }
})

export default slice.reducer