import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { onSnapshot, collection, doc, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import { apiSlice } from '@/shared/store/apiSlice'
import { updateCardsRealtime } from '@/shared/store/cardsSlice'
import { updateNotificationsRealtime } from '@/shared/store/notificationsSlice'
import type { Flashcard, Notification } from '@/shared/lib/types'

// Hook to subscribe to realtime updates for libraries
export function useRealtimeLibraries(uid: string | null) {
  const dispatch = useDispatch()
  const unsubRef = useRef<(() => void) | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only set up listeners if uid is provided
    if (!uid) {
      unsubRef.current?.()
      unsubRef.current = null
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      return
    }

    const ownerQ = query(collection(db, 'libraries'), where('ownerId', '==', uid))
    const sharedQ = query(collection(db, 'libraries'), where('share', 'array-contains', uid))

    const invalidate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        dispatch(apiSlice.util.invalidateTags(['Library']))
      }, 500) // Debounce 500ms
    }

    const unsub = onSnapshot(ownerQ, invalidate)
    const unsub2 = onSnapshot(sharedQ, invalidate)

    unsubRef.current = () => {
      unsub()
      unsub2()
    }

    return () => {
      unsubRef.current?.()
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [uid, dispatch])
}

export function useRealtimeCards(libraryId: string | null) {
  const dispatch = useDispatch()
  const unsubRef = useRef<(() => void) | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!libraryId) {
      unsubRef.current?.()
      unsubRef.current = null
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      return
    }

    const q = query(collection(db, 'cards'), where('libraryId', '==', libraryId))

    const invalidate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          const q = query(collection(db, 'cards'), where('libraryId', '==', libraryId))
          const snap = await getDocs(q)
          const cards = snap.docs.map(
            d => ({ id: d.id, ...(d.data() as Omit<Flashcard, 'id'>) }) as Flashcard
          )
          // Sort mới nhất lên đầu
          cards.sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))
          dispatch(updateCardsRealtime({ libraryId, cards }))
        } catch (error) {
          console.error('Realtime cards update error:', error)
        }
      }, 500)
    }

    const unsub = onSnapshot(q, invalidate)

    unsubRef.current = unsub

    return () => {
      unsubRef.current?.()
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [libraryId, dispatch])
}

// Hook to subscribe to realtime updates for a single library
export function useRealtimeLibrary(libraryId: string | null) {
  const dispatch = useDispatch()
  const unsubRef = useRef<(() => void) | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!libraryId) {
      unsubRef.current?.()
      unsubRef.current = null
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      return
    }

    const ref = doc(db, 'libraries', libraryId)

    const invalidate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        dispatch(apiSlice.util.invalidateTags([{ type: 'Library', id: libraryId }]))
      }, 500)
    }

    const unsub = onSnapshot(ref, invalidate)

    unsubRef.current = unsub

    return () => {
      unsubRef.current?.()
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [libraryId, dispatch])
}

// Hook to subscribe to realtime updates for users
export function useRealtimeUsers(uids: string[]) {
  const dispatch = useDispatch()
  const unsubRef = useRef<Map<string, () => void>>(new Map())

  useEffect(() => {
    const currentUnsubs = unsubRef.current

    // Unsubscribe from users not in the new list
    const currentUids = new Set(currentUnsubs.keys())
    const newUids = new Set(uids)

    for (const uid of currentUids) {
      if (!newUids.has(uid)) {
        currentUnsubs.get(uid)?.()
        currentUnsubs.delete(uid)
      }
    }

    // Subscribe to new users
    for (const uid of uids) {
      if (!currentUnsubs.has(uid)) {
        const ref = doc(db, 'users', uid)
        const unsub = onSnapshot(ref, () => {
          dispatch(apiSlice.util.invalidateTags(['User']))
        })
        currentUnsubs.set(uid, unsub)
      }
    }

    return () => {
      for (const unsub of currentUnsubs.values()) {
        unsub()
      }
      currentUnsubs.clear()
    }
  }, [uids, dispatch])
}

// Hook to subscribe to realtime updates for notifications
export function useRealtimeNotifications(uid: string | null) {
  const dispatch = useDispatch()
  const unsubRef = useRef<(() => void) | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!uid) {
      unsubRef.current?.()
      unsubRef.current = null
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', uid)
      // Removed orderBy to avoid composite index requirement
    )
    
    const q2 = query(
      collection(db, 'notifications'),
      where('senderId', '==', uid)
      // Removed orderBy to avoid composite index requirement
    )

    console.log('[DEBUG] Notification queries created for UID:', uid)

    const updateNotifications = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          console.log('[DEBUG] Fetching notifications for UID:', uid)
          console.log('[DEBUG] Executing queries...')
          const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)])
          console.log('[DEBUG] Query 1 (recipient) results:', snap1.docs.length, 'docs')
          console.log('[DEBUG] Query 2 (sender) results:', snap2.docs.length, 'docs')
          
          if (snap1.docs.length > 0) {
            console.log('[DEBUG] First recipient doc data:', snap1.docs[0].data())
          }
          if (snap2.docs.length > 0) {
            console.log('[DEBUG] First sender doc data:', snap2.docs[0].data())
          }
          
          const notifications1 = snap1.docs.map(
            d => ({ id: d.id, ...(d.data() as Omit<Notification, 'id'>) }) as Notification
          )
          const notifications2 = snap2.docs.map(
            d => ({ id: d.id, ...(d.data() as Omit<Notification, 'id'>) }) as Notification
          )
          
          console.log('[DEBUG] Recipient notifications:', notifications1.map(n => ({ id: n.id, recipientId: n.recipientId, senderId: n.senderId, status: n.status })))
          console.log('[DEBUG] Sender notifications:', notifications2.map(n => ({ id: n.id, recipientId: n.recipientId, senderId: n.senderId, status: n.status })))
          
          // Combine and deduplicate notifications
          const allNotifications = [...notifications1, ...notifications2]
          const uniqueNotifications = allNotifications.filter((notification, index, self) => 
            index === self.findIndex(n => n.id === notification.id)
          )
          
          // Sort by createdAt desc (client-side sort since we removed server-side orderBy)
          uniqueNotifications.sort((a, b) => b.createdAt - a.createdAt)
          
          console.log(`[Realtime] Updated notifications for ${uid}: ${uniqueNotifications.length} items`)
          console.log('[DEBUG] Final notifications:', uniqueNotifications.map(n => ({ id: n.id, recipientId: n.recipientId, senderId: n.senderId, status: n.status })))
          dispatch(updateNotificationsRealtime(uniqueNotifications))
        } catch (error) {
          console.error('[ERROR] Realtime notifications update error:', error)
          console.error('[ERROR] Error details:', {
            message: error instanceof Error ? error.message : String(error),
            code: error instanceof Error && 'code' in error ? error.code : 'unknown',
            stack: error instanceof Error ? error.stack : 'unknown'
          })
        }
      }, 300) // Shorter debounce for notifications
    }

    const unsub = onSnapshot(q, updateNotifications)
    const unsub2 = onSnapshot(q2, updateNotifications)

    unsubRef.current = () => {
      unsub()
      unsub2()
    }

    return () => {
      unsubRef.current?.()
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [uid, dispatch])
}
