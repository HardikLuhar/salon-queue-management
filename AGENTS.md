# AGENTS.md

## 1. Project Summary

The Salon Queue Management System is a premium, real-time web application designed to eliminate weekend waiting chaos in salons. Customers join the queue remotely from their mobile devices or physically as walk-ins and track their live queue positions and wait times; the Receptionist/Owner manages the master queue, registers walk-in clients, calls the next customer, and monitors salon operations; and Barbers access dedicated workstation interfaces to view their assigned clients, control service timers, and update progress.

## 2. Read First — Mandatory Documentation

Before writing, modifying, or refactoring any application code, the coding agent must read the following three specification files in full:

1. **`docs/01-brief.md`**
   - Defines the project purpose, user personas, core feature requirements, and explicit out-of-scope boundaries.
2. **`docs/02-screens.md`**
   - Contains complete UI/UX specifications for all seven screens (`/`, `/join`, `/status/:id`, `/reception`, `/barber/:name`, `/display`, `/admin`), including visual hierarchies, component behaviors, responsive layouts, and dummy data.
3. **`docs/03-flows-rules.md`**
   - Details customer and walk-in workflows, the six valid queue statuses, allowed state transitions, first-come-first-served rules, barber preference logic, approximate wait-time calculations, and the 15-point test checklist.

**Notice on Documentation Authority**: These files serve as the absolute source of truth. If instructions appear ambiguous or conflicting, do not silently invent behaviors. Identify the conflict and confirm requirements against the documentation before implementing the affected code.

## 3. Technology Stack

- **Framework & Build**: React + Vite
- **Styling**: Tailwind CSS
- **Local Development Command**: `npm run dev`

Maintain a clean, lightweight, and modern codebase. Do not introduce bloated frameworks, redundant state libraries, or complex multi-tier architectures that detract from maintainability.

## 4. Storage and Synchronization

The application must keep all active viewports synchronized in real time:
- Customer mobile phones (`/status/:id`)
- Receptionist tablet (`/reception`)
- Barber workstation mobile phones (`/barber/:name`)
- Waiting-area wall TV (`/display`)

### Synchronization Requirements:
- Choose the simplest practical storage and synchronization mechanism that enables cross-device updates without burdening the student with manual SQL schema migrations or complex API design.
- **Explain Before Implementation**: Before implementing persistent storage or connecting an external cloud service, briefly document the chosen storage strategy and why it fits this lab project.
- **Cross-Device Shared State**: Queue data must be shared across physical devices. Do not mistake single-browser local storage (`localStorage`) for true cross-device synchronization.
- **Latency Requirement**: State transitions (such as calling a customer or completing a service) must propagate and update all connected screens within 5 seconds.

## 5. Hosting and Deployment

- **Frontend Hosting**: Vercel
- **Backend Hosting (if required)**: Render or Railway

### README.md Requirement:
- When deployment is configured, the live URL must appear on the **FIRST LINE** immediately following the main project heading in `README.md`.
- Never fabricate a live URL. If deployment has not yet occurred, explicitly state: `Live Demo: Deployment Pending`.

## 6. Working Rules

Every AI coding agent operating in this codebase must strictly obey the following rules:

1. **Single Focus**: Work on exactly ONE screen or ONE feature per task.
2. **No Unrelated Edits**: Do not touch or modify unrelated files or screens during a task.
3. **Consult Specifications**: Review the relevant sections in `docs/01-brief.md`, `docs/02-screens.md`, and `docs/03-flows-rules.md` before making edits.
4. **Preserve Visual System**: Adhere strictly to the editorial monochrome design palette and typography:
   - Primary stark black: `#000000` / `#0A0A0A`
   - Crisp pure white: `#FFFFFF`
   - Subtle architectural grays: `#F5F5F5` (canvas) and `#E5E5E5` (hairline dividers)
   - High-contrast monochrome cards (`rounded-xl` / `rounded-2xl`)
   - Editorial typography (sophisticated serif display headers paired with clean sans-serif body text)
   - Mobile-first responsive layouts
5. **Centralized Localization**: Every user-facing UI label must originate from ONE centralized English/Gujarati dictionary file.
6. **No Hardcoded Labels**: Never hardcode English or Gujarati text directly inside React screen or component templates.
7. **Centralized Business Logic**: Keep all queue algorithms, FIFO ordering, wait calculations, and state transition validations in ONE centralized service/store module. Do not duplicate business logic across individual screen components.
8. **Enforce FIFO Order**: Maintain strictly chronological first-come-first-served queue sequencing based on join timestamps.
9. **Respect Barber Preference**: A customer who selected a specific barber (e.g., Ravi) must NEVER be assigned to another barber (e.g., Amit or Imran).
10. **Single Chair Concurrency**: A barber chair can never have more than one customer in the `In chair` status simultaneously.
11. **Strict State Transitions**: Enforce the valid lifecycle (`Waiting` → `Called` → `In chair` → `Done`, plus terminal `Cancelled` and `No-show` paths). Prevent all backward or illegal state jumps.
12. **Cross-Screen Synchronization**: Ensure actions triggered from one view (e.g., receptionist calling a client) immediately update all connected views (customer phone, TV display, barber view).
13. **Strict Out-of-Scope Enforcement**: Never implement or propose features from the don't-build list:
    - Online payments
    - Future-date appointments / calendar scheduling
    - SMS or WhatsApp external notification integrations
    - Loyalty, reward, or discount programs
    - Multi-branch or multi-salon routing
14. **Protect Working Code**: Do not refactor or rewrite stable, functioning components outside the scope of your current assignment.
15. **No Gratuitous Replacements**: Do not swap out functional UI components with new packages without an explicit requirement.
16. **Code Clarity**: Write clean, readable, well-commented code tailored for an MSc IT student's portfolio.
17. **Mandatory Verification**: Thoroughly test changes against the test scenarios in `docs/03-flows-rules.md` before declaring any task complete.

## 7. After Every Task

Upon completing any development task, provide a structured completion report with the following details:
- **What was implemented**: Concise description of features or fixes delivered.
- **Files created**: List of all new files added to the project.
- **Files modified**: List of existing files updated during the task.
- **How to run and test**: Exact commands and UI steps required to verify the changes.
- **Known issues or next steps**: Any deferred edge cases or items queued for the next task.

*Never mark a feature as completed or working without executing verification tests.*
