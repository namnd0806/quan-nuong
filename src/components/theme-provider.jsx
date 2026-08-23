import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {}, toggle: () => {} })

export function ThemeProvider({ children, defaultTheme = 'dark', storageKey = 'qn-theme' }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme
    return localStorage.getItem(storageKey) || defaultTheme
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
