'use client'

import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import AuthCard from './AuthCard'
import { getValidationClasses } from './inputHelpers'
import type { LoginFormState } from '../../types/auth'

type LoginFormProps = {
  form: LoginFormState
}

export default function LoginForm({ form }: LoginFormProps) {
  return (
    <AuthCard>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-display">Sign in</h2>
      <p className="text-sm text-gray-600 mb-6 font-body">
        Enter your credentials to continue
      </p>

      <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
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
              id="login-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={form.email}
              onChange={form.handleEmailChange}
              onBlur={form.handleEmailBlur}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-gray-50 font-body transition placeholder:text-gray-400 ${getValidationClasses(Boolean(form.touched.email && form.errors.email))} focus:outline-none focus:ring-2`}
            />
          </div>
          {form.touched.email && form.errors.email && (
            <p className="text-red-600 text-xs mt-1.5 font-body">{form.errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-gray-700 mb-1 font-body"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              id="login-password"
              type={form.showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={form.handlePasswordChange}
              onBlur={form.handlePasswordBlur}
              className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-gray-50 font-body transition placeholder:text-gray-400 ${getValidationClasses(Boolean(form.touched.password && form.errors.password))} focus:outline-none focus:ring-2`}
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
          {form.touched.password && form.errors.password && (
            <p className="text-red-600 text-xs mt-1.5 font-body">{form.errors.password}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={form.goToForgotPassword}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium font-body"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={form.loading}
          className={`w-full py-2.5 px-4 text-sm font-semibold text-white rounded-lg transition font-body
            ${
              form.loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#142952] hover:bg-[#0f2146] active:bg-[#0b1b3a]'
            }`}
        >
          {form.loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  )
}
