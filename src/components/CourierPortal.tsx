import React from 'react';
import { useApp } from '../context/AppContext';
import { CourierApp } from './CourierApp';
import {
  Bike,
  Clock,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';

export const CourierPortal: React.FC = () => {
  const { currentUser, courierApplications, couriers } = useApp();

  const isApproved = currentUser.status === 'active' && currentUser.role === 'courier';
  const userApplication = courierApplications.find(a => a.userId === currentUser.id);

  // If Courier is still pending Admin approval, show onboarding status gate
  if (!isApproved) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto border border-blue-200">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Kurye Başvurunuz İnceleniyor</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Ehliyet sınıfınız, araç ruhsatınız ve adli sicil kaydınız operasyon yöneticisi tarafından incelenmektedir.
            <b> Başvurunuz onaylanana kadar sipariş kabul edemezsiniz</b>.
          </p>
        </div>

        {/* Application details card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-800">
                {userApplication?.applicantName || currentUser.name}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              Durum: Evrak İncelemesinde
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>TCKN: <b>{userApplication?.tckn || '28491029384'}</b></div>
            <div>Ehliyet Sınıfı: <b>{userApplication?.licenseClass || 'A2'}</b></div>
            <div>Araç Türü: <b>{userApplication?.vehicleType || 'Motosiklet'}</b></div>
            <div>Plaka: <b className="font-mono text-slate-900">{userApplication?.plateNumber || '34 BRK 890'}</b></div>
          </div>
        </div>

        {/* Verification steps */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700">Güvenlik ve Evrak Doğrulama Adımları:</h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl text-xs overflow-hidden">
            {[
              { title: 'Kimlik ve TCKN Kontrolü', status: 'Doğrulandı' },
              { title: 'Sürücü Belgesi (Ehliyet) Geçerliliği', status: 'Doğrulandı' },
              { title: 'e-Devlet Adli Sicil Kaydı', status: 'Temiz (İncelendi)' },
              { title: 'Kurye Taşıma & İş Güvenliği Sözleşmesi', status: 'Admin Onayı Bekliyor' },
            ].map((step, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between bg-white">
                <span className="text-slate-800 font-medium">{step.title}</span>
                <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" />
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin approval instruction */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Nasıl onaylanabilir?</span>
            <span>
              Yetkili <b>Yönetici (Admin)</b> girişi yaparak <b>Yönetim Masası</b> içerisinden bu kurye adayını tek tıkla onaylayabilir ve anında teslimata başlatabilirsiniz.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If approved, render the interactive Courier Dashboard and Live GPS Route system
  return <CourierApp />;
};
