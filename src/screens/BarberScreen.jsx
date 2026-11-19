import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  Scissors,
  Play,
  CheckCircle,
  Coffee,
  Clock,
  ArrowRight,
  AlertCircle,
  User,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function BarberScreen() {
  const { name } = useParams();
  const navigate = useNavigate();
  const {
    t,
    lang,
    barbers,
    queue,
    services,
    startService,
    completeService,
    toggleBarberBreak,
    getCustomerServices,
    calculateServicesTotal
  } = useQueue();

  // Find active barber by route name (case-insensitive) or default to Ravi
  const activeBarber = barbers.find(
    b => b.name.toLowerCase() === (name || 'ravi').toLowerCase()
  ) || barbers[0];

  // Feedback Toast
  const [toastMsg, setToastMsg] = useState(null);
  const notify = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Live Timer State (Stopwatch for In-Chair service)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Active Customer assigned to this barber
  const activeCustomer = queue.find(
    q => q.assignedBarberId === activeBarber.id && (q.status === 'in_chair' || q.status === 'called')
  );

  // Identify next eligible upcoming customer for this barber
  const waitingSorted = queue
    .filter(q => q.status === 'waiting')
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

  const nextUpcoming = waitingSorted.find(
    q => q.preferredBarberId === activeBarber.id || q.preferredBarberId === null
  );

  // Service stopwatch effect
  useEffect(() => {
    if (activeCustomer && activeCustomer.status === 'in_chair' && activeCustomer.startedAt) {
      const updateTimer = () => {
        const startMs = new Date(activeCustomer.startedAt).getTime();
        const diffSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setElapsedSeconds(diffSec);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedSeconds(0);
    }
  }, [activeCustomer?.status, activeCustomer?.startedAt]);

  // Format MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  // Actions
  const handleStart = () => {
    const res = startService(activeBarber.id);
    if (res.success) {
      notify(`Service started for Token ${res.customer.token}!`);
    } else {
      notify(res.error);
    }
  };

  const handleDone = () => {
    const res = completeService(activeBarber.id);
    if (res.success) {
      notify(`Service completed for Token ${res.customer.token}! Chair is now available.`);
    } else {
      notify(res.error);
    }
  };

  const isCalled = activeCustomer?.status === 'called';
  const isInChair = activeCustomer?.status === 'in_chair';
  const isOnBreak = activeBarber.status === 'on_break';

  // Customer service calculations
  const custServices = activeCustomer ? getCustomerServices(activeCustomer.serviceIds) : [];
  const targetDurationMin = custServices.reduce((sum, s) => sum + s.durationMin, 30);
  const targetDurationSec = targetDurationMin * 60;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / targetDurationSec) * 100));

  return (
    <div className="max-w-md mx-auto px-4 py-6 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 border border-neutral-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Barber Station Switcher Bar */}
      <div className="flex items-center justify-between bg-neutral-100 p-1 rounded-full mb-6 border border-neutral-200">
        {barbers.map((b) => (
          <button
            key={b.id}
            onClick={() => navigate(`/barber/${b.name.toLowerCase()}`)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
              b.id === activeBarber.id
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            {b.name} (Chair #{b.chair})
          </button>
        ))}
      </div>

      {/* Header Strip with Name & Break Toggle */}
      <div className="bg-white border border-neutral-300 rounded-3xl p-6 mb-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img
            src={activeBarber.photo}
            alt={activeBarber.name}
            className="w-14 h-14 rounded-2xl object-cover grayscale contrast-125 border border-neutral-200"
          />
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-950">
              {activeBarber.name}
            </h1>
            <span className="text-xs text-neutral-500 font-mono">
              Workstation Chair #{activeBarber.chair}
            </span>
          </div>
        </div>

        {/* Available / Break Toggle Pill */}
        <button
          onClick={() => toggleBarberBreak(activeBarber.id)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            isOnBreak
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{isOnBreak ? t('barber.onBreak') : t('barber.available')}</span>
        </button>
      </div>

      {/* Break Banner if On Break */}
      {isOnBreak && (
        <div className="bg-neutral-900 text-white p-4 rounded-2xl mb-6 flex items-center gap-3">
          <Coffee className="w-5 h-5 text-red-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block text-red-400">Marked On Break</span>
            You will not receive new customers until you toggle your status back to Available.
          </div>
        </div>
      )}

      {/* CURRENT CUSTOMER CARD */}
      <div className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-7 shadow-sm mb-6">
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold block mb-2 font-mono">
          Current Station Status
        </span>

        {activeCustomer ? (
          <div>
            {/* Token & Status Badge */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-neutral-950">
                {activeCustomer.token}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isCalled ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-black text-white'
              }`}>
                {isCalled ? 'Summoned · Waiting' : 'In Chair · Active'}
              </span>
            </div>

            <div className="text-base font-semibold text-neutral-800 mb-1">
              {activeCustomer.customerName}
            </div>

            {/* Selected Services */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {custServices.map(s => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200"
                >
                  {lang === 'gu' ? s.nameGu : s.nameEn} ({s.durationMin}m)
                </span>
              ))}
            </div>

            {/* In-Chair Running Stopwatch & Linear Progress Bar */}
            {isInChair && (
              <div className="my-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Elapsed Service Time</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-neutral-950">
                    {formatTime(elapsedSeconds)} / {targetDurationMin}:00
                  </div>
                </div>

                <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="pt-2">
              {isCalled && (
                <button
                  onClick={handleStart}
                  className="w-full py-4 rounded-full text-xs uppercase tracking-widest font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t('actions.start')}</span>
                </button>
              )}

              {isInChair && (
                <button
                  onClick={handleDone}
                  className="w-full py-4 rounded-full text-xs uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('actions.done')} / Complete Session</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-400">
            <Scissors className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <div className="font-serif text-lg font-semibold text-neutral-800">
              Chair is Open & Available
            </div>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              Ready for your next client. Reception can summon the next waiting customer.
            </p>
          </div>
        )}
      </div>

      {/* Up Next Preview Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block mb-1">
          Upcoming in Line
        </span>
        {nextUpcoming ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif font-bold text-base text-neutral-900">
                {nextUpcoming.token} · {nextUpcoming.customerName}
              </div>
              <span className="text-xs text-neutral-500">
                {nextUpcoming.preferredBarberId ? 'Requested you specifically' : 'Fastest available customer'}
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
              Next Up
            </span>
          </div>
        ) : (
          <div className="text-xs text-neutral-400 italic">
            No pending customers waiting for your station.
          </div>
        )}
      </div>
    </div>
  );
}
