import { configureStore } from '@reduxjs/toolkit'
import auth from './authSlice'
import libraries from './librariesSlice'
import cards from './cardsSlice'

export const store = configureStore({ reducer: { auth, libraries, cards } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch