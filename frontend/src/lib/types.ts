export interface Flashcard {
  id: string
  front: string
  back: string
  hint?: string
  tags?: string[]
  easiness?: number // SM-2
  interval?: number // days
  repetition?: number
  dueAt?: number // epoch ms
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