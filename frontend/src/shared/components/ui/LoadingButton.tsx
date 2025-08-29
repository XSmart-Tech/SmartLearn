import React from 'react'
import { Button } from '@/shared/ui'
import { Loader2 } from 'lucide-react'
import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from '@/shared/ui/variants'
import { useTranslation } from 'react-i18next'

interface LoadingButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
  asChild?: boolean
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, children, disabled, ...props }, ref) => {
    const { t } = useTranslation()

    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? (loadingText || t('common.processing')) : children}
      </Button>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'
