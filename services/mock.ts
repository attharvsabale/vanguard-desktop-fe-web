/**
 * Single mock-mode toggle for the whole frontend.
 *
 * When NEXT_PUBLIC_USE_MOCK=1 is set in .env.local, every service short-
 * circuits its network call with a fake response (with a small artificial
 * latency so loading states still render). Per-service flags
 * (NEXT_PUBLIC_USE_MOCK_CLIENTS / NEXT_PUBLIC_USE_MOCK_ONBOARDING) are
 * still honoured for fine-grained overrides if you ever need them.
 *
 * Flip to 0 (or remove the line) once the backend is ready.
 */

const truthy = (v: string | undefined) => v === '1' || v === 'true'

export const USE_MOCK_GLOBAL = truthy(process.env.NEXT_PUBLIC_USE_MOCK)

export const USE_MOCK = {
    auth: USE_MOCK_GLOBAL || truthy(process.env.NEXT_PUBLIC_USE_MOCK_AUTH),
    clients: USE_MOCK_GLOBAL || truthy(process.env.NEXT_PUBLIC_USE_MOCK_CLIENTS),
    onboarding:
        USE_MOCK_GLOBAL || truthy(process.env.NEXT_PUBLIC_USE_MOCK_ONBOARDING),
} as const

export const mockDelay = (ms = 300) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms))

export const mockUuid = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

/**
 * Build a JWT-shaped string carrying the given payload. Not signed —
 * just for local mock use so authStore.decodeJwt() can read it.
 */
export const mockJwt = (payload: Record<string, unknown>): string => {
    const b64 = (obj: unknown) =>
        btoa(JSON.stringify(obj))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
    const header = b64({ alg: 'none', typ: 'JWT' })
    const body = b64({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    })
    // Empty signature segment.
    return `${header}.${body}.mock`
}
