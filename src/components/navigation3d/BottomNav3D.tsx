import React, { useState } from 'react';
import { CustomerScreen } from '../CustomerApp';

interface BottomNav3DProps {
  activeScreen: CustomerScreen;
  onNavigate: (screen: CustomerScreen) => void;
  cartItemCount: number;
}

export const BottomNav3D: React.FC<BottomNav3DProps> = ({
  activeScreen,
  onNavigate,
  cartItemCount,
}) => {
  const [bouncingTab, setBouncingTab] = useState<string | null>(null);

  // Map activeScreen to one of the 5 main tabs
  const getActiveTab = (): 'home' | 'categories' | 'search' | 'cart' | 'profile' => {
    if (activeScreen === 'categories') return 'categories';
    if (activeScreen === 'search') return 'search';
    if (activeScreen === 'cart' || activeScreen === 'payment') return 'cart';
    if (
      activeScreen === 'profile' ||
      activeScreen === 'orders' ||
      activeScreen === 'favorites' ||
      activeScreen === 'price_alerts' ||
      activeScreen === 'shopping_list' ||
      activeScreen === 'product_comparison' ||
      activeScreen === 'support'
    ) {
      return 'profile';
    }
    return 'home';
  };

  const currentTab = getActiveTab();

  const handleTabClick = (tabKey: 'home' | 'categories' | 'search' | 'cart' | 'profile', targetScreen: CustomerScreen) => {
    setBouncingTab(tabKey);
    setTimeout(() => setBouncingTab(null), 400);

    onNavigate(targetScreen);
  };

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E1E9E4] px-2 pt-1 pb-2 sm:pb-3 flex items-center justify-around z-40 shadow-[0_-8px_25px_rgba(0,135,90,0.08)] select-none rounded-t-3xl"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 8px))',
      }}
    >
      {/* ======================================================================= */}
      {/* 1. ANASAYFA (3D Cottage House with Glowing Light) */}
      {/* ======================================================================= */}
      <button
        type="button"
        onClick={() => handleTabClick('home', 'home')}
        className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group min-w-[56px] outline-none"
        aria-label="Anasayfa"
      >
        <div
          className={`relative transition-all duration-300 ease-out flex items-center justify-center ${
            currentTab === 'home'
              ? '-translate-y-2 scale-110 drop-shadow-[0_8px_12px_rgba(0,135,90,0.3)]'
              : 'scale-95 opacity-75 group-hover:opacity-100 group-hover:-translate-y-0.5'
          } ${bouncingTab === 'home' ? 'animate-spring-bounce' : ''}`}
        >
          {/* Active Emerald Glow Aura */}
          {currentTab === 'home' && (
            <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-md -z-10 scale-125 animate-pulse" />
          )}

          {/* 3D House Image from Uploaded Spec */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
            <img
              src="/assets/nav3d/nav_home_trans.png"
              alt="Anasayfa 3D"
              className="w-full h-full object-contain filter drop-shadow-sm"
              loading="eager"
            />
          </div>
        </div>

        {/* Label */}
        <span
          className={`text-[10px] tracking-tight transition-colors duration-200 mt-0.5 leading-none ${
            currentTab === 'home'
              ? 'font-black text-[#00875A]'
              : 'font-bold text-[#68766E] group-hover:text-[#17231D]'
          }`}
        >
          Anasayfa
        </span>

        {/* Active Pill Capsule (Exact design from user image) */}
        {currentTab === 'home' && (
          <div className="w-7 h-1.5 bg-[#00875A] rounded-full shadow-xs mt-1 animate-in zoom-in-75 duration-200" />
        )}
      </button>

      {/* ======================================================================= */}
      {/* 2. KATEGORİLER (4 Glossy 3D Cubes with Market Icons) */}
      {/* ======================================================================= */}
      <button
        type="button"
        onClick={() => handleTabClick('categories', 'categories')}
        className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group min-w-[56px] outline-none"
        aria-label="Kategoriler"
      >
        <div
          className={`relative transition-all duration-300 ease-out flex items-center justify-center ${
            currentTab === 'categories'
              ? '-translate-y-2 scale-110 drop-shadow-[0_8px_12px_rgba(0,135,90,0.3)]'
              : 'scale-95 opacity-75 group-hover:opacity-100 group-hover:-translate-y-0.5'
          } ${bouncingTab === 'categories' ? 'animate-spring-bounce' : ''}`}
        >
          {/* Active Emerald Glow Aura */}
          {currentTab === 'categories' && (
            <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-md -z-10 scale-125 animate-pulse" />
          )}

          {/* 3D 4-Block Category Image */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
            <img
              src="/assets/nav3d/nav_categories_trans.png"
              alt="Kategoriler 3D"
              className="w-full h-full object-contain filter drop-shadow-sm"
              loading="eager"
            />
          </div>
        </div>

        {/* Label */}
        <span
          className={`text-[10px] tracking-tight transition-colors duration-200 mt-0.5 leading-none ${
            currentTab === 'categories'
              ? 'font-black text-[#00875A]'
              : 'font-bold text-[#68766E] group-hover:text-[#17231D]'
          }`}
        >
          Kategoriler
        </span>

        {/* Active Pill Capsule */}
        {currentTab === 'categories' && (
          <div className="w-7 h-1.5 bg-[#00875A] rounded-full shadow-xs mt-1 animate-in zoom-in-75 duration-200" />
        )}
      </button>

      {/* ======================================================================= */}
      {/* 3. ARA (3D Glass Magnifying Glass with Emerald Handle) */}
      {/* ======================================================================= */}
      <button
        type="button"
        onClick={() => handleTabClick('search', 'search')}
        className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group min-w-[56px] outline-none"
        aria-label="Ara"
      >
        <div
          className={`relative transition-all duration-300 ease-out flex items-center justify-center ${
            currentTab === 'search'
              ? '-translate-y-2 scale-110 drop-shadow-[0_8px_12px_rgba(0,135,90,0.3)]'
              : 'scale-95 opacity-75 group-hover:opacity-100 group-hover:-translate-y-0.5'
          } ${bouncingTab === 'search' ? 'animate-spring-bounce' : ''}`}
        >
          {/* Active Emerald Glow Aura */}
          {currentTab === 'search' && (
            <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-md -z-10 scale-125 animate-pulse" />
          )}

          {/* 3D Magnifying Glass Image */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
            <img
              src="/assets/nav3d/nav_search_trans.png"
              alt="Ara 3D"
              className="w-full h-full object-contain filter drop-shadow-sm"
              loading="eager"
            />
          </div>
        </div>

        {/* Label */}
        <span
          className={`text-[10px] tracking-tight transition-colors duration-200 mt-0.5 leading-none ${
            currentTab === 'search'
              ? 'font-black text-[#00875A]'
              : 'font-bold text-[#68766E] group-hover:text-[#17231D]'
          }`}
        >
          Ara
        </span>

        {/* Active Pill Capsule */}
        {currentTab === 'search' && (
          <div className="w-7 h-1.5 bg-[#00875A] rounded-full shadow-xs mt-1 animate-in zoom-in-75 duration-200" />
        )}
      </button>

      {/* ======================================================================= */}
      {/* 4. SEPET (3D Wire Cart with Groceries & Elastic Dynamic Badge) */}
      {/* ======================================================================= */}
      <button
        type="button"
        id="bottom-nav-cart-btn"
        onClick={() => handleTabClick('cart', 'cart')}
        className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group min-w-[56px] outline-none"
        aria-label="Sepet"
      >
        <div
          className={`relative transition-all duration-300 ease-out flex items-center justify-center ${
            currentTab === 'cart'
              ? '-translate-y-2 scale-110 drop-shadow-[0_8px_12px_rgba(0,135,90,0.3)]'
              : 'scale-95 opacity-75 group-hover:opacity-100 group-hover:-translate-y-0.5'
          } ${bouncingTab === 'cart' ? 'animate-spring-bounce' : ''}`}
        >
          {/* Active Emerald Glow Aura */}
          {currentTab === 'cart' && (
            <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-md -z-10 scale-125 animate-pulse" />
          )}

          {/* 3D Shopping Cart Image */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center relative">
            <img
              src="/assets/nav3d/nav_cart_trans.png"
              alt="Sepet 3D"
              className="w-full h-full object-contain filter drop-shadow-sm"
              loading="eager"
            />

            {/* Live Dynamic Badge with Real-time Count & Elastic Bounce */}
            {cartItemCount > 0 && (
              <span
                data-cart-badge="true"
                className="absolute top-0.5 right-0.5 bg-[#00875A] text-white font-black text-[9px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in-95 duration-200 pointer-events-none"
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </div>
        </div>

        {/* Label */}
        <span
          className={`text-[10px] tracking-tight transition-colors duration-200 mt-0.5 leading-none ${
            currentTab === 'cart'
              ? 'font-black text-[#00875A]'
              : 'font-bold text-[#68766E] group-hover:text-[#17231D]'
          }`}
        >
          Sepet
        </span>

        {/* Active Pill Capsule */}
        {currentTab === 'cart' && (
          <div className="w-7 h-1.5 bg-[#00875A] rounded-full shadow-xs mt-1 animate-in zoom-in-75 duration-200" />
        )}
      </button>

      {/* ======================================================================= */}
      {/* 5. HESABIM (3D Glossy Sphere Badge with User Profile & Orbital Rings) */}
      {/* ======================================================================= */}
      <button
        type="button"
        onClick={() => handleTabClick('profile', 'profile')}
        className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group min-w-[56px] outline-none"
        aria-label="Hesabım"
      >
        <div
          className={`relative transition-all duration-300 ease-out flex items-center justify-center ${
            currentTab === 'profile'
              ? '-translate-y-2 scale-110 drop-shadow-[0_8px_12px_rgba(0,135,90,0.3)]'
              : 'scale-95 opacity-75 group-hover:opacity-100 group-hover:-translate-y-0.5'
          } ${bouncingTab === 'profile' ? 'animate-spring-bounce' : ''}`}
        >
          {/* Active Emerald Glow Aura */}
          {currentTab === 'profile' && (
            <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-md -z-10 scale-125 animate-pulse" />
          )}

          {/* 3D Profile Gyro Image */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
            <img
              src="/assets/nav3d/nav_profile_trans.png"
              alt="Hesabım 3D"
              className="w-full h-full object-contain filter drop-shadow-sm"
              loading="eager"
            />
          </div>
        </div>

        {/* Label */}
        <span
          className={`text-[10px] tracking-tight transition-colors duration-200 mt-0.5 leading-none ${
            currentTab === 'profile'
              ? 'font-black text-[#00875A]'
              : 'font-bold text-[#68766E] group-hover:text-[#17231D]'
          }`}
        >
          Hesabım
        </span>

        {/* Active Pill Capsule */}
        {currentTab === 'profile' && (
          <div className="w-7 h-1.5 bg-[#00875A] rounded-full shadow-xs mt-1 animate-in zoom-in-75 duration-200" />
        )}
      </button>

      {/* Global Spring Keyframe CSS */}
      <style>{`
        @keyframes springBounce {
          0% {
            transform: translateY(-8px) scale(1.15);
          }
          40% {
            transform: translateY(-14px) scale(1.22);
          }
          70% {
            transform: translateY(-6px) scale(1.08);
          }
          100% {
            transform: translateY(-8px) scale(1.12);
          }
        }
        .animate-spring-bounce {
          animation: springBounce 380ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spring-bounce {
            animation: none;
          }
        }
      `}</style>
    </nav>
  );
};
