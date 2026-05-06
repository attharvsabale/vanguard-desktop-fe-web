/**
 * ClientOnboardingLayout Component
 * Main layout wrapper for the onboarding flow
 * Composes: Stepper + Step Content + Navigation
 * 
 * This is a presentational layout component that receives all data via props
 * No API calls, no direct store access
 */

import React from 'react'
import { OnboardingFormData, OnboardingStepId } from '@/types/client'
import { ONBOARDING_STEPS } from '@/constants/onboardingSteps'
import { Stepper } from './Stepper'
import { StepNavigation } from './StepNavigation'

interface ClientOnboardingLayoutProps {
  formData: OnboardingFormData
  currentStepId: OnboardingStepId
  completedSteps: OnboardingStepId[]
  isLoading?: boolean
  error?: string | null
  children: React.ReactNode // Step content component
  onStepClick: (stepId: OnboardingStepId) => void
  onNext: () => void
  onPrevious: () => void
  onSave?: () => void
  onCancel?: () => void
}

/**
 * ClientOnboardingLayout
 * Main layout for the onboarding flow
 */
export const ClientOnboardingLayout: React.FC<ClientOnboardingLayoutProps> = ({
  formData,
  currentStepId,
  completedSteps,
  isLoading = false,
  error = null,
  children,
  onStepClick,
  onNext,
  onPrevious,
  onSave,
  onCancel,
}) => {
  const currentStepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStepId)
  const totalSteps = ONBOARDING_STEPS.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress info */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Client Onboarding</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step {currentStepIndex + 1} of {totalSteps}</p>
              <p className="text-lg font-semibold text-blue-600">{Math.round((completedSteps.length / totalSteps) * 100)}% Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(completedSteps.length / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Stepper Sidebar */}
          <div className="col-span-3">
            <Stepper
              steps={ONBOARDING_STEPS}
              currentStepId={currentStepId}
              completedSteps={completedSteps}
              onStepClick={onStepClick}
            />
          </div>

          {/* Step Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Step Content */}
              <div className="min-h-96">
                {children}
              </div>

              {/* Step Navigation */}
              <StepNavigation
                currentStepIndex={currentStepIndex}
                totalSteps={totalSteps}
                isFirstStep={currentStepIndex === 0}
                isLastStep={currentStepIndex === totalSteps - 1}
                isLoading={isLoading}
                onNext={onNext}
                onPrevious={onPrevious}
                onSave={onSave}
                onCancel={onCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientOnboardingLayout
