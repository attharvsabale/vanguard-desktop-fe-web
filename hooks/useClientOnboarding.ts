
'use client'

import { useState, useCallback } from 'react'
import {
  createPersonalDetails,
  type OnboardingCreatedResponse,
} from '@/services/onboardingService'
import type { PersonalDetailsPayload } from '@/schemas/onboarding'

import {
  useOnboardingStore,
} from '@/store/onboardingStore'
import { OnboardingFormData, OnboardingStepId } from '@/types/client'
import { calculateCompletionPercentage, ONBOARDING_STEPS } from '@/constants/onboardingSteps'

/**
 * Initial state for onboarding form
 */
const createInitialFormState = (): OnboardingFormData => ({
  uploadMethod: 'manual',
  completedSteps: [],
  currentStep: 'personal-details',
  isDraft: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

/**
 * useClientOnboarding Hook
 * Manages complete onboarding flow state
 */
export const useClientOnboarding = () => {
  const [formData, setFormData] = useState<OnboardingFormData>(createInitialFormState())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setOnboardingId = useOnboardingStore((state) => state.setOnboardingId)
  const setClientId = useOnboardingStore((state) => state.setClientId)
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted)

  /**
   * Initialize with existing client data
   * Called when editing an existing client's onboarding
   */
  const initializeWithData = useCallback((data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(createInitialFormState())
    setError(null)
  }, [])

  /**
   * Update current step
   */
  const setCurrentStep = useCallback((stepId: OnboardingStepId) => {
    setFormData((prev) => ({
      ...prev,
      currentStep: stepId,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  /**
   * Mark a step as completed
   */
  const completeStep = useCallback((stepId: OnboardingStepId) => {
    setFormData((prev) => {
      const completedSteps = prev.completedSteps.includes(stepId)
        ? prev.completedSteps
        : [...prev.completedSteps, stepId]

      return {
        ...prev,
        completedSteps,
        updatedAt: new Date().toISOString(),
      }
    })
  }, [])

  /**
   * Mark a step as incomplete (revert completion)
   */
  const revertStepCompletion = useCallback((stepId: OnboardingStepId) => {
    setFormData((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.filter((id) => id !== stepId),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  /**
   * Update form data for a specific section
   */
  const updateSectionData = useCallback((section: keyof Omit<OnboardingFormData, 'completedSteps' | 'currentStep' | 'isDraft' | 'createdAt' | 'updatedAt' | 'uploadMethod' | 'clientId' | 'uploadMethod'>, data: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  /**
   * Set upload method (file upload or manual entry)
   */
  const setUploadMethod = useCallback((method: 'upload' | 'manual') => {
    setFormData((prev) => ({
      ...prev,
      uploadMethod: method,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  /**
   * Mark form as draft
   */
  const saveDraft = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      isDraft: true,
      updatedAt: new Date().toISOString(),
    }))
    // TODO: Call API service to save draft to backend
  }, [])


  const createPersonal = useCallback(
    async (data: PersonalDetailsPayload): Promise<OnboardingCreatedResponse> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await createPersonalDetails(data)

        setOnboardingId(response.onboarding_id)
        setClientId(response.client_id)
        markStepCompleted('personal-details')
        // Stay on the personal-details step so user can add nominees first.
        // Advancing happens when user clicks "Save & Next".

        return response
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create personal details'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setOnboardingId, setClientId, markStepCompleted]
  )


  /**
   * Submit complete onboarding
   * Validates all required steps are completed before submission
   */
  const submitOnboarding = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validate all required steps are completed
      const requiredStepIds = ONBOARDING_STEPS.filter((s) => !s.isOptional).map((s) => s.id)
      const allRequiredCompleted = requiredStepIds.every((id) => formData.completedSteps.includes(id))

      if (!allRequiredCompleted) {
        throw new Error('All required steps must be completed before submission')
      }

      // TODO: Call API service to submit onboarding
      // await clientService.submitOnboarding(formData)

      setFormData((prev) => ({
        ...prev,
        isDraft: false,
        updatedAt: new Date().toISOString(),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit onboarding'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [formData])

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Calculate completion percentage
   */
  const completionPercentage = calculateCompletionPercentage(formData.completedSteps.length)

  return {
    // State
    formData,
    isLoading,
    error,
    completionPercentage,

    // Initialization & Reset
    initializeWithData,
    resetForm,

    // Step Navigation
    setCurrentStep,
    completeStep,
    revertStepCompletion,

    // Form Data Updates
    updateSectionData,
    setUploadMethod,

    // Submission & Draft
    saveDraft,
    createPersonal,
    submitOnboarding,

    // Error Handling
    clearError,
  }
}

export type UseClientOnboardingReturn = ReturnType<typeof useClientOnboarding>
