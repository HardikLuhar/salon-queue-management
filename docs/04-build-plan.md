# 4. Build Plan: Step-by-Step Implementation Guide

Follow these steps strictly in sequential order. After completing each step, verify functionality, run the application, and make a clean git commit.

---

## Step 1 — Project Setup, Editorial Monochrome Theme & Routing Architecture

### Goal
Read all project documentation, initialize the React + Vite + Tailwind CSS project with the editorial black-and-white visual identity, set up centralized English/Gujarati localization, configure client routing for all 7 screens, and scaffold the shared queue store.

### Prompt to Copy & Paste:
```text
Read AGENTS.md, docs/01-brief.md, docs/02-screens.md, and docs/03-flows-rules.md completely.
1. Provide a concise 8-bullet summary of the application architecture, business rules, and design system.
2. Initialize the project using React + Vite + Tailwind CSS.
3. Configure the editorial monochrome design system:
   - Primary stark black (#000000 / #0A0A0A)
   - Crisp pure white (#FFFFFF)
   - Architectural subtle grays (#F5F5F5 canvas, #E5E5E5 1px hairline borders, #737373 secondary text)
   - Typography pairing: Elegant serif display headers (e.g., Playfair Display or Cormorant) + modernist sans-serif body (Inter / system-ui).
4. Set up the centralized bilingual localization dictionary (English and Gujarati) in a dedicated module (e.g., src/locales/translations.js) with a persistent [ EN | ગુજરાતી ] toggle in the top header.
5. Set up React Router with empty placeholder pages for all 7 screens:
   - / (Home)
   - /join (Join Queue)
   - /status/:id (My Status)
   - /reception (Reception Dashboard)
   - /barber/:name (Barber View)
   - /display (Waiting Area TV)
   - /admin (Owner Settings)
6. Scaffold a centralized state management store (e.g., React Context / Zustand) with the initial dummy data from docs/02-screens.md (Barbers: Ravi, Amit, Imran; 8 initial services; active tokens: S-12, S-14, S-15).
Verify: App compiles with `npm run dev`, navigation switches between all 7 empty screens, and the language toggle switches all header labels between English and Gujarati without errors.
```

---

## Step 2 — Screen 1 (Home) & Screen 2 (Join Queue)

### Goal
Build the high-fashion customer landing page (`/`) and the remote check-in form (`/join`), enforcing service limits, input validation, and barber preference logic.

### Prompt to Copy & Paste:
```text
Build Screen 1 (Home - /) and Screen 2 (Join Queue - /join) following docs/02-screens.md and docs/03-flows-rules.md:
1. Home Screen (/):
   - Editorial hero section with high-contrast monochrome branding, salon open/closed status badge, and live queue congestion metric card ("6 people waiting · about 50 min").
   - Barbers on Duty section with black-and-white portrait cards for Ravi (Busy), Amit (Available), and Imran (On break).
   - Prominent stark black CTA button "Join Queue" navigating to /join. If queue is closed, disable with an explanatory notice.
2. Join Queue Screen (/join):
   - Header with back navigation (<) and language toggle.
   - Customer details input: Full name and 10-digit mobile phone number with validation.
   - Service Selection: Multi-select service cards with 1px hairline borders displaying name in EN/GU, duration, and price. Limit strictly to maximum 3 services with toast alert on 4th selection attempt.
   - Barber Selection: Radio options for "Any barber (fastest)" and individual barber cards with black-and-white photos. Show break warning if selected barber is on break.
   - Live Order Summary: Real-time calculation of total duration, total price, and estimated wait.
   - "Confirm & Join Queue" stark black CTA button.
3. Duplicate Check: If phone number already has an active Waiting/Called spot, prevent duplicate creation and redirect to /status/:existingId.
Verify: Selecting 2 services calculates correct time/price (Test 1). 4th service selection is blocked (Test 14). Submitting with duplicate active phone redirects to existing spot (Test 2).
```

---

## Step 3 — Screen 3 (My Status Tracker) & Live Customer Lifecycle

### Goal
Implement token generation upon submission (`S-1`, `S-2`...) and build the customer real-time tracking interface (`/status/:id`) with dynamic queue positioning, waiting calculations, and approach/turn alert takeovers.

### Prompt to Copy & Paste:
```text
Build Screen 3 (My Status - /status/:id) following docs/02-screens.md and docs/03-flows-rules.md:
1. Form Completion & Token Generation:
   - When customer confirms on /join, generate next sequential token (e.g., S-14), store entry with status "Waiting", and automatically navigate to /status/:id.
2. My Status Interface:
   - Large architectural token display (S-14), customer name, and selected services summary.
   - Live queue position counter ("4th in line", "3 customers ahead of you").
   - Estimated wait time calculated using the formula from docs/03-flows-rules.md: (Total service minutes ahead) / (Active on-duty working barbers).
   - Minimalist circular SVG progress ring advancing as preceding customers finish.
3. Dynamic Status Notification States:
   - Position = 2: Display amber alert card: "Start coming to the salon! You're 2nd in line."
   - Status = CALLED: Display full-screen high-contrast monochrome takeover modal (#000000 background, #FFFFFF text): "It's your turn! Go to Amit" with assigned barber name, directions to chair, and phone vibration (navigator.vibrate).
4. Cancellation:
   - "Cancel my spot" button with two-step confirmation modal. Confirming permanently marks ticket "Cancelled" and removes customer from line.
Verify: Submitting /join opens /status/:id with correct token. Position 2 shows "Start coming" alert. State change to Called triggers full-screen alert within 5 seconds (Test 4).
```

---

## Step 4 — Screen 4 (Reception Dashboard) & FIFO Barber Assignment

### Goal
Build the tablet-optimized dual-column Reception Dashboard (`/reception`) with active workstation monitoring, FIFO waiting list, walk-in quick entry, and barber-preference call logic.

### Prompt to Copy & Paste:
```text
Build Screen 4 (Reception Dashboard - /reception) following docs/02-screens.md and docs/03-flows-rules.md:
1. Target Layout: Tablet landscape 2-column layout (collapsible tabs on mobile).
2. Header Strip:
   - Salon brand in serif typography, Queue Open/Closed indicator dot, today's metrics strip (Served, No-Shows, Avg Wait), and [+ Add Walk-in] button.
3. Left Column — Barber Workstations:
   - Cards for Ravi, Amit, and Imran showing chair number, black-and-white photo, and status badge.
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
Verify: Walk-in joins at the end (Test 15). Calling next for Amit skips customer waiting for Ravi and picks next eligible customer (Test 3).
```

---

## Step 5 — Screen 5 (Barber View) & Screen 6 (Waiting Area TV)

### Goal
Build the distraction-free mobile Barber View (`/barber/:name`) and the 5-meter glanceable Waiting Area TV display (`/display`), with synchronized start/done timers and visual/audio announcements.

### Prompt to Copy & Paste:
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
Verify: Barber Start updates Reception and TV (Test 5). Barber Done removes customer from active queue and updates Reception and TV (Test 6). Barber cannot have two simultaneous In-chair customers (Test 12).
```

---

## Step 6 — Screen 7 (Owner Settings) & Real-Time Sync Layer

### Goal
Build the Owner Settings panel (`/admin`) for service catalog toggles, barber duty rosters, queue auto-cutoff rules, and cross-device state synchronization.

### Prompt to Copy & Paste:
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
Verify: Toggling queue closed disables /join with clear message (Test 8). Turning off a service hides it from /join. Updates sync across devices within 5 seconds (Test 11).
```

---

## Step 7 — Business Rules, Edge Cases & Polish

### Goal
Implement strict lifecycle validations, 10-minute no-show rules, cancellation handling, Gujarati translation audit, touch target verification, and execute the complete 15-point test checklist.

### Prompt to Copy & Paste:
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
     12. No concurrent In-chair customers per barber
     13. Ravi preference never assigned to Amit/Imran
     14. 3-service limit enforced
     15. Walk-ins join at end of queue
Report pass/fail status for each test.
```

---

## Step 8 — Deployment & Live Demo Link

### Goal
Prepare the project for production deployment on Vercel (frontend) and Render/Railway (backend if applicable), and update README.md with the live URL on the first line.

### Prompt to Copy & Paste:
```text
Prepare the application for production deployment:
1. Build & Lint Check:
   - Run production build (`npm run build`) and fix any bundling or TypeScript/ESLint warnings.
   - Ensure environment variables and routes (SPA rewrites for Vercel via vercel.json) are properly configured.
2. Deploy:
   - Deploy frontend to Vercel.
   - If backend synchronization service is required, deploy to Render or Railway.
3. README.md Live Link Compliance:
   - Place the live demo URL on the FIRST LINE immediately after the main project heading:
     # Salon Queue Management System
     **Live Demo:** <deployed_url>
     *(or `Live Demo: Deployment Pending` if awaiting credentials)*
   - List quick navigation links to all 7 screens with sample credentials/PINs right below it.
```

---

## Fix & Iterate Prompts (Use Whenever Needed)

### Bug Fix: No-Show Customer Re-added Goes to Top Instead of End
```text
Bug: When I mark a customer as No-show and then re-add them, they appear at the top of the queue instead of the end.
Expected Behavior: According to docs/03-flows-rules.md, a No-show customer who returns must be added as a fresh walk-in at the very END of the queue with a brand-new token identifier and a new timestamp.
Please explain why this bug occurred in the queue store, fix the timestamp/ordering logic, and verify that the re-added customer appears at the bottom.
```

### Bug Fix: Estimated Wait Shows 0 min With Customers Ahead
```text
Bug: The estimated wait time on /status/:id displays 0 min even though 3 customers are currently ahead in line.
Expected Behavior: According to docs/03-flows-rules.md Section 5, estimated waiting time must equal (Total service minutes of customers ahead) divided by (Number of active on-duty working barbers).
Please inspect the wait calculation helper, identify where the duration summation or barber filter is failing, compare with the specification formula, and fix it.
```

### UI Refinement: Barber Workstation Cards Scaling on Tablet
```text
UI Tweak: On the Reception Dashboard (/reception), the barber workstation cards are compressed when viewing on a 10" tablet in landscape.
Please adjust the CSS grid layout so the left column displays barber workstation cards with clear spacing, showing the barber's photo, name, active token, and an enlarged progress bar with remaining service time. Ensure the right-column waiting queue table maintains comfortable column widths.
```
