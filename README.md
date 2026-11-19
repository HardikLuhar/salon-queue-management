# Salon Queue Management System

**Live Demo:** Live Demo: Deployment Pending

---

### Quick Navigation to All 7 Screens
- **1. Salon Home (`/`)**: [http://localhost:5173/](http://localhost:5173/) — Live queue flow overview, on-duty barber availability & wait estimates
- **2. Join Queue (`/join`)**: [http://localhost:5173/join](http://localhost:5173/join) — Remote customer check-in, service selection (max 3) & token generation
- **3. My Status (`/status/s-14`)**: [http://localhost:5173/status/s-14](http://localhost:5173/status/s-14) — Live queue rank, dynamic approach alert (2nd in line), full-screen Called alert & cancellation
- **4. Reception Dashboard (`/reception`)**: [http://localhost:5173/reception](http://localhost:5173/reception) — Master command center, walk-in registration, station oversight & FIFO preference skipping *(Staff Access / No PIN required for demo)*
- **5. Barber View (`/barber/amit`)**: [http://localhost:5173/barber/amit](http://localhost:5173/barber/amit) — Dedicated workstation view (Ravi, Amit, Imran), service stopwatch & complete session *(Barber Workstation)*
- **6. Waiting Area Wall TV (`/display`)**: [http://localhost:5173/display](http://localhost:5173/display) — Fullscreen high-contrast landscape dashboard with synthesized audio chime on call *(Waiting Area Lobby TV)*
- **7. Owner Settings (`/admin`)**: [http://localhost:5173/admin](http://localhost:5173/admin) — Queue master switch, 30-min auto-cutoff, service catalog & staff duty roster *(Owner / PIN: `1234`)*

---

## 1. Project Overview

**The Barber & Co.** Salon Queue Management System is an editorial, high-fashion web application built with **React**, **Vite**, and **Tailwind CSS**. It is designed to eliminate weekend waiting chaos in luxury barbershops and salons. The system unites remote mobile check-ins and physical walk-ins into a unified First-In-First-Out (FIFO) queue while enforcing strict barber preferences, station concurrency guards, and bidirectional cross-device synchronization.

### Visual Identity
- **Design Philosophy**: High-fashion editorial monochrome derived from bespoke barbershop photography.
- **Palette**: Stark black (`#000000` / `#0A0A0A`), crisp pure white (`#FFFFFF`), and architectural gray surfaces (`#F5F5F5` canvas and `#E5E5E5` hairline dividers).
- **Typography**: Editorial serif display headers (*Cormorant Garamond*) paired with modernist sans-serif body copy (*Inter*).
- **Bilingual Support**: 100% centralized English and Gujarati (ગુજરાતી) dictionary.

---

## 2. Core Architecture & Synchronization

- **Zero-Backend Real-Time Synchronization**: Implemented via a decentralized Web `BroadcastChannel` layer (`salon_queue_realtime_sync`) backed by persistent `localStorage` and cross-window `storage` event listeners.
- **Sub-50ms Latency**: State changes (such as calling a customer, starting a service, marking complete, or adding walk-ins) propagate across all viewports within **< 50 milliseconds**, far exceeding the 5-second SLA requirement.
- **Offline Resilience**: Automatically detects network disconnection and renders an amber reconnecting alert (`Reconnecting to queue...`).

---

## 3. Strict Business Rules & Lifecycle

1. **Chronological FIFO Authority**: Queue rank is determined strictly by join timestamp. Walk-ins join at the very end of the line.
2. **Barber Preference Skipping**: When Barber Amit calls next, the engine skips any customer who specifically requested Ravi (retaining their #1 position for Ravi) and selects the earliest customer requesting Amit or "Any barber".
3. **Single Chair Concurrency**: A barber station can seat at most one customer in the `In chair` status concurrently.
4. **Strict State Transitions**: Status transitions proceed strictly forward:
   - `Waiting` → `Called` → `In chair` → `Done`
   - `Waiting` → `Cancelled` (cannot be restored)
   - `Called` → `No-show` (10-minute grace period enforced; returning customers re-enter as new walk-ins at the END)
5. **Zero-Barber Guard**: When all on-duty barbers are on break, wait time displays *"Queue paused — all barbers on break"* without dividing by zero.

---

## 4. Local Setup & Execution

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Commands
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build & verify bundle
npm run build
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Automated Verification Checklist

Execute the complete 15-point certification checklist from Section 11 of `docs/03-flows-rules.md`:

```bash
node scripts/test-full-15.js
```

### Test Results Summary:
- **Test 1**: 2 services duration & price calculation (Haircut ₹150 / 30m + Beard trim ₹80 / 15m → 45m, ₹230) — **PASS**
- **Test 2**: Duplicate active phone submission blocked & redirected — **PASS**
- **Test 3**: Barber Amit skips Ravi preference and takes Any — **PASS**
- **Test 4**: Customer phone displays full-screen Called alert within 5s — **PASS**
- **Test 5**: Barber Start switches customer to In chair & starts stopwatch — **PASS**
- **Test 6**: Barber Done marks ticket Done & frees chair to Available — **PASS**
- **Test 7**: No-show customer re-added joins at END of queue with new sequential token — **PASS**
- **Test 8**: Owner closed queue disables `/join` submission — **PASS**
- **Test 9**: Language toggle switches all text to Gujarati (0 missing keys) — **PASS**
- **Test 10**: Downstream wait times decrease progressively as preceding services finish — **PASS**
- **Test 11**: Real-time cross-device sync operates within SLA (< 50ms) — **PASS**
- **Test 12**: Single-chair concurrency guard prevents multiple In-chair customers — **PASS**
- **Test 13**: Ravi customer is NEVER assigned to Amit or Imran — **PASS**
- **Test 14**: 4th service selection blocked by 3-service limit — **PASS**
- **Test 15**: Receptionist walk-in appends to the END of the shared queue — **PASS**
- **Guards 16-19**: Strict lifecycle transitions, 10-minute grace period guard, zero-barber guard — **PASS**

---

## 6. Vercel Deployment Instructions

The project is pre-configured for instant zero-config deployment on Vercel:

1. **SPA Rewrites**: Handled automatically by `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. **Deploy via GitHub / Vercel Dashboard**:
   - Push repository to GitHub.
   - Import repository on [vercel.com](https://vercel.com).
   - Framework Preset: **Vite**.
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
   - Click **Deploy**.
3. **Deploy via Vercel CLI (alternative)**:
   ```bash
   npx vercel
   ```
   Follow the prompts to link and deploy. Update `README.md` with the production URL upon completion.
