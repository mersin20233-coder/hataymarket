import React from 'react';
import { useApp } from '../../../context/AppContext';
import { ShoppingBag, ArrowRight, User, LogIn, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  onRegister?: () => void;
  onLogin?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  onRegister,
  onLogin,
}) => {
  const { brandingConfig } = useApp();

  const heroImage =
    brandingConfig.splashHeroImage ||
    '/assets/aistudio/HatayMarket_Uygulama_Ekranlar__53745b3b.png';
  const title = brandingConfig.splashTitle || "HatayMarket'e Hoş Geldin!";
  const subtitle = brandingConfig.splashSubtitle || 'Artık alışveriş yapmaya hazırsın.';

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[600px] flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] shadow-2xl border border-emerald-100 select-none animate-in fade-in duration-300">
      {/* 3D Mascot Hero Graphic (From uploaded design HatayMarket_Uygulama_Ekranlar__53745b3b.png) */}
      <div className="relative w-full overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#E9FFE5] to-white flex items-center justify-center pt-2">
        <div className="relative w-full h-[270px] overflow-hidden flex items-center justify-center">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-contain animate-float-gentle"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#087A25] flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#18B900]" />
            15 Dakikada Teslimat
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-1 pb-6 flex-1 flex flex-col justify-between text-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#183321] tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-[#183321]/75 mt-1 font-medium">
            {subtitle}
          </p>

          {/* Primary Action Button: Alışverişe Başla */}
          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={onFinish}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(24,185,0,0.35)] hover:shadow-[0_8px_25px_rgba(24,185,0,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 animate-btn-shine pointer-events-none" />
              <ShoppingBag className="w-4 h-4" />
              <span>Alışverişe Başla</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick Login / Register pills */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onRegister && (
                <button
                  type="button"
                  onClick={onRegister}
                  className="py-2.5 px-3 rounded-xl bg-white border border-[#E1E9E4] hover:border-[#18B900] hover:text-[#087A25] text-xs font-bold text-[#183321] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#087A25]" />
                  <span>Üye Ol</span>
                </button>
              )}
              {onLogin && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="py-2.5 px-3 rounded-xl bg-white border border-[#E1E9E4] hover:border-[#18B900] hover:text-[#087A25] text-xs font-bold text-[#183321] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#087A25]" />
                  <span>Giriş Yap</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Shopping Cart Badge */}
        <div className="w-full h-[115px] overflow-hidden flex items-center justify-center -mb-2 mt-2">
          <img
            src={brandingConfig.successCartBadgeImage || '/assets/screens3d/badge_success_cart.png'}
            alt="Market Sepeti"
            className="w-full h-full object-contain filter drop-shadow-md animate-pulse"
          />
        </div>
      </div>
    </div>
  );
};
