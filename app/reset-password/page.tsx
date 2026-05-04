'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { useResetPasswordForm } from '@/hooks/useResetPasswordForm'
import AuthLayout from '@/layouts/AuthLayout'

function ResetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const form = useResetPasswordForm()

  const email = searchParams.get('email')
  const otp = searchParams.get('otp')

  useEffect(() => {
    if (!email || !otp) {
      router.replace('/forgot-password')
    }
  }, [email, otp, router])

  if (!email || !otp) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <ResetPasswordForm form={form} />
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  )
}
