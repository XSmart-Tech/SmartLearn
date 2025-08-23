import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, CACHE_SIZE_UNLIMITED, serverTimestamp, type Firestore, doc, setDoc, collection, getDocs, where, limit as qLimit } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import type { PublicUser } from './types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    tabManager: persistentMultipleTabManager()
  }),
})
export const storage = getStorage(app)

export const provider = new GoogleAuthProvider()
export const signInGoogle = () => signInWithPopup(auth, provider)
export const signOutApp = () => signOut(auth)
export const ts = serverTimestamp
export const watchAuth = (cb: (user: import('firebase/auth').User | null) => void) => onAuthStateChanged(auth, cb)

// === User profile helpers ===
export async function ensureUserProfile(u: User) {
  const displayName = u.displayName ?? (u.email?.split('@')[0] ?? 'User')
  const email = (u.email ?? '').toLowerCase()
  await setDoc(doc(db, 'users', u.uid), {
    uid: u.uid,
    displayName,
    displayNameLower: displayName.toLowerCase(),
    email,
    emailLower: email,
    photoURL: u.photoURL ?? '',
    updatedAt: Date.now(),
    createdAt: ts(),
  }, { merge: true })
}

export async function searchUsers(term: string, take = 8): Promise<PublicUser[]> {
  const q = term.trim().toLowerCase()
  if (!q) return []
  const col = collection(db, 'users')
  const results: Record<string, PublicUser> = {}

  // exact email match (fast path)
  const emailSnap = await getDocs(
    (await import('firebase/firestore')).query(col, where('emailLower', '==', q), qLimit(1))
  )

  emailSnap.forEach(d => {
    const v = d.data() as PublicUser
    results[d.id] = { uid: d.id, displayName: v.displayName ?? '', email: v.email ?? '', photoURL: v.photoURL ?? '' }
  })
  return Object.values(results).slice(0, take)
}