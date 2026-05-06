/**
 * Clients API service.
 *
 * Real route (see docs/BACKEND_CONTRACT.md):
 *   GET /api/v1/clients?status=...   -> ClientListItem[]
 *
 * When USE_MOCK.clients is on, an in-memory list is returned with a small
 * simulated latency. Other services (e.g. onboardingService) can push new
 * clients into this list via `addMockClient()` so the Clients page reflects
 * what the BD has just started filling — exactly the way the real backend
 * would.
 */

import { api } from './api'
import { USE_MOCK, mockDelay } from './mock'
import type { ClientStatus } from '@/components/clients/StatusPill'

export interface ClientListItem {
  id: string
  name: string
  email: string
  status: ClientStatus
  bd_name: string
  rm_name: string | null
  goals_count?: number | null
}

const MOCK_STORAGE_KEY = 'vanguard:mock-clients'

const loadMockClients = (): ClientListItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ClientListItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const persistMockClients = (list: ClientListItem[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore quota errors */
  }
}

const MOCK_CLIENTS: ClientListItem[] = loadMockClients()

/**
 * Mock-only helper: insert (or upsert) a client into the local mock list so
 * the Clients page reflects newly-created clients as if the backend had
 * persisted them. No-op when not in mock mode.
 */
export const addMockClient = (client: ClientListItem) => {
  if (!USE_MOCK.clients) return
  const idx = MOCK_CLIENTS.findIndex((c) => c.id === client.id)
  if (idx >= 0) MOCK_CLIENTS[idx] = client
  else MOCK_CLIENTS.unshift(client) // newest first
  persistMockClients(MOCK_CLIENTS)
}

export const updateMockClientStatus = (
  clientId: string,
  status: ClientStatus
) => {
  if (!USE_MOCK.clients) return
  const c = MOCK_CLIENTS.find((c) => c.id === clientId)
  if (c) {
    c.status = status
    persistMockClients(MOCK_CLIENTS)
  }
}

export const listClients = async (): Promise<ClientListItem[]> => {
  if (USE_MOCK.clients) {
    await mockDelay(150)
    // Re-hydrate from storage so we always reflect the latest state, even
    // after a hot reload or returning from another route.
    const fresh = loadMockClients()
    if (fresh.length !== MOCK_CLIENTS.length) {
      MOCK_CLIENTS.length = 0
      MOCK_CLIENTS.push(...fresh)
    }
    return [...MOCK_CLIENTS]
  }
  const res = await api.get<ClientListItem[]>('/clients')
  return res.data
}
