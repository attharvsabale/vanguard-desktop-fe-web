'use client'

import { ArrowLeft, Mail } from 'lucide-react'
import AuthCard from './AuthCard'
import { getValidationClasses } from './inputHelpers'
import type { ForgotPasswordFormState } from '../../types/auth'

type ForgotPasswordFormProps = {
  form: ForgotPasswordFormState
}

export default function ForgotPasswordForm({ form }: ForgotPasswordFormProps) {
  const showError = form.touched && Boolean(form.error)

  return (
    <AuthCard>
      <button
        type="button"
        onClick={form.goToLogin}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-body"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Back to login</span>
      </button>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-display">
        Forgot password
      </h2>
      <p className="text-sm text-gray-600 mb-6 font-body">
        We&apos;ll send a 6-digit OTP to your email
      </p>

      <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="forgot-email"
            className="block text-sm font-medium text-gray-700 mb-1 font-body"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={form.email}
              onChange={form.handleEmailChange}
              onBlur={form.handleEmailBlur}
              aria-invalid={showError}
              aria-describedby={showError ? 'forgot-email-error' : undefined}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-gray-50 font-body transition placeholder:text-gray-400 outline-none ${getValidationClasses(
                showError,
              )} focus:outline-none focus:ring-2`}
            />
          </div>
          {showError && (
            <p
              id="forgot-email-error"
              className="text-red-600 text-xs mt-1.5 font-body"
            >
              {form.error}
            </p>
          )}
        </div>

       <button
        type="submit"
        disabled={form.loading}
        className={`w-full py-2.5 px-4 text-sm font-semibold text-white rounded-lg transition font-body flex items-center justify-center ${
          form.loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#142952] hover:bg-[#0f2146] active:bg-[#0b1b3a]'
        }`}
      >
       {form.loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Sending...
          </span>
        ) : (
          "Send OTP"
        )}
      </button>
      </form>
    </AuthCard>
  )
}
