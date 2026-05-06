"use client";

import { Check } from "lucide-react";
import { ONBOARDING_STEPS } from "@/constants/onboardingSteps";
import type { OnboardingStepId } from "@/types/client";

interface HorizontalStepperProps {
  currentStepId: OnboardingStepId;
  completedSteps?: OnboardingStepId[];
}

export default function HorizontalStepper({
  currentStepId,
  completedSteps = [],
}: HorizontalStepperProps) {
  const currentIdx = ONBOARDING_STEPS.findIndex((s) => s.id === currentStepId);

  return (
    <div className="flex items-start">
      {ONBOARDING_STEPS.map((step, index) => {
        const isActive = step.id === currentStepId;
        const isCompleted =
          completedSteps.includes(step.id) || index < currentIdx;
        const isLast = index === ONBOARDING_STEPS.length - 1;
        // Connector after step i is "filled" once step i is completed.
        const connectorFilled = isCompleted;

        return (
          <div key={step.id} className="flex items-start flex-1 last:flex-none">
            {/* Circle + label column */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  relative w-9 h-9 rounded-full
                  flex items-center justify-center
                  text-[13px] font-semibold
                  transition-[background-color,color,box-shadow]
                  duration-300 ease-out
                  ${
                    isActive
                      ? "bg-[#0A1B3D] text-white ring-4 ring-[#0A1B3D]/10"
                      : isCompleted
                        ? "bg-[#0A1B3D] text-white"
                        : "bg-[#F2F4F7] text-[#98A2B3]"
                  }
                `}
              >
                {/* Number — fades out when completed */}
                <span
                  className={`
                    absolute inset-0 flex items-center justify-center
                    transition-opacity duration-200 ease-out
                    ${isCompleted && !isActive ? "opacity-0" : "opacity-100"}
                  `}
                  aria-hidden={isCompleted && !isActive}
                >
                  {step.order}
                </span>
                {/* Check — fades in when completed */}
                <span
                  className={`
                    absolute inset-0 flex items-center justify-center
                    transition-opacity duration-300 ease-out delay-100
                    ${isCompleted && !isActive ? "opacity-100" : "opacity-0"}
                  `}
                  aria-hidden={!isCompleted || isActive}
                >
                  <Check size={16} strokeWidth={2.5} />
                </span>
              </div>
              <span
                className={`
                  mt-2 text-[12px] whitespace-nowrap
                  transition-colors duration-300 ease-out
                  ${
                    isActive || isCompleted
                      ? "text-[#0A1B3D] font-semibold"
                      : "text-[#98A2B3] font-medium"
                  }
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector — gray base + navy fill that scales X from 0→1 */}
            {!isLast && (
              <div className="flex-1 h-px bg-[#E4E7EC] mt-[18px] mx-3 relative overflow-hidden">
                <div
                  className={`
                    absolute inset-0 bg-[#0A1B3D]
                    origin-left
                    transition-transform duration-500 ease-out
                    ${connectorFilled ? "scale-x-100" : "scale-x-0"}
                  `}
                  style={{ willChange: "transform" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
