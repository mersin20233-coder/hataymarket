import React, { useState } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenMobileCenter?: () => void;
  variant?: 'navbar' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenMobileCenter,
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed and running as standalone, don't show the primary install button,
  // but if clicked via mobile center, it's handled.
  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else if (onOpenMobileCenter) {
      onOpenMobileCenter();
    }
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={handleInstall}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl shadow-xl shadow-emerald-900/30 border border-emerald-400/40 text-xs font-bold transition transform hover:scale-105 active:scale-95"
        title="Telefona APK / iOS Olarak Kur"
      >
        <Smartphone className="w-4 h-4 animate-bounce" />
        <span>Telefona Yükle (APK & iOS)</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-md shadow-emerald-950/20 text-xs font-bold transition hover:shadow-lg active:scale-95"
      title="Uygulamayı Android APK veya iPhone'a yükleyin ve test edin"
    >
      {justInstalled ? (
        <>
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Yüklendi!</span>
        </>
      ) : (
        <>
          <Smartphone className="w-3.5 h-3.5" />
          <span>APK & iOS Test</span>
        </>
      )}
    </button>
  );
};
