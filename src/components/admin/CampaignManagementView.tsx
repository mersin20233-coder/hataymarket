import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Campaign } from '../../types';
import {
  Tag,
  Percent,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Boxes,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const CampaignManagementView: React.FC = () => {
  const { products, editProduct, campaigns } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('Haftanın Bereketli İndirimleri');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Discounted products currently in database
  const discountedProducts = products.filter(
    (p) => (p.originalPrice && p.originalPrice > p.price) || p.isCampaign
  );

  // Filtered products for modal selection
  const selectableProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === selectableProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(selectableProducts.map((p) => p.id));
    }
  };

  const handleApplyCampaign = async () => {
    if (selectedProductIds.length === 0) {
      alert('Lütfen kampanyaya dahil edilecek en az bir ürün seçiniz.');
      return;
    }

    setIsApplying(true);
    setFeedback(null);

    try {
      for (const id of selectedProductIds) {
        const prod = products.find((p) => p.id === id);
        if (prod) {
          const basePrice = prod.originalPrice || prod.price;
          const discounted = Math.max(1, basePrice * (1 - discountPercent / 100));
          await editProduct(id, {
            originalPrice: basePrice,
            price: Number(discounted.toFixed(2)),
            isCampaign: true,
          });
        }
      }

      setFeedback(`Başarılı! ${selectedProductIds.length} adet ürüne %${discountPercent} indirim tanımlandı ve fiyatlar güncellendi.`);
      setSelectedProductIds([]);
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      alert('Kampanya uygulanırken hata: ' + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const restoredPrice = prod.originalPrice || prod.price;
    await editProduct(id, {
      price: restoredPrice,
      originalPrice: undefined,
      isCampaign: false,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>Kampanya ve İndirim Yönetimi</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              {discountedProducts.length} İndirimli Ürün
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Seçilen ürünlere yüzde indirimleri tanımlayın, eski ve yeni fiyatları mobil uygulamada otomatik gösterin.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProductIds([]);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00875A] hover:bg-[#006D48] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Kampanya Tanımla</span>
        </button>
      </div>

      {/* Currently Discounted Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Aktif İndirimli ve Kampanyalı Ürünler</span>
          <span className="text-slate-500 font-mono">{discountedProducts.length} ürün indirimde</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[9px] font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Ürün</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Orijinal Fiyat</th>
                <th className="py-2.5 px-3 text-right">İndirimli Fiyat</th>
                <th className="py-2.5 px-3 text-center">İndirim Oranı</th>
                <th className="py-2.5 px-3 text-center">Stok</th>
                <th className="py-2.5 px-4 text-right">İndirimi Kaldır</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discountedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs">Şu anda aktif indirimli ürün bulunmuyor.</p>
                  </td>
                </tr>
              ) : (
                discountedProducts.map((p) => {
                  const orig = p.originalPrice || p.price;
                  const discountPct = Math.round(((orig - p.price) / orig) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono line-through text-slate-400">
                        {orig.toFixed(2)} ₺
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {p.price.toFixed(2)} ₺
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                          -%{discountPct > 0 ? discountPct : 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{p.stock} {p.unit}</td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleRemoveDiscount(p.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        >
                          İndirimi Bitir
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#00875A]" />
                <h4 className="font-extrabold text-sm text-slate-900">Toplu Ürün İndirimi ve Kampanya Oluştur</h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{feedback}</span>
              </div>
            )}

            <div className="space-y-3 text-xs flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kampanya Başlığı</label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">İndirim Oranı (%)</label>
                  <div className="flex items-center gap-1">
                    {[10, 15, 20, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                          discountPercent === pct
                            ? 'bg-[#00875A] text-white border-[#00875A]'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        %{pct}
                      </button>
                    ))}
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Product selector for campaign */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Kampanyaya Dahil Edilecek Ürünler ({selectedProductIds.length} Seçildi)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] font-bold text-[#00875A] hover:underline"
                  >
                    {selectedProductIds.length === selectableProducts.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Listede ara..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
                  {selectableProducts.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    const newPrice = p.price * (1 - discountPercent / 100);

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#00875A]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.category} · {p.brand}</div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="line-through text-slate-400 text-[10px]">{p.price.toFixed(2)} ₺</div>
                          <div className="text-emerald-700 font-bold">{newPrice.toFixed(2)} ₺</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleApplyCampaign}
                disabled={selectedProductIds.length === 0 || isApplying}
                className="px-5 py-2 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold rounded-xl text-xs transition-all disabled:bg-slate-300 cursor-pointer shadow-xs"
              >
                {isApplying ? 'Uygulanıyor...' : `${selectedProductIds.length} Ürüne %${discountPercent} İndirim Uygula`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
