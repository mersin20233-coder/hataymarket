import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { handleImageError } from '../utils/imageFallback';
import {
  Bell,
  X,
  TrendingDown,
  Check,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceAlertModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  const {
    currentUser,
    isLoggedIn,
    openAuthModal,
    setPriceAlert,
    removePriceAlert,
    getPriceAlertForProduct,
    updateProductPrice,
  } = useApp();

  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const existingAlert = product ? getPriceAlertForProduct(product.id) : undefined;

  useEffect(() => {
    if (product) {
      if (existingAlert) {
        setTargetPriceInput(existingAlert.targetPrice.toString());
      } else {
        // Default target: approx 15% discount rounded to reasonable integer
        const defaultDiscount = Math.floor(product.price * 0.85);
        setTargetPriceInput(defaultDiscount.toString());
      }
      setFeedback(null);
    }
  }, [product, existingAlert]);

  if (!isOpen || !product) return null;

  const currentPrice = product.price;
  const numTarget = parseFloat(targetPriceInput);
  const discountPct = !isNaN(numTarget) && numTarget < currentPrice && numTarget > 0
    ? Math.round(((currentPrice - numTarget) / currentPrice) * 100)
    : 0;

  const handleQuickPercent = (pct: number) => {
    const discounted = Math.round(currentPrice * (1 - pct / 100));
    setTargetPriceInput(discounted.toString());
    setFeedback(null);
  };

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal('Fiyat alarmı kurabilmek için lütfen üye girişi yapınız.');
      return;
    }

    if (isNaN(numTarget) || numTarget <= 0) {
      setFeedback({ msg: 'Lütfen geçerli bir hedef fiyat giriniz.', isError: true });
      return;
    }

    if (numTarget >= currentPrice) {
      setFeedback({
        msg: `Hedef fiyat, mevcut fiyattan (${currentPrice.toFixed(2)} ₺) daha düşük olmalıdır.`,
        isError: true,
      });
      return;
    }

    const res = setPriceAlert(product.id, numTarget);
    setFeedback({ msg: res.message, isError: !res.success });
    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 1600);
    }
  };

  const handleDeleteAlert = () => {
    if (existingAlert) {
      removePriceAlert(existingAlert.id);
      setFeedback({ msg: 'Fiyat alarmı kaldırıldı.', isError: false });
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  // Quick test simulation for user demonstration
  const handleSimulatePriceDrop = () => {
    if (!numTarget || isNaN(numTarget) || numTarget >= currentPrice) {
      setFeedback({ msg: 'Simülasyon için geçerli bir hedef fiyat belirleyin.', isError: true });
      return;
    }

    setIsSimulating(true);
    // First ensure alert is saved
    setPriceAlert(product.id, numTarget);

    setTimeout(() => {
      // Simulate real merchant price update below target
      const dropPrice = Math.max(1, numTarget - 2);
      updateProductPrice(product.id, dropPrice);
      setIsSimulating(false);
      setFeedback({
        msg: `Fiyat gerçek olarak ${dropPrice.toFixed(2)} ₺ seviyesine düşürüldü! Bildiriminiz hazır.`,
        isError: false,
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E1E9E4] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#00875A] to-[#005236] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Akıllı Fiyat Alarmı</h3>
              <p className="text-[11px] text-[#E8F7EF]">İndirim olduğunda anında bildirim alın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Product Preview Card */}
          <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#E1E9E4] flex items-center gap-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-[#E1E9E4]"
              onError={(e) => handleImageError(e, product.category)}
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#00875A] uppercase tracking-wider block">
                {product.category}
              </span>
              <h4 className="font-bold text-xs text-[#17231D] truncate">{product.name}</h4>
              <p className="text-[11px] text-[#68766E]">{product.brand} · {product.weight}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[11px] text-[#68766E]">Güncel Fiyat:</span>
                <span className="text-sm font-extrabold text-[#17231D]">{currentPrice.toFixed(2)} ₺</span>
              </div>
            </div>
          </div>

          {/* Active Alert Banner if exists */}
          {existingAlert && (
            <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
              existingAlert.isTriggered
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-[#E8F7EF] border-[#00875A]/20 text-[#00875A]'
            }`}>
              <div className="flex items-center gap-2">
                {existingAlert.isTriggered ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Bell className="w-4 h-4 text-[#00875A] shrink-0" />
                )}
                <div>
                  <span className="font-extrabold block">
                    {existingAlert.isTriggered ? 'Alarm Tetiklendi!' : 'Fiyat Alarmı Kurulu'}
                  </span>
                  <span className="text-[11px] opacity-90">
                    Hedef: <b>{existingAlert.targetPrice.toFixed(2)} ₺</b> ve altı
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteAlert}
                className="text-xs text-red-600 hover:text-red-700 font-bold px-2.5 py-1 bg-white rounded-lg shadow-2xs border border-red-200 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kaldır</span>
              </button>
            </div>
          )}

          {/* Target Price Form */}
          <form onSubmit={handleSaveAlert} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#17231D] block mb-1">
                Bildirim Almak İstediğiniz Hedef Fiyat (TL):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max={currentPrice - 0.5}
                  value={targetPriceInput}
                  onChange={(e) => {
                    setTargetPriceInput(e.target.value);
                    setFeedback(null);
                  }}
                  placeholder="Örn: 200"
                  className="w-full text-lg font-extrabold text-[#17231D] pl-3 pr-16 py-3 bg-white border border-[#E1E9E4] rounded-2xl outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A]"
                  required
                />
                <span className="absolute right-4 top-3.5 text-sm font-bold text-[#68766E]">
                  ₺ ve altı
                </span>
              </div>
            </div>

            {/* Quick Percentage Chips */}
            <div>
              <span className="text-[11px] font-bold text-[#68766E] block mb-2">Hızlı İndirim Seçenekleri:</span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[10, 15, 20, 25].map(pct => {
                  const calculated = Math.round(currentPrice * (1 - pct / 100));
                  const isSelected = numTarget === calculated;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickPercent(pct)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00875A] text-white border-[#00875A] shadow-xs'
                          : 'bg-[#F7FAF8] hover:bg-[#E8F7EF] border-[#E1E9E4] text-[#17231D]'
                      }`}
                    >
                      <div className="font-extrabold text-[11px]">-%{pct}</div>
                      <div className="text-[10px] opacity-80">{calculated} ₺</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount Summary Card */}
            {discountPct > 0 && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    İndirim Oranı: <b>%{discountPct}</b> tasarruf
                  </span>
                </div>
                <span className="font-mono font-extrabold text-emerald-800">
                  -{(currentPrice - numTarget).toFixed(2)} ₺
                </span>
              </div>
            )}

            {/* Feedback message */}
            {feedback && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${
                feedback.isError
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                {feedback.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.msg}</span>
              </div>
            )}

            {/* Explanatory Note */}
            <p className="text-[11px] text-[#68766E] leading-relaxed">
              * Bu ürünün gerçek market satış fiyatı <b>{numTarget || 200} ₺</b> seviyesine veya altına indiğinde tarafınıza anında bildirim gönderilir. Bildirimler yalnızca mağazanın gerçek fiyat revizyonlarına dayanır.
            </p>

            {/* Submit Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>{existingAlert ? 'Fiyat Alarmını Güncelle' : 'Fiyat Alarmını Kur'}</span>
              </button>

              {/* Demo test button to test immediate trigger */}
              <button
                type="button"
                onClick={handleSimulatePriceDrop}
                disabled={isSimulating}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Fiyatı düşürerek alarmın çalıştığını anında test edin"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {isSimulating ? 'Fiyat Düşürülüyor...' : '⚡ Hemen Test Et (Fiyatı Hedefe İndir)'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
