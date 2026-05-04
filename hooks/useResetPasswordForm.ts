'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '@/services/authService'
import type { ResetPasswordFormState } from '@/types/auth'

export const useResetPasswordForm = (): ResetPasswordFormState => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const email = searchParams.get('email') ?? ''
  const otp = searchParams.get('otp') ?? ''

  return {
    password,
    confirm,
    showPassword,
    showConfirm,
    error,
    loading,

    setShowPassword,
    setShowConfirm,

    handlePasswordChange: (e) => {
      setPassword(e.target.value)
    },

    handleConfirmChange: (e) => {
      setConfirm(e.target.value)
    },

    handleSubmit: async (e) => {
      e.preventDefault()

      if (!password || !confirm) {
        setError('All fields are required')
        return
      }

      if (password !== confirm) {
        setError('Passwords do not match')
        return
      }

      if (!email || !otp) {
        setError('Session expired. Please try again.')
        return
      }

      try {
        setLoading(true)
        setError('')

        await resetPassword({
          email,
          otp,
          new_password: password,
        })

        alert('Password reset successful')
        router.push('/login')
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message || 'Failed to reset password'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
  }
}
