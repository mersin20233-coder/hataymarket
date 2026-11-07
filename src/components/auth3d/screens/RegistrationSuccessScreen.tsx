import React, { useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import confetti from 'canvas-confetti';
import { ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

interface RegistrationSuccessScreenProps {
  userName?: string;
  onStartShopping: () => void;
}

export const RegistrationSuccessScreen: React.FC<RegistrationSuccessScreenProps> = ({
  userName,
  onStartShopping,
}) => {
  const { brandingConfig } = useApp();
  const heroImage = brandingConfig.successHeroImage || '/assets/screens3d/hero_success.png';
  const cartBadgeImage = brandingConfig.successCartBadgeImage || '/assets/screens3d/badge_success_cart.png';
  const title = brandingConfig.successTitle || 'HatayMarket’e Hoş Geldin!';
  const subtitle = brandingConfig.successSubtitle || 'Artık alışveriş yapmaya hazırsın.';
  useEffect(() => {
    // Burst celebratory green and gold confetti
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#18B900', '#087A25', '#22C55E', '#F59E0B', '#FFFFFF'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#18B900', '#087A25', '#F59E0B'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#18B900', '#087A25', '#F59E0B'],
        });
      }, 350);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[600px] flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] shadow-2xl border border-emerald-100 select-none animate-in fade-in duration-300">
      {/* 3D Celebrating Mascot Header */}
      <div className="relative w-full overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#E9FFE5] to-white">
        <div className="w-full h-[250px] overflow-hidden flex items-center justify-center">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover animate-float-gentle"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-1 pb-6 flex-1 flex flex-col justify-between text-center">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-[#087A25] text-xs font-black mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#18B900]" />
            Tebrikler!
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#183321] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-[#183321]/75 mt-1 font-medium">
            {userName ? `Harika, ${userName}! ` : ''}{subtitle}
          </p>

          {/* Action Button: Alışverişe Başla */}
          <div className="mt-5">
            <button
              type="button"
              onClick={onStartShopping}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(24,185,0,0.35)] hover:shadow-[0_8px_25px_rgba(24,185,0,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 animate-btn-shine pointer-events-none" />
              <ShoppingBag className="w-4 h-4" />
              <span>Alışverişe Başla</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom Full Shopping Cart Badge */}
        <div className="w-full h-[120px] overflow-hidden flex items-center justify-center -mb-2 mt-2">
          <img
            src={cartBadgeImage}
            alt="Dolu Alışveriş Sepeti"
            className="w-full h-full object-contain filter drop-shadow-md animate-pulse"
          />
        </div>
      </div>
    </div>
  );
};
