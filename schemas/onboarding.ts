/**
 * Zod schemas for the BD onboarding flow.
 *
 * Field names use snake_case to match the (upcoming) backend Pydantic
 * payload exactly. Validation here is the single source of truth on the
 * frontend — every regex / range / length below mirrors what the backend
 * is also expected to enforce.
 */

import { z } from 'zod'

// ── Shared regex / constants ───────────────────────────────────────────────

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const AADHAAR_REGEX = /^[0-9]{12}$/
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
const MICR_REGEX = /^[0-9]{9}$/
const ACCOUNT_NO_REGEX = /^[0-9]{6,20}$/
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
// Letters, spaces, dots, hyphens, apostrophes (Indian/Western names).
const NAME_REGEX = /^[A-Za-z][A-Za-z .'\-]{1,254}$/
// One or more E.164-ish phone numbers; allows commas / slashes between them.
const PHONES_REGEX = /^[+\d][\d\s,\-/()+]{6,49}$/
// PIN is required at end of address: any non-empty text + 6-digit PIN.
const ADDRESS_WITH_PIN_REGEX = /\b\d{6}\b/

const MIN_DOB_YEAR = 1900
const MAX_INCOME = 1_000_000_000_000 // ₹1,00,000 crore — sane cap

// ── Helpers ────────────────────────────────────────────────────────────────

/** Trim, then turn empty strings into undefined so optional fields work cleanly. */
const trimmedOptional = z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v))

const optional = <T extends z.ZodTypeAny>(s: T) =>
    z
        .union([s, z.literal('')])
        .optional()
        .transform((v) => (v === '' || v === undefined ? undefined : (v as z.infer<T>)))

/** Validate ISO yyyy-mm-dd: real calendar date and not in the future. */
const pastIsoDate = (msg: string) =>
    z
        .string()
        .regex(ISO_DATE_REGEX, msg)
        .refine((v) => {
            const [y, m, d] = v.split('-').map(Number)
            if (y < MIN_DOB_YEAR) return false
            const dt = new Date(Date.UTC(y, m - 1, d))
            return (
                dt.getUTCFullYear() === y &&
                dt.getUTCMonth() === m - 1 &&
                dt.getUTCDate() === d &&
                dt.getTime() <= Date.now()
            )
        }, msg)

/** DOB must be at least 18 years old and not before 1900. */
const dobField = pastIsoDate('Enter a valid date of birth').refine(
    (v) => {
        const [y, m, d] = v.split('-').map(Number)
        const dob = new Date(Date.UTC(y, m - 1, d))
        const today = new Date()
        let age = today.getUTCFullYear() - dob.getUTCFullYear()
        const before =
            today.getUTCMonth() < m - 1 ||
            (today.getUTCMonth() === m - 1 && today.getUTCDate() < d)
        if (before) age--
        return age >= 18
    },
    { message: 'Client must be at least 18 years old' }
)

// ── Personal Details (Step 1) ───────────────────────────────────────────────

export const personalDetailsSchema = z
    .object({
        // ── Identity (required) ──────────────────────────────────────────────
        full_name: z
            .string()
            .trim()
            .min(2, 'Full name is required')
            .max(255, 'Full name is too long')
            .regex(NAME_REGEX, 'Use letters, spaces and . \' - only'),

        pan_no: z
            .string()
            .trim()
            .transform((v) => v.toUpperCase())
            .pipe(z.string().regex(PAN_REGEX, 'Invalid PAN. Format: ABCDE1234F')),

        exact_pan_name: z
            .string()
            .trim()
            .min(2, 'Exact PAN name is required')
            .max(255, 'Name is too long')
            .regex(NAME_REGEX, 'Must match the format on the PAN card'),

        dob: dobField,

        email: z
            .string()
            .trim()
            .toLowerCase()
            .email('Enter a valid email')
            .max(254, 'Email is too long'),

        annual_income: z
            .union([z.number(), z.string()])
            .transform((v) => (typeof v === 'string' ? (v.trim() === '' ? NaN : Number(v)) : v))
            .pipe(
                z
                    .number({ message: 'Annual income is required' })
                    .finite('Enter a valid amount')
                    .nonnegative('Income cannot be negative')
                    .max(MAX_INCOME, 'Amount is too large')
            ),

        aadhaar_no: z
            .string()
            .trim()
            .transform((v) => v.replace(/\s+/g, ''))
            .pipe(z.string().regex(AADHAAR_REGEX, 'Aadhaar must be exactly 12 digits'))
            .refine((v) => v[0] !== '0' && v[0] !== '1', {
                message: 'Aadhaar cannot start with 0 or 1',
            }),

        place_of_birth: z
            .string()
            .trim()
            .min(2, 'Place of birth is required')
            .max(120, 'Place of birth is too long'),

        current_address: z
            .string()
            .trim()
            .min(10, 'Address must be at least 10 characters')
            .max(500, 'Address is too long')
            .regex(ADDRESS_WITH_PIN_REGEX, 'Address must include a 6-digit PIN code'),

        contact_numbers: z
            .string()
            .trim()
            .min(7, 'Enter at least one contact number')
            .max(200, 'Too many numbers')
            .regex(PHONES_REGEX, 'Use digits, spaces and , - / ( ) + only'),

        // ── Bank (required) ──────────────────────────────────────────────────
        bank_name: z
            .string()
            .trim()
            .min(2, 'Bank name is required')
            .max(120, 'Bank name is too long'),

        savings_account_no: z
            .string()
            .trim()
            .transform((v) => v.replace(/\s+/g, ''))
            .pipe(z.string().regex(ACCOUNT_NO_REGEX, 'Account number must be 6–20 digits')),

        branch_address: z
            .string()
            .trim()
            .min(10, 'Branch address must be at least 10 characters')
            .max(500, 'Branch address is too long')
            .regex(ADDRESS_WITH_PIN_REGEX, 'Branch address must include a 6-digit PIN code'),

        // ── Family (required) ────────────────────────────────────────────────
        mother_name: z
            .string()
            .trim()
            .min(2, 'Mother\u2019s name is required')
            .max(255, 'Name is too long')
            .regex(NAME_REGEX, 'Use letters, spaces and . \' - only'),

        father_name: z
            .string()
            .trim()
            .min(2, 'Father\u2019s name is required')
            .max(255, 'Name is too long')
            .regex(NAME_REGEX, 'Use letters, spaces and . \' - only'),

        // ── Optional ─────────────────────────────────────────────────────────
        rank: optional(z.string().trim().min(2).max(120)),
        marriage_anniversary: optional(pastIsoDate('Invalid anniversary date')),
        occupation: optional(z.string().trim().min(2).max(120)),

        micr_code: optional(
            z
                .string()
                .trim()
                .transform((v) => v.replace(/\s+/g, ''))
                .pipe(z.string().regex(MICR_REGEX, 'MICR must be exactly 9 digits'))
        ),

        ifsc_code: optional(
            z
                .string()
                .trim()
                .transform((v) => v.toUpperCase())
                .pipe(z.string().regex(IFSC_REGEX, 'Invalid IFSC code (e.g. SBIN0004384)'))
        ),

        assigned_rm_id: optional(z.string().uuid('Invalid RM id')),
    })
    // Cross-field rules
    .superRefine((data, ctx) => {
        // Anniversary cannot be before DOB.
        if (data.marriage_anniversary && data.dob) {
            if (data.marriage_anniversary < data.dob) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['marriage_anniversary'],
                    message: 'Anniversary cannot be before date of birth',
                })
            }
        }
        // EXACT PAN name should not contain digits / weird punctuation.
        if (/[^A-Za-z .'\-]/.test(data.exact_pan_name)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['exact_pan_name'],
                message: 'Use only letters, spaces and . \' -',
            })
        }
    })

export type PersonalDetailsFormValues = z.input<typeof personalDetailsSchema>
export type PersonalDetailsPayload = z.output<typeof personalDetailsSchema>

// ── Nominee (Step 1, sub-section) ───────────────────────────────────────────

export const RELATIONSHIPS = [
    'Spouse',
    'Son',
    'Daughter',
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Other',
] as const

export const nomineeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Name is required')
        .max(255, 'Name is too long')
        .regex(NAME_REGEX, 'Use letters, spaces and . \' - only'),
    dob: optional(pastIsoDate('Enter a valid date of birth')),
    contact_no: optional(
        z
            .string()
            .trim()
            .regex(PHONES_REGEX, 'Use digits, spaces and , - / ( ) + only')
            .min(7, 'Contact is too short')
            .max(50, 'Contact is too long')
    ),
    email: optional(
        z.string().trim().toLowerCase().email('Enter a valid email').max(254)
    ),
    relationship: z.enum(RELATIONSHIPS, { message: 'Select a relationship' }),
    pan_no: optional(
        z
            .string()
            .trim()
            .transform((v) => v.toUpperCase())
            .pipe(z.string().regex(PAN_REGEX, 'Invalid PAN. Format: ABCDE1234F'))
    ),
    address: optional(z.string().trim().min(10, 'Address is too short').max(500)),
})

export type NomineeFormValues = z.input<typeof nomineeSchema>
export type NomineePayload = z.output<typeof nomineeSchema>

// ── Income & Expenses (Step 2) ──────────────────────────────────────────────
//
// All amounts are MONTHLY rupees, captured as numbers (no formatting). Each
// field is independently optional, but cumulative income must be > 0 so we
// know we have *something* to plan against. Negative values are rejected.

const moneyField = (label: string) =>
    z
        .union([z.number(), z.string()])
        .optional()
        .transform((v) => {
            if (v === undefined) return undefined
            if (typeof v === 'number') return v
            if (v.trim() === '') return undefined
            return Number(v)
        })
        .pipe(
            z
                .number({ message: `${label} must be a number` })
                .finite(`Enter a valid ${label.toLowerCase()}`)
                .nonnegative(`${label} cannot be negative`)
                .max(MAX_INCOME, `${label} is too large`)
                .optional()
        )

export const INCOME_FIELDS = ['monthly_income'] as const
export const EXPENSE_FIELDS = ['monthly_expenses'] as const

export const incomeExpensesSchema = z
    .object({
        monthly_income: moneyField('Monthly income'),
        monthly_expenses: moneyField('Monthly expenses'),
        notes: optional(z.string().trim().max(1000, 'Notes are too long')),
    })
    .superRefine((data, ctx) => {
        if ((data.monthly_income ?? 0) <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['monthly_income'],
                message: 'Enter approximate monthly income greater than 0',
            })
        }
        if (
            data.monthly_expenses !== undefined &&
            data.monthly_income !== undefined &&
            data.monthly_expenses > data.monthly_income
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['monthly_expenses'],
                message: 'Expenses cannot exceed income',
            })
        }
    })

export type IncomeExpensesFormValues = z.input<typeof incomeExpensesSchema>
export type IncomeExpensesPayload = z.output<typeof incomeExpensesSchema>

// Re-export helpers for input-level guards in components.
export const VALIDATION = {
    PAN_REGEX,
    AADHAAR_REGEX,
    IFSC_REGEX,
    MICR_REGEX,
    ACCOUNT_NO_REGEX,
    NAME_REGEX,
    PHONES_REGEX,
} as const

// Suppress unused-export warning for trimmedOptional (kept for future steps).
export const _trimmedOptional = trimmedOptional
