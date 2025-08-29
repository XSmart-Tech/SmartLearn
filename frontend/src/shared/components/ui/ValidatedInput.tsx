import { useState, useEffect } from 'react'
import { Input, Textarea } from '@/shared/ui'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

interface ValidatedInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  type?: 'input' | 'textarea'
  validator?: (value: string, t?: TFunction) => { isValid: boolean; error?: string }
  required?: boolean
  rows?: number
  autoFocus?: boolean
}

export function ValidatedInput({
  value,
  onChange,
  placeholder,
  label,
  type = 'input',
  validator,
  required = false,
  rows = 3,
  autoFocus = false
}: ValidatedInputProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (touched && validator) {
      const result = validator(value, t)
      setError(result.isValid ? null : result.error || t('common.invalidValue'))
    }
  }, [value, validator, touched, t])

  const handleChange = (newValue: string) => {
    onChange(newValue)
    if (!touched) setTouched(true)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const inputProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleChange(e.target.value),
    onBlur: handleBlur,
    placeholder,
    autoFocus,
    className: error ? 'border-destructive focus:border-destructive' : ''
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <Textarea {...inputProps} rows={rows} />
      ) : (
        <Input {...inputProps} />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
