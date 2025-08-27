import { put, getAll, clear, del } from './indexeddb'

const DB_NAME = 'smartlearn-db'
const DB_VERSION = 1
const STORE = 'recents'

export type RecentEntry = { id: string; ts: number }

export async function addRecentLibrary(id: string) {
  try {
    // upsert the entry
    await put(DB_NAME, DB_VERSION, STORE, { id, ts: Date.now() } as RecentEntry)

    // prune older entries so DB only keeps the most recent 3
    const all = await getAll<RecentEntry>(DB_NAME, DB_VERSION, STORE)
    all.sort((a, b) => b.ts - a.ts)
    const toRemove = all.slice(3)
    if (toRemove.length > 0) {
      await Promise.all(toRemove.map((r) => del(DB_NAME, DB_VERSION, STORE, r.id)))
    }
  } catch {
    // ignore
  }
}

export async function getRecentLibraryIds(limit = 3): Promise<string[]> {
  try {
    const all = await getAll<RecentEntry>(DB_NAME, DB_VERSION, STORE)
    all.sort((a, b) => b.ts - a.ts)
    return all.map((r) => r.id).slice(0, limit)
  } catch {
    return []
  }
}

export async function clearRecents() {
  try {
    await clear(DB_NAME, DB_VERSION, STORE)
  } catch {
    // ignore
  }
}
