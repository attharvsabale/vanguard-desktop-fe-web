'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { OnboardingStepId } from '@/types/client'

type OnboardingStore = {
  onboardingId: string | null
  clientId: string | null
  currentStep: OnboardingStepId
  completedSteps: OnboardingStepId[]
  draftData: Record<string, unknown>

  setOnboardingId: (id: string) => void
  setClientId: (id: string) => void
  setCurrentStep: (step: OnboardingStepId) => void
  markStepCompleted: (step: OnboardingStepId) => void
  saveDraftData: (step: string, data: unknown) => void
  resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      onboardingId: null,
      clientId: null,
      currentStep: 'personal-details',
      completedSteps: [],
      draftData: {},

      setOnboardingId: (id) => set({ onboardingId: id }),
      setClientId: (id) => set({ clientId: id }),
      setCurrentStep: (step) => set({ currentStep: step }),

      markStepCompleted: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      saveDraftData: (step, data) =>
        set((state) => ({
          draftData: { ...state.draftData, [step]: data },
        })),

      resetOnboarding: () =>
        set({
          onboardingId: null,
          clientId: null,
          currentStep: 'personal-details',
          completedSteps: [],
          draftData: {},
        }),
    }),
    {
      name: 'vanguard:onboarding',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.sessionStorage
          : (undefined as unknown as Storage)
      ),
      partialize: (state) => ({
        onboardingId: state.onboardingId,
        clientId: state.clientId,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
      }),
    }
  )
)
