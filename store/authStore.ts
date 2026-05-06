'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { decodeJwt } from '@/utils/jwt'

export type UserRole =
    | 'business_developer'
    | 'relationship_manager'
    | 'planner'
    | 'client'

export interface AuthUser {
    id: string
    email: string
    name: string
    role: UserRole
}

interface AuthState {
    token: string | null
    user: AuthUser | null
    setSession: (token: string, user?: Partial<AuthUser>) => void
    clearSession: () => void
}

// JWT payload shape we expect from the backend.
interface JwtPayload {
    user_id?: string
    sub?: string
    email?: string
    name?: string
    role?: UserRole
    exp?: number
}

const buildUserFromToken = (
    token: string,
    override?: Partial<AuthUser>
): AuthUser | null => {
    const payload = decodeJwt<JwtPayload>(token)
    if (!payload) return override?.id && override?.email && override?.name && override?.role
        ? (override as AuthUser)
        : null

    const user: AuthUser = {
        id: override?.id ?? payload.user_id ?? payload.sub ?? '',
        email: override?.email ?? payload.email ?? '',
        name: override?.name ?? payload.name ?? '',
        role: override?.role ?? (payload.role as UserRole) ?? 'client',
    }
    return user.id ? user : null
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,

            setSession: (token, override) => {
                // Keep raw token in localStorage for the axios interceptor.
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem('token', token)
                }
                const user = buildUserFromToken(token, override)
                set({ token, user })
            },

            clearSession: () => {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('token')
                }
                set({ token: null, user: null })
            },
        }),
        {
            name: 'vanguard:auth',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined'
                    ? window.localStorage
                    : (undefined as unknown as Storage)
            ),
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
)

// Helper for non-React code paths.
export const getInitials = (name: string): string =>
    name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
