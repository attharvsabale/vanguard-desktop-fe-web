'use client'

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { useForgotPasswordForm } from '@/hooks/useForgotPasswordForm'
import AuthLayout from '@/layouts/AuthLayout'

export default function ForgotPasswordPage() {
  const form = useForgotPasswordForm()

  return (
    <AuthLayout>
      <ForgotPasswordForm form={form} />
    </AuthLayout>
  )
}
