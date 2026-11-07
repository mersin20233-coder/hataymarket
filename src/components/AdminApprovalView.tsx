import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StoreApplication, CourierApplication, UserRole } from '../types';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  FileText,
  Store,
  Bike,
  UserCheck,
  DollarSign,
  RotateCcw,
  AlertTriangle,
  Lock,
  Search,
  Users,
  CheckCircle2
} from 'lucide-react';

export const AdminApprovalView: React.FC = () => {
  const {
    users,
    approveUser,
    rejectUser,
    storeApplications,
    courierApplications,
    approveStoreApplication,
    rejectStoreApplication,
    approveCourierApplication,
    rejectCourierApplication,
    orders,
    approveRefund,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'member_approvals' | 'store_apps' | 'courier_apps' | 'refunds' | 'user_roles'>('member_approvals');
  const [selectedCommission, setSelectedCommission] = useState<{ [appId: string]: number }>({});
  const [rejectReason, setRejectReason] = useState<{ [appId: string]: string }>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const pendingUsers = users.filter(u => u.status === 'pending');
  const pendingStores = storeApplications.filter(a => a.status === 'pending');
  const pendingCouriers = courierApplications.filter(a => a.status === 'pending');
  const refundOrders = orders.filter(o => o.refundStatus === 'requested');

  const handleApproveUser = (userId: string) => {
    const res = approveUser(userId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRejectUser = (userId: string) => {
    const res = rejectUser(userId, 'Yönetici tarafından güvenlik/evrak kriterleri gerekçesiyle onaylanmadı.');
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApproveStore = (appId: string) => {
    const rate = selectedCommission[appId] || 10.0;
    const res = approveStoreApplication(appId, rate);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRejectStore = (appId: string) => {
    const reason = rejectReason[appId] || 'Eksik veya geçersiz evrak beyanı.';
    const res = rejectStoreApplication(appId, reason);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApproveCourier = (appId: string) => {
    const res = approveCourierApplication(appId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRejectCourier = (appId: string) => {
    const reason = rejectReason[appId] || 'Sürücü belgesi veya adli sicil kriteri karşılanamadı.';
    const res = rejectCourierApplication(appId, reason);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApproveRefundOrder = (orderId: string) => {
    const res = approveRefund(orderId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Yönetici Onay &amp; İnceleme Masası</h2>
            <p className="text-xs text-slate-400">
              Yeni üye onayları, işletme &amp; kurye başvuruları ve üyelik aktivasyonları
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold flex-wrap">
          {[
            { id: 'member_approvals', label: `Üye Onayları (${pendingUsers.length})`, icon: Users },
            { id: 'store_apps', label: `Market Başvuruları (${pendingStores.length})`, icon: Store },
            { id: 'courier_apps', label: `Kurye Başvuruları (${pendingCouriers.length})`, icon: Bike },
            { id: 'refunds', label: `İade Talepleri (${refundOrders.length})`, icon: RotateCcw },
            { id: 'user_roles', label: 'Tüm Üyeler', icon: UserCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border-b border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {/* TAB 1: PENDING MEMBER APPROVALS */}
        {activeTab === 'member_approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Admin Onayı Bekleyen Üyelikler</h3>
                <p className="text-xs text-slate-500">
                  Sisteme kaydolan kullanıcılar burada listelenir. Siz onaylayana kadar sisteme giriş yapamazlar.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200">
                {pendingUsers.length} Bekleyen Kayıt
              </span>
            </div>

            {pendingUsers.length > 0 ? (
              <div className="space-y-3">
                {pendingUsers.map(u => (
                  <div
                    key={u.id}
                    className="p-4 bg-white border border-amber-200 rounded-xl shadow-xs space-y-3 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                          <span className="text-xs text-slate-500">
                            {u.phone} · {u.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          Talep Rolü: {u.role === 'customer' ? 'Müşteri' : u.role === 'store_owner' ? 'Market' : 'Kurye'}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Onay Bekliyor
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-wrap gap-4">
                      <div>
                        <span className="text-slate-400 font-medium">Kayıt Tarihi: </span>
                        <b>{new Date(u.createdAt).toLocaleString('tr-TR')}</b>
                      </div>
                      {u.addresses?.[0] && (
                        <div>
                          <span className="text-slate-400 font-medium">Kayıtlı Adres: </span>
                          <b>{u.addresses[0].addressLine}, {u.addresses[0].district}</b>
                        </div>
                      )}
                      {u.registrationNotes && (
                        <div>
                          <span className="text-slate-400 font-medium">Not: </span>
                          <span className="text-slate-700 italic">{u.registrationNotes}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => handleRejectUser(u.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        Reddet
                      </button>
                      <button
                        onClick={() => handleApproveUser(u.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hesabı Onayla ve Aktif Et</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                Tebrikler! Şu anda onay bekleyen yeni üye kaydı bulunmuyor. Tüm başvurular güncel.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STORE APPLICATIONS */}
        {activeTab === 'store_apps' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">İşletme &amp; Dark Store Başvuruları</h3>
            {pendingStores.map(app => (
              <div key={app.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.tradeName}</h4>
                    <span className="text-xs text-slate-500 font-mono">VKN: {app.taxNo} · {app.companyLegalName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Onay Bekliyor
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                  <div>Yetkili: <b className="text-slate-900">{app.applicantName}</b></div>
                  <div>Telefon: <b>{app.applicantPhone}</b></div>
                  <div>Bölge: <b>{app.district} / {app.city}</b></div>
                  <div>Kategori: <b>{app.category}</b></div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => handleRejectStore(app.id)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => handleApproveStore(app.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Mağazayı Onayla
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: COURIER APPLICATIONS */}
        {activeTab === 'courier_apps' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Kurye Operatörü Başvuruları</h3>
            {pendingCouriers.map(app => (
              <div key={app.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.applicantName}</h4>
                    <span className="text-xs text-slate-500 font-mono">TCKN: {app.tckn} · Tel: {app.applicantPhone}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Onay Bekliyor
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                  <div>Ehliyet: <b className="text-slate-900">{app.licenseClass}</b></div>
                  <div>Araç: <b>{app.vehicleType}</b></div>
                  <div>Plaka: <b className="font-mono text-slate-900">{app.plateNumber}</b></div>
                  <div>Bölge: <b>{app.district} / {app.city}</b></div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => handleRejectCourier(app.id)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => handleApproveCourier(app.id)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Kuryeyi Onayla ve Aktif Et
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: REFUND REQUESTS */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">İptal ve Ücret İadesi Talepleri</h3>
            {refundOrders.length > 0 ? (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {refundOrders.map(order => (
                  <div key={order.id} className="p-4 bg-white flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">{order.orderNumber}</span>
                        <span className="text-xs text-slate-500">· {order.customer.name}</span>
                      </div>
                      <p className="text-xs text-rose-700 font-semibold mt-0.5">
                        İade Nedeni: "{order.cancellationReason || 'Müşteri talebi'}"
                      </p>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Tutar: {order.totalAmount.toFixed(2)} ₺ ({order.paymentMethod === 'card' ? 'Kredi Kartı' : 'Cüzdan'})
                      </span>
                    </div>

                    <button
                      onClick={() => handleApproveRefundOrder(order.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      İadeyi Onayla &amp; Parayı Aktar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                Şu anda bekleyen iade veya iptal talebi bulunmuyor.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ALL USERS TABLE */}
        {activeTab === 'user_roles' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Sistem Kullanıcıları ve Üyelik Durumları</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Ad Soyad</th>
                    <th className="py-2.5 px-3">İletişim</th>
                    <th className="py-2.5 px-3">Rol</th>
                    <th className="py-2.5 px-3">Durum</th>
                    <th className="py-2.5 px-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{u.phone} · {u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status === 'active' ? 'Aktif' : u.status === 'pending' ? 'Onay Bekliyor' : 'Askıda'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {u.status === 'pending' && (
                          <button
                            onClick={() => handleApproveUser(u.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] cursor-pointer"
                          >
                            Onayla
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
