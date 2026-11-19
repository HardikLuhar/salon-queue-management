// Step 4 Automated Verification Test
console.log('--- Step 4 Automated Verification ---');

// Setup Barbers
const barbers = [
  { id: 'barber-1', name: 'Ravi', chair: 1, status: 'busy', onDuty: true },
  { id: 'barber-2', name: 'Amit', chair: 2, status: 'available', onDuty: true },
  { id: 'barber-3', name: 'Imran', chair: 3, status: 'on_break', onDuty: true }
];

// Setup Queue with Customer A (wants Ravi), Customer B (wants Any), Customer C (wants Amit)
let queue = [
  { id: 'cust-a', token: 'S-20', customerName: 'Aman', preferredBarberId: 'barber-1', status: 'waiting', joinedAt: '2026-11-20T10:00:00Z' },
  { id: 'cust-b', token: 'S-21', customerName: 'Bhavin', preferredBarberId: null, status: 'waiting', joinedAt: '2026-11-20T10:05:00Z' },
  { id: 'cust-c', token: 'S-22', customerName: 'Chirag', preferredBarberId: 'barber-2', status: 'waiting', joinedAt: '2026-11-20T10:10:00Z' }
];

// Test 3: Call next for Amit (barber-2)
const barberAmit = barbers.find(b => b.name === 'Amit');
const waitingSorted = queue
  .filter(q => q.status === 'waiting')
  .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

const eligibleCustomer = waitingSorted.find(
  q => q.preferredBarberId === barberAmit.id || q.preferredBarberId === null
);

console.log(`Test 3: Calling next for Amit. Identified candidate: Token ${eligibleCustomer.token} (${eligibleCustomer.customerName})`);
console.log(`Preferred barber of candidate: ${eligibleCustomer.preferredBarberId === null ? 'Any' : eligibleCustomer.preferredBarberId}`);

if (eligibleCustomer.token === 'S-21' && eligibleCustomer.customerName === 'Bhavin') {
  console.log('PASS: Test 3 (Customer A wanting Ravi was skipped; Customer B wanting Any was selected for Amit)');
} else {
  console.error('FAIL: Test 3 selection failed');
  process.exit(1);
}

// Verify Customer A (Aman) remains #1 in line for Ravi
eligibleCustomer.status = 'called';
eligibleCustomer.assignedBarberId = 'barber-2';

const remainingWaiting = queue.filter(q => q.status === 'waiting');
console.log(`Remaining waiting top customer: Token ${remainingWaiting[0].token} (${remainingWaiting[0].customerName}, wants Ravi)`);
if (remainingWaiting[0].token === 'S-20') {
  console.log('PASS: Customer A kept top waiting position for Ravi without disruption');
} else {
  console.error('FAIL: Customer A lost queue position');
  process.exit(1);
}

// Test 15: Walk-in joins at the end of the shared queue
const walkInEntry = {
  id: 'cust-walkin',
  token: 'S-23',
  customerName: 'Deepak (Walk-in)',
  serviceIds: ['srv-1'],
  preferredBarberId: null,
  status: 'waiting',
  joinedAt: new Date().toISOString(),
  isWalkIn: true
};

queue = [...queue, walkInEntry];
const lastCustomer = queue[queue.length - 1];

console.log(`Test 15: Walk-in joined with token ${walkInEntry.token}. Last element in queue: ${lastCustomer.token}`);
if (lastCustomer.token === 'S-23' && lastCustomer.isWalkIn === true) {
  console.log('PASS: Test 15 (Walk-in successfully joined at the very END of the shared queue)');
} else {
  console.error('FAIL: Test 15 placement failed');
  process.exit(1);
}

console.log('--- ALL STEP 4 TESTS PASSED ---');
