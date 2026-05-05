import type { ChangeEvent, FormEvent } from 'react'

export type LoginErrors = {
  email: string
  password: string
}

export type LoginTouched = {
  email: boolean
  password: boolean
}

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginFormState = {
  email: string
  password: string
  showPassword: boolean
  loading: boolean
  errors: LoginErrors
  touched: LoginTouched
  setShowPassword: (showPassword: boolean) => void
  handleEmailChange: (event: ChangeEvent<HTMLInputElement>) => void
  handlePasswordChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleEmailBlur: () => void
  handlePasswordBlur: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  goToForgotPassword: () => void
}

export type ForgotPasswordFormState = {
  email: string
  error: string
  touched: boolean
  loading: boolean;
  handleEmailChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleEmailBlur: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  goToLogin: () => void
}

export type OtpFormState = {
  otp: string
  email: string
  error: string
  loading: boolean
  resendLoading: boolean
  success: string
  handleOtpChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (event: React.FormEvent) => void
  handleResend: () => Promise<void>
  goToForgotPassword: () => void
}

export type ResetPasswordFormState = {
  password: string
  confirm: string
  showPassword: boolean
  showConfirm: boolean
  error: string
  loading: boolean
  setShowPassword: (value: boolean) => void
  setShowConfirm: (value: boolean) => void
  handlePasswordChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleConfirmChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}
