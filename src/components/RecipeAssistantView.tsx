import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, Product } from '../types';
import { INITIAL_RECIPES } from '../data/recipeData';
import {
  callRecipeAssistant,
  RecipeAssistantResponse,
  RecipeAssistantIngredientItem
} from '../services/geminiService';
import { handleImageError } from '../utils/imageFallback';
import {
  ChefHat,
  Sparkles,
  ChevronLeft,
  Users,
  Clock,
  Coins,
  Check,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ListPlus,
  Home,
  CheckSquare,
  Square,
  Plus,
  Minus,
  RotateCcw,
  BookOpen,
  Filter,
  ArrowRight,
  Flame,
  X,
  Share2
} from 'lucide-react';

interface Props {
  onBackToStore: () => void;
  onOpenCart: () => void;
}

export const RecipeAssistantView: React.FC<Props> = ({ onBackToStore, onOpenCart }) => {
  const { products, stores, activeStoreId, addToCart } = useApp();
  const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];

  // User input states
  const [servings, setServings] = useState<number>(4);
  const [preference, setPreference] = useState<'all' | 'ekonomik' | 'hizli' | 'sebzeli' | 'etli' | 'tavuklu' | 'tatli'>('all');
  const [maxTimeMinutes, setMaxTimeMinutes] = useState<number>(45);
  const [budgetLevel, setBudgetLevel] = useState<'economic' | 'standard' | 'gourmet'>('standard');
  const [homeIngredientsInput, setHomeIngredientsInput] = useState<string>('Tuz, sıvı yağ, soğan');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // View state: 'assistant' (recommendation) vs 'catalog' (browse all 15)
  const [activeSubTab, setActiveSubTab] = useState<'recommendation' | 'catalog'>('recommendation');

  // Loading & Result state
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<RecipeAssistantResponse | null>(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Missing items selection for cart: index -> isChecked (default true)
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isShoppingListModalOpen, setIsShoppingListModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category filter for catalog view
  const [catalogCategory, setCatalogCategory] = useState<string>('Tümü');

  // Home ingredient quick chips
  const commonHomePantryChips = [
    'Tuz',
    'Zeytinyağı',
    'Kuru Soğan',
    'Pirinç',
    'Tereyağı',
    'Salça',
    'Yumurta',
    'Un',
    'Şeker',
    'Karabiber'
  ];

  const handleAddHomeChip = (chip: string) => {
    const tokens = homeIngredientsInput
      .split(/[,;]/)
      .map(t => t.trim())
      .filter(Boolean);
    if (!tokens.some(t => t.toLowerCase() === chip.toLowerCase())) {
      setHomeIngredientsInput(tokens.length > 0 ? `${homeIngredientsInput}, ${chip}` : chip);
    }
  };

  const handleRunAssistant = async (targetRecipe?: Recipe) => {
    setIsLoading(true);
    setErrorMsg(null);
    setToastMessage(null);

    try {
      const res = await callRecipeAssistant({
        servings,
        preference: targetRecipe ? 'all' : preference,
        maxTimeMinutes,
        budgetLevel,
        homeIngredients: homeIngredientsInput,
        catalogRecipes: targetRecipe ? [targetRecipe] : INITIAL_RECIPES,
        availableProducts: products,
        userPrompt: targetRecipe ? targetRecipe.name : customPrompt,
      });

      setAiResult(res);
      setActiveSubTab('recommendation');

      // Initialize all missing ingredients as checked
      const initialChecked: Record<number, boolean> = {};
      const initialQty: Record<number, number> = {};
      res.ingredientsAnalysis.forEach((item, idx) => {
        initialChecked[idx] = !item.isHaveAtHome;
        initialQty[idx] = item.quantityToBuy || 1;
      });
      setCheckedIngredients(initialChecked);
      setQuantities(initialQty);
    } catch (err: any) {
      setErrorMsg(err.message || 'Yemek asistanı öneri üretirken bir sorun oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle item checkbox
  const toggleItemCheck = (idx: number) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Adjust item quantity
  const updateItemQty = (idx: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [idx]: Math.max(1, (prev[idx] || 1) + delta),
    }));
  };

  // Calculate selected items for cart
  const selectedCartItems = aiResult
    ? aiResult.ingredientsAnalysis
        .map((ing, idx) => {
          if (!checkedIngredients[idx] || ing.isHaveAtHome || !ing.matchedProductId) return null;
          const prod = products.find(p => p.id === ing.matchedProductId);
          if (!prod) return null;
          const qty = quantities[idx] || 1;
          return {
            ingredient: ing,
            product: prod,
            quantity: qty,
            totalPrice: prod.price * qty,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];

  const selectedTotal = selectedCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Confirm and add to cart
  const handleConfirmAddToCart = () => {
    let addedCount = 0;
    selectedCartItems.forEach(item => {
      if (item.product.stock > 0) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart(item.product, 'auto');
          addedCount++;
        }
      }
    });

    setIsConfirmModalOpen(false);
    setToastMessage(`${addedCount} adet tarif malzemesi sepetinize eklendi! Toplam: ${selectedTotal.toFixed(2)} ₺`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter recipes in catalog
  const filteredCatalog = INITIAL_RECIPES.filter(r => {
    return catalogCategory === 'Tümü' || r.category === catalogCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Top Header */}
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
              <ChefHat className="w-4 h-4 text-emerald-400" />
              <span>Bugün Ne Yapsam?</span>
            </h2>
            <p className="text-[10px] text-slate-400">Yapay Zekâlı Akıllı Yemek &amp; Tarif Asistanı</p>
          </div>

          <button
            onClick={onOpenCart}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors cursor-pointer"
            title="Sepeti Aç"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Sub View Toggle: AI Öneri vs 15 Tarif Kataloğu */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold mt-2.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('recommendation')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'recommendation'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Yemek Önerisi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('catalog')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tarif Kataloğu (15 Tarif)</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={onOpenCart}
              className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg text-[10px] font-extrabold shadow-xs hover:bg-emerald-50"
            >
              Sepete Git
            </button>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMsg}</p>
              <button
                type="button"
                onClick={() => handleRunAssistant()}
                className="mt-1 text-rose-700 underline font-bold cursor-pointer"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB 1: AI RECOMMENDATION ASSISTANT ===================== */}
        {activeSubTab === 'recommendation' && (
          <div className="space-y-3.5">
            {/* Criteria Selection Card */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ChefHat className="w-4 h-4 text-emerald-600" />
                <span>Yemek Kriterlerinizi Belirleyin</span>
              </h3>

              {/* 1. Kişi Sayısı */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kaç Kişilik Yemek Pişireceksiniz?</span>
                  </span>
                  <span className="text-emerald-700 font-extrabold text-xs">{servings} Kişilik</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 4, 6, 8].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setServings(count)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        servings === count
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {count} Kişi
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Yemek Tercihi */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Yemek Tercihi
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: '🍽️ Tümü' },
                    { id: 'ekonomik', label: '🏷️ Ekonomik' },
                    { id: 'hizli', label: '⚡ Hızlı (≤25 dk)' },
                    { id: 'sebzeli', label: '🥗 Sebzeli / Hafif' },
                    { id: 'etli', label: '🥩 Etli / Köfte' },
                    { id: 'tavuklu', label: '🍗 Tavuklu' },
                    { id: 'tatli', label: '🍮 Tatlı' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreference(item.id as typeof preference)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        preference === item.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Hazırlanma & Pişirme Süresi & Bütçe */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Azami Süre</span>
                  </label>
                  <select
                    value={maxTimeMinutes}
                    onChange={(e) => setMaxTimeMinutes(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none cursor-pointer"
                  >
                    <option value={15}>15 Dakika (Pratik)</option>
                    <option value={30}>30 Dakika (Hızlı)</option>
                    <option value={45}>45 Dakika (Dengeli)</option>
                    <option value={90}>Fark Etmez (Zengin)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <span>Bütçe Seviyesi</span>
                  </label>
                  <select
                    value={budgetLevel}
                    onChange={(e) => setBudgetLevel(e.target.value as typeof budgetLevel)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none cursor-pointer"
                  >
                    <option value="economic">Ekonomik (Bütçe Dostu)</option>
                    <option value="standard">Standart Ev Yemeği</option>
                    <option value="gourmet">Ziyafet &amp; Özel Menü</option>
                  </select>
                </div>
              </div>

              {/* 4. Evdeki Malzemeler */}
              <div className="pt-1 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-blue-600" />
                    <span>Evde Bulunan Malzemeleriniz:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Virgülle ayırın</span>
                </label>
                <input
                  type="text"
                  value={homeIngredientsInput}
                  onChange={(e) => setHomeIngredientsInput(e.target.value)}
                  placeholder="Örn: Soğan, tuz, zeytinyağı, pirinç..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />

                {/* Quick Pantry Chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-medium py-0.5">Hızlı Ekle:</span>
                  {commonHomePantryChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddHomeChip(chip)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded cursor-pointer border border-slate-200 transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button: Bana Yemek Öner */}
              <button
                type="button"
                onClick={() => handleRunAssistant()}
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Yapay Zekâ En Uygun Yemeği Seçiyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Bana Yemek Öner &amp; Malzemeleri Hesapla</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Recommendation Result Card */}
            {aiResult && !isLoading && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Recipe Hero Banner */}
                <div className="p-4 bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl shadow-lg space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-400/30">
                        {aiResult.category} · Yapay Zekâ Tavsiyesi
                      </span>
                      <h3 className="text-base font-black text-white mt-1 leading-snug">
                        {aiResult.recipeTitle}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-emerald-200 block">Eksik Malzeme Tutarı</span>
                      <span className="text-base font-black font-mono text-emerald-300">
                        {aiResult.totalEstimatedCost.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100 leading-relaxed">
                    {aiResult.summary}
                  </p>

                  <div className="p-2 bg-white/10 rounded-xl text-[11px] text-emerald-100 flex items-start gap-1.5 border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                    <span><strong>Neden Önerildi:</strong> {aiResult.recommendationReason}</span>
                  </div>

                  {/* Badges strip */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-emerald-200 border-t border-emerald-700/50">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{aiResult.servings} Kişilik</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Hazırlık: {aiResult.prepTimeMinutes} dk · Pişirme: {aiResult.cookTimeMinutes} dk</span>
                    </div>
                  </div>

                  {aiResult.chefTip && (
                    <div className="p-2.5 bg-emerald-950/60 rounded-xl text-[11px] text-emerald-100 flex items-start gap-2 border border-emerald-600/30">
                      <ChefHat className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-300 block">Şefin Püf Noktası:</span>
                        <span>{aiResult.chefTip}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Home vs Missing Ingredients Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Evde Olanlar ({aiResult.homeIngredientsFound.length})</span>
                    </span>
                    <p className="text-[11px] text-emerald-900 line-clamp-2">
                      {aiResult.homeIngredientsFound.length > 0
                        ? aiResult.homeIngredientsFound.join(', ')
                        : 'Evde malzeme belirtilmedi'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1 mb-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Eksikler ({aiResult.missingIngredients.length} Ürün)</span>
                    </span>
                    <p className="text-[11px] text-amber-900 line-clamp-2 font-medium">
                      {aiResult.missingIngredients.length > 0
                        ? aiResult.missingIngredients.join(', ')
                        : 'Tüm malzemeler evinizde mevcut!'}
                    </p>
                  </div>
                </div>

                {/* Scaled Ingredients & Store Products List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {aiResult.servings} Kişilik Malzeme Listesi
                      </h4>
                      <p className="text-[10px] text-slate-500">Market ürünleriyle otomatik eşleştirildi</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsShoppingListModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <ListPlus className="w-3 h-3" />
                      <span>Listeyi Göster</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {aiResult.ingredientsAnalysis.map((item, idx) => {
                      const prod = products.find(p => p.id === item.matchedProductId);
                      const isChecked = !!checkedIngredients[idx];
                      const qty = quantities[idx] || 1;

                      return (
                        <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            {!item.isHaveAtHome && prod ? (
                              <button
                                type="button"
                                onClick={() => toggleItemCheck(idx)}
                                className="text-emerald-600 hover:text-emerald-700 cursor-pointer shrink-0"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300" />
                                )}
                              </button>
                            ) : (
                              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            )}

                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                  {item.name}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500">
                                  ({item.requiredAmountDisplay})
                                </span>
                              </div>

                              {item.isHaveAtHome ? (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                  ✓ Evde Var
                                </span>
                              ) : prod ? (
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                  <span className="font-semibold text-slate-700">{prod.brand} {prod.name}</span>
                                  <span> · </span>
                                  <span className="font-mono text-emerald-700 font-bold">{prod.price.toFixed(2)} ₺</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Temel mutfak stoğu</span>
                              )}
                            </div>
                          </div>

                          {/* Action area */}
                          {!item.isHaveAtHome && prod && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(idx, -1)}
                                  className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold text-slate-900 tabular-nums">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(idx, 1)}
                                  className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <div className="text-right min-w-[55px] font-mono text-xs font-bold text-slate-900 tabular-nums">
                                {(prod.price * qty).toFixed(2)} ₺
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recipe Preparation Steps Accordion/Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Adım Adım Hazırlanış ({aiResult.steps.length} Adım)</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-700">
                    {aiResult.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <p className="leading-relaxed text-[11px]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticky Add Selected to Cart Strip */}
                {selectedCartItems.length > 0 && (
                  <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {selectedCartItems.length} Eksik Malzeme
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono tabular-nums">
                        {selectedTotal.toFixed(2)} ₺
                      </span>
                    </div>

                    <div className="flex gap-2 flex-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsShoppingListModalOpen(true)}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        title="Alışveriş Listesini İncele"
                      >
                        <ListPlus className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsConfirmModalOpen(true)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-200" />
                        <span>Seçilenleri Sepete Ekle</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: 15 RECIPES CATALOG ===================== */}
        {activeSubTab === 'catalog' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Category Selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['Tümü', 'Çorbalar', 'Ana Yemekler', 'Pilav & Makarnalar', 'Sebze Yemekleri', 'Salata & Meze', 'Hamur İşi & Börek', 'Tatlılar'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatalogCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                    catalogCategory === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Recipe Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCatalog.map(recipe => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => handleImageError(e, 'Temel Gıda')}
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      {recipe.category}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.prepTimeMinutes + recipe.cookTimeMinutes} dk
                    </span>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{recipe.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{recipe.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-600" />
                        <span>{recipe.defaultServings} Kişilik</span>
                      </span>
                      <span>{recipe.ingredients.length} Malzeme</span>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedRecipeDetail(recipe)}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer text-center"
                      >
                        Tarifi Gör
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRunAssistant(recipe)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-200" />
                        <span>Malzemeleri Bul</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: RECIPE DETAIL MODAL (From Catalog) */}
      {selectedRecipeDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90%] overflow-y-auto space-y-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header Image */}
            <div className="relative h-44 bg-slate-100">
              <img
                src={selectedRecipeDetail.image}
                alt={selectedRecipeDetail.name}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, 'Temel Gıda')}
              />
              <button
                type="button"
                onClick={() => setSelectedRecipeDetail(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md">
                {selectedRecipeDetail.category} · {selectedRecipeDetail.defaultServings} Kişilik
              </span>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedRecipeDetail.name}</h3>
                <p className="text-slate-600 mt-1">{selectedRecipeDetail.description}</p>
              </div>

              {/* Prep & Cook Time info */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
                <div>
                  <span className="text-slate-400 block font-semibold">Hazırlık Süresi</span>
                  <span className="font-bold text-slate-800">{selectedRecipeDetail.prepTimeMinutes} Dakika</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Pişirme Süresi</span>
                  <span className="font-bold text-slate-800">{selectedRecipeDetail.cookTimeMinutes} Dakika</span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800">Gereken Malzemeler ({selectedRecipeDetail.defaultServings} Kişilik):</h4>
                <div className="divide-y divide-slate-100 text-slate-700">
                  {selectedRecipeDetail.ingredients.map((ing, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between">
                      <span>{ing.name}</span>
                      <span className="font-semibold text-slate-900">
                        {ing.amountPerServing * selectedRecipeDetail.defaultServings} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Steps */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800">Hazırlanış Adımları:</h4>
                <div className="space-y-1.5">
                  {selectedRecipeDetail.steps.map((st, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg flex items-start gap-2 text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => {
                  const target = selectedRecipeDetail;
                  setSelectedRecipeDetail(null);
                  handleRunAssistant(target);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Bu Tarifin Malzemelerini Sepetime Uyarla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMATION BEFORE ADDING TO CART */}
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
                  <p className="text-[10px] text-slate-500">{aiResult?.recipeTitle} malzemeleri</p>
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
              {selectedCartItems.map((item, idx) => (
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
                <span>Kişi Porsiyonu:</span>
                <span className="font-semibold text-slate-800">{aiResult?.servings} Kişilik</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Toplam Eklenecek Tutar:</span>
                <span className="font-mono text-emerald-800">{selectedTotal.toFixed(2)} ₺</span>
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
                onClick={handleConfirmAddToCart}
                className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Onayla ve Sepete Ekle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SHOPPING LIST SUMMARY MODAL */}
      {isShoppingListModalOpen && aiResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[85%] overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Alışveriş Listesi</h3>
                  <p className="text-[10px] text-slate-500">{aiResult.recipeTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShoppingListModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                <span>✓ Evde olan malzemeler listenizden çıkarılmıştır. Yalnızca eksik olanlar alışveriş listenize eklenir.</span>
              </div>

              <div className="divide-y divide-slate-100">
                {aiResult.ingredientsAnalysis.map((item, idx) => {
                  const prod = products.find(p => p.id === item.matchedProductId);
                  return (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900 block">{item.name}</span>
                        <span className="text-[10px] text-slate-500">Miktar: {item.requiredAmountDisplay}</span>
                      </div>
                      <div>
                        {item.isHaveAtHome ? (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            Evde Var
                          </span>
                        ) : prod ? (
                          <span className="font-mono text-slate-900 font-bold">
                            {prod.price.toFixed(2)} ₺
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Mutfak stoğu</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Tahmini Toplam:</span>
                <span className="font-mono text-emerald-700">{aiResult.totalEstimatedCost.toFixed(2)} ₺</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsShoppingListModalOpen(false);
                  setIsConfirmModalOpen(true);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Eksik Malzemeleri Sepete Ekle ({selectedTotal.toFixed(2)} ₺)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
