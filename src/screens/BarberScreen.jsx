import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';

export default function BarberScreen() {
  const { name } = useParams();
  const { t } = useQueue();

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center shadow-xs">
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium block mb-1">
          Barber Workstation View
        </span>
        <h1 className="font-serif text-3xl font-semibold capitalize text-neutral-950 mb-4">
          {name || 'Ravi'}
        </h1>
        <div className="text-sm text-neutral-400 py-8">
          [Screen 5: Barber View — Implementation Scaffolded for Step 5]
        </div>
      </div>
    </div>
  );
}
