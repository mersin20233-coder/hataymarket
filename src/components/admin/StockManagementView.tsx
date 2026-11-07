import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StockMovementLog } from '../../types';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Minus,
  Clock,
  History,
  FileSpreadsheet,
  Download,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { handleImageError } from '../../utils/imageFallback';

export const StockManagementView: React.FC = () => {
  const { products, updateProductStock, stockMovementLogs, addStockMovement, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'critical' | 'out_of_stock' | 'in_stock'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // Quick Adjustment Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(10);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustmentReason, setAdjustmentReason] = useState<StockMovementLog['reason']>('purchase_delivery');
  const [reasonNotes, setReasonNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Metrics
  const totalStockItems = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const outOfStockProducts = products.filter((p) => (p.stock || 0) <= 0);
  const criticalStockProducts = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.minStockAlert || 5));
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStatus = true;
    const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 5;
    if (stockStatusFilter === 'critical') {
      matchesStatus = (p.stock || 0) > 0 && (p.stock || 0) <= minAlert;
    } else if (stockStatusFilter === 'out_of_stock') {
      matchesStatus = (p.stock || 0) <= 0;
    } else if (stockStatusFilter === 'in_stock') {
      matchesStatus = (p.stock || 0) > minAlert;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open Quick Adjust Modal
  const handleOpenAdjustModal = (product: Product, defaultType: 'add' | 'subtract' | 'set' = 'add') => {
    setSelectedProduct(product);
    setAdjustmentType(defaultType);
    setAdjustmentAmount(defaultType === 'set' ? product.stock : 10);
    setAdjustmentReason(defaultType === 'add' ? 'purchase_delivery' : defaultType === 'subtract' ? 'damaged_waste' : 'manual_adjustment');
    setReasonNotes('');
    setIsModalOpen(true);
  };

  // Submit Adjustment
  const handleConfirmAdjustment = () => {
    if (!selectedProduct) return;

    let newStock = selectedProduct.stock;
    if (adjustmentType === 'add') {
      newStock = selectedProduct.stock + adjustmentAmount;
    } else if (adjustmentType === 'subtract') {
      newStock = Math.max(0, selectedProduct.stock - adjustmentAmount);
    } else {
      newStock = Math.max(0, adjustmentAmount);
    }

    const reasonTexts: Record<StockMovementLog['reason'], string> = {
      purchase_delivery: 'Mal Kabul / Sevkiyat',
      manual_adjustment: 'Manuel Stok Düzeltme',
      damaged_waste: 'Hasarlı / Fire Ayrıldı',
      customer_return: 'Müşteri İadesi',
      stock_count: 'Depo Sayım Farkı',
      bulk_update: 'Toplu Stok Güncelleme',
      order_deduction: 'Sipariş Çıkışı',
    };

    updateProductStock(selectedProduct.id, newStock);
    addStockMovement(
      selectedProduct.id,
      newStock,
      adjustmentReason,
      reasonTexts[adjustmentReason] || 'Stok Güncelleme',
      reasonNotes ? reasonNotes.trim() : undefined
    );

    setIsModalOpen(false);
  };

  // Export Stock Movement History to Excel
  const handleExportHistoryToExcel = () => {
    const exportData = stockMovementLogs.map((log) => ({
      'Kayıt ID': log.id,
      'Tarih & Saat': log.timestamp,
      'Ürün Adı': log.productName,
      'Barkod': log.productBarcode,
      'Önceki Stok': log.previousStock,
      'Yeni Stok': log.newStock,
      'Değişim': log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount,
      'İşlem Nedeni': log.reasonText,
      'Açıklama': log.notes || '-',
      'Yetkili Admin': log.adminName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok_Hareketleri');
    XLSX.writeFile(workbook, `hataymarket_stok_hareketleri_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Toplam Stok Adedi</span>
            <Boxes className="w-4 h-4 text-[#00875A]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalStockItems.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{products.length} farklı ürün kalemi</div>
        </div>

        <div
          onClick={() => { setStockStatusFilter('critical'); setActiveTab('inventory'); }}
          className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl shadow-xs cursor-pointer hover:bg-amber-100/70 transition-all"
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>Kritik Stok Uyarısı</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{criticalStockProducts.length}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Stok eşiğinin altına düşenler</div>
        </div>

        <div
          onClick={() => { setStockStatusFilter('out_of_stock'); setActiveTab('inventory'); }}
          className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl shadow-xs cursor-pointer hover:bg-rose-100/70 transition-all"
        >
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
            <span>Tükenen / Stokta Yok</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1">{outOfStockProducts.length}</div>
          <div className="text-[10px] text-rose-700 mt-0.5">Sipariş verilemeyen ürünler</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Depo Stok Değeri</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalInventoryValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Canlı perakende satış değeri</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Anlık Depo Stok Kataloğu ({filteredProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Stok Hareketleri Geçmişi ({stockMovementLogs.length})</span>
          </button>
        </div>

        {activeTab === 'history' && (
          <button
            onClick={handleExportHistoryToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#00875A] border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel Olarak İndir</span>
          </button>
        )}
      </div>

      {/* TAB 1: INVENTORY TABLE & QUICK STOCK ADJUSTMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Ürün adı, barkod veya marka ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs"
                />
              </div>

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none font-bold text-slate-700"
              >
                <option value="all">Tüm Stok Durumları</option>
                <option value="critical">⚠️ Kritik Stok (Eşik Altı)</option>
                <option value="out_of_stock">⛔ Tükendi (Stok 0)</option>
                <option value="in_stock">✅ Stokta Yeterli</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none text-slate-700"
              >
                <option value="all">Tüm Kategoriler</option>
                {Array.from(new Set(products.map((p) => p.category))).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Stock Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ürün &amp; Barkod</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-right">Fiyat</th>
                    <th className="py-3 px-3 text-center">Mevcut Stok</th>
                    <th className="py-3 px-3">Durum</th>
                    <th className="py-3 px-4 text-right">Hızlı Stok İşlemi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 5;
                    const isOutOfStock = (p.stock || 0) <= 0;
                    const isCritical = (p.stock || 0) > 0 && (p.stock || 0) <= minAlert;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                              onError={(e) => handleImageError(e, p.category)}
                            />
                            <div>
                              <div className="font-extrabold text-slate-900">{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {p.brand} · Barkod: <span className="font-semibold text-slate-600">{p.barcode}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600 font-medium">{p.category}</td>

                        <td className="py-3 px-3 font-mono font-bold text-right text-slate-900 tabular-nums">
                          {p.price.toFixed(2)} ₺
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-black text-sm tabular-nums">
                          <span
                            className={`px-2.5 py-1 rounded-xl border ${
                              isOutOfStock
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : isCritical
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-50 text-slate-900 border-slate-200'
                            }`}
                          >
                            {p.stock} {p.unit}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {isOutOfStock ? (
                            <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Tükendi</span>
                            </span>
                          ) : isCritical ? (
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Kritik (Eşik: {minAlert})</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Yeterli</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                updateProductStock(p.id, Math.max(0, p.stock - 1));
                                addStockMovement(p.id, Math.max(0, p.stock - 1), 'manual_adjustment', 'Tekli Azaltma (-1)');
                              }}
                              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                              title="1 Azalt"
                            >
                              -1
                            </button>

                            <button
                              onClick={() => {
                                updateProductStock(p.id, p.stock + 1);
                                addStockMovement(p.id, p.stock + 1, 'manual_adjustment', 'Tekli Artırma (+1)');
                              }}
                              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                              title="1 Artır"
                            >
                              +1
                            </button>

                            <button
                              onClick={() => handleOpenAdjustModal(p, 'add')}
                              className="px-2.5 py-1 bg-[#00875A] hover:bg-[#006D48] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              + Stok Ekle
                            </button>

                            <button
                              onClick={() => handleOpenAdjustModal(p, 'set')}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Stok Miktarını Düzelt"
                            >
                              Düzelt
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOG HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Tüm Stok Giriş, Çıkış ve Düzeltme Kayıtları</span>
            <span className="text-slate-400 font-mono">{stockMovementLogs.length} hareket kaydedildi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[9px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Tarih &amp; Saat</th>
                  <th className="py-2.5 px-3">Ürün Adı</th>
                  <th className="py-2.5 px-3">İşlem Nedeni</th>
                  <th className="py-2.5 px-3 text-center">Önceki</th>
                  <th className="py-2.5 px-3 text-center">Değişim</th>
                  <th className="py-2.5 px-3 text-center">Yeni Stok</th>
                  <th className="py-2.5 px-3">Yetkili Admin</th>
                  <th className="py-2.5 px-4">Açıklama / Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {stockMovementLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold font-sans text-slate-900">{log.productName}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.reasonText}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">{log.previousStock}</td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={log.changeAmount > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-900">{log.newStock}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{log.adminName}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500 italic text-[10px]">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Adjustment Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Stok Hareketi Girişi</h4>
                <p className="text-[11px] text-slate-500 truncate max-w-[260px]">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Stock Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">Mevcut Depo Stoğu:</span>
              <span className="font-black text-base text-slate-900 font-mono">
                {selectedProduct.stock} {selectedProduct.unit}
              </span>
            </div>

            {/* Action Type */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">İşlem Türü</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    adjustmentType === 'add'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  + Stok Ekle
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentType('subtract')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    adjustmentType === 'subtract'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  - Stok Düş
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentType('set')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    adjustmentType === 'set'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  = Sabitle
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">
                {adjustmentType === 'set' ? 'Yeni Stok Miktarı' : 'Eklenecek / Düşülecek Miktar'}
              </label>
              <input
                type="number"
                min="0"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 outline-none focus:border-[#00875A] focus:bg-white"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">Hareket Nedeni</label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none text-slate-800"
              >
                <option value="purchase_delivery">Mal Kabul / Tedarikçi Sevkiyatı</option>
                <option value="manual_adjustment">Manuel Sayım Düzeltmesi</option>
                <option value="damaged_waste">Hasarlı / Son Kullanma Tarihi / Fire</option>
                <option value="customer_return">Müşteri İadesi Depoya Alındı</option>
                <option value="stock_count">Periyodik Mağaza Sayımı</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">İşlem Notu (Opsiyonel)</label>
              <input
                type="text"
                placeholder="Örn: Fatura No, İrsaliye veya Sayım Tutanağı"
                value={reasonNotes}
                onChange={(e) => setReasonNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>

            {/* Result preview */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between font-bold">
              <span>İşlem Sonrası Stok:</span>
              <span className="font-mono text-sm">
                {adjustmentType === 'add'
                  ? selectedProduct.stock + adjustmentAmount
                  : adjustmentType === 'subtract'
                    ? Math.max(0, selectedProduct.stock - adjustmentAmount)
                    : adjustmentAmount}{' '}
                {selectedProduct.unit}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                İptal
              </button>

              <button
                type="button"
                onClick={handleConfirmAdjustment}
                className="px-5 py-2 bg-[#00875A] hover:bg-[#006D48] text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-xs"
              >
                Onayla ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
