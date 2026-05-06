/**
 * Client & Onboarding Types
 * All TypeScript interfaces for client-related features and onboarding flow
 */

// ============================================================================
// Onboarding Step Types
// ============================================================================

export type OnboardingStepId =
  | 'personal-details'
  | 'income-expenses'
  | 'current-investments'
  | 'new-investments'
  | 'goals'

export interface OnboardingStep {
  id: OnboardingStepId
  label: string
  description: string
  icon?: string
  order: number
  isOptional?: boolean
}

export type UploadMethod = 'upload' | 'manual'

// ============================================================================
// Personal Details Step
// ============================================================================

export interface PersonalDetailsData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  nationality: string
  panNumber: string
  aadhaarNumber?: string
  address: string
  city: string
  state: string
  pincode: string
}

// ============================================================================
// Nominee Step
// ============================================================================

export interface NomineeData {
  name: string
  relationship: string
  dateOfBirth: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  allocationPercentage: number
}

export interface NomineeStepData {
  nominees: NomineeData[]
}

// ============================================================================
// Income & Expenses Step
// ============================================================================

export interface IncomeSource {
  type: 'salary' | 'business' | 'investment' | 'rental' | 'other'
  amount: number
  frequency: 'monthly' | 'annual'
  source: string
}

export interface Expense {
  category: 'housing' | 'food' | 'utilities' | 'transportation' | 'education' | 'medical' | 'entertainment' | 'other'
  amount: number
  frequency: 'monthly' | 'annual'
}

export interface IncomeExpensesData {
  incomeSources: IncomeSource[]
  expenses: Expense[]
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  monthlySavings: number
}

// ============================================================================
// Assets Step
// ============================================================================

export interface Asset {
  type: 'cash' | 'savings-account' | 'fixed-deposit' | 'stocks' | 'mutual-funds' | 'gold' | 'real-estate' | 'vehicle' | 'other'
  description: string
  value: number
  purchaseDate?: string
  notes?: string
}

export interface AssetsData {
  assets: Asset[]
  totalAssetValue: number
}

// ============================================================================
// Liabilities Step
// ============================================================================

export interface Liability {
  type: 'home-loan' | 'auto-loan' | 'credit-card' | 'personal-loan' | 'education-loan' | 'other'
  description: string
  principalAmount: number
  currentOutstandingAmount: number
  monthlyEMI: number
  interestRate: number
  maturityDate?: string
  creditor?: string
}

export interface LiabilitiesData {
  liabilities: Liability[]
  totalLiabilityAmount: number
}

// ============================================================================
// Insurance Step
// ============================================================================

export interface InsurancePolicy {
  type: 'life' | 'health' | 'auto' | 'home' | 'travel' | 'other'
  policyName: string
  policyNumber: string
  provider: string
  premiumAmount: number
  premiumFrequency: 'monthly' | 'quarterly' | 'annual'
  coverageAmount: number
  startDate: string
  maturityDate?: string
  notes?: string
}

export interface InsuranceData {
  policies: InsurancePolicy[]
}

// ============================================================================
// Retirement Step
// ============================================================================

export interface RetirementData {
  retirementAge: number
  currentAge: number
  expectedRetirementCorpus: number
  currentRetirementSavings: number
  monthlyRetirementExpenses: number
  expectedReturnRate: number
  notes?: string
}

// ============================================================================
// Tax Step
// ============================================================================

export interface TaxData {
  taxRegime: 'old' | 'new'
  annualIncome: number
  lastYearTaxPaid: number
  investmentsForTaxBenefit: number
  taxFilingStatus: 'filed' | 'not-filed' | 'pending'
  hasCAA: boolean
  caName?: string
  caContact?: string
  notes?: string
}

// ============================================================================
// Complete Onboarding Form Data
// ============================================================================

export interface OnboardingFormData {
  clientId?: string
  uploadMethod: UploadMethod
  completedSteps: OnboardingStepId[]
  currentStep: OnboardingStepId
  personalDetails?: PersonalDetailsData
  nominee?: NomineeStepData
  incomeExpenses?: IncomeExpensesData
  assets?: AssetsData
  liabilities?: LiabilitiesData
  insurance?: InsuranceData
  retirement?: RetirementData
  tax?: TaxData
  isDraft: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Onboarding Context State
// ============================================================================

export interface OnboardingContextState {
  formData: OnboardingFormData
  isLoading: boolean
  error: string | null
  completionPercentage: number
}

// ============================================================================
// Step Component Props
// ============================================================================

export interface StepComponentProps {
  data?: Record<string, unknown>
  isLoading?: boolean
  onNext: () => void
  onPrevious: () => void
  onSave?: () => void
}

// ============================================================================
// Stepper Props
// ============================================================================

export interface StepperProps {
  steps: OnboardingStep[]
  currentStepId: OnboardingStepId
  completedSteps: OnboardingStepId[]
  onStepClick: (stepId: OnboardingStepId) => void
}

// ============================================================================
// Step Navigation Props
// ============================================================================

export interface StepNavigationProps {
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

// ============================================================================
// Upload Choice Props
// ============================================================================

export interface UploadChoiceCardProps {
  method: UploadMethod
  isSelected: boolean
  onClick: () => void
  title: string
  description: string
  icon?: string
}

// ============================================================================
// Client Entity Type
// ============================================================================

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  onboardingStatus: 'not-started' | 'in-progress' | 'completed' | 'paused'
  onboardingPercentage: number
  createdAt: string
  updatedAt: string
}
