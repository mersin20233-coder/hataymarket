import React from 'react';
import { CustomerApp } from './CustomerApp';
import { CourierApp } from './CourierApp';
import { StorePickingApp } from './StorePickingApp';
import { AdminPanel } from './AdminPanel';
import { Smartphone, Bike, PackageCheck, LayoutDashboard } from 'lucide-react';

export const SplitOrchestrator: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      {/* Informational Orchestrator Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Çoklu Cihaz Canlı Simülasyon Ekranı (Unified 4-Node Orchestrator)</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
              TAM SENKRONİZE
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Müşteri telefonundan sipariş verin; anında Depo ekranına düşüşünü, personelin toplamasını ve Kurye navigasyonundaki canlı GPS takibini izleyin!
          </p>
        </div>
      </div>

      {/* 2x2 Grid or 4 Columns responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Node 1: Customer Mobile App */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-700">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>1. Müşteri Mobil Uygulaması (iOS / Android)</span>
          </div>
          <CustomerApp />
        </div>

        {/* Node 2: Courier Mobile App */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-700">
            <Bike className="w-4 h-4 text-emerald-600" />
            <span>2. Kurye Uygulaması & Navigasyon (Canlı GPS)</span>
          </div>
          <CourierApp />
        </div>

        {/* Node 3: Dark Store Picking Terminal (Full width) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-700">
            <PackageCheck className="w-4 h-4 text-amber-600" />
            <span>3. Depo / Mağaza Sipariş Toplama İstasyonu (Picking Station)</span>
          </div>
          <StorePickingApp />
        </div>

        {/* Node 4: Admin Dashboard (Full width) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-700">
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span>4. Yönetim Kokpiti & Canlı Raporlar</span>
          </div>
          <AdminPanel />
        </div>
      </div>
    </div>
  );
};
