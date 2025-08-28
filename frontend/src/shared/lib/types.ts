export interface Flashcard {
  id: string
  front: string
  back: string
  description?: string
  // SM-2 fields were removed from the public Flashcard shape.
  // Internal scheduling values are stored but not part of the typed model here.
  createdAt: number
  updatedAt: number,
  libraryId: string
}

export interface Library {
  id: string
  name: string
  description?: string
  ownerId: string
  // list of user ids (excluding the owner) who the library is shared with
  share: string[]
  shareRoles: Record<string, 'contributor' | 'viewer'>
  createdAt: number
  updatedAt: number
  cardCount?: number
}

export interface PublicUser {
  uid: string
  displayName: string
  email: string
  photoURL: string
}

export interface Notification {
  id: string
  type: 'card_request'
  recipientId: string // owner uid
  senderId: string // contributor uid
  libraryId: string
  data: {
    cards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[]
    message?: string
  }
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: number
  updatedAt: number
}
