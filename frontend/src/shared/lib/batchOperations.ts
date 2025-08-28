import { writeBatch, doc, collection, type WriteBatch, type DocumentData } from 'firebase/firestore'
import { db } from './firebase'

export interface BatchOperation {
  type: 'create' | 'update' | 'delete'
  collection: string
  id?: string
  data?: DocumentData
}

export class BatchManager {
  private batch: WriteBatch
  private operations: BatchOperation[] = []

  constructor() {
    this.batch = writeBatch(db)
  }

  // Add create operation
  create(collectionName: string, data: DocumentData): string {
    const docRef = doc(collection(db, collectionName))
    this.batch.set(docRef, data)
    this.operations.push({ type: 'create', collection: collectionName, data })
    return docRef.id
  }

  // Add update operation
  update(collectionName: string, id: string, data: Partial<DocumentData>): void {
    const docRef = doc(db, collectionName, id)
    this.batch.update(docRef, data)
    this.operations.push({ type: 'update', collection: collectionName, id, data })
  }

  // Add delete operation
  delete(collectionName: string, id: string): void {
    const docRef = doc(db, collectionName, id)
    this.batch.delete(docRef)
    this.operations.push({ type: 'delete', collection: collectionName, id })
  }

  // Execute all operations
  async commit(): Promise<void> {
    if (this.operations.length === 0) return

    try {
      await this.batch.commit()
      this.operations = []
    } catch (error) {
      // Reset batch on error
      this.batch = writeBatch(db)
      throw error
    }
  }

  // Get operation count
  get size(): number {
    return this.operations.length
  }

  // Check if batch is empty
  get isEmpty(): boolean {
    return this.operations.length === 0
  }
}

// Utility function to create optimized batches
export function createOptimizedBatch(): BatchManager {
  return new BatchManager()
}

// Bulk operations for common patterns
export async function bulkCreateCards(libraryId: string, cards: Array<{ front: string; back: string; [key: string]: unknown }>): Promise<string[]> {
  const batch = createOptimizedBatch()
  const cardIds: string[] = []

  for (const card of cards) {
    const cardId = batch.create('cards', {
      ...card,
      libraryId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    cardIds.push(cardId)
  }

  await batch.commit()
  return cardIds
}

export async function bulkUpdateCards(updates: Array<{ id: string; data: Partial<DocumentData> }>): Promise<void> {
  const batch = createOptimizedBatch()

  for (const update of updates) {
    batch.update('cards', update.id, {
      ...update.data,
      updatedAt: Date.now()
    })
  }

  await batch.commit()
}

export async function bulkDeleteCards(cardIds: string[]): Promise<void> {
  const batch = createOptimizedBatch()

  for (const id of cardIds) {
    batch.delete('cards', id)
  }

  await batch.commit()
}
