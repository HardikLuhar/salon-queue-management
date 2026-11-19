# Flows & Rules — Salon Queue Management System

## 1. Main Customer Flow — Remote Joining

This end-to-end scenario traces the lifecycle of a remote customer from online check-in to service completion.

### Step-by-Step Scenario Walkthrough:
1. **Open Landing Page**: The customer opens the Home screen at `/` on their smartphone browser.
2. **Initiate Check-In**: The customer reviews current salon status and taps the primary button **Join Queue**.
3. **Enter Contact Details**: The customer is navigated to `/join` where they input their full name and their 10-digit mobile phone number.
4. **Select Services**: The customer selects one or more desired services (e.g., Haircut and Beard Trim) up to a maximum limit of 3 services.
5. **Select Barber Preference**: The customer indicates their preferred barber by choosing either a specific on-duty barber or selecting **"Any barber (fastest)"**.
6. **Compute Duration and Price**: The application sums the durations and prices of all selected services in real time (e.g., 30 min + 15 min = 45 min; ₹150 + ₹80 = ₹230).
7. **Compute Estimated Wait**: The application calculates the initial approximate waiting time based on active queue workload ahead and working barbers.
8. **Confirm Submission**: The customer taps **Confirm & Join Queue**.
9. **Queue Record & Token Generation**: The application creates a new queue record with status `Waiting` and issues a unique token identifier: **S-14**.
10. **Navigate to Personal Tracker**: The application automatically routes the customer's browser to My Status at `/status/s-14`.
11. **Live Status Monitoring**: The customer views their token (**S-14**), their initial queue position (**6th in line**), and their estimated remaining wait time (~50 minutes).
12. **Approach Threshold Alert (Position = 2)**: As earlier customers advance, S-14 moves to **2nd in line**. The customer's screen displays an amber alert: **"Start coming to the salon"**, alerting them to travel to the premises.
13. **Call Next Action**: At the salon, Barber **Amit** becomes available. The receptionist views the Reception Dashboard at `/reception` and taps **Call Next** on Amit's workstation card.
14. **Status Transitions to Called**: Customer S-14 is identified as the earliest eligible customer. S-14's status immediately transitions from `Waiting` to `Called`, and Amit is assigned as the active barber.
15. **Full-Screen Turn Alert**: Customer S-14's phone receives the real-time update and displays a prominent full-screen high-contrast monochrome modal:
    > **"It's your turn! Go to Amit"**
    *(The phone triggers a haptic vibration pattern where supported).*
16. **Waiting Area TV Notification**: The Waiting Area TV screen at `/display` flashes token **S-14** with a high-contrast inverted highlight on Amit's workstation column and sounds an audio chime.
17. **Service Inception**: Customer S-14 enters the chair. Barber Amit taps the **Start** button on their mobile screen at `/barber/amit`.
18. **Status Transitions to In Chair**: Customer S-14's status transitions from `Called` to `In chair`. A live service stopwatch starts running on Amit's screen, and the Reception Dashboard reflects the in-service state.
19. **Service Completion**: Barber Amit finishes the services and taps the **Done** button.
20. **Queue Departure**: S-14's status transitions from `In chair` to `Done`. S-14 leaves the active queue permanently, updating the Reception Dashboard and Waiting Area TV, and releasing Amit to `Available` status.

---

## 2. Main Walk-in Flow

This scenario governs customers who visit the salon in person without registering beforehand.

### Step-by-Step Scenario Walkthrough:
1. **Physical Arrival**: A customer arrives at the salon front desk in person.
2. **Access Reception Dashboard**: The receptionist views the tablet dashboard at `/reception`.
3. **Open Walk-in Interface**: The receptionist taps the **[+ Add Walk-in]** button in the top navigation strip.
4. **Enter Customer Information**: The receptionist fills in the customer's name and 10-digit mobile phone number (or salon generic format if the customer has no mobile device).
5. **Select Services**: The receptionist selects the customer's requested services (maximum 3 services).
6. **Assign Barber Preference**: The receptionist selects either a specific barber requested by the customer or **"Any barber (fastest)"**.
7. **Confirm Registration**: The receptionist taps **Add to Queue**.
8. **Equal First-Come-First-Served Placement**: The walk-in customer is appended directly to the **END** of the single shared queue. Walk-in customers receive no artificial priority over remote customers who joined earlier.
9. **Token Issuance**: The application generates the next sequential token (e.g., `S-15`) and displays it to the receptionist to inform the client.
10. **Unified Lifecycle**: From this point forward, the walk-in entry is subject to the exact same FIFO rules, queue transitions, and TV display announcements as remote entries.

---

## 3. Queue Statuses and Allowed Transitions

### 3.1 Standard Status Definitions
The system strictly enforces the following six mutually exclusive statuses:
- **`Waiting`**: Customer has joined the queue and is waiting for their token to be called.
- **`Called`**: The customer has been summoned to a specific barber chair and has up to 10 minutes to take their seat.
- **`In chair`**: The customer is actively seated in the barber chair receiving service; the service stopwatch is running.
- **`Done`**: The service has been completed; the customer has left the chair and exited the active queue.
- **`Cancelled`**: The customer or receptionist cancelled the spot prior to service commencement.
- **`No-show`**: The customer was called but failed to present themselves at the chair within the allowed grace period.

### 3.2 State Transition Matrix

```
       [ Waiting ]
        /       \
 (Call next)   (Cancel spot)
      v           v
  [ Called ]  [ Cancelled ] (Terminal)
   /      \
(Start) (No-show)
  v        v
[ In chair ] [ No-show ] (Terminal)
  |
(Done)
  v
[ Done ] (Terminal)
```

### 3.3 Strict Transition Rules
- **Forward-Only Progression**: Statuses must only transition along sanctioned paths:
  - `Waiting` → `Called`
  - `Called` → `In chair`
  - `In chair` → `Done`
  - `Waiting` → `Cancelled`
  - `Called` → `No-show`
- **Irreversibility**:
  - A `Done` record cannot re-enter the queue under the same token.
  - A `Cancelled` spot cannot be reactivated back to `Waiting`.
  - A `No-show` customer cannot reclaim their prior queue rank. If a no-show customer returns, they must be registered anew as a fresh walk-in at the very end of the line with a brand-new token.
- **Illegal Transition Guard**: Any out-of-order operation (such as attempting `Waiting` → `In chair` without calling, or `In chair` → `Waiting`) must be blocked by validation logic.

---

## 4. First-Come-First-Served Rules

To eliminate queue disputes and ensure transparency, queue allocation adheres strictly to FIFO (First-In, First-Out) scheduling combined with customer barber preference.

### 4.1 Core Rules
1. **Timestamp Authority**: Queue rank is determined strictly by the timestamp at which the entry successfully entered the `Waiting` state.
2. **Unified Queue Pool**: Remote smartphone entries and receptionist walk-ins share the identical queue array. Walk-ins join at the end.
3. **Strict Preference Preservation**:
   - If a customer selects **Ravi**, they must **NEVER** be assigned to Amit or Imran, regardless of whether Amit or Imran is idle.
   - If a customer selects **"Any barber (fastest)"**, they are eligible for the first barber who becomes free.
4. **Earliest Eligible Candidate Resolution**: When Barber **X** is ready for a customer and **Call Next** is triggered:
   - The queue engine scans all `Waiting` customers in chronological order.
   - The engine selects the first customer whose preference matches **X** OR whose preference is **"Any barber"**.
   - Any customer who explicitly requested a *different* barber (e.g., requested Ravi when Amit calls) is skipped and remains in their existing `Waiting` position.
5. **One Customer Per Chair**: A barber can have at most one customer in the `In chair` state at any given moment.
6. **Break Enforcement**: A barber whose status is `On break` cannot be assigned a customer and cannot trigger `Call Next`.
7. **No Matching Candidate Guard**: If no customer in the `Waiting` queue is eligible for Barber X, the system displays an explicit message: *"No eligible customers waiting for Amit"* rather than assigning an incompatible customer.

### 4.2 Preference Skipping Example
Consider the following waiting list:
- Position 1: Token `S-10` — Preferred Barber: **Ravi**
- Position 2: Token `S-11` — Preferred Barber: **Any**
- Position 3: Token `S-12` — Preferred Barber: **Amit**

**Scenario**: Barber **Amit** becomes available and taps **Call Next**.
- S-10 is evaluated: Customer specifically requested Ravi. Amit cannot serve Ravi's exclusive requests. **S-10 is skipped and stays #1 for Ravi.**
- S-11 is evaluated: Customer selected "Any". **S-11 is eligible and is called by Amit.**
- Result: S-11 transitions to `Called` with Amit. S-10 retains their spot at the top of the queue waiting for Ravi.

---

## 5. Waiting-Time Calculation

Waiting time estimations provide customer guidance and must remain approximate, transparent, and responsive without relying on speculative AI models.

### 5.1 Approximate Calculation Formula

$$\text{Estimated Wait Time (minutes)} \approx \frac{\text{Total Service Minutes of Waiting Customers Ahead}}{\text{Number of Active Working Barbers}}$$

### 5.2 Operational Guidelines
- **Workload Aggregation**: The numerator represents the sum of standard service durations for all eligible customers ahead in the queue.
- **Barber Capacity**: The denominator represents all barbers currently marked `On Duty` who are not `On break`.
- **In-Progress Services**: For customers currently `In chair`, their remaining service duration (total duration minus elapsed timer minutes) is factored into the workload pool.
- **Exclusion of Terminal States**: Customers with status `Done`, `Cancelled`, or `No-show` contribute 0 minutes to the calculation.
- **Dynamic Reduction**: As barbers complete services or customers advance, the estimated waiting time decreases dynamically.
- **Zero-Barber Protection**: If all barbers are on break or off-duty, the denominator is 0. The application must not divide by zero or crash; it must display: *"Queue paused — all barbers currently on break"*.
- **No False Precision**: Wait times must be displayed with an approximation tilde (e.g., `~35 min`) to reinforce that this is an operational estimate rather than a scheduled reservation.

---

## 6. No-show and Cancellation Rules

### 6.1 No-Show Policy
- **Prerequisite**: A customer can only be marked as `No-show` if their status is currently `Called`. Customers in `Waiting` cannot be marked as `No-show`.
- **10-Minute Grace Period**: The receptionist dashboard displays an elapsed timer once a customer is `Called`. If the customer does not present themselves within 10 minutes, the `[No-show]` action button is highlighted.
- **Queue Ejection**: Marking a customer `No-show` immediately terminates their ticket and removes them from the active queue.
- **Late Arrivals**: If a customer arrives after being marked `No-show`, their old token is void. The receptionist must add them as a new walk-in at the **END** of the queue with a newly generated token.

### 6.2 Cancellation Policy
- **Customer Self-Service Cancellation**: A customer tracking their ticket at `/status/:id` can tap **"Cancel my spot"** as long as their status is `Waiting`.
- **Two-Step Confirmation**: Tapping cancel triggers a confirmation pop-up: *"Are you sure you want to leave the queue? You will lose your spot."*
- **Receptionist Cancellation**: A receptionist can cancel a `Waiting` customer from `/reception` if requested by the customer.
- **Finality**: Once marked `Cancelled`, the ticket cannot be restored to `Waiting`. The position is permanently forfeited.

### 6.3 Duplicate Phone Number Prevention
- An individual customer mobile number may only have **one** active queue ticket (`Waiting` or `Called`) at any time.
- If a user navigates to `/join` and submits a phone number that currently holds an active token, the system must **not** create a second token.
- **System Action**: The application alerts the user (*"You already have an active spot in line"*) and immediately redirects their browser to `/status/:existingId`.

---

## 7. Queue Opening and Closing Rules

### 7.1 Manual Queue Control
- The salon owner controls the master queue state via the toggle switch in Owner Settings at `/admin`.
- When toggled to **Closed**:
  - The `/join` page blocks new remote submissions.
  - The Home page displays: *"Online check-in is closed for today. Walk-ins are welcome at the salon."*
  - The receptionist at `/reception` **retains the ability** to add walk-in customers manually.

### 7.2 Automatic Cutoff Rule (30-Minute Policy)
- To prevent backlog overruns before salon closing, online queue entry closes automatically **30 minutes prior to scheduled salon closing**.
- **Example**:
  - Salon closing time: 9:00 PM.
  - Online joining cutoff: **8:30 PM**.
  - At 8:30 PM, the system automatically disables the `/join` form for remote customers.
  - Customers already waiting in line before 8:30 PM remain in the queue and continue to be served.

### 7.3 Integrity of Active Sessions
- Closing online check-in (either manually or automatically) must **never** delete, hide, or reset active queue tickets.
- Customers already holding tokens can continue to track their status at `/status/:id` until their service is marked `Done`.

---

## 8. Barber Availability Rules

### 8.1 Status Types
Each on-duty barber maintains one of three operational states:
1. **`Available`**: Ready to accept a called customer. Chair is unoccupied.
2. **`Busy`**: Actively serving a customer (`In chair`).
3. **`On break`**: Temporarily paused for meals or rest. Unavailable for customer assignment.

### 8.2 Break Toggle & Assignment Rules
- Barbers toggle their availability between `Available` and `On break` on their personal interface at `/barber/:name`.
- When a barber is `On break`:
  - They cannot be selected for `Call Next`.
  - Their workstation card on the Reception Dashboard and Waiting Area TV displays **"On break"**.
  - Customers attempting to select this barber at `/join` see a warning: *"Ravi is currently on break. Wait times will be longer."*
- Customers who selected **"Any barber"** continue to be routed to other available barbers.
- A barber may only transition to `In chair` for one customer at a time. Concurrency is strictly prohibited.

---

## 9. Real-Time Synchronization Rules

All participating interfaces must reflect queue updates dynamically to maintain absolute trust and transparency.

### 9.1 Synchronized Endpoints
1. **Customer Mobile Device** (`/status/:id`)
2. **Reception Dashboard Tablet** (`/reception`)
3. **Barber Workstation Mobile** (`/barber/:name`)
4. **Waiting Area Wall TV** (`/display`)

### 9.2 Synchronization SLAs & Event Triggers
- **Latency Standard**: All queue state transitions must propagate and reflect across all connected devices within **5 seconds**.
- **Critical Sync Events**:
  - `Call Next` triggered at Reception: Instantly updates Customer screen to full-screen gold alert, updates TV workstation column to flashing gold, and plays the audio chime.
  - `Start` triggered by Barber: Instantly switches Customer screen to in-chair status, starts stopwatch timer, and updates Reception workstation progress bar.
  - `Done` triggered by Barber: Instantly removes customer from TV Up-Next list, frees the barber chair to `Available` on Reception, and recalibrates estimated wait times for all subsequent waiting customers.
  - `Add Walk-in` at Reception: Instantly appends customer to TV Up-Next and increments queue count on Home.
- **Connection Resilience**: If internet or network connectivity drops, interfaces must display an offline badge (*"Reconnecting to queue..."*) rather than displaying stale or misleading position numbers.

---

## 10. Important Edge Cases

### Edge Case 1: Customer Submits Invalid Phone Number
- **Condition**: User inputs fewer or more than 10 digits, or includes letters/special characters.
- **Handling**: The `/join` form disables submission and displays inline error: *"Please enter a valid 10-digit mobile number"*.

### Edge Case 2: Duplicate Active Phone Submission
- **Condition**: A customer with an active `Waiting` token (e.g., S-14) attempts to submit `/join` again with the same number.
- **Handling**: Prevent duplicate record creation. Display modal: *"You are already in line with token S-14"*, and automatically redirect to `/status/s-14`.

### Edge Case 3: Customer Attempts to Select More Than 3 Services
- **Condition**: User taps a 4th service checkbox on `/join`.
- **Handling**: The selection is blocked. A toast alert appears: *"Maximum 3 services can be selected per visit"*.

### Edge Case 4: Customer Selects a Barber Currently On Break
- **Condition**: Customer selects "Imran" who is marked `On break`.
- **Handling**: Display informational notice: *"Imran is on break. You will wait until Imran returns or you may switch to 'Any barber' for faster service"*. Customer may still proceed if they choose to wait.

### Edge Case 5: No Eligible Customers for Calling Barber
- **Condition**: Barber Amit is free, but the only waiting customers explicitly requested Ravi.
- **Handling**: The `[Call Next]` action on Amit's card shows an informative tooltip/toast: *"No customers waiting for Amit or Any barber"*. Amit's chair remains `Available`.

### Edge Case 6: All Barbers Are Busy
- **Condition**: Every on-duty barber has a customer `In chair`.
- **Handling**: Reception `[Call Next]` buttons are disabled until at least one barber chair completes service.

### Edge Case 7: Customer Cancels Spot While Waiting
- **Condition**: Customer S-14 cancels their ticket on their phone.
- **Handling**: Status switches to `Cancelled`. S-14 is immediately removed from the active queue. All downstream customers (S-15, S-16) advance 1 spot forward, and their estimated wait times recalculate automatically.

### Edge Case 8: Customer Fails to Appear After Being Called
- **Condition**: Customer S-14 is called, but 10 minutes elapse without entering the chair.
- **Handling**: The receptionist dashboard highlights the `[No-show]` button. Receptionist marks `No-show`. Amit becomes available to call the next customer.

### Edge Case 9: No-Show Customer Returns Later
- **Condition**: Customer S-14 arrives 30 minutes after being marked `No-show` demanding their turn.
- **Handling**: The receptionist explains that token S-14 has expired. The receptionist adds them as a new walk-in at the end of the line, generating a fresh token (e.g., `S-22`).

### Edge Case 10: Online Queue Closes While Customers Are Waiting
- **Condition**: Clock hits 8:30 PM (auto-cutoff) or Owner manually closes queue with 8 people waiting.
- **Handling**: Remote join is blocked at `/join`. All 8 already-waiting customers remain in the system and are served in exact FIFO sequence.

### Edge Case 11: Network Connection Temporarily Lost
- **Condition**: Customer phone loses cell reception.
- **Handling**: An amber header bar displays: *"Connection lost. Attempting to reconnect..."*. Upon signal recovery, the app syncs the latest queue position immediately.

### Edge Case 12: Dual Receptionists Attempting to Call Same Token
- **Condition**: Two front-desk staff click `Call Next` simultaneously.
- **Handling**: The state management layer enforces atomic assignment: the first action claims the customer; the second receives an alert: *"Customer already called by another station"*.

### Edge Case 13: Barber Attempts to Start While Serving Someone
- **Condition**: Barber clicks start while a customer is already `In chair`.
- **Handling**: Button is disabled while status is `In chair`. Barber must click `Done` to conclude the current session before starting another.

### Edge Case 14: All Barbers Go Off Duty
- **Condition**: Owner marks all barbers off-duty in `/admin`.
- **Handling**: Queue dynamically halts. Waiting screens display: *"Salon service paused. Please contact reception."*

---

## 11. Testing Checklist

The following 15 test scenarios must be executed to certify application functionality:

| # | Test Scenario | Expected Result |
| :--- | :--- | :--- |
| **1** | Select 2 services (Haircut ₹150 / 30m + Beard trim ₹80 / 15m) on `/join`. | Order summary displays exact total: **45 min** duration and **₹230** price. |
| **2** | Submit `/join` with a phone number that already has an active `Waiting` token. | Submission blocked; system alerts user and redirects to existing `/status/:id`. |
| **3** | Barber Amit calls next when Queue has: Customer A (wants Ravi) and Customer B (wants Any). | Amit is assigned Customer B. Customer A is skipped and remains #1 in line for Ravi. |
| **4** | Receptionist calls customer token S-14. | Customer's phone at `/status/s-14` displays full-screen high-contrast alert **"It's your turn! Go to Amit"** within 5 seconds. |
| **5** | Barber taps `Start` on `/barber/amit`. | Customer status transitions to `In chair`; timer starts; Reception and TV reflect active service. |
| **6** | Barber taps `Done` on `/barber/amit`. | Customer status transitions to `Done`; customer removed from active queue; Reception & TV update instantly. |
| **7** | Customer is marked `No-show` and later re-added as a walk-in. | Customer is placed at the very **END** of the queue with a brand-new token identifier. |
| **8** | Owner switches Queue to `Closed` at `/admin`. | `/join` page disables form submission and displays: *"Online check-in is closed for today"*. |
| **9** | User toggles language selector from `EN` to `ગુજરાતી`. | Every visible UI label instantly translates to Gujarati without missing keys or English residue. |
| **10** | Multiple barbers complete services for preceding customers. | Downstream customer's estimated waiting time on `/status/:id` decreases progressively. |
| **11** | Trigger a queue change on Reception tablet. | Customer phone, Barber view, and Waiting Area TV reflect the updated state within 5 seconds. |
| **12** | Barber already has a customer `In chair` and attempts to start another. | Action is prevented; UI requires completing current customer via `Done` first. |
| **13** | Customer selects preferred barber **Ravi** at check-in. | Customer is **NEVER** assigned to Amit or Imran, even if Amit/Imran are idle. |
| **14** | Customer attempts to select a 4th service on `/join`. | 4th checkbox is disabled; warning toast displays: *"Maximum 3 services permitted"*. |
| **15** | Receptionist adds a walk-in customer via `[+ Add Walk-in]`. | Walk-in is appended to the **END** of the shared queue without displacing earlier customers. |
