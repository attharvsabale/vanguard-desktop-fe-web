# Financial Planning Department — Frontend Architecture Plan

## Objective

Build the frontend system for the Financial Planning Department with:

* Role-based dashboards
* Controlled data visibility
* Client workflow management
* Assignment flow between RM and FP
* Team hierarchy access control

The system should ensure every role only sees the information relevant to them.

---

# Phase 1 Scope (Current Focus)

This phase only focuses on the Financial Planning Department.

Included Roles:

* Business Developer (BD)
* Relationship Manager (RM)
* Financial Planner (FP)
* Assistant Manager
* Manager

---

# Core Frontend Modules

## 1. Authentication & Role Access

### Features

* Login
* Forgot Password
* OTP Verification
* Reset Password
* Session Handling
* Role-based route protection

### Frontend Logic

After login:

* Fetch user role
* Redirect user to correct dashboard
* Load only permitted modules

Example:

* BD → BD Dashboard
* RM → RM Dashboard
* FP → FP Dashboard
* Manager → Manager Dashboard

---

# 2. Dashboard System

## Business Developer Dashboard

### Can View

* Self-created clients
* Own client details
* Lead/client status

### Cannot View

* Goals
* RM Notes
* Financial Planning Data
* FP Internal Actions

### Modules

* Client List
* Add Client
* Client Status
* Activity Timeline

---

## Relationship Manager Dashboard

### Can View

* Assigned clients
* Goal information
* BD entered information
* Client relationship data

### Can Perform

* Edit client details
* Add goals
* Assign client to FP
* Track client progress

### Modules

* Assigned Clients
* Goal Management
* Client Notes
* FP Assignment Panel
* Workflow Tracker

---

## Financial Planner Dashboard

### Can View

* Assigned planning clients
* Goals
* RM data
* Financial profile

### Can Perform

* Generate plans
* Regenerate goals
* Perform planning actions
* Add financial recommendations

### Modules

* Planning Workspace
* Goal Engine
* Financial Analysis
* Recommendations
* Planning Notes

---

## Assistant Manager Dashboard

### Can View/Edit

* All clients under team
* RM/FP activity
* Team performance

### Modules

* Team Overview
* RM Monitoring
* FP Monitoring
* Client Status Board
* Team Analytics

---

## Manager Dashboard

### Full Access

* All teams
* All clients
* All workflows
* All reports

### Modules

* Department Analytics
* Team Management
* Performance Reports
* Workflow Monitoring
* Global Search

---

# 3. Client Workflow System

## Workflow Stages

```text
BD Creates Client
↓
RM Assigned
↓
Goal Creation
↓
FP Planning
↓
Review
↓
Final Approval
↓
Completed
```

---

# 4. Role-Based Visibility Rules

| Feature                    | BD | RM | FP | Assistant Manager | Manager |
| -------------------------- | -- | -- | -- | ----------------- | ------- |
| Add Client                 | ✅  | ❌  | ❌  | ✅                 | ✅       |
| View Own Clients           | ✅  | ✅  | ✅  | ✅                 | ✅       |
| View All Team Clients      | ❌  | ❌  | ❌  | ✅                 | ✅       |
| View Goals                 | ❌  | ✅  | ✅  | ✅                 | ✅       |
| Edit Goals                 | ❌  | ✅  | ✅  | ✅                 | ✅       |
| Assign FP                  | ❌  | ✅  | ❌  | ✅                 | ✅       |
| Financial Planning Actions | ❌  | ❌  | ✅  | ✅                 | ✅       |
| Full Department Access     | ❌  | ❌  | ❌  | ❌                 | ✅       |

---

# 5. Frontend Architecture

## Recommended Stack

| Layer            | Technology            |
| ---------------- | --------------------- |
| Framework        | Next.js               |
| Language         | TypeScript            |
| Styling          | Tailwind CSS          |
| State Management | Zustand               |
| API Layer        | Axios                 |
| Forms            | React Hook Form + Zod |
| Server State     | TanStack Query        |

---

# 6. Suggested Frontend Folder Structure

```text
src/
├── app/
├── components/
│   ├── dashboard/
│   ├── clients/
│   ├── goals/
│   ├── planning/
│   └── common/
│
├── hooks/
├── services/
├── store/
├── types/
├── utils/
├── layouts/
└── constants/
```

---

# 7. Suggested Frontend Screens

## Authentication

* Login
* Forgot Password
* OTP
* Reset Password

## BD

* Dashboard
* Add Client
* Client List
* Client Details

## RM

* Assigned Clients
* Goal Creation
* Assign FP
* Notes

## FP

* Planning Workspace
* Goal Regeneration
* Financial Analysis
* Recommendations

## Management

* Team Dashboard
* Team Analytics
* Workflow Overview
* Reports

---

# 8. Key Frontend System Requirements

## Role-Based UI Rendering

The frontend must dynamically hide/show:

* Menus
* Pages
* Actions
* Sections
* Buttons
  based on role permissions.

---

## Assignment-Based Access

Users should only access:

* self-created clients
* assigned clients
* team clients (if managerial role)

---

## Workflow Status Tracking

Every client should have visible workflow status:

* New
* Assigned
* Under Planning
* Review
* Completed

---

# 9. Future Expansion (Phase 2 & 3)

## Phase 2

* Business Operations
* Advisory
* Research
* Product Integration

## Phase 3

* HR
* Accounts
* Admin
* Reports
* Audit Logs
* Notifications
* Enterprise Analytics

---

# Final Goal

Build a scalable enterprise-grade financial workflow platform where:

* each role has controlled visibility
* workflows are trackable
* assignments are manageable
* managers can monitor operations efficiently
* the system can later expand into full enterprise operations
