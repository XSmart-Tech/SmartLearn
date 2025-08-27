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