import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bike,
  Navigation,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
  BatteryCharging,
  DollarSign,
  Package,
  Camera,
  AlertCircle,
  KeyRound,
  X
} from 'lucide-react';

export const CourierApp: React.FC = () => {
  const {
    couriers,
    activeCourierId,
    setActiveCourierId,
    orders,
    updateOrderStatus,
    advanceCourierProgress,
    verifyDeliveryOtp,
    currentUser,
    updateUserAddress,
    updateUserPassword,
  } = useApp();

  const [otpInput, setOtpInput] = useState('');
  const [proofNote, setProofNote] = useState('Kapıya bırakıldı, zile basıldı.');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);

  // Courier Zone, Address & Password Modal State
  const [isCourierSettingsOpen, setIsCourierSettingsOpen] = useState(false);
  const [courierTab, setCourierTab] = useState<'address' | 'password'>('address');
  const [workDistrict, setWorkDistrict] = useState('Antakya - Sümerler & Saraykent');
  const [resAddressLine, setResAddressLine] = useState(
    currentUser.addresses[0]?.addressLine || 'Atatürk Cad. No: 14 D: 3'
  );
  const [resBuilding, setResBuilding] = useState(currentUser.addresses[0]?.buildingNo || '28');
  const [resApt, setResApt] = useState(currentUser.addresses[0]?.apartmentNo || '4');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [courierFeedback, setCourierFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  const currentCourier = couriers.find(c => c.id === activeCourierId) || couriers[0];
  const activeOrder = orders.find(
    o => o.courierId === currentCourier.id && o.status !== 'delivered' && o.status !== 'cancelled'
  ) || orders.find(o => o.status === 'on_the_way' || o.status === 'picked');

  const handlePickupFromStore = () => {
    if (!activeOrder) return;
    updateOrderStatus(activeOrder.id, 'on_the_way', currentCourier.id);
  };

  const handleStepProgress = (delta: number) => {
    if (!activeOrder) return;
    const next = Math.min(100, Math.max(0, activeOrder.routeProgress + delta));
    advanceCourierProgress(activeOrder.id, next);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setVerificationError(null);
    setVerificationSuccess(null);

    const res = verifyDeliveryOtp(activeOrder.id, otpInput, proofNote);
    if (res.success) {
      setVerificationSuccess(res.message);
      setOtpInput('');
      setIsPhotoCaptured(false);
    } else {
      setVerificationError(res.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 text-white min-h-[780px] shadow-2xl rounded-2xl overflow-hidden border border-slate-800 flex flex-col relative">
      {/* Top Courier Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{currentCourier.name}</h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {currentCourier.rating} ★
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{currentCourier.vehicle} · {currentCourier.plate}</p>
          </div>
        </div>

        {/* Courier switcher dropdown & Bölge/Şifre button */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsCourierSettingsOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-lg border border-slate-700 cursor-pointer font-medium"
              title="Kurye Çalışma Bölgesi & Şifre Değiştir"
            >
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>Bölge/Şifre</span>
            </button>

            <select
              value={activeCourierId}
              onChange={(e) => setActiveCourierId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none focus:border-emerald-500 cursor-pointer"
            >
              {couriers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <BatteryCharging className="w-3 h-3" />
            <span>%{currentCourier.batteryOrFuelPct} Batarya</span>
          </div>
        </div>
      </div>

      {/* Daily Performance & Stats Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-900 border-b border-slate-800 text-center py-2.5">
        <div>
          <span className="text-[10px] text-slate-400 block">Tamamlanan</span>
          <span className="text-sm font-bold text-white font-mono">{currentCourier.completedDeliveries} Paket</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Bugünkü Bahşiş</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">145 ₺</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Tahmini Kazanç</span>
          <span className="text-sm font-bold text-amber-400 font-mono">1.820 ₺</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeOrder ? (
          <div className="space-y-4">
            {/* Active Task Banner */}
            <div className="p-3 bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-800/60 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-400">AKTİF GÖREV: {activeOrder.orderNumber}</span>
                <span className="text-[11px] text-slate-300 font-mono">
                  {activeOrder.status === 'picked' && 'Depodan Teslim Alınmayı Bekliyor'}
                  {activeOrder.status === 'on_the_way' && 'Müşteriye Sürüş Aşamasında'}
                  {activeOrder.status === 'delivered' && 'Teslimat Tamamlandı'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{activeOrder.customer.neighborhood}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{activeOrder.customer.address}</p>
              {activeOrder.customer.notes && (
                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Not: {activeOrder.customer.notes}</span>
                </div>
              )}
            </div>

            {/* Simulated Live Turn-by-Turn Navigation Map */}
            <div className="relative h-56 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
              {/* Dark mode GPS navigation SVG */}
              <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
                <rect width="400" height="220" fill="#0f172a" />
                {/* Roads */}
                <path d="M 0 50 L 400 50 M 0 110 L 400 110 M 0 170 L 400 170" stroke="#1e293b" strokeWidth="8" />
                <path d="M 70 0 L 70 220 M 180 0 L 180 220 M 290 0 L 290 220" stroke="#1e293b" strokeWidth="8" />
                {/* Active GPS Route */}
                <path
                  d="M 70 170 L 180 170 L 180 50 L 290 50"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Turn Instruction HUD */}
              <div className="absolute top-2 left-2 right-2 p-2 bg-slate-900/90 backdrop-blur-xs border border-slate-700 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">200m sonra sağa dön</span>
                    <span className="text-[10px] text-slate-400">Moda Caddesi yönüne</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold block">
                    {Math.max(1, Math.round(activeOrder.estimatedDeliveryMinutes))} dk
                  </span>
                  <span className="text-[10px] text-slate-400">1.2 km</span>
                </div>
              </div>

              {/* Progress bar controller simulation */}
              <div className="absolute bottom-2 left-2 right-2 p-2 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>GPS Sürüş İlerlemesi: %{activeOrder.routeProgress}</span>
                  <span className="text-emerald-400 font-mono">Hız: 32 km/s</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${activeOrder.routeProgress}%` }}
                  />
                </div>
                <div className="flex justify-between gap-2 pt-1">
                  <button
                    onClick={() => handleStepProgress(25)}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded font-medium"
                  >
                    +25% İlerle
                  </button>
                  <button
                    onClick={() => handleStepProgress(100)}
                    className="flex-1 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] rounded font-bold"
                  >
                    Adrese Vardım (%100)
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Quick Call & Package Overview */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Müşteri</span>
                <span className="text-xs font-bold text-white">{activeOrder.customer.name}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{activeOrder.items.length} Paket Parçası</span>
              </div>
              <a
                href={`tel:${activeOrder.customer.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Müşteriyi Ara</span>
              </a>
            </div>

            {/* Courier Step Action Buttons */}
            {activeOrder.status === 'picked' && (
              <button
                onClick={handlePickupFromStore}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Mağazadan Paketi Teslim Aldım (Yola Çık)</span>
              </button>
            )}

            {/* OTP Verification & Proof of Delivery Form */}
            {activeOrder.status === 'on_the_way' && (
              <form
                onSubmit={handleVerifyOtpSubmit}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Teslimat Doğrulama Adımı</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Müşteriden 4 haneli kodu alın</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    Müşteri Teslimat Kodu (OTP):
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Örn: 7412"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-center font-mono text-lg font-bold tracking-widest text-emerald-400 rounded-xl outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    * Simülasyon ipucu: Müşterinin ekranında görünen kod: <b>{activeOrder.deliveryPin}</b>
                  </p>
                </div>

                {/* Proof of delivery photo toggle simulation */}
                <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-300">Kapıda Teslimat Kanıtı</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhotoCaptured(!isPhotoCaptured)}
                    className={`px-2.5 py-1 text-xs rounded font-medium ${
                      isPhotoCaptured
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isPhotoCaptured ? '✓ Fotoğraf Çekildi' : 'Fotoğraf Çek'}
                  </button>
                </div>

                {verificationError && (
                  <p className="text-xs text-red-400 font-medium">{verificationError}</p>
                )}
                {verificationSuccess && (
                  <p className="text-xs text-emerald-400 font-medium">{verificationSuccess}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kodu Doğrula ve Teslimatı Bitir</span>
                </button>
              </form>
            )}

            {activeOrder.status === 'delivered' && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Teslimat Başarıyla Tamamlandı!</h4>
                <p className="text-xs text-slate-300">
                  Paket teslim edildi ve müşteri hesabına onay bildirimi gönderildi.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    Bu Teslimattan Kazanç: +45.00 ₺ (Bahşiş: {activeOrder.tip} ₺)
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Aktif Teslimat Görevi Yok</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Sistem yeni bir sipariş atadığında veya mağaza sipariş hazırladığında rota burada otomatik belirecektir.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* COURIER ZONE / RESIDENCE & PASSWORD CHANGE MODAL */}
      {isCourierSettingsOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-h-[92%] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col text-slate-100">
            {/* Modal Header */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Kurye Paneli: {currentCourier.name}</h3>
                  <p className="text-[10px] text-slate-400">Çalışma bölgesi, ikametgah adresi ve kurye şifresi</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCourierSettingsOpen(false);
                  setCourierFeedback(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setCourierTab('address'); setCourierFeedback(null); }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  courierTab === 'address'
                    ? 'border-emerald-500 text-emerald-400 bg-slate-900 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Bölge & İkametgah</span>
              </button>
              <button
                type="button"
                onClick={() => { setCourierTab('password'); setCourierFeedback(null); }}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  courierTab === 'password'
                    ? 'border-emerald-500 text-emerald-400 bg-slate-900 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>PIN & Şifre Değiştir</span>
              </button>
            </div>

            {/* Feedback message */}
            {courierFeedback && (
              <div
                className={`p-2.5 text-[11px] font-semibold flex items-center gap-2 border-b ${
                  courierFeedback.isError
                    ? 'bg-red-950/80 text-red-300 border-red-800'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                }`}
              >
                {courierFeedback.isError ? <X className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
                <span>{courierFeedback.msg}</span>
              </div>
            )}

            {/* Tab 1: Zone & Address Management */}
            {courierTab === 'address' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!resAddressLine.trim()) return;
                  const targetUserId = currentUser.id || 'usr-cour-1';
                  const addrId = currentUser.addresses[0]?.id || 'addr-cour-1';
                  updateUserAddress(targetUserId, addrId, {
                    title: 'Kurye İkametgah & Çalışma Bölgesi',
                    addressLine: resAddressLine,
                    neighborhood: workDistrict,
                    buildingNo: resBuilding,
                    apartmentNo: resApt,
                  });
                  setCourierFeedback({ msg: 'Kurye çalışma bölgesi ve ikametgah adresi başarıyla güncellendi.', isError: false });
                }}
                className="p-4 space-y-3.5 text-xs overflow-y-auto max-h-[460px]"
              >
                <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 text-[11px]">
                  <span className="font-bold text-white block">Aktif Teslimat Çalışma Alanı:</span>
                  <span>Belirlediğiniz çalışma bölgesindeki siparişler kurye uygulamanıza otomatik atanır.</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Teslimat & Hizmet Bölgesi (Hatay)</label>
                  <select
                    value={workDistrict}
                    onChange={(e) => setWorkDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-200 outline-none focus:border-emerald-500 text-xs"
                  >
                    <option>Antakya - Sümerler & Saraykent</option>
                    <option>Defne - Harbiye & Çekmece</option>
                    <option>İskenderun - Çarşı & Sahil</option>
                    <option>Samandağ - Merkez & Deniz</option>
                    <option>Kırıkhan - Cumhuriyet & Merkez</option>
                    <option>Dörtyol - Sanayi & Çarşı</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Kurye İkametgah Adresi (Cadde / Sokak)</label>
                  <input
                    type="text"
                    value={resAddressLine}
                    onChange={(e) => setResAddressLine(e.target.value)}
                    placeholder="Örn: Dr. Esat Işık Cad. No: 28"
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-200 outline-none focus:border-emerald-500 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Bina No</label>
                    <input
                      type="text"
                      value={resBuilding}
                      onChange={(e) => setResBuilding(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-200 outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Daire No</label>
                    <input
                      type="text"
                      value={resApt}
                      onChange={(e) => setResApt(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-200 outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
                >
                  Bölge ve Adres Bilgilerini Kaydet
                </button>
              </form>
            )}

            {/* Tab 2: Password Change */}
            {courierTab === 'password' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPin.length < 4) {
                    setCourierFeedback({ msg: 'Kurye PIN kodu en az 4 haneli olmalıdır.', isError: true });
                    return;
                  }
                  if (newPin !== confirmPin) {
                    setCourierFeedback({ msg: 'Yeni PIN kodları eşleşmiyor.', isError: true });
                    return;
                  }
                  const res = updateUserPassword(currentUser.id, newPin);
                  setCourierFeedback({ msg: res.message, isError: !res.success });
                  setCurrentPin('');
                  setNewPin('');
                  setConfirmPin('');
                }}
                className="p-4 space-y-3.5 text-xs"
              >
                <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 text-[11px]">
                  <span className="font-bold text-white block">Kurye Cihaz Güvenliği:</span>
                  <span>Teslimat adımlarını onaylarken ve kurye cihazına girişte bu şifre kullanılır.</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Mevcut PIN / Şifre</label>
                  <input
                    type="password"
                    placeholder="••••"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-200 outline-none focus:border-emerald-500 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Yeni Kurye PIN Kodu</label>
                  <input
                    type="password"
                    placeholder="En az 4 haneli PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-200 outline-none focus:border-emerald-500 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Yeni PIN Tekrarı</label>
                  <input
                    type="password"
                    placeholder="Yeni PIN kodunu tekrar girin"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-200 outline-none focus:border-emerald-500 text-xs font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
                >
                  Kurye PIN Kodunu Güncelle
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
