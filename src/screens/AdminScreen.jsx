import React from 'react';
import { useQueue } from '../context/QueueContext';

export default function AdminScreen() {
  const { t } = useQueue();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-neutral-950">
            {t('nav.admin')}
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mt-0.5">
            Salon Operations & Catalog
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400 text-sm">
        [Screen 7: Owner Settings — Implementation Scaffolded for Step 6]
      </div>
    </div>
  );
}
