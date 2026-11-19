# Screens & Features — Salon Queue Management System

## 1. Global Design System

### 1.1 Color Palette
- **Monochrome Foundation**:
  - **Stark Black**: `#000000` / `#0A0A0A` (Primary headings, solid primary buttons, high-contrast borders, dark card surfaces)
  - **Crisp Pure White**: `#FFFFFF` (Primary light canvas, button text on dark elements, high-contrast accents)
  - **Editorial Light Canvas**: `#FAFAFA` / `#F5F5F5` (Subtle off-white background surfaces for light viewports)
  - **Architectural Dividers & Borders**: `#E5E5E5` (Crisp 1px hairline card borders and table dividers)
  - **Secondary / Subtitle Gray**: `#737373` / `#525252` (Editorial subheadings, timestamps, secondary labels)
  - **Elevated Dark Surfaces (TV Display & Dark Modals)**: `#121212` / `#181818` (High-contrast presentation)
- **Functional Status Indicators (Subtle Minimalist Accents)**:
  - **Available / Open**: `#10B981` (Refined emerald green dot or high-contrast white-on-black pill)
  - **Busy / In Chair**: `#171717` / `#737373` (Monochrome filled badge)
  - **On Break / Closed**: `#EF4444` (Muted crimson or outlined monochrome badge)
  - **Waiting Long (>60 min)**: `#D97706` (High-contrast amber alert tag)

### 1.2 Typography & Editorial Visual Direction
- **Editorial Typography Pairing**:
  - **Headlines & Feature Titles**: High-contrast, elegant serif typeface (e.g., *Playfair Display*, *Cormorant*, or *Bodoni* aesthetic) providing an editorial magazine look ("Precision in Every Cut", "Timeless Grooming").
  - **Body & Functional UI Text**: Clean, modernist geometric sans-serif (e.g., *Inter*, *Helvetica Neue*, or *system-ui*) for maximum legibility across smartphones, tablets, and large wall displays.
- **Monochrome Imagery**:
  - High-contrast black-and-white photography showcasing barber craftsmanship (shears, straight razors, vintage leather barber chairs, and studio haircut portraits).
- **Component Geometry & Cards**:
  - Generous whitespace, refined 1px borders (`border: 1px solid #E5E5E5` or `#262626`), elegant rounded corners (`border-radius: 0.75rem` to `1rem` / `rounded-xl` to `rounded-2xl`).
  - Stark contrast buttons: Solid black fill with white typography, reversing on hover.
- **Interactive Targets**: Minimum touch target size of 48px by 48px across mobile and tablet interfaces.

---

## 2. Language and Localization

### 2.1 Centralized Localization Strategy
All user-facing strings must be retrieved from a single centralized dictionary file (e.g., `src/locales/translations.js` or `src/i18n.js`). Direct hardcoding of English or Gujarati strings inside UI components is strictly prohibited.

### 2.2 Language Toggle Component
- Located in the persistent top navigation header of customer and administrative screens.
- Minimalist segmented pill control: `[ EN | ગુજરાતી ]`.
- Active state styled with a solid stark black background (`#000000`) and pure white text (`#FFFFFF`); inactive state styled with transparent background and muted gray text (`#737373`).
- Persists user selection in browser storage (`localStorage.getItem('salon_lang')`).

### 2.3 Core Translation Key Mapping

| Key | English Default | Gujarati Translation |
| :--- | :--- | :--- |
| `app.title` | The Barber & Co. | ધ બાર્બર એન્ડ કંપની |
| `nav.home` | Home | હોમ |
| `nav.join` | Join Queue | કતારમાં જોડાવો |
| `nav.reception` | Reception | રિસેપ્શન |
| `nav.admin` | Settings | સેટિંગ્સ |
| `status.open` | Open · Closes 9 PM | ખુલ્લું છે · રાત્રે 9 વાગ્યે બંધ થશે |
| `status.closed` | Closed for Online Joining | ઓનલાઇન બુકિંગ બંધ છે |
| `queue.peopleWaiting` | people waiting | લોકો પ્રતીક્ષામાં છે |
| `queue.approxWait` | about | આશરે |
| `queue.mins` | min | મિનિટ |
| `queue.token` | Token | ટોકન |
| `queue.position` | in line | કતારમાં સ્થાન |
| `queue.yourTurn` | It's your turn! Go to | તમારો વારો આવ્યો છે! જાઓ |
| `queue.startComing` | Start coming to the salon | સલૂન તરફ આવવાનું શરૂ કરો |
| `queue.cancelSpot` | Cancel my spot | મારી જગ્યા રદ કરો |
| `barber.any` | Any barber (fastest) | કોઈપણ કારીગર (સૌથી ઝડપી) |
| `barber.available` | Available | ઉપલબ્ધ |
| `barber.busy` | Busy | વ્યસ્ત |
| `barber.onBreak` | On break | બ્રેક પર છે |
| `actions.start` | Start | શરૂ કરો |
| `actions.done` | Done | પૂર્ણ |
| `actions.callNext` | Call Next | આગળના બોલાવો |
| `actions.noShow` | No-show | ગેરહાજર |

---

## 3. Screen 1 — Home (/)

### 3.1 Screen Overview
- **URL**: `/`
- **Intended User**: Salon customer arriving at the landing page via QR code or direct link.
- **Purpose**: Present immediate salon operational status, live queue congestion, barber availability, and the primary entry point to join the line with a luxury black-and-white editorial aesthetic.

### 3.2 UI Layout (Top to Bottom)
1. **Header Bar**:
   - Salon brand mark and name ("The Barber & Co." in serif display font).
   - Language toggle selector (`EN` / `ગુજરાતી`).
2. **Editorial Hero & Salon Operational Badge**:
   - Editorial headline in elegant serif: *"Precision in Every Cut · Modern Expression"*.
   - Status badge indicating salon status: "Open · Closes 9 PM" with green pulsing dot when open, or "Closed · Reopens Tomorrow 9 AM" when closed.
3. **Live Queue Congestion Card**:
   - Refined off-white/light-gray container with crisp 1px border displaying total wait count and estimated duration:
     - Example: **"6 people waiting · about 50 min"**.
     - Subtext highlighting current queue velocity (e.g., "Average service duration: 25 min").
4. **Barbers on Duty Section**:
   - Section header: "Master Barbers on Duty".
   - Responsive grid of barber cards with monochrome portraiture:
     - High-contrast black-and-white portrait of each barber.
     - Barber name and live status indicator:
       - Ravi — Busy (Monochrome solid pill)
       - Amit — Free (Green dot indicator)
       - Imran — On break (Subtle muted outline badge)
5. **Primary Action Area**:
   - Full-width, prominent stark black CTA button: **"Join Queue"** (`#000000` background, `#FFFFFF` text, subtle uppercase tracking).
   - If online queue is closed, button is disabled with muted gray styling and a notice banner: *"Online check-in is currently closed. Walk-ins are welcome at the salon."*

### 3.3 Interactive Elements & Handlers
- **Language Toggle**: Switches all text instantly between English and Gujarati.
- **Join Queue Button**: Navigates to `/join`. Disabled when `isQueueOpen === false`.
- **Barber Card Tap**: Highlights that barber's queue profile.

### 3.4 Data Sources & Real-Time Sync
- **Salon Status**: Pulled from admin settings (`isOpen`, `closingTime`).
- **Queue Count & Wait Time**: Computed dynamically from active tokens with status `WAITING` or `CALLED`.
- **Barber States**: Pulled from barber roster state (`barber.status`: `available`, `busy`, `on_break`).

### 3.5 Responsive Behavior
- **Mobile (< 768px)**: Vertically stacked editorial cards, sticky bottom "Join Queue" button for single-thumb accessibility.
- **Tablet (768px - 1024px)**: Two-column hero with queue metrics on the left and barber portrait cards on the right.
- **Desktop (> 1024px)**: Centered max-width container (640px) preserving mobile-app elegance.

### 3.6 Edge & Error States
- **Zero Waiting Customers**: Card displays *"No waiting right now. Walk in and take a seat immediately."*
- **Network Disconnected**: Banner appears at the top: *"Real-time updates paused. Reconnecting..."*
- **Queue Closed**: Join Queue button disabled; displays closing countdown or reopening notice.

---

## 4. Screen 2 — Join Queue (/join)

### 4.1 Screen Overview
- **URL**: `/join`
- **Intended User**: Customer wishing to secure a place in line.
- **Purpose**: Collect customer details, service choices, and barber preference, calculate wait estimates, and issue a digital queue token.

### 4.2 UI Layout (Top to Bottom)
1. **Header Bar**:
   - Back arrow button (`<`) navigating back to `/`.
   - Title: "Join Queue" (in serif display font).
   - Language toggle (`EN` / `ગુજરાતી`).
2. **Customer Contact Section**:
   - Customer Full Name text input (`placeholder="Enter your name"`).
   - Phone Number input (`placeholder="10-digit mobile number"`), formatted for standard 10 numeric digits.
   - Clean minimalist inputs with subtle 1px bottom border or clean boxed input (`border-neutral-300 focus:border-black`).
3. **Service Selection Section**:
   - Section header: "Select Services (Maximum 3)".
   - Multi-select interactive cards with monochrome styling:
     - Service Name (e.g., "Haircut" / "વાળ કપાવવા").
     - Duration badge (e.g., "30 min").
     - Price badge (e.g., "₹150").
     - Minimalist circular selector in top-right corner.
   - **Selected card state**: Stark black border (`#000000`), crisp white/light gray background, black checked badge.
4. **Barber Selection Section**:
   - Section header: "Select Barber Preference".
   - Radio card group with black-and-white portraits:
     - **Option 1**: "Any barber (fastest)" — highlighted with a "Recommended" monochrome badge.
     - **Options 2+**: Individual barber cards showing black-and-white portrait thumbnail, name, and live status.
     - If a selected barber is on break (e.g., Imran), displays warning pill: *"Imran is currently on break. Wait time may be longer."*
5. **Live Order & Wait Summary Box**:
   - Dynamic summary container fixed above the action button:
     - `Total Services Duration`: Sum of selected service durations (e.g., "45 min").
     - `Total Price`: Sum of selected prices (e.g., "₹230").
     - `Estimated Wait Time`: Calculated wait based on current line depth (e.g., "~35 min").
6. **Submit Action**:
   - Large stark black CTA button: **"Confirm & Join Queue"** (`#000000` fill, `#FFFFFF` text).

### 4.3 Validation & Form Rules
- Name must not be empty (minimum 2 characters).
- Phone number must contain exactly 10 numeric digits.
- At least 1 service must be selected; maximum 3 services allowed. Attempting to select a 4th service triggers a brief toast notification: *"Maximum 3 services permitted."*
- Duplicate Active Phone Check: If the entered phone number already has an active ticket (`WAITING` or `CALLED`), do not create a duplicate. Instead, redirect directly to `/status/:existingId` with an alert: *"You already have an active spot in line!"*

### 4.4 Responsive Behavior
- Single-column touch-friendly form on mobile devices.
- On tablet, services display in a clean 2x2 grid.

---

## 5. Screen 3 — My Status (/status/:id)

### 5.1 Screen Overview
- **URL**: `/status/:id` (where `:id` is the unique token or record ID)
- **Intended User**: Customer tracking their turn remotely from their mobile device.
- **Purpose**: Provide real-time countdown, live queue position, barber assignment, actionable arrival guidance, and cancellation functionality.

### 5.2 UI Layout (Top to Bottom)
1. **Header Bar**:
   - Salon logo and name ("The Barber & Co.").
   - Language toggle (`EN` / `ગુજરાતી`).
   - Live synchronization indicator dot (Green = synced, Red = offline).
2. **Token Display Card**:
   - Massive high-visibility token identifier in bold architectural typography (e.g., `S-14`).
   - Customer name and selected services summary (e.g., "Haircut + Beard trim · ₹230").
3. **Queue Position Metric**:
   - Prominent position counter: **"4th in line"**.
   - Subtext: "3 customers ahead of you".
4. **Estimated Wait & Progress Visualization**:
   - Remaining estimated waiting time: e.g., "Estimated wait: ~25 mins".
   - Sleek minimalist circular SVG progress ring or linear progress track visually representing advancement toward the chair.
5. **Dynamic Arrival Alerts (Context-Dependent)**:
   - **Position > 2**: Informational badge: *"You have time to relax or run errands nearby."*
   - **Position === 2 ("Next Up" stage)**: High-contrast alert card with notification icon:
     > **"Start coming to the salon! You're 2nd in line."**
   - **Status === CALLED ("Called" stage)**: Full-screen high-contrast monochrome overlay (stark black backdrop `#000000`, crisp white typography `#FFFFFF`, and haptic vibration):
     > **"It's your turn! Go to Amit"**
     - Subtext: "Please proceed directly to Chair #2."
     - Acknowledge button: "I am here" (dismisses modal to regular screen).
6. **Cancellation Action**:
   - Subtle text button at the bottom: "Cancel my spot".
   - Tapping opens confirmation modal: *"Are you sure you want to leave the queue? This action cannot be undone."*
   - Confirming permanently sets status to `CANCELLED`.

### 5.3 Animations & Visual Feedback
- Smooth breathing pulse on the queue progress ring.
- High-contrast screen flash and continuous vibration trigger (via `navigator.vibrate([200, 100, 200])`) upon being called.

---

## 6. Screen 4 — Reception Dashboard (/reception)

### 6.1 Screen Overview
- **URL**: `/reception`
- **Intended User**: Salon receptionist or owner operating at the front counter.
- **Target Device**: Tablet (e.g., iPad / Android tablet) in landscape orientation.
- **Purpose**: Command center to oversee active chairs, call next customers, log walk-ins, and manage no-shows and cancellations.

### 6.2 UI Layout (Landscape Two-Column)

```
+------------------------------------------------------------------------------------------------------+
| [THE BARBER & CO.]   Queue: [● OPEN]   Today: 18 Served | 3 No-Show | Avg 14m  [+ Add Walk-In Customer]|
+---------------------------------------------------+--------------------------------------------------+
| LEFT COLUMN: ACTIVE BARBER WORKSTATIONS           | RIGHT COLUMN: LIVE WAITING QUEUE                 |
|                                                   |                                                  |
| [Barber Card: Ravi]                               | [Filter: All (6) | Any Barber (4) | Specific (2)] |
| Status: Busy · Chair #1                           |                                                  |
| Customer: S-12 · Rajesh Patel                     | Tokens List:                                     |
| Service: Haircut (30m)                            | S-14 | Amit Shah | Hair Spa (45m) | Ravi  | 22m [x]  |
| Progress: [=========>    ] 18m / 30m              | S-15 | Kunal K   | Haircut (30m)  | Any   | 14m [x]  |
| [Call Next Customer] (Muted)                      | S-16 | Vikram S  | Beard Trim     | Amit  | 62m [!]  |
|                                                   |                                                  |
| [Barber Card: Amit]                               | (* High-contrast outline on S-16: > 60 mins *)   |
| Status: Available · Chair #2                      |                                                  |
| [>>> Call Next Customer <<<] (Solid Black Button) | Actions on Row:                                  |
|                                                   | - [No-Show] (if status == CALLED)                |
| [Barber Card: Imran]                              | - [Cancel]                                       |
| Status: On Break (Returns in 15m)                 |                                                  |
+---------------------------------------------------+--------------------------------------------------+
```

### 6.3 Detailed UI Component Breakdown
1. **Top Navigation & Metric Strip**:
   - Salon brand mark in serif display font.
   - Live queue status pill: `● OPEN` (green dot) or `● CLOSED` (stark outline).
   - Real-time operational metrics counter:
     - `Served Today`: e.g., 18.
     - `No-Shows`: e.g., 3.
     - `Avg Wait Time`: e.g., 14 min.
   - Primary Header Action: `[+ Add Walk-in]` solid black button.
2. **Left Column — Barber Workstations**:
   - Workstation cards with crisp 1px borders and black-and-white portraits:
     - **When Busy**: Displays active customer token, customer name, services list, elapsed/total time, minimalist progress bar, and disabled `[Call Next]` button.
     - **When Available**: Highlights card with stark black border and enables prominent `[Call Next]` solid black button.
     - **When On Break**: Mutes card with outline badge; `[Call Next]` button disabled with explanation: *"Barber on break"*.
3. **Right Column — Waiting Queue Table**:
   - Header with total waiting counter (e.g., "Waiting Customers: 6").
   - Filter pills: `All`, `Fastest / Any Barber`, `Assigned to Specific Barber`.
   - Table / List rows containing Token chip (`S-14`), customer name, services badge, barber preference, elapsed wait duration, and row actions (`[No-Show]`, `[Cancel]`).
   - Any row exceeding 60 minutes displays an alert tag (`> 60m`).
4. **Add Walk-in Quick Modal / Drawer**:
   - Modal with clean input fields for Name, Phone, Services (max 3), and Barber preference. Appends customer to the end of the queue.

---

## 7. Screen 5 — Barber View (/barber/:name)

### 7.1 Screen Overview
- **URL**: `/barber/:name` (e.g., `/barber/ravi`, `/barber/amit`, `/barber/imran`)
- **Intended User**: Individual barber mounted on a mobile dock at their workstation chair.
- **Target Device**: Mobile phone in portrait orientation.
- **Purpose**: Minimal-touch, distraction-free interface to view current customer, control service timers, and toggle break status.

### 7.2 UI Layout (Top to Bottom)
1. **Header Strip**:
   - Barber name (e.g., "Ravi") and chair identifier ("Chair #1").
   - Status toggle pill: `[ Available ]` vs `[ On Break ]`.
2. **Current Customer Card**:
   - Token Number in bold display font (e.g., `S-12`).
   - Customer name (e.g., "Rajesh Patel").
   - Selected services list (e.g., "Haircut (30m) + Beard trim (15m)").
   - Total service target duration (e.g., "45 minutes").
3. **Service Stopwatch / Progress Timer**:
   - Running stopwatch display showing elapsed service time: `18:42 / 45:00`.
   - High-contrast linear progress bar.
4. **Primary State Action Buttons**:
   - **State A (Customer is CALLED)**:
     - Large button: `[ Start Service ]` (Solid black fill, white text).
     - Action: Switches customer status from `CALLED` to `IN_CHAIR`, starts stopwatch.
   - **State B (Customer is IN_CHAIR)**:
     - Large button: `[ Done / Complete ]` (Solid black fill, white text).
     - Action: Marks customer status as `DONE`, logs service completion, clears workstation, and notifies receptionist and TV screens.
5. **Up Next Preview Card**:
   - Clean preview container at bottom: *"Next for you: S-15 · Kunal (Haircut)"*.

---

## 8. Screen 6 — Waiting Area TV (/display)

### 8.1 Screen Overview
- **URL**: `/display`
- **Intended User**: Public waiting-room audience; displayed on a 42"-65" television mounted on the salon wall.
- **Target Device**: Large-format TV display in landscape orientation (1080p / 4K).
- **Purpose**: Provide high-contrast, glanceable queue status readable from a 5-meter viewing distance with zero user interaction required.

### 8.2 UI Layout (Full-Screen High-Contrast Landscape)

```
+------------------------------------------------------------------------------------------------------+
| [THE BARBER & CO.]                   LIVE QUEUE DISPLAY                             11:42 AM         |
+------------------------------------------------------------------------------------------------------+
| SERVING NOW (IN CHAIR)                                                                               |
| +-----------------------------+ +-----------------------------+ +----------------------------------+ |
| | CHAIR 1 - RAVI              | | CHAIR 2 - AMIT              | | CHAIR 3 - IMRAN                  | |
| |                             | |                             | |                                  | |
| |         NOW: S-12           | |         AVAILABLE           | |             ON BREAK             | |
| |        Rajesh Patel         | |    (Ready for customer)     | |       (Resuming in 15m)          | |
| |        Haircut (30m)        | |                             | |                                  | |
| +-----------------------------+ +-----------------------------+ +----------------------------------+ |
+------------------------------------------------------------------------------------------------------+
| UP NEXT (NEXT 5 TOKENS)                                                                              |
| +------------+  +------------+  +------------+  +------------+  +------------+                       |
| | S-14       |  | S-15       |  | S-16       |  | S-17       |  | S-18       |                       |
| | Amit Shah  |  | Kunal K    |  | Vikram S   |  | Pooja M    |  | Jayesh D   |                       |
| | Est: ~10m  |  | Est: ~20m  |  | Est: ~35m  |  | Est: ~45m  |  | Est: ~55m  |                       |
| +------------+  +------------+  +------------+  +------------+  +------------+                       |
+------------------------------------------------------------------------------------------------------+
| STATUS FOOTER: Online check-in open at salon.domain.com | Please be seated when your token is called |
+------------------------------------------------------------------------------------------------------+
```

### 8.3 Screen Components & High-Contrast Readability
1. **Header Band**:
   - Salon brand mark in serif display font on left.
   - Centered minimalist badge: "LIVE QUEUE DISPLAY".
   - Digital clock on right (e.g., `11:42 AM`).
2. **"Serving Now" Workstation Grid**:
   - Equal-width columns corresponding to each barber chair.
   - Large typography for active token: `NOW: S-12` (minimum 72pt font).
   - High-contrast presentation: Stark black background (`#0A0A0A`) with crisp white text (`#FFFFFF`) to eliminate glare and prevent screen burn-in.
3. **"Up Next" Strip (Next 5 In Line)**:
   - Sequence of 5 cards with token number, customer first name, and estimated wait.
4. **Newly Called Customer Announcement**:
   - When a token transitions to `CALLED`, the corresponding card flashes with a high-contrast inverted pulse animation for 15 seconds.
   - Plays a pleasant, two-tone notification audio chime (`chime.mp3`) via web audio API if supported.
   - High-visibility banner: `>>> S-14 (Amit Shah) PLEASE GO TO CHAIR 2 <<<`.

---

## 9. Screen 7 — Owner Settings (/admin)

### 9.1 Screen Overview
- **URL**: `/admin`
- **Intended User**: Salon owner or store manager.
- **Purpose**: Operational control panel to configure service offerings, manage on-duty staff, toggle queue availability, and inspect end-of-day performance metrics.

### 9.2 UI Layout (Top to Bottom)
1. **Header Bar**:
   - Salon Name & "Owner Settings & Operations".
   - Language toggle (`EN` / `ગુજરાતી`).
2. **Queue Master Control Switch**:
   - Minimalist toggle switch: `[ Queue Open | Queue Closed ]`.
   - Behavior: Closing disables online check-in at `/join` while walk-ins at `/reception` remain active. Automatic cutoff closes online joining 30 minutes before salon closing.
3. **Services Management Section**:
   - Clean table / card list of services: English Name, Gujarati Name, Duration (mins), Price (₹), and Active toggle.
4. **Barbers on Duty Section**:
   - Toggle switch for each barber (Ravi, Amit, Imran) to mark On Duty Today or Off Duty.
5. **Today's Operational Statistics**:
   - Clean summary metric cards: `Customers Served`, `Average Waiting Time`, `No-Show Rate`.

---

## 10. Sample Dummy Data

### 10.1 Barbers Roster

```json
[
  {
    "id": "barber-1",
    "name": "Ravi",
    "chair": 1,
    "status": "busy",
    "onDuty": true,
    "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80&sat=-100"
  },
  {
    "id": "barber-2",
    "name": "Amit",
    "chair": 2,
    "status": "available",
    "onDuty": true,
    "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80&sat=-100"
  },
  {
    "id": "barber-3",
    "name": "Imran",
    "chair": 3,
    "status": "on_break",
    "onDuty": true,
    "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80&sat=-100"
  }
]
```

### 10.2 Service Catalog

```json
[
  {
    "id": "srv-1",
    "nameEn": "Haircut",
    "nameGu": "વાળ કપાવવા",
    "durationMin": 30,
    "priceInr": 150,
    "active": true
  },
  {
    "id": "srv-2",
    "nameEn": "Beard trim",
    "nameGu": "દાઢી ટ્રિમ",
    "durationMin": 15,
    "priceInr": 80,
    "active": true
  },
  {
    "id": "srv-3",
    "nameEn": "Hair spa",
    "nameGu": "હેર સ્પા",
    "durationMin": 45,
    "priceInr": 400,
    "active": true
  },
  {
    "id": "srv-4",
    "nameEn": "Hair wash",
    "nameGu": "વાળ ધોવા",
    "durationMin": 15,
    "priceInr": 100,
    "active": true
  },
  {
    "id": "srv-5",
    "nameEn": "Hair styling",
    "nameGu": "હેર સ્ટાઇલિંગ",
    "durationMin": 20,
    "priceInr": 120,
    "active": true
  },
  {
    "id": "srv-6",
    "nameEn": "Facial",
    "nameGu": "ફેશિયલ",
    "durationMin": 45,
    "priceInr": 500,
    "active": true
  },
  {
    "id": "srv-7",
    "nameEn": "Head massage",
    "nameGu": "માથાની માલિશ",
    "durationMin": 20,
    "priceInr": 150,
    "active": true
  },
  {
    "id": "srv-8",
    "nameEn": "Hair colouring",
    "nameGu": "વાળ કલર",
    "durationMin": 60,
    "priceInr": 600,
    "active": true
  }
]
```

### 10.3 Sample Queue Entries

```json
[
  {
    "token": "S-12",
    "customerName": "Rajesh Patel",
    "phone": "9876543210",
    "services": ["srv-1"],
    "preferredBarberId": "barber-1",
    "assignedBarberId": "barber-1",
    "status": "in_chair",
    "joinedAt": "2026-11-20T10:30:00Z",
    "startedAt": "2026-11-20T10:45:00Z"
  },
  {
    "token": "S-14",
    "customerName": "Amit Shah",
    "phone": "9823456789",
    "services": ["srv-3"],
    "preferredBarberId": null,
    "assignedBarberId": null,
    "status": "waiting",
    "joinedAt": "2026-11-20T10:40:00Z"
  },
  {
    "token": "S-15",
    "customerName": "Kunal",
    "phone": "9898123456",
    "services": ["srv-1"],
    "preferredBarberId": "barber-2",
    "assignedBarberId": null,
    "status": "waiting",
    "joinedAt": "2026-11-20T10:48:00Z"
  }
]
```

---

## 11. Responsive Design Summary

### 11.1 Breakpoint & Device Matrix

| Screen | Target Device | Layout Strategy | Key Viewport |
| :--- | :--- | :--- | :--- |
| **Home (`/`)** | Mobile phone | Single-column editorial layout with monochrome imagery | `< 640px` (Max 640px) |
| **Join Queue (`/join`)** | Mobile phone | Form stacked vertically; high-contrast selectors | `< 640px` |
| **My Status (`/status/:id`)** | Mobile phone | Bold architectural typography with full-screen alert overlay | `< 640px` |
| **Reception (`/reception`)** | Tablet (Landscape) | Dual-column (Left: Workstations, Right: Waiting table) | `768px - 1024px` |
| **Barber View (`/barber/:name`)**| Mobile phone | Minimalist single-column with large touch buttons | `< 640px` |
| **Waiting Area TV (`/display`)** | Wall TV (Landscape) | High-contrast black backdrop, 72pt+ active token text | `1920x1080` / `4K` |
| **Owner Settings (`/admin`)** | Tablet / Desktop | Refined grid with toggle controls and responsive tables | `> 768px` |

### 11.2 Interaction & Usability Standards
- **Touch Target Sizing**: All buttons, chips, and checkboxes enforce a minimum clickable area of 48px x 48px.
- **Audio & Haptic Feedback**: Vibrations are triggered for customer call alerts on compatible mobile browsers; gentle audio chime notifies the salon floor when a token is called on the TV display.
- **Persistent State Recovery**: If a user refreshes `/join`, `/status/:id`, or `/reception`, state persists through the local synchronization layer without loss of queue position.
