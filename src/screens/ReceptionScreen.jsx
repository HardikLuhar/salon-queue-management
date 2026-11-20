import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import {
  Users,
  Clock,
  UserCheck,
  AlertTriangle,
  UserX,
  X,
  Plus,
  Phone,
  CheckCircle2,
  CheckCircle,
  Filter,
  UserPlus,
  Scissors,
  Coffee
} from 'lucide-react';

export default function ReceptionScreen() {
  const {
    t,
    lang,
    barbers,
    queue,
    services,
    stats,
    isQueueOpen,
    callNextCustomer,
    completeService,
    toggleBarberBreak,
    markCustomerNoShow,
    reAddNoShowCustomer,
    cancelCustomerSpot,
    addWalkInCustomer,
    getCustomerServices,
    calculateServicesTotal
  } = useQueue();

  // Local UI State
  const [activeTab, setActiveTab] = useState('both'); // for mobile: 'barbers' | 'queue' | 'both'
  const [filterPreference, setFilterPreference] = useState('all'); // 'all' | 'any' | 'specific'
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Walk-in Form State
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceIds, setWalkInServiceIds] = useState(['srv-1']);
  const [walkInBarberId, setWalkInBarberId] = useState(null);
  const [walkInError, setWalkInError] = useState('');

  // Active services list
  const activeServices = services.filter(s => s.active);

  // Active waiting customers STRICTLY sorted by joinedAt FIFO timestamp
  const waitingCustomers = queue
    .filter(q => q.status === 'waiting')
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
  const calledCustomers = queue.filter(q => q.status === 'called');
  const noShowCustomers = queue.filter(q => q.status === 'no_show');
  const activeQueueList = queue.filter(q => q.status === 'waiting' || q.status === 'called');

  // Filtered waiting list
  const filteredWaiting = waitingCustomers.filter(cust => {
    if (filterPreference === 'any') return cust.preferredBarberId === null;
    if (filterPreference === 'specific') return cust.preferredBarberId !== null;
    return true;
  });

  // Notice Toast helper
  const notify = (msg, isError = false) => {
    setActionNotice({ msg, isError });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Handler to re-add a returning no-show customer at the very END of the line
  const handleReAddNoShow = (customerId) => {
    const res = reAddNoShowCustomer(customerId);
    if (res.success) {
      notify(`Customer ${res.entry.customerName} re-added at the END of the line with fresh token ${res.entry.token}!`);
    } else {
      notify(res.error, true);
    }
  };

  // Trigger Call Next
  const handleCallNext = (barberId) => {
    const result = callNextCustomer(barberId);
    if (result.success) {
      const barber = barbers.find(b => b.id === barberId);
      notify(`Summoned Token ${result.customer.token} (${result.customer.customerName}) for ${barber?.name}!`);
    } else {
      notify(result.error, true);
    }
  };

  // Toggle Barber Break by Receptionist
  const handleToggleBreak = (barberId, barberName, currentStatus) => {
    toggleBarberBreak(barberId);
    if (currentStatus === 'on_break') {
      notify(`${barberName} is back from break and ready for clients.`);
    } else {
      notify(`${barberName} has been put on break.`);
    }
  };

  // Receptionist marks early finish & frees chair
  const handleFinishEarly = (barberId, barberName, token) => {
    const res = completeService(barberId);
    if (res.success) {
      notify(`Service for Token ${token} marked completed! ${barberName}'s chair is now free.`);
    } else {
      notify(res.error || 'Failed to complete service.', true);
    }
  };

  // Trigger No-Show with 10-Minute Grace Period Guard
  const handleNoShow = (customerId, force = false) => {
    const result = markCustomerNoShow(customerId, force);
    if (result.success) {
      notify('Customer marked as No-show. Station cleared.');
    } else {
      if (result.error && result.error.includes('10-minute grace period')) {
        if (window.confirm(`${result.error}\n\nDo you want to override and confirm No-Show anyway?`)) {
          const forceRes = markCustomerNoShow(customerId, true);
          if (forceRes.success) {
            notify('Customer marked as No-show (grace period overridden).');
            return;
          }
        }
      }
      notify(result.error, true);
    }
  };

  // Walk-in Service Toggle (max 3 limit)
  const toggleWalkInService = (srvId) => {
    if (walkInServiceIds.includes(srvId)) {
      if (walkInServiceIds.length === 1) return;
      setWalkInServiceIds(prev => prev.filter(id => id !== srvId));
    } else {
      if (walkInServiceIds.length >= 3) {
        notify('Maximum 3 services permitted for walk-in.', true);
        return;
      }
      setWalkInServiceIds(prev => [...prev, srvId]);
    }
  };

  // Submit Walk-in Customer
  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      setWalkInError('Please enter a customer name.');
      return;
    }
    if (walkInServiceIds.length === 0) {
      setWalkInError('Please select at least 1 service.');
      return;
    }

    const result = addWalkInCustomer({
      customerName: walkInName,
      phone: walkInPhone,
      serviceIds: walkInServiceIds,
      preferredBarberId: walkInBarberId
    });

    if (result.success) {
      notify(`Walk-in added! Token ${result.entry.token} assigned.`);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInServiceIds(['srv-1']);
      setWalkInBarberId(null);
      setWalkInError('');
      setShowWalkInModal(false);
    }
  };

  // Elapsed wait time calculator
  const getElapsedWaitMinutes = (joinedAt) => {
    if (!joinedAt) return 0;
    const diffMs = Date.now() - new Date(joinedAt).getTime();
    return Math.max(1, Math.floor(diffMs / 60000));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Toast Notification */}
      {actionNotice && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 border ${
            actionNotice.isError
              ? 'bg-red-950 text-red-100 border-red-800'
              : 'bg-black text-white border-neutral-700'
          } animate-fade-in`}
        >
          {actionNotice.isError ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* Top Header & Operational Metric Strip */}
      <div className="bg-white border border-neutral-300 rounded-2xl p-5 mb-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-950">
                {t('nav.reception')}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isQueueOpen ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isQueueOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{isQueueOpen ? 'QUEUE OPEN' : 'QUEUE CLOSED'}</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Master Queue Command Center · Real-Time Station Oversight
            </p>
          </div>
        </div>

        {/* Operational Statistics Strip */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-neutral-200">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
              Served Today
            </span>
            <span className="font-serif text-xl font-bold text-neutral-900">
              {stats.servedToday}
            </span>
          </div>

          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
              No-Shows
            </span>
            <span className="font-serif text-xl font-bold text-red-600">
              {stats.noShowsToday}
            </span>
          </div>

          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
              Avg Wait Time
            </span>
            <span className="font-serif text-xl font-bold text-neutral-900">
              {stats.avgWaitMin} min
            </span>
          </div>

          {/* Primary Action: Add Walk-In */}
          <button
            onClick={() => setShowWalkInModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actions.addWalkIn')}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-neutral-200 p-1 rounded-full mb-6 max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('barbers')}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'barbers' ? 'bg-black text-white shadow-xs' : 'text-neutral-700'
          }`}
        >
          Barbers ({barbers.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'queue' ? 'bg-black text-white shadow-xs' : 'text-neutral-700'
          }`}
        >
          Waiting List ({waitingCustomers.length})
        </button>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE BARBER WORKSTATIONS (5 Columns on Desktop/Tablet Landscape) */}
        <div className={`lg:col-span-5 space-y-5 ${activeTab === 'queue' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <h2 className="text-xs uppercase tracking-widest text-neutral-600 font-bold">
              Active Barber Workstations
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              {barbers.filter(b => b.status === 'busy').length} / {barbers.length} Chairs In Use
            </span>
          </div>

          {barbers.map((b) => {
            // Find active customer assigned to this chair
            const activeCustomer = queue.find(
              q => q.assignedBarberId === b.id && (q.status === 'in_chair' || q.status === 'called')
            );
            const isBusy = b.status === 'busy' || !!activeCustomer;
            const isOnBreak = b.status === 'on_break';
            const isAvailable = !isBusy && !isOnBreak;

            // Compute elapsed/remaining service duration
            const custServices = activeCustomer ? getCustomerServices(activeCustomer.serviceIds) : [];
            const targetDuration = custServices.reduce((sum, s) => sum + s.durationMin, 30);
            const startTimeIso = activeCustomer?.startedAt || activeCustomer?.calledAt;
            const elapsedMin = startTimeIso
              ? Math.floor((Date.now() - new Date(startTimeIso).getTime()) / 60000)
              : 0;
            const remainingMin = Math.max(1, targetDuration - elapsedMin);
            const progressPercent = Math.min(100, Math.round((elapsedMin / targetDuration) * 100));

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all space-y-4 shadow-xs ${
                  isAvailable
                    ? 'border-black ring-1 ring-black/5'
                    : isOnBreak
                    ? 'border-neutral-200 opacity-70 bg-neutral-50/50'
                    : 'border-neutral-200'
                }`}
              >
                {/* Barber Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={b.photo}
                      alt={b.name}
                      className="w-14 h-14 rounded-2xl object-cover grayscale contrast-125 border border-neutral-300 shrink-0 shadow-2xs"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-xl text-neutral-950 leading-tight">
                        {b.name}
                      </h3>
                      <span className="text-xs text-neutral-500 font-mono tracking-wider block mt-0.5">
                        Chair #{b.chair} Workstation
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isBusy && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>{t('barber.busy')}</span>
                      </span>
                    )}
                    {isAvailable && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('barber.available')}</span>
                      </span>
                    )}
                    {isOnBreak && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span>{t('barber.onBreak')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Busy State Details with Large Architectural Token & Remaining Time */}
                {isBusy && activeCustomer && (
                  <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                      <div className="flex items-baseline gap-2.5 min-w-0">
                        <span className="font-serif font-bold text-3xl sm:text-4xl text-neutral-950 tracking-tight leading-none">
                          {activeCustomer.token}
                        </span>
                        <span className="text-sm font-semibold text-neutral-900 truncate max-w-[150px]">
                          {activeCustomer.customerName}
                        </span>
                      </div>
                      <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        activeCustomer.status === 'called' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-neutral-900 text-white'
                      }`}>
                        {activeCustomer.status === 'called' ? 'Summoned' : 'In Chair'}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 font-medium truncate">
                      {custServices.map(s => (lang === 'gu' ? s.nameGu : s.nameEn)).join(' + ')}
                    </div>

                    {/* Enlarged Linear Progress Bar with Remaining Service Time */}
                    {(activeCustomer.status === 'in_chair' || activeCustomer.status === 'called') && (
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-neutral-500 font-medium">
                            {elapsedMin}m elapsed / {targetDuration}m target
                          </span>
                          <span className="font-mono font-bold text-xs bg-neutral-200 text-neutral-900 px-2.5 py-0.5 rounded-md">
                            ~{remainingMin}m remaining
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="bg-black h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-1">
                  {isAvailable && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCallNext(b.id)}
                        className="w-full min-h-[48px] py-3 rounded-xl text-xs uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{t('actions.callNext')} ({b.name})</span>
                      </button>
                      <button
                        onClick={() => handleToggleBreak(b.id, b.name, b.status)}
                        className="w-full py-2 rounded-xl text-[11px] font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Coffee className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{t('reception.putOnBreak')}</span>
                      </button>
                    </div>
                  )}

                  {isBusy && (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full min-h-[44px] py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed flex items-center justify-center"
                      >
                        Active Service in Progress
                      </button>
                      {activeCustomer && (
                        <button
                          onClick={() => handleFinishEarly(b.id, b.name, activeCustomer.token)}
                          className="w-full py-2.5 rounded-xl text-[11px] font-medium text-neutral-800 hover:text-black border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('reception.finishEarly')}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {isOnBreak && (
                    <div className="space-y-2">
                      <div className="text-center py-1 text-xs text-neutral-400 italic">
                        Barber on break · Resumes shortly
                      </div>
                      <button
                        onClick={() => handleToggleBreak(b.id, b.name, b.status)}
                        className="w-full min-h-[44px] py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{t('reception.endBreak')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: LIVE WAITING QUEUE (7 Columns on Desktop/Tablet Landscape) */}
        <div className={`lg:col-span-7 space-y-5 ${activeTab === 'barbers' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <h2 className="text-xs uppercase tracking-widest text-neutral-600 font-bold">
                Live Waiting Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-black text-white text-xs font-mono font-semibold">
                {waitingCustomers.length}
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-full border border-neutral-200">
              <button
                onClick={() => setFilterPreference('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filterPreference === 'all' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                All ({waitingCustomers.length})
              </button>
              <button
                onClick={() => setFilterPreference('any')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filterPreference === 'any' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Any Barber
              </button>
              <button
                onClick={() => setFilterPreference('specific')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filterPreference === 'specific' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Specific
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-neutral-300 rounded-2xl overflow-hidden shadow-xs">
            {filteredWaiting.length === 0 ? (
              <div className="p-12 text-center text-neutral-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <div className="font-serif text-lg font-medium text-neutral-700">
                  {t('queue.noWaiting')}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  New remote check-ins and walk-ins will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {filteredWaiting.map((cust, idx) => {
                  const custServices = getCustomerServices(cust.serviceIds);
                  const prefBarber = barbers.find(b => b.id === cust.preferredBarberId);
                  const elapsedWait = getElapsedWaitMinutes(cust.joinedAt);
                  const isLongWait = elapsedWait >= 60;

                  return (
                    <div
                      key={cust.id}
                      className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLongWait ? 'bg-amber-500/10 border-l-4 border-amber-600' : 'hover:bg-neutral-50/80'
                      }`}
                    >
                      {/* Left: Token & Client */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <span className="font-serif font-bold text-sm leading-none">
                            {cust.token}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-mono mt-0.5">
                            #{idx + 1}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-neutral-950 truncate">
                              {cust.customerName}
                            </span>
                            {cust.isWalkIn && (
                              <span className="text-[9px] uppercase tracking-wider font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-neutral-200 text-neutral-800 shrink-0">
                                Walk-in
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-neutral-500 truncate mt-0.5">
                            {custServices.map(s => (lang === 'gu' ? s.nameGu : s.nameEn)).join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Middle & Right: Barber Preference, Elapsed Time & Action */}
                      <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                        <div className="text-left sm:text-right min-w-[70px]">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">
                            Barber
                          </span>
                          <span className="font-medium text-neutral-800 truncate block">
                            {prefBarber ? prefBarber.name : t('barber.any')}
                          </span>
                        </div>

                        <div className="text-left sm:text-right min-w-[65px]">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">
                            Waiting
                          </span>
                          <span className={`font-mono font-medium ${isLongWait ? 'text-amber-700 font-bold' : 'text-neutral-700'}`}>
                            {elapsedWait} min {isLongWait && '(!)'}
                          </span>
                        </div>

                        {/* Actions: Cancel */}
                        <div>
                          <button
                            onClick={() => cancelCustomerSpot(cust.id)}
                            className="min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors"
                            title="Cancel spot"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Called Customers Section (Eligible for No-Show) */}
          {calledCustomers.length > 0 && (
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-xs uppercase tracking-widest text-neutral-600 font-bold">
                  Summoned / Called Customers ({calledCustomers.length})
                </h3>
              </div>

              <div className="space-y-2">
                {calledCustomers.map((cust) => {
                  const assigned = barbers.find(b => b.id === cust.assignedBarberId);
                  const elapsedCalled = getElapsedWaitMinutes(cust.calledAt);

                  return (
                    <div
                      key={cust.id}
                      className="bg-amber-500/10 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-base text-neutral-950">
                          {cust.token}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-neutral-900">
                            {cust.customerName} → Chair #{assigned?.chair} ({assigned?.name})
                          </div>
                          <span className="text-[11px] text-neutral-500">
                            Called {elapsedCalled} min ago
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Only Called customers have the No-Show action button! */}
                        <button
                          onClick={() => handleNoShow(cust.id)}
                          className={`min-h-[48px] px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            elapsedCalled >= 10
                              ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse ring-2 ring-red-400'
                              : 'bg-neutral-800 text-white hover:bg-red-600'
                          }`}
                        >
                          <span>{t('actions.noShow')}</span>
                          {elapsedCalled < 10 && (
                            <span className="text-[10px] opacity-75 font-mono">({10 - elapsedCalled}m)</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Late Arrivals / No-Shows Section (Eligible to Re-add at END with new token) */}
          {noShowCustomers.length > 0 && (
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <h3 className="text-xs uppercase tracking-widest text-neutral-600 font-bold">
                  Recent No-Shows / Late Arrivals ({noShowCustomers.length})
                </h3>
              </div>

              <div className="space-y-2">
                {noShowCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="bg-neutral-100 border border-neutral-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-sm text-neutral-500 line-through">
                        {cust.token}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-neutral-900">
                          {cust.customerName}
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          Expired No-show ticket · Prior token void
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReAddNoShow(cust.id)}
                      className="min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('actions.reAddWalkIn')}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-300 animate-scale-up">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-black" />
                <h3 className="font-serif text-xl font-bold text-neutral-950">
                  {t('actions.addWalkIn')}
                </h3>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-neutral-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {walkInError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black"
                />
              </div>

              {/* Service Selection */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Select Services (Max 3) *
                  </label>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {walkInServiceIds.length}/3
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-neutral-200 rounded-xl">
                  {activeServices.map((srv) => {
                    const isSelected = walkInServiceIds.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleWalkInService(srv.id)}
                        className={`cursor-pointer p-2 rounded-lg text-xs border transition-all ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-black font-medium'
                            : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                        }`}
                      >
                        <div className="truncate font-serif">{lang === 'gu' ? srv.nameGu : srv.nameEn}</div>
                        <div className="text-[10px] opacity-70">₹{srv.priceInr} · {srv.durationMin}m</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Barber */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Preferred Barber
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkInBarberId(null)}
                    className={`py-2 px-1 text-center rounded-xl text-xs border transition-all ${
                      walkInBarberId === null
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                    }`}
                  >
                    Any
                  </button>
                  {barbers.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setWalkInBarberId(b.id)}
                      className={`py-2 px-1 text-center rounded-xl text-xs border transition-all truncate ${
                        walkInBarberId === b.id
                          ? 'bg-black text-white border-black font-semibold'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-neutral-600 hover:text-black uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 shadow-sm"
                >
                  Add to End of Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
