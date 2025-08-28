import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addDoc, collection, doc, updateDoc, query, where } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { Notification } from '@/shared/lib/types'
import { getDocsCacheFirst } from '@/shared/lib/firestoreCache'

/** Fetch notifications for a user */
export const fetchNotifications = createAsyncThunk<Notification[], string>(
  'notifications/fetch',
  async (uid: string) => {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', uid)
      // Removed orderBy to avoid composite index requirement
    )
    const { snap } = await getDocsCacheFirst(q)
    const items = snap.docs.map(
      d => ({ id: d.id, ...(d.data() as Omit<Notification, 'id'>) }) as Notification
    )
    // Sort client-side instead of server-side
    items.sort((a, b) => b.createdAt - a.createdAt)
    return items
  }
)

/** Create a notification */
export const createNotification = createAsyncThunk<
  Notification,
  Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>
>(
  'notifications/create',
  async (payload) => {
    console.log('[DEBUG] Creating notification:', payload)
    const now = Date.now()
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...payload,
      createdAt: now,
      updatedAt: now,
    })
    console.log('[DEBUG] Notification created with ID:', docRef.id)
    const result = {
      id: docRef.id,
      ...payload,
      createdAt: now,
      updatedAt: now,
    } as Notification
    console.log('[DEBUG] Returning notification:', result)
    return result
  }
)

/** Update notification status */
export const updateNotification = createAsyncThunk<
  { id: string; status: 'accepted' | 'rejected' },
  { id: string; status: 'accepted' | 'rejected' }
>(
  'notifications/update',
  async (payload) => {
    await updateDoc(doc(db, 'notifications', payload.id), {
      status: payload.status,
      updatedAt: Date.now()
    })
    return payload
  }
)

export interface SliceState {
  items: Notification[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
}

const initialState: SliceState = {
  items: [],
  status: 'idle',
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications: () => initialState,
    updateNotificationsRealtime: (state, action: { payload: Notification[] }) => {
      state.items = action.payload
      state.status = 'ready'
      state.error = null
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifications.pending, (s) => {
      s.status = 'loading'
      s.error = null
    })
    b.addCase(fetchNotifications.fulfilled, (s, a) => {
      s.status = 'ready'
      s.error = null
      s.items = a.payload
    })
    b.addCase(fetchNotifications.rejected, (s, a) => {
      s.status = 'error'
      s.error = a.error.message || 'Failed to fetch notifications'
    })
    b.addCase(createNotification.fulfilled, (s, a) => {
      s.items.unshift(a.payload)
    })
    b.addCase(updateNotification.fulfilled, (s, a) => {
      const index = s.items.findIndex(n => n.id === a.payload.id)
      if (index !== -1) {
        s.items[index].status = a.payload.status
        s.items[index].updatedAt = Date.now()
      }
    })
  },
})

export const { resetNotifications, updateNotificationsRealtime } = notificationsSlice.actions
export default notificationsSlice.reducer
