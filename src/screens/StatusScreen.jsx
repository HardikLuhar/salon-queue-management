import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';

export default function StatusScreen() {
  const { id } = useParams();
  const { t } = useQueue();

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium block mb-2">
          {t('status.yourSpot')}
        </span>
        <h1 className="font-serif text-5xl font-semibold tracking-tight text-neutral-950 mb-3">
          {id?.toUpperCase() || 'S-14'}
        </h1>
        <div className="text-sm text-neutral-600 mb-6">
          [Screen 3: My Status — Implementation Scaffolded for Step 3]
        </div>
      </div>
    </div>
  );
}
