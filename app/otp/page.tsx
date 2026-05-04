'use client'

import { Suspense } from 'react'
import OtpForm from '@/components/auth/OtpForm'
import { useOtpForm } from '@/hooks/useOtpForm'
import AuthLayout from '@/layouts/AuthLayout'

function OtpPageContent() {
  const form = useOtpForm()

  return (
    <AuthLayout>
      <OtpForm form={form} />
    </AuthLayout>
  )
}

export default function OtpPage() {
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
      <OtpPageContent />
    </Suspense>
  )
}
