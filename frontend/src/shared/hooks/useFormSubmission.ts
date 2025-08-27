import { useState } from 'react'

export function useFormSubmission<T = void>(
  submitFn: () => Promise<T> | T,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      const result = await submitFn()
      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setError(null)
    setIsSubmitting(false)
  }

  return {
    submit,
    isSubmitting,
    error,
    reset
  }
}
