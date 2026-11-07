import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Terminal,
  FileCode,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Globe,
  Loader2,
  FileCheck2,
  Code,
  ShoppingBag,
  Send,
  Play
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleSimulator?: (device: 'android' | 'iphone' | 'none') => void;
  currentSimulator?: 'android' | 'iphone' | 'none';
}

export const MobileAppInstallModal: React.FC<MobileAppInstallModalProps> = ({
  isOpen,
  onClose,
  onToggleSimulator,
  currentSimulator = 'none',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'share_qr' | 'google_play' | 'ios_guide' | 'android_apk' | 'download_project'>('share_qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [downloadMessage, setDownloadMessage] = useState<string>('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://hataymarket.app';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      QRCode.toDataURL(window.location.href, {
        width: 340,
        margin: 1.5,
        color: {
          dark: '#005236',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`HatayMarket Mobil Alışveriş Uygulaması:\n15 Dakikada Taze & Hızlı Teslimat kapınızda!\nBağlantıya tıklayıp hemen sipariş verin:\n${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  const handleDownloadZip = async (method: 'smart' | 'base64' | 'direct' = 'smart') => {
    setDownloadStatus('downloading');
    setDownloadMessage('HatayMarket Android Studio projesi indiriliyor ve doğrulanıyor...');

    try {
      let finalBlob: Blob | null = null;

      if (method === 'base64' || method === 'smart') {
        try {
          const res = await fetch('/api/download-android-base64');
          if (res.ok) {
            const data = await res.json();
            if (data.base64) {
              const byteCharacters = atob(data.base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              finalBlob = new Blob([byteArray], { type: 'application/zip' });
            }
          }
        } catch (b64Err) {
          console.warn('Base64 fetch fallback:', b64Err);
        }
      }

      if (!finalBlob) {
        const streamRes = await fetch('/api/download-android-project');
        if (streamRes.ok) {
          finalBlob = await streamRes.blob();
        }
      }

      if (!finalBlob) {
        throw new Error('İndirme sunucusundan zip dosyası alınamadı.');
      }

      const blobUrl = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'hataymarket-android-studio-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

      setDownloadStatus('success');
      setDownloadMessage('hataymarket-android-studio-project.zip başarıyla indirildi!');
    } catch (err: any) {
      setDownloadStatus('error');
      setDownloadMessage(err.message || 'İndirme sırasında bir sorun oluştu. Lütfen tekrar deneyiniz.');
    }
  };

  const storeListingTitle = 'HatayMarket - 15 Dakikada Taze Market';
  const storeListingShortDesc = "Hatay'ın Bereketli Sofralarına 15 Dakikada Taze & Hızlı Teslimat.";
  const storeListingFullDesc = `HatayMarket, Hatay'ın 8 ilçesinde (Antakya, Defne, İskenderun, Samandağ, Kırıkhan, Dörtyol, Arsuz, Reyhanlı) taze manav, kasap, kahvaltılık, temel gıda, temizlik ve meşhur Hatay yöresel lezzetlerini 15 dakikada kapınıza getiren yeni nesil hızlı market platformudur.

Öne Çıkan Özellikler:
• 15-20 Dakikada Jet Hızında Teslimat
• Canlı Kurye & Harita Takibi
• Akıllı Fiyat Alarmı (Kahve, Bebek Bezi, Deterjan ve Mama İndirim Takibi)
• "Bugün Ne Yapsam?" Yapay Zekâlı Yemek Asistanı ve Eksik Malzeme Sepeti
• Güvenli Ödeme: 256-bit SSL, Kredi Kartı ve Kapıda Ödeme
• Tescilli Hatay Yöresel Ürünleri (Künefe, Halhalı Zeytin, Nar Ekşisi, Biber Salçası)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#00875A] to-[#005236] border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">HatayMarket Mobil &amp; Yayınlama Merkezi</h3>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-white text-[#00875A] rounded-full shadow-xs">
                  iOS · Android · Google Play
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Uygulamanızı telefonlarda anında paylaşın, iPhone/Android'e kurun ve Google Play Store'a yükleyin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-slate-800 bg-slate-900/90 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('share_qr')}
            className={`flex items-center gap-2 pb-3 px-3.5 font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'share_qr'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>1. Telefonda Paylaş &amp; QR Kod</span>
          </button>

          <button
            onClick={() => setActiveTab('google_play')}
            className={`flex items-center gap-2 pb-3 px-3.5 font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'google_play'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 fill-amber-400" />
            <span>2. Google Play Store'a Yükleme</span>
          </button>

          <button
            onClick={() => setActiveTab('ios_guide')}
            className={`flex items-center gap-2 pb-3 px-3.5 font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ios_guide'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>3. iPhone / iOS Kurulumu</span>
          </button>

          <button
            onClick={() => setActiveTab('android_apk')}
            className={`flex items-center gap-2 pb-3 px-3.5 font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'android_apk'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>4. Android Anında Kurulum</span>
          </button>

          <button
            onClick={() => setActiveTab('download_project')}
            className={`flex items-center gap-2 pb-3 px-3.5 font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'download_project'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>5. Android Studio Projesi (.ZIP)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* TAB 1: SHARE & QR CODE */}
          {activeTab === 'share_qr' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Presentation */}
                <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-3xl flex flex-col items-center text-center space-y-4 shadow-inner">
                  <div className="w-14 h-14 rounded-2xl bg-[#00875A]/20 text-[#00875A] border border-[#00875A]/30 flex items-center justify-center">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">Telefonunuzla QR Kodu Okutun</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      iPhone (Kamera) veya Android telefonunuzun kamerasını bu koda tutun; uygulama cihazınızda doğrudan açılacaktır.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-[#00875A]/30">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="HatayMarket QR Kodu" className="w-56 h-56 rounded-lg" />
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00875A]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    ✓ iOS Safari &amp; Android Chrome ile %100 Uyumlu
                  </span>
                </div>

                {/* Instant Share Actions */}
                <div className="space-y-4">
                  <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Uygulama Paylaşım Bağlantısı:
                    </h5>
                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-emerald-400 truncate select-all">{currentUrl}</span>
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 bg-[#00875A] hover:bg-[#006D48] text-white rounded-lg font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer text-xs"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Share buttons */}
                  <div className="space-y-2.5">
                    <button
                      onClick={handleShareWhatsApp}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Müşterilere WhatsApp ile Gönder</span>
                    </button>

                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Bağlantıyı Yeni Sekmede Aç</span>
                    </a>
                  </div>

                  {/* Highlights card */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-xs space-y-2">
                    <h5 className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Paylaşım Kolaylığı:
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Kullanıcılarınız herhangi bir mağaza indirmesi beklemeden, linke dokundukları anda HatayMarket'e giriş yapabilir, ürünleri sepete ekleyebilir ve canlı kurye takibiyle sipariş verebilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE PLAY STORE SUBMISSION */}
          {activeTab === 'google_play' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Play className="w-5 h-5 fill-amber-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white">
                    Google Play Store'a Yükleme Rehberi (.AAB Paketi)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Google Play Store'a yükleme yapabilmek için Google, <strong>.aab (Android App Bundle)</strong> formatında paket ve bir <strong>Google Play Console Geliştirici Hesabı</strong> ister. Aşağıdaki adımları takip ederek uygulamanızı mağazaya yükleyebilirsiniz.
                  </p>
                </div>
              </div>

              {/* Step by step checklist */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                    <h5 className="text-sm font-bold text-white">.AAB (Android App Bundle) Paketini Hazırlayın</h5>
                  </div>
                  <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                    İndirdiğiniz Android projesi içerisindeki <code>2-GOOGLE-PLAY-AAB-OLUSTUR.bat</code> dosyasına çift tıklayarak veya terminalden tek satır komutla Google Play'e yüklenecek <code>app-release.aab</code> dosyasını oluşturabilirsiniz:
                  </p>
                  <div className="pl-8">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-400">
                      <span>.\gradlew bundleRelease</span>
                      <button
                        onClick={() => handleCopyCode('.\\gradlew bundleRelease', 'cmd1')}
                        className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded text-[11px]"
                      >
                        {copiedText === 'cmd1' ? 'Kopyalandı' : 'Kopyala'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                    <h5 className="text-sm font-bold text-white">Google Play Console'da Yeni Uygulama Oluşturun</h5>
                  </div>
                  <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                    <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-bold inline-flex items-center gap-1">
                      play.google.com/console <ExternalLink className="w-3 h-3" />
                    </a> adresine gidin. Sağ üstteki <b>"Uygulama oluştur" (Create app)</b> butonuna basın:
                  </p>
                  <div className="pl-8 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Uygulama Adı</span>
                      <b className="text-white">HatayMarket</b>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Varsayılan Dil</span>
                      <b className="text-white">Türkçe (tr-TR)</b>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Uygulama Türü</span>
                      <b className="text-white">Uygulama (App)</b>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Fiyatlandırma</span>
                      <b className="text-white">Ücretsiz (Free)</b>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
                    <h5 className="text-sm font-bold text-white">Hazır Mağaza Girişi Metinleri (Kopyalayıp Yapıştırın)</h5>
                  </div>
                  <div className="pl-8 space-y-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                        <span>Uygulama Başlığı (Maks. 30 karakter):</span>
                        <button
                          onClick={() => handleCopyCode(storeListingTitle, 'title')}
                          className="text-amber-400 hover:underline cursor-pointer"
                        >
                          {copiedText === 'title' ? 'Kopyalandı!' : 'Kopyala'}
                        </button>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-bold text-white">
                        {storeListingTitle}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                        <span>Kısa Açıklama (Maks. 80 karakter):</span>
                        <button
                          onClick={() => handleCopyCode(storeListingShortDesc, 'shortDesc')}
                          className="text-amber-400 hover:underline cursor-pointer"
                        >
                          {copiedText === 'shortDesc' ? 'Kopyalandı!' : 'Kopyala'}
                        </button>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-200">
                        {storeListingShortDesc}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                        <span>Tam Açıklama:</span>
                        <button
                          onClick={() => handleCopyCode(storeListingFullDesc, 'fullDesc')}
                          className="text-amber-400 hover:underline cursor-pointer"
                        >
                          {copiedText === 'fullDesc' ? 'Kopyalandı!' : 'Kopyala'}
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap font-sans">
                        {storeListingFullDesc}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">4</span>
                    <h5 className="text-sm font-bold text-white">.AAB Dosyasını Yükleyin &amp; Yayınlayın</h5>
                  </div>
                  <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                    Console'da sol menüden <b>Üretim (Production)</b> bölümüne gelin. <b>"Yeni sürüm oluştur"</b>a tıklayıp <code>app-release.aab</code> dosyasını yükleyin ve <b>"İncelemeye Gönder"</b> butonuna basın. Google ekibi incelemesini tamamladıktan sonra uygulamanız Google Play Store'da canlıya alınır!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IPHONE / IOS GUIDE */}
          {activeTab === 'ios_guide' && (
            <div className="space-y-6">
              <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white">
                    iPhone &amp; iPad Cihazlarda App Store Olmadan Kurulum (PWA / iOS Standalone)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Apple iOS Safari'nin <strong>Apple-Touch-Icon</strong> ve <strong>Standalone Web App</strong> desteği sayesinde HatayMarket, App Store onayına gerek kalmadan iPhone ana ekranına gerçek bir iOS uygulaması gibi kurulur.
                  </p>
                </div>
              </div>

              {/* Visual 3 step guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-sm flex items-center justify-center">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-white">Safari ile Açın</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    iPhone cihazınızda bağlantıyı <strong>Safari</strong> tarayıcısında açın. (Apple güvenlik kısıtlaması nedeniyle ana ekrana ekleme Safari üzerinden yapılır).
                  </p>
                </div>

                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-sm flex items-center justify-center">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-white">"Paylaş" Butonuna Basın</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Safari ekranının alt ortasında yer alan <strong>Paylaş</strong> simgesine (kare içinden yukarı ok) dokunun.
                  </p>
                </div>

                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-sm flex items-center justify-center">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-white">"Ana Ekrana Ekle"</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Aşağı kaydırıp <strong>"Ana Ekrana Ekle" (Add to Home Screen)</strong> seçeneğine ve ardından sağ üstteki <strong>"Ekle"</strong> butonuna basın.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <h5 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  iPhone Deneyimi:
                </h5>
                <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Tarayıcı adres çubuğu ve butonları tamamen kaybolur; tam ekran yerel uygulama olarak açılır.</li>
                  <li>iPhone 15/16 Dynamic Island ve çentik güvenli alanlarıyla tam uyumludur.</li>
                  <li>HatayMarket yeşil logosuyla telefonunuzun ana ekranında bağımsız bir uygulama olarak yer alır.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: ANDROID APK & WEBAPK */}
          {activeTab === 'android_apk' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Download className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white">
                    Android'de Doğrudan Yükleme (WebAPK / PWA Teknolojisi)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Android'de Google Chrome veya Samsung Internet, Web App Manifest ve Service Worker sayesinde cihazınızda anında resmi bir <strong>.apk paketi (WebAPK)</strong> üretir ve sisteme yerel uygulama olarak kurar.
                  </p>
                </div>
              </div>

              {/* Direct Install Button */}
              <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Tek Tıkla Cihaza / Telefona Kur
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {isInstalled
                      ? '✅ Bu uygulama cihazınızda zaten bağımsız mobil uygulama modunda çalışıyor!'
                      : isInstallable
                      ? 'Tarayıcınız doğrudan APK yükleme istemini destekliyor.'
                      : 'Telefonunuzda Chrome ile açtığınızda veya aşağıdaki adımları uyguladığınızda kurulur.'}
                  </div>
                </div>

                <button
                  onClick={handleInstallClick}
                  disabled={isInstalled || !isInstallable}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition cursor-pointer ${
                    isInstalled
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : isInstallable
                      ? 'bg-[#00875A] hover:bg-[#006D48] text-white shadow-emerald-900/30 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {isInstalled
                    ? 'Yüklendi (Aktif)'
                    : isInstallable
                    ? 'Şimdi APK Olarak Yükle'
                    : 'Chrome Menüsünden Yükleyin'}
                </button>
              </div>

              {/* 3 Step Android Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-white">Android Chrome'da Açın</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Android telefonunuzda Google Chrome tarayıcısını açıp paylaşılan uygulama adresine gidin.
                  </p>
                </div>

                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-white">Menüye Dokunun</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Chrome sağ üstündeki <strong>üç nokta (⋮)</strong> menüsüne dokunun ve <strong>"Uygulamayı Yükle"</strong> seçeneğini seçin.
                  </p>
                </div>

                <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-white">APK Olarak Çalışsın</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Uygulama telefonunuzun uygulama çekmecesine native simgesiyle eklenir ve tam ekran çalışır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOWNLOAD ANDROID STUDIO PROJECT */}
          {activeTab === 'download_project' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white">
                    HatayMarket Android Studio Kaynak Kod Paketi (.ZIP)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Proje; Gradle, Capacitor Android Native Bridge, HatayMarket simgeleri ve 1 tıkla derleme scriptleriyle eksiksiz hazırlanmıştır.
                  </p>
                </div>
              </div>

              {/* Download Action Box */}
              <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>hataymarket-android-studio-project.zip</span>
                    </h5>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Paket Adı: <b>com.hataymarket.delivery</b> · Boyut: ~5.0 MB
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadZip('smart')}
                    disabled={downloadStatus === 'downloading'}
                    className="px-5 py-3 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {downloadStatus === 'downloading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>İndiriliyor...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Projeyi İndir (.ZIP)</span>
                      </>
                    )}
                  </button>
                </div>

                {downloadMessage && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    downloadStatus === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                      : downloadStatus === 'error'
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-300'
                  }`}>
                    {downloadStatus === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {downloadStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span>{downloadMessage}</span>
                  </div>
                )}
              </div>

              {/* How to use extracted zip */}
              <div className="p-4.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3 text-xs">
                <h5 className="font-bold text-white">İndirilen ZIP Nasıl Kullanılır?</h5>
                <ol className="text-slate-300 space-y-2 list-decimal list-inside leading-relaxed text-[11px]">
                  <li>İndirdiğiniz ZIP dosyasını klasöre çıkartın.</li>
                  <li>
                    <b>Hemen APK almak için:</b> Çıkarttığınız klasördeki <code>1-APK-OLUSTUR.bat</code> dosyasına çift tıklayın. APK otomatik derlenir.
                  </li>
                  <li>
                    <b>Google Play AAB paketi için:</b> <code>2-GOOGLE-PLAY-AAB-OLUSTUR.bat</code> dosyasına çift tıklayın. Google Play App Bundle dosyası otomatik oluşur.
                  </li>
                  <li>
                    <b>Android Studio ile açmak için:</b> Android Studio'da <code>File &gt; Open</code> diyerek çıkartılan <code>android</code> klasörünü seçin.
                  </li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300">HatayMarket Dağıtım Altyapısı Aktif</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer text-xs"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
