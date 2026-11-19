import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { Scissors, Clock, Volume2, ArrowLeft } from 'lucide-react';

export default function DisplayScreen() {
  const { t, lang, barbers, queue, services, getCustomerServices } = useQueue();

  // Digital Wall Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time for Clock
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Track newly called token to flash & play chime
  const prevCalledIdRef = useRef(null);
  const [calledAlertBanner, setCalledAlertBanner] = useState(null);

  // Synthesized Web Audio API Chime (Two-tone D5 -> A5)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Tone 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Tone 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.25);
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio autoplay prevented:', e);
    }
  };

  // Detect newly called customer
  const calledCustomer = queue.find(q => q.status === 'called');
  useEffect(() => {
    if (calledCustomer && calledCustomer.id !== prevCalledIdRef.current) {
      prevCalledIdRef.current = calledCustomer.id;
      const barber = barbers.find(b => b.id === calledCustomer.assignedBarberId);

      setCalledAlertBanner({
        token: calledCustomer.token,
        name: calledCustomer.customerName,
        barberName: barber?.name || 'Master Barber',
        chair: barber?.chair || 1
      });

      playChime();

      // Clear flashing banner after 15 seconds
      const timeout = setTimeout(() => {
        setCalledAlertBanner(null);
      }, 15000);
      return () => clearTimeout(timeout);
    } else if (!calledCustomer) {
      prevCalledIdRef.current = null;
    }
  }, [calledCustomer, barbers]);

  // Next 5 tokens in queue
  const waitingSorted = queue
    .filter(q => q.status === 'waiting')
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
    .slice(0, 5);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white flex flex-col justify-between p-6 lg:p-10 select-none font-sans">
      {/* Newly Called Customer Flash Banner Takeover */}
      {calledAlertBanner && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-white text-black py-4 px-6 shadow-2xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4 mx-auto text-center">
            <span className="font-mono text-2xl font-bold bg-black text-white px-3 py-1 rounded-lg">
              {calledAlertBanner.token}
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold">
              {calledAlertBanner.name} → Please proceed to Chair #{calledAlertBanner.chair} ({calledAlertBanner.barberName})
            </span>
          </div>
        </div>
      )}

      {/* TOP HEADER BAND */}
      <header className="flex items-center justify-between pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shrink-0">
            <Scissors className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-wider leading-none">
              {t('app.title')}
            </h1>
            <span className="text-[11px] tracking-widest uppercase text-neutral-400 font-sans block mt-1">
              Live Salon Queue & Station Display
            </span>
          </div>
        </div>

        {/* Center Live Badge */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs uppercase tracking-widest font-semibold text-neutral-300">
            Live Synchronization Active
          </span>
        </div>

        {/* Digital Clock & Navigation Exit */}
        <div className="flex items-center gap-6">
          <div className="font-mono text-3xl font-bold tracking-widest text-neutral-200">
            {formattedTime}
          </div>
          <Link
            to="/"
            className="text-xs text-neutral-500 hover:text-white underline underline-offset-4"
            title="Exit TV Display"
          >
            Exit TV
          </Link>
        </div>
      </header>

      {/* MAIN SECTION: SERVING NOW (IN CHAIR & CALLED) */}
      <section className="my-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
            {t('common.nowServing')} (Workstation Chairs)
          </h2>
          <span className="text-xs text-neutral-500 font-serif italic">
            Visible from 5 meters
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {barbers.map((b) => {
            const activeCust = queue.find(
              q => q.assignedBarberId === b.id && (q.status === 'in_chair' || q.status === 'called')
            );
            const isCalledThisBarber = activeCust?.status === 'called';
            const isInChairThisBarber = activeCust?.status === 'in_chair';
            const isOnBreak = b.status === 'on_break';
            const isAvailable = !activeCust && !isOnBreak;
            const custServices = activeCust ? getCustomerServices(activeCust.serviceIds) : [];

            return (
              <div
                key={b.id}
                className={`rounded-3xl p-6 lg:p-8 border transition-all flex flex-col justify-between ${
                  isCalledThisBarber
                    ? 'bg-neutral-900 border-white ring-2 ring-white animate-pulse'
                    : isInChairThisBarber
                    ? 'bg-neutral-950 border-neutral-700 shadow-2xl'
                    : isAvailable
                    ? 'bg-neutral-950 border-emerald-900/60'
                    : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                }`}
              >
                {/* Chair & Barber Info */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.photo}
                      alt={b.name}
                      className="w-12 h-12 rounded-xl object-cover grayscale contrast-125 border border-neutral-700"
                    />
                    <div>
                      <div className="font-serif font-bold text-xl text-white">
                        {b.name}
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">
                        Chair #{b.chair}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider ${
                    isCalledThisBarber
                      ? 'bg-amber-400 text-black'
                      : isInChairThisBarber
                      ? 'bg-white text-black'
                      : isAvailable
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-neutral-900 text-neutral-500'
                  }`}>
                    {isCalledThisBarber ? 'Summoned' : isInChairThisBarber ? 'In Chair' : isAvailable ? 'Available' : 'On Break'}
                  </span>
                </div>

                {/* Massive Token Display */}
                <div className="my-8 text-center">
                  {activeCust ? (
                    <div>
                      <div className="text-xs uppercase tracking-widest text-neutral-400 font-mono mb-1">
                        Serving Token
                      </div>
                      <div className="font-serif text-7xl lg:text-8xl font-bold tracking-tight text-white mb-2">
                        {activeCust.token}
                      </div>
                      <div className="text-xl font-medium text-neutral-300">
                        {activeCust.customerName}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {custServices.map(s => (lang === 'gu' ? s.nameGu : s.nameEn)).join(' + ')}
                      </div>
                    </div>
                  ) : isAvailable ? (
                    <div className="py-6">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping mx-auto mb-3" />
                      <div className="font-serif text-3xl font-semibold text-emerald-400">
                        Station Ready
                      </div>
                      <span className="text-xs text-neutral-500 mt-1 block">
                        Awaiting next customer call
                      </span>
                    </div>
                  ) : (
                    <div className="py-6 text-neutral-600">
                      <div className="font-serif text-3xl font-semibold">
                        On Break
                      </div>
                      <span className="text-xs text-neutral-600 mt-1 block">
                        Station resumes shortly
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-neutral-600 font-mono">
                  {activeCust ? (isCalledThisBarber ? 'Customer requested to proceed to chair' : 'Service currently active') : 'Chair available for FIFO queue'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* UP NEXT STRIP (NEXT 5 TOKENS) */}
      <footer className="pt-4 border-t border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
            {t('common.upNext')} (Next 5 in Queue)
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            {waitingSorted.length} customers in immediate line
          </span>
        </div>

        {waitingSorted.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center text-sm text-neutral-400 font-serif">
            {t('queue.noWaiting')}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {waitingSorted.map((item, idx) => {
              const prefBarber = barbers.find(b => b.id === item.preferredBarberId);

              return (
                <div
                  key={item.id}
                  className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-neutral-500">
                      #{idx + 1} in line
                    </span>
                    <span className="text-[10px] uppercase font-mono text-neutral-400">
                      {prefBarber ? prefBarber.name : 'Any'}
                    </span>
                  </div>

                  <div className="font-serif text-3xl font-bold text-white mb-1">
                    {item.token}
                  </div>

                  <div className="text-xs font-medium text-neutral-300 truncate">
                    {item.customerName}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </footer>
    </div>
  );
}
