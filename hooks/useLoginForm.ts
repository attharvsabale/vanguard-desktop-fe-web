'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

import type {
  LoginErrors,
  LoginFormState,
  LoginTouched,
} from '@/types/auth'

const validateEmail = (
  value: string
) => {
  if (!value)
    return 'Email is required'

  if (!value.includes('@'))
    return 'Enter a valid email address'

  return ''
}

const validatePassword = (
  value: string
) => {
  if (!value)
    return 'Password is required'

  return ''
}

export const useLoginForm =
  (): LoginFormState => {

    const router = useRouter()
    const setSession = useAuthStore((s) => s.setSession)

    const [email, setEmail] =
      useState('')

    const [
      password,
      setPassword,
    ] = useState('')

    const [
      showPassword,
      setShowPassword,
    ] = useState(false)

    const [loading, setLoading] =
      useState(false)

    const [errors, setErrors] =
      useState<LoginErrors>({
        email: '',
        password: '',
      })

    const [touched, setTouched] =
      useState<LoginTouched>({
        email: false,
        password: false,
      })

    return {
      email,
      password,
      showPassword,
      loading,
      errors,
      touched,

      setShowPassword,

      handleEmailChange: (
        event
      ) => {

        const value =
          event.target.value

        setEmail(value)

        setTouched((prev) => ({
          ...prev,
          email: true,
        }))

        setErrors((prev) => ({
          ...prev,
          email:
            validateEmail(value),
        }))
      },

      handlePasswordChange: (
        event
      ) => {

        const value =
          event.target.value

        setPassword(value)

        setTouched((prev) => ({
          ...prev,
          password: true,
        }))

        setErrors((prev) => ({
          ...prev,
          password:
            validatePassword(
              value
            ),
        }))
      },

      handleEmailBlur: () => {
        setTouched((prev) => ({
          ...prev,
          email: true,
        }))
      },

      handlePasswordBlur: () => {
        setTouched((prev) => ({
          ...prev,
          password: true,
        }))
      },

      handleSubmit: async (
        event
      ) => {

        event.preventDefault()

        const emailError =
          validateEmail(email)

        const passwordError =
          validatePassword(
            password
          )

        setErrors({
          email: emailError,
          password:
            passwordError,
        })

        setTouched({
          email: true,
          password: true,
        })

        if (
          !emailError &&
          !passwordError
        ) {

          try {

            setLoading(true)

            const response =
              await login({
                email,
                password,
              })

            // Persist session: token + decoded user (also keeps localStorage 'token' for axios)
            setSession(response.access_token, {
              email: response.user?.email ?? email,
              name: response.user?.name,
              id: response.user?.id,
              role: response.user?.role,
            })

            router.push('/home')

          } catch (
          err: unknown
          ) {

            const message =
              (err as {
                response?: {
                  data?: {
                    error?: {
                      message?: string
                    }
                  }
                }
              })
                ?.response?.data?.error
                ?.message
              || 'Invalid credentials'

            setErrors({
              email: '',
              password:
                message,
            })

          } finally {

            setLoading(false)
          }
        }
      },

      goToForgotPassword:
        () => {

          router.push(
            '/forgot-password'
          )
        },
    }
  }