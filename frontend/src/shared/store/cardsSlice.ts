import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addDoc, collection, deleteDoc, doc, query, updateDoc, where } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { Flashcard } from '@/shared/lib/types'
import { getDocsCacheFirst } from '@/shared/lib/firestoreCache'
import { toast } from 'sonner'

/** Load all cards for a libraryId */
export const fetchCards = createAsyncThunk<Flashcard[], string>(
  'cards/fetch',
  async (libraryId: string) => {
    const q = query(collection(db, 'cards'), where('libraryId', '==', libraryId))
    const { snap } = await getDocsCacheFirst(q)
    const items = snap.docs.map(
      d => ({ id: d.id, ...(d.data() as Omit<Flashcard, 'id'>) }) as Flashcard
    )
    // Sort mới nhất lên đầu (updatedAt > createdAt)
    items.sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))
    return items
  }
)

type CreateCardArg = { libraryId: string; card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> }
export const createCard = createAsyncThunk<Flashcard, CreateCardArg>(
  'cards/create',
  async (payload: CreateCardArg) => {
    const now = Date.now()
    const docRef = await addDoc(collection(db, 'cards'), {
      ...payload.card,
      libraryId: payload.libraryId,
      createdAt: now,
      updatedAt: now,
    })
    return {
      id: docRef.id,
      ...payload.card,
      libraryId: payload.libraryId,
      createdAt: now,
      updatedAt: now,
    } as Flashcard
  }
)

type UpdateCardArg = { id: string; patch: Partial<Flashcard> }
export const updateCard = createAsyncThunk<UpdateCardArg, UpdateCardArg>(
  'cards/update',
  async (payload: UpdateCardArg) => {
    await updateDoc(doc(db, 'cards', payload.id), { ...payload.patch, updatedAt: Date.now() })
    return payload
  }
)

export const removeCard = createAsyncThunk<string, string>(
  'cards/remove',
  async (id: string) => {
    await deleteDoc(doc(db, 'cards', id))
    return id
  }
)

export type Status = 'idle'|'loading'|'ready'|'error'
export interface SliceState {
  byLib: Record<string, Flashcard[]>
  byLibStatus: Record<string, Status>
  byLibError: Record<string, string | null>
  cardToLib: Record<string, string> // map cardId -> libraryId để update nhanh
}
const initial: SliceState = {
  byLib: {},
  byLibStatus: {},
  byLibError: {},
  cardToLib: {},
}

export type CardsSliceState = SliceState

const cardsSlice = createSlice({
  name: 'cards',
  initialState: initial,
  reducers: {
    resetCards: () => initial,
    updateCardsRealtime: (s, a: { payload: { libraryId: string; cards: Flashcard[] } }) => {
      const { libraryId, cards } = a.payload
      s.byLib[libraryId] = cards
      s.byLibStatus[libraryId] = 'ready' // Keep status as ready to avoid skeleton
      s.byLibError[libraryId] = null
      for (const c of cards) s.cardToLib[c.id] = libraryId
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCards.pending, (s, a) => {
      const libId = a.meta.arg
      s.byLibStatus[libId] = 'loading'
      s.byLibError[libId] = null
    })
    b.addCase(fetchCards.fulfilled, (s, a) => {
      const libId = a.meta.arg
      s.byLibStatus[libId] = 'ready'
      s.byLibError[libId] = null
      s.byLib[libId] = a.payload
      for (const c of a.payload) s.cardToLib[c.id] = libId
    })
    b.addCase(fetchCards.rejected, (s, a) => {
      const libId = a.meta.arg as string
      s.byLibStatus[libId] = 'error'
      s.byLibError[libId] = a.error?.message ?? 'Không tải được thẻ.'
      toast.error('Không thể tải danh sách thẻ')
    })

    b.addCase(createCard.fulfilled, (s, a) => {
      const libId = a.payload.libraryId
      if (!s.byLib[libId]) s.byLib[libId] = []
      s.byLib[libId].unshift(a.payload)
      s.cardToLib[a.payload.id] = libId
      toast.success('Đã tạo thẻ thành công')
    })

    b.addCase(createCard.rejected, (_s, a) => {
      toast.error(a.error?.message ?? 'Không thể tạo thẻ')
    })

    b.addCase(updateCard.fulfilled, (s, a) => {
      const { id, patch } = a.payload
      const libId = s.cardToLib[id]
      if (libId && s.byLib[libId]) {
        const idx = s.byLib[libId].findIndex(c => c.id === id)
        if (idx >= 0) s.byLib[libId][idx] = { ...s.byLib[libId][idx], ...patch }
      } else {
        // Fallback: tìm trên mọi thư viện (ít khi cần)
        for (const key of Object.keys(s.byLib)) {
          const idx = s.byLib[key].findIndex(c => c.id === id)
          if (idx >= 0) { s.byLib[key][idx] = { ...s.byLib[key][idx], ...patch }; break }
        }
      }
      toast.success('Đã cập nhật thẻ thành công')
    })

    b.addCase(updateCard.rejected, (_s, a) => {
      toast.error(a.error?.message ?? 'Không thể cập nhật thẻ')
    })

    b.addCase(removeCard.fulfilled, (s, a) => {
      const id = a.payload
      const libId = s.cardToLib[id]
      if (libId && s.byLib[libId]) {
        s.byLib[libId] = s.byLib[libId].filter(c => c.id !== id)
      } else {
        for (const key of Object.keys(s.byLib)) {
          s.byLib[key] = s.byLib[key].filter(c => c.id !== id)
        }
      }
      delete s.cardToLib[id]
      toast.success('Đã xóa thẻ thành công')
    })

    b.addCase(removeCard.rejected, (_s, a) => {
      toast.error(a.error?.message ?? 'Không thể xóa thẻ')
    })
  }
})

export const { resetCards, updateCardsRealtime } = cardsSlice.actions
export default cardsSlice.reducer
