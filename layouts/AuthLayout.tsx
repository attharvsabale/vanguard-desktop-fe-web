import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 font-display">FinanceTest</h1>
        <p className="text-gray-600 text-sm mt-2 font-body">
          Financial Planning Platform
        </p>
      </div>
      {children}
    </div>
  )
}
