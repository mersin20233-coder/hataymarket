import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriceAlert, Product } from '../types';
import { handleImageError } from '../utils/imageFallback';
import {
  Bell,
  ChevronLeft,
  Trash2,
  Edit2,
  ShoppingBag,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Plus
} from 'lucide-react';

interface Props {
  onBack: () => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenAlertModal: (product: Product) => void;
}

export const PriceAlertsView: React.FC<Props> = ({
  onBack,
  onOpenProductDetail,
  onOpenAlertModal,
}) => {
  const {
    priceAlerts,
    removePriceAlert,
    products,
    addToCart,
    updateProductPrice,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('Tümü');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const categories = [
    'Tümü',
    'Çay ve Kahve',
    'Bebek Ürünleri',
    'Temizlik',
    'Kişisel Bakım',
    'Evcil Hayvan Ürünleri',
  ];

  const filteredAlerts = priceAlerts.filter(alert => {
    if (categoryFilter === 'Tümü') return true;
    return alert.category === categoryFilter;
  });

  const handleAddToCart = (productId: string, productName: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      addToCart(prod, 'auto');
      setAddedNotice(`"${productName}" avantajlı fiyatıyla sepete eklendi!`);
      setTimeout(() => setAddedNotice(null), 3000);
    }
  };

  const handleTestPriceDrop = (alert: PriceAlert) => {
    const dropPrice = Math.max(1, alert.targetPrice - 5);
    updateProductPrice(alert.productId, dropPrice);
    setAddedNotice(`"${alert.productName}" fiyatı ${dropPrice.toFixed(2)} ₺ olarak güncellendi ve alarm tetiklendi!`);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-[#17231D] flex items-center gap-1.5">
              <span>Akıllı Fiyat Alarmlarım</span>
              <span className="text-xs bg-[#E8F7EF] text-[#00875A] px-2 py-0.5 rounded-full font-bold">
                {priceAlerts.length}
              </span>
            </h2>
            <p className="text-[11px] text-[#68766E]">Takipteki ürünler hedeflenen fiyata düştüğünde bildirim alırsınız</p>
          </div>
        </div>
      </div>

      {/* Info Card with User Prompt Example */}
      <div className="bg-gradient-to-r from-[#00875A] to-[#005236] p-4 rounded-3xl text-white shadow-sm flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-amber-300" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-extrabold text-sm text-white">Nasıl Çalışır?</h4>
          <p className="text-[11px] text-[#E8F7EF] leading-relaxed">
            İstediğiniz ürün için bir hedef fiyat belirlersiniz (Örn: <i>"Bu kahvenin fiyatı 200 TL'nin altına düşerse bana bildir"</i>). Mağaza fiyatı güncellediğinde anında bildirim alırsınız.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {addedNotice && (
        <div className="p-3 bg-[#E8F7EF] border border-[#00875A]/30 text-[#00875A] rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#68766E] block">Kullanım Alanına Göre Filtrele:</span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl border font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#00875A] text-white border-[#00875A] shadow-xs'
                  : 'bg-white text-[#17231D] border-[#E1E9E4] hover:border-[#00875A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-3xl border border-[#E1E9E4] space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#E8F7EF] text-[#00875A] flex items-center justify-center mx-auto">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-sm text-[#17231D]">Henüz Bu Kategoride Alarm Yok</h3>
          <p className="text-xs text-[#68766E] max-w-xs mx-auto">
            Kahve, bebek bezi, temizlik veya mama ürünlerinde fiyat alarmı kurarak fırsatları ilk siz yakalayın.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#00875A] text-white font-bold text-xs rounded-xl hover:bg-[#006D48] transition-colors"
          >
            Ürünleri Keşfet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => {
            const currentProd = products.find(p => p.id === alert.productId);
            const livePrice = currentProd ? currentProd.price : alert.currentPrice;
            const isMet = livePrice <= alert.targetPrice;

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-3xl p-4 shadow-xs space-y-3 transition-all ${
                  isMet
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-[#E1E9E4] hover:border-[#00875A]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={alert.productImage}
                    alt={alert.productName}
                    onClick={() => currentProd && onOpenProductDetail(currentProd)}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-[#E1E9E4] shrink-0 cursor-pointer hover:opacity-90"
                    onError={(e) => handleImageError(e, alert.category)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-[#00875A] uppercase tracking-wider block truncate">
                        {alert.category}
                      </span>
                      {isMet ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>HEDEFE ULAŞTI!</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>İndirim Bekleniyor</span>
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => currentProd && onOpenProductDetail(currentProd)}
                      className="font-bold text-xs text-[#17231D] truncate mt-0.5 cursor-pointer hover:text-[#00875A]"
                    >
                      {alert.productName}
                    </h4>
                    <p className="text-[11px] text-[#68766E]">{alert.productBrand}</p>

                    {/* Price Comparison Strip */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#E1E9E4] text-xs">
                      <div>
                        <span className="text-[10px] text-[#68766E] block">Hedef Fiyatınız:</span>
                        <span className="font-extrabold text-[#00875A]">
                          {alert.targetPrice.toFixed(2)} ₺ ve altı
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#68766E] block">Güncel Satış Fiyatı:</span>
                        <span className={`font-extrabold ${isMet ? 'text-emerald-700' : 'text-[#17231D]'}`}>
                          {livePrice.toFixed(2)} ₺
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => currentProd && onOpenAlertModal(currentProd)}
                      className="px-2.5 py-1 text-slate-700 hover:text-[#00875A] hover:bg-[#E8F7EF] rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Hedefi Güncelle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removePriceAlert(alert.id)}
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Kaldır</span>
                    </button>
                  </div>

                  {isMet ? (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(alert.productId, alert.productName)}
                      className="px-3.5 py-1.5 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer text-xs active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Sepete Ekle</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTestPriceDrop(alert)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold flex items-center gap-1 text-[10px] transition-colors cursor-pointer"
                      title="Fiyatı düşürerek alarmı hemen tetikle"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Hemen İndir (Test)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
