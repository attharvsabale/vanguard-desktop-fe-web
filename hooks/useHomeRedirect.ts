'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, type UserRole } from '@/store/authStore'

const ROLE_HOME: Record<UserRole, string> = {
  business_developer: '/bd/clients',
  relationship_manager: '/bd/clients', // TODO: dedicated RM dashboard
  planner: '/bd/clients', // TODO: dedicated planner dashboard
  client: '/bd/clients', // TODO: dedicated client dashboard
}

export const useHomeRedirect = () => {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!token) {
      router.replace('/login')
      return
    }
    const target = user?.role ? ROLE_HOME[user.role] : '/bd/clients'
    router.replace(target)
  }, [router, token, user])
}
