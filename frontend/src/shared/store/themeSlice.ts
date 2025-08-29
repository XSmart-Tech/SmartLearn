import { createSlice } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState { mode: ThemeMode }

// Function to get initial theme from localStorage
const getInitialTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved as ThemeMode
    }
  } catch (err) {
    console.error('Error reading theme from localStorage:', err)
  }
  return 'system' // fallback to system
}

const initial: ThemeState = { mode: getInitialTheme() }

const slice = createSlice({
	name: 'theme',
	initialState: initial,
	reducers: {
		setTheme(s, a: { payload: ThemeMode }) { s.mode = a.payload },
	},
})

export const { setTheme } = slice.actions
export default slice.reducer

