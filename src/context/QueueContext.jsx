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
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80&sat=-100'
  },
  {
    id: 'barber-2',
    name: 'Amit',
    chair: 2,
    status: 'available',
    onDuty: true,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80&sat=-100'
  },
  {
    id: 'barber-3',
    name: 'Imran',
    chair: 3,
    status: 'on_break',
    onDuty: true,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80&sat=-100'
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
        setStats
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
