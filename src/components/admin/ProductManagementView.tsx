import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  LayoutGrid,
  List,
  Tag,
  AlertTriangle,
  AlertCircle,
  Eye,
  EyeOff,
  Percent,
  TrendingUp,
  RefreshCw,
  Barcode,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ProductFormModal } from './ProductFormModal';
import { BulkProductImportModal } from './BulkProductImportModal';
import { handleImageError } from '../../utils/imageFallback';

export const ProductManagementView: React.FC = () => {
  const {
    products,
    deleteProduct,
    updateProductStock,
    updateProductPrice,
    editProduct,
    bulkUpdateProducts,
    categories,
    stores,
  } = useApp();

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'critical' | 'out_of_stock'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'campaign' | 'popular' | 'new'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'default' | 'name_asc' | 'price_asc' | 'price_desc' | 'stock_desc' | 'stock_asc'>('default');

  // Multi-Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkValue, setBulkValue] = useState<number>(10);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  // Inline Quick Edit
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState<number>(0);
  const [inlineStock, setInlineStock] = useState<number>(0);

  // Filtered Products
  const filteredProducts = products
    .filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;

      const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 5;
      let matchesStock = true;
      if (stockFilter === 'critical') matchesStock = (p.stock || 0) > 0 && (p.stock || 0) <= minAlert;
      else if (stockFilter === 'out_of_stock') matchesStock = (p.stock || 0) <= 0;
      else if (stockFilter === 'in_stock') matchesStock = (p.stock || 0) > minAlert;

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = p.status !== 'passive';
      else if (statusFilter === 'passive') matchesStatus = p.status === 'passive';

      let matchesBadge = true;
      if (badgeFilter === 'campaign') matchesBadge = !!p.isCampaign || (!!p.originalPrice && p.originalPrice > p.price);
      else if (badgeFilter === 'popular') matchesBadge = !!(p.isPopular || p.isFeatured);
      else if (badgeFilter === 'new') matchesBadge = !!p.isNew;

      return matchesSearch && matchesCat && matchesBrand && matchesStock && matchesStatus && matchesBadge;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'tr');
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'stock_desc') return (b.stock || 0) - (a.stock || 0);
      if (sortBy === 'stock_asc') return (a.stock || 0) - (b.stock || 0);
      return (a.displayOrder || 999) - (b.displayOrder || 999);
    });

  // Distinct Brands
  const allBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  // Select all / deselect all
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleApplyBulkAction = async () => {
    if (selectedProductIds.length === 0) {
      alert('Lütfen işlem yapılacak ürünleri seçiniz.');
      return;
    }

    if (!bulkAction) {
      alert('Lütfen bir toplu işlem seçiniz.');
      return;
    }

    setIsApplyingBulk(true);
    try {
      if (bulkAction === 'set_active') {
        await bulkUpdateProducts(selectedProductIds, { status: 'active' }, 'Toplu Aktif Yapıldı');
      } else if (bulkAction === 'set_passive') {
        await bulkUpdateProducts(selectedProductIds, { status: 'passive' }, 'Toplu Pasif Yapıldı');
      } else if (bulkAction === 'add_stock') {
        for (const id of selectedProductIds) {
          const prod = products.find((p) => p.id === id);
          if (prod) {
            updateProductStock(id, (prod.stock || 0) + bulkValue);
          }
        }
      } else if (bulkAction === 'discount_pct') {
        for (const id of selectedProductIds) {
          const prod = products.find((p) => p.id === id);
          if (prod) {
            const currentPrice = prod.price;
            const newDiscountPrice = Math.max(1, currentPrice * (1 - bulkValue / 100));
            await editProduct(id, {
              originalPrice: prod.originalPrice || currentPrice,
              price: Number(newDiscountPrice.toFixed(2)),
              isCampaign: true,
            });
          }
        }
      } else if (bulkAction === 'delete_selected') {
        if (window.confirm(`Seçilen ${selectedProductIds.length} adet ürünü kalıcı olarak silmek istediğinize emin misiniz?`)) {
          for (const id of selectedProductIds) {
            await deleteProduct(id);
          }
        }
      }
      setSelectedProductIds([]);
      setBulkAction('');
    } catch (err: any) {
      alert('Toplu işlem hatası: ' + err.message);
    } finally {
      setIsApplyingBulk(false);
    }
  };

  // Export current catalog to Excel (.xlsx)
  const handleExportToExcel = () => {
    const exportData = filteredProducts.map((p) => ({
      'Ürün ID': p.id,
      'Barkod': p.barcode,
      'Ürün Adı': p.name,
      'Kategori': p.category,
      'Alt Kategori': p.subcategory || '',
      'Marka': p.brand,
      'Satış Fiyatı': p.price,
      'İndirimsiz Fiyat': p.originalPrice || '',
      'Alış Fiyatı': p.costPrice || '',
      'KDV Oranı': `%${p.vatRate || 1}`,
      'Stok': p.stock,
      'Birim': p.unit,
      'Gramaj': p.weight,
      'Durum': p.status === 'passive' ? 'Pasif' : 'Aktif',
      'Öne Çıkan': p.isFeatured || p.isPopular ? 'Evet' : 'Hayır',
      'Görsel URL': p.image,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Urun_Katalogu');
    XLSX.writeFile(workbook, `hataymarket_urun_katalogu_${Date.now()}.xlsx`);
  };

  // Inline Edit Save
  const handleStartInlineEdit = (p: Product) => {
    setInlineEditingId(p.id);
    setInlinePrice(p.price);
    setInlineStock(p.stock);
  };

  const handleSaveInlineEdit = async (id: string) => {
    updateProductPrice(id, inlinePrice);
    updateProductStock(id, inlineStock);
    setInlineEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              Ürün Kataloğu ve Mağaza Yönetimi
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8F7EF] text-[#00875A]">
              {products.length} Toplam Ürün
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ürün ekleyin, düzenleyin, fiyat ve stok güncelleyin; anında mobil uygulamaya senkronize edilir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Excel Catalog */}
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Tüm Ürün Kataloğunu Excel Olarak İndir"
          >
            <Download className="w-3.5 h-3.5 text-[#00875A]" />
            <span className="hidden md:inline">Kataloğu İndir (.xlsx)</span>
          </button>

          {/* Bulk Import from Excel */}
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#00875A] border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Excel ile Toplu Yükle</span>
          </button>

          {/* New Product Modal Trigger */}
          <button
            onClick={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00875A] hover:bg-[#006D48] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ürün Ekle</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters & Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ürün adı, barkod (EAN-13), marka veya kategori ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-medium"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none text-slate-700 font-semibold"
          >
            <option value="all">Tüm Kategoriler ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.iconEmoji} {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none text-slate-700 font-semibold"
          >
            <option value="all">Tüm Stok Seviyeleri</option>
            <option value="in_stock">✅ Stokta Var</option>
            <option value="critical">⚠️ Kritik Stok (&lt;5)</option>
            <option value="out_of_stock">⛔ Tükendi (0)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none text-slate-700 font-semibold"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Satışta (Aktif)</option>
            <option value="passive">Gizli (Pasif)</option>
          </select>

          {/* Badge Filter */}
          <select
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none text-slate-700"
          >
            <option value="all">Tüm Etiketler</option>
            <option value="campaign">Kampanyalı / İndirimli</option>
            <option value="popular">Öne Çıkanlar</option>
            <option value="new">Yeni Ürünler</option>
          </select>

          {/* Sort & View Switcher */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none text-slate-700"
            >
              <option value="default">Sıralama: Varsayılan</option>
              <option value="name_asc">İsim (A - Z)</option>
              <option value="price_asc">Fiyat (En Düşük)</option>
              <option value="price_desc">Fiyat (En Yüksek)</option>
              <option value="stock_desc">Stok (En Çok)</option>
              <option value="stock_asc">Stok (En Az)</option>
            </select>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
                title="Tablo Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
                title="Kart Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Toolbar (Appears when items are checked) */}
        {selectedProductIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-emerald-950">
                {selectedProductIds.length} ürün seçildi
              </span>
              <button
                onClick={() => setSelectedProductIds([])}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Seçimi Temizle
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
              >
                <option value="">Toplu İşlem Seçin...</option>
                <option value="set_active">Seçilenleri Aktif Yap (Satışa Aç)</option>
                <option value="set_passive">Seçilenleri Pasif Yap (Gizle)</option>
                <option value="add_stock">Seçilenlere Stok Ekle (+X adet)</option>
                <option value="discount_pct">Seçilenlere Yüzde İndirimi Uygula (%X)</option>
                <option value="delete_selected">Seçilenleri Veritabanından Sil</option>
              </select>

              {(bulkAction === 'add_stock' || bulkAction === 'discount_pct') && (
                <input
                  type="number"
                  min="1"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(Number(e.target.value))}
                  placeholder="Miktar"
                  className="w-20 px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold outline-none"
                />
              )}

              <button
                onClick={handleApplyBulkAction}
                disabled={!bulkAction || isApplyingBulk}
                className="px-4 py-1.5 bg-[#00875A] hover:bg-[#006D48] disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                {isApplyingBulk ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uygulanıyor...</span>
                  </>
                ) : (
                  <span>Uygula</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: DATA TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="cursor-pointer text-slate-500 hover:text-slate-900"
                    >
                      {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#00875A]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Ürün &amp; Barkod</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Marka</th>
                  <th className="py-3 px-3 text-right">Fiyat</th>
                  <th className="py-3 px-3 text-center">Stok</th>
                  <th className="py-3 px-3">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-xs">Aradığınız kriterde ürün bulunamadı.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    const isInline = inlineEditingId === p.id;
                    const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 5;
                    const isOutOfStock = (p.stock || 0) <= 0;
                    const isCritical = (p.stock || 0) > 0 && (p.stock || 0) <= minAlert;

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(p.id)}
                            className="cursor-pointer text-slate-400 hover:text-slate-900"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#00875A]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                              onError={(e) => handleImageError(e, p.category)}
                            />
                            <div>
                              <div className="font-extrabold text-slate-900 leading-tight">
                                {p.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {p.barcode} · {p.weight}
                              </div>
                              {/* Badges */}
                              <div className="flex items-center gap-1 mt-1">
                                {(p.isFeatured || p.isPopular) && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                    Öne Çıkan
                                  </span>
                                )}
                                {p.isNew && (
                                  <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                                    Yeni
                                  </span>
                                )}
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                                    İndirim
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600 font-medium">
                          <div>{p.category}</div>
                          {p.subcategory && (
                            <div className="text-[10px] text-slate-400">{p.subcategory}</div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-slate-700 font-semibold">{p.brand}</td>

                        <td className="py-3 px-3 font-mono font-bold text-right text-slate-900 tabular-nums">
                          {isInline ? (
                            <input
                              type="number"
                              step="0.5"
                              value={inlinePrice}
                              onChange={(e) => setInlinePrice(Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-[#00875A] rounded-lg text-xs font-mono font-bold"
                            />
                          ) : (
                            <div>
                              <div>{p.price.toFixed(2)} ₺</div>
                              {p.originalPrice && (
                                <div className="text-[10px] text-slate-400 line-through">
                                  {p.originalPrice.toFixed(2)} ₺
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                          {isInline ? (
                            <input
                              type="number"
                              value={inlineStock}
                              onChange={(e) => setInlineStock(Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-[#00875A] rounded-lg text-xs font-mono text-center font-bold"
                            />
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-lg border ${
                                isOutOfStock
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : isCritical
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-slate-50 text-slate-800 border-slate-200'
                              }`}
                            >
                              {p.stock} {p.unit}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => editProduct(p.id, { status: p.status === 'passive' ? 'active' : 'passive' })}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              p.status === 'passive'
                                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                            title="Tıklayarak aktif/pasif değiştir"
                          >
                            {p.status === 'passive' ? 'Pasif (Gizli)' : 'Aktif (Satışta)'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isInline ? (
                              <button
                                onClick={() => handleSaveInlineEdit(p.id)}
                                className="px-2.5 py-1 bg-[#00875A] hover:bg-[#006D48] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                              >
                                Kaydet
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartInlineEdit(p)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Hızlı Fiyat & Stok Düzelt"
                              >
                                Hızlı
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setProductToEdit(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Tüm Detayları Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={async () => {
                                if (window.confirm(`"${p.name}" adlı ürünü Firestore veritabanından kalıcı olarak silmek istediğinize emin misiniz?`)) {
                                  await deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Kalıcı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CARD GRID (Mobile Friendly) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((p) => {
            const isSelected = selectedProductIds.includes(p.id);
            const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 5;
            const isOutOfStock = (p.stock || 0) <= 0;
            const isCritical = (p.stock || 0) > 0 && (p.stock || 0) <= minAlert;

            return (
              <div
                key={p.id}
                className={`bg-white border rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-2xs transition-all relative ${
                  isSelected ? 'border-[#00875A] ring-1 ring-[#00875A]' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200"
                      onError={(e) => handleImageError(e, p.category)}
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(p.id)}
                      className="absolute -top-1.5 -left-1.5 bg-white rounded-md p-0.5 shadow-xs"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#00875A]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-xs text-slate-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{p.category}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.brand} · {p.weight}</div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-black text-sm text-slate-900">{p.price.toFixed(2)} ₺</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isOutOfStock
                            ? 'bg-red-100 text-red-800'
                            : isCritical
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => editProduct(p.id, { status: p.status === 'passive' ? 'active' : 'passive' })}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'passive' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {p.status === 'passive' ? 'Pasif' : 'Aktif'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setProductToEdit(p);
                        setIsProductModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`"${p.name}" adlı ürünü silmek istediğinize emin misiniz?`)) {
                          await deleteProduct(p.id);
                        }
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Form Modal (Add & Edit) */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* Bulk Import Modal (Excel & CSV) */}
      <BulkProductImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />
    </div>
  );
};
