import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  Clock,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Bell,
  XCircle,
  Scissors,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';

export default function StatusScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    t,
    lang,
    barbers,
    queue,
    getCustomer,
    getCustomerServices,
    calculateServicesTotal,
    getCustomerPosition,
    getCustomerWaitTime,
    cancelCustomerSpot,
    setCustomerStatus,
    isAllBarbersOnBreak
  } = useQueue();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasAcknowledgedCall, setHasAcknowledgedCall] = useState(false);

  // Retrieve customer from queue
  const customer = getCustomer(id);

  // If customer doesn't exist, show not found
  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-2">
          {t('status.tokenNotFound')}
        </h1>
        <p className="text-sm text-neutral-600 mb-6">
          Could not find an active queue spot for token #{id}. Please verify your ticket or check in at the reception desk.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 min-h-[48px] rounded-full text-xs uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('actions.returnHome')}</span>
        </Link>
      </div>
    );
  }

  // Calculate position & wait time
  const position = getCustomerPosition(customer.id);
  const estimatedWait = getCustomerWaitTime(customer.id);
  const selectedServices = getCustomerServices(customer.serviceIds);
  const { duration: totalDuration, price: totalPrice } = calculateServicesTotal(customer.serviceIds);

  // Determine assigned or preferred barber
  const assignedBarber = barbers.find(b => b.id === customer.assignedBarberId);
  const preferredBarber = barbers.find(b => b.id === customer.preferredBarberId);
  const targetBarber = assignedBarber || preferredBarber;

  // Trigger vibration when Called state is entered
  useEffect(() => {
    if (customer.status === 'called' && !hasAcknowledgedCall) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([200, 100, 200, 100, 400]);
        } catch (e) {
          // ignore vibration block if user hasn't interacted
        }
      }
    }
  }, [customer.status, hasAcknowledgedCall]);

  // Cancel spot handler
  const handleConfirmCancel = () => {
    cancelCustomerSpot(customer.id);
    setShowCancelModal(false);
  };

  // Helper for ordinal suffix (1st, 2nd, 3rd, 4th)
  const getOrdinalSuffix = (num) => {
    if (num <= 0) return '';
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
  };

  // Circular progress calculation
  // Let progress advance as position approaches 1
  const progressPercent = position <= 0 ? 100 : Math.max(10, Math.min(95, 100 - (position - 1) * 20));
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
      {/* Full-Screen Called Alert Modal Takeover */}
      {customer.status === 'called' && !hasAcknowledgedCall && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 sm:p-10 animate-fade-in">
          <div className="pt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Token Summoned</span>
            </div>

            <div className="font-serif text-7xl font-bold tracking-tight text-white mb-4">
              {customer.token}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-tight max-w-sm mx-auto mb-3">
              {t('status.yourTurn')} <span className="font-semibold underline decoration-white underline-offset-8">{targetBarber?.name || 'Master Barber'}</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 font-sans mt-3">
              {t('status.proceedTo')} #{targetBarber?.chair || '1'}. Your chair is prepared.
            </p>
          </div>

          {/* Assigned Barber Details */}
          {targetBarber && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-4 max-w-xs mx-auto w-full my-6">
              <img
                src={targetBarber.photo}
                alt={targetBarber.name}
                className="w-14 h-14 rounded-xl object-cover grayscale contrast-125 border border-neutral-700"
              />
              <div className="text-left">
                <div className="font-serif font-semibold text-lg text-white">
                  {targetBarber.name}
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  Station Chair #{targetBarber.chair}
                </div>
              </div>
            </div>
          )}

          <div className="pb-8 text-center max-w-sm mx-auto w-full">
            <button
              onClick={() => setHasAcknowledgedCall(true)}
              className="w-full py-4 rounded-full text-xs uppercase tracking-widest font-semibold bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all shadow-xl"
            >
              {t('status.iAmHere')}
            </button>
            <p className="text-[11px] text-neutral-500 mt-3">
              Please present your screen to reception or your barber.
            </p>
          </div>
        </div>
      )}

      {/* Main Status Screen Content */}
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-black uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Salon Home</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active</span>
          </div>
        </div>

        {/* Dynamic Approach Alert (Position === 2) */}
        {customer.status === 'waiting' && position === 2 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-neutral-950 flex items-start gap-3.5 shadow-sm animate-pulse-subtle">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-neutral-950">
                {t('status.startComing')}
              </div>
              <p className="text-xs text-neutral-700 mt-0.5 leading-relaxed">
                Only 1 customer remains ahead of you. Please head toward the salon lobby now.
              </p>
            </div>
          </div>
        )}

        {/* Main Token & Position Card */}
        <div className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
          <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-2">
            {t('status.yourSpot')}
          </div>

          {/* Large Architectural Token Number */}
          <div className="font-serif text-6xl sm:text-7xl font-bold tracking-tight text-neutral-950 my-2">
            {customer.token}
          </div>

          <div className="text-sm font-medium text-neutral-800">
            {customer.customerName}
          </div>

          {/* Selected Services Pill List */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 mb-6">
            {selectedServices.map(s => (
              <span
                key={s.id}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
              >
                {lang === 'gu' ? s.nameGu : s.nameEn}
              </span>
            ))}
            <span className="text-xs text-neutral-400 font-mono">
              (₹{totalPrice})
            </span>
          </div>

          {/* Visual SVG Circular Progress Ring */}
          {customer.status === 'waiting' && (
            <div className="relative w-44 h-44 mx-auto my-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={circleRadius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-neutral-100"
                  fill="transparent"
                />
                {/* Foreground Active Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={circleRadius}
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-black transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-3xl font-serif font-bold text-neutral-950">
                  {getOrdinalSuffix(position)}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                  {t('queue.position')}
                </span>
              </div>
            </div>
          )}

          {/* Subtext metric ahead */}
          {customer.status === 'waiting' && (
            <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-neutral-400" />
                <span>
                  {position > 1 ? `${position - 1} ${t('queue.ahead')}` : t('status.nextInLine')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                <Clock className="w-4 h-4 text-neutral-400" />
                {isAllBarbersOnBreak ? (
                  <span className="text-amber-700 font-semibold">{t('queue.allOnBreak')}</span>
                ) : (
                  <span>~{estimatedWait} {t('queue.mins')}</span>
                )}
              </div>
            </div>
          )}

          {/* In Chair State Display */}
          {customer.status === 'in_chair' && (
            <div className="my-6 p-4 rounded-2xl bg-neutral-900 text-white text-center">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{t('status.inChairNow')}</span>
              </div>
              <div className="font-serif text-xl font-semibold">
                {t('status.receivingService')} {targetBarber?.name || 'Barber'}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {t('status.estDuration')}: {totalDuration} {t('queue.mins')}
              </p>
            </div>
          )}

          {/* Done State Display */}
          {customer.status === 'done' && (
            <div className="my-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-serif text-lg font-bold">
                {t('status.serviceDone')}
              </div>
            </div>
          )}

          {/* Cancelled State Display */}
          {customer.status === 'cancelled' && (
            <div className="my-6 p-5 rounded-2xl bg-neutral-100 border border-neutral-300 text-neutral-700 text-center">
              <XCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <div className="font-serif text-lg font-semibold text-neutral-900">
                {t('status.spotCancelled')}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                This spot is permanently void. You may rejoin whenever you are ready.
              </p>
            </div>
          )}

          {/* No-Show State Display */}
          {customer.status === 'no_show' && (
            <div className="my-6 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="font-serif text-lg font-semibold text-red-900">
                {t('status.noShow')}
              </div>
              <p className="text-xs text-red-700 mt-1">
                {t('status.noShowDesc')}
              </p>
            </div>
          )}
        </div>

        {/* Assigned/Preferred Barber Card Info */}
        {targetBarber && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={targetBarber.photo}
                alt={targetBarber.name}
                className="w-12 h-12 rounded-xl object-cover grayscale contrast-125 border border-neutral-200"
              />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
                  {assignedBarber ? 'Assigned Master Barber' : 'Preferred Barber'}
                </span>
                <div className="font-serif font-semibold text-base text-neutral-900">
                  {targetBarber.name} (Chair #{targetBarber.chair})
                </div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full border border-neutral-200 bg-neutral-50 font-medium">
              {targetBarber.status === 'busy' ? t('barber.busy') : targetBarber.status === 'available' ? t('barber.available') : t('barber.onBreak')}
            </span>
          </div>
        )}

        {/* Cancel Spot Action */}
        {customer.status === 'waiting' && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-medium text-neutral-500 hover:text-red-600 underline underline-offset-4 transition-colors focus:outline-none"
            >
              {t('status.cancelSpot')}
            </button>
          </div>
        )}

        {/* Demo State Simulator Bar (Vibe Coding Utility) */}
        <div className="mt-12 p-4 rounded-2xl bg-neutral-100 border border-neutral-200 text-center">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold block mb-2">
            Developer / Tester Live State Switcher
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCustomerStatus(customer.id, 'waiting', null, { force: true })}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                customer.status === 'waiting' ? 'bg-black text-white font-bold' : 'bg-white border border-neutral-300 text-neutral-700'
              }`}
            >
              Set Waiting
            </button>
            <button
              onClick={() => {
                setHasAcknowledgedCall(false);
                setCustomerStatus(customer.id, 'called', 'barber-2', { force: true }); // Assigned to Amit
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                customer.status === 'called' ? 'bg-black text-white font-bold' : 'bg-white border border-neutral-300 text-neutral-700'
              }`}
            >
              Simulate "Called" (Amit)
            </button>
            <button
              onClick={() => setCustomerStatus(customer.id, 'in_chair', 'barber-2', { force: true })}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                customer.status === 'in_chair' ? 'bg-black text-white font-bold' : 'bg-white border border-neutral-300 text-neutral-700'
              }`}
            >
              Set In Chair
            </button>
            <button
              onClick={() => setCustomerStatus(customer.id, 'done', null, { force: true })}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                customer.status === 'done' ? 'bg-black text-white font-bold' : 'bg-white border border-neutral-300 text-neutral-700'
              }`}
            >
              Set Done
            </button>
          </div>
        </div>
      </div>

      {/* Irreversible Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl border border-neutral-200 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-semibold text-neutral-950 mb-2">
              {t('status.cancelSpot')}
            </h3>

            <p className="text-xs text-neutral-600 leading-relaxed mb-6">
              {t('status.cancelConfirm')}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 min-h-[48px] flex items-center justify-center py-3 rounded-full text-xs font-semibold uppercase tracking-wider border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                {t('actions.keepSpot')}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 min-h-[48px] flex items-center justify-center py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t('actions.yesCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
