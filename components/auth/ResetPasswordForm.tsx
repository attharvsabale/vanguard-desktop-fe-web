'use client'

import { Eye, EyeOff, Lock } from 'lucide-react'
import AuthCard from './AuthCard'
import { getValidationClasses } from './inputHelpers'
import type { ResetPasswordFormState } from '../../types/auth'

type ResetPasswordFormProps = {
  form: ResetPasswordFormState
}

export default function ResetPasswordForm({ form }: ResetPasswordFormProps) {
  return (
    <AuthCard>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-display">
        Set new password
      </h2>
      <p className="text-sm text-gray-600 mb-6 font-body">
        Choose a strong password for your account
      </p>

      <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700 mb-1 font-body"
          >
            New password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              id="new-password"
              type={form.showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={form.password}
              onChange={form.handlePasswordChange}
              className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-gray-50 font-body transition placeholder:text-gray-400 outline-none ${getValidationClasses(
                Boolean(form.error),
              )} focus:outline-none focus:ring-2`}
            />
            <button
              type="button"
              aria-label={form.showPassword ? 'Hide password' : 'Show password'}
              onClick={() => form.setShowPassword(!form.showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {form.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 mb-1 font-body"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              id="confirm-password"
              type={form.showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={form.handleConfirmChange}
              className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-gray-50 font-body transition placeholder:text-gray-400 outline-none ${getValidationClasses(
                Boolean(form.error),
              )} focus:outline-none focus:ring-2`}
            />
            <button
              type="button"
              aria-label={form.showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => form.setShowConfirm(!form.showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {form.showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {form.error && (
          <p className="text-red-600 text-xs font-body">{form.error}</p>
        )}

        <button
          type="submit"
          disabled={form.loading}
          className={`w-full py-2.5 px-4 text-sm font-semibold text-white rounded-lg transition font-body ${
            form.loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#142952] hover:bg-[#0f2146] active:bg-[#0b1b3a]'
          }`}
        >
          {form.loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </AuthCard>
  )
}
