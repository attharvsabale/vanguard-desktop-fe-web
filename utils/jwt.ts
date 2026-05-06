/**
 * Decode the payload of a JWT without verifying signature.
 * Browser-safe (uses atob). Returns null on any failure.
 */
export const decodeJwt = <T = Record<string, unknown>>(token: string): T | null => {
    try {
        const [, payload] = token.split('.')
        if (!payload) return null
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
        const json = typeof window !== 'undefined' ? window.atob(padded) : Buffer.from(padded, 'base64').toString('utf-8')
        return JSON.parse(json) as T
    } catch {
        return null
    }
}
