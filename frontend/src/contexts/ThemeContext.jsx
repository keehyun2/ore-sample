import { createContext, useContext, useState } from 'react'
import PropTypes from 'prop-types'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [prismTheme, setPrismTheme] = useState('default')

  return (
    <ThemeContext.Provider value={{ prismTheme, setPrismTheme }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
