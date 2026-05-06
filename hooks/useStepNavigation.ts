/**
 * useStepNavigation Hook
 * Manages step navigation logic (next, previous, jump to step)
 * Handles validation and navigation state
 */

'use client'

import { useCallback } from 'react'
import { OnboardingStepId } from '@/types/client'
import {
  ONBOARDING_STEPS,
  getNextStepId,
  getPreviousStepId,
  getStepIndex,
  getStepById,
} from '@/constants/onboardingSteps'

interface UseStepNavigationParams {
  currentStepId: OnboardingStepId
  completedSteps: OnboardingStepId[]
  onStepChange: (stepId: OnboardingStepId) => void
}

/**
 * useStepNavigation Hook
 * Provides navigation controls for onboarding steps
 */
export const useStepNavigation = ({
  currentStepId,
  completedSteps,
  onStepChange,
}: UseStepNavigationParams) => {
  // Get current step info
  const currentStep = getStepById(currentStepId)
  const currentStepIndex = currentStep ? getStepIndex(currentStepId) : 0
  const totalSteps = ONBOARDING_STEPS.length
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === totalSteps - 1

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(() => {
    const nextStepId = getNextStepId(currentStepId)
    if (nextStepId) {
      onStepChange(nextStepId)
    }
  }, [currentStepId, onStepChange])

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(() => {
    const previousStepId = getPreviousStepId(currentStepId)
    if (previousStepId) {
      onStepChange(previousStepId)
    }
  }, [currentStepId, onStepChange])

  /**
   * Jump to a specific step
   * Note: In a real implementation, this might validate access to the step
   * For now, allows jumping to any step
   */
  const goToStep = useCallback(
    (stepId: OnboardingStepId) => {
      // Validate step exists
      const step = getStepById(stepId)
      if (step) {
        onStepChange(stepId)
      }
    },
    [onStepChange]
  )

  /**
   * Check if step is completed
   */
  const isStepCompleted = useCallback(
    (stepId: OnboardingStepId): boolean => {
      return completedSteps.includes(stepId)
    },
    [completedSteps]
  )

  /**
   * Check if step is accessible
   * A step is accessible if it's not locked by business rules
   * This can be extended for role-based access, dependencies, etc.
   */
  const isStepAccessible = useCallback(
    (stepId: OnboardingStepId): boolean => {
      const stepIndex = getStepIndex(stepId)
      const currentIndex = getStepIndex(currentStepId)

      // Allow going back to any previous step
      if (stepIndex < currentIndex) {
        return true
      }

      // Allow staying on current step
      if (stepIndex === currentIndex) {
        return true
      }

      // Allow going forward (can skip ahead)
      return true
    },
    [currentStepId]
  )

  /**
   * Get progress percentage
   */
  const progressPercentage = Math.round(((completedSteps.length) / totalSteps) * 100)

  /**
   * Get list of all steps with their state
   */
  const stepsWithState = ONBOARDING_STEPS.map((step) => ({
    ...step,
    isCompleted: isStepCompleted(step.id),
    isAccessible: isStepAccessible(step.id),
    isCurrent: step.id === currentStepId,
  }))

  return {
    // Step navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,

    // Step state checks
    isStepCompleted,
    isStepAccessible,

    // Navigation state
    currentStepId,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    progressPercentage,
    completedStepsCount: completedSteps.length,

    // All steps with their states
    stepsWithState,
  }
}

export type UseStepNavigationReturn = ReturnType<typeof useStepNavigation>
