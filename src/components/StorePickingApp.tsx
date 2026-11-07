import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { findSmartSubstitute } from '../services/geminiService';
import { Product } from '../types';
import { handleImageError } from '../utils/imageFallback';
import {
  PackageCheck,
  Barcode,
  Check,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Layers,
  Search
} from 'lucide-react';

export const StorePickingApp: React.FC = () => {
  const {
    orders,
    products,
    pickOrderItem,
    updateOrderStatus,
    couriers,
    activeStoreId,
    stores,
    setActiveViewMode,
  } = useApp();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [substituteModalItem, setSubstituteModalItem] = useState<{
    orderId: string;
    product: Product;
  } | null>(null);

  const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];

  // Orders that need picking or are being picked
  const storeOrders = orders.filter(
    o => o.status === 'created' || o.status === 'picking' || o.status === 'picked'
  );

  const activeOrder = storeOrders.find(o => o.id === selectedOrderId) || storeOrders[0];

  const handleItemCheck = (orderId: string, productId: string) => {
    pickOrderItem(orderId, productId);
  };

  const handleAssignSubstitute = (orderId: string, originalProductId: string, substitute: Product) => {
    pickOrderItem(orderId, originalProductId, substitute);
    setSubstituteModalItem(null);
  };

  const handleFinishPacking = (orderId: string) => {
    // Find first available courier
    const availableCour = couriers.find(c => c.status === 'available') || couriers[0];
    updateOrderStatus(orderId, 'on_the_way', availableCour.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Dark Store Sipariş Toplama İstasyonu (Picking Station)</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                {currentStore.neighborhood}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Personel barkod okutarak ürünleri toplar, eksik ürünlerde otomatik muadil önerilir.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewMode('merchant_portal')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Mağaza adresi ve işletme şifresini değiştir"
          >
            <span>🏪 Market Adres & Şifre Paneli</span>
          </button>
          <span className="text-xs text-slate-300 font-mono hidden sm:inline">
            Hazırlanacak: <b>{storeOrders.length}</b> Sipariş
          </span>
        </div>
      </div>

      {/* Main split grid: Order Queue Left, Picking Checklist Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[560px]">
        {/* Left: Incoming Orders Queue */}
        <div className="p-3 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bekleyen Sipariş Kuyruğu
            </span>
            <span className="text-[10px] font-mono text-slate-500">Hedef: &lt; 3 dk/paket</span>
          </div>

          <div className="space-y-2">
            {storeOrders.map(order => {
              const pickedCount = order.items.filter(i => i.picked).length;
              const isSelected = activeOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{order.orderNumber}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'picked'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status === 'picked' ? 'Toplandı (Kurye Bekliyor)' : 'Toplama Aşamasında'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium truncate">{order.customer.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{order.customer.neighborhood}</p>

                  {/* Progress bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{pickedCount} / {order.items.length} Kalem</span>
                      <span>%{Math.round((pickedCount / order.items.length) * 100)}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all"
                        style={{ width: `${(pickedCount / order.items.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {storeOrders.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                Kuyrukta bekleyen sipariş yok.
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Order Items Picking Checklist (2 Cols) */}
        <div className="md:col-span-2 p-4 flex flex-col justify-between space-y-4">
          {activeOrder ? (
            <div className="space-y-4">
              {/* Order Info & Customer Substitute Preference */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{activeOrder.orderNumber}</span>
                    <span className="text-xs text-slate-500">
                      · {activeOrder.items.length} Kalem Ürün
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Müşteri: <b>{activeOrder.customer.name}</b> · {activeOrder.customer.neighborhood}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Sipariş Saati:</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {new Date(activeOrder.createdAt).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Barcode scanner simulator strip */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="El terminali / Barkod okut (örn: 8690123456789)..."
                    value={barcodeQuery}
                    onChange={(e) => setBarcodeQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const matched = activeOrder.items.find(
                          i => i.product.barcode === barcodeQuery || i.product.name.toLowerCase().includes(barcodeQuery.toLowerCase())
                        );
                        if (matched) {
                          handleItemCheck(activeOrder.id, matched.product.id);
                          setBarcodeQuery('');
                        }
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const firstUnpicked = activeOrder.items.find(i => !i.picked);
                    if (firstUnpicked) handleItemCheck(activeOrder.id, firstUnpicked.product.id);
                  }}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 shrink-0"
                >
                  Sonraki Ürünü Okut
                </button>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Durum</th>
                      <th className="py-2.5 px-3">Ürün & Raf</th>
                      <th className="py-2.5 px-3">Adet</th>
                      <th className="py-2.5 px-3">Müşteri Tercihi</th>
                      <th className="py-2.5 px-3 text-right">Eylem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeOrder.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          item.picked ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleItemCheck(activeOrder.id, item.product.id)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                              item.picked
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-300 hover:border-amber-500 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-8 h-8 rounded object-cover bg-slate-100 shrink-0"
                              onError={(e) => handleImageError(e, item.product.category)}
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{item.product.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Raf: B-0{idx + 1} · {item.product.barcode}
                              </div>
                              {item.substitutedProduct && (
                                <span className="inline-block text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-semibold mt-0.5">
                                  Muadil Verildi: {item.substitutedProduct.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-bold font-mono text-slate-800">
                          {item.quantity} {item.product.unit}
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.substitutePreference === 'auto'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.substitutePreference === 'call'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {item.substitutePreference === 'auto' && 'Muadil Kabul Eder'}
                            {item.substitutePreference === 'call' && 'Arayıp Sorun'}
                            {item.substitutePreference === 'cancel' && 'İptal Edin'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          {!item.picked && (
                            <button
                              type="button"
                              onClick={() =>
                                setSubstituteModalItem({
                                  orderId: activeOrder.id,
                                  product: item.product,
                                })
                              }
                              className="px-2 py-1 text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 font-medium"
                            >
                              Stok Yok? Muadil Bul
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ready to pack action */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Toplama Tamamlandığında:</span>
                  <p className="text-[11px] text-slate-500">
                    Paket kurye teslim rafına konur ve en yakın kuryeye otomatik atama yapılır.
                  </p>
                </div>

                <button
                  onClick={() => handleFinishPacking(activeOrder.id)}
                  disabled={!activeOrder.items.every(i => i.picked)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Paketlendi & Kuryeye Ver</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400">
              Lütfen soldaki kuyruktan hazırlanacak siparişi seçin.
            </div>
          )}
        </div>
      </div>

      {/* Out of Stock & Substitute Recommendation Modal */}
      {substituteModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Stok Tükendi Uyarısı
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  "{substituteModalItem.product.name}" için Muadil Ürün Ata
                </h3>
              </div>
              <button
                onClick={() => setSubstituteModalItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Smart Algorithm Recommendation */}
            {(() => {
              const recommendation = findSmartSubstitute(substituteModalItem.product, products);
              if (!recommendation) {
                return (
                  <p className="text-xs text-slate-500 py-3">
                    Bu ürün için uygun stoklu alternatif bulunamadı. Müşteriye bildirim gönderilecektir.
                  </p>
                );
              }

              return (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Yapay Zekâ & Algoritmik Öneri (Skor: {recommendation.score}/100)</span>
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded font-mono font-bold">
                      {recommendation.reason}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={recommendation.substitute.image}
                        alt={recommendation.substitute.name}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                        onError={(e) => handleImageError(e, recommendation.substitute.category)}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{recommendation.substitute.name}</h4>
                        <span className="text-[11px] text-slate-500">
                          {recommendation.substitute.weight} · Stok: {recommendation.substitute.stock} {recommendation.substitute.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {recommendation.substitute.price.toFixed(2)} ₺
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Fark: {(recommendation.substitute.price - substituteModalItem.product.price).toFixed(2)} ₺
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleAssignSubstitute(
                        substituteModalItem.orderId,
                        substituteModalItem.product.id,
                        recommendation.substitute
                      )
                    }
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Bu Alternatifi Sepete Tanımla & Onayla</span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
