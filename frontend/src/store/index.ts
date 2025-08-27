// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import auth from './authSlice'
import libraries from './librariesSlice'
import cards from './cardsSlice'
import { libraryUsersReducer } from './libraryUsersSlice'
import theme from './themeSlice'

export const store = configureStore({
  reducer: {
    auth,
    libraries,
    cards,
    libraryUsers: libraryUsersReducer,
  theme,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
