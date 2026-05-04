'use client'

import LoginForm from '@/components/auth/LoginForm'
import { useLoginForm } from '@/hooks/useLoginForm'
import AuthLayout from '@/layouts/AuthLayout'

export default function LoginPage() {
  const form = useLoginForm()

  return (
    <AuthLayout>
      <LoginForm form={form} />
    </AuthLayout>
  )
}
