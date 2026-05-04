'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useHomeRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])
}
