import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import {
  Settings,
  Scissors,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Power,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function AdminScreen() {
  const {
    t,
    lang,
    isOnline,
    isQueueOpen,
    setIsQueueOpen,
    closingTime,
    setClosingTime,
    isOnlineCutoffActive,
    isOnlineJoinAllowed,
    simulatedTimeOffsetHours,
    setSimulatedTimeOffsetHours,
    services,
    toggleServiceActive,
    barbers,
    toggleBarberOnDuty,
    stats,
    setStats
  } = useQueue();

  const [notice, setNotice] = useState(null);
  const notify = (msg, isError = false) => {
    setNotice({ msg, isError });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleBarberToggle = (barberId) => {
    const res = toggleBarberOnDuty(barberId);
    if (!res.success) {
      notify(res.error, true);
    } else {
      notify('Staff duty status updated across all screens.');
    }
  };

  const cutoffActive = isOnlineCutoffActive();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 font-sans">
      {/* Toast Notification */}
      {notice && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 border ${
            notice.isError
              ? 'bg-red-950 text-red-100 border-red-800'
              : 'bg-black text-white border-neutral-700'
          } animate-fade-in`}
        >
          {notice.isError ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{notice.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-neutral-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950">
              {t('nav.admin')}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-mono">
            Salon Configuration, Staff Management & Queue Operations
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-600 shadow-2xs">
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-500" />
          )}
          <span>{isOnline ? 'Real-Time Sync Connected (<50ms)' : 'Offline Cache Mode'}</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. MASTER QUEUE CONTROL SECTION */}
        <section className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono font-bold block mb-1">
                Master Online Queue Switch
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-950">
                {isQueueOpen ? 'Online Check-In is OPEN' : 'Online Check-In is CLOSED'}
              </h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-lg leading-relaxed">
                Toggling to Closed prevents new customers from joining remotely at <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">/join</code>. Receptionists can still register walk-in clients at the front desk.
              </p>
            </div>

            <button
              onClick={() => {
                const nextState = !isQueueOpen;
                setIsQueueOpen(nextState);
                notify(`Master queue switched to ${nextState ? 'OPEN' : 'CLOSED'}`);
              }}
              className={`px-6 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 ${
                isQueueOpen
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isQueueOpen ? 'Close Queue Now' : 'Open Queue Now'}</span>
            </button>
          </div>

          {/* 30-Minute Automatic Cutoff Rule Banner */}
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-700" />
                  <span className="font-semibold text-xs text-neutral-900">
                    30-Minute Auto-Cutoff Rule
                  </span>
                  {cutoffActive && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      Cutoff Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Online joining automatically locks 30 minutes before salon closing time. Walk-ins remain welcome.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-left sm:text-right">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => {
                      setClosingTime(e.target.value);
                      notify(`Salon closing time updated to ${e.target.value}`);
                    }}
                    className="font-mono text-xs font-bold bg-white border border-neutral-300 rounded-lg px-2 py-1 text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SERVICES CATALOG MANAGEMENT */}
        <section className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono font-bold block mb-1">
                Service Catalog
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-950">
                Salon Services & Pricing ({services.length})
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              {services.filter(s => s.active).length} Active Services
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((srv) => (
              <div
                key={srv.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  srv.active ? 'bg-white border-neutral-200' : 'bg-neutral-100/60 border-neutral-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-neutral-900">
                      {srv.nameEn}
                    </span>
                    <span className="text-xs text-neutral-500">
                      ({srv.nameGu})
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5 font-mono">
                    ₹{srv.priceInr} · {srv.durationMin} minutes
                  </div>
                </div>

                {/* Toggle Active Switch */}
                <button
                  onClick={() => {
                    toggleServiceActive(srv.id);
                    notify(`${srv.nameEn} is now ${!srv.active ? 'ACTIVE' : 'INACTIVE'}`);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    srv.active
                      ? 'bg-neutral-900 text-white border-black'
                      : 'bg-white text-neutral-500 border-neutral-300 hover:border-black'
                  }`}
                >
                  {srv.active ? 'Active' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. BARBERS ON DUTY MANAGEMENT */}
        <section className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono font-bold block mb-1">
                Staff Roster
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-950">
                Master Barbers on Duty Today
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              {barbers.filter(b => b.onDuty).length} on duty
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {barbers.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  b.onDuty ? 'bg-white border-neutral-200' : 'bg-neutral-100 border-neutral-200 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={b.photo}
                    alt={b.name}
                    className="w-12 h-12 rounded-xl object-cover grayscale contrast-125 border border-neutral-200"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-neutral-900">
                      {b.name}
                    </h3>
                    <span className="text-xs text-neutral-500 font-mono">
                      Station Chair #{b.chair}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBarberToggle(b.id)}
                  className={`w-full py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all border ${
                    b.onDuty
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-black'
                  }`}
                >
                  {b.onDuty ? 'On Duty Today' : 'Off Duty'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. TODAY'S OPERATIONAL PERFORMANCE ANALYTICS */}
        <section className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-neutral-800">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-800">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono font-bold block mb-1">
                Analytics
              </span>
              <h2 className="font-serif text-2xl font-bold text-white">
                Today's Salon Performance
              </h2>
            </div>

            <button
              onClick={() => {
                setStats({ servedToday: 0, noShowsToday: 0, avgWaitMin: 0 });
                notify('Daily analytics counter reset.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Daily Stats</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono block mb-1">
                Customers Served
              </span>
              <div className="font-serif text-4xl font-bold text-white">
                {stats.servedToday}
              </div>
              <span className="text-xs text-neutral-500 mt-1 block">
                Total services concluded
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono block mb-1">
                Average Wait Time
              </span>
              <div className="font-serif text-4xl font-bold text-emerald-400">
                {stats.avgWaitMin} min
              </div>
              <span className="text-xs text-neutral-500 mt-1 block">
                Average wait before chair seating
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono block mb-1">
                No-Shows Recorded
              </span>
              <div className="font-serif text-4xl font-bold text-red-400">
                {stats.noShowsToday}
              </div>
              <span className="text-xs text-neutral-500 mt-1 block">
                Summoned tickets that expired
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
