'use client'

import { ArrowLeft, KeyRound } from 'lucide-react'
import AuthCard from './AuthCard'
import { getValidationClasses } from './inputHelpers'
import type { OtpFormState } from '../../types/auth'

type OtpFormProps = {
  form: OtpFormState
}

export default function OtpForm({ form }: OtpFormProps) {
  return (
    <AuthCard>
      <button
        type="button"
        onClick={form.goToForgotPassword}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-body"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Back</span>
      </button>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-display">
        Enter OTP
      </h2>
      <p className="text-sm text-gray-600 mb-6 font-body">
        A 6-digit code was sent to{' '}
        <span className="font-semibold text-gray-900">{form.email}</span>
      </p>

      <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="otp-code"
            className="block text-sm font-medium text-gray-700 mb-1 font-body"
          >
            6-digit code
          </label>
          <div className="relative">
            <KeyRound
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              value={form.otp}
              onChange={form.handleOtpChange}
              className={`w-full pl-10 pr-4 py-2.5 text-center text-base tracking-[0.3em] border rounded-lg bg-gray-50 font-body transition outline-none ${getValidationClasses(
                Boolean(form.error),
              )} focus:outline-none focus:ring-2`}
            />
          </div>
          {form.error && (
            <p className="text-red-600 text-xs mt-1.5 font-body">{form.error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.loading || form.otp.length !== 6}
          className={`w-full py-2.5 px-4 text-sm font-semibold text-white rounded-lg transition font-body ${
            form.loading || form.otp.length !== 6
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#142952] hover:bg-[#0f2146] active:bg-[#0b1b3a]'
          }`}
        >
          {form.loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <p className="text-xs text-center mt-4 text-gray-500 font-body">
        Didn&apos;t receive the code?{' '}
        <button
          type="button"
          onClick={form.handleResend}
          disabled={form.loading}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
        >
          Resend
        </button>
      </p>
    </AuthCard>
  )
}
