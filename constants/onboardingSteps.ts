
import { OnboardingStep, OnboardingStepId } from '@/types/client'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'personal-details',
    label: 'Personal Details',
    description: 'Applicant and bank details',
    order: 1,
    isOptional: false,
  },
  {
    id: 'income-expenses',
    label: 'Income / Expenses',
    description: 'Monthly income and expenses',
    order: 2,
    isOptional: false,
  },
  {
    id: 'current-investments',
    label: 'Current Investments',
    description: 'Existing investments and assets',
    order: 3,
    isOptional: false,
  },
  {
    id: 'new-investments',
    label: 'New Investments',
    description: 'New investment plan',
    order: 4,
    isOptional: false,
  },
  {
    id: 'goals',
    label: 'Goals',
    description: 'Financial goals',
    order: 5,
    isOptional: false,
  },
]

/**
 * Get step by ID
 * @param stepId - The step ID to find
 * @returns The step configuration or undefined if not found
 */
export const getStepById = (stepId: OnboardingStepId): OnboardingStep | undefined => {
  return ONBOARDING_STEPS.find((step) => step.id === stepId)
}

/**
 * Get next step ID
 * @param currentStepId - The current step ID
 * @returns The next step ID or undefined if at the last step
 */
export const getNextStepId = (currentStepId: OnboardingStepId): OnboardingStepId | undefined => {
  const currentStep = getStepById(currentStepId)
  if (!currentStep) return undefined

  const nextStep = ONBOARDING_STEPS.find((step) => step.order === currentStep.order + 1)
  return nextStep?.id
}

/**
 * Get previous step ID
 * @param currentStepId - The current step ID
 * @returns The previous step ID or undefined if at the first step
 */
export const getPreviousStepId = (currentStepId: OnboardingStepId): OnboardingStepId | undefined => {
  const currentStep = getStepById(currentStepId)
  if (!currentStep) return undefined

  const previousStep = ONBOARDING_STEPS.find((step) => step.order === currentStep.order - 1)
  return previousStep?.id
}

/**
 * Get step index (0-based)
 * @param stepId - The step ID
 * @returns The 0-based index of the step
 */
export const getStepIndex = (stepId: OnboardingStepId): number => {
  const step = getStepById(stepId)
  return step ? step.order - 1 : -1
}

/**
 * Calculate completion percentage
 * @param completedStepsCount - Number of completed steps
 * @returns Completion percentage (0-100)
 */
export const calculateCompletionPercentage = (completedStepsCount: number): number => {
  return Math.round((completedStepsCount / ONBOARDING_STEPS.length) * 100)
}

/**
 * Get all required steps (non-optional)
 * @returns Array of required step IDs
 */
export const getRequiredSteps = (): OnboardingStepId[] => {
  return ONBOARDING_STEPS.filter((step) => !step.isOptional).map((step) => step.id)
}

/**
 * Check if all required steps are completed
 * @param completedSteps - Array of completed step IDs
 * @returns True if all required steps are completed
 */
export const areAllRequiredStepsCompleted = (completedSteps: OnboardingStepId[]): boolean => {
  const requiredSteps = getRequiredSteps()
  return requiredSteps.every((step) => completedSteps.includes(step))
}

/**
 * Get total steps count
 * @returns Total number of onboarding steps
 */
export const getTotalStepsCount = (): number => {
  return ONBOARDING_STEPS.length
}
