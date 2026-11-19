import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';

export default function DisplayScreen() {
  const { t } = useQueue();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
        <div>
          <span className="font-serif text-2xl font-bold tracking-wider block">
            {t('app.title')}
          </span>
          <span className="text-xs uppercase tracking-widest text-neutral-400">
            Waiting Area Live TV Display
          </span>
        </div>
        <Link to="/" className="text-xs text-neutral-400 hover:text-white underline">
          Exit to Home
        </Link>
      </div>

      <div className="py-24 text-center text-neutral-500 font-serif text-xl">
        [Screen 6: Waiting Area TV Display — Implementation Scaffolded for Step 5]
      </div>
    </div>
  );
}
