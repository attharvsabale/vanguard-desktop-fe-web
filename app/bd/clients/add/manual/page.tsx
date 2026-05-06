"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import HorizontalStepper from "@/components/clients/onboarding/HorizontalStepper";
import PersonalDetailsStep from "@/components/clients/onboarding/steps/PersonalDetailsStep";
import IncomeExpensesStep from "@/components/clients/onboarding/steps/IncomeExpensesStep";

import { useOnboardingStore } from "@/store/onboardingStore";
import type { OnboardingStepId } from "@/types/client";

const STEP_TITLES: Record<OnboardingStepId, string> = {
  "personal-details": "Personal Details",
  "income-expenses": "Income / Expenses",
  "current-investments": "Current Investments",
  "new-investments": "New Investments",
  goals: "Goals",
};

function ComingSoonStep({ title }: { title: string }) {
  return (
    <div className="bg-white border border-[#EAECF0] rounded-2xl p-10 text-center">
      <h3 className="text-[15px] font-semibold text-[#101828] mb-2">{title}</h3>
      <p className="text-[13px] text-[#667085]">
        This step will be available soon.
      </p>
    </div>
  );
}

export default function ManualOnboardingPage() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const completedSteps = useOnboardingStore((state) => state.completedSteps);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "personal-details":
        return (
          <PersonalDetailsStep
            data={{}}
            onNext={() => setCurrentStep("income-expenses")}
            onPrevious={() => {}}
          />
        );

      case "income-expenses":
        return (
          <IncomeExpensesStep
            onNext={() => setCurrentStep("current-investments")}
            onPrevious={() => setCurrentStep("personal-details")}
          />
        );

      case "current-investments":
      case "new-investments":
      case "goals":
        return <ComingSoonStep title={STEP_TITLES[currentStep]} />;

      default:
        return (
          <PersonalDetailsStep
            data={{}}
            onNext={() => setCurrentStep("income-expenses")}
            onPrevious={() => {}}
          />
        );
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="max-w-[760px] mx-auto pt-1 pb-8">
          {/* Header */}
          <div className="mb-5">
            <Link
              href="/bd/clients/add"
              className="inline-flex items-center gap-2 text-[#667085] hover:text-[#101828] transition mb-3"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-[26px] leading-tight font-semibold text-[#101828]">
                New Client — BD Form
              </h1>
              <span className="bg-[#EEF4FF] text-[#315EFB] text-xs font-medium px-2.5 py-1 rounded-full">
                BD
              </span>
            </div>
            <p className="text-[#667085] text-sm mt-2">
              Fill in all sections, then submit to Relationship Manager
            </p>
          </div>

          {/* Horizontal Stepper */}
          <div className="mb-6">
            <HorizontalStepper
              currentStepId={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Dynamic Step Content */}
          <div className="mt-4">{renderCurrentStep()}</div>
        </div>
      </div>
    </AppLayout>
  );
}
