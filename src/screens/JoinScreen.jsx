import React from 'react';
import { useQueue } from '../context/QueueContext';

export default function JoinScreen() {
  const { t } = useQueue();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-950 mb-2">
          {t('join.title')}
        </h1>
        <p className="text-sm text-neutral-600">
          {t('join.subtitle')}
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8">
        <div className="text-center py-10 text-neutral-400 text-sm">
          [Screen 2: Join Queue — Implementation Scaffolded for Step 2]
        </div>
      </div>
    </div>
  );
}
