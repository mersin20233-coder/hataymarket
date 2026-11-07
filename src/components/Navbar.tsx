import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  LogOut,
  Shield,
  User,
  Store,
  Bike,
  ShieldCheck,
  MapPin,
  LogIn,
  Smartphone
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    openAuthModal,
    logout,
    activeViewMode,
    setActiveViewMode,
    users,
    storeApplications,
    courierApplications,
    setIsMobileModalOpen
  } = useApp();

  const pendingUsersCount = users.filter(u => u.status === 'pending').length;
  const pendingStoresCount = storeApplications.filter(a => a.status === 'pending').length;
  const pendingCouriersCount = courierApplications.filter(a => a.status === 'pending').length;
  const totalPending = pendingUsersCount + pendingStoresCount + pendingCouriersCount;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'customer':
        return { label: 'Müşteri', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'store_owner':
        return { label: 'Market İşletmesi', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'courier':
        return { label: 'Kurye Operatörü', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'admin':
        return { label: 'Sistem Yöneticisi', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'auditor':
        return { label: 'Denetçi', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { label: 'Kullanıcı', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = isLoggedIn
    ? getRoleLabel(currentUser?.role || 'customer')
    : { label: 'Misafir Modu', color: 'bg-slate-100 text-slate-700 border-slate-300' };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00875A] flex items-center justify-center text-white shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-[#17231D]">
                HatayMarket
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
            <p className="text-[10px] text-[#68766E] font-medium hidden sm:block">
              Hatay'ın Bereketli Sofralarına 15 Dakikada Taze & Hızlı Teslimat
            </p>
          </div>
        </div>

        {/* Center: Admin Controls (ONLY VISIBLE IF ADMIN & LOGGED IN) */}
        {isLoggedIn && currentUser?.role === 'admin' && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveViewMode('admin')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeViewMode === 'admin'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Paneli</span>
              {totalPending > 0 && (
                <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {totalPending} Onay
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveViewMode('customer')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeViewMode === 'customer'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Müşteri Ekranı</span>
            </button>
          </div>
        )}

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile App & Google Play Button */}
          <button
            onClick={() => setIsMobileModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#00875A] border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="iOS & Android Paylaş, Yükle ve Google Play Çıktısı Al"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00875A]" />
            <span className="hidden xs:inline">Mobil Uygulama &amp; Paylaş</span>
            <span className="hidden lg:inline text-[10px] bg-[#00875A] text-white px-1.5 py-0.5 rounded font-semibold">
              Google Play &amp; iOS
            </span>
          </button>

          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 text-right">
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {currentUser?.name || 'Giriş Yapan Üye'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {currentUser?.email || currentUser?.phone}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Güvenli Çıkış Yap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => openAuthModal("Sipariş verebilmek veya hesabınızı yönetmek için lütfen üye girişi yapınız.")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Giriş Yap / Kayıt Ol</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
