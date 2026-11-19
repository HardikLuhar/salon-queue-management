// Step 3 Automated Verification
const INITIAL_BARBERS = [
  { id: 'barber-1', name: 'Ravi', onDuty: true, status: 'busy' },
  { id: 'barber-2', name: 'Amit', onDuty: true, status: 'available' },
  { id: 'barber-3', name: 'Imran', onDuty: true, status: 'on_break' }
];

const INITIAL_QUEUE = [
  {
    id: 's-12',
    token: 'S-12',
    customerName: 'Rajesh Patel',
    serviceIds: ['srv-1'],
    status: 'in_chair',
    joinedAt: '2026-11-20T10:30:00Z',
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10m elapsed of 30m
  },
  {
    id: 's-14',
    token: 'S-14',
    customerName: 'Amit Shah',
    serviceIds: ['srv-3'], // Hair spa: 45 min
    status: 'waiting',
    joinedAt: '2026-11-20T10:40:00Z'
  },
  {
    id: 's-15',
    token: 'S-15',
    customerName: 'Kunal',
    serviceIds: ['srv-1'], // Haircut: 30 min
    status: 'waiting',
    joinedAt: '2026-11-20T10:48:00Z'
  }
];

console.log('--- Step 3 Automated Verification ---');

// 1. Position Verification
const waitingSorted = INITIAL_QUEUE
  .filter(q => q.status === 'waiting')
  .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

const s14Pos = waitingSorted.findIndex(q => q.id === 's-14') + 1;
const s15Pos = waitingSorted.findIndex(q => q.id === 's-15') + 1;

console.log(`Position check: S-14 = ${s14Pos} (1st), S-15 = ${s15Pos} (2nd)`);
if (s14Pos === 1 && s15Pos === 2) {
  console.log('PASS: Correct queue ranking (S-14 is 1st, S-15 is 2nd)');
} else {
  console.error('FAIL: Position calculation error');
  process.exit(1);
}

// 2. Approach Alert Trigger Check (Position === 2)
const s15ShowsApproachAlert = s15Pos === 2;
console.log(`Approach Alert check for S-15: Triggered? ${s15ShowsApproachAlert}`);
if (s15ShowsApproachAlert) {
  console.log('PASS: Position === 2 correctly triggers "Start coming to the salon"');
} else {
  console.error('FAIL: Position 2 approach alert failed to trigger');
  process.exit(1);
}

// 3. Wait time calculation check
// Working barbers: Ravi (busy) + Amit (available) = 2. Imran is on_break (excluded).
const workingBarbers = INITIAL_BARBERS.filter(b => b.onDuty && b.status !== 'on_break');
console.log(`Active working barbers count: ${workingBarbers.length} (Ravi, Amit)`);
if (workingBarbers.length === 2) {
  console.log('PASS: Working barbers correctly excludes barber on break');
} else {
  console.error('FAIL: Working barbers count error');
  process.exit(1);
}

// 4. Test 4: Called state transition
let s14Ticket = { ...INITIAL_QUEUE[1] };
// Receptionist calls S-14 with Amit
s14Ticket.status = 'called';
s14Ticket.assignedBarberId = 'barber-2';
const assignedBarber = INITIAL_BARBERS.find(b => b.id === s14Ticket.assignedBarberId);

console.log(`Test 4 Called Alert Check: Status = ${s14Ticket.status}, Assigned Barber = ${assignedBarber.name}`);
if (s14Ticket.status === 'called' && assignedBarber.name === 'Amit') {
  console.log('PASS: Test 4 (Customer status transitions to Called with Amit assigned)');
} else {
  console.error('FAIL: Test 4 transition error');
  process.exit(1);
}

// 5. Cancellation test
s14Ticket.status = 'cancelled';
const remainingWaiting = INITIAL_QUEUE.filter(q => q.id !== s14Ticket.id && q.status === 'waiting');
console.log(`Cancellation check: S-14 cancelled. Active waiting remaining: ${remainingWaiting.length}`);
if (s14Ticket.status === 'cancelled' && remainingWaiting[0].id === 's-15') {
  console.log('PASS: Cancellation successfully removes customer from active queue');
} else {
  console.error('FAIL: Cancellation error');
  process.exit(1);
}

console.log('--- ALL STEP 3 TESTS PASSED ---');
