import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CustomerApp } from './components/CustomerApp';
import { CourierApp } from './components/CourierApp';
import { StorePickingApp } from './components/StorePickingApp';
import { AdminPanel } from './components/AdminPanel';
import { AuditorPanel } from './components/AuditorPanel';
import { MerchantPortal } from './components/MerchantPortal';
import { CourierPortal } from './components/CourierPortal';
import { ProfileSecurityView } from './components/ProfileSecurityView';
import { AuthGate } from './components/AuthGate';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileAppInstallModal } from './components/MobileAppInstallModal';
import { testConnection } from './firebase';

const MainContent: React.FC = () => {
  const { activeViewMode, currentUser, isLoggedIn, isGuestBrowsing } = useApp();

  // If not logged in and visitor hasn't opted into guest browsing, show 3D Mascot Onboarding / Entry Experience
  if (!isLoggedIn && !isGuestBrowsing) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center py-2 sm:py-6 px-2">
        <AuthGate isFullScreen={true} />
      </main>
    );
  }

  // If not logged in, visitor is in Guest mode to browse products & recipes freely!
  if (!isLoggedIn) {
    return (
      <main className="max-w-md mx-auto px-2 sm:px-4 py-4 flex-1 flex flex-col justify-center">
        <CustomerApp />
      </main>
    );
  }

  // If customer role, only customer views are allowed
  if (currentUser?.role === 'customer') {
    return (
      <main className="max-w-md mx-auto px-2 sm:px-4 py-4 flex-1 flex flex-col justify-center">
        {activeViewMode === 'profile_security' ? (
          <ProfileSecurityView />
        ) : (
          <CustomerApp />
        )}
      </main>
    );
  }

  // If courier role
  if (currentUser?.role === 'courier') {
    return (
      <main className="max-w-md mx-auto px-2 sm:px-4 py-4 flex-1 flex flex-col justify-center">
        {currentUser.status === 'pending' ? <CourierPortal /> : <CourierApp />}
      </main>
    );
  }

  // If store owner role
  if (currentUser?.role === 'store_owner') {
    return (
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 flex flex-col">
        {currentUser.status === 'pending' ? <MerchantPortal /> : <StorePickingApp />}
      </main>
    );
  }

  // If auditor role
  if (currentUser?.role === 'auditor') {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 flex flex-col">
        <AuditorPanel />
      </main>
    );
  }

  // Default: Admin view
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
      {activeViewMode === 'customer' ? (
        <div className="max-w-md mx-auto w-full">
          <CustomerApp />
        </div>
      ) : (
        <AdminPanel />
      )}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authPromptReason, isMobileModalOpen, setIsMobileModalOpen } = useApp();

  React.useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 relative">
      <Navbar />
      <MainContent />
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <AuthGate onClose={closeAuthModal} reasonMessage={authPromptReason || undefined} />
        </div>
      )}
      <MobileAppInstallModal isOpen={isMobileModalOpen} onClose={() => setIsMobileModalOpen(false)} />
      <OfflineIndicator />

      {/* Clean, authentic delivery app footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="font-medium text-slate-600">
            <span className="font-bold text-[#00875A]">HatayMarket</span> © 2026 · Hatay'ın Bereketli Sofralarına 15 Dakikada Taze & Hızlı Teslimat
          </div>
          <div className="text-[11px] text-slate-400">
            Akıllı Alışveriş Asistanı &amp; Q-Commerce Platformu · Tüm Hakları Saklıdır
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
