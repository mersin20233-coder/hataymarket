import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  X,
  Phone,
  Mail,
  ShieldCheck,
  Store,
  Bike,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight,
  KeyRound,
  Building2
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    users,
    setCurrentUser,
    loginCustomer,
    verifySmsOtp,
    registerCustomer,
    loginWithFirebaseEmail,
    registerWithFirebaseEmail,
    loginWithGoogle,
    submitStoreApplication,
    submitCourierApplication,
    addAuditLog,
    setActiveViewMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'customer_login' | 'customer_register' | 'store_portal' | 'courier_portal' | 'admin_login'>('customer_login');

  // Firebase Email/Password State
  const [fbEmail, setFbEmail] = useState('');
  const [fbPassword, setFbPassword] = useState('');
  const [isLoadingFb, setIsLoadingFb] = useState(false);

  // Customer Login State
  const [loginInput, setLoginInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  // Customer Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+90 ');
  const [regEmail, setRegEmail] = useState('');

  // Store Portal State (Login or Apply)
  const [storePortalMode, setStorePortalMode] = useState<'login' | 'apply'>('login');
  const [storeLoginEmail, setStoreLoginEmail] = useState('');
  const [storeLoginPass, setStoreLoginPass] = useState('');

  const [storeLegalName, setStoreLegalName] = useState('');
  const [storeTradeName, setStoreTradeName] = useState('');
  const [storeTaxNo, setStoreTaxNo] = useState('');
  const [storeTaxOffice, setStoreTaxOffice] = useState('');
  const [storeTradeRegistry, setStoreTradeRegistry] = useState('');
  const [storeIban, setStoreIban] = useState('TR');
  const [storeCategory, setStoreCategory] = useState('Süpermarket & Manav');
  const [storeApplicantName, setStoreApplicantName] = useState('');
  const [storePhone, setStorePhone] = useState('+90 ');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeDistrict, setStoreDistrict] = useState('Kadıköy');
  const [storeAddress, setStoreAddress] = useState('');
  const [docTaxCert, setDocTaxCert] = useState(true);
  const [docSignature, setDocSignature] = useState(true);
  const [docActivity, setDocActivity] = useState(true);
  const [docContract, setDocContract] = useState(true);

  // Courier Portal State (Login or Apply)
  const [courierPortalMode, setCourierPortalMode] = useState<'login' | 'apply'>('login');
  const [courierLoginPhone, setCourierLoginPhone] = useState('');
  const [courierLoginPass, setCourierLoginPass] = useState('');

  const [courName, setCourName] = useState('');
  const [courTckn, setCourTckn] = useState('');
  const [courBirthYear, setCourBirthYear] = useState<number>(1999);
  const [courPhone, setCourPhone] = useState('+90 ');
  const [courEmail, setCourEmail] = useState('');
  const [courLicense, setCourLicense] = useState<'A2' | 'B' | 'A1'>('A2');
  const [courVehicle, setCourVehicle] = useState('Motosiklet (Honda PCX 125)');
  const [courPlate, setCourPlate] = useState('34 ABC 123');
  const [courDistrict, setCourDistrict] = useState('Kadıköy');
  const [courAdliClean, setCourAdliClean] = useState(true);
  const [docCriminal, setDocCriminal] = useState(true);
  const [docLicense, setDocLicense] = useState(true);
  const [docRegistration, setDocRegistration] = useState(true);

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('admin@hizlisepet.com');
  const [adminPass, setAdminPass] = useState('••••••••');

  if (!isAuthModalOpen) return null;

  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!isOtpStep) {
      const res = loginCustomer(loginInput);
      setFeedback({ msg: res.message, isError: !res.success });
      if (res.success && res.requiresOtp) {
        setIsOtpStep(true);
      }
    } else {
      const res = verifySmsOtp(otpInput);
      setFeedback({ msg: res.message, isError: !res.success });
      if (res.success) {
        setIsOtpStep(false);
        setLoginInput('');
        setOtpInput('');
        setActiveViewMode('customer');
      }
    }
  };

  const handleCustomerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regEmail.trim()) {
      setFeedback({ msg: 'Lütfen tüm alanları doldurun.', isError: true });
      return;
    }
    const res = registerCustomer(regName, regPhone, regEmail);
    setFeedback({ msg: res.message, isError: !res.success });
    if (res.success) {
      setActiveViewMode('customer');
    }
  };

  const handleStoreLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundStoreUser = users.find(u => u.role === 'store_owner' && (u.email.toLowerCase() === storeLoginEmail.toLowerCase() || storeLoginEmail === ''));
    const targetUser = foundStoreUser || users.find(u => u.role === 'store_owner') || users[1];

    setCurrentUser(targetUser);
    setIsAuthModalOpen(false);
    if (targetUser.status === 'pending') {
      setActiveViewMode('merchant_portal');
    } else {
      setActiveViewMode('merchant_portal');
    }

    addAuditLog({
      actorId: targetUser.id,
      actorName: targetUser.name,
      actorRole: 'store_owner',
      action: 'STORE_OWNER_LOGGED_IN',
      targetType: 'store',
      targetId: targetUser.id,
      details: `${targetUser.name} market işletme paneline giriş yaptı.`,
      ipAddress: '192.168.1.50',
      severity: 'info',
    });
  };

  const handleCourierLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundCourierUser = users.find(u => u.role === 'courier' && (u.phone.includes(courierLoginPhone) || courierLoginPhone === ''));
    const targetUser = foundCourierUser || users.find(u => u.role === 'courier') || users[3];

    setCurrentUser(targetUser);
    setIsAuthModalOpen(false);
    if (targetUser.status === 'pending') {
      setActiveViewMode('courier_portal');
    } else {
      setActiveViewMode('courier');
    }

    addAuditLog({
      actorId: targetUser.id,
      actorName: targetUser.name,
      actorRole: 'courier',
      action: 'COURIER_LOGGED_IN',
      targetType: 'courier',
      targetId: targetUser.id,
      details: `${targetUser.name} kurye paneline oturum açtı.`,
      ipAddress: '192.168.1.51',
      severity: 'info',
    });
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminUser = users.find(u => u.role === 'admin') || users[5];
    setCurrentUser(adminUser);
    setIsAuthModalOpen(false);
    setActiveViewMode('admin');

    addAuditLog({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'admin',
      action: 'ADMIN_AUTHENTICATED',
      targetType: 'system',
      targetId: adminUser.id,
      details: `${adminUser.name} yetkili admin kokpitine giriş yaptı.`,
      ipAddress: '195.175.42.11',
      severity: 'info',
    });
  };

  const handleStoreApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeLegalName || !storeTaxNo || !storeIban) {
      setFeedback({ msg: 'Lütfen ticari unvan, vergi no ve IBAN bilgilerini eksiksiz girin.', isError: true });
      return;
    }

    const res = submitStoreApplication({
      userId: `usr-store-${Date.now()}`,
      applicantName: storeApplicantName || 'İşletme Yetkilisi',
      applicantPhone: storePhone,
      applicantEmail: storeEmail,
      companyLegalName: storeLegalName,
      tradeName: storeTradeName || storeLegalName,
      taxNo: storeTaxNo,
      taxOffice: storeTaxOffice || 'Kadıköy V.D.',
      tradeRegistryNo: storeTradeRegistry || '123456',
      iban: storeIban,
      category: storeCategory,
      city: 'İstanbul',
      district: storeDistrict,
      address: storeAddress || `${storeDistrict}, İstanbul`,
      documents: {
        taxCertificate: docTaxCert,
        signatureCircular: docSignature,
        activityCertificate: docActivity,
        storeContract: docContract,
      },
      commissionRatePct: 10.0,
    });

    setFeedback({ msg: res.message, isError: !res.success });
    if (res.success) setIsAuthModalOpen(false);
  };

  const handleCourierApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courName || !courTckn || !courPlate) {
      setFeedback({ msg: 'Lütfen Ad Soyad, TCKN ve Plaka alanlarını eksiksiz doldurun.', isError: true });
      return;
    }

    const res = submitCourierApplication({
      userId: `usr-cour-${Date.now()}`,
      applicantName: courName,
      applicantPhone: courPhone,
      applicantEmail: courEmail,
      tckn: courTckn,
      birthYear: courBirthYear,
      licenseClass: courLicense,
      vehicleType: courVehicle,
      plateNumber: courPlate,
      city: 'İstanbul',
      district: courDistrict,
      hasAdliSicilClean: courAdliClean,
      documents: {
        criminalRecordDoc: docCriminal,
        driverLicenseDoc: docLicense,
        vehicleRegistrationDoc: docRegistration,
        courierContract: true,
      },
    });

    setFeedback({ msg: res.message, isError: !res.success });
    if (res.success) setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              Q-Commerce Güvenli Kimlik Doğrulama
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">
              Kullanıcı ve Panel Giriş Portalı
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Corporate Portal Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-100 text-xs font-semibold">
          {[
            { id: 'customer_login', label: 'Müşteri Girişi' },
            { id: 'customer_register', label: 'Yeni Müşteri Kaydı' },
            { id: 'store_portal', label: 'Market İşletmesi' },
            { id: 'courier_portal', label: 'Kurye Portalı' },
            { id: 'admin_login', label: 'Yönetici (Admin)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setFeedback(null);
                setIsOtpStep(false);
              }}
              className={`flex-1 py-3 px-2 text-center transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[500px] text-xs">
          {feedback && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs font-medium flex items-center gap-2 ${
                feedback.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {feedback.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* TAB 1: CUSTOMER LOGIN */}
          {activeTab === 'customer_login' && (
            <div className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Müşteri Girişi</h4>
                <p className="text-slate-500 text-[11px]">
                  Firebase Authentication güvencesiyle e-posta, Google veya SMS ile oturum açın.
                </p>
              </div>

              {/* One-Click Google Sign-In */}
              <button
                type="button"
                onClick={async () => {
                  setIsLoadingFb(true);
                  setFeedback(null);
                  const res = await loginWithGoogle();
                  setIsLoadingFb(false);
                  setFeedback({ msg: res.message, isError: !res.success });
                }}
                disabled={isLoadingFb}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isLoadingFb ? 'Google ile bağlanılıyor...' : 'Google ile Giriş Yap (Firebase)'}</span>
              </button>

              <div className="flex items-center gap-2 my-2 text-slate-400 text-[10px]">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span>VEYA E-POSTA / ŞİFRE</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              {/* Firebase Email & Password Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!fbEmail || !fbPassword) {
                    setFeedback({ msg: 'Lütfen e-posta ve şifrenizi girin.', isError: true });
                    return;
                  }
                  setIsLoadingFb(true);
                  setFeedback(null);
                  const res = await loginWithFirebaseEmail(fbEmail, fbPassword);
                  setIsLoadingFb(false);
                  setFeedback({ msg: res.message, isError: !res.success });
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    placeholder="ornek@domain.com"
                    value={fbEmail}
                    onChange={(e) => setFbEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Şifre
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={fbPassword}
                    onChange={(e) => setFbPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 text-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoadingFb}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isLoadingFb ? 'Giriş yapılıyor...' : 'Firebase ile Giriş Yap'}
                </button>
              </form>

              {/* Alternative SMS OTP Collapsible Option */}
              <div className="pt-2 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    const demoCust = users.find(u => u.role === 'customer') || users[0];
                    setCurrentUser(demoCust);
                    setIsAuthModalOpen(false);
                    setActiveViewMode('customer');
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                >
                  Demo Hesabı ile Hızlı Giriş (Şifresiz)
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER REGISTER */}
          {activeTab === 'customer_register' && (
            <div className="space-y-3 max-w-md mx-auto py-2">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-sm font-bold text-slate-900">Yeni Müşteri Kaydı (Firebase Auth)</h4>
                <p className="text-slate-500 text-[11px]">
                  Bulut veritabanında hesabınızı oluşturun, favorileriniz ve siparişleriniz her cihazda korunsun.
                </p>
              </div>

              {/* One-Click Google Sign-Up */}
              <button
                type="button"
                onClick={async () => {
                  setIsLoadingFb(true);
                  setFeedback(null);
                  const res = await loginWithGoogle();
                  setIsLoadingFb(false);
                  setFeedback({ msg: res.message, isError: !res.success });
                }}
                disabled={isLoadingFb}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isLoadingFb ? 'Google ile bağlanılıyor...' : 'Google ile Kayıt Ol'}</span>
              </button>

              <div className="flex items-center gap-2 my-2 text-slate-400 text-[10px]">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span>VEYA E-POSTA İLE ÜYE OL</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!regName.trim() || !regEmail.trim() || !fbPassword.trim()) {
                    setFeedback({ msg: 'Lütfen ad, e-posta ve şifre alanlarını doldurun.', isError: true });
                    return;
                  }
                  setIsLoadingFb(true);
                  setFeedback(null);
                  const res = await registerWithFirebaseEmail(regEmail, fbPassword, regName, regPhone, 'customer');
                  setIsLoadingFb(false);
                  setFeedback({ msg: res.message, isError: !res.success });
                }}
                className="space-y-2.5"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Telefon</label>
                    <input
                      type="text"
                      placeholder="+90 5XX XXX XX XX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">E-posta</label>
                    <input
                      type="email"
                      placeholder="ornek@posta.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Şifre (En az 6 karakter)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={fbPassword}
                    onChange={(e) => setFbPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500"
                    minLength={6}
                    required
                  />
                </div>

                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Hesabınız Cloud Firestore'da şifreli olarak korunacaktır.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoadingFb}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isLoadingFb ? 'Kayıt yapılıyor...' : 'Firebase Hesabı Oluştur'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: STORE PORTAL (LOGIN OR APPLY) */}
          {activeTab === 'store_portal' && (
            <div className="space-y-4 max-w-lg mx-auto py-1">
              <div className="flex border border-slate-200 bg-slate-50 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStorePortalMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    storePortalMode === 'login' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mevcut Market Girişi
                </button>
                <button
                  type="button"
                  onClick={() => setStorePortalMode('apply')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    storePortalMode === 'apply' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yeni İşletme Başvurusu
                </button>
              </div>

              {storePortalMode === 'login' ? (
                <form onSubmit={handleStoreLoginSubmit} className="space-y-3">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Market İşletme Paneli Girişi</h4>
                    <p className="text-slate-500 text-[11px]">
                      Onaylı mağazanızın ürün, stok, fiyat ve hak ediş yönetim paneline erişin.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kayıtlı İşletme E-postası</label>
                    <input
                      type="email"
                      placeholder="ahmet@modagurme.com"
                      value={storeLoginEmail}
                      onChange={(e) => setStoreLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">İşletme Şifresi</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={storeLoginPass}
                      onChange={(e) => setStoreLoginPass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Market Paneline Giriş Yap
                  </button>
                </form>
              ) : (
                <form onSubmit={handleStoreApplySubmit} className="space-y-3">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                    <span className="font-bold block">İşletme Başvuru Kuralları:</span>
                    <span>Admin onayından önce ürün satışı başlatılamaz; vergi levhası ve yetki evrakları incelenecektir.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Şirket Resmi Unvanı</label>
                      <input
                        type="text"
                        placeholder="Örn: Anadolu Gıda A.Ş."
                        value={storeLegalName}
                        onChange={(e) => setStoreLegalName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tabela / Mağaza Adı</label>
                      <input
                        type="text"
                        placeholder="Moda Gurme Şarküteri"
                        value={storeTradeName}
                        onChange={(e) => setStoreTradeName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Vergi No (VKN)</label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="10 Haneli"
                        value={storeTaxNo}
                        onChange={(e) => setStoreTaxNo(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Yetkili Ad Soyad</label>
                      <input
                        type="text"
                        placeholder="Yetkili Kişi"
                        value={storeApplicantName}
                        onChange={(e) => setStoreApplicantName(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">İlçe / Bölge</label>
                      <input
                        type="text"
                        value={storeDistrict}
                        onChange={(e) => setStoreDistrict(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Hak Ediş IBAN</label>
                    <input
                      type="text"
                      placeholder="TR33 0006 2000 ..."
                      value={storeIban}
                      onChange={(e) => setStoreIban(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Başvuruyu Tamamla & Onaya İlet
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: COURIER PORTAL (LOGIN OR APPLY) */}
          {activeTab === 'courier_portal' && (
            <div className="space-y-4 max-w-lg mx-auto py-1">
              <div className="flex border border-slate-200 bg-slate-50 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCourierPortalMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    courierPortalMode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kayıtlı Kurye Girişi
                </button>
                <button
                  type="button"
                  onClick={() => setCourierPortalMode('apply')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    courierPortalMode === 'apply' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yeni Kurye Başvurusu
                </button>
              </div>

              {courierPortalMode === 'login' ? (
                <form onSubmit={handleCourierLoginSubmit} className="space-y-3">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Kurye Sistemi Girişi</h4>
                    <p className="text-slate-500 text-[11px]">
                      Aktif siparişleri almak, GPS navigasyonu başlatmak ve teslimat kodlarını doğrulamak için giriş yapın.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kurye Telefon Numarası</label>
                    <input
                      type="text"
                      placeholder="+90 532 891 4421"
                      value={courierLoginPhone}
                      onChange={(e) => setCourierLoginPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Şifre</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={courierLoginPass}
                      onChange={(e) => setCourierLoginPass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Kurye Paneline Giriş Yap
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCourierApplySubmit} className="space-y-3">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                    <span className="font-bold block">Kurye Başvuru Şartları:</span>
                    <span>Adli sicil kaydı ve ehliyet sınıfı operasyon ekibimizce kontrol edilip onaylanacaktır.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Ad Soyad</label>
                      <input
                        type="text"
                        placeholder="Adınız Soyadınız"
                        value={courName}
                        onChange={(e) => setCourName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">T.C. Kimlik No</label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="11 Haneli TCKN"
                        value={courTckn}
                        onChange={(e) => setCourTckn(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Ehliyet Sınıfı</label>
                      <select
                        value={courLicense}
                        onChange={(e) => setCourLicense(e.target.value as 'A2' | 'B' | 'A1')}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="A2">A2 (Motosiklet)</option>
                        <option value="B">B (Ticari/Oto)</option>
                        <option value="A1">A1 (125cc)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Araç Plakası</label>
                      <input
                        type="text"
                        placeholder="34 ABC 123"
                        value={courPlate}
                        onChange={(e) => setCourPlate(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 font-mono uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Bölge</label>
                      <input
                        type="text"
                        value={courDistrict}
                        onChange={(e) => setCourDistrict(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Kurye Başvurusunu Tamamla
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: ADMIN LOGIN */}
          {activeTab === 'admin_login' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5 max-w-md mx-auto py-2">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-1">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Sistem & Operasyon Yönetici Girişi</h4>
                <p className="text-slate-500 text-[11px]">
                  Yalnızca kurucu ve yetkili operasyon sorumlularının erişimine açıktır.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Yönetici E-posta</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-slate-800 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Güvenlik Şifresi</label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-slate-800 text-xs"
                  required
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200">
                Admin kokpitinde tüm üyelerin, marketlerin, kuryelerin hareketleri ve denetim kayıtları izlenebilir.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
              >
                Yönetici Olarak Giriş Yap
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
