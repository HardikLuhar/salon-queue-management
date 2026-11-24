# Salon Queue Management System

**Live demo:** https://salon-queue-management-pi.vercel.app/  
**Hosted on:** Vercel (frontend)

### Staff Test Logins & Workstation PINs:
- **Owner Admin Screen (`/admin`):** PIN `1234` (controls queue master switch, 30-min auto-cutoff, services catalog, and staff duty roster)
- **Reception Desk (`/reception`):** Open staff access — no PIN required for demo evaluation (call next, walk-ins, break toggles, early finish)
- **Barber Workstations:** Dedicated workstation views with live timers:
  - Chair 1 (Ravi): [`/barber/ravi`](https://salon-queue-management-pi.vercel.app/barber/ravi)
  - Chair 2 (Amit): [`/barber/amit`](https://salon-queue-management-pi.vercel.app/barber/amit)
  - Chair 3 (Imran): [`/barber/imran`](https://salon-queue-management-pi.vercel.app/barber/imran)
- **Waiting Area TV Display (`/display`):** Fullscreen public lobby mode with Web Audio API chime on customer call: [`/display`](https://salon-queue-management-pi.vercel.app/display)

---

## About

**The Barber & Co.** Salon Queue Management System is an editorial, high-fashion web application built with **React**, **Vite**, and **Tailwind CSS**. It is designed to eliminate weekend waiting chaos in luxury salons and barbershops by uniting remote mobile check-ins and physical walk-ins into a synchronized, transparent First-In-First-Out (FIFO) queue.

The application features full real-time state synchronization across all viewports (Customer phone, Receptionist tablet, Barber workstation, and Lobby Wall TV), strict barber preference logic, single-chair concurrency protection, 30-minute automated closing cutoff, and 100% centralized English and Gujarati (ગુજરાતી) bilingual localization.

---

### Quick Navigation to All 7 Screens

| # | Screen | Direct Live Link | Description & Access |
|---|---|---|---|
| **1** | **Salon Home** | [salon-queue-management-pi.vercel.app/](https://salon-queue-management-pi.vercel.app/) | Live salon flow, on-duty barber availability cards & estimated wait times |
| **2** | **Join Queue** | [salon-queue-management-pi.vercel.app/join](https://salon-queue-management-pi.vercel.app/join) | Remote check-in, service selection (max 3), barber preference & token issue |
| **3** | **My Status Tracker** | [salon-queue-management-pi.vercel.app/status/s-14](https://salon-queue-management-pi.vercel.app/status/s-14) | Live queue rank, dynamic 2nd-in-line travel alert, full-screen called takeover |
| **4** | **Reception Dashboard** | [salon-queue-management-pi.vercel.app/reception](https://salon-queue-management-pi.vercel.app/reception) | Master command center, walk-in modal, break toggles & session completions *(Staff Access)* |
| **5** | **Barber Workstation** | [salon-queue-management-pi.vercel.app/barber/amit](https://salon-queue-management-pi.vercel.app/barber/amit) | Dedicated workstation view, service stopwatch, and session completion |
| **6** | **Waiting Area Wall TV** | [salon-queue-management-pi.vercel.app/display](https://salon-queue-management-pi.vercel.app/display) | Fullscreen landscape dashboard for lobby TV with synthesized audio chime |
| **7** | **Owner Admin Settings** | [salon-queue-management-pi.vercel.app/admin](https://salon-queue-management-pi.vercel.app/admin) | Queue master switch, 30-min auto-cutoff, service catalog & barber roster *(PIN: `1234`)* |

---

## 1. Visual Identity & Editorial Design System

- **Palette**: Stark black (`#000000` / `#0A0A0A`), crisp pure white (`#FFFFFF`), and architectural gray surfaces (`#F5F5F5` canvas and `#E5E5E5` hairline dividers).
- **Typography**: Editorial serif display headers (*Cormorant Garamond*) paired with modernist sans-serif body copy (*Inter*).
- **Bilingual Localization**: Centralized English and Gujarati (ગુજરાતી) dictionary with persistent header toggle.
- **Defensive Error Handling**: Integrated editorial React Error Boundary with one-click queue cache reset.

---

## 2. Core Architecture & Synchronization

- **Decentralized Real-Time Sync**: Implemented via a Web `BroadcastChannel` layer (`salon_queue_realtime_sync`) backed by persistent `localStorage` and cross-window `storage` event redundancy.
- **Sub-50ms Latency**: State transitions (calling a customer, completing a service, toggling breaks, adding walk-ins) propagate across all viewports within **< 50 milliseconds**, comfortably within the 5-second SLA requirement.
- **Network Resilience**: Automatically detects offline network state and displays an alert banner (`Reconnecting to queue...`).

---

## 3. Business Rules & Lifecycle

1. **Chronological FIFO Ordering**: Position in line is determined strictly by join timestamp. Walk-in clients join at the very end of the line.
2. **Barber Preference Preservation**: If Barber Amit calls next, the engine skips any customer who requested Ravi (preserving their spot for Ravi) and selects the earliest eligible customer requesting Amit or "Any barber".
3. **Single Chair Concurrency**: A barber station can seat at most one customer in active service at a time.
4. **Strict State Transitions**: Status transitions proceed strictly forward:
   - `Waiting` → `Called` → `In chair` → `Done`
   - `Waiting` → `Cancelled` (irreversible)
   - `Called` → `No-show` (10-minute grace period guard; returning customers re-enter as fresh walk-ins at the END)
5. **Zero-Barber Guard**: When all on-duty barbers are on break, wait time displays *"Queue paused — all barbers on break"* without dividing by zero.
6. **Automatic 30-Minute Cutoff**: Online queue check-in closes automatically 30 minutes before the salon's scheduled closing time, while in-person walk-ins remain accessible at the reception desk.

---

## 4. Local Development

### Prerequisites
- **Node.js** (v18+)
- **npm** or **pnpm**

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build
```

Local dev server runs at [http://localhost:5173/](http://localhost:5173/).

---

## 5. Automated Verification Checklist

Execute the complete 15-point specification checklist and lifecycle guard suite:

```bash
node scripts/test-full-15.js
```

### Test Results (20/20 Passing):
| Test | Description | Result |
|---|---|---|
| **Test 1** | 2 services duration & price calculation (Haircut ₹150 / 30m + Beard trim ₹80 / 15m → 45m, ₹230) | **PASS** |
| **Test 2** | Duplicate active phone submission blocked & redirected to active status | **PASS** |
| **Test 3** | Barber Amit skips Ravi preference and takes Any barber | **PASS** |
| **Test 4** | Customer phone displays full-screen Called alert within 5s | **PASS** |
| **Test 5** | Barber Start switches customer to In chair & starts stopwatch | **PASS** |
| **Test 6** | Barber Done marks ticket Done & frees chair to Available | **PASS** |
| **Test 7** | No-show customer re-added joins at END of queue with new sequential token | **PASS** |
| **Test 8** | Owner closed queue disables `/join` submission with clear notice | **PASS** |
| **Test 9** | Bilingual dictionary complete for English and Gujarati (0 missing keys) | **PASS** |
| **Test 10** | Downstream wait times decrease progressively as preceding services finish | **PASS** |
| **Test 11** | Real-time cross-device sync operates within SLA (< 50ms) | **PASS** |
| **Test 12** | Single-chair concurrency guard prevents multiple In-chair customers | **PASS** |
| **Test 13** | Strict preference preservation: Ravi customer NEVER assigned to Amit | **PASS** |
| **Test 14** | 4th service selection blocked by 3-service limit | **PASS** |
| **Test 15** | Receptionist walk-in appends to the END of the shared queue | **PASS** |
| **Test 16** | Strict Lifecycle Guard: `waiting` → `in_chair` directly is BLOCKED | **PASS** |
| **Test 17** | Strict Lifecycle Guard: `done` → `waiting` is BLOCKED (Irreversibility) | **PASS** |
| **Test 18** | No-Show 10-Minute Grace Period Guard blocks premature customer ejection | **PASS** |
| **Test 19** | Zero-Barber Guard: All barbers on break avoids divide-by-zero | **PASS** |
| **Test 20** | Wait Time Calculation with 3 customers ahead equals 38 min (not 0 min) | **PASS** |

---

## 6. Deployment Configuration

The repository is configured for single-click deployment on **Vercel** with client-side routing rewrites handled via `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
All static assets, avatars, and hair grooming photography are packaged into the `dist/` directory upon build.
