import React from 'react';
import { useQueue } from '../context/QueueContext';

export default function ReceptionScreen() {
  const { t } = useQueue();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-neutral-950">
            {t('nav.reception')}
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mt-0.5">
            Tablet Master Queue Dashboard
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400 text-sm">
        [Screen 4: Reception Dashboard — Implementation Scaffolded for Step 4]
      </div>
    </div>
  );
}
