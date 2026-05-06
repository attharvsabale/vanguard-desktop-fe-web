/**
 * Onboarding API service.
 *
 * When USE_MOCK.onboarding is on, every endpoint short-circuits with a
 * faked response (with small simulated latency). Useful for UI work
 * while the backend is offline. All payloads are still validated through
 * the same zod schemas, so the data contract is identical.
 *
 * Real mode:
 *   POST   /api/v1/onboarding/personal
 *   GET    /api/v1/onboarding/{id}/personal
 *   GET    /api/v1/onboarding/{id}/status
 *   POST   /api/v1/onboarding/{id}/nominees
 *   GET    /api/v1/onboarding/{id}/nominees
 *   PUT    /api/v1/onboarding/{id}/nominees/{nomineeId}
 *   DELETE /api/v1/onboarding/{id}/nominees/{nomineeId}
 */

import { api } from './api'
import { USE_MOCK, mockDelay, mockUuid } from './mock'
import { addMockClient } from './clientsService'
import { useAuthStore } from '@/store/authStore'
import type {
  PersonalDetailsPayload,
  NomineePayload,
  IncomeExpensesPayload,
} from '@/schemas/onboarding'

// ── Wire types ──────────────────────────────────────────────────────────────

export interface OnboardingCreatedResponse {
  onboarding_id: string
  client_id: string
}

export interface PersonalDetailsResponse extends Partial<PersonalDetailsPayload> {
  id: string
  created_at: string
  updated_at: string
}

export interface OnboardingStatusResponse {
  id: string
  client_id: string
  assigned_bd_id: string
  assigned_rm_id: string | null
  onboarding_status: 'pending_bd' | 'pending_rm' | 'completed'
  bd_submitted_at: string | null
  rm_submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface NomineeResponse extends Partial<NomineePayload> {
  id: string
  created_at: string
  updated_at: string
}

const ONBOARDING = '/onboarding'

const log = (label: string, data?: unknown) =>
  // eslint-disable-next-line no-console
  console.info(`[mock] ${label}`, data ?? '')

// ── Personal ────────────────────────────────────────────────────────────────

export const createPersonalDetails = async (
  payload: PersonalDetailsPayload
): Promise<OnboardingCreatedResponse> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(500)
    log('POST /onboarding/personal', payload)
    const onboarding_id = mockUuid()
    const client_id = mockUuid()
    // Reflect the new client in the Clients list (mock-only).
    const bdName =
      useAuthStore.getState().user?.name ?? 'BD User'
    addMockClient({
      id: client_id,
      name: payload.full_name,
      email: payload.email,
      status: 'bd-progress',
      bd_name: bdName,
      rm_name: null,
    })
    return { onboarding_id, client_id }
  }
  const res = await api.post<OnboardingCreatedResponse>(`${ONBOARDING}/personal`, payload)
  return res.data
}

export const getPersonalDetails = async (
  onboardingId: string
): Promise<PersonalDetailsResponse> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(200)
    return {
      id: onboardingId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  const res = await api.get<PersonalDetailsResponse>(`${ONBOARDING}/${onboardingId}/personal`)
  return res.data
}

// ── Status ──────────────────────────────────────────────────────────────────

export const getOnboardingStatus = async (
  onboardingId: string
): Promise<OnboardingStatusResponse> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(150)
    const now = new Date().toISOString()
    return {
      id: onboardingId,
      client_id: mockUuid(),
      assigned_bd_id: mockUuid(),
      assigned_rm_id: null,
      onboarding_status: 'pending_bd',
      bd_submitted_at: null,
      rm_submitted_at: null,
      created_at: now,
      updated_at: now,
    }
  }
  const res = await api.get<OnboardingStatusResponse>(
    `${ONBOARDING}/${onboardingId}/status`
  )
  return res.data
}

// ── Nominees ───────────────────────────────────────────────────────────────

export const addNominee = async (
  onboardingId: string,
  payload: NomineePayload
): Promise<NomineeResponse> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(400)
    log(`POST /onboarding/${onboardingId}/nominees`, payload)
    const now = new Date().toISOString()
    return { id: mockUuid(), created_at: now, updated_at: now, ...payload }
  }
  const res = await api.post<NomineeResponse>(
    `${ONBOARDING}/${onboardingId}/nominees`,
    payload
  )
  return res.data
}

export const listNominees = async (onboardingId: string): Promise<NomineeResponse[]> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(150)
    return []
  }
  const res = await api.get<NomineeResponse[]>(
    `${ONBOARDING}/${onboardingId}/nominees`
  )
  return res.data
}

export const updateNominee = async (
  onboardingId: string,
  nomineeId: string,
  payload: NomineePayload
): Promise<NomineeResponse> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(300)
    log(`PUT /onboarding/${onboardingId}/nominees/${nomineeId}`, payload)
    const now = new Date().toISOString()
    return { id: nomineeId, created_at: now, updated_at: now, ...payload }
  }
  const res = await api.put<NomineeResponse>(
    `${ONBOARDING}/${onboardingId}/nominees/${nomineeId}`,
    payload
  )
  return res.data
}

export const deleteNominee = async (
  onboardingId: string,
  nomineeId: string
): Promise<void> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(200)
    log(`DELETE /onboarding/${onboardingId}/nominees/${nomineeId}`)
    return
  }
  await api.delete(`${ONBOARDING}/${onboardingId}/nominees/${nomineeId}`)
}

// ── Income & Expenses ──────────────────────────────────────────────────────

export interface IncomeExpensesResponse extends IncomeExpensesPayload {
  id: string
  onboarding_id: string
  created_at: string
  updated_at: string
}

export const saveIncomeExpenses = async (
  onboardingId: string,
  payload: IncomeExpensesPayload
): Promise<IncomeExpensesResponse> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(450)
    log(`PUT /onboarding/${onboardingId}/income-expenses`, payload)
    const now = new Date().toISOString()
    return {
      id: mockUuid(),
      onboarding_id: onboardingId,
      created_at: now,
      updated_at: now,
      ...payload,
    }
  }
  const res = await api.put<IncomeExpensesResponse>(
    `${ONBOARDING}/${onboardingId}/income-expenses`,
    payload
  )
  return res.data
}

export const getIncomeExpenses = async (
  onboardingId: string
): Promise<IncomeExpensesResponse | null> => {
  if (USE_MOCK.onboarding) {
    await mockDelay(150)
    return null
  }
  const res = await api.get<IncomeExpensesResponse | null>(
    `${ONBOARDING}/${onboardingId}/income-expenses`
  )
  return res.data
}
