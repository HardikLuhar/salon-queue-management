import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { Users, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomeScreen() {
  const { t, queue, isQueueOpen, barbers, getEstimatedWaitMinutes, isAllBarbersOnBreak } = useQueue();

  // Active waiting customers
  const waitingCustomers = queue.filter(q => q.status === 'waiting');
  const waitingCount = waitingCustomers.length;
  const estimatedWait = getEstimatedWaitMinutes();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14">
      {/* Editorial Headline Hero */}
      <section className="mb-12 sm:mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-medium text-neutral-800 uppercase tracking-widest mb-6">
          <span className={`w-2 h-2 rounded-full ${isQueueOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span>{isQueueOpen ? t('status.open') : t('status.closed')}</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl tracking-tight text-neutral-950 font-normal leading-[1.1] mb-6">
          {t('hero.tagline')}
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 font-sans font-light leading-relaxed max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
      </section>

      {/* Editorial Visual Vignettes (Inspired by Reference) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
        <div className="group relative aspect-[3/4] bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
          <img
            src="/photos/barber-1.avif"
            alt="Short Afro Cut"
            className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
            <span className="text-white text-xs font-serif tracking-wide">Classic Fade</span>
          </div>
        </div>

        <div className="group relative aspect-[3/4] bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
          <img
            src="/photos/cut-1.avif"
            alt="Medium Mullet Cut"
            className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
            <span className="text-white text-xs font-serif tracking-wide">Modern Mullet</span>
          </div>
        </div>

        <div className="group relative aspect-[3/4] bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
          <img
            src="/photos/razor.avif"
            alt="Straight Razor Craft"
            className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              if (!e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = 'true';
                e.currentTarget.src = '/photos/Razor.avif';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
            <span className="text-white text-xs font-serif tracking-wide">Razor Shave</span>
          </div>
        </div>

        <div className="group relative aspect-[3/4] bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
          <img
            src="/photos/cut-2.avif"
            alt="Textured Shag Cut"
            className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
            <span className="text-white text-xs font-serif tracking-wide">Textured Crop</span>
          </div>
        </div>
      </section>

      {/* Live Queue Congestion Card */}
      <section className="bg-white border border-neutral-300 rounded-2xl p-6 sm:p-8 mb-12 shadow-sm transition-all hover:border-black">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
              <Users className="w-7 h-7 text-neutral-900" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 font-medium mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                <span>Live Salon Flow</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-neutral-950">
                {isAllBarbersOnBreak ? (
                  <span className="text-neutral-900">{t('queue.allOnBreak')}</span>
                ) : waitingCount > 0 ? (
                  <>
                    {waitingCount} {t('queue.peopleWaiting')} <span className="text-neutral-400 font-light">·</span> {t('queue.approxWait')} ~{estimatedWait} {t('queue.mins')}
                  </>
                ) : (
                  <span>{t('queue.noWaiting')}</span>
                )}
              </h2>
              <div className="text-xs text-neutral-500 flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Real-time FIFO queue · Updated every 5 seconds</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isQueueOpen ? (
              <Link
                to="/join"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-xs uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all shadow-md group"
              >
                <span>{t('queue.joinCta')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <div className="flex flex-col items-center sm:items-end">
                <button
                  disabled
                  className="px-8 py-4 rounded-full text-xs uppercase tracking-widest font-semibold bg-neutral-200 text-neutral-400 cursor-not-allowed"
                >
                  {t('queue.joinCta')}
                </button>
                <span className="text-[11px] text-neutral-500 mt-1.5 text-center sm:text-right">
                  {t('queue.closedNotice')}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Barbers on Duty Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-200">
          <h2 className="text-xs uppercase tracking-widest text-neutral-600 font-semibold">
            {t('barber.onDutyTitle')}
          </h2>
          <span className="text-xs text-neutral-500 font-serif italic">
            Individual Chair Availability
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {barbers.map((b) => {
            const isBusy = b.status === 'busy';
            const isAvailable = b.status === 'available';
            const isOnBreak = b.status === 'on_break';

            return (
              <div
                key={b.id}
                className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 transition-all hover:border-black hover:shadow-md group"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 shadow-2xs">
                  <img
                    src={b.photo}
                    alt={b.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 mb-2">
                    <span className="text-[10px] tracking-widest text-neutral-400 uppercase font-mono font-medium">
                      Chair #{b.chair}
                    </span>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-neutral-900 truncate">
                      {b.name}
                    </h3>
                  </div>

                  {isBusy && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 text-white">
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
            );
          })}
        </div>
      </section>

      {/* Editorial Philosophy Statement */}
      <section className="border-t border-neutral-200 pt-10 text-center max-w-xl mx-auto text-neutral-500 text-xs tracking-wide font-sans leading-relaxed">
        <p>
          "We believe a great haircut is about more than style: it is about structure, detail, and personal expression. Every element is curated to provide a seamless and premium grooming experience."
        </p>
      </section>
    </div>
  );
}
