import type { ReactNode } from 'react'

type AuthCardProps = {
  children: ReactNode
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-md border border-gray-100">
      {children}
    </div>
  )
}
