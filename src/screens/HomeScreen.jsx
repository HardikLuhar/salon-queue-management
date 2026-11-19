import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { Users, Clock, ArrowRight } from 'lucide-react';

export default function HomeScreen() {
  const { t, queue, isQueueOpen, barbers } = useQueue();
  const waitingCount = queue.filter(q => q.status === 'waiting').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium block mb-3">
          {t('status.open')}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-neutral-950 font-normal mb-4">
          {t('hero.tagline')}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 font-sans leading-relaxed">
          {t('hero.description')}
        </p>
      </div>

      {/* Live Queue Metric Placeholder Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
            <Users className="w-6 h-6 text-neutral-900" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-semibold text-neutral-950">
              {waitingCount} {t('queue.peopleWaiting')}
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('queue.approxWait')} ~{waitingCount * 15} {t('queue.mins')}</span>
            </div>
          </div>
        </div>

        <Link
          to="/join"
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
            isQueueOpen
              ? 'bg-black text-white hover:bg-neutral-800 active:scale-95 shadow-sm'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed pointer-events-none'
          }`}
        >
          <span>{t('queue.joinCta')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Barbers Roster Preview */}
      <div className="border-t border-neutral-200 pt-8">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-medium mb-4">
          {t('barber.onDutyTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {barbers.map((b) => (
            <div key={b.id} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
              <img src={b.photo} alt={b.name} className="w-12 h-12 rounded-lg object-cover grayscale" />
              <div>
                <h3 className="font-serif font-semibold text-base">{b.name}</h3>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">
                  {b.status === 'busy' ? t('barber.busy') : b.status === 'available' ? t('barber.available') : t('barber.onBreak')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
