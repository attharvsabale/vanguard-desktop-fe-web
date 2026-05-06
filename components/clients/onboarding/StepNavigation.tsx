/**
 * StepNavigation Component
 * Provides Previous/Next/Save/Cancel buttons for step navigation
 * Handles button states and loading states
 */

import React from 'react'

interface StepNavigationProps {
  currentStepIndex: number
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
  isLoading?: boolean
  onNext: () => void
  onPrevious: () => void
  onSave?: () => void
  onCancel?: () => void
}

/**
 * StepNavigation Component
 * Navigation controls at the bottom of each step
 */
export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  isLoading = false,
  onNext,
  onPrevious,
  onSave,
  onCancel,
}) => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side - Cancel & Previous */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}

          {!isFirstStep && (
            <button
              onClick={onPrevious}
              disabled={isLoading || isFirstStep}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
          )}
        </div>

        {/* Right Side - Save & Next/Submit */}
        <div className="flex gap-3">
          {onSave && !isLastStep && (
            <button
              onClick={onSave}
              disabled={isLoading}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save as Draft
            </button>
          )}

          <button
            onClick={onNext}
            disabled={isLoading}
            className={`px-8 py-2 text-white rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed opacity-70'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading && (
              <span className="inline-block mr-2">
                <svg className="animate-spin h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
            )}
            {isLastStep ? 'Submit Onboarding' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Step Counter */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Step {currentStepIndex + 1} of {totalSteps}
      </div>
    </div>
  )
}

export default StepNavigation
