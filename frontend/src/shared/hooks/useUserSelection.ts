import { useState } from 'react'
import type { PublicUser } from '@/shared/lib/types'

export function useUserSelection() {
  const [target, setTarget] = useState<PublicUser | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = () => {
    setTarget(null)
    setIsSubmitting(false)
  }

  const canSubmit = !!target && !isSubmitting

  return {
    target,
    setTarget,
    isSubmitting,
    setIsSubmitting,
    canSubmit,
    reset
  }
}
