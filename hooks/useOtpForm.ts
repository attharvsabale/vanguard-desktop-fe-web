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
  const [success, setSuccess] = useState('')

  const [loading, setLoading] = useState(false) // verify OTP
  const [resendLoading, setResendLoading] = useState(false) // resend OTP

  const email = searchParams.get('email') ?? ''

  return {
    otp,
    email,
    error,
    success,
    loading,
    resendLoading,

   
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
      setSuccess('')
      setLoading(true)

      try {
        const params = new URLSearchParams({ email, otp })
        router.push(`/reset-password?${params.toString()}`)
      } finally {
        setLoading(false)
      }
    },

    // 🔹 Resend OTP
    handleResend: async () => {
      if (!email) {
        setError('Email missing. Please go back and try again.')
        return
      }

      try {
        setResendLoading(true)
        setError('')
        setSuccess('')

        // 👇 THIS is the key change
        await Promise.all([
          forgotPassword(email),
          new Promise((res) => setTimeout(res, 700)) // force spinner visibility
        ])

        setSuccess('OTP resent successfully')
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message || 'Failed to resend OTP'

        setError(message)
      } finally {
        setResendLoading(false)
      }
    },

    // 🔹 Go back
    goToForgotPassword: () => {
      router.push('/forgot-password')
    },
  }
}