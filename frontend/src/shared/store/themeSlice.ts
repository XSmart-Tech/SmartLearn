import { createSlice } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState { mode: ThemeMode }

const initial: ThemeState = { mode: 'system' }

const slice = createSlice({
	name: 'theme',
	initialState: initial,
	reducers: {
		setTheme(s, a: { payload: ThemeMode }) { s.mode = a.payload },
	},
})

export const { setTheme } = slice.actions
export default slice.reducer

