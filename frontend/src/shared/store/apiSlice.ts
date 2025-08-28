import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { db } from '@/shared/lib/firebase'
import { collection, doc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { Library, Flashcard, PublicUser } from '@/shared/lib/types'
import { getDocCacheFirst, getDocsCacheFirst } from '@/shared/lib/firestoreCache'

// Custom base query that uses Firebase cache-first approach
const firebaseBaseQuery = fetchBaseQuery({
  baseUrl: '', // Not used for Firebase
  // We'll override fetchFn to use Firebase
})

// Create API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: firebaseBaseQuery,
  tagTypes: ['Library', 'Card', 'User'],
  endpoints: (builder) => ({
    // Libraries
    fetchLibraries: builder.query<Library[], string>({
      queryFn: async (uid) => {
        try {
          const ownerQ = query(collection(db, 'libraries'), where('ownerId', '==', uid))
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
            items.push({ id: d.id, ...(d.data() as Omit<Library, 'id'>) })
          }
          items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
          return { data: items }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      providesTags: (result) =>
        result ? result.map(lib => ({ type: 'Library' as const, id: lib.id })) : ['Library'],
    }),

    fetchLibraryById: builder.query<Library | null, string>({
      queryFn: async (id) => {
        try {
          const ref = doc(db, 'libraries', id)
          const { snap } = await getDocCacheFirst(ref)
          if (!snap.exists()) return { data: null }
          const data = snap.data()
          return { data: { id: snap.id, ...data } as Library }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      providesTags: (result) => result ? [{ type: 'Library', id: result.id }] : ['Library'],
    }),

    createLibrary: builder.mutation<Library, { uid: string; name: string; description?: string }>({
      queryFn: async (payload) => {
        try {
          const now = Date.now()
          const ref = await addDoc(collection(db, 'libraries'), {
            name: payload.name,
            description: payload.description ?? '',
            ownerId: payload.uid,
            share: [],
            createdAt: now,
            updatedAt: now,
          })
          const library: Library = {
            id: ref.id,
            name: payload.name,
            description: payload.description ?? '',
            ownerId: payload.uid,
            share: [],
            shareRoles: {},
            createdAt: now,
            updatedAt: now,
          }
          return { data: library }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      invalidatesTags: ['Library'],
    }),

    updateLibrary: builder.mutation<{ id: string; patch: Partial<Library> }, { id: string; patch: Partial<Library> }>({
      queryFn: async (payload) => {
        try {
          const ref = doc(db, 'libraries', payload.id)
          await updateDoc(ref, { ...payload.patch, updatedAt: Date.now() })
          return { data: { id: payload.id, patch: payload.patch } }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      invalidatesTags: (result) => result ? [{ type: 'Library', id: result.id }] : ['Library'],
    }),

    removeLibrary: builder.mutation<string, string>({
      queryFn: async (id) => {
        try {
          await deleteDoc(doc(db, 'libraries', id))
          return { data: id }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      invalidatesTags: ['Library'],
    }),

    // Cards
    fetchCards: builder.query<Flashcard[], string>({
      queryFn: async (libraryId) => {
        try {
          const q = query(collection(db, 'cards'), where('libraryId', '==', libraryId))
          const { snap } = await getDocsCacheFirst(q)
          const items = snap.docs.map(
            d => ({ id: d.id, ...(d.data() as Omit<Flashcard, 'id'>) }) as Flashcard
          )
          items.sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))
          return { data: items }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      providesTags: (result) =>
        result ? result.map(card => ({ type: 'Card' as const, id: card.id })) : ['Card'],
    }),

    createCard: builder.mutation<Flashcard, { libraryId: string; card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> }>({
      queryFn: async (payload) => {
        try {
          const now = Date.now()
          const docRef = await addDoc(collection(db, 'cards'), {
            ...payload.card,
            libraryId: payload.libraryId,
            createdAt: now,
            updatedAt: now,
          })
          const card: Flashcard = {
            id: docRef.id,
            ...payload.card,
            libraryId: payload.libraryId,
            createdAt: now,
            updatedAt: now,
          }
          return { data: card }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      invalidatesTags: (result) => result ? [{ type: 'Card', id: result.libraryId }] : ['Card'],
    }),

    updateCard: builder.mutation<{ id: string; patch: Partial<Flashcard> }, { id: string; patch: Partial<Flashcard> }>({
      queryFn: async (payload) => {
        try {
          await updateDoc(doc(db, 'cards', payload.id), { ...payload.patch, updatedAt: Date.now() })
          return { data: { id: payload.id, patch: payload.patch } }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      invalidatesTags: (result) => result ? [{ type: 'Card', id: result.id }] : ['Card'],
    }),

    removeCard: builder.mutation<string, string>({
      queryFn: async (id) => {
        try {
          await deleteDoc(doc(db, 'cards', id))
          return { data: id }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      invalidatesTags: ['Card'],
    }),

    // Users
    searchUsers: builder.query<PublicUser[], string>({
      queryFn: async (term) => {
        try {
          const q = term.trim().toLowerCase()
          if (!q) return { data: [] }
          const col = collection(db, 'users')
          const results: Record<string, PublicUser> = {}

          // exact email match (fast path)
          const emailSnap = await getDocs(
            query(col, where('emailLower', '==', q))
          )

          emailSnap.forEach(d => {
            const v = d.data() as PublicUser
            results[d.id] = { uid: d.id, displayName: v.displayName ?? '', email: v.email ?? '', photoURL: v.photoURL ?? '' }
          })
          return { data: Object.values(results) }
        } catch (error) {
          return { error: { status: 500, data: error } }
        }
      },
      providesTags: ['User'],
    }),
  }),
})

// Export hooks
export const {
  useFetchLibrariesQuery,
  useFetchLibraryByIdQuery,
  useCreateLibraryMutation,
  useUpdateLibraryMutation,
  useRemoveLibraryMutation,
  useFetchCardsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useRemoveCardMutation,
  useSearchUsersQuery,
} = apiSlice

// Export the reducer
export default apiSlice.reducer
