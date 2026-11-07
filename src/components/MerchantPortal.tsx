import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { handleImageError } from '../utils/imageFallback';
import {
  Store,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  DollarSign,
  Boxes,
  PackageCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
  Building2,
  KeyRound,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon
} from 'lucide-react';

export const MerchantPortal: React.FC = () => {
  const {
    currentUser,
    stores,
    products,
    updateProductStock,
    updateProductPrice,
    orders,
    storeApplications,
    setActiveViewMode,
    updateUserAddress,
    updateUserPassword,
    createProduct,
    editProduct,
    deleteProduct,
  } = useApp();

  const userApplication = storeApplications.find(a => a.userId === currentUser.id);
  const isApproved = currentUser.status === 'active' && currentUser.role === 'store_owner';
  const assignedStore = stores.find(s => s.ownerUserId === currentUser.id || s.id === currentUser.storeId) || stores[0];

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'payouts' | 'settings'>('inventory');

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Meyve & Sebze');
  const [prodSubcat, setProdSubcat] = useState('Taze Sebzeler');
  const [prodPrice, setProdPrice] = useState('24.90');
  const [prodStock, setProdStock] = useState('30');
  const [prodUnit, setProdUnit] = useState('kg');
  const [prodWeight, setProdWeight] = useState('1 kg');
  const [prodBrand, setProdBrand] = useState('Hatay Yöresel');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80');
  const [prodDesc, setProdDesc] = useState('');
  const [prodFeedback, setProdFeedback] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Store Address & Password State
  const [storeAddrLine, setStoreAddrLine] = useState(assignedStore.address);
  const [storeDistrict, setStoreDistrict] = useState(assignedStore.district);
  const [storeRadius, setStoreRadius] = useState(assignedStore.deliveryRadiusKm);
  const [storeDoorNote, setStoreDoorNote] = useState('Depo kurye teslim kapısı arka sokaktadır.');
  const [merchantCurrPass, setMerchantCurrPass] = useState('');
  const [merchantNewPass, setMerchantNewPass] = useState('');
  const [merchantConfirmPass, setMerchantConfirmPass] = useState('');
  const [merchantFeedback, setMerchantFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  // If Market is pending Admin approval, enforce access restriction rule
  if (!isApproved) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Market Başvurunuz İnceleniyor</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            HızlıSepet operasyon ekibimiz vergi levhası ve yetkili imza belgelerinizi kontrol etmektedir.
            Güvenlik gereği <b>yönetici onayı olmadan satış paneli açılamaz</b>.
          </p>
        </div>

        {/* Application details card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800">
                {userApplication?.companyLegalName || 'İşletme Başvurusu'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              Durum: Onay Bekliyor
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>VKN (Vergi No): <b>{userApplication?.taxNo || '9840129384'}</b></div>
            <div>Vergi Dairesi: <b>{userApplication?.taxOffice || 'Antakya V.D.'}</b></div>
            <div>Tabela Adı: <b>{userApplication?.tradeName || 'Hatay Yöresel & Organik Market'}</b></div>
            <div>IBAN: <b className="font-mono text-[11px]">{userApplication?.iban || 'TR33 0006 ...'}</b></div>
          </div>
        </div>

        {/* Document verification checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700">Evrak İnceleme Durumu:</h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl text-xs overflow-hidden">
            {[
              { title: 'Vergi Levhası Doğrulaması', status: 'GİB Sistemi Üzerinden Teyit Edildi' },
              { title: 'İmza Sirküleri & Yetki Kontrolü', status: 'İnceleniyor (Operasyon Sırasında)' },
              { title: 'Faaliyet Belgesi & Sicil Gazetesi', status: 'Sistemde Kayıtlı' },
              { title: 'Pazaryeri Hizmet Sözleşmesi', status: 'Elektronik Olarak İmzalandı' },
            ].map((doc, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between bg-white">
                <span className="text-slate-800 font-medium">{doc.title}</span>
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" />
                  {doc.status}
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
              Yetkili <b>Yönetici (Admin)</b> girişi yaparak <b>Yönetim Masası</b> içerisinden bu başvuruyu tek tıkla onaylayabilirsiniz.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Approved Store Owner Portal
  const storeOrders = orders.filter(o => o.storeId === assignedStore.id);
  const storeRevenue = storeOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const commissionRate = assignedStore.commissionRatePct || 10;
  const platformFee = (storeRevenue * commissionRate) / 100;
  const netMerchantPayout = Math.max(0, storeRevenue - platformFee);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
      {/* Top Merchant Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{assignedStore.name}</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                ONAYLI İŞLETME
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Yetkili: {currentUser.name} · Vergi No: {assignedStore.taxNo || '1920394851'}
            </p>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'inventory', label: 'Ürün & Stok Yönetimi', icon: Boxes },
            { id: 'orders', label: 'Mağaza Siparişleri', icon: PackageCheck },
            { id: 'payouts', label: 'Hak Ediş & Mutabakat', icon: DollarSign },
            { id: 'settings', label: 'Mağaza Adresi & Şifre', icon: KeyRound },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
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
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 text-xs">
        <div className="p-3.5">
          <span className="text-slate-500 font-medium block">Toplam Brüt Satış</span>
          <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
            {storeRevenue.toFixed(2)} ₺
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{storeOrders.length} Sipariş Tamamlandı</span>
        </div>
        <div className="p-3.5">
          <span className="text-slate-500 font-medium block">Platform Komisyonu</span>
          <span className="text-lg font-black text-amber-700 font-mono tabular-nums">
            -%{commissionRate} ({platformFee.toFixed(2)} ₺)
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Sözleşmeli Sabit Oran</span>
        </div>
        <div className="p-3.5">
          <span className="text-slate-500 font-medium block">Net Mağaza Hak Edişi</span>
          <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
            {netMerchantPayout.toFixed(2)} ₺
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Haftalık Çarşamba IBAN Transferi</span>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-5 flex-1 overflow-y-auto min-h-[460px]">
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mağazanızda Satıştaki Ürünler / İlanlar</h3>
                <p className="text-xs text-slate-500">
                  Cloud Firestore bulut veritabanında saklanır; değişiklikler tüm cihazlarda anında güncellenir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProdName('');
                  setProdCat('Meyve & Sebze');
                  setProdSubcat('Taze Sebzeler');
                  setProdPrice('24.90');
                  setProdStock('30');
                  setProdUnit('kg');
                  setProdWeight('1 kg');
                  setProdBrand('Hatay Yöresel');
                  setProdImage('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80');
                  setProdDesc('Hatay tarlalarından taze toplanmış doğal ürün.');
                  setProdFeedback(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Ürün / İlan Ekle</span>
              </button>
            </div>

            {prodFeedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                <span>{prodFeedback}</span>
                <button onClick={() => setProdFeedback(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Ürün</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Fiyat</th>
                    <th className="py-2.5 px-3">Stok Adedi</th>
                    <th className="py-2.5 px-3">Durum</th>
                    <th className="py-2.5 px-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0"
                          onError={(e) => handleImageError(e, p.category)}
                        />
                        <div>
                          <div>{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.brand} · {p.weight}</div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.price.toFixed(2)} ₺</td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateProductStock(p.id, Math.max(0, p.stock - 1))}
                            className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center font-bold hover:bg-slate-300"
                          >
                            -
                          </button>
                          <span className="w-6 text-center">{p.stock}</span>
                          <button
                            onClick={() => updateProductStock(p.id, p.stock + 1)}
                            className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center font-bold hover:bg-slate-300"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stock > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.stock > 0 ? 'Satışta' : 'Tükendi'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setProdName(p.name);
                              setProdCat(p.category);
                              setProdSubcat(p.subcategory || '');
                              setProdPrice(p.price.toString());
                              setProdStock(p.stock.toString());
                              setProdUnit(p.unit || 'adet');
                              setProdWeight(p.weight || '1 adet');
                              setProdBrand(p.brand || '');
                              setProdImage(p.image);
                              setProdDesc(p.description || '');
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`"${p.name}" adlı ürünü silmek istediğinize emin misiniz?`)) {
                                const res = await deleteProduct(p.id);
                                setProdFeedback(res.message);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Katalogdan Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PRODUCT ADD / EDIT MODAL */}
            {isProductModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-bold">
                        {editingProduct ? 'Ürünü / İlanı Düzenle' : 'Yeni Ürün / İlan Ekle (Cloud Firestore)'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsProductModalOpen(false)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!prodName.trim()) return;
                      setIsSavingProduct(true);

                      const payload = {
                        name: prodName.trim(),
                        category: prodCat,
                        subcategory: prodSubcat,
                        price: parseFloat(prodPrice) || 10,
                        stock: parseInt(prodStock, 10) || 0,
                        unit: prodUnit,
                        weight: prodWeight,
                        brand: prodBrand,
                        image: prodImage || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
                        description: prodDesc,
                        barcode: editingProduct?.barcode || `869000${Date.now().toString().slice(-6)}`,
                      };

                      if (editingProduct) {
                        const res = await editProduct(editingProduct.id, payload);
                        setProdFeedback(res.message);
                      } else {
                        const res = await createProduct(payload);
                        setProdFeedback(res.message);
                      }

                      setIsSavingProduct(false);
                      setIsProductModalOpen(false);
                    }}
                    className="p-5 space-y-3.5 overflow-y-auto text-xs"
                  >
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Ürün / İlan Başlığı *
                      </label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Örn: Taze Hatay Defne Zeytini (1 kg)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Kategori
                        </label>
                        <select
                          value={prodCat}
                          onChange={(e) => setProdCat(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 bg-white"
                        >
                          <option value="Meyve & Sebze">Meyve & Sebze</option>
                          <option value="Süt & Kahvaltılık">Süt & Kahvaltılık</option>
                          <option value="Et, Tavuk & Balık">Et, Tavuk & Balık</option>
                          <option value="Fırın & Unlu Mamul">Fırın & Unlu Mamul</option>
                          <option value="Temel Gıda">Temel Gıda</option>
                          <option value="Atıştırmalık">Atıştırmalık</option>
                          <option value="İçecek">İçecek</option>
                          <option value="Hatay Yöresel">Hatay Yöresel</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Marka / Üretici
                        </label>
                        <input
                          type="text"
                          value={prodBrand}
                          onChange={(e) => setProdBrand(e.target.value)}
                          placeholder="Örn: Hatay Doğal"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Fiyat (TL) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-mono font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Stok Adedi *
                        </label>
                        <input
                          type="number"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-mono font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Gramaj / Birim
                        </label>
                        <input
                          type="text"
                          value={prodWeight}
                          onChange={(e) => setProdWeight(e.target.value)}
                          placeholder="Örn: 1 kg"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Ürün Görseli (Fotoğraf URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-mono text-[11px]"
                        />
                        {prodImage && (
                          <img
                            src={prodImage}
                            alt="Önizleme"
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                            onError={(e) => handleImageError(e, prodCat)}
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-500">
                        <span className="font-semibold">Hazır Görseller:</span>
                        <button
                          type="button"
                          onClick={() => setProdImage('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80')}
                          className="text-emerald-700 hover:underline"
                        >
                          Domates
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setProdImage('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80')}
                          className="text-emerald-700 hover:underline"
                        >
                          Salata
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setProdImage('https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80')}
                          className="text-emerald-700 hover:underline"
                        >
                          Süt
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setProdImage('https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80')}
                          className="text-emerald-700 hover:underline"
                        >
                          Yumurta
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Ürün Açıklaması
                      </label>
                      <textarea
                        rows={2}
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        placeholder="Ürün özellikleri ve saklama koşulları..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsProductModalOpen(false)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProduct}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {isSavingProduct ? 'Kaydediliyor...' : editingProduct ? 'Değişiklikleri Kaydet' : 'Firestore\'a Kaydet'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Mağazanıza Gelen Siparişler</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Sipariş No</th>
                    <th className="py-2.5 px-3">Müşteri</th>
                    <th className="py-2.5 px-3">Ürün Sayısı</th>
                    <th className="py-2.5 px-3">Tutar</th>
                    <th className="py-2.5 px-3">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storeOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{o.customer.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{o.items.length} Kalem</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.totalAmount.toFixed(2)} ₺</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {o.status === 'delivered' ? 'Teslim Edildi' : o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Finansal Hak Ediş ve Mutabakat Raporu</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Hak Ediş Hesabı (IBAN):</span>
                <span className="font-mono font-bold text-slate-900">TR12 0001 5001 5800 7291 0293 88</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Vergi Dairesi & No:</span>
                <span className="font-mono text-slate-900">Göztepe V.D. / 1920394851</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Sözleşmeli Komisyon Oranı:</span>
                <span className="font-mono font-bold text-amber-700">%{commissionRate}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-emerald-700">
                <span>Sonraki Ödeme Günü (Net Tutar):</span>
                <span>{netMerchantPayout.toFixed(2)} ₺</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STORE ADDRESS & PASSWORD MANAGEMENT */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {merchantFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  merchantFeedback.isError
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {merchantFeedback.isError ? <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                <span>{merchantFeedback.msg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form 1: Store Address & Delivery Zone */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!storeAddrLine.trim()) return;
                  const targetUserId = currentUser.id || 'usr-store-1';
                  const addrId = currentUser.addresses[0]?.id || 'addr-store-1';
                  updateUserAddress(targetUserId, addrId, {
                    title: 'İşletme Mağaza & Depo Adresi',
                    addressLine: storeAddrLine,
                    neighborhood: storeDistrict,
                    notes: storeDoorNote,
                  });
                  setMerchantFeedback({ msg: 'Mağaza açık adresi ve teslimat bölgesi başarıyla güncellendi.', isError: false });
                }}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Mağaza & Depo Adresi Güncelle</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mağaza Açık Adresi</label>
                  <input
                    type="text"
                    value={storeAddrLine}
                    onChange={(e) => setStoreAddrLine(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">İlçe / Bölge</label>
                    <input
                      type="text"
                      value={storeDistrict}
                      onChange={(e) => setStoreDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Teslimat Yarıçapı (km)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={storeRadius}
                      onChange={(e) => setStoreRadius(parseFloat(e.target.value) || 3.5)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kurye Kabul & Mal Kabul Kapısı Notu</label>
                  <input
                    type="text"
                    value={storeDoorNote}
                    onChange={(e) => setStoreDoorNote(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Mağaza Adres Bilgilerini Kaydet
                </button>
              </form>

              {/* Form 2: Merchant Password Change */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (merchantNewPass.length < 6) {
                    setMerchantFeedback({ msg: 'Yeni şifre en az 6 karakter olmalıdır.', isError: true });
                    return;
                  }
                  if (merchantNewPass !== merchantConfirmPass) {
                    setMerchantFeedback({ msg: 'Yeni şifreler eşleşmiyor.', isError: true });
                    return;
                  }
                  const res = updateUserPassword(currentUser.id, merchantNewPass);
                  setMerchantFeedback({ msg: res.message, isError: !res.success });
                  setMerchantCurrPass('');
                  setMerchantNewPass('');
                  setMerchantConfirmPass('');
                }}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>İşletme Giriş Şifresi Değiştir</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mevcut Şifre</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={merchantCurrPass}
                    onChange={(e) => setMerchantCurrPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Yeni İşletme Şifresi</label>
                  <input
                    type="password"
                    placeholder="En az 6 karakter"
                    value={merchantNewPass}
                    onChange={(e) => setMerchantNewPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Yeni Şifre Tekrarı</label>
                  <input
                    type="password"
                    placeholder="Yeni şifreyi tekrar girin"
                    value={merchantConfirmPass}
                    onChange={(e) => setMerchantConfirmPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  İşletme Şifresini Güncelle
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
