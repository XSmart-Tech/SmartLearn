import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface ValidationRule<T> {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: T) => string | null
}

interface FieldConfig<T> {
  initialValue: T
  rules?: ValidationRule<T>
}

interface FormField<T> {
  value: T
  error: string | null
  touched: boolean
}

type FormData<T extends Record<string, unknown>> = {
  [K in keyof T]: FormField<T[K]>
}

export function useFormValidation<T extends Record<string, unknown>>(
  config: { [K in keyof T]: FieldConfig<T[K]> }
) {
  const initialFormData = Object.keys(config).reduce((acc, key) => {
    acc[key as keyof T] = {
      value: config[key as keyof T].initialValue,
      error: null,
      touched: false
    }
    return acc
  }, {} as FormData<T>)

  const [formData, setFormData] = useState<FormData<T>>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback(<K extends keyof T>(key: K, value: T[K]): string | null => {
    const fieldConfig = config[key]
    if (!fieldConfig.rules) return null

    const rules = fieldConfig.rules

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Trường này là bắt buộc'
    }

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Phải có ít nhất ${rules.minLength} ký tự`
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Không được vượt quá ${rules.maxLength} ký tự`
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Định dạng không hợp lệ'
      }
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value)
    }

    return null
  }, [config])

  const setFieldValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
        error: prev[key].touched ? validateField(key, value) : prev[key].error
      }
    }))
  }, [validateField])

  const setFieldTouched = useCallback(<K extends keyof T>(key: K) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        touched: true,
        error: validateField(key, prev[key].value)
      }
    }))
  }, [validateField])

  const validateForm = useCallback((): boolean => {
    let hasErrors = false
    const newFormData = { ...formData }

    Object.keys(config).forEach(key => {
      const k = key as keyof T
      const error = validateField(k, newFormData[k].value)
      newFormData[k] = {
        ...newFormData[k],
        error,
        touched: true
      }
      if (error) hasErrors = true
    })

    setFormData(newFormData)
    return !hasErrors
  }, [config, formData, validateField])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setIsSubmitting(false)
  }, [initialFormData])

  const handleSubmit = useCallback(async (
    onSubmit: (values: { [K in keyof T]: T[K] }) => Promise<void> | void
  ) => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    setIsSubmitting(true)
    try {
      const values = Object.keys(formData).reduce((acc, key) => {
        acc[key as keyof T] = formData[key as keyof T].value
        return acc
      }, {} as { [K in keyof T]: T[K] })

      await onSubmit(values)
      resetForm()
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, resetForm])

  const getFieldProps = useCallback(<K extends keyof T>(key: K) => ({
    value: formData[key].value,
    onChange: (value: T[K]) => setFieldValue(key, value),
    onBlur: () => setFieldTouched(key),
    error: formData[key].error,
    touched: formData[key].touched
  }), [formData, setFieldValue, setFieldTouched])

  return {
    formData,
    isSubmitting,
    getFieldProps,
    setFieldValue,
    setFieldTouched,
    validateForm,
    resetForm,
    handleSubmit
  }
}
