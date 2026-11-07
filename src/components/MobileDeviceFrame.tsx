import React from 'react';
import { Smartphone, RotateCcw, X, Wifi, Battery, Signal } from 'lucide-react';

interface MobileDeviceFrameProps {
  device: 'android' | 'iphone';
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  device,
  onClose,
  children,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-full shadow-2xl z-50 text-xs">
        <span className="flex items-center gap-1.5 font-bold text-white">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          {device === 'android' ? '🤖 Android (Google Pixel 8 Pro Simülatörü)' : '🍏 iPhone (iPhone 16 Pro Simülatörü)'}
        </span>
        <div className="h-4 w-px bg-slate-700" />
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Gerçek mobil çözünürlük & dokunmatik test
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition ml-2"
          title="Simülatörden Çık"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Realistic Phone Bezel */}
      <div
        className={`relative w-full max-w-[420px] h-[92vh] max-h-[860px] bg-black rounded-[48px] p-3 shadow-2xl border-[5px] transition-all flex flex-col ${
          device === 'iphone'
            ? 'border-slate-800 ring-1 ring-slate-700'
            : 'border-zinc-800 ring-1 ring-zinc-700'
        }`}
      >
        {/* Device Speaker / Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center">
          {device === 'iphone' ? (
            <div className="w-28 h-6 bg-black rounded-full border border-zinc-800 flex items-center justify-end px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-zinc-800" />
          )}
        </div>

        {/* Screen Container */}
        <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-[38px] overflow-hidden flex flex-col">
          {/* Mobile Status Bar */}
          <div className="h-10 px-6 pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200 select-none shrink-0 z-30">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* App Content inside phone scroll container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="h-5 flex items-center justify-center shrink-0 bg-transparent select-none">
            <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
