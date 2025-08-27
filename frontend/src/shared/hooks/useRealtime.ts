import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { onSnapshot, collection, doc, query, where } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import { apiSlice } from '@/shared/store/apiSlice'

// Hook to subscribe to realtime updates for libraries
export function useRealtimeLibraries(uid: string | null) {
  const dispatch = useDispatch()
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!uid) {
      unsubRef.current?.()
      unsubRef.current = null
      return
    }

    const ownerQ = query(collection(db, 'libraries'), where('ownerId', '==', uid))
    const sharedQ = query(collection(db, 'libraries'), where('share', 'array-contains', uid))

    const unsub = onSnapshot(ownerQ, () => {
      dispatch(apiSlice.util.invalidateTags(['Library']))
    })

    const unsub2 = onSnapshot(sharedQ, () => {
      dispatch(apiSlice.util.invalidateTags(['Library']))
    })

    unsubRef.current = () => {
      unsub()
      unsub2()
    }

    return () => {
      unsubRef.current?.()
    }
  }, [uid, dispatch])
}

// Hook to subscribe to realtime updates for cards in a library
export function useRealtimeCards(libraryId: string | null) {
  const dispatch = useDispatch()
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!libraryId) {
      unsubRef.current?.()
      unsubRef.current = null
      return
    }

    const q = query(collection(db, 'cards'), where('libraryId', '==', libraryId))

    const unsub = onSnapshot(q, () => {
      dispatch(apiSlice.util.invalidateTags(['Card']))
    })

    unsubRef.current = unsub

    return () => {
      unsubRef.current?.()
    }
  }, [libraryId, dispatch])
}

// Hook to subscribe to realtime updates for a single library
export function useRealtimeLibrary(libraryId: string | null) {
  const dispatch = useDispatch()
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!libraryId) {
      unsubRef.current?.()
      unsubRef.current = null
      return
    }

    const ref = doc(db, 'libraries', libraryId)

    const unsub = onSnapshot(ref, () => {
      dispatch(apiSlice.util.invalidateTags([{ type: 'Library', id: libraryId }]))
    })

    unsubRef.current = unsub

    return () => {
      unsubRef.current?.()
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
