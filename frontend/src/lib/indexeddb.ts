import { openDB, type IDBPDatabase } from 'idb'

type DBCacheEntry = {
  promise: Promise<IDBPDatabase<unknown>>
  version: number
}

const dbCache = new Map<string, DBCacheEntry>()

function dbKey(name: string) {
  return name
}

export async function ensureDB(name: string, version: number, stores: string[]) {
  const key = dbKey(name)
  const existing = dbCache.get(key)
  if (existing && existing.version === version) return existing.promise

  const p = openDB(name, version, {
    upgrade(db) {
      for (const s of stores) {
        if (!db.objectStoreNames.contains(s)) {
          db.createObjectStore(s, { keyPath: 'id' })
        }
      }
    }
  })

  dbCache.set(key, { promise: p, version })
  return p
}

export async function put<T>(name: string, version: number, store: string, value: T) {
  const db = await ensureDB(name, version, [store])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as IDBPDatabase<any>).put(store, value)
}

export async function getAll<T>(name: string, version: number, store: string): Promise<T[]> {
  const db = await ensureDB(name, version, [store])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as IDBPDatabase<any>).getAll(store) as Promise<T[]>
}

export async function get<T>(name: string, version: number, store: string, key: IDBValidKey) {
  const db = await ensureDB(name, version, [store])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as IDBPDatabase<any>).get(store, key) as Promise<T | undefined>
}

export async function clear(name: string, version: number, store: string) {
  const db = await ensureDB(name, version, [store])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tx = (db as any).transaction(store as string, 'readwrite')
  await tx.objectStore(store).clear()
  await tx.done
}

export async function del(name: string, version: number, store: string, key: IDBValidKey) {
  const db = await ensureDB(name, version, [store])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as IDBPDatabase<any>).delete(store, key)
}
