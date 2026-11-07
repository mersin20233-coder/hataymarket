import React from 'react';
import { useApp } from '../../../context/AppContext';
import { User, LogIn, ChevronRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onRegister: () => void;
  onLogin: () => void;
  onGuestContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onRegister,
  onLogin,
  onGuestContinue,
}) => {
  const { brandingConfig } = useApp();

  const heroImage = brandingConfig.welcomeHeroImage || '/assets/screens3d/hero_welcome.png';
  const title = brandingConfig.welcomeTitle || 'HatayMarket’e Hoş Geldiniz!';
  const subtitle = brandingConfig.welcomeSubtitle || 'En sevdiğiniz ürünler, en kolay alışveriş deneyimiyle kapınızda.';

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[600px] flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] shadow-2xl border border-emerald-100 select-none animate-in fade-in duration-300">
      {/* 3D Mascot Hero Header */}
      <div className="relative w-full h-[280px] overflow-hidden rounded-t-3xl flex items-center justify-center">
        <img
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover animate-float-gentle"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#087A25] flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3 h-3 text-[#18B900]" />
          Taze & Hızlı
        </div>
      </div>

      {/* Content Body */}
      <div className="px-6 pt-3 pb-8 flex-1 flex flex-col justify-between text-center">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-[#183321] tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-[#183321]/70 leading-relaxed font-medium max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-6">
          {/* Primary: Üye Ol */}
          <button
            type="button"
            onClick={onRegister}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(24,185,0,0.35)] hover:shadow-[0_8px_25px_rgba(24,185,0,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 animate-btn-shine pointer-events-none" />
            <User className="w-4 h-4" />
            <span>Üye Ol</span>
          </button>

          {/* Secondary: Giriş Yap */}
          <button
            type="button"
            onClick={onLogin}
            className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-[#E1E9E4] text-[#183321] hover:border-[#18B900] hover:text-[#087A25] font-extrabold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-[#087A25]" />
            <span>Giriş Yap</span>
          </button>

          {/* Tertiary: Misafir Olarak Devam Et */}
          <button
            type="button"
            onClick={onGuestContinue}
            className="text-xs font-bold text-[#087A25] hover:text-[#18B900] transition-colors inline-flex items-center justify-center gap-1 pt-1.5 cursor-pointer"
          >
            <span>Misafir Olarak Devam Et</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
