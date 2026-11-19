import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const QueueContext = createContext();

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

  // Operational & Store State
  const [isQueueOpen, setIsQueueOpen] = useState(true);
  const [barbers, setBarbers] = useState(INITIAL_BARBERS);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [tokenCounter, setTokenCounter] = useState(16);

  // Operational Stats
  const [stats, setStats] = useState({
    servedToday: 18,
    noShowsToday: 3,
    avgWaitMin: 14
  });

  // Service lookup helpers
  const getCustomerServices = (serviceIds = []) => {
    return serviceIds.map(id => services.find(s => s.id === id)).filter(Boolean);
  };

  const calculateServicesTotal = (serviceIds = []) => {
    const selected = getCustomerServices(serviceIds);
    const duration = selected.reduce((sum, s) => sum + s.durationMin, 0);
    const price = selected.reduce((sum, s) => sum + s.priceInr, 0);
    return { duration, price };
  };

  // Find customer by id or token
  const getCustomer = (idOrToken) => {
    if (!idOrToken) return null;
    const lower = idOrToken.toLowerCase();
    return queue.find(q => q.id.toLowerCase() === lower || q.token.toLowerCase() === lower) || null;
  };

  // Get dynamic position for a waiting customer
  const getCustomerPosition = (customerId) => {
    const target = getCustomer(customerId);
    if (!target) return 0;
    if (target.status === 'called' || target.status === 'in_chair') return 0;
    if (target.status !== 'waiting') return -1;

    const waitingSorted = queue
      .filter(q => q.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    const index = waitingSorted.findIndex(q => q.id === target.id);
    return index !== -1 ? index + 1 : 0;
  };

  // Wait time calculation according to docs/03-flows-rules.md Section 5
  const getCustomerWaitTime = (customerId) => {
    const target = getCustomer(customerId);
    if (!target) return 0;
    if (target.status === 'called' || target.status === 'in_chair') return 0;

    const workingBarbers = barbers.filter(b => b.onDuty && b.status !== 'on_break');
    if (workingBarbers.length === 0) return 0;

    const waitingSorted = queue
      .filter(q => q.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    const targetIdx = waitingSorted.findIndex(q => q.id === target.id);
    const customersAhead = targetIdx > 0 ? waitingSorted.slice(0, targetIdx) : [];

    const minutesAhead = customersAhead.reduce((sum, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds);
      return sum + duration;
    }, 0);

    const inChairCustomers = queue.filter(q => q.status === 'in_chair');
    const inChairRemaining = inChairCustomers.reduce((sum, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds);
      if (cust.startedAt) {
        const elapsedMin = Math.floor((Date.now() - new Date(cust.startedAt).getTime()) / 60000);
        return sum + Math.max(5, duration - elapsedMin);
      }
      return sum + Math.round(duration / 2);
    }, 0);

    const totalMinutes = minutesAhead + inChairRemaining;
    return Math.max(5, Math.round(totalMinutes / workingBarbers.length));
  };

  // General wait minutes for overall queue
  const getEstimatedWaitMinutes = (serviceDuration = 0, preferredBarberId = null) => {
    const workingBarbers = barbers.filter(b => b.onDuty && b.status !== 'on_break');
    if (workingBarbers.length === 0) return 0;

    const waitingCustomers = queue.filter(q => q.status === 'waiting');
    const totalWaitingMinutes = waitingCustomers.reduce((acc, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds);
      return acc + duration;
    }, 0);

    const inChairCustomers = queue.filter(q => q.status === 'in_chair');
    const inChairMinutes = inChairCustomers.reduce((acc, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds);
      if (cust.startedAt) {
        const elapsedMin = Math.floor((Date.now() - new Date(cust.startedAt).getTime()) / 60000);
        return acc + Math.max(5, duration - elapsedMin);
      }
      return acc + Math.round(duration / 2);
    }, 0);

    const totalWorkload = totalWaitingMinutes + inChairMinutes;
    return Math.max(5, Math.round(totalWorkload / workingBarbers.length));
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

  // Call Next Customer for Barber X following docs/03-flows-rules.md Section 4
  const callNextCustomer = (barberId) => {
    const barber = barbers.find(b => b.id === barberId);
    if (!barber) return { success: false, error: 'Barber not found.' };

    if (barber.status === 'on_break') {
      return { success: false, error: `${barber.name} is on break and cannot take customers.` };
    }

    // Check if barber already has someone in chair or called
    const existingActive = queue.find(
      q => q.assignedBarberId === barberId && (q.status === 'in_chair' || q.status === 'called')
    );
    if (existingActive) {
      return { success: false, error: `${barber.name} already has an active customer (${existingActive.token}).` };
    }

    // Find earliest eligible waiting customer
    // Earliest who requested barberId OR selected null (Any barber)
    const waitingChronological = queue
      .filter(q => q.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    const eligibleCustomer = waitingChronological.find(
      q => q.preferredBarberId === barberId || q.preferredBarberId === null
    );

    if (!eligibleCustomer) {
      return { success: false, error: `No eligible customers waiting for ${barber.name} or 'Any barber'.` };
    }

    // Transition eligible customer to Called and assign to barber
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

    // Update barber status to busy
    setBarbers(prev =>
      prev.map(b => (b.id === barberId ? { ...b, status: 'busy' } : b))
    );

    return { success: true, customer: eligibleCustomer };
  };

  // Mark Customer as No-Show (Only allowed if status === 'called')
  const markCustomerNoShow = (customerId) => {
    const customer = getCustomer(customerId);
    if (!customer || customer.status !== 'called') {
      return { success: false, error: 'Only called customers can be marked as No-show.' };
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

    // Release barber back to available if no other active customer
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

    // Increment today's no-show count
    setStats(prev => ({
      ...prev,
      noShowsToday: prev.noShowsToday + 1
    }));

    return { success: true };
  };

  // Cancel Spot (Waiting -> Cancelled)
  const cancelCustomerSpot = (customerId) => {
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
  };

  // Direct status update
  const setCustomerStatus = (customerId, nextStatus, assignedBarberId = null) => {
    setQueue(prev =>
      prev.map(item => {
        if (item.id === customerId) {
          return {
            ...item,
            status: nextStatus,
            assignedBarberId: assignedBarberId || item.assignedBarberId,
            calledAt: nextStatus === 'called' ? new Date().toISOString() : item.calledAt,
            startedAt: nextStatus === 'in_chair' ? new Date().toISOString() : item.startedAt,
            doneAt: nextStatus === 'done' ? new Date().toISOString() : item.doneAt
          };
        }
        return item;
      })
    );
  };

  return (
    <QueueContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        isQueueOpen,
        setIsQueueOpen,
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
        markCustomerNoShow,
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
