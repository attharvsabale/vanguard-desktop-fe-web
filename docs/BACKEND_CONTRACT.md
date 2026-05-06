# Backend Contract — Vanguard BD Frontend

Single source of truth for the backend team. Every endpoint listed below is
already wired in the frontend behind a mock toggle. To go live, the backend
just needs to expose these routes with the documented request/response
shapes — **no frontend changes required**.

## How to switch from mock → real backend

`.env.local`:

```sh
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000   # or production base URL
NEXT_PUBLIC_USE_MOCK=0                       # 0 = real backend, 1 = mocks
```

All requests are sent to `${NEXT_PUBLIC_API_URL}/api/v1/...` with
`Authorization: Bearer <jwt>` taken from `localStorage.token`.

Error response shape used by axios interceptor:

```json
{ "error": { "message": "human-readable" } }
// or { "detail": "..." } / { "message": "..." } — all are read.
```

---

## 1. Auth

### POST `/api/v1/auth/login`

Request:
```json
{ "email": "user@x.com", "password": "..." }
```

Response (200):
```json
{
  "access_token": "<jwt>",
  "token_type": "Bearer",
  "user": { "id": "...", "email": "...", "name": "...", "role": "business_developer" }
}
```

JWT payload must include any of: `user_id` or `sub`, `email`, `name`,
`role`, and `exp` (epoch seconds). `role` ∈ `business_developer` |
`relationship_manager` | `planner` | `client`.

### POST `/api/v1/auth/signup`
```json
// req
{ "name": "...", "email": "...", "password": "..." }
// res — anything 2xx is fine
{ "id": "...", "email": "...", "name": "..." }
```

### POST `/api/v1/auth/forgot-password`
```json
// req
{ "email": "..." }
// res
{ "message": "OTP sent", "email": "..." }
```

### POST `/api/v1/auth/reset-password`
```json
// req
{ "email": "...", "otp": "123456", "new_password": "..." }
// res
{ "message": "Password reset", "email": "..." }
```

---

## 2. Clients

### GET `/api/v1/clients`

Optional query: `?status=bd-progress|awaiting-rm|onboarded` (frontend
currently filters client-side, but the param is forward-compatible).

Response:
```json
[
  {
    "id": "uuid",
    "name": "...",
    "email": "...",
    "status": "bd-progress",        // see below
    "bd_name": "...",
    "rm_name": "..." | null,
    "goals_count": 0 | null
  }
]
```

`status` values: `"bd-progress"` (BD still filling form), `"awaiting-rm"`
(BD submitted, RM hasn't reviewed), `"onboarded"` (both done).

---

## 3. Onboarding — Step 1: Personal Details

### POST `/api/v1/onboarding/personal`

Request — see `schemas/onboarding.ts → personalDetailsSchema`. All
snake_case, all fields validated front-end too (PAN, Aadhaar, IFSC, MICR,
account, addresses with PIN, real calendar dates, 18+ DOB).

```json
{
  "full_name": "Aryan Kapoor",
  "pan_no": "ABCDE1234F",
  "exact_pan_name": "ARYAN KAPOOR",
  "dob": "1985-04-12",
  "email": "aryan@example.com",
  "annual_income": 1800000,
  "aadhaar_no": "234567890123",
  "place_of_birth": "Mumbai",
  "current_address": "...... 400001",
  "contact_numbers": "+91 9876543210",
  "bank_name": "HDFC Bank",
  "savings_account_no": "12345678901",
  "branch_address": "...... 400001",
  "mother_name": "Sunita Kapoor",
  "father_name": "Raj Kapoor",
  "rank": "Col.",                               // optional
  "marriage_anniversary": "2010-06-20",          // optional ISO
  "occupation": "Army Officer",                  // optional
  "micr_code": "400240008",                      // optional, 9 digits
  "ifsc_code": "HDFC0000123",                    // optional
  "assigned_rm_id": "uuid"                        // optional
}
```

Response (201):
```json
{ "onboarding_id": "uuid", "client_id": "uuid" }
```

### GET `/api/v1/onboarding/{onboarding_id}/personal`

Returns the persisted personal details + audit fields:

```json
{
  "id": "...", "created_at": "...", "updated_at": "...",
  ...PersonalDetailsPayload
}
```

### GET `/api/v1/onboarding/{onboarding_id}/status`

```json
{
  "id": "uuid",
  "client_id": "uuid",
  "assigned_bd_id": "uuid",
  "assigned_rm_id": "uuid" | null,
  "onboarding_status": "pending_bd" | "pending_rm" | "completed",
  "bd_submitted_at": "iso" | null,
  "rm_submitted_at": "iso" | null,
  "created_at": "iso",
  "updated_at": "iso"
}
```

---

## 4. Onboarding — Nominees (sub-section of Step 1)

Max 3 nominees per onboarding, validated by `nomineeSchema`.

### POST `/api/v1/onboarding/{onboarding_id}/nominees`
```json
// req
{
  "name": "Sunita Kapoor",
  "relationship": "Spouse",         // enum: Spouse|Son|Daughter|Father|Mother|Brother|Sister|Other
  "dob": "1987-02-10",              // optional
  "contact_no": "+91 98765 43210",  // optional
  "email": "sunita@x.com",          // optional
  "pan_no": "ABCDE1234F",           // optional
  "address": "..."                  // optional
}
// res 201 — { id, created_at, updated_at, ...payload }
```

### GET `/api/v1/onboarding/{onboarding_id}/nominees`
Returns `NomineeResponse[]`.

### PUT `/api/v1/onboarding/{onboarding_id}/nominees/{nominee_id}`
Same body as POST.

### DELETE `/api/v1/onboarding/{onboarding_id}/nominees/{nominee_id}` — 204.

---

## 5. Onboarding — Step 2: Income & Expenses

### PUT `/api/v1/onboarding/{onboarding_id}/income-expenses`

Idempotent upsert. All amounts are **monthly INR** (integers).

```json
// req
{
  "monthly_income": 150000,                // required, > 0
  "monthly_expenses": 80000,               // optional, ≤ monthly_income
  "notes": "..."                           // optional, ≤ 1000 chars
}
// res 200
{
  "id": "uuid",
  "onboarding_id": "uuid",
  "monthly_income": 150000,
  "monthly_expenses": 80000,
  "notes": "...",
  "created_at": "iso",
  "updated_at": "iso"
}
```

### GET `/api/v1/onboarding/{onboarding_id}/income-expenses`
Returns the same shape, or `null` if not yet saved.

---

## 6. Onboarding — Steps 3–5 (TBD)

Currently placeholders on the frontend. Endpoint shapes will be added
here when those screens are built:

- Step 3: Current Investments → `/onboarding/{id}/current-investments`
- Step 4: New Investments → `/onboarding/{id}/new-investments`
- Step 5: Goals → `/onboarding/{id}/goals`

---

## Frontend file map

| Concern | File |
|---|---|
| axios + auth header | `services/api.ts` |
| Single mock toggle  | `services/mock.ts` |
| Auth endpoints      | `services/authService.ts` |
| Clients endpoints   | `services/clientsService.ts` |
| Onboarding endpoints| `services/onboardingService.ts` |
| Validation schemas  | `schemas/onboarding.ts` |
| JWT decode          | `utils/jwt.ts` |
| Auth store          | `store/authStore.ts` (token in localStorage `token`) |
| Onboarding store    | `store/onboardingStore.ts` (sessionStorage `vanguard:onboarding`) |
