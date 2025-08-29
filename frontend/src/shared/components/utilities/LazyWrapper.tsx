import React, { Suspense } from 'react'
import Loader from '@/shared/ui/loader'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ComponentType
}

export function LazyWrapper({
  children,
  fallback: Fallback = Loader
}: LazyWrapperProps) {
  return (
    <Suspense fallback={<Fallback />}>
      {children}
    </Suspense>
  )
}
