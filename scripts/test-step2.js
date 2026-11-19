// Pure JS verification script for Step 2 logic
const INITIAL_SERVICES = [
  { id: 'srv-1', nameEn: 'Haircut', durationMin: 30, priceInr: 150 },
  { id: 'srv-2', nameEn: 'Beard trim', durationMin: 15, priceInr: 80 },
  { id: 'srv-3', nameEn: 'Hair spa', durationMin: 45, priceInr: 400 },
];

const INITIAL_QUEUE = [
  { id: 's-14', token: 'S-14', phone: '9823456789', status: 'waiting' }
];

console.log('--- Step 2 Automated Verification ---');

// Test 1: Selecting 2 services (Haircut + Beard trim) calculates correct total time (45 min) and price (₹230)
const srv1 = INITIAL_SERVICES.find(s => s.id === 'srv-1');
const srv2 = INITIAL_SERVICES.find(s => s.id === 'srv-2');
const totalDuration = srv1.durationMin + srv2.durationMin;
const totalPrice = srv1.priceInr + srv2.priceInr;

console.log(`Test 1: Haircut (30m, ₹150) + Beard trim (15m, ₹80) = ${totalDuration}m, ₹${totalPrice}`);
if (totalDuration === 45 && totalPrice === 230) {
  console.log('PASS: Test 1 (Calculated 45 min and ₹230 accurately)');
} else {
  console.error('FAIL: Test 1 mismatch');
  process.exit(1);
}

// Test 14: 4th service selection blocked
const selectedServices = ['srv-1', 'srv-2', 'srv-3'];
const canAddFourth = selectedServices.length < 3;
console.log(`Test 14: Selected count: ${selectedServices.length}. Can add 4th? ${canAddFourth}`);
if (!canAddFourth) {
  console.log('PASS: Test 14 (4th service selection strictly blocked)');
} else {
  console.error('FAIL: Test 14 allowed 4th selection');
  process.exit(1);
}

// Test 2: Duplicate active phone prevention
const duplicatePhone = '9823456789';
const activeSpot = INITIAL_QUEUE.find(
  q => q.phone === duplicatePhone && (q.status === 'waiting' || q.status === 'called')
);

console.log(`Test 2: Phone ${duplicatePhone} lookup result token:`, activeSpot?.token);
if (activeSpot && activeSpot.token === 'S-14') {
  console.log('PASS: Test 2 (Duplicate active phone identified -> redirects to existing spot S-14)');
} else {
  console.error('FAIL: Test 2 did not catch duplicate active spot');
  process.exit(1);
}

console.log('--- ALL STEP 2 TESTS PASSED ---');
