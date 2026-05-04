'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { forgotPassword } from '@/services/authService'
import type { OtpFormState } from '@/types/auth'

export const useOtpForm = (): OtpFormState => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const email = searchParams.get('email') ?? ''

  return {
    otp,
    email,
    error,
    loading,

    handleOtpChange: (event) => {
      setOtp(event.target.value)
    },

    handleSubmit: (event) => {
      event.preventDefault()

      if (otp.length !== 6) {
        setError('Invalid OTP. Please try again.')
        return
      }

      if (!email) {
        setError('Session expired. Please try again.')
        return
      }

      setError('')

      const params = new URLSearchParams({ email, otp })
      router.push(`/reset-password?${params.toString()}`)
    },

    handleResend: async () => {
      if (!email) {
        setError('Email missing. Please go back and try again.')
        return
      }

      try {
        setLoading(true)
        setError('')

        await forgotPassword(email)

        setError('OTP resent successfully')
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message || 'Failed to resend OTP'
        setError(message)
      } finally {
        setLoading(false)
      }
    },

    goToForgotPassword: () => {
      router.push('/forgot-password')
    },
  }
}
