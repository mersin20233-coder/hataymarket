import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Camera,
  Eye,
  Smartphone,
  Check,
  ChevronRight,
  ShieldCheck,
  Mail,
  Lock,
  Gift,
  User,
  LogIn,
  Key,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

type ScreenKey =
  | 'splash'
  | 'welcome'
  | 'register'
  | 'login'
  | 'phone_verify'
  | 'email_verify'
  | 'forgot_password'
  | 'success';

interface ScreenMeta {
  key: ScreenKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const SCREENS_LIST: ScreenMeta[] = [
  {
    key: 'splash',
    label: 'Açılış Ekranı (Splash)',
    icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
    description: 'Uygulama ilk açıldığında karşılayan kutlama ve hoş geldin ekranı',
  },
  {
    key: 'welcome',
    label: 'Hoş Geldiniz Ekranı',
    icon: <User className="w-4 h-4 text-emerald-600" />,
    description: 'Maskot poşetli karşılama, Üye Ol / Giriş Yap / Misafir seçim ekranı',
  },
  {
    key: 'register',
    label: 'Üyelik / Kayıt Ol Ekranı',
    icon: <Gift className="w-4 h-4 text-emerald-600" />,
    description: '3D hediye kutulu yeni üye kayıt formu ekranı',
  },
  {
    key: 'login',
    label: 'Giriş Ekranı',
    icon: <LogIn className="w-4 h-4 text-emerald-600" />,
    description: 'Telefonlu maskot, şifre ve sosyal giriş ekranı',
  },
  {
    key: 'phone_verify',
    label: 'Telefon Doğrulama Ekranı',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
    description: '3D yeşil güvenlik kalkanı ve 6 haneli OTP SMS doğrulama ekranı',
  },
  {
    key: 'email_verify',
    label: 'E-Posta Doğrulama Ekranı',
    icon: <Mail className="w-4 h-4 text-emerald-600" />,
    description: '3D zarf ve onay bağlantısı gönderim ekranı',
  },
  {
    key: 'forgot_password',
    label: 'Şifremi Unuttum Ekranı',
    icon: <Key className="w-4 h-4 text-emerald-600" />,
    description: '3D yeşil kilit ve altın anahtarlı şifre sıfırlama ekranı',
  },
  {
    key: 'success',
    label: 'Kayıt Başarılı / Kutlama',
    icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
    description: 'Kutlayan maskot, konfetiler ve dolu market arabası ekranı',
  },
];

export const AppBrandingManagementView: React.FC = () => {
  const { brandingConfig, updateBrandingConfig, resetBrandingConfig } = useApp();

  // Active Screen being edited
  const [activeScreenTab, setActiveScreenTab] = useState<ScreenKey>('splash');

  // Form State for Hero Images
  const [splashHero, setSplashHero] = useState(
    brandingConfig.splashHeroImage || '/assets/aistudio/HatayMarket_Uygulama_Ekranlar__53745b3b.png'
  );
  const [welcomeHero, setWelcomeHero] = useState(
    brandingConfig.welcomeHeroImage || '/assets/screens3d/hero_welcome.png'
  );
  const [registerHero, setRegisterHero] = useState(
    brandingConfig.registerHeroImage || '/assets/screens3d/hero_register.png'
  );
  const [loginHero, setLoginHero] = useState(
    brandingConfig.loginHeroImage || '/assets/screens3d/hero_login.png'
  );
  const [phoneHero, setPhoneHero] = useState(
    brandingConfig.phoneVerifyHeroImage || '/assets/screens3d/hero_phone_verify.png'
  );
  const [phoneBadge, setPhoneBadge] = useState(
    brandingConfig.phoneVerifyBadgeImage || '/assets/screens3d/badge_phone_verify.png'
  );
  const [emailHero, setEmailHero] = useState(
    brandingConfig.emailVerifyHeroImage || '/assets/screens3d/hero_email_verify.png'
  );
  const [emailBadge, setEmailBadge] = useState(
    brandingConfig.emailVerifyBadgeImage || '/assets/screens3d/badge_email_verify.png'
  );
  const [forgotHero, setForgotHero] = useState(
    brandingConfig.forgotPasswordHeroImage || '/assets/screens3d/hero_forgot_password.png'
  );
  const [successHero, setSuccessHero] = useState(
    brandingConfig.successHeroImage || '/assets/screens3d/hero_success.png'
  );
  const [successBadge, setSuccessBadge] = useState(
    brandingConfig.successCartBadgeImage || '/assets/screens3d/badge_success_cart.png'
  );

  // Form State for Titles & Subtitles
  const [splashTitle, setSplashTitle] = useState(brandingConfig.splashTitle || "HatayMarket'e Hoş Geldin!");
  const [splashSubtitle, setSplashSubtitle] = useState(brandingConfig.splashSubtitle || 'Artık alışveriş yapmaya hazırsın.');
  const [welcomeTitle, setWelcomeTitle] = useState(brandingConfig.welcomeTitle || 'HatayMarket’e Hoş Geldiniz!');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(brandingConfig.welcomeSubtitle || 'En sevdiğiniz ürünler, en kolay alışveriş deneyimiyle kapınızda.');
  const [registerTitle, setRegisterTitle] = useState(brandingConfig.registerTitle || 'HatayMarket Ailesine Katıl!');
  const [registerSubtitle, setRegisterSubtitle] = useState(brandingConfig.registerSubtitle || 'İlk alışverişine hazır mısın?');
  const [loginTitle, setLoginTitle] = useState(brandingConfig.loginTitle || 'Tekrar Hoş Geldin!');
  const [loginSubtitle, setLoginSubtitle] = useState(brandingConfig.loginSubtitle || 'Alışverişe kaldığın yerden devam et.');
  const [phoneTitle, setPhoneTitle] = useState(brandingConfig.phoneVerifyTitle || 'Telefonunu Doğrula');
  const [phoneSubtitle, setPhoneSubtitle] = useState(brandingConfig.phoneVerifySubtitle || 'Telefon numarana gönderilen doğrulama kodunu gir.');
  const [emailTitle, setEmailTitle] = useState(brandingConfig.emailVerifyTitle || 'E-Posta Adresini Doğrula');
  const [emailSubtitle, setEmailSubtitle] = useState(brandingConfig.emailVerifySubtitle || 'E-posta adresine gönderilen bağlantıya tıklayarak hesabını doğrula.');
  const [forgotTitle, setForgotTitle] = useState(brandingConfig.forgotPasswordTitle || 'Şifreni mi Unuttun?');
  const [forgotSubtitle, setForgotSubtitle] = useState(brandingConfig.forgotPasswordSubtitle || 'Şifreni yenilemek için telefon numaranı veya e-posta adresini gir.');
  const [successTitle, setSuccessTitle] = useState(brandingConfig.successTitle || 'HatayMarket’e Hoş Geldin!');
  const [successSubtitle, setSuccessSubtitle] = useState(brandingConfig.successSubtitle || 'Artık alışveriş yapmaya hazırsın.');

  // Default initial screen
  const [initialScreen, setInitialScreen] = useState<'splash' | 'welcome' | 'register' | 'login' | 'success'>(
    brandingConfig.defaultInitialScreen || 'splash'
  );

  // Notification Status
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Hidden File Inputs Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const badgeFileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload & base64 conversion
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görsel dosyası (PNG, JPG, WEBP, SVG) seçiniz.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setter(result);
        setStatusMsg('Fotoğraf başarıyla yüklendi! Canlıya almak için "Kaydet & Canlıya Al" butonuna basınız.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Preset Gallery
  const PRESET_GALLERY = [
    { label: 'Açılış Kutlama (Görsel)', url: '/assets/aistudio/HatayMarket_Uygulama_Ekranlar__53745b3b.png' },
    { label: 'Kutlayan Maskot', url: '/assets/screens3d/hero_success.png' },
    { label: 'Hoş Geldiniz Maskotu', url: '/assets/screens3d/hero_welcome.png' },
    { label: '3D Hediye Kutusu', url: '/assets/screens3d/hero_register.png' },
    { label: 'Telefonlu Maskot', url: '/assets/screens3d/hero_login.png' },
    { label: '3D Güvenlik Kalkanı', url: '/assets/screens3d/hero_phone_verify.png' },
    { label: '3D Mektup Zarfı', url: '/assets/screens3d/hero_email_verify.png' },
    { label: '3D Kilit & Anahtar', url: '/assets/screens3d/hero_forgot_password.png' },
    { label: 'Dolu Market Arabası', url: '/assets/screens3d/badge_success_cart.png' },
  ];

  // Save all changes to Context and Storage
  const handleSaveAll = () => {
    updateBrandingConfig({
      splashHeroImage: splashHero,
      welcomeHeroImage: welcomeHero,
      registerHeroImage: registerHero,
      loginHeroImage: loginHero,
      phoneVerifyHeroImage: phoneHero,
      phoneVerifyBadgeImage: phoneBadge,
      emailVerifyHeroImage: emailHero,
      emailVerifyBadgeImage: emailBadge,
      forgotPasswordHeroImage: forgotHero,
      successHeroImage: successHero,
      successCartBadgeImage: successBadge,

      splashTitle,
      splashSubtitle,
      welcomeTitle,
      welcomeSubtitle,
      registerTitle,
      registerSubtitle,
      loginTitle,
      phoneVerifyTitle: phoneTitle,
      phoneVerifySubtitle: phoneSubtitle,
      emailVerifyTitle: emailTitle,
      emailVerifySubtitle: emailSubtitle,
      forgotPasswordTitle: forgotTitle,
      forgotPasswordSubtitle: forgotSubtitle,
      successTitle,
      successSubtitle,

      defaultInitialScreen: initialScreen,
    });

    setStatusMsg('Tüm ekran görselleri, fotoğraflar ve başlık ayarları başarıyla kaydedildi ve tüm kullanıcılarda canlıya alındı!');
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Reset to original defaults
  const handleResetDefaults = () => {
    if (confirm('Tüm ekran görsellerini ve metinlerini orijinal 3D HatayMarket varsayılanlarına sıfırlamak istediğinize emin misiniz?')) {
      resetBrandingConfig();
      setSplashHero('/assets/aistudio/HatayMarket_Uygulama_Ekranlar__53745b3b.png');
      setWelcomeHero('/assets/screens3d/hero_welcome.png');
      setRegisterHero('/assets/screens3d/hero_register.png');
      setLoginHero('/assets/screens3d/hero_login.png');
      setPhoneHero('/assets/screens3d/hero_phone_verify.png');
      setPhoneBadge('/assets/screens3d/badge_phone_verify.png');
      setEmailHero('/assets/screens3d/hero_email_verify.png');
      setEmailBadge('/assets/screens3d/badge_email_verify.png');
      setForgotHero('/assets/screens3d/hero_forgot_password.png');
      setSuccessHero('/assets/screens3d/hero_success.png');
      setSuccessBadge('/assets/screens3d/badge_success_cart.png');

      setSplashTitle("HatayMarket'e Hoş Geldin!");
      setSplashSubtitle('Artık alışveriş yapmaya hazırsın.');
      setWelcomeTitle('HatayMarket’e Hoş Geldiniz!');
      setWelcomeSubtitle('En sevdiğiniz ürünler, en kolay alışveriş deneyimiyle kapınızda.');
      setRegisterTitle('HatayMarket Ailesine Katıl!');
      setRegisterSubtitle('İlk alışverişine hazır mısın?');
      setLoginTitle('Tekrar Hoş Geldin!');
      setLoginSubtitle('Alışverişe kaldığın yerden devam et.');
      setPhoneTitle('Telefonunu Doğrula');
      setPhoneSubtitle('Telefon numarana gönderilen doğrulama kodunu gir.');
      setEmailTitle('E-Posta Adresini Doğrula');
      setEmailSubtitle('E-posta adresine gönderilen bağlantıya tıklayarak hesabını doğrula.');
      setForgotTitle('Şifreni mi Unuttun?');
      setForgotSubtitle('Şifreni yenilemek için telefon numaranı veya e-posta adresini gir.');
      setSuccessTitle('HatayMarket’e Hoş Geldin!');
      setSuccessSubtitle('Artık alışveriş yapmaya hazırsın.');

      setInitialScreen('splash');

      setStatusMsg('Tüm ekranlar orijinal 3D varsayılanlarına sıfırlandı.');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  // Current active screen config
  const getCurrentHero = () => {
    switch (activeScreenTab) {
      case 'splash': return splashHero;
      case 'welcome': return welcomeHero;
      case 'register': return registerHero;
      case 'login': return loginHero;
      case 'phone_verify': return phoneHero;
      case 'email_verify': return emailHero;
      case 'forgot_password': return forgotHero;
      case 'success': return successHero;
    }
  };

  const setCurrentHero = (val: string) => {
    switch (activeScreenTab) {
      case 'splash': setSplashHero(val); break;
      case 'welcome': setWelcomeHero(val); break;
      case 'register': setRegisterHero(val); break;
      case 'login': setLoginHero(val); break;
      case 'phone_verify': setPhoneHero(val); break;
      case 'email_verify': setEmailHero(val); break;
      case 'forgot_password': setForgotHero(val); break;
      case 'success': setSuccessHero(val); break;
    }
  };

  const getCurrentTitle = () => {
    switch (activeScreenTab) {
      case 'splash': return splashTitle;
      case 'welcome': return welcomeTitle;
      case 'register': return registerTitle;
      case 'login': return loginTitle;
      case 'phone_verify': return phoneTitle;
      case 'email_verify': return emailTitle;
      case 'forgot_password': return forgotTitle;
      case 'success': return successTitle;
    }
  };

  const setCurrentTitle = (val: string) => {
    switch (activeScreenTab) {
      case 'splash': setSplashTitle(val); break;
      case 'welcome': setWelcomeTitle(val); break;
      case 'register': setRegisterTitle(val); break;
      case 'login': setLoginTitle(val); break;
      case 'phone_verify': setPhoneTitle(val); break;
      case 'email_verify': setEmailTitle(val); break;
      case 'forgot_password': setForgotTitle(val); break;
      case 'success': setSuccessTitle(val); break;
    }
  };

  const getCurrentSubtitle = () => {
    switch (activeScreenTab) {
      case 'splash': return splashSubtitle;
      case 'welcome': return welcomeSubtitle;
      case 'register': return registerSubtitle;
      case 'login': return loginSubtitle;
      case 'phone_verify': return phoneSubtitle;
      case 'email_verify': return emailSubtitle;
      case 'forgot_password': return forgotSubtitle;
      case 'success': return successSubtitle;
    }
  };

  const setCurrentSubtitle = (val: string) => {
    switch (activeScreenTab) {
      case 'splash': setSplashSubtitle(val); break;
      case 'welcome': setWelcomeSubtitle(val); break;
      case 'register': setRegisterSubtitle(val); break;
      case 'login': setLoginSubtitle(val); break;
      case 'phone_verify': setPhoneSubtitle(val); break;
      case 'email_verify': setEmailSubtitle(val); break;
      case 'forgot_password': setForgotSubtitle(val); break;
      case 'success': setSuccessSubtitle(val); break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-800/60">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D Ekranlar & Görsel Yönetimi</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Açılış, Üyelik, Giriş ve Doğrulama Ekranları Ayarları
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Müşterilerinizi karşılayan Açılış, Hoş Geldiniz, Üye Ol, Giriş Yap, Telefon/E-Posta Doğrulama ve Şifremi Unuttum ekranlarının görsellerini, fotoğraflarını ve başlıklarını buradan dilediğiniz zaman değiştirebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Varsayılana Sıfırla</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00875A] hover:from-emerald-400 hover:to-[#00744D] text-white text-xs font-black shadow-lg shadow-emerald-900/40 transition-all cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-100" />
            <span>Kaydet & Canlıya Al</span>
          </button>
        </div>
      </div>

      {/* Save Notification */}
      {statusMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-xs text-emerald-700 hover:underline font-extrabold cursor-pointer"
          >
            Tamam
          </button>
        </div>
      )}

      {/* Main Grid: Left Screen Manager & Controls, Right Live Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Screen Tabs & Editor */}
        <div className="lg:col-span-7 space-y-6">

          {/* Screen Selection Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
              Düzenlemek İstediğiniz Ekranı Seçin:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SCREENS_LIST.map((screen) => {
                const isActive = activeScreenTab === screen.key;
                return (
                  <button
                    key={screen.key}
                    type="button"
                    onClick={() => setActiveScreenTab(screen.key)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[70px] ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {screen.icon}
                      {isActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-[11px] leading-tight mt-1 line-clamp-2">
                      {screen.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Screen Editor Card */}
          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {SCREENS_LIST.find((s) => s.key === activeScreenTab)?.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {SCREENS_LIST.find((s) => s.key === activeScreenTab)?.description}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#087A25] font-black text-[10px]">
                  Canlı Düzenleme
                </span>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, setCurrentHero)}
            />

            {/* 1. Hero Image Upload & URL */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Ana Görsel / Fotoğraf:</span>
                <span className="text-[11px] text-slate-400 font-normal">PNG, JPG, WEBP veya SVG</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {/* Image Thumbnail */}
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner p-1">
                  <img
                    src={getCurrentHero()}
                    alt="Hero Önizleme"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2.5 w-full">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Cihazdan Fotoğraf Yükle</span>
                    </button>
                  </div>

                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="veya Görsel URL'si yapıştırın (https://...)"
                      value={getCurrentHero()}
                      onChange={(e) => setCurrentHero(e.target.value)}
                      className="w-full bg-white text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 text-slate-800 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Badge upload for Phone / Email / Success screens */}
            {(activeScreenTab === 'phone_verify' ||
              activeScreenTab === 'email_verify' ||
              activeScreenTab === 'success') && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>
                    {activeScreenTab === 'phone_verify'
                      ? 'Alt Güvenlik Rozeti Görseli:'
                      : activeScreenTab === 'email_verify'
                      ? 'Orta E-Posta Zarf Görseli:'
                      : 'Alt Dolu Market Arabası Görseli:'}
                  </span>
                </label>

                <input
                  type="file"
                  ref={badgeFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (activeScreenTab === 'phone_verify') handleFileUpload(e, setPhoneBadge);
                    if (activeScreenTab === 'email_verify') handleFileUpload(e, setEmailBadge);
                    if (activeScreenTab === 'success') handleFileUpload(e, setSuccessBadge);
                  }}
                />

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="w-20 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner p-1">
                    <img
                      src={
                        activeScreenTab === 'phone_verify'
                          ? phoneBadge
                          : activeScreenTab === 'email_verify'
                          ? emailBadge
                          : successBadge
                      }
                      alt="Alt Rozet"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <button
                      type="button"
                      onClick={() => badgeFileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Alt Rozet İçin Fotoğraf Yükle</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Alt görsel URL'si..."
                      value={
                        activeScreenTab === 'phone_verify'
                          ? phoneBadge
                          : activeScreenTab === 'email_verify'
                          ? emailBadge
                          : successBadge
                      }
                      onChange={(e) => {
                        if (activeScreenTab === 'phone_verify') setPhoneBadge(e.target.value);
                        if (activeScreenTab === 'email_verify') setEmailBadge(e.target.value);
                        if (activeScreenTab === 'success') setSuccessBadge(e.target.value);
                      }}
                      className="w-full bg-white text-xs px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Text Title & Subtitle */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ekran Başlığı:
                </label>
                <input
                  type="text"
                  value={getCurrentTitle()}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alt Açıklama Metni:
                </label>
                <textarea
                  rows={2}
                  value={getCurrentSubtitle()}
                  onChange={(e) => setCurrentSubtitle(e.target.value)}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 text-slate-800 leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* 3. Preset Quick Palettes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Hazır HatayMarket 3D Görsel Paletinden Seç:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_GALLERY.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setCurrentHero(preset.url)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Default Initial Screen Selector (Global) */}
            <div className="space-y-2 pt-3 border-t border-slate-200 bg-emerald-50/60 p-4 rounded-xl">
              <label className="text-xs font-black text-emerald-900 block">
                Uygulama İlk Açıldığında Gösterilecek Varsayılan Ekran:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'splash', label: 'Açılış (Kutlama / Hoş Geldin)' },
                  { id: 'welcome', label: 'Hoş Geldiniz Ekranı' },
                  { id: 'register', label: 'Doğrudan Üye Ol' },
                  { id: 'login', label: 'Doğrudan Giriş Yap' },
                  { id: 'success', label: 'Doğrudan Başarı / Mağaza' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setInitialScreen(opt.id as any)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      initialScreen === opt.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={handleSaveAll}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00875A] hover:from-emerald-500 hover:to-[#00744D] text-white text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Değişiklikleri Canlıya Al</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Interactive Mobile Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-extrabold text-slate-800">
                  Canlı Ekran Önizlemesi: {SCREENS_LIST.find((s) => s.key === activeScreenTab)?.label}
                </span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                Mobil Görünüm
              </span>
            </div>

            {/* Realistic iPhone Bezel Preview */}
            <div className="w-full max-w-[320px] mx-auto rounded-[36px] p-3 bg-slate-900 shadow-2xl border-4 border-slate-800 relative">
              {/* Phone Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-950/80 mr-2" />
                <div className="w-8 h-1.5 rounded-full bg-slate-950/80" />
              </div>

              {/* Screen Body */}
              <div className="rounded-[26px] overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] min-h-[500px] flex flex-col justify-between p-3 select-none border border-emerald-100 relative">
                
                {/* 1. Splash Preview */}
                {activeScreenTab === 'splash' && (
                  <div className="flex flex-col justify-between flex-1 text-center py-2">
                    <div className="w-full h-[220px] rounded-2xl overflow-hidden flex items-center justify-center mb-2">
                      <img
                        src={splashHero}
                        alt="Açılış"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="px-2">
                      <h4 className="text-base font-black text-[#183321]">{splashTitle}</h4>
                      <p className="text-[11px] text-[#183321]/75 mt-0.5">{splashSubtitle}</p>
                    </div>
                    <div className="mt-3 space-y-1.5 px-2">
                      <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Alışverişe Başla</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="py-1.5 rounded-lg bg-white border border-[#E1E9E4] text-[10px] font-bold text-[#183321]">Üye Ol</div>
                        <div className="py-1.5 rounded-lg bg-white border border-[#E1E9E4] text-[10px] font-bold text-[#183321]">Giriş Yap</div>
                      </div>
                    </div>
                    <div className="w-full h-[80px] overflow-hidden flex items-center justify-center mt-2">
                      <img src={successBadge} alt="Sepet" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}

                {/* 2. Welcome Preview */}
                {activeScreenTab === 'welcome' && (
                  <div className="flex flex-col justify-between flex-1 text-center py-2">
                    <div className="w-full h-[210px] rounded-2xl overflow-hidden flex items-center justify-center mb-2">
                      <img src={welcomeHero} alt="Hoş Geldiniz" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2">
                      <h4 className="text-base font-black text-[#183321]">{welcomeTitle}</h4>
                      <p className="text-[11px] text-[#183321]/75 mt-0.5">{welcomeSubtitle}</p>
                    </div>
                    <div className="mt-4 space-y-2 px-2">
                      <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-xs shadow-xs">
                        Üye Ol
                      </div>
                      <div className="w-full py-2 rounded-xl bg-white border border-[#E1E9E4] text-xs font-bold text-[#183321]">
                        Giriş Yap
                      </div>
                      <div className="text-[10px] font-bold text-[#087A25] pt-0.5">Misafir Olarak Devam Et &gt;</div>
                    </div>
                  </div>
                )}

                {/* 3. Register Preview */}
                {activeScreenTab === 'register' && (
                  <div className="flex flex-col justify-between flex-1 text-center py-1">
                    <div className="w-full h-[150px] rounded-xl overflow-hidden flex items-center justify-center mb-1">
                      <img src={registerHero} alt="Üye Ol" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2 mb-2">
                      <h4 className="text-sm font-black text-[#183321]">{registerTitle}</h4>
                      <p className="text-[10px] text-[#183321]/70">{registerSubtitle}</p>
                    </div>
                    <div className="space-y-1.5 px-2">
                      <div className="h-8 bg-[#F5F7F5] rounded-lg border border-[#E1E9E4] flex items-center px-2 text-[10px] text-slate-400">Adınız Soyadınız</div>
                      <div className="h-8 bg-[#F5F7F5] rounded-lg border border-[#E1E9E4] flex items-center px-2 text-[10px] text-slate-400">E-Posta Adresiniz</div>
                      <div className="h-8 bg-[#F5F7F5] rounded-lg border border-[#E1E9E4] flex items-center px-2 text-[10px] text-slate-400">Telefon Numaranız</div>
                      <div className="h-8 bg-[#F5F7F5] rounded-lg border border-[#E1E9E4] flex items-center px-2 text-[10px] text-slate-400">Şifre</div>
                      <div className="w-full py-2 rounded-xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-bold text-xs shadow-xs mt-2">
                        Ücretsiz Üye Ol
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Login Preview */}
                {activeScreenTab === 'login' && (
                  <div className="flex flex-col justify-between flex-1 text-center py-2">
                    <div className="w-full h-[170px] rounded-xl overflow-hidden flex items-center justify-center mb-1">
                      <img src={loginHero} alt="Giriş Yap" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2 mb-2">
                      <h4 className="text-base font-black text-[#183321]">{loginTitle}</h4>
                      <p className="text-[11px] text-[#183321]/70">{loginSubtitle}</p>
                    </div>
                    <div className="space-y-2 px-2">
                      <div className="h-8 bg-[#F5F7F5] rounded-lg border border-[#E1E9E4] flex items-center px-2 text-[10px] text-slate-400">Telefon veya E-Posta</div>
                      <div className="h-8 bg-[#F5F7F5] rounded-lg border border-[#E1E9E4] flex items-center px-2 text-[10px] text-slate-400">Şifre</div>
                      <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-bold text-xs shadow-xs">
                        Giriş Yap
                      </div>
                      <div className="h-7 bg-white rounded-lg border border-[#E1E9E4] flex items-center justify-center text-[10px] font-bold text-slate-600">Google ile Giriş Yap</div>
                    </div>
                  </div>
                )}

                {/* 5. Phone Verify Preview */}
                {activeScreenTab === 'phone_verify' && (
                  <div className="flex flex-col justify-between flex-1 text-center py-2">
                    <div className="w-full h-[140px] rounded-xl overflow-hidden flex items-center justify-center mb-1">
                      <img src={phoneHero} alt="Kalkan" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2">
                      <h4 className="text-sm font-black text-[#183321]">{phoneTitle}</h4>
                      <p className="text-[10px] text-[#183321]/70 mt-0.5">{phoneSubtitle}</p>
                    </div>
                    <div className="flex justify-center gap-1.5 my-2">
                      {['1', '2', '3', '4', '5', '6'].map((d, i) => (
                        <div key={i} className="w-7 h-9 rounded-md border border-[#18B900] bg-white flex items-center justify-center text-xs font-black text-[#183321]">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="px-2 space-y-2">
                      <div className="w-full py-2 rounded-xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-bold text-xs">
                        Doğrula
                      </div>
                      <div className="w-full h-[65px] flex items-center justify-center">
                        <img src={phoneBadge} alt="Kalkan Rozet" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Email Verify Preview */}
                {activeScreenTab === 'email_verify' && (
                  <div className="flex flex-col justify-between flex-1 text-center py-2">
                    <div className="w-full h-[140px] rounded-xl overflow-hidden flex items-center justify-center mb-1">
                      <img src={emailHero} alt="Zarf" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2">
                      <h4 className="text-sm font-black text-[#183321]">{emailTitle}</h4>
                      <p className="text-[10px] text-[#183321]/70 mt-0.5">{emailSubtitle}</p>
                    </div>
                    <div className="w-full h-[90px] flex items-center justify-center my-1">
                      <img src={emailBadge} alt="Zarf Badge" className="w-full h-full object-contain" />
                    </div>
                    <div className="px-2 space-y-1">
                      <div className="w-full py-2 rounded-xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-bold text-xs">
                        E-Postayı Tekrar Gönder
                      </div>
                      <div className="text-[10px] font-bold text-[#087A25]">Ana Sayfaya Dön &gt;</div>
                    </div>
                  </div>
                )}

                {/* 7. Forgot Password Preview */}
                {activeScreenTab === 'forgot_password' && (
                  <div className="flex flex-col justify-between flex-1 text-center py-2">
                    <div className="w-full h-[150px] rounded-xl overflow-hidden flex items-center justify-center mb-1">
                      <img src={forgotHero} alt="Kilit & Anahtar" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2">
                      <h4 className="text-base font-black text-[#183321]">{forgotTitle}</h4>
                      <p className="text-[10px] text-[#183321]/70 mt-0.5">{forgotSubtitle}</p>
                    </div>
                    <div className="px-2 space-y-2 my-2">
                      <div className="h-8 bg-[#F5F7F5] rounded-lg border border-[#E1E9E4] flex items-center px-2 text-[10px] text-slate-400">Telefon veya E-Posta</div>
                      <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-bold text-xs shadow-xs">
                        Şifre Sıfırlama Bağlantısı Gönder
                      </div>
                      <div className="text-[10px] font-bold text-[#087A25]">Giriş Sayfasına Dön &gt;</div>
                    </div>
                  </div>
                )}

                {/* 8. Success Preview */}
                {activeScreenTab === 'success' && (
                  <div className="flex flex-col justify-between flex-1 text-center py-2">
                    <div className="w-full h-[180px] rounded-xl overflow-hidden flex items-center justify-center mb-1">
                      <img src={successHero} alt="Kutlama" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2">
                      <h4 className="text-base font-black text-[#183321]">{successTitle}</h4>
                      <p className="text-[10px] text-[#183321]/75 mt-0.5">{successSubtitle}</p>
                    </div>
                    <div className="px-2 mt-2">
                      <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-xs shadow-xs">
                        Alışverişe Başla
                      </div>
                    </div>
                    <div className="w-full h-[85px] overflow-hidden flex items-center justify-center mt-2">
                      <img src={successBadge} alt="Dolu Sepet" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
