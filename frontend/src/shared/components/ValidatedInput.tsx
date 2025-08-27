import { useState, useEffect } from 'react'
import { Input, Textarea } from '@/shared/ui'

interface ValidatedInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  type?: 'input' | 'textarea'
  validator?: (value: string) => { isValid: boolean; error?: string }
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
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (touched && validator) {
      const result = validator(value)
      setError(result.isValid ? null : result.error || 'Invalid value')
    }
  }, [value, validator, touched])

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
    className: error ? 'border-red-500 focus:border-red-500' : ''
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <Textarea {...inputProps} rows={rows} />
      ) : (
        <Input {...inputProps} />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
