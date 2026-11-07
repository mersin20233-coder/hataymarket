import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  callAIShoppingAssistant,
  AIShoppingAssistantResult,
  AssistantIngredient,
  CandidateProduct
} from '../services/geminiService';
import { handleImageError } from '../utils/imageFallback';
import {
  Sparkles,
  ChevronLeft,
  Search,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  TrendingDown,
  ShoppingBag,
  Store,
  Zap,
  ArrowRight,
  RotateCcw,
  Plus,
  Minus,
  CheckSquare,
  Square,
  ShieldAlert,
  ChefHat,
  X
} from 'lucide-react';

interface Props {
  onBackToStore: () => void;
  onOpenCart: () => void;
}

export const AIShoppingAssistant: React.FC<Props> = ({ onBackToStore, onOpenCart }) => {
  const { products, stores, activeStoreId, addToCart } = useApp();

  const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];

  // User query & preference
  const [prompt, setPrompt] = useState('4 kişilik tavuk sote ve pilav yapmak istiyorum. En uygun fiyatlı malzemeleri bul.');
  const [preference, setPreference] = useState<'cheapest' | 'fastest' | 'preferred_store'>('cheapest');
  
  // Loading & Result state
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIShoppingAssistantResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected state per ingredient
  // ingredientIndex -> { selectedProductId: string, quantity: number, isChecked: boolean }
  const [itemSelections, setItemSelections] = useState<
    Record<number, { productId: string; quantity: number; isChecked: boolean }>
  >({});

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<{ count: number; total: number } | null>(null);

  // Quick prompt chips
  const promptSuggestions = [
    '4 kişilik tavuk sote ve pilav yapmak istiyorum. En uygun fiyatlı malzemeleri bul.',
    'Geleneksel Tereyağlı Köy Menemeni (2 Kişilik)',
    'Hafta sonu zengin serpme kahvaltısı ve fırın ekmeği',
    'Yüksek proteinli fit akşam yemeği malzemeleri',
    'Akdeniz usulü domates & biber soslu spagetti',
  ];

  const handleAnalyze = async (customPrompt?: string) => {
    const query = (customPrompt || prompt).trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg(null);
    setAddedToast(null);

    try {
      const res = await callAIShoppingAssistant({
        prompt: query,
        preference,
        preferredStoreName: currentStore.name,
        availableProducts: products,
      });

      setResult(res);

      // Initialize selections for each ingredient
      const initialSelections: Record<number, { productId: string; quantity: number; isChecked: boolean }> = {};
      res.ingredients.forEach((ing, idx) => {
        const defaultCandidate = ing.candidates.find(c => c.productId === ing.selectedProductId) || ing.candidates[0];
        initialSelections[idx] = {
          productId: defaultCandidate ? defaultCandidate.productId : ing.selectedProductId,
          quantity: ing.selectedProductQuantity || 1,
          isChecked: true,
        };
      });
      setItemSelections(initialSelections);
    } catch (err: any) {
      setErrorMsg(err.message || 'Asistan yanıt verirken bir sorun oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection checkbox
  const toggleItemCheck = (idx: number) => {
    setItemSelections(prev => {
      const cur = prev[idx];
      if (!cur) return prev;
      return {
        ...prev,
        [idx]: { ...cur, isChecked: !cur.isChecked },
      };
    });
  };

  // Change candidate product for an ingredient
  const switchCandidateProduct = (idx: number, newProductId: string) => {
    setItemSelections(prev => {
      const cur = prev[idx];
      return {
        ...prev,
        [idx]: { ...cur, productId: newProductId },
      };
    });
  };

  // Adjust quantity
  const updateItemQty = (idx: number, delta: number) => {
    setItemSelections(prev => {
      const cur = prev[idx];
      if (!cur) return prev;
      const newQty = Math.max(1, cur.quantity + delta);
      return {
        ...prev,
        [idx]: { ...cur, quantity: newQty },
      };
    });
  };

  // Add a single ingredient to cart
  const handleAddSingleToCart = (ingIdx: number) => {
    const selection = itemSelections[ingIdx];
    if (!selection) return;
    const p = products.find(prod => prod.id === selection.productId);
    if (!p || p.stock <= 0) return;

    for (let i = 0; i < selection.quantity; i++) {
      addToCart(p, 'auto');
    }

    setAddedToast({ count: selection.quantity, total: p.price * selection.quantity });
    setTimeout(() => setAddedToast(null), 4000);
  };

  // Calculate selected total summary
  const selectedItemsList = result
    ? result.ingredients
        .map((ing, idx) => {
          const sel = itemSelections[idx];
          if (!sel || !sel.isChecked) return null;
          const prod = products.find(p => p.id === sel.productId);
          if (!prod) return null;
          return {
            ingredientName: ing.ingredientName,
            product: prod,
            quantity: sel.quantity,
            totalPrice: prod.price * sel.quantity,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];

  const selectedTotalAmount = selectedItemsList.reduce((sum, item) => sum + item.totalPrice, 0);

  // Confirm and add all checked items to cart
  const handleConfirmAddSelectedToCart = () => {
    let addedCount = 0;
    selectedItemsList.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product, 'auto');
        addedCount++;
      }
    });

    setIsConfirmModalOpen(false);
    setAddedToast({ count: addedCount, total: selectedTotalAmount });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Top Header with Back Button */}
      <div className="bg-slate-900 text-white p-3 shrink-0 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Markete Geri Dön"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
            <span>Markete Dön</span>
          </button>

          <div className="text-center">
            <h2 className="text-xs font-extrabold tracking-tight flex items-center justify-center gap-1.5 text-white">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yapay Zekâlı Alışveriş Asistanı</span>
            </h2>
            <p className="text-[10px] text-slate-400">MarketimHatay Akıllı Tarif & Fiyat Optimizasyonu</p>
          </div>

          <button
            onClick={onOpenCart}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors cursor-pointer"
            title="Sepeti Görüntüle"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Preference / Optimization Toggles */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <label className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Alışveriş Optimizasyon Kriteri:</span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {preference === 'cheapest' && 'En Ekonomik Birim Fiyat'}
              {preference === 'fastest' && 'En Hızlı Teslimat (15 dk)'}
              {preference === 'preferred_store' && currentStore.neighborhood}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setPreference('cheapest')}
              className={`p-2 rounded-lg font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                preference === 'cheapest'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>En Uygun Fiyat</span>
            </button>

            <button
              type="button"
              onClick={() => setPreference('fastest')}
              className={`p-2 rounded-lg font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                preference === 'fastest'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>En Hızlı Teslimat</span>
            </button>

            <button
              type="button"
              onClick={() => setPreference('preferred_store')}
              className={`p-2 rounded-lg font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                preference === 'preferred_store'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Store className="w-4 h-4 text-blue-500" />
              <span>Tercihli Market</span>
            </button>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <label className="text-xs font-bold text-slate-800 block">
            Ne Pişirmek veya Satın Almak İstiyorsunuz?
          </label>
          <div className="relative">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örn: 4 kişilik tavuk sote ve pilav yapmak istiyorum. En uygun fiyatlı malzemeleri bul."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 resize-none"
            />
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Hızlı Örnek İstekler:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(item);
                    handleAnalyze(item);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-lg transition-colors cursor-pointer text-left line-clamp-1 border border-slate-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze CTA button */}
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Yapay Zekâ Malzemeleri Analiz Ediyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Malzemeleri Bul ve Karşılaştır</span>
              </>
            )}
          </button>
        </div>

        {/* Added to cart toast feedback */}
        {addedToast && (
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{addedToast.count} adet malzeme sepete eklendi ({addedToast.total.toFixed(2)} ₺)!</span>
            </div>
            <button
              onClick={onOpenCart}
              className="px-2 py-1 bg-white text-emerald-800 rounded-lg text-[10px] font-extrabold hover:bg-emerald-50 transition-colors cursor-pointer shadow-xs"
            >
              Sepeti Aç
            </button>
          </div>
        )}

        {/* Error message view */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMsg}</p>
              <button
                type="button"
                onClick={() => handleAnalyze()}
                className="mt-1 text-rose-700 underline font-bold cursor-pointer"
              >
                Yeniden Dene
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-4/5" />
            <div className="divide-y divide-slate-100 pt-2">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                    <div className="space-y-1">
                      <div className="h-3 bg-slate-200 rounded w-28" />
                      <div className="h-2 bg-slate-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Result Card */}
        {result && !isLoading && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Recipe Overview Header Card */}
            <div className="p-3.5 bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white rounded-2xl shadow-md space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-400/30">
                    Akıllı Tarif & Sepet Çözümü
                  </span>
                  <h3 className="text-sm font-extrabold text-white mt-1 leading-snug">
                    {result.recipeTitle}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-emerald-200 block">Tahmini Bütçe</span>
                  <span className="text-base font-black font-mono text-white tabular-nums">
                    {result.estimatedTotal.toFixed(2)} ₺
                  </span>
                </div>
              </div>

              <p className="text-xs text-emerald-100 leading-relaxed font-normal">
                {result.summary}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-emerald-200 border-t border-emerald-600/40">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{result.servings} Kişilik Porsiyon</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>~{result.cookingTimeMinutes} Dakika</span>
                </div>
                {result.estimatedSavings > 0 && (
                  <div className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{result.estimatedSavings.toFixed(2)} ₺ Tasarruf</span>
                  </div>
                )}
              </div>

              {result.chefTips && (
                <div className="p-2.5 bg-white/10 rounded-xl text-[11px] text-slate-100 flex items-start gap-2 border border-white/15">
                  <ChefHat className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-200 block">Hatay Ustasından Püf Noktası:</span>
                    <span>{result.chefTips}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ingredient Matching & Price Comparison List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-800">
                  Gereken Malzemeler ({result.ingredients.length} Kalem)
                </span>
                <span className="text-[11px] text-slate-500">
                  Birim Fiyat Karşılaştırmalı
                </span>
              </div>

              {result.ingredients.map((ing, ingIdx) => {
                const currentSelection = itemSelections[ingIdx] || {
                  productId: ing.selectedProductId,
                  quantity: ing.selectedProductQuantity || 1,
                  isChecked: true,
                };

                const chosenProduct = products.find(p => p.id === currentSelection.productId);
                const isOutOfStock = !chosenProduct || chosenProduct.stock <= 0;

                return (
                  <div
                    key={ingIdx}
                    className={`p-3 bg-white border rounded-xl shadow-2xs transition-all ${
                      currentSelection.isChecked
                        ? 'border-emerald-300 ring-1 ring-emerald-100'
                        : 'border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Ingredient Header with Checkbox */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleItemCheck(ingIdx)}
                          className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        >
                          {currentSelection.isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{ing.ingredientName}</h4>
                          <span className="text-[10px] text-slate-500">İhtiyaç: {ing.requiredQuantity}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        {chosenProduct && (
                          <span className="text-xs font-extrabold text-slate-900 font-mono tabular-nums">
                            {(chosenProduct.price * currentSelection.quantity).toFixed(2)} ₺
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selected Product Card */}
                    {chosenProduct && (
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={chosenProduct.image}
                            alt={chosenProduct.name}
                            className="w-11 h-11 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-100"
                            onError={(e) => handleImageError(e, chosenProduct.category)}
                          />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase text-slate-400">
                                {chosenProduct.brand}
                              </span>
                              {ing.candidates.find(c => c.productId === chosenProduct.id)?.isCheapest && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                  En Uygun Birim Fiyat
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-semibold text-slate-800 truncate">
                              {chosenProduct.name}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span>{chosenProduct.weight}</span>
                              <span>·</span>
                              <span className="font-semibold text-emerald-700">
                                {ing.candidates.find(c => c.productId === chosenProduct.id)?.unitPriceDisplay ||
                                  `${(chosenProduct.price / 1).toFixed(2)} ₺/${chosenProduct.unit}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity and Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                              Tükendi
                            </span>
                          ) : (
                            <>
                              <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(ingIdx, -1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer"
                                  title="Azalt"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold text-slate-900 tabular-nums">
                                  {currentSelection.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(ingIdx, 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer"
                                  title="Artır"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddSingleToCart(ingIdx)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-transform active:scale-95 cursor-pointer shadow-2xs"
                                title="Bu ürünü sepete ekle"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Comparison reason note */}
                    {ing.comparisonReason && (
                      <p className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded mt-2 border border-slate-100">
                        💡 {ing.comparisonReason}
                      </p>
                    )}

                    {/* Alternative Brand / Equivalent Product Switcher (if more than 1 candidate) */}
                    {ing.candidates.length > 1 && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Marka / Gramaj Alternatifleri:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ing.candidates.map(candidate => (
                            <button
                              key={candidate.productId}
                              type="button"
                              onClick={() => switchCandidateProduct(ingIdx, candidate.productId)}
                              className={`p-1.5 rounded-lg border text-left text-[10px] transition-all cursor-pointer ${
                                currentSelection.productId === candidate.productId
                                  ? 'border-emerald-500 bg-emerald-50/60 font-bold text-emerald-900 ring-1 ring-emerald-400'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="truncate font-semibold">{candidate.brand} ({candidate.weight})</div>
                              <div className="flex items-center justify-between text-slate-500 mt-0.5">
                                <span className="font-mono text-slate-900">{candidate.price.toFixed(2)} ₺</span>
                                <span className="text-[9px] text-emerald-700">{candidate.unitPriceDisplay}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar for Bulk Adding */}
      {result && selectedItemsList.length > 0 && (
        <div className="p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shrink-0 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block">
                {selectedItemsList.length} Seçili Malzeme
              </span>
              <span className="text-base font-black text-slate-900 font-mono tabular-nums">
                {selectedTotalAmount.toFixed(2)} ₺
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-200" />
              <span>Seçilenleri Sepete Ekle</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Adding to Cart */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[85%] overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Sepete Ekleme Onayı</h3>
                  <p className="text-[10px] text-slate-500">Lütfen eklenecek malzemeleri ve tutarı onaylayınız</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected items list */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto text-xs pr-1">
              {selectedItemsList.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-100"
                      onError={(e) => handleImageError(e, item.product.category)}
                    />
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 block truncate">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.product.brand} · {item.product.weight}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-bold text-slate-900 font-mono tabular-nums shrink-0">
                    {item.totalPrice.toFixed(2)} ₺
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Market Information */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Hazırlayan Dark Store:</span>
                <span className="font-semibold text-slate-800">{currentStore.neighborhood}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tahmini Teslimat Süresi:</span>
                <span className="font-semibold text-emerald-700">12 - 15 Dakika</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Toplam Sepet Tutarı:</span>
                <span className="font-mono text-emerald-800">{selectedTotalAmount.toFixed(2)} ₺</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmAddSelectedToCart}
                className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Onayla ve Sepete Ekle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
