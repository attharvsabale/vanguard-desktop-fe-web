import { api } from './api'
import { USE_MOCK, mockDelay, mockJwt, mockUuid } from './mock'
import type { LoginCredentials } from '../types/auth'
import type { UserRole } from '@/store/authStore'

export interface LoginResponse {
  access_token: string
  token_type?: string
  user?: {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'bd-user-1',
  name: 'Rahul Joshi',
  email: 'bd@vanguard.test',
  role: 'business_developer' as UserRole,
}

// ── API ────────────────────────────────────────────────────────────────────

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  if (USE_MOCK.auth) {
    await mockDelay(400)
    const user = {
      ...MOCK_USER,
      email: credentials.email || MOCK_USER.email,
      name: deriveName(credentials.email) || MOCK_USER.name,
    }
    const token = mockJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    return { access_token: token, token_type: 'Bearer', user }
  }
  const res = await api.post<LoginResponse>('/auth/login', credentials)
  return res.data
}

export const signup = async (data: {
  name: string
  email: string
  password: string
}) => {
  if (USE_MOCK.auth) {
    await mockDelay(400)
    return { id: mockUuid(), email: data.email, name: data.name }
  }
  const res = await api.post('/auth/signup', data)
  return res.data
}

export const forgotPassword = async (email: string) => {
  if (USE_MOCK.auth) {
    await mockDelay(300)
    return { message: 'OTP sent', email }
  }
  const res = await api.post('/auth/forgot-password', { email })
  return res.data
}

export const resetPassword = async (data: {
  email: string
  otp: string
  new_password: string
}) => {
  if (USE_MOCK.auth) {
    await mockDelay(300)
    return { message: 'Password reset', email: data.email }
  }
  const res = await api.post('/auth/reset-password', data)
  return res.data
}

// ── Helpers ────────────────────────────────────────────────────────────────

const deriveName = (email?: string): string | null => {
  if (!email) return null
  const local = email.split('@')[0]
  if (!local) return null
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}
