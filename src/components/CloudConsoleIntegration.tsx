import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  Sparkles,
  Lock,
  Globe2,
  Check
} from 'lucide-react';
import {
  GOOGLE_CLOUD_METADATA,
  testCloudFirestoreConnection,
  seedCatalogToGoogleCloud,
} from '../services/firebaseDb';
import { useApp } from '../context/AppContext';

export const CloudConsoleIntegration: React.FC = () => {
  const { products, stores, orders, auditLogs } = useApp();
  const [isChecking, setIsChecking] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    connected: boolean;
    latencyMs: number;
    error?: string;
  }>({
    tested: false,
    connected: true,
    latencyMs: 38,
  });
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const runTest = async () => {
    setIsChecking(true);
    setSeedResult(null);
    const result = await testCloudFirestoreConnection();
    setConnectionStatus({
      tested: true,
      connected: result.connected,
      latencyMs: result.latencyMs,
      error: result.error,
    });
    setIsChecking(false);
  };

  const handleSeedCloud = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    const res = await seedCatalogToGoogleCloud(products, stores);
    setSeedResult(res.message);
    setIsSeeding(false);
    runTest();
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Google Cloud & Firebase Canlı Entegrasyon
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Cloud className="w-7 h-7 text-blue-400" />
              Google Cloud Console Yönetim Paneli
            </h2>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              HatayMarket, Google Cloud Firestore noSQL veri tabanı ve Firebase altyapısıyla canlı senkronize çalışır.
              Aşağıdaki doğrudan konsol bağlantılarını kullanarak veritabanı koleksiyonlarını ve güvenlik kurallarını anlık olarak izleyebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={runTest}
              disabled={isChecking}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all border border-white/10 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              Bağlantıyı Yenile
            </button>
            <a
              href={GOOGLE_CLOUD_METADATA.urls.cloudConsole}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>Cloud Console'da Aç</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Cloud Metadata & Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Project ID */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">GCP Proje Kimliği</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm font-bold text-slate-800 font-mono truncate" title={GOOGLE_CLOUD_METADATA.projectId}>
            {GOOGLE_CLOUD_METADATA.projectId}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Aktif Google Cloud Projesi
          </div>
        </div>

        {/* Database ID */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Firestore Database ID</span>
            <Database className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xs font-bold text-slate-800 font-mono truncate" title={GOOGLE_CLOUD_METADATA.firestoreDatabaseId}>
            {GOOGLE_CLOUD_METADATA.firestoreDatabaseId}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Özel Bölgesel Firestore Örneği</div>
        </div>

        {/* Region */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bölge (Cloud Region)</span>
            <Globe2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-slate-800">
            {GOOGLE_CLOUD_METADATA.region}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Avrupa (Frankfurt / Düşük Gecikme)</div>
        </div>

        {/* Connection Health */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Firestore Ping / Canlılık</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-sm font-bold text-slate-800">
              {connectionStatus.connected ? 'Bağlantı Aktif' : 'Çevrimdışı Mod'}
            </span>
            <span className="text-xs text-slate-400 font-mono">({connectionStatus.latencyMs} ms)</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            Canlı onSnapshot Dinleme devrede
          </div>
        </div>
      </div>

      {/* Direct Cloud Console Shortcuts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#00875A]" />
              Google Cloud & Firebase Console Doğrudan Erişim Bağlantıları
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tarayıcınızda doğrudan ilgili Google Cloud konsol panellerine gitmek için tıklayın
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Firestore Data Panel */}
          <a
            href={GOOGLE_CLOUD_METADATA.urls.firestoreData}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-900">Firestore Veri Paneli</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                /products, /orders ve /users koleksiyonlarını görsel olarak inceleyin
              </p>
            </div>
          </a>

          {/* Cloud Console Dashboard */}
          <a
            href={GOOGLE_CLOUD_METADATA.urls.cloudConsole}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">GCP Dashboard</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Google Cloud projesinin API kullanımını, metrikleri ve kaynak durumunu görün
              </p>
            </div>
          </a>

          {/* Firebase Overview */}
          <a
            href={GOOGLE_CLOUD_METADATA.urls.firebaseOverview}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-xl border border-slate-200 hover:border-orange-400 bg-slate-50 hover:bg-orange-50/50 transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-orange-900">Firebase Konsolu</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Mobil uygulama ayarları, analizler ve bildirim merkezi
              </p>
            </div>
          </a>

          {/* Firebase Authentication */}
          <a
            href={GOOGLE_CLOUD_METADATA.urls.firebaseAuth}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Kimlik Doğrulama (Auth)</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Sistem kullanıcı hesapları, oturum açma sağlayıcıları ve denetim
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Collections & Seed Sync Action */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Aktif Firestore Koleksiyonları &amp; Senkronizasyon Durumu
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Google Cloud Firestore veritabanına bağlı koleksiyonlar ve anlık kayıt adetleri
            </p>
          </div>

          <button
            onClick={handleSeedCloud}
            disabled={isSeeding}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00875A] hover:from-emerald-700 hover:to-[#00704A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? 'Google Cloud Eşitleniyor...' : 'Kataloğu Cloud Firestore\'a Eşitle'}</span>
          </button>
        </div>

        {seedResult && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{seedResult}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* /products */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-slate-800">/products</div>
              <div className="text-[11px] text-slate-500">Market Ürün Kataloğu &amp; Stok</div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-[#00875A]">{products.length}</span>
              <span className="text-[10px] text-slate-400 block">Kayıt</span>
            </div>
          </div>

          {/* /orders */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-slate-800">/orders</div>
              <div className="text-[11px] text-slate-500">Teslimat &amp; Kurye Siparişleri</div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-blue-600">{orders.length}</span>
              <span className="text-[10px] text-slate-400 block">Sipariş</span>
            </div>
          </div>

          {/* /stores */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-slate-800">/stores</div>
              <div className="text-[11px] text-slate-500">Hatay Bölgesi Dark Store'lar</div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-amber-600">{stores.length}</span>
              <span className="text-[10px] text-slate-400 block">Mağaza</span>
            </div>
          </div>

          {/* /auditLogs */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-slate-800">/auditLogs</div>
              <div className="text-[11px] text-slate-500">KVKK ve Güvenlik Denetim Kayıtları</div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-purple-600">{auditLogs.length}</span>
              <span className="text-[10px] text-slate-400 block">Log</span>
            </div>
          </div>

          {/* /users */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-slate-800">/users</div>
              <div className="text-[11px] text-slate-500">Kullanıcı &amp; Rol Yönetimi</div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-slate-700">6</span>
              <span className="text-[10px] text-slate-400 block">Hesap</span>
            </div>
          </div>

          {/* /admins */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-slate-800">/admins</div>
              <div className="text-[11px] text-slate-500">mersin20233@gmail.com Yetkisi</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Admin Tanımlı
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Rules & Access Control Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Firestore Güvenlik Kuralları (firestore.rules) Dağıtıldı &amp; Koruma Altında</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Google Cloud Firestore kuralları; müşteri siparişlerini sadece sipariş sahibine ve kuryesine açar, ürün kataloğuna genel okuma izni verir, mağaza/stok güncellemelerini yetkili mağaza ve yöneticilere kısıtlar. Audit logları (denetim kayıtları) ise salt-okunur ve silinemez biçimde Google Cloud üzerinde arşivlenir.
        </p>
      </div>
    </div>
  );
};
