import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../locales/translations';
import { syncService } from '../services/syncService';

const QueueContext = createContext();

export const ALLOWED_TRANSITIONS = {
  waiting: ['called', 'cancelled'],
  called: ['in_chair', 'no_show'],
  in_chair: ['done'],
  done: [],
  cancelled: [],
  no_show: []
};

export const INITIAL_SERVICES = [
  { id: 'srv-1', nameEn: 'Haircut', nameGu: 'વાળ કપાવવા', durationMin: 30, priceInr: 150, active: true },
  { id: 'srv-2', nameEn: 'Beard trim', nameGu: 'દાઢી ટ્રિમ', durationMin: 15, priceInr: 80, active: true },
  { id: 'srv-3', nameEn: 'Hair spa', nameGu: 'હેર સ્પા', durationMin: 45, priceInr: 400, active: true },
  { id: 'srv-4', nameEn: 'Hair wash', nameGu: 'વાળ ધોવા', durationMin: 15, priceInr: 100, active: true },
  { id: 'srv-5', nameEn: 'Hair styling', nameGu: 'હેર સ્ટાઇલિંગ', durationMin: 20, priceInr: 120, active: true },
  { id: 'srv-6', nameEn: 'Facial', nameGu: 'ફેશિયલ', durationMin: 45, priceInr: 500, active: true },
  { id: 'srv-7', nameEn: 'Head massage', nameGu: 'માથાની માલિશ', durationMin: 20, priceInr: 150, active: true },
  { id: 'srv-8', nameEn: 'Hair colouring', nameGu: 'વાળ કલર', durationMin: 60, priceInr: 600, active: true }
];

export const INITIAL_BARBERS = [
  {
    id: 'barber-1',
    name: 'Ravi',
    chair: 1,
    status: 'busy', // 'available' | 'busy' | 'on_break'
    onDuty: true,
    photo: '/photos/barber-1.avif'
  },
  {
    id: 'barber-2',
    name: 'Amit',
    chair: 2,
    status: 'available',
    onDuty: true,
    photo: '/photos/barber-2.avif'
  },
  {
    id: 'barber-3',
    name: 'Imran',
    chair: 3,
    status: 'on_break',
    onDuty: true,
    photo: '/photos/barber-3.avif'
  }
];

export const INITIAL_QUEUE = [
  {
    id: 's-12',
    token: 'S-12',
    customerName: 'Rajesh Patel',
    phone: '9876543210',
    serviceIds: ['srv-1'],
    preferredBarberId: 'barber-1',
    assignedBarberId: 'barber-1',
    status: 'in_chair', // 'waiting' | 'called' | 'in_chair' | 'done' | 'cancelled' | 'no_show'
    joinedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    calledAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    id: 's-14',
    token: 'S-14',
    customerName: 'Amit Shah',
    phone: '9823456789',
    serviceIds: ['srv-3'],
    preferredBarberId: null, // Any barber
    assignedBarberId: null,
    status: 'waiting',
    joinedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 's-15',
    token: 'S-15',
    customerName: 'Kunal',
    phone: '9898123456',
    serviceIds: ['srv-1'],
    preferredBarberId: 'barber-2',
    assignedBarberId: null,
    status: 'waiting',
    joinedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  }
];

export function QueueProvider({ children }) {
  // Localization State
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('salon_lang') || 'en';
  });

  const toggleLang = () => {
    const next = lang === 'en' ? 'gu' : 'en';
    setLang(next);
    localStorage.setItem('salon_lang', next);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  // Connection & Offline State
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Retrieve initial state from syncService cache or fallback
  const cached = syncService.getSavedState();

  // Operational & Store State
  const [isQueueOpen, setIsQueueOpen] = useState(cached?.isQueueOpen ?? true);
  const [closingTime, setClosingTime] = useState(cached?.closingTime ?? '21:00'); // 9:00 PM
  const [simulatedTimeOffsetHours, setSimulatedTimeOffsetHours] = useState(0); // For testing cutoff
  const [barbers, setBarbers] = useState(() => 
    Array.isArray(cached?.barbers) && cached.barbers.length > 0 ? cached.barbers : INITIAL_BARBERS
  );
  const [services, setServices] = useState(() =>
    Array.isArray(cached?.services) && cached.services.length > 0 ? cached.services : INITIAL_SERVICES
  );
  const [queue, setQueue] = useState(() =>
    Array.isArray(cached?.queue) ? cached.queue : INITIAL_QUEUE
  );
  const [tokenCounter, setTokenCounter] = useState(cached?.tokenCounter ?? 16);
  const [stats, setStats] = useState(
    cached?.stats ?? {
      servedToday: 18,
      noShowsToday: 3,
      avgWaitMin: 14
    }
  );

  const isBroadcastingRef = useRef(false);

  // Broadcast state changes whenever core data updates
  useEffect(() => {
    if (isBroadcastingRef.current) return;
    syncService.broadcast({
      isQueueOpen,
      closingTime,
      barbers,
      services,
      queue,
      tokenCounter,
      stats
    });
  }, [isQueueOpen, closingTime, barbers, services, queue, tokenCounter, stats]);

  // Listen to remote state changes from other viewports
  useEffect(() => {
    const unsubscribe = syncService.subscribe((remoteState) => {
      if (!remoteState) return;
      isBroadcastingRef.current = true;
      if (remoteState.isQueueOpen !== undefined) setIsQueueOpen(remoteState.isQueueOpen);
      if (remoteState.closingTime !== undefined) setClosingTime(remoteState.closingTime);
      if (remoteState.barbers) setBarbers(remoteState.barbers);
      if (remoteState.services) setServices(remoteState.services);
      if (remoteState.queue) setQueue(remoteState.queue);
      if (remoteState.tokenCounter !== undefined) setTokenCounter(remoteState.tokenCounter);
      if (remoteState.stats) setStats(remoteState.stats);
      setTimeout(() => {
        isBroadcastingRef.current = false;
      }, 50);
    });
    return unsubscribe;
  }, []);

  // AUTO-CUTOFF RULE (Section 7 of docs/03-flows-rules.md):
  // Online joining automatically closes 30 minutes before salon closing time.
  const isOnlineCutoffActive = () => {
    if (!isQueueOpen) return true; // Manually closed

    const now = new Date(Date.now() + simulatedTimeOffsetHours * 3600 * 1000);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);
    const closeTotalMins = closeHour * 60 + closeMinute;
    const currentTotalMins = now.getHours() * 60 + now.getMinutes();

    // Cutoff is 30 mins before closing
    const cutoffMins = closeTotalMins - 30;
    return currentTotalMins >= cutoffMins && currentTotalMins < closeTotalMins;
  };

  // Whether online customer joining is permitted right now
  const isOnlineJoinAllowed = isQueueOpen && !isOnlineCutoffActive();

  // Service lookup helpers - resilient to service IDs, arrays of objects, or direct duration
  const getCustomerServices = (serviceIdsOrItems = []) => {
    if (!Array.isArray(serviceIdsOrItems)) return [];
    return serviceIdsOrItems
      .map(item => {
        if (!item) return null;
        if (typeof item === 'object') {
          if (item.durationMin !== undefined || item.priceInr !== undefined) return item;
          if (item.id) return services.find(s => s.id === item.id) || null;
        }
        return services.find(s => s.id === item) || null;
      })
      .filter(Boolean);
  };

  const calculateServicesTotal = (serviceIdsOrItems = []) => {
    // If passed a customer object directly
    if (serviceIdsOrItems && typeof serviceIdsOrItems === 'object' && !Array.isArray(serviceIdsOrItems)) {
      const cust = serviceIdsOrItems;
      if (typeof cust.durationMin === 'number' || typeof cust.duration === 'number') {
        return {
          duration: cust.durationMin || cust.duration || 0,
          price: cust.priceInr || cust.price || 0
        };
      }
      serviceIdsOrItems = cust.serviceIds || cust.services || (cust.serviceId ? [cust.serviceId] : []);
    }

    const selected = getCustomerServices(serviceIdsOrItems);
    let duration = selected.reduce((sum, s) => sum + (s.durationMin || s.duration || 0), 0);
    let price = selected.reduce((sum, s) => sum + (s.priceInr || s.price || 0), 0);

    // Fallback if IDs were not in catalog: default to standard service duration
    if (duration === 0 && Array.isArray(serviceIdsOrItems) && serviceIdsOrItems.length > 0) {
      duration = serviceIdsOrItems.length * 30;
      price = serviceIdsOrItems.length * 150;
    }

    return { duration, price };
  };

  // Find customer by id or token
  const getCustomer = (idOrToken) => {
    if (!idOrToken) return null;
    const lower = idOrToken.toLowerCase();
    return queue.find(q => q.id.toLowerCase() === lower || q.token.toLowerCase() === lower) || null;
  };

  // Dynamic position for a waiting customer
  const getCustomerPosition = (customerId) => {
    const target = getCustomer(customerId);
    if (!target) return 0;
    if (target.status === 'called' || target.status === 'in_chair') return 0;
    if (target.status !== 'waiting') return -1;

    const waitingSorted = queue
      .filter(q => q.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    const index = waitingSorted.findIndex(
      q => q.id.toLowerCase() === target.id.toLowerCase() || q.token.toLowerCase() === target.token.toLowerCase()
    );
    return index !== -1 ? index + 1 : 0;
  };

  // Wait time calculation according to docs/03-flows-rules.md Section 5
  // Formula: (Total Service Minutes of Customers Ahead) / (Active On-Duty Working Barbers)
  const getCustomerWaitTime = (customerId) => {
    const target = getCustomer(customerId);
    if (!target) return 0;
    if (target.status === 'called' || target.status === 'in_chair') return 0;

    // Denominator: Active on-duty working barbers who are not on break
    const workingBarbers = barbers.filter(b => b.onDuty !== false && b.status !== 'on_break');
    if (workingBarbers.length === 0) return 0;
    const capacity = workingBarbers.length;

    // Chronologically sorted waiting queue
    const waitingSorted = queue
      .filter(q => q.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    const targetIdx = waitingSorted.findIndex(
      q => q.id.toLowerCase() === target.id.toLowerCase() || q.token.toLowerCase() === target.token.toLowerCase()
    );

    // Waiting customers ahead of target
    const waitingAhead = targetIdx > 0 ? waitingSorted.slice(0, targetIdx) : [];

    const waitingMinutesAhead = waitingAhead.reduce((sum, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds || cust.services || cust);
      return sum + Math.max(15, duration);
    }, 0);

    // In-progress services (In Chair): factored into the workload pool
    const inChairCustomers = queue.filter(q => q.status === 'in_chair');
    const inChairRemaining = inChairCustomers.reduce((sum, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds || cust.services || cust);
      const standardDuration = Math.max(15, duration);
      if (cust.startedAt) {
        const elapsedMin = Math.floor((Date.now() - new Date(cust.startedAt).getTime()) / 60000);
        return sum + Math.max(5, standardDuration - elapsedMin);
      }
      return sum + Math.round(standardDuration / 2);
    }, 0);

    // Summoned customers (Called, awaiting chair seating)
    const calledCustomers = queue.filter(q => q.status === 'called');
    const calledMinutes = calledCustomers.reduce((sum, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds || cust.services || cust);
      return sum + Math.max(15, duration);
    }, 0);

    const totalWorkloadMinutes = waitingMinutesAhead + inChairRemaining + calledMinutes;

    if (totalWorkloadMinutes === 0 && waitingAhead.length === 0) {
      return 0;
    }

    // Formula: Workload Minutes / Capacity
    const calculatedWait = Math.round(totalWorkloadMinutes / capacity);
    return Math.max(5, calculatedWait);
  };

  // General wait minutes for overall queue
  const getEstimatedWaitMinutes = (serviceDuration = 0, preferredBarberId = null) => {
    const allWorkingBarbers = barbers.filter(b => b.onDuty !== false && b.status !== 'on_break');
    if (allWorkingBarbers.length === 0) return 0;

    let eligibleBarbers = allWorkingBarbers;
    if (preferredBarberId) {
      const preferred = allWorkingBarbers.find(b => b.id === preferredBarberId);
      eligibleBarbers = preferred ? [preferred] : allWorkingBarbers;
    }
    const capacity = Math.max(1, eligibleBarbers.length);

    const waitingCustomers = queue.filter(q => q.status === 'waiting');
    const waitingMinutes = waitingCustomers.reduce((acc, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds || cust.services || cust);
      return acc + Math.max(15, duration);
    }, 0);

    const inChairCustomers = queue.filter(q => q.status === 'in_chair');
    const inChairMinutes = inChairCustomers.reduce((acc, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds || cust.services || cust);
      const standardDuration = Math.max(15, duration);
      if (cust.startedAt) {
        const elapsedMin = Math.floor((Date.now() - new Date(cust.startedAt).getTime()) / 60000);
        return acc + Math.max(5, standardDuration - elapsedMin);
      }
      return acc + Math.round(standardDuration / 2);
    }, 0);

    const calledCustomers = queue.filter(q => q.status === 'called');
    const calledMinutes = calledCustomers.reduce((acc, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds || cust.services || cust);
      return acc + Math.max(15, duration);
    }, 0);

    const totalWorkload = waitingMinutes + inChairMinutes + calledMinutes;
    if (totalWorkload === 0) return 0;

    return Math.max(5, Math.round(totalWorkload / capacity));
  };

  // Check duplicate active phone number
  const findActiveSpotByPhone = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    return queue.find(
      q => q.phone?.replace(/\D/g, '') === cleaned && (q.status === 'waiting' || q.status === 'called')
    );
  };

  // Add customer to queue (Online)
  const joinQueue = ({ customerName, phone, serviceIds, preferredBarberId }) => {
    if (!isOnlineJoinAllowed) {
      return { success: false, error: 'Online joining is currently closed.' };
    }

    const existing = findActiveSpotByPhone(phone);
    if (existing) {
      return { success: false, existingSpot: existing };
    }

    const currentNum = tokenCounter;
    const tokenStr = `S-${currentNum}`;
    const idStr = `s-${currentNum}`;
    setTokenCounter(prev => prev + 1);

    const newCustomer = {
      id: idStr,
      token: tokenStr,
      customerName: customerName.trim(),
      phone: phone.trim(),
      serviceIds,
      preferredBarberId: preferredBarberId || null,
      assignedBarberId: null,
      status: 'waiting',
      joinedAt: new Date().toISOString()
    };

    setQueue(prev => [...prev, newCustomer]);
    return { success: true, entry: newCustomer };
  };

  // Add Walk-in Customer (joins SAME queue at the END)
  const addWalkInCustomer = ({ customerName, phone, serviceIds, preferredBarberId }) => {
    const currentNum = tokenCounter;
    const tokenStr = `S-${currentNum}`;
    const idStr = `s-${currentNum}`;
    setTokenCounter(prev => prev + 1);

    const newWalkIn = {
      id: idStr,
      token: tokenStr,
      customerName: customerName.trim(),
      phone: phone ? phone.trim() : '',
      serviceIds,
      preferredBarberId: preferredBarberId || null,
      assignedBarberId: null,
      status: 'waiting',
      joinedAt: new Date().toISOString(),
      isWalkIn: true
    };

    setQueue(prev => [...prev, newWalkIn]);
    return { success: true, entry: newWalkIn };
  };

  // Re-add a returning No-Show customer as a fresh Walk-In at the very END of the queue
  // (Section 6.1 and Section 10 Edge Case 9 of docs/03-flows-rules.md)
  const reAddNoShowCustomer = (customerId) => {
    const originalCust = getCustomer(customerId);
    if (!originalCust) {
      return { success: false, error: 'Customer not found.' };
    }
    if (originalCust.status !== 'no_show') {
      return { success: false, error: 'Only customers marked as No-show can be re-added as returning walk-ins.' };
    }

    const currentNum = tokenCounter;
    const tokenStr = `S-${currentNum}`;
    const idStr = `s-${currentNum}`;
    setTokenCounter(prev => prev + 1);

    const freshEntry = {
      id: idStr,
      token: tokenStr,
      customerName: originalCust.customerName,
      phone: originalCust.phone,
      serviceIds: [...originalCust.serviceIds],
      preferredBarberId: originalCust.preferredBarberId,
      assignedBarberId: null,
      status: 'waiting',
      joinedAt: new Date().toISOString(), // Fresh timestamp guaranteed to be at the END of FIFO line
      isWalkIn: true,
      reAddedFromToken: originalCust.token
    };

    setQueue(prev => [...prev, freshEntry]);
    return { success: true, entry: freshEntry, oldToken: originalCust.token };
  };

  // Call Next Customer for Barber X
  const callNextCustomer = (barberId) => {
    const barber = barbers.find(b => b.id === barberId);
    if (!barber) return { success: false, error: 'Barber not found.' };

    if (barber.status === 'on_break') {
      return { success: false, error: `${barber.name} is on break and cannot take customers.` };
    }

    const existingActive = queue.find(
      q => q.assignedBarberId === barberId && (q.status === 'in_chair' || q.status === 'called')
    );
    if (existingActive) {
      return { success: false, error: `${barber.name} already has an active customer (${existingActive.token}).` };
    }

    const waitingChronological = queue
      .filter(q => q.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    const eligibleCustomer = waitingChronological.find(
      q => q.preferredBarberId === barberId || q.preferredBarberId === null
    );

    if (!eligibleCustomer) {
      return { success: false, error: `No eligible customers waiting for ${barber.name} or 'Any barber'.` };
    }

    const nowIso = new Date().toISOString();
    setQueue(prev =>
      prev.map(item => {
        if (item.id === eligibleCustomer.id) {
          return {
            ...item,
            status: 'called',
            assignedBarberId: barberId,
            calledAt: nowIso
          };
        }
        return item;
      })
    );

    setBarbers(prev =>
      prev.map(b => (b.id === barberId ? { ...b, status: 'busy' } : b))
    );

    return { success: true, customer: eligibleCustomer };
  };

  // Barber Actions
  const startService = (barberId) => {
    const barber = barbers.find(b => b.id === barberId);
    if (!barber) return { success: false, error: 'Barber not found.' };

    const alreadyInChair = queue.find(
      q => q.assignedBarberId === barberId && q.status === 'in_chair'
    );
    if (alreadyInChair) {
      return { success: false, error: `Chair is already occupied by ${alreadyInChair.token}. Complete current service first.` };
    }

    const calledCust = queue.find(
      q => q.assignedBarberId === barberId && q.status === 'called'
    );
    if (!calledCust) {
      return { success: false, error: 'No summoned customer waiting to start service.' };
    }

    const nowIso = new Date().toISOString();
    setQueue(prev =>
      prev.map(item => {
        if (item.id === calledCust.id) {
          return {
            ...item,
            status: 'in_chair',
            startedAt: nowIso
          };
        }
        return item;
      })
    );

    setBarbers(prev =>
      prev.map(b => (b.id === barberId ? { ...b, status: 'busy' } : b))
    );

    return { success: true, customer: calledCust };
  };

  const completeService = (barberId) => {
    const inChairCust = queue.find(
      q => q.assignedBarberId === barberId && q.status === 'in_chair'
    );
    if (!inChairCust) {
      return { success: false, error: 'No active in-chair customer found to complete.' };
    }

    const nowIso = new Date().toISOString();
    setQueue(prev =>
      prev.map(item => {
        if (item.id === inChairCust.id) {
          return {
            ...item,
            status: 'done',
            doneAt: nowIso
          };
        }
        return item;
      })
    );

    setBarbers(prev =>
      prev.map(b => {
        if (b.id === barberId) {
          return {
            ...b,
            status: b.status === 'on_break' ? 'on_break' : 'available'
          };
        }
        return b;
      })
    );

    setStats(prev => ({
      ...prev,
      servedToday: prev.servedToday + 1
    }));

    return { success: true, customer: inChairCust };
  };

  // Toggle Barber Break
  const toggleBarberBreak = (barberId) => {
    setBarbers(prev =>
      prev.map(b => {
        if (b.id === barberId) {
          const nextStatus = b.status === 'on_break' ? 'available' : 'on_break';
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  // ADMIN ACTIONS: Toggle Service Active
  const toggleServiceActive = (serviceId) => {
    setServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, active: !s.active } : s))
    );
  };

  // ADMIN ACTIONS: Toggle Barber On Duty
  const toggleBarberOnDuty = (barberId) => {
    const onDutyCount = barbers.filter(b => b.onDuty).length;
    const targetBarber = barbers.find(b => b.id === barberId);

    // Guard: Prevent toggling off if it's the last on-duty barber and queue is open
    if (targetBarber?.onDuty && onDutyCount <= 1 && isQueueOpen) {
      return { success: false, error: 'At least one barber must remain on duty while the queue is open.' };
    }

    setBarbers(prev =>
      prev.map(b => (b.id === barberId ? { ...b, onDuty: !b.onDuty } : b))
    );
    return { success: true };
  };

  // Zero-barber status: whether all on-duty barbers are currently on break
  const activeWorkingBarbers = barbers.filter(b => b.onDuty && b.status !== 'on_break');
  const isAllBarbersOnBreak = activeWorkingBarbers.length === 0 && barbers.some(b => b.onDuty);

  // Mark Customer as No-Show
  // 10-Minute Grace Period Guard (Section 6.1 of docs/03-flows-rules.md)
  const markCustomerNoShow = (customerId, force = false) => {
    const customer = getCustomer(customerId);
    if (!customer) {
      return { success: false, error: 'Customer not found.' };
    }
    if (customer.status !== 'called') {
      return { success: false, error: 'Only called customers can be marked as No-show.' };
    }

    const elapsedMinutes = customer.calledAt
      ? Math.floor((Date.now() - new Date(customer.calledAt).getTime()) / (60 * 1000))
      : 0;

    if (elapsedMinutes < 10 && !force) {
      const remaining = Math.max(1, 10 - elapsedMinutes);
      return {
        success: false,
        error: `Customer has a 10-minute grace period. Please wait ${remaining} more minute(s) before marking No-Show.`
      };
    }

    setQueue(prev =>
      prev.map(item => {
        if (item.id === customerId) {
          return {
            ...item,
            status: 'no_show',
            noShowAt: new Date().toISOString()
          };
        }
        return item;
      })
    );

    if (customer.assignedBarberId) {
      setBarbers(prev =>
        prev.map(b => {
          if (b.id === customer.assignedBarberId && b.status !== 'on_break') {
            return { ...b, status: 'available' };
          }
          return b;
        })
      );
    }

    setStats(prev => ({
      ...prev,
      noShowsToday: prev.noShowsToday + 1
    }));

    return { success: true };
  };

  // Cancel Spot - Can only cancel if status is 'waiting'
  const cancelCustomerSpot = (customerId) => {
    const customer = getCustomer(customerId);
    if (!customer) {
      return { success: false, error: 'Customer not found.' };
    }
    if (customer.status !== 'waiting') {
      return { success: false, error: 'Only waiting customers can cancel their spot.' };
    }

    setQueue(prev =>
      prev.map(item => {
        if (item.id === customerId && item.status === 'waiting') {
          return {
            ...item,
            status: 'cancelled',
            cancelledAt: new Date().toISOString()
          };
        }
        return item;
      })
    );
    return { success: true };
  };

  // Direct status update with Strict Lifecycle Guard (Section 3.3 of docs/03-flows-rules.md)
  const setCustomerStatus = (customerId, nextStatus, assignedBarberId = null, options = {}) => {
    const cust = getCustomer(customerId);
    if (!cust) return { success: false, error: 'Customer not found.' };

    const allowed = ALLOWED_TRANSITIONS[cust.status] || [];
    if (!allowed.includes(nextStatus) && !options.force) {
      return {
        success: false,
        error: `Illegal status transition from '${cust.status}' to '${nextStatus}'. Valid next states: ${allowed.join(', ') || 'none (terminal state)'}.`
      };
    }

    const nowIso = new Date().toISOString();
    setQueue(prev =>
      prev.map(item => {
        if (item.id === customerId) {
          return {
            ...item,
            status: nextStatus,
            assignedBarberId: assignedBarberId || item.assignedBarberId,
            calledAt: nextStatus === 'called' ? nowIso : item.calledAt,
            startedAt: nextStatus === 'in_chair' ? nowIso : item.startedAt,
            doneAt: nextStatus === 'done' ? nowIso : item.doneAt,
            cancelledAt: nextStatus === 'cancelled' ? nowIso : item.cancelledAt,
            noShowAt: nextStatus === 'no_show' ? nowIso : item.noShowAt
          };
        }
        return item;
      })
    );
    return { success: true };
  };

  const resetSalonState = () => {
    try {
      localStorage.removeItem('salon_queue_master_state_v1');
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    setIsQueueOpen(true);
    setClosingTime('21:00');
    setBarbers(INITIAL_BARBERS);
    setServices(INITIAL_SERVICES);
    setQueue(INITIAL_QUEUE);
    setTokenCounter(16);
    setStats({
      servedToday: 18,
      noShowsToday: 3,
      avgWaitMin: 14
    });
  };

  return (
    <QueueContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        isOnline,
        isQueueOpen,
        setIsQueueOpen,
        closingTime,
        setClosingTime,
        isOnlineCutoffActive,
        isOnlineJoinAllowed,
        simulatedTimeOffsetHours,
        setSimulatedTimeOffsetHours,
        barbers,
        setBarbers,
        services,
        setServices,
        queue,
        setQueue,
        tokenCounter,
        setTokenCounter,
        stats,
        setStats,
        getCustomer,
        getCustomerServices,
        calculateServicesTotal,
        getCustomerPosition,
        getCustomerWaitTime,
        getEstimatedWaitMinutes,
        findActiveSpotByPhone,
        joinQueue,
        addWalkInCustomer,
        callNextCustomer,
        startService,
        completeService,
        toggleBarberBreak,
        toggleServiceActive,
        toggleBarberOnDuty,
        isAllBarbersOnBreak,
        ALLOWED_TRANSITIONS,
        markCustomerNoShow,
        reAddNoShowCustomer,
        cancelCustomerSpot,
        setCustomerStatus
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
