import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, OrderStatus, UserRole } from '../types';
import {
  LayoutDashboard,
  Boxes,
  Users,
  Tag,
  TrendingUp,
  Store,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  ShieldAlert,
  Activity,
  KeyRound,
  MapPin,
  Search,
  Filter,
  Download,
  Sparkles,
  RefreshCw,
  FileSearch,
  ShieldCheck,
  Bike,
  Building2,
  CheckCircle2,
  Cloud,
  Layers,
  EyeOff,
  AlertTriangle,
  Palette,
} from 'lucide-react';
import { AdminApprovalView } from './AdminApprovalView';
import { handleImageError } from '../utils/imageFallback';
import { CloudConsoleIntegration } from './CloudConsoleIntegration';
import { ProductManagementView } from './admin/ProductManagementView';
import { StockManagementView } from './admin/StockManagementView';
import { CategoryManagementView } from './admin/CategoryManagementView';
import { CampaignManagementView } from './admin/CampaignManagementView';
import { AppBrandingManagementView } from './admin/AppBrandingManagementView';

export const AdminPanel: React.FC = () => {
  const {
    products,
    updateProductStock,
    updateProductPrice,
    orders,
    updateOrderStatus,
    stores,
    toggleStoreStatus,
    couriers,
    campaigns,
    storeApplications,
    courierApplications,
    auditLogs,
    addAuditLog,
    currentUser,
    users,
    updateUserAddress,
    updateUserPassword,
    deleteProduct,
    categories,
    openAuthModal,
    setActiveViewMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'products'
    | 'stock'
    | 'categories'
    | 'campaigns'
    | 'app_branding'
    | 'all_activities'
    | 'approvals'
    | 'orders'
    | 'stores_couriers'
    | 'analytics'
    | 'admin_security'
    | 'android_studio'
    | 'cloud_console'
  >('dashboard');
  const [isDownloadingAndroidZip, setIsDownloadingAndroidZip] = useState(false);

  // Activity Log Filter & Search State
  const [logRoleFilter, setLogRoleFilter] = useState<'all' | 'customer' | 'store_owner' | 'courier' | 'admin'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logSeverityFilter, setLogSeverityFilter] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Admin Security & Headquarters Address State
  const [hqAddressLine, setHqAddressLine] = useState('Atatürk Caddesi Vali Göbeği İş Merkezi No: 42 Kat: 4');
  const [hqDistrict, setHqDistrict] = useState('Antakya');
  const [hqCity, setHqCity] = useState('Hatay');
  const [hqBuildingNo, setHqBuildingNo] = useState('42');
  const [hqFloor, setHqFloor] = useState('4');
  const [hqPhone, setHqPhone] = useState('+90 326 214 0 326');
  const [adminCurrPass, setAdminCurrPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [adminFeedback, setAdminFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  // Cross-role user password reset state
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<string | null>(null);
  const [userNewPasswordInput, setUserNewPasswordInput] = useState<string>('');

  const pendingAppsCount = storeApplications.filter(a => a.status === 'pending').length + courierApplications.filter(a => a.status === 'pending').length;

  // Metric breakdown of audit logs
  const customerLogsCount = auditLogs.filter(l => l.actorRole === 'customer').length;
  const storeLogsCount = auditLogs.filter(l => l.actorRole === 'store_owner').length;
  const courierLogsCount = auditLogs.filter(l => l.actorRole === 'courier').length;
  const adminLogsCount = auditLogs.filter(l => l.actorRole === 'admin' || l.actorRole === 'auditor').length;

  // Filtered Activity Logs
  const filteredActivities = auditLogs.filter(log => {
    const matchRole =
      logRoleFilter === 'all' ||
      (logRoleFilter === 'admin' ? (log.actorRole === 'admin' || log.actorRole === 'auditor') : log.actorRole === logRoleFilter);

    const matchSearch =
      log.actorName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(logSearchQuery.toLowerCase());

    const matchSeverity = logSeverityFilter === 'all' || log.severity === logSeverityFilter;

    return matchRole && matchSearch && matchSeverity;
  });

  // Financial KPIs
  const totalRevenue = orders
    .filter(o => o.status === 'delivered' || o.status === 'on_the_way')
    .reduce((s, o) => s + o.totalAmount, 0);

  const totalDelivered = orders.filter(o => o.status === 'delivered').length;
  const avgDeliveryTime = 11.8; // min
  const outOfStockItems = products.filter(p => p.stock <= 0).length;

  const handleExportCsv = () => {
    const headers = ['ID', 'Zaman', 'Aktör ID', 'Aktör Adı', 'Rol', 'Eylem', 'Hedef Türü', 'Hedef ID', 'Detaylar', 'IP Adresi', 'Önem'];
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      l.actorId,
      `"${l.actorName}"`,
      l.actorRole,
      l.action,
      l.targetType,
      l.targetId,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
      l.severity
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hizlisepet_admin_denetim_raporu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setExportNotice('Tüm sistem hareketleri CSV formatında başarıyla dışa aktarıldı.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleDownloadAndroidStudioZip = async () => {
    setIsDownloadingAndroidZip(true);
    try {
      const res = await fetch('/api/download-android-base64');
      if (!res.ok) throw new Error('Base64 servisi yanıt vermedi');
      const data = await res.json();
      const byteCharacters = atob(data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename || 'qcommerce-android-studio-project.zip';
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
      setExportNotice('Android Studio proje paketi başarıyla indirildi.');
      setTimeout(() => setExportNotice(null), 3500);
    } catch {
      window.location.href = '/api/download-android-project';
    } finally {
      setIsDownloadingAndroidZip(false);
    }
  };

  const handleSimulateMovement = (role: 'customer' | 'store_owner' | 'courier' | 'admin') => {
    if (role === 'customer') {
      const actions = [
        { action: 'CUSTOMER_ADDRESS_UPDATED', details: 'Müşteri yeni teslimat adresi kaydetti: Mühürdar Cad. No: 42 Kat: 2', targetType: 'user', targetId: 'addr-new' },
        { action: 'CUSTOMER_PASSWORD_CHANGED', details: 'Müşteri şifresini SMS OTP doğrulamasıyla başarıyla güncelledi.', targetType: 'security', targetId: 'usr-cust-1' },
        { action: 'CUSTOMER_ORDER_CREATED', details: 'Müşteri 285.50 ₺ tutarında yeni teslimat siparişi başlattı.', targetType: 'order', targetId: `ord-${Date.now()}` },
        { action: 'CUSTOMER_REFUND_REQUESTED', details: 'Müşteri teslimat gecikmesi gerekçesiyle kısmi iade talebi oluşturdu.', targetType: 'order', targetId: 'ord-101' },
      ];
      const pick = actions[Math.floor(Math.random() * actions.length)];
      addAuditLog({
        actorId: 'usr-cust-1',
        actorName: 'Müşteri Üyesi #101',
        actorRole: 'customer',
        action: pick.action,
        targetType: pick.targetType as any,
        targetId: pick.targetId,
        details: pick.details,
        ipAddress: '88.250.14.88',
        severity: 'info',
      });
    } else if (role === 'store_owner') {
      const actions = [
        { action: 'STORE_STOCK_UPDATED', details: 'Kadıköy Dark Store: "Sütaş Günlük Süt" reyon stoğu 40 -> 60 adede artırıldı.', targetType: 'store', targetId: 'prod-7' },
        { action: 'STORE_PRICE_UPDATED', details: 'Moda Gurme: "Ekşi Mayalı Ekmek" satış fiyatı 45.00 ₺ -> 48.00 ₺ olarak güncellendi.', targetType: 'store', targetId: 'prod-5' },
        { action: 'STORE_ADDRESS_UPDATED', details: 'İşletme yetkilisi mal kabul ve depo teslim kapısı adres notunu güncelledi.', targetType: 'store', targetId: 'store-1' },
        { action: 'STORE_PASSWORD_CHANGED', details: 'Mağaza işletmecisi yetkili kasa ve stok yönetim şifresini değiştirdi.', targetType: 'security', targetId: 'usr-store-1' },
      ];
      const pick = actions[Math.floor(Math.random() * actions.length)];
      addAuditLog({
        actorId: 'usr-store-1',
        actorName: 'Market İşletmecisi #1',
        actorRole: 'store_owner',
        action: pick.action,
        targetType: pick.targetType as any,
        targetId: pick.targetId,
        details: pick.details,
        ipAddress: '88.241.112.55',
        severity: 'info',
      });
    } else if (role === 'courier') {
      const actions = [
        { action: 'COURIER_ZONE_UPDATED', details: 'Kurye teslimat çalışma bölgesini ve ikametgahını "Kadıköy - Caferağa & Moda" olarak güncelledi.', targetType: 'courier', targetId: 'addr-cour-1' },
        { action: 'COURIER_PASSWORD_CHANGED', details: 'Kurye mobil uygulama erişim PIN kodunu ve şifresini yeniledi.', targetType: 'security', targetId: 'usr-cour-1' },
        { action: 'COURIER_PICKUP_ORDER', details: 'Kurye paketi dark store deposundan teslim aldı ve müşteriye ulaştırmak üzere yola çıktı.', targetType: 'order', targetId: 'ord-101' },
        { action: 'COURIER_OTP_VERIFIED', details: 'Kurye kapıya ulaştı, 4 haneli PIN kodunu (3819) doğrulayarak siparişi başarıyla teslim etti.', targetType: 'order', targetId: 'ord-101' },
      ];
      const pick = actions[Math.floor(Math.random() * actions.length)];
      addAuditLog({
        actorId: 'usr-cour-1',
        actorName: 'Kurye Operatörü #1',
        actorRole: 'courier',
        action: pick.action,
        targetType: pick.targetType as any,
        targetId: pick.targetId,
        details: pick.details,
        ipAddress: '176.240.19.4',
        severity: 'info',
      });
    } else {
      const actions = [
        { action: 'ADMIN_STORE_APPROVED', details: 'Yönetici yeni market başvurusunu evrak doğrulaması sonrası onayladı.', targetType: 'store', targetId: 'app-store-102' },
        { action: 'ADMIN_COURIER_APPROVED', details: 'Yönetici kurye adli sicil ve ehliyet sınıfı kontrolünü onayladı.', targetType: 'courier', targetId: 'app-cour-202' },
        { action: 'ADMIN_PASSWORD_CHANGED', details: 'Süper Yönetici güvenlik şifresini ve 2FA anahtarını başarıyla güncelledi.', targetType: 'security', targetId: 'usr-admin-1' },
        { action: 'ADMIN_HEADQUARTERS_UPDATED', details: 'Operasyon merkezi genel müdürlük adresi güncellendi: Kavacık / Beykoz.', targetType: 'user', targetId: 'addr-admin-1' },
      ];
      const pick = actions[Math.floor(Math.random() * actions.length)];
      addAuditLog({
        actorId: 'usr-admin-1',
        actorName: 'Sistem Yöneticisi (Admin)',
        actorRole: 'admin',
        action: pick.action,
        targetType: pick.targetType as any,
        targetId: pick.targetId,
        details: pick.details,
        ipAddress: '195.175.42.11',
        severity: 'info',
      });
    }
  };

  // STRICT RBAC SECURITY GATE: Non-admin users cannot access admin product management
  if (currentUser.role !== 'admin' && currentUser.role !== 'auditor') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-3xl border border-slate-200 shadow-lg text-center space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Yetkisiz Erişim / Yönetici Girişi Gerekli</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bu alana yalnızca sistem yöneticileri (admin ve superadmin) erişebilir. Normal müşteri hesapları ürün ve stok yönetimi yapamaz.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => openAuthModal("Yönetim paneline erişmek için lütfen admin hesabınızla giriş yapınız.")}
            className="w-full py-2.5 bg-[#00875A] text-white font-extrabold rounded-xl text-xs hover:bg-[#006D48] transition-all cursor-pointer shadow-xs"
          >
            Admin Hesabıyla Giriş Yap
          </button>
          <button
            onClick={() => setActiveViewMode('customer')}
            className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Müşteri Ekranına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
      {/* Top Admin Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-[#00875A] border border-emerald-500/30 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">HatayMarket Profesyonel Yönetici ve Market Paneli</h2>
            <p className="text-xs text-slate-400">
              Ürün ekleme, toplu Excel yükleme, stok kontrolü, kategori sıralaması, kurye &amp; sipariş motoru
            </p>
          </div>
        </div>

        {/* Header Action: Quick Download Android Studio ZIP */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadAndroidStudioZip}
            disabled={isDownloadingAndroidZip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Android Studio Proje Kaynak Kodlarını İndir"
          >
            <Download className="w-3.5 h-3.5 text-emerald-200" />
            <span>{isDownloadingAndroidZip ? 'İndiriliyor...' : 'Android Studio ZIP İndir'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
          {[
            { id: 'dashboard', label: 'Dashboard (Özet)', icon: LayoutDashboard },
            { id: 'products', label: `Ürün Yönetimi (${products.length})`, icon: Boxes },
            { id: 'stock', label: 'Stok & Hareketler', icon: RefreshCw },
            { id: 'categories', label: `Kategoriler (${categories.length})`, icon: Layers },
            { id: 'campaigns', label: 'Kampanya & İndirim', icon: Tag },
            { id: 'app_branding', label: 'Açılış, Üyelik & Görseller', icon: Palette },
            { id: 'orders', label: `Siparişler (${orders.length})`, icon: Clock },
            { id: 'approvals', label: `Başvuru & İade ${pendingAppsCount > 0 ? `(${pendingAppsCount})` : ''}`, icon: ShieldAlert },
            { id: 'stores_couriers', label: 'Mağaza & Kurye', icon: Store },
            { id: 'all_activities', label: `Denetim Günlüğü (${auditLogs.length})`, icon: Activity },
            { id: 'analytics', label: 'Raporlar & Gelir', icon: TrendingUp },
            { id: 'admin_security', label: 'Merkez Adresi & Şifre', icon: KeyRound },
            { id: 'cloud_console', label: 'Google Cloud & Firestore', icon: Cloud },
            { id: 'android_studio', label: 'Android Studio (ZIP)', icon: Download },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#00875A] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 text-xs">
        <div className="p-3.5">
          <span className="text-slate-500 font-medium block">Bugünkü Ciro (GMV)</span>
          <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
            {totalRevenue.toFixed(2)} ₺
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            ↑ %14.2 dünden yüksek
          </span>
        </div>
        <div className="p-3.5">
          <span className="text-slate-500 font-medium block">Ortalama Teslimat Süresi</span>
          <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
            {avgDeliveryTime} Dk
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            Hedef: &lt; 15 dk (Harika)
          </span>
        </div>
        <div className="p-3.5">
          <span className="text-slate-500 font-medium block">Aktif / Teslim Edilen Sipariş</span>
          <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
            {orders.length} / {totalDelivered}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
            İptal oranı: %0.2
          </span>
        </div>
        <div className="p-3.5">
          <span className="text-slate-500 font-medium block">Kritik Stok Uyarısı</span>
          <span className="text-lg font-black text-amber-600 font-mono tabular-nums">
            {outOfStockItems} Ürün
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
            Toplam {products.length} SKU katalog
          </span>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-5 flex-1 overflow-y-auto min-h-[500px]">
        {/* DASHBOARD TAB (Requirement 13) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl text-white shadow-sm">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <span>HatayMarket Genel Yönetim Kokpiti</span>
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                    CANLI VERİTABANI
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Firestore ürün kataloğu, stok durumu, sipariş akışı ve anlık mağaza metrikleri
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00875A] hover:bg-[#006D48] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ürün Ekle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stock')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Stok Yönetimi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Kategoriler</span>
                </button>
              </div>
            </div>

            {/* 8 Primary Dashboard KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* 1. Total Products */}
              <div
                onClick={() => setActiveTab('products')}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-500 font-bold mb-1">
                  <span>Toplam Ürün Sayısı</span>
                  <Boxes className="w-4 h-4 text-[#00875A]" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{products.length}</div>
                <span className="text-[10px] text-slate-400 font-medium">Katalogdaki tüm kayıtlar</span>
              </div>

              {/* 2. Active Products */}
              <div
                onClick={() => setActiveTab('products')}
                className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl shadow-2xs hover:bg-emerald-100/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-emerald-800 font-bold mb-1">
                  <span>Aktif (Satışta)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-950 font-mono">
                  {products.filter((p) => p.status !== 'passive').length}
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">Müşterilerin görebildiği ürünler</span>
              </div>

              {/* 3. Passive Products */}
              <div
                onClick={() => setActiveTab('products')}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 font-bold mb-1">
                  <span>Pasif (Gizli)</span>
                  <EyeOff className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-black text-slate-800 font-mono">
                  {products.filter((p) => p.status === 'passive').length}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Satışa kapalı ürünler</span>
              </div>

              {/* 4. Out of Stock */}
              <div
                onClick={() => setActiveTab('stock')}
                className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl shadow-2xs hover:bg-rose-100/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-rose-800 font-bold mb-1">
                  <span>Stokta Olmayanlar</span>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-950 font-mono">
                  {products.filter((p) => (p.stock || 0) <= 0).length}
                </div>
                <span className="text-[10px] text-rose-700 font-medium">Stok: 0 (Tükendi etiketi)</span>
              </div>

              {/* 5. Critical Stock */}
              <div
                onClick={() => setActiveTab('stock')}
                className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl shadow-2xs hover:bg-amber-100/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-amber-800 font-bold mb-1">
                  <span>Kritik Stok Uyarısı</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-950 font-mono">
                  {products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.minStockAlert || 5)).length}
                </div>
                <span className="text-[10px] text-amber-700 font-medium">5 adedin altına düşen ürünler</span>
              </div>

              {/* 6. Campaign & Discount Products */}
              <div
                onClick={() => setActiveTab('campaigns')}
                className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl shadow-2xs hover:bg-purple-100/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-purple-800 font-bold mb-1">
                  <span>Kampanyalı Ürünler</span>
                  <Tag className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-purple-950 font-mono">
                  {products.filter((p) => !!p.isCampaign || (!!p.originalPrice && p.originalPrice > p.price)).length}
                </div>
                <span className="text-[10px] text-purple-700 font-medium">İndirim tanımlanmış ürünler</span>
              </div>

              {/* 7. Total Categories */}
              <div
                onClick={() => setActiveTab('categories')}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-500 font-bold mb-1">
                  <span>Aktif Kategoriler</span>
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{categories.length}</div>
                <span className="text-[10px] text-slate-400 font-medium">Meyve, Et, Süt, Temel Gıda vb.</span>
              </div>

              {/* 8. Total Stores / Dark Stores */}
              <div
                onClick={() => setActiveTab('stores_couriers')}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-500 font-bold mb-1">
                  <span>Dark Store &amp; Kurye</span>
                  <Store className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {stores.length} Şube / {couriers.length} Kurye
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Hatay operasyon merkezleri</span>
              </div>
            </div>

            {/* Recent Products and Recent Audit Actions Strip */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Son Eklenen ve Güncellenen Ürünler */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#00875A]" />
                    <span>Katalogdaki Güncel Ürünler</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-bold text-[#00875A] hover:underline cursor-pointer"
                  >
                    Tümünü Yönet &gt;
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200"
                          onError={(e) => handleImageError(e, p.category)}
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.category} · {p.brand}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">{p.price.toFixed(2)} ₺</div>
                        <div className={`text-[10px] font-bold ${
                          (p.stock || 0) <= 0 ? 'text-red-600' : (p.stock || 0) <= 5 ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {p.stock} {p.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Son Ürün ve Stok İşlemleri */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>Son Yönetici &amp; Depo İşlemleri</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('all_activities')}
                    className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                  >
                    Denetim Günlüğü &gt;
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[11px] text-slate-900">{log.actorName}</span>
                          <span className="text-[9px] font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{log.details}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB (Requirement 2, 3, 4, 5, 6) */}
        {activeTab === 'products' && (
          <ProductManagementView />
        )}

        {/* STOCK MANAGEMENT TAB (Requirement 7) */}
        {activeTab === 'stock' && (
          <StockManagementView />
        )}

        {/* CATEGORIES MANAGEMENT TAB (Requirement 8) */}
        {activeTab === 'categories' && (
          <CategoryManagementView />
        )}

        {/* CAMPAIGNS & DISCOUNTS TAB (Requirement 9) */}
        {activeTab === 'campaigns' && (
          <CampaignManagementView />
        )}

        {/* 3D MASCOT & BRANDING ASSETS MANAGEMENT TAB */}
        {activeTab === 'app_branding' && (
          <div className="p-5 animate-in fade-in duration-200">
            <AppBrandingManagementView />
          </div>
        )}

        {/* TAB: BÜTÜN HAREKETLER & DENETİM GÜNLÜĞÜ */}
        {activeTab === 'all_activities' && (
          <div className="space-y-5">
            {exportNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{exportNotice}</span>
              </div>
            )}

            {/* 4 Group KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between text-emerald-800 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Müşteri Hareketleri</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-emerald-950 font-mono">{customerLogsCount}</div>
                <span className="text-[10px] text-emerald-700">Adres, şifre, sepet, sipariş & iade</span>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between text-amber-800 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Market İşlemleri</span>
                  <Store className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-black text-amber-950 font-mono">{storeLogsCount}</div>
                <span className="text-[10px] text-amber-700">Stok, fiyat, toplama & adres</span>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between text-blue-800 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Kurye Hareketleri</span>
                  <Bike className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-black text-blue-950 font-mono">{courierLogsCount}</div>
                <span className="text-[10px] text-blue-700">Bölge, teslimat, OTP & şifre</span>
              </div>

              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
                <div className="flex items-center justify-between text-purple-800 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Yönetici Müdahaleleri</span>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl font-black text-purple-950 font-mono">{adminLogsCount}</div>
                <span className="text-[10px] text-purple-700">Onaylar, komisyon, güvenlik</span>
              </div>
            </div>

            {/* Live Filter Bar & Real-Time Action Simulator */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Role Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                  {[
                    { id: 'all', label: `Tüm Hareketler (${auditLogs.length})` },
                    { id: 'customer', label: `Müşteriler (${customerLogsCount})` },
                    { id: 'store_owner', label: `Marketler (${storeLogsCount})` },
                    { id: 'courier', label: `Kuryeler (${courierLogsCount})` },
                    { id: 'admin', label: `Adminler (${adminLogsCount})` },
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setLogRoleFilter(btn.id as typeof logRoleFilter)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        logRoleFilter === btn.id
                          ? 'bg-slate-900 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Export & Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>CSV Rapor İndir</span>
                  </button>
                </div>
              </div>

              {/* Search & Severity Filters & Live Simulate Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200 text-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative min-w-[240px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Aktör adı, eylem, ID veya IP ara..."
                      value={logSearchQuery}
                      onChange={(e) => setLogSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <select
                    value={logSeverityFilter}
                    onChange={(e) => setLogSeverityFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 outline-none"
                  >
                    <option value="all">Tüm Önem Seviyeleri</option>
                    <option value="info">Normal Bilgi (Info)</option>
                    <option value="warning">Uyarı (Warning)</option>
                    <option value="security_alert">Güvenlik İhlali (Alert)</option>
                  </select>
                </div>

                {/* Instant Real-Time Activity Simulator */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Canlı Simüle Et:</span>
                  <button
                    onClick={() => handleSimulateMovement('customer')}
                    className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    title="Yeni Müşteri Hareketi Simüle Et"
                  >
                    + Müşteri
                  </button>
                  <button
                    onClick={() => handleSimulateMovement('store_owner')}
                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    title="Yeni Market Hareketi Simüle Et"
                  >
                    + Market
                  </button>
                  <button
                    onClick={() => handleSimulateMovement('courier')}
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    title="Yeni Kurye Hareketi Simüle Et"
                  >
                    + Kurye
                  </button>
                  <button
                    onClick={() => handleSimulateMovement('admin')}
                    className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    title="Yeni Admin Hareketi Simüle Et"
                  >
                    + Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Universal Activity Stream Cards */}
            <div className="space-y-2.5">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-xs">Aradığınız kriterde hareket kaydı bulunamadı.</p>
                </div>
              ) : (
                filteredActivities.map(log => {
                  const roleConfig = {
                    customer: { label: 'MÜŞTERİ', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Users },
                    store_owner: { label: 'MARKET İŞLETMESİ', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: Store },
                    courier: { label: 'KURYE', bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: Bike },
                    admin: { label: 'YÖNETİCİ (ADMIN)', bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: ShieldCheck },
                    auditor: { label: 'BAĞIMSIZ DENETÇİ', bg: 'bg-teal-100 text-teal-900 border-teal-300', icon: FileSearch },
                  }[log.actorRole] || { label: log.actorRole, bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: Activity };

                  const RoleIcon = roleConfig.icon;

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${roleConfig.bg}`}>
                            <RoleIcon className="w-3 h-3" />
                            <span>{roleConfig.label}</span>
                          </span>

                          <span className="font-bold text-slate-900">{log.actorName}</span>
                          <span className="text-slate-400 text-[10px] font-mono">({log.actorId})</span>

                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
                            {log.action}
                          </span>

                          {log.severity === 'security_alert' && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-red-600" />
                              <span>GÜVENLİK İHLALİ</span>
                            </span>
                          )}
                          {log.severity === 'warning' && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                              UYARI
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 text-xs font-medium leading-relaxed">
                          {log.details}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                          <span>Hedef: <b className="font-mono text-slate-700">{log.targetType}:{log.targetId}</b></span>
                          <span>·</span>
                          <span>IP: <b className="font-mono text-slate-700">{log.ipAddress}</b></span>
                          <span>·</span>
                          <span>Kayıt ID: <b className="font-mono text-slate-700">{log.id}</b></span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right md:self-start">
                        <span className="text-[11px] font-semibold text-slate-500 font-mono flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <AdminApprovalView />
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Canlı Sipariş Akışı ve Durum Kontrolü</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Sipariş No</th>
                    <th className="py-2.5 px-3">Müşteri</th>
                    <th className="py-2.5 px-3">Bölge & Mağaza</th>
                    <th className="py-2.5 px-3">Kalem / Tutar</th>
                    <th className="py-2.5 px-3">Kurye</th>
                    <th className="py-2.5 px-3">Durum Değiştir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {o.orderNumber}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{o.customer.name}</div>
                        <div className="text-[10px] text-slate-400">{o.customer.phone}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{o.customer.neighborhood}</div>
                        <div className="text-[10px] text-slate-400">{o.storeName}</div>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {o.items.length} Kalem · {o.totalAmount.toFixed(2)} ₺
                      </td>

                      <td className="py-2.5 px-3 text-slate-600">
                        {o.courierName || <span className="text-slate-400 italic">Atanmadı</span>}
                      </td>

                      <td className="py-2.5 px-3">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold outline-none focus:border-blue-500"
                        >
                          <option value="created">Sipariş Alındı</option>
                          <option value="picking">Hazırlanıyor (Picking)</option>
                          <option value="picked">Hazır (Kurye Bekliyor)</option>
                          <option value="on_the_way">Kuryede / Yolda</option>
                          <option value="delivered">Teslim Edildi</option>
                          <option value="cancelled">İptal Edildi</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STORES & COURIERS TAB */}
        {activeTab === 'stores_couriers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Dark Store (Mikro Depo) Ağı</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stores.map(store => (
                  <div key={store.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{store.name}</h4>
                      <button
                        onClick={() => toggleStoreStatus(store.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          store.isOpen
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {store.isOpen ? 'AÇIK (Hizmette)' : 'KAPALI'}
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <p>Adres: {store.address}</p>
                      <p>Hizmet Yarıçapı: <b>{store.deliveryRadiusKm} km</b></p>
                      <p>Min. Sepet Tutarı: <b>{store.minBasketAmount} ₺</b></p>
                      <p>Aktif Kurye Sayısı: <b>{store.activeCouriersCount} Kurye</b></p>
                      <p>Depo Doluluk: <b>%{store.capacityUtilizationPct}</b></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Kurye Filosu ve Canlı Durumları</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {couriers.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                        <span className="text-[10px] text-slate-500">{c.phone}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600">{c.rating} ★</span>
                    </div>
                    <p className="text-xs text-slate-600">{c.vehicle} · {c.plate}</p>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Durum:</span>
                      <span className="font-bold text-slate-900">
                        {c.status === 'busy' ? '🛵 Görevde (Yolda)' : '✓ Müsait (Depoda)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Operasyonel Performans ve Finansal Raporlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800">En Çok Satan Reyonlar</h4>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Süt & Kahvaltılık', pct: 38, rev: '14.280 ₺' },
                    { label: 'Meyve & Sebze', pct: 28, rev: '10.510 ₺' },
                    { label: 'Fırın & Pastane', pct: 18, rev: '6.750 ₺' },
                    { label: 'Temel Gıda & Yağ', pct: 16, rev: '6.000 ₺' },
                  ].map(cat => (
                    <div key={cat.label} className="space-y-1">
                      <div className="flex justify-between font-medium text-slate-700">
                        <span>{cat.label}</span>
                        <span className="font-mono">{cat.rev} (%{cat.pct})</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${cat.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Teslimat Hızı Dağılımı (SLA)</h4>
                <div className="space-y-2 text-xs">
                  {[
                    { label: '0 - 10 Dakika Arası', count: 42, color: 'bg-emerald-500' },
                    { label: '10 - 15 Dakika Arası (Hedef)', count: 48, color: 'bg-blue-500' },
                    { label: '15 - 20 Dakika Arası', count: 8, color: 'bg-amber-500' },
                    { label: '> 20 Dakika (Gecikmeli)', count: 2, color: 'bg-red-500' },
                  ].map(sla => (
                    <div key={sla.label} className="space-y-1">
                      <div className="flex justify-between font-medium text-slate-700">
                        <span>{sla.label}</span>
                        <span className="font-mono font-bold">%{sla.count}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className={`${sla.color} h-full`} style={{ width: `${sla.count}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS TAB */}
        {/* TAB: ADMIN HEADQUARTERS ADDRESS & MASTER PASSWORD */}
        {activeTab === 'admin_security' && (
          <div className="space-y-6">
            {adminFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  adminFeedback.isError
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {adminFeedback.isError ? <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                <span>{adminFeedback.msg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form 1: Company Headquarters Address */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!hqAddressLine.trim()) return;
                  const targetUserId = currentUser.id || 'usr-admin-1';
                  const addrId = currentUser.addresses[0]?.id || 'addr-admin-1';
                  updateUserAddress(targetUserId, addrId, {
                    title: 'Şirket Genel Merkez Adresi',
                    addressLine: hqAddressLine,
                    neighborhood: hqDistrict,
                    district: hqDistrict,
                    city: hqCity,
                    buildingNo: hqBuildingNo,
                    floor: hqFloor,
                    notes: `Santral: ${hqPhone}`,
                  });
                  setAdminFeedback({ msg: 'Şirket genel merkez ve operasyon adresi başarıyla güncellendi.', isError: false });
                }}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Şirket Genel Merkez & Operasyon Adresi</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Şirket Ticari Unvanı</label>
                  <input
                    type="text"
                    defaultValue="HızlıSepet Lojistik ve Dağıtım Teknolojileri A.Ş."
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Açık Merkez Adresi</label>
                  <input
                    type="text"
                    value={hqAddressLine}
                    onChange={(e) => setHqAddressLine(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">İlçe / Bölge</label>
                    <input
                      type="text"
                      value={hqDistrict}
                      onChange={(e) => setHqDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Şehir</label>
                    <input
                      type="text"
                      value={hqCity}
                      onChange={(e) => setHqCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Bina No</label>
                    <input
                      type="text"
                      value={hqBuildingNo}
                      onChange={(e) => setHqBuildingNo(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kat</label>
                    <input
                      type="text"
                      value={hqFloor}
                      onChange={(e) => setHqFloor(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Acil Santral</label>
                    <input
                      type="text"
                      value={hqPhone}
                      onChange={(e) => setHqPhone(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Genel Merkez Adresini Kaydet
                </button>
              </form>

              {/* Form 2: Super Admin Master Password Change */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminNewPass.length < 8) {
                    setAdminFeedback({ msg: 'Yönetici şifresi en az 8 karakter olmalıdır.', isError: true });
                    return;
                  }
                  if (adminNewPass !== adminConfirmPass) {
                    setAdminFeedback({ msg: 'Yeni şifreler birbiriyle eşleşmiyor.', isError: true });
                    return;
                  }
                  const targetUserId = currentUser.id || 'usr-admin-1';
                  const res = updateUserPassword(targetUserId, adminNewPass);
                  setAdminFeedback({ msg: res.message, isError: !res.success });
                  setAdminCurrPass('');
                  setAdminNewPass('');
                  setAdminConfirmPass('');
                }}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  <span>Süper Yönetici (Admin) Şifre Değiştir</span>
                </div>

                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 text-[11px]">
                  <span className="font-bold block">Güçlü Yönetici Güvenliği:</span>
                  <span>Şifre değişikliği anında denetim günlüğüne (Audit Trail) SHA-256 imzasıyla kaydedilir.</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mevcut Admin Şifresi</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminCurrPass}
                    onChange={(e) => setAdminCurrPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Yeni Yönetici Şifresi</label>
                  <input
                    type="password"
                    placeholder="En az 8 karakter, harf ve rakam"
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Yeni Şifre Tekrarı</label>
                  <input
                    type="password"
                    placeholder="Yeni yönetici şifresini tekrar girin"
                    value={adminConfirmPass}
                    onChange={(e) => setAdminConfirmPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-purple-500 text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Yönetici Şifresini Güncelle
                </button>
              </form>

              {/* Table: All Users (Members, Stores, Couriers, Admin) Address & Password Management */}
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      Tüm Kullanıcıların (Üye, Market, Kurye, Admin) Adres ve Şifre Yönetimi
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Toplam {users.length} Kayıtlı Hesap
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                        <th className="pb-2">Kullanıcı & ID</th>
                        <th className="pb-2">Rol</th>
                        <th className="pb-2">İletişim</th>
                        <th className="pb-2">Kayıtlı Adres & Bölge</th>
                        <th className="pb-2 text-right">Şifre & Adres Eylemi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-100/60 transition-colors">
                          <td className="py-2.5 font-medium text-slate-900">
                            <div>{u.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.role === 'customer'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.role === 'store_owner'
                                  ? 'bg-amber-100 text-amber-800'
                                  : u.role === 'courier'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {u.role === 'customer' ? 'Üye' : u.role === 'store_owner' ? 'Market' : u.role === 'courier' ? 'Kurye' : 'Admin'}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-600 font-mono text-[11px]">
                            <div>{u.phone}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-2.5 text-slate-700 max-w-xs text-[11px]">
                            {u.addresses.length > 0 ? (
                              <div>
                                <span className="font-semibold text-slate-800">{u.addresses[0].title}: </span>
                                <span>{u.addresses[0].addressLine}</span>
                                <div className="text-[10px] text-slate-400">
                                  {u.addresses[0].neighborhood}, {u.addresses[0].district}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Adres girilmemiş</span>
                            )}
                          </td>
                          <td className="py-2.5 text-right space-x-2">
                            {selectedUserToEdit === u.id ? (
                              <div className="inline-flex items-center gap-1.5 bg-white p-1.5 border border-slate-300 rounded-lg shadow-xs">
                                <input
                                  type="text"
                                  placeholder="Yeni şifre"
                                  value={userNewPasswordInput}
                                  onChange={(e) => setUserNewPasswordInput(e.target.value)}
                                  className="w-24 px-2 py-1 text-[11px] border border-slate-300 rounded outline-none font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (userNewPasswordInput.length < 6) {
                                      setAdminFeedback({ msg: 'Şifre en az 6 karakter olmalıdır.', isError: true });
                                      return;
                                    }
                                    updateUserPassword(u.id, userNewPasswordInput);
                                    setAdminFeedback({ msg: `${u.name} kullanıcısının şifresi başarıyla sıfırlandı.`, isError: false });
                                    setSelectedUserToEdit(null);
                                    setUserNewPasswordInput('');
                                  }}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Kaydet
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserToEdit(null);
                                    setUserNewPasswordInput('');
                                  }}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                                >
                                  İptal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserToEdit(u.id);
                                  setUserNewPasswordInput('');
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <KeyRound className="w-3 h-3 text-amber-500" />
                                <span>Şifre Sıfırla</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ANDROID STUDIO PROJECT DOWNLOAD (ZIP) */}
        {activeTab === 'android_studio' && (
          <div className="p-5 space-y-5 animate-in fade-in duration-200">
            {/* Hero Card */}
            <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30">
                  <Download className="w-3.5 h-3.5" />
                  <span>Resmi Android Studio Paketi v2.4 (Kotlin stdlib Düzeltmeli)</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  MarketimHatay Android Studio Proje Paketi (ZIP)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Android Studio'da tek tıkla açılıp doğrudan derlenebilen (build & assemble) eksiksiz native Android projesidir.
                  Gradle 8.7 ve Kotlin stdlib duplicate class hatası çözülmüş, Capacitor köprüsü ve tüm mobil varlıklar zipe paketlenmiştir.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">📦 Dosya Adı: qcommerce-android-studio-project.zip</span>
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">💾 Boyut: ~5.0 MB</span>
                  <span className="bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-700">✓ Gradle Test Edildi & Onaylandı</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadAndroidStudioZip}
                  disabled={isDownloadingAndroidZip}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>{isDownloadingAndroidZip ? 'ZIP Paketi Hazırlanıyor...' : 'Android Studio ZIP İndir (Önerilen)'}</span>
                </button>

                <a
                  href="/api/download-android-project"
                  download="qcommerce-android-studio-project.zip"
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center border border-slate-700"
                >
                  Alternatif Doğrudan Bağlantı (Direct Stream)
                </a>
              </div>
            </div>

            {/* Step-by-Step Build Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="font-bold text-slate-900">ZIP Dosyasını Açın</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  İndirdiğiniz <code>qcommerce-android-studio-project.zip</code> dosyasını bilgisayarınızda bir klasöre (örn: <code>C:\Projeler\HatayMarket</code>) çıkarın.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="font-bold text-slate-900">Android Studio ile Açın</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Android Studio'da <strong>File &gt; Open</strong> menüsünden zipten çıkardığınız <code>android</code> klasörünü seçin. Gradle otomatik senkronize olacaktır.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="font-bold text-slate-900">APK Derleyin &amp; Çalıştırın</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Terminalden <code>.\gradlew assembleDebug</code> çalıştırabilir veya yeşil <strong>Run 'app'</strong> butonuna basarak doğrudan telefona yükleyebilirsiniz.
                </p>
              </div>
            </div>

            {/* Resolved Fixes Card */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bu ZIP Paketinde Çözülmüş Teknik Sorunlar</span>
              </h4>
              <ul className="list-disc list-inside text-emerald-900 space-y-1 text-[11px]">
                <li><strong>Duplicate class kotlin-stdlib hatası:</strong> Gradle yapılandırmasında <code>org.jetbrains.kotlin:kotlin-stdlib-jdk7</code> ve <code>jdk8</code> modül çakışmaları tamamen izole edilip çözüldü.</li>
                <li><strong>Capacitor Native Bridge:</strong> Tüm Android manifest izinleri, kamera/konum desteği ve WebView bridge konfigüre edildi.</li>
                <li><strong>Hatay Dark Store &amp; Asistan Varlıkları:</strong> Çevrimdışı ve yerel önbellek uyumlu Android public asset'leri eklendi.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 9: GOOGLE CLOUD CONSOLE & FIRESTORE INTEGRATION */}
        {activeTab === 'cloud_console' && (
          <div className="p-5 animate-in fade-in duration-200">
            <CloudConsoleIntegration />
          </div>
        )}
      </div>
    </div>
  );
};
