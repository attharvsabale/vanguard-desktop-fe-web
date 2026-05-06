'use client'

import React from 'react'

import {
  OnboardingStep,
  OnboardingStepId,
} from '@/types/client'

interface StepperProps {
  steps: OnboardingStep[]

  currentStepId: OnboardingStepId

  completedSteps: OnboardingStepId[]

  onStepClick: (
    stepId: OnboardingStepId
  ) => void
}

export const Stepper: React.FC<
  StepperProps
> = ({
  steps,
  currentStepId,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="space-y-4">

      {steps.map((step, index) => {
        const isCompleted =
          completedSteps.includes(step.id)

        const isCurrent =
          step.id === currentStepId

        return (
          <div key={step.id}>

            {/* Step Item */}
            <button
              onClick={() =>
                onStepClick(step.id)
              }
              className={`
                w-full text-left p-4 rounded-lg
                border-2 transition-all duration-200

                ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-start gap-3">

                {/* Circle */}
                <div
                  className={`
                    flex-shrink-0
                    w-8 h-8 rounded-full
                    flex items-center justify-center
                    font-bold text-sm

                    ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}
                >
                  {isCompleted
                    ? '✓'
                    : index + 1}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">

                  <div
                    className={`
                      font-semibold

                      ${
                        isCurrent
                          ? 'text-blue-900'
                          : isCompleted
                          ? 'text-green-900'
                          : 'text-gray-700'
                      }
                    `}
                  >
                    {step.label}
                  </div>

                  <p
                    className={`
                      text-sm mt-1

                      ${
                        isCurrent
                          ? 'text-blue-700'
                          : isCompleted
                          ? 'text-green-700'
                          : 'text-gray-600'
                      }
                    `}
                  >
                    {step.description}
                  </p>

                  {step.isOptional && (
                    <span className="inline-block mt-2 text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Optional
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="pl-4 py-2">
                <div
                  className={`
                    h-2 border-l-2

                    ${
                      isCompleted
                        ? 'border-green-500'
                        : 'border-gray-300'
                    }
                  `}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Stepper