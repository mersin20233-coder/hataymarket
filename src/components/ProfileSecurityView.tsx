import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAddress } from '../types';
import {
  User,
  MapPin,
  Clock,
  ShieldCheck,
  Key,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle,
  Smartphone,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export const ProfileSecurityView: React.FC = () => {
  const {
    currentUser,
    orders,
    addUserAddress,
    deleteUserAddress,
    setDefaultAddress,
    updateUserAddress,
    updateUserPassword,
    requestRefund,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders_refunds' | 'security'>('addresses');

  // New Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newTitle, setNewTitle] = useState('Evim');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('Caferağa & Moda');
  const [newBuildingNo, setNewBuildingNo] = useState('14');
  const [newFloor, setNewFloor] = useState('2');
  const [newAptNo, setNewAptNo] = useState('5');
  const [newNotes, setNewNotes] = useState('');

  // Refund Modal State
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('Ürün teslimatında gecikme ve eksik teslim.');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Password / Security form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [is2FaEnabled, setIs2FaEnabled] = useState(true);

  const customerOrders = orders.filter(o => o.customerId === currentUser.id || o.customer.name.includes(currentUser.name.split(' ')[0]));

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine.trim()) return;

    addUserAddress({
      title: newTitle,
      addressLine: newAddressLine,
      neighborhood: newNeighborhood,
      district: 'Kadıköy',
      city: 'İstanbul',
      buildingNo: newBuildingNo,
      floor: newFloor,
      apartmentNo: newAptNo,
      notes: newNotes,
      isDefault: currentUser.addresses.length === 0,
    });

    setIsAddingAddress(false);
    setNewAddressLine('');
    setFeedback('Yeni teslimat adresiniz başarıyla kaydedildi.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRequestRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId) return;
    const res = requestRefund(refundOrderId, refundReason);
    setFeedback(res.message);
    setRefundOrderId(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
      {/* Top Profile Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-lg">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{currentUser.name}</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                SMS ONAYLI MÜŞTERİ
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser.phone} · {currentUser.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'addresses', label: `Kayıtlı Adresler (${currentUser.addresses.length})`, icon: MapPin },
            { id: 'orders_refunds', label: 'Sipariş & İade Geçmişi', icon: Clock },
            { id: 'security', label: 'Şifre & Güvenlik (2FA)', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
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

      {/* Main Body */}
      <div className="p-5 flex-1 overflow-y-auto min-h-[460px]">
        {/* TAB 1: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Kayıtlı Teslimat Adreslerim</h3>
                <p className="text-xs text-slate-500">
                  Siparişleriniz için hızlı konum seçimi ve kapı zili notları.
                </p>
              </div>

              <button
                onClick={() => setIsAddingAddress(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Adres Ekle</span>
              </button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentUser.addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${
                    addr.isDefault
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{addr.title}</span>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Varsayılan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium">{addr.addressLine}</p>
                    <p className="text-[11px] text-slate-500">
                      {addr.neighborhood}, {addr.district} / {addr.city}
                    </p>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Bina: {addr.buildingNo} · Kat: {addr.floor} · Daire: {addr.apartmentNo}
                    </div>
                    {addr.notes && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded mt-2 font-medium">
                        Not: {addr.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-emerald-700 hover:underline font-semibold text-[11px]"
                      >
                        Varsayılan Yap
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Birincil Adres</span>
                    )}

                    <button
                      onClick={() => deleteUserAddress(addr.id)}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Address Form Modal */}
            {isAddingAddress && (
              <form
                onSubmit={handleSaveAddress}
                className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs"
              >
                <div className="flex justify-between items-center font-bold text-slate-900 text-xs border-b border-slate-200 pb-2">
                  <span>Yeni Adres Bilgileri</span>
                  <button type="button" onClick={() => setIsAddingAddress(false)} className="text-slate-400">
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Adres Başlığı</label>
                    <select
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option>Evim</option>
                      <option>İş Yeri</option>
                      <option>Yazlık</option>
                      <option>Anne Evi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mahalle</label>
                    <input
                      type="text"
                      value={newNeighborhood}
                      onChange={(e) => setNewNeighborhood(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Açık Adres (Sokak / Cadde)</label>
                  <input
                    type="text"
                    placeholder="Mühürdar Cad. Güneş Apt."
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Bina No</label>
                    <input
                      type="text"
                      value={newBuildingNo}
                      onChange={(e) => setNewBuildingNo(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kat</label>
                    <input
                      type="text"
                      value={newFloor}
                      onChange={(e) => setNewFloor(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Daire No</label>
                    <input
                      type="text"
                      value={newAptNo}
                      onChange={(e) => setNewAptNo(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kurye Notu</label>
                  <input
                    type="text"
                    placeholder="Örn: Zili çalmayın, kapıya bırakın."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                  >
                    Adresi Kaydet
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS & REFUNDS */}
        {activeTab === 'orders_refunds' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Sipariş, Ödeme ve İade Geçmişi</h3>
            <div className="space-y-3">
              {customerOrders.map(order => (
                <div key={order.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 font-mono">{order.orderNumber}</span>
                      <span className="text-slate-400 ml-1.5">
                        · {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status === 'delivered' ? 'Teslim Edildi' : order.status}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-900">
                      Ödenen: {order.totalAmount.toFixed(2)} ₺ ({order.paymentMethod === 'card' ? 'Kredi Kartı' : 'Cüzdan'})
                    </span>

                    {order.refundStatus === 'requested' ? (
                      <span className="text-amber-700 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                        İade Talebi İnceleniyor
                      </span>
                    ) : order.refundStatus === 'approved' ? (
                      <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                        İade Edildi
                      </span>
                    ) : (
                      <button
                        onClick={() => setRefundOrderId(order.id)}
                        className="flex items-center gap-1 text-slate-600 hover:text-red-700 text-xs font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>İade Talebi Aç</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Refund Modal */}
            {refundOrderId && (
              <form onSubmit={handleRequestRefundSubmit} className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-red-900">
                  <span>İade Talebi Oluştur: {refundOrderId}</span>
                  <button type="button" onClick={() => setRefundOrderId(null)} className="text-red-500">✕</button>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Tüketici hakları uyarınca bozulan/hatalı ürünlerde bedel iadesi kartınıza yansıtılır.
                </p>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="İade gerekçenizi yazın..."
                  className="w-full px-3 py-2 border border-red-300 rounded-lg bg-white text-xs outline-none focus:border-red-500"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setRefundOrderId(null)} className="px-3 py-1.5 bg-slate-200 rounded text-slate-700">İptal</button>
                  <button type="submit" className="px-4 py-1.5 bg-red-600 text-white rounded font-bold">Talebi Gönder</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: SECURITY & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-4 max-w-md text-xs">
            <h3 className="text-sm font-bold text-slate-900">Hesap Güvenliği ve İki Adımlı Doğrulama (2FA)</h3>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">SMS ile İki Adımlı Doğrulama (2FA)</span>
                  <span className="text-[11px] text-slate-500">Her oturum açılışında kayıtlı telefonunuza tek kullanımlık şifre iletilir.</span>
                </div>
                <input
                  type="checkbox"
                  checked={is2FaEnabled}
                  onChange={(e) => setIs2FaEnabled(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPass.length < 6) {
                  setFeedback('Yeni şifre en az 6 karakter olmalıdır.');
                  setTimeout(() => setFeedback(null), 3000);
                  return;
                }
                if (newPass !== confirmPass) {
                  setFeedback('Yeni şifreler birbiriyle eşleşmiyor.');
                  setTimeout(() => setFeedback(null), 3000);
                  return;
                }
                const res = updateUserPassword(currentUser.id, newPass);
                setFeedback(res.message);
                setCurrentPass('');
                setNewPass('');
                setConfirmPass('');
                setTimeout(() => setFeedback(null), 3500);
              }}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
            >
              <h4 className="font-bold text-slate-900">Şifre Değiştir</h4>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Mevcut Şifre</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Yeni Güçlü Şifre</label>
                <input
                  type="password"
                  placeholder="En az 6 karakter"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Yeni Şifre Tekrarı</label>
                <input
                  type="password"
                  placeholder="Yeni şifrenizi tekrar girin"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold cursor-pointer transition-colors"
              >
                Şifreyi Güncelle ve Denetime Kaydet
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
