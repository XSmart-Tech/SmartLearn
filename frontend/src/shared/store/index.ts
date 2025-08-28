// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import auth from './authSlice'
import libraries from './librariesSlice'
import cards from './cardsSlice'
import { libraryUsersReducer } from './libraryUsersSlice'
import theme from './themeSlice'
import { apiSlice } from './apiSlice'
import enhancedApiSlice from '@/shared/lib/enhancedCache'
import notifications from './notificationsSlice'

export const store = configureStore({
  reducer: {
    auth,
    libraries,
    cards,
    libraryUsers: libraryUsersReducer,
    theme,
    notifications,
    [apiSlice.reducerPath]: apiSlice.reducer,
    enhancedApi: enhancedApiSlice,
  },
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware()
    // Check if apiSlice has middleware and it's a function
    if (apiSlice.middleware && typeof apiSlice.middleware === 'function') {
      return middlewares.concat(apiSlice.middleware)
    }
    return middlewares
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
