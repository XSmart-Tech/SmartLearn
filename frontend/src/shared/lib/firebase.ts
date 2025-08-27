import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User, type Auth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, CACHE_SIZE_UNLIMITED, serverTimestamp, type Firestore, doc, setDoc, collection, getDocs, where, limit as qLimit } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import type { PublicUser } from './types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

class FirebaseService {
  private static instance: FirebaseService | null = null;
  private app: FirebaseApp;
  private _auth: Auth;
  private _db: Firestore;
  private _storage: FirebaseStorage;
  private _provider: GoogleAuthProvider;

  private constructor() {
    this.app = initializeApp(firebaseConfig);
    this._auth = getAuth(this.app);
    this._db = initializeFirestore(this.app, {
      localCache: persistentLocalCache({
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        tabManager: persistentMultipleTabManager()
      }),
    });
    this._storage = getStorage(this.app);
    this._provider = new GoogleAuthProvider();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  get auth() {
    return this._auth;
  }

  get db() {
    return this._db;
  }

  get storage() {
    return this._storage;
  }

  get provider() {
    return this._provider;
  }

  get ts() {
    return serverTimestamp;
  }

  signInGoogle = () => signInWithPopup(this._auth, this._provider);
  signOutApp = () => signOut(this._auth);
  watchAuth = (cb: (user: import('firebase/auth').User | null) => void) => onAuthStateChanged(this._auth, cb);

  // === User profile helpers ===
  async ensureUserProfile(u: User) {
    const displayName = u.displayName ?? (u.email?.split('@')[0] ?? 'User');
    const email = (u.email ?? '').toLowerCase();
    await setDoc(doc(this._db, 'users', u.uid), {
      uid: u.uid,
      displayName,
      displayNameLower: displayName.toLowerCase(),
      email,
      emailLower: email,
      photoURL: u.photoURL ?? '',
      updatedAt: Date.now(),
      createdAt: this.ts(),
    }, { merge: true });
  }

  async searchUsers(term: string, take = 8): Promise<PublicUser[]> {
    const q = term.trim().toLowerCase();
    if (!q) return [];

    const col = collection(this._db, 'users');
    const results: Record<string, PublicUser> = {};

    // exact email match (fast path)
    const emailSnap = await getDocs(
      (await import('firebase/firestore')).query(col, where('emailLower', '==', q), qLimit(1))
    );

    emailSnap.forEach(d => {
      const v = d.data() as PublicUser;
      results[d.id] = { uid: d.id, displayName: v.displayName ?? '', email: v.email ?? '', photoURL: v.photoURL ?? '' };
    });
    return Object.values(results).slice(0, take);
  }
}

// Export singleton instance
const firebaseService = FirebaseService.getInstance();

// Export individual services for backward compatibility
export const auth = firebaseService.auth;
export const db = firebaseService.db;
export const storage = firebaseService.storage;
export const provider = firebaseService.provider;
export const signInGoogle = firebaseService.signInGoogle;
export const signOutApp = firebaseService.signOutApp;
export const ts = firebaseService.ts;
export const watchAuth = firebaseService.watchAuth;
export const ensureUserProfile = firebaseService.ensureUserProfile.bind(firebaseService);
export const searchUsers = firebaseService.searchUsers.bind(firebaseService);
