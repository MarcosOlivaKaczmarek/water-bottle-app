import { useState, useEffect } from 'react'

function useLocalStorage<T>(localStorageKey: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(localStorageKey)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      return initialValue // Fallback to initial value if localStorage fails
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(localStorageKey, JSON.stringify(value))
    } catch (error) {
      console.error("Error setting localStorage:", error)
      // In-memory fallback
      // This is a simplified example; a more robust solution might be needed for complex data
    }
  }, [localStorageKey, value])

  return [value, setValue] as const
}

export default useLocalStorage