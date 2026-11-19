import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { Scissors, WifiOff } from 'lucide-react';

export default function Header() {
  const { lang, toggleLang, t, isQueueOpen, isOnline } = useQueue();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/join', label: t('nav.join') },
    { to: '/reception', label: t('nav.reception') },
    { to: '/display', label: t('nav.display') },
    { to: '/admin', label: t('nav.admin') },
  ];

  // In TV display mode, header is self-contained
  if (location.pathname === '/display') {
    return null;
  }

  return (
    <>
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Reconnecting to queue... Displayed information may be delayed.</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:scale-105">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-xl tracking-tight font-semibold block leading-none">
                {t('app.title')}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-sans block mt-0.5">
                {t('app.subtitle')}
              </span>
            </div>
          </Link>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-neutral-200">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Status Indicator & Language Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-neutral-200 bg-neutral-50">
              <span className={`w-2 h-2 rounded-full ${isQueueOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-neutral-700">
                {isQueueOpen ? t('status.open') : t('status.closed')}
              </span>
            </div>

            {/* Segmented Monochrome Language Toggle */}
            <button
              onClick={toggleLang}
              type="button"
              className="flex items-center text-xs font-medium bg-neutral-100 border border-neutral-300 rounded-full p-0.5 transition-all focus:outline-none focus:ring-1 focus:ring-black"
              title="Toggle English / Gujarati"
            >
              <span
                className={`px-2.5 py-1 rounded-full transition-all ${
                  lang === 'en'
                    ? 'bg-black text-white shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                EN
              </span>
              <span
                className={`px-2.5 py-1 rounded-full transition-all ${
                  lang === 'gu'
                    ? 'bg-black text-white shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                ગુજરાતી
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
