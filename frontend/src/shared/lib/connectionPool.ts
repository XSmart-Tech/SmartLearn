import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Connection pool for Firebase services
class FirebaseConnectionPool {
  private static instance: FirebaseConnectionPool | null = null
  private app: FirebaseApp
  private auth: Auth | null = null
  private db: Firestore | null = null
  private storage: FirebaseStorage | null = null
  private connectionCount = 0
  private maxConnections = 5

  private constructor() {
    this.app = initializeApp(firebaseConfig)
  }

  public static getInstance(): FirebaseConnectionPool {
    if (!FirebaseConnectionPool.instance) {
      FirebaseConnectionPool.instance = new FirebaseConnectionPool()
    }
    return FirebaseConnectionPool.instance
  }

  // Lazy initialization of services
  getAuth(): Auth {
    if (!this.auth) {
      this.auth = getAuth(this.app)
    }
    return this.auth
  }

  getFirestore(): Firestore {
    if (!this.db) {
      this.db = getFirestore(this.app)
    }
    return this.db
  }

  getStorage(): FirebaseStorage {
    if (!this.storage) {
      this.storage = getStorage(this.app)
    }
    return this.storage
  }

  // Connection management
  acquireConnection(): boolean {
    if (this.connectionCount < this.maxConnections) {
      this.connectionCount++
      return true
    }
    return false
  }

  releaseConnection(): void {
    if (this.connectionCount > 0) {
      this.connectionCount--
    }
  }

  getConnectionCount(): number {
    return this.connectionCount
  }
}

// Optimized service getters
export const getOptimizedAuth = () => FirebaseConnectionPool.getInstance().getAuth()
export const getOptimizedFirestore = () => FirebaseConnectionPool.getInstance().getFirestore()
export const getOptimizedStorage = () => FirebaseConnectionPool.getInstance().getStorage()

// Connection pool manager
export const connectionPool = FirebaseConnectionPool.getInstance()

// Utility to manage connection lifecycle
export function withConnection<T>(operation: () => Promise<T>): Promise<T> {
  const pool = FirebaseConnectionPool.getInstance()

  if (!pool.acquireConnection()) {
    return new Promise((resolve, reject) => {
      // Wait for a connection to become available
      const checkConnection = () => {
        if (pool.acquireConnection()) {
          operation()
            .then(resolve)
            .catch(reject)
            .finally(() => pool.releaseConnection())
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }

  return operation().finally(() => pool.releaseConnection())
}

// Query deduplication to prevent duplicate simultaneous requests
const pendingQueries = new Map<string, Promise<unknown>>()

export function deduplicateQuery<T>(
  key: string,
  queryFn: () => Promise<T>
): Promise<T> {
  if (pendingQueries.has(key)) {
    return pendingQueries.get(key)! as Promise<T>
  }

  const promise = queryFn().finally(() => {
    pendingQueries.delete(key)
  })

  pendingQueries.set(key, promise)
  return promise
}

// Request throttling
let lastRequestTime = 0
const minRequestInterval = 100 // ms

export function throttleRequest<T>(operation: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const now = Date.now()
    const timeToWait = Math.max(0, minRequestInterval - (now - lastRequestTime))

    setTimeout(() => {
      lastRequestTime = Date.now()
      operation().then(resolve).catch(reject)
    }, timeToWait)
  })
}
