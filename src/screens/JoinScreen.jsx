import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { ArrowLeft, Check, AlertCircle, Clock, CheckCircle2, User, Phone, Sparkles } from 'lucide-react';

export default function JoinScreen() {
  const navigate = useNavigate();
  const {
    t,
    lang,
    services,
    barbers,
    isQueueOpen,
    joinQueue,
    getEstimatedWaitMinutes,
    findActiveSpotByPhone
  } = useQueue();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['srv-1']); // Haircut preselected for convenience
  const [selectedBarberId, setSelectedBarberId] = useState(null); // null = "Any barber"

  // Feedback State
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active services list
  const activeServices = services.filter(s => s.active);

  // Selected services calculations
  const selectedServices = activeServices.filter(s => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMin, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.priceInr, 0);
  const estimatedWait = getEstimatedWaitMinutes(totalDuration, selectedBarberId);

  // Show temporary toast message
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle Service selection with 3-service limit enforcement
  const toggleService = (serviceId) => {
    if (selectedServiceIds.includes(serviceId)) {
      if (selectedServiceIds.length === 1) {
        triggerToast('At least 1 service must be selected.');
        return;
      }
      setSelectedServiceIds(prev => prev.filter(id => id !== serviceId));
    } else {
      if (selectedServiceIds.length >= 3) {
        triggerToast(t('join.maxServicesWarning'));
        return;
      }
      setSelectedServiceIds(prev => [...prev, serviceId]);
    }
  };

  // Check if selected barber is on break
  const selectedBarber = barbers.find(b => b.id === selectedBarberId);
  const isSelectedBarberOnBreak = selectedBarber?.status === 'on_break';

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate Name
    if (!customerName.trim() || customerName.trim().length < 2) {
      newErrors.name = 'Please enter a valid full name (at least 2 characters).';
    }

    // Validate Phone (strictly 10 digits)
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    // Validate Services
    if (selectedServiceIds.length === 0) {
      newErrors.services = 'Please select at least 1 service.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Duplicate Phone Check
    const activeSpot = findActiveSpotByPhone(cleanedPhone);
    if (activeSpot) {
      triggerToast(t('join.duplicateActiveWarning'));
      setTimeout(() => {
        navigate(`/status/${activeSpot.id}`);
      }, 1000);
      return;
    }

    // Process Registration
    const result = joinQueue({
      customerName,
      phone: cleanedPhone,
      serviceIds: selectedServiceIds,
      preferredBarberId: selectedBarberId
    });

    if (result.success) {
      navigate(`/status/${result.entry.id}`);
    } else if (result.existingSpot) {
      triggerToast(t('join.duplicateActiveWarning'));
      setTimeout(() => {
        navigate(`/status/${result.existingSpot.id}`);
      }, 1000);
    }
    setIsSubmitting(false);
  };

  if (!isQueueOpen) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center mx-auto mb-4 text-neutral-600">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-normal text-neutral-950 mb-3">
          {t('status.closed')}
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
          {t('queue.closedNotice')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 border border-neutral-700 animate-bounce">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-black uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Salon</span>
        </Link>
      </div>

      {/* Screen Title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-950 font-normal tracking-tight mb-2">
          {t('join.title')}
        </h1>
        <p className="text-sm text-neutral-600 font-sans">
          {t('join.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Details Section */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-4">
            1. Customer Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                {t('join.nameLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('join.namePlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-sans focus:outline-none transition-colors ${
                    errors.name ? 'border-red-500 bg-red-50/20' : 'border-neutral-300 focus:border-black'
                  }`}
                />
                <User className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                {t('join.phoneLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('join.phonePlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-sans focus:outline-none transition-colors ${
                    errors.phone ? 'border-red-500 bg-red-50/20' : 'border-neutral-300 focus:border-black'
                  }`}
                />
                <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        </section>

        {/* Service Selection Section */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              2. {t('join.selectServices')}
            </h2>
            <span className="text-xs font-mono font-medium text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200">
              {selectedServiceIds.length} / 3 Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeServices.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);
              const displayName = lang === 'gu' ? srv.nameGu : srv.nameEn;

              return (
                <div
                  key={srv.id}
                  onClick={() => toggleService(srv.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-black bg-neutral-900 text-white shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-900'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-serif font-semibold text-base mb-1 truncate">
                      {displayName}
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      <span>{srv.durationMin} {t('queue.mins')}</span>
                      <span>·</span>
                      <span className="font-mono font-medium">₹{srv.priceInr}</span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-white text-black border-white'
                        : 'border-neutral-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
          {errors.services && (
            <p className="text-xs text-red-600 mt-2">{errors.services}</p>
          )}
        </section>

        {/* Barber Selection Section */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              3. {t('join.selectBarber')}
            </h2>
          </div>

          {/* Any Barber (Fastest) Card */}
          <div
            onClick={() => setSelectedBarberId(null)}
            className={`cursor-pointer rounded-xl p-4 border mb-3 transition-all flex items-center justify-between ${
              selectedBarberId === null
                ? 'border-black bg-neutral-900 text-white shadow-sm'
                : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-semibold ${
                selectedBarberId === null ? 'bg-white text-black' : 'bg-neutral-100 text-neutral-900'
              }`}>
                ⚡
              </div>
              <div>
                <div className="font-serif font-semibold text-base">
                  {t('barber.any')}
                </div>
                <div className={`text-xs ${selectedBarberId === null ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  First available master barber takes your turn
                </div>
              </div>
            </div>

            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
              selectedBarberId === null
                ? 'border-neutral-700 bg-neutral-800 text-neutral-200'
                : 'border-neutral-200 bg-neutral-100 text-neutral-700'
            }`}>
              {t('join.recommended')}
            </span>
          </div>

          {/* Individual Barbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {barbers.map((b) => {
              const isSelected = selectedBarberId === b.id;
              const isOnBreak = b.status === 'on_break';

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`cursor-pointer rounded-xl p-3 border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-black bg-neutral-900 text-white shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-900'
                  }`}
                >
                  <img
                    src={b.photo}
                    alt={b.name}
                    className="w-11 h-11 rounded-lg object-cover grayscale contrast-125 shrink-0 border border-neutral-300"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-serif font-semibold text-sm truncate">
                      {b.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      Chair #{b.chair}
                    </div>
                    {isOnBreak && (
                      <span className="text-[10px] text-red-400 block font-medium">
                        {t('barber.onBreak')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Break Warning Notice if Selected */}
          {isSelectedBarberOnBreak && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{selectedBarber.name}</strong> {t('barber.breakNotice')}
              </span>
            </div>
          )}
        </section>

        {/* Live Order & Wait Summary Box */}
        <section className="bg-neutral-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <span className="text-xs uppercase tracking-widest text-neutral-400 block mb-1">
                Order & Duration Estimate
              </span>
              <div className="text-xl font-serif font-medium">
                {totalDuration} {t('queue.mins')} <span className="text-neutral-500">·</span> ₹{totalPrice}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs uppercase tracking-widest text-neutral-400 block mb-1">
                {t('common.expectedWait')}
              </span>
              <div className="text-xl font-serif font-semibold text-emerald-400">
                ~{estimatedWait} {t('queue.mins')}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full text-xs uppercase tracking-widest font-semibold bg-white text-black hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <span>{t('join.confirmCta')}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-neutral-500 mt-2.5">
              By joining, you agree to salon arrival rules upon your token call.
            </p>
          </div>
        </section>
      </form>
    </div>
  );
}
