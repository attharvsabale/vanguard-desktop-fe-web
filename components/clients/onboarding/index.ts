/**
 * Client Onboarding Components - Index/Exports
 * Central export point for all onboarding-related components
 * 
 * Usage:
 * import { ClientOnboardingLayout, Stepper, PersonalDetailsStep } from '@/components/clients/onboarding'
 */

// Main Layout
export { ClientOnboardingLayout } from './ClientOnboardingLayout'
export type { default as ClientOnboardingLayoutComponent } from './ClientOnboardingLayout'

// UI Components
export { Stepper } from './Stepper'
export { StepNavigation } from './StepNavigation'
export { UploadChoiceCard } from './UploadChoiceCard'
export { ManualEntryCard } from './ManualEntryCard'

// Step Components
export { default as PersonalDetailsStep } from './steps/PersonalDetailsStep'
