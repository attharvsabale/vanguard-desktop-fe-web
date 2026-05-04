'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { forgotPassword } from '@/services/authService'
import type { ForgotPasswordFormState } from '@/types/auth'

const validateEmail = (value: string) => {
  if (!value) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
  return ''
}

export const useForgotPasswordForm = (): ForgotPasswordFormState => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)

  return {
    email,
    error,
    touched,
    loading,

    handleEmailChange: (event) => {
      const value = event.target.value
      setEmail(value)
      if (touched) {
        setError(validateEmail(value))
      }
    },

    handleEmailBlur: () => {
      setTouched(true)
      setError(validateEmail(email))
    },

    handleSubmit: async (event) => {
      event.preventDefault()

      const emailError = validateEmail(email)
      setTouched(true)
      setError(emailError)

      if (emailError) return

      try {
        setLoading(true)
        setError('')

        await forgotPassword(email)

        const params = new URLSearchParams({ email })
        router.push(`/otp?${params.toString()}`)
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message || 'Failed to send reset link'
        setError(message)
      } finally {
        setLoading(false)
      }
    },

    goToLogin: () => {
      router.push('/login')
    },
  }
}
