# Master Prompt Log — Salon Queue Management System

This document contains every prompt used during the design, development, debugging, and deployment of the **Salon Queue Management System**, listed strictly in chronological order, including prompts that produced errors, bugs, or required follow-up corrections.

---

## Phase 1: Architectural Specification & Documentation

### Prompt 1: Project Brief & Requirements Definition
```text
Create docs/01-brief.md for a luxury Salon Queue Management System called "The Barber & Co.".
Define:
1. Problem statement regarding weekend waiting chaos (1-2 hr uncertain wait times, disputes, walkouts).
2. User personas: Remote Customer, Walk-in Customer, Receptionist/Owner, Barbers.
3. Core features: remote join, live turn tracking, reception walk-in register, barber workstation timers, waiting area TV display, owner admin settings, 30-min closing auto-cutoff, and bilingual English/Gujarati localization.
4. Strict out-of-scope boundaries: no online payments, no future calendar appointments, no SMS/WhatsApp gateway APIs, no loyalty rewards.
```
*Outcome:* Generated `docs/01-brief.md` establishing project boundaries and feature requirements.

---

### Prompt 2: UI/UX Screen Specifications & Editorial Design System
```text
Create docs/02-screens.md containing detailed UI/UX specifications for all 7 screens:
- / (Home Screen)
- /join (Join Queue)
- /status/:id (My Status Tracker)
- /reception (Reception Dashboard)
- /barber/:name (Barber Workstation)
- /display (Waiting Area Wall TV)
- /admin (Owner Settings & Analytics)
Define the editorial monochrome visual identity: stark black (#000000 / #0A0A0A), pure white (#FFFFFF), architectural grays (#F5F5F5 canvas, #E5E5E5 dividers), Cormorant Garamond serif headers, Inter sans-serif body, and mobile-first layouts. Include dummy data for Ravi, Amit, and Imran, 8 salon services, and active tokens.
```
*Outcome:* Generated `docs/02-screens.md` with visual hierarchies, wireframe layouts, and mock datasets.

---

### Prompt 3: Business Logic, State Machine & 15-Point Test Checklist
```text
Create docs/03-flows-rules.md specifying:
1. End-to-end customer and walk-in walkthrough scenarios.
2. The 6-state lifecycle: Waiting -> Called -> In chair -> Done, plus Cancelled and No-show.
3. Mathematical wait time formula: (Total Service Minutes of Customers Ahead) / (Active On-Duty Working Barbers).
4. Chronological FIFO ordering rules and Barber Preference Skipping logic (e.g. Barber Amit calling next skips customers waiting specifically for Ravi and picks the next customer wanting Amit or 'Any barber').
5. Single-chair concurrency guard and zero-barber break guard.
6. A 15-point verification test checklist covering all requirements.
```
*Outcome:* Generated `docs/03-flows-rules.md` as the authoritative source of truth for business algorithms.

---

### Prompt 4: Step-by-Step Implementation Build Plan
```text
Create docs/04-build-plan.md providing an incremental 8-step build plan for the application.
For each step, specify the goal, files to create/modify, the exact prompt to copy and paste, and verification criteria.
Include tests after each step to prevent regression.
```
*Outcome:* Generated `docs/04-build-plan.md` guiding development progression.

---

## Phase 2: Core Application Implementation (Steps 1 – 6)

### Prompt 5: Project Setup, Editorial Monochrome Theme & Routing Architecture
```text
Read AGENTS.md, docs/01-brief.md, docs/02-screens.md, and docs/03-flows-rules.md completely.
1. Provide a concise 8-bullet summary of the application architecture, business rules, and design system.
2. Initialize the project using React + Vite + Tailwind CSS.
3. Configure the editorial monochrome design system:
   - Primary stark black (#000000 / #0A0A0A)
   - Crisp pure white (#FFFFFF)
   - Architectural subtle grays (#F5F5F5 canvas, #E5E5E5 1px hairline borders, #737373 secondary text)
   - Typography pairing: Elegant serif display headers (Cormorant Garamond) + modernist sans-serif body (Inter / system-ui).
4. Set up the centralized bilingual localization dictionary (English and Gujarati) in a dedicated module (src/locales/translations.js) with a persistent [ EN | ગુજરાતી ] toggle in the top header.
5. Set up React Router with empty placeholder pages for all 7 screens:
   - / (Home)
   - /join (Join Queue)
   - /status/:id (My Status Tracker)
   - /reception (Reception Dashboard)
   - /barber/:name (Barber Workstation)
   - /display (Waiting Area TV)
   - /admin (Owner Settings)
6. Verify development server runs cleanly.
```
*Outcome:* Scaffolded React 18 + Vite project, configured Tailwind palette, fonts, translations, and base routes.

---

### Prompt 6: Shared Queue Store & Core Algorithms (Step 2)
```text
Build the centralized QueueContext.jsx state management store:
1. Define the 6 valid queue statuses: waiting, called, in_chair, done, cancelled, no_show.
2. Enforce the state transition matrix:
   - waiting -> called, cancelled
   - called -> in_chair, no_show
   - in_chair -> done
   - terminal states: done, cancelled, no_show
3. Implement wait time calculation:
   - Formula: (Sum of service duration of waiting customers ahead + in-chair remaining) / active on-duty working barbers.
4. Implement FIFO allocation algorithm:
   - Calling next for barber X finds the earliest customer requesting barber X or "Any barber".
5. Implement duplicate active phone validation: prevent joining if a customer with the same phone is currently waiting or called.
6. Provide seed data: Barbers Ravi (Chair 1), Amit (Chair 2), Imran (Chair 3), 8 active services, and initial queue tokens S-12 (In chair), S-14 (Waiting), S-15 (Waiting).
```
*Outcome:* Implemented `QueueContext.jsx` with FIFO ordering, wait calculations, and state transition guards.

---

### Prompt 7: Screens 1, 2, and 3 (Home, Join Queue, My Status Tracker)
```text
Build Screen 1 (Home - /), Screen 2 (Join Queue - /join), and Screen 3 (My Status Tracker - /status/:id):
1. Screen 1 (Home - /):
   - Editorial serif hero header and live queue congestion summary.
   - 4-photo visual craft vignettes (Classic Fade, Modern Mullet, Razor Shave, Textured Crop).
   - Live Barbers on Duty cards showing chair availability and status.
   - Prominent [Join Queue] CTA with closed queue notice if closed.
2. Screen 2 (Join Queue - /join):
   - Form for Full Name and 10-digit Phone.
   - Multi-service selection grid (max 3 services).
   - Barber preference radio group: "Any barber (fastest)" vs specific on-duty barber.
   - Dynamic price & duration summary + initial wait estimate.
   - Duplicate phone prevention redirect.
3. Screen 3 (My Status Tracker - /status/:id):
   - Large prominent token badge (e.g. S-14) and live queue position.
   - Countdown estimated wait time.
   - Approaching alert (amber banner when position <= 2: "Start coming to the salon").
   - Full-screen called alert takeover modal: "It's your turn! Go to Barber X" with vibration.
   - Cancel Spot action with confirmation modal.
```
*Outcome:* Screens 1, 2, and 3 operational with real-time token tracking and approach threshold alerts.

---

### Prompt 8: Screen 4 (Reception Dashboard - /reception)
```text
Build Screen 4 (Reception Dashboard - /reception) following docs/02-screens.md and docs/03-flows-rules.md:
1. Target Layout: Tablet landscape 2-column layout (collapsible tabs on mobile).
2. Header Strip:
   - Salon brand in serif typography, Queue Open/Closed indicator dot, today's metrics strip (Served, No-Shows, Avg Wait), and [+ Add Walk-in] button.
3. Left Column — Barber Workstations:
   - Cards for Ravi, Amit, and Imran showing chair number, photo, and status badge.
   - When Busy: show active token, customer name, elapsed timer, linear progress bar, and disabled Call Next button.
   - When Available: enable prominent [Call Next Customer] button.
   - When On Break: show muted badge and disable Call Next.
4. Right Column — Live Waiting Queue:
   - Filter pills: All, Any Barber, Specific Barber.
   - Rows displaying Token, Name, Services, Barber preference, Wait time, and action buttons ([No-Show] if Called, [Cancel]).
   - Highlight customers waiting > 60 minutes with an amber alert outline.
5. Queue Allocation Logic:
   - Tapping [Call Next] for Barber X selects the EARLIEST Waiting customer who requested Barber X OR "Any barber".
   - If earlier customers requested a different barber, SKIP them (they keep their spot for their preferred barber).
   - Transition selected customer to "Called" and assign to Barber X.
6. Add Walk-In Modal:
   - Quick form for Name, Phone, Services (max 3), and Barber preference. Appends walk-in to the END of the shared queue with a new token.
```
*Outcome:* Screen 4 built with tablet two-column layout, walk-in modal, and FIFO preference skipping.

---

### Prompt 9: Screens 5 & 6 (Barber Workstation & Waiting Area TV Display)
```text
Build Screen 5 (Barber View - /barber/:name) and Screen 6 (Waiting Area TV - /display) following docs/02-screens.md and docs/03-flows-rules.md:
1. Barber View (/barber/:name):
   - Header with barber name, chair number, and [Available / On Break] toggle pill.
   - Current customer card: Token, Customer Name, Services list, and target duration.
   - State A (Customer Called): Large [Start Service] button -> transitions customer status to "In chair" and starts service stopwatch.
   - State B (Customer In Chair): Running stopwatch (e.g., 18:42 / 45:00), progress bar, and large [Done / Complete] button.
   - Clicking [Done] marks customer "Done", releases chair to Available, logs completion, and clears workstation.
   - Next Customer Preview: Shows next upcoming customer for this barber.
2. Waiting Area TV (/display):
   - Non-scrolling full-screen high-contrast landscape dashboard (stark dark canvas #0A0A0A, pure white text #FFFFFF).
   - "Serving Now" grid: 3 equal columns for chairs 1, 2, 3 showing Barber photo, Chair #, and giant active token (NOW: S-12).
   - "Up Next" strip: Cards for the next 5 tokens in line with names and estimated wait times.
   - Audio & Visual Callout: When a token transitions to "Called", flash that workstation column with an inverted pulse animation for 15s and play a pleasant notification chime (via web audio API).
```
*Outcome:* Built Barber workstation view with stopwatch timer and Waiting Area TV display with Web Audio API chime.

---

### Prompt 10: Screen 7 (Owner Settings / Admin) & Cross-Device Sync Layer
```text
Build Screen 7 (Owner Settings - /admin) and ensure cross-device synchronization following docs/02-screens.md and docs/03-flows-rules.md:
1. Owner Settings Interface (/admin):
   - Queue Master Switch: [Queue Open | Queue Closed]. Toggling Closed disables online join on /join but allows walk-ins at /reception.
   - Auto-Cutoff Rule: Online check-in closes automatically 30 minutes before salon closing time (e.g., 8:30 PM for 9:00 PM close).
   - Services Management: Table of all 8 services with English/Gujarati names, durations, prices, and active toggle switches. Inactive services are hidden from /join and walk-in forms.
   - Barbers on Duty: Toggles for Ravi, Amit, Imran to set on-duty status. Off-duty barbers are hidden from selection and TV columns.
   - Operational Analytics: Summary cards for Customers Served, Average Wait Time, and No-Shows.
2. Storage & Cross-Device Sync:
   - Connect the shared queue state across viewports (Customer phone, Receptionist tablet, Barber view, TV display).
   - Ensure state transitions propagate across all connected screens within 5 seconds.
   - If connection is lost, display an offline badge ("Reconnecting to queue...").
```
*Outcome:* Screen 7 completed with PIN authentication (`1234`), 30-min closing auto-cutoff, catalog controls, and BroadcastChannel sync.

---

### Prompt 11: Edge Cases, Lifecycle Guards & 15-Point Test Suite Verification
```text
Implement edge cases, lifecycle guards, and UI polish according to docs/02-screens.md and docs/03-flows-rules.md:
1. Strict State Lifecycle & Edge Cases:
   - Enforce forward-only transitions: Waiting -> Called -> In chair -> Done; Waiting -> Cancelled; Called -> No-show. Block all invalid jumps.
   - No-Show: Receptionist can only mark No-show if customer is Called and 10 minutes elapse. If customer returns later, re-add them as a walk-in at the END with a new token.
   - Customer Cancellation: Confirmation modal required. Spot cannot be restored.
   - Empty States: Friendly editorial empty states when 0 customers waiting ("No one waiting — walk right in for instant service!").
   - Zero-Barber Guard: If all barbers are on break, display "Queue paused — all barbers on break" instead of dividing by zero.
2. Bilingual Audit & Accessibility Polish:
   - Audit every screen in Gujarati (ગુજરાતી). Fix any untranslated text, raw keys, or layout overflow.
   - Ensure all touch targets are at least 48px x 48px on mobile devices.
   - Ensure contrast complies with editorial monochrome standards.
3. Verification:
   - Run the full 15-point test checklist from docs/03-flows-rules.md:
     1. 2 services calculation
     2. Duplicate phone prevention
     3. Call next skips non-matching barber preference
     4. "It's your turn" alert within 5s
     5. Barber Start syncs Reception & TV
     6. Barber Done syncs Reception & TV
     7. No-show re-add joins at end with new token
     8. Closed queue disables online join
     9. Language toggle switches all text to Gujarati
     10. Wait time decreases as customers finish
     11. Real-time sync across devices within 5s
     12. Single-chair concurrency guard
     13. Strict preference preservation
     14. 3-service limit enforced
     15. Reception walk-in appends to end of queue
```
*Outcome:* Created `scripts/test-full-15.js` executing all 15 core tests plus 5 edge case guards (20/20 passing).

---

## Phase 3: Bugs, Failed Prompts & Corrective Iterations

### Prompt 12 (Bug Report): No-Show Re-Add Queue Order Bug
```text
Bug: When I mark a customer as No-show and then re-add them, they appear at the top of the queue instead of the end.
Expected Behavior: According to docs/03-flows-rules.md, a No-show customer who returns must be added as a fresh walk-in at the very END of the queue with a brand-new token identifier and a new timestamp.
Please explain why this bug occurred in the queue store, fix the timestamp/ordering logic, and verify that the re-added customer appears at the bottom.
```
*Why it failed previously:* The initial `reAddNoShowCustomer` function reused the original customer object, preserving their original `joinedAt` timestamp. Because FIFO queue sorting used `new Date(a.joinedAt).getTime()`, the returning customer retained their early timestamp and jumped ahead of everyone else.  
*Correction:* Updated `reAddNoShowCustomer` to generate a fresh sequential token and stamp `joinedAt: new Date().toISOString()`, appending them strictly to the bottom of the line.

---

### Prompt 13 (Bug Report): Estimated Wait Time 0 Min Bug
```text
Bug: The estimated wait time on /status/:id displays 0 min even though 3 customers are currently ahead in line.
Expected Behavior: According to docs/03-flows-rules.md Section 5, estimated waiting time must equal (Total service minutes of customers ahead) divided by (Number of active on-duty working barbers).
Please inspect the wait calculation helper, identify where the duration summation or barber filter is failing, compare with the specification formula, and fix it.
```
*Why it failed previously:* `calculateServicesTotal` expected an array of string service IDs, but customers stored polymorphic representations (objects or `serviceIds`), causing `reduce` to return 0. Furthermore, barbers with `onDuty === undefined` evaluated to falsy in `barbers.filter(b => b.onDuty)`.  
*Correction:* Implemented polymorphic service duration resolution and capacity filtering (`b.onDuty !== false && b.status !== 'on_break'`), restoring accurate non-zero wait calculations.

---

### Prompt 14 (UI Issue): Reception Tablet Column Squeeze
```text
UI Tweak: On the Reception Dashboard (/reception), the barber workstation cards are compressed when viewing on a 10" tablet in landscape.
Please adjust the CSS grid layout so the left column displays barber workstation cards with clear spacing, showing the barber's photo, name, active token, and an enlarged progress bar with remaining service time. Ensure the right-column waiting queue table maintains comfortable column widths.
```
*Outcome:* Re-proportioned CSS grid to `lg:grid-cols-12` (5 columns for workstations, 7 columns for waiting queue) and enlarged progress bars with explicit elapsed/remaining badges.

---

### Prompt 15 (Critical Runtime Crash): White Screen on `npm run dev`
```text
its white screen when i npm run dev
```
*Why it failed previously:* In `QueueContext.jsx` inside `getEstimatedWaitMinutes()`, the reduce accumulator was defined as `acc`, but inside the `if (cust.startedAt)` block it returned `sum + Math.max(...)`. Because initial customer `S-12` had status `in_chair` with an active `startedAt` timestamp, rendering `HomeScreen` immediately threw an uncaught `ReferenceError: sum is not defined`. With no Error Boundary, React 18 crashed completely and unmounted the entire DOM tree into a blank white screen.  
*Correction:*
1. Fixed accumulator variable reference from `sum` to `acc`.
2. Created `src/components/ErrorBoundary.jsx` and wrapped `App.jsx` to render an editorial recovery card instead of crashing.
3. Added defensive `Array.isArray(...)` validation to prevent corrupted `localStorage` caches from breaking initial state.

---

### Prompt 16 (Asset Issue): Broken "Razor Shave" Image
```text
can u check image tihng i can see there is one image isnt working 
in my website
Razor Shave this image in dashboard
```
*Why it failed previously:* On Windows NTFS, file paths are case-insensitive, but Vite's asset server and production Linux environments (e.g. Vercel) are strictly case-sensitive. The file in `public/photos/` was saved as `Razor.avif` (capital R), but `HomeScreen.jsx` requested `/photos/razor.avif` (lowercase r), resulting in a 404 image load error.  
*Correction:* Renamed `Razor.avif` to `razor.avif` via an intermediate temp file, aligned `HomeScreen.jsx`, and added an automatic retry fallback in the `<img>` tag.

---

## Phase 4: Workflow Enhancements & Staff Role Simplification

### Prompt 17: Finishing Early & Receptionist Barber Break Controls
```text
what if barber is completed task early and there should be option that bhe finished and ready to take new customer
and recenptionish have ability to set that batrber is on break or not
```
*Outcome:*
1. Added `[Call Next Customer]` button directly onto empty Barber workstation cards so barbers can summon their next client immediately after finishing early.
2. Added `[Set on break]` and `[End break · Ready]` buttons on each barber card in `ReceptionScreen.jsx` so the receptionist can control staff breaks without switching screens.

---

### Prompt 18 (Bug Report): "No active in-chair customer found to complete"
```text
No active in-chair customer found to complete.
what is this when i click on finesh early
```
*Why it failed previously:* When a customer was summoned via "Call Next", their status was `called`. `completeService` strictly searched for `q.status === 'in_chair'`. If the receptionist clicked "Finish early & free chair" on a called customer, the store rejected the action with that error.  
*Correction:* Updated `completeService` in `QueueContext.jsx` to match both `in_chair` and `called` states (`q.status === 'in_chair' || q.status === 'called'`), allowing immediate completion and chair release regardless of whether the customer was seated or summoned.

---

### Prompt 19: Removing the `[Start Service]` Intermediate Step
```text
[Start Service] remove this feature
he only poeple manage the webiste is admin and receptionist
```
*Outcome:* Barbers do not manage the website—only the receptionist and admin do. Removed the manual `[Start Service]` button and intermediate barrier. When the receptionist calls a customer, `startedAt` is recorded automatically, the service stopwatch begins running immediately, and the only required action upon service end is `[Complete Session / Done]`.

---

### Prompt 20: Removing TV Screen Flash Banner
```text
remove that bar "please proceed to chair"
```
*Outcome:* Removed the top overlay banner (`"Please proceed to Chair #..."`) from `DisplayScreen.jsx` so the lobby TV screen remains completely unobstructed while preserving the audio chime.

---
