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

  // Stats
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

  // Wait time calculation according to docs/03-flows-rules.md Section 5:
  // Estimated waiting time ≈ total minutes of services ahead ÷ number of barbers working
  const getEstimatedWaitMinutes = (serviceDuration = 0, preferredBarberId = null) => {
    const workingBarbers = barbers.filter(b => b.onDuty && b.status !== 'on_break');
    if (workingBarbers.length === 0) return 0;

    // Sum service minutes of all waiting customers ahead
    const waitingCustomers = queue.filter(q => q.status === 'waiting');
    const totalWaitingMinutes = waitingCustomers.reduce((acc, cust) => {
      const { duration } = calculateServicesTotal(cust.serviceIds);
      return acc + duration;
    }, 0);

    // Add estimated remaining minutes of in-chair customers
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

  // Add customer to queue
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
        getCustomerServices,
        calculateServicesTotal,
        getEstimatedWaitMinutes,
        findActiveSpotByPhone,
        joinQueue
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
