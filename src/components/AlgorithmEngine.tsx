import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateDeliveryETA, findSmartSubstitute } from '../services/geminiService';
import {
  Cpu,
  Lock,
  Zap,
  Activity,
  ShieldCheck,
  TrendingUp,
  Compass,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AlgorithmEngine: React.FC = () => {
  const { products, concurrencyLogs, runConcurrencySimulation } = useApp();

  // Concurrency simulator state
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'prod-1');
  const [simUsersCount, setSimUsersCount] = useState<number>(6);
  const [isSimulating, setIsSimulating] = useState(false);

  // Dynamic ETA & Surge Pricing interactive parameters
  const [distanceKm, setDistanceKm] = useState<number>(2.4);
  const [orderQueueCount, setOrderQueueCount] = useState<number>(14);
  const [availableCouriers, setAvailableCouriers] = useState<number>(4);
  const [weather, setWeather] = useState<'clear' | 'rain' | 'storm'>('rain');
  const [isPeakHour, setIsPeakHour] = useState<boolean>(true);

  // Substitute test product
  const [subTestProductId, setSubTestProductId] = useState<string>('prod-1');

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const subTestProduct = products.find(p => p.id === subTestProductId) || products[0];

  const calculatedEta = calculateDeliveryETA({
    distanceKm,
    orderQueueCount,
    availableCouriers,
    weather,
    timeOfDayPeak: isPeakHour,
  });

  const substituteMatch = findSmartSubstitute(subTestProduct, products);

  const handleRunConcurrencyTest = async () => {
    setIsSimulating(true);
    await runConcurrencySimulation(selectedProductId, simUsersCount);
    setIsSimulating(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Sipariş & Stok Motoru ve Algoritma Laboratuvarı</h2>
            <p className="text-xs text-slate-400">
              Getir ve Migros benzeri mimarilerde kullanılan eşzamanlılık kilidi, akıllı ETA ve muadil motoru
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto">
        {/* SECTION 1: Concurrency & Atomic Stock Reservation Simulator */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Eşzamanlı Satış ve Atomik Stok Kilitleme Testi (Race Condition & Mutex)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-semibold">
              Redis SETNX & Postgres Row-Level Locking
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Aynı anda yüzlerce kullanıcı son kalan ürünleri satın almaya çalıştığında stok eksiye düşmemelidir.
            Aşağıdaki simülatör, eşzamanlı checkout isteklerinde atomik rezervasyon kuyruğunu test eder.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Hedef Ürün ve Mevcut Stok
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-purple-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Eşzamanlı Yarışan Müşteri Sayısı: {simUsersCount} Kişi
              </label>
              <input
                type="range"
                min="2"
                max="15"
                value={simUsersCount}
                onChange={(e) => setSimUsersCount(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <button
              onClick={handleRunConcurrencyTest}
              disabled={isSimulating}
              className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulating ? 'İstekler İşleniyor...' : 'Eşzamanlı Satışı Simüle Et'}</span>
            </button>
          </div>

          {/* Concurrency Audit Terminal Log */}
          <div className="bg-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto border border-slate-800">
            <div className="text-slate-400 pb-1 border-b border-slate-800 flex justify-between">
              <span>// REDIS/POSTGRES ATOMIC TRANSACTION LOGS</span>
              <span className="text-emerald-400">STATUS: ACTIVE MUTEX</span>
            </div>
            {concurrencyLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between gap-2 hover:bg-slate-900 px-1 py-0.5 rounded">
                <span className="text-slate-400">{log.timestamp}</span>
                <span className="text-purple-300 font-bold">{log.user}</span>
                <span className="text-slate-200">{log.productName} ({log.quantityRequested} adet)</span>
                <span className="text-slate-400">
                  Stok: {log.stockBefore} → {log.stockAfter}
                </span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    log.status === 'SUCCESS_LOCKED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : log.status === 'FAILED_OUT_OF_STOCK'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {log.status} ({log.latencyMs}ms)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Dynamic ETA & Delivery Pricing Engine */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                2. Dinamik Teslimat Süresi (ETA) ve Yoğunluk Ücreti (Surge Pricing) Motoru
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold">
              Kapasite & Mesafe Optimizasyonu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interactive Inputs */}
            <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Müşteri - Depo Mesafesi:</span>
                  <span className="font-mono text-emerald-700">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-emerald-600 mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Aktif Bekleyen Sipariş Sayısı:</span>
                  <span className="font-mono text-emerald-700">{orderQueueCount} Adet</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={orderQueueCount}
                  onChange={(e) => setOrderQueueCount(Number(e.target.value))}
                  className="w-full accent-emerald-600 mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Bölgedeki Müsait Kurye:</span>
                  <span className="font-mono text-emerald-700">{availableCouriers} Kurye</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={availableCouriers}
                  onChange={(e) => setAvailableCouriers(Number(e.target.value))}
                  className="w-full accent-emerald-600 mt-1"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-700">Hava Koşulları:</span>
                <div className="flex gap-1">
                  {(['clear', 'rain', 'storm'] as const).map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeather(w)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                        weather === w
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {w === 'clear' && '☀️ Güneşli'}
                      {w === 'rain' && '🌧️ Yağmurlu'}
                      {w === 'storm' && '⚡ Fırtına'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-700">Akşam Zirve Saati (Peak Hour):</span>
                <button
                  type="button"
                  onClick={() => setIsPeakHour(!isPeakHour)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    isPeakHour ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isPeakHour ? 'Açık (Yoğun Saat)' : 'Kapalı (Normal Saat)'}
                </button>
              </div>
            </div>

            {/* Live Algorithm Outputs */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Canlı Algoritma Çıktısı
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-xs text-slate-300">Hesaplanan Varış Süresi (ETA):</span>
                    <h3 className="text-2xl font-black text-white font-mono">
                      {calculatedEta.etaMinutes} Dakika
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300">Dinamik Teslimat Ücreti:</span>
                    <h4 className="text-xl font-black text-emerald-400 font-mono">
                      {calculatedEta.deliveryFee.toFixed(2)} ₺
                    </h4>
                  </div>
                </div>
              </div>

              {/* Mathematical Formula Breakdown */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1 font-mono">
                <div className="text-slate-400 text-[10px]">// FORMÜL: T_prep + (Distance / Speed) + T_handover</div>
                <div className="flex justify-between text-slate-300">
                  <span>Hazırlık Süresi (T_prep):</span>
                  <span>{calculatedEta.prepTimeMinutes} dk</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Kurye Sürüşü (T_transit):</span>
                  <span>{calculatedEta.transitTimeMinutes} dk</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Adrese Teslim (T_handover):</span>
                  <span>{calculatedEta.handoverMinutes} dk</span>
                </div>
                <div className="flex justify-between text-amber-400 border-t border-slate-800 pt-1">
                  <span>Yoğunluk Çarpanı (Surge):</span>
                  <span>x{calculatedEta.surgeMultiplier}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Smart Substitute Similarity Engine */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                3. Akıllı Muadil & Alternatif Öneri Matrisi (Substitute Similarity Matrix)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-semibold">
              Kategori + Fiyat Toleransı + Gramaj Uyumu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Tükendiği Varsayılan Ürünü Seçin:
              </label>
              <select
                value={subTestProductId}
                onChange={(e) => setSubTestProductId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price.toFixed(2)} ₺)
                  </option>
                ))}
              </select>
            </div>

            {substituteMatch ? (
              <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wider">
                    Önerilen En İyi Muadil:
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{substituteMatch.substitute.name}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Benzerlik Skoru: %{substituteMatch.score} · {substituteMatch.reason}
                  </span>
                </div>
                <div className="text-right font-mono font-bold text-xs text-blue-900">
                  {substituteMatch.substitute.price.toFixed(2)} ₺
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Uygun muadil bulunamadı.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
