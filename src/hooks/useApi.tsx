import { useState, useCallback } from 'react'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(async (url: string, options: RequestInit = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Request failed with status ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      const data = contentType && contentType.includes('application/json') ? await response.json() : await response.text()

      setLoading(false)
      return data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'An error occurred')
      throw err // Re-throw the error to be caught by the component using the hook
    }
  }, [])

  return { loading, error, request }
}
