import { useState, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  retry: () => void
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): ApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      setData(result)
      setRetryCount(0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)

      // Auto-retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          execute()
        }, Math.pow(2, retryCount) * 1000) // Exponential backoff
      }
    } finally {
      setLoading(false)
    }
  }, [apiCall, retryCount, maxRetries])

  const retry = useCallback(() => {
    setRetryCount(0)
    execute()
  }, [execute])

  return { data, loading, error, retry }
}

// Hook for simple API calls with loading and error states
export function useSimpleApi<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, call }
}