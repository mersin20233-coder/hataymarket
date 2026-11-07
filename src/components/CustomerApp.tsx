import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, SubstitutePreference, Order } from '../types';
import { handleImageError } from '../utils/imageFallback';
import { HATAY_DISTRICTS, CATEGORIES_20, POPULAR_STAPLE_NAMES, AppCategory } from '../data/mockData';
import { RecipeAssistantView } from './RecipeAssistantView';
import { AIShoppingAssistant } from './AIShoppingAssistant';
import { PriceAlertModal } from './PriceAlertModal';
import { PriceAlertsView } from './PriceAlertsView';
import { Cart3DProvider, useCart3D } from './cart3d/Cart3DAnimationContext';
import { BottomNav3D } from './navigation3d/BottomNav3D';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  ClipboardList,
  User,
  Search,
  MapPin,
  Bell,
  Heart,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChefHat,
  Sparkles,
  Check,
  CheckCircle2,
  Phone,
  CreditCard,
  ShieldCheck,
  X,
  RotateCcw,
  Star,
  HelpCircle,
  FileText,
  Settings,
  LogOut,
  Layers,
  Scale,
  Tag,
  MessageSquare,
  ArrowRight,
  KeyRound,
  Bike,
  Building2,
  Lock,
  Edit2,
  Filter,
  SlidersHorizontal,
  AlertCircle,
  Smartphone
} from 'lucide-react';

export type CustomerScreen =
  | 'home'
  | 'categories'
  | 'search'
  | 'cart'
  | 'payment'
  | 'orders'
  | 'profile'
  | 'favorites'
  | 'price_alerts'
  | 'shopping_list'
  | 'product_comparison'
  | 'notifications'
  | 'support'
  | 'recipe_assistant'
  | 'assistant';

const CustomerAppInner: React.FC = () => {
  const {
    products,
    categories,
    stores,
    activeStoreId,
    setActiveStoreId,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    createOrder,
    orders,
    activeOrderId,
    setActiveOrderId,
    reorderPastOrder,
    currentUser,
    isLoggedIn,
    openAuthModal,
    logout,
    addUserAddress,
    deleteUserAddress,
    setDefaultAddress,
    updateUserPassword,
    favorites,
    toggleFavorite,
    isFavorite,
    selectedDistrict,
    setSelectedDistrict,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    priceAlerts,
    getPriceAlertForProduct,
    setIsMobileModalOpen,
  } = useApp();

  const { triggerFlyToCart, openOrderModal, registerTrackHandler } = useCart3D();

  // Screen Navigation State
  const [activeScreen, setActiveScreen] = useState<CustomerScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<CustomerScreen>('home');

  // Helper for screen navigation
  const navigateTo = (screen: CustomerScreen) => {
    setPreviousScreen(activeScreen);
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Register live tracking callback from 3D order celebration modal
  useEffect(() => {
    registerTrackHandler((orderId: string) => {
      setActiveOrderId(orderId);
      navigateTo('orders');
    });
  }, [registerTrackHandler, setActiveOrderId]);

  // Non-blocking 3D Add-to-cart handler
  const handleAddToCartWith3D = (prod: Product, e?: React.MouseEvent) => {
    addToCart(prod, 'auto');
    if (triggerFlyToCart) {
      triggerFlyToCart(prod, e);
    }
  };

  // Price Alert Modal State
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState(false);
  const [priceAlertTargetProduct, setPriceAlertTargetProduct] = useState<Product | null>(null);

  const openPriceAlertModal = (prod: Product) => {
    setPriceAlertTargetProduct(prod);
    setIsPriceAlertModalOpen(true);
  };

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [quickFilter, setQuickFilter] = useState<'all' | 'popular' | 'favorites' | 'deals'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('Tümü');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'popular' | 'discount'>('default');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);

  // Selected Product for Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  // Modals
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Cart & Checkout State
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; isError: boolean } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cash'>('card');
  const [cardHolder, setCardHolder] = useState('Deniz Kaya');
  const [cardNumber, setCardNumber] = useState('5428 •••• •••• 9012');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('326');
  const [deliveryNote, setDeliveryNote] = useState('Zili çalmayın lütfen, kapıya bırakın.');

  // Favorites Tab State
  const [favoritesTab, setFavoritesTab] = useState<'products' | 'stores'>('products');

  // Notifications Tab Filter
  const [notifFilter, setNotifFilter] = useState<'all' | 'order' | 'promo' | 'system'>('all');

  // Comparison State
  const [comparisonMetric, setComparisonMetric] = useState<'price' | 'unit_price' | 'stock' | 'delivery'>('price');

  // Shopping List Items State
  const [shoppingItems, setShoppingItems] = useState([
    { id: '1', name: 'Taze Salkım Domates (1 kg)', checked: true, price: 38.50, unit: '1 kg' },
    { id: '2', name: 'Çengelköy Salatalık (1 kg)', checked: true, price: 32.00, unit: '1 kg' },
    { id: '3', name: 'Sütaş Günlük Süt (1 L)', checked: true, price: 36.90, unit: '1 L' },
    { id: '4', name: 'Gezen Tavuk Yumurtası (10\'lu)', checked: true, price: 59.90, unit: '10\'lu' },
    { id: '5', name: 'Barilla Spaghetti No:5 (500 gr)', checked: true, price: 28.50, unit: '500 gr' },
    { id: '6', name: 'Yudum Ayçiçek Yağı (1 L)', checked: true, price: 89.90, unit: '1 L' },
  ]);
  const [newShoppingItemName, setNewShoppingItemName] = useState('');

  // Password / Address Form
  const defaultAddr = currentUser?.addresses?.find(a => a.isDefault) || currentUser?.addresses?.[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || '');
  const activeAddress = currentUser?.addresses?.find(a => a.id === selectedAddressId) || defaultAddr;
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [accountFeedback, setAccountFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  // Active Store & District
  const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];
  const currentDistrictObj = HATAY_DISTRICTS.find(d => d.id === selectedDistrict) || HATAY_DISTRICTS[0];

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = activeCoupon
    ? activeCoupon.discountType === 'fixed'
      ? activeCoupon.discountValue
      : (cartSubtotal * activeCoupon.discountValue) / 100
    : 0;
  const isFreeDelivery = cartSubtotal >= currentStore.freeDeliveryThreshold;
  const deliveryFee = cartSubtotal === 0 ? 0 : isFreeDelivery ? 0 : currentDistrictObj.deliveryFee;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount) + deliveryFee;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Active & ordered categories
  const activeCategories = (categories && categories.length > 0
    ? [...categories].filter(c => c.isActive !== false).sort((a, b) => a.displayOrder - b.displayOrder)
    : CATEGORIES_20);

  // Unique brands for filter modal (only from active products)
  const activeProducts = products.filter(p => p.status !== 'passive');
  const availableBrands = ['Tümü', ...Array.from(new Set(activeProducts.map(p => p.brand).filter(Boolean)))];
  const hasActiveFilters = selectedBrand !== 'Tümü' || maxPrice < 300 || inStockOnly || sortBy !== 'default';

  // Products filtering & sorting
  const filteredProducts = activeProducts.filter(p => {
    const matchCat = selectedCategory === 'Tümü' || p.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchQuick =
      quickFilter === 'all'
        ? true
        : quickFilter === 'popular'
        ? p.isPopular || POPULAR_STAPLE_NAMES.some(name => p.name.toLowerCase().includes(name.toLowerCase()))
        : quickFilter === 'favorites'
        ? isFavorite(p.id)
        : !!p.originalPrice;
    const matchBrand = selectedBrand === 'Tümü' || p.brand === selectedBrand;
    const matchPrice = p.price <= maxPrice;
    const matchStock = !inStockOnly || p.stock > 0;
    return matchCat && matchSearch && matchQuick && matchBrand && matchPrice && matchStock;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    if (sortBy === 'discount') {
      const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
      const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
      return discB - discA;
    }
    return 0;
  });

  // 30 Daily Staples (only active products)
  const popularStaples = activeProducts.filter(p =>
    p.isPopular || POPULAR_STAPLE_NAMES.some(name => p.name.toLowerCase().includes(name.toLowerCase()))
  ).slice(0, 16);

  // Active Order for Tracking
  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0];

  // Handlers
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({ msg: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  const handleCheckoutSubmit = () => {
    if (isCheckingOut) return;
    if (!isLoggedIn) {
      openAuthModal("Sipariş verebilmek için lütfen üye girişi yapınız.");
      return;
    }
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const created = createOrder({
        paymentMethod,
        customerName: currentUser.name,
        customerPhone: currentUser.phone || '05321112233',
        address: activeAddress
          ? `${activeAddress.addressLine}, ${activeAddress.neighborhood}, ${currentDistrictObj.name} / Hatay`
          : 'Sümerler Mah. Atatürk Cad. No: 14 Antakya / Hatay',
        notes: deliveryNote,
        tip: 15,
      });

      if (created) {
        setActiveOrderId(created.id);
        // Trigger 3D Order Modal Celebration!
        openOrderModal(created);
      }
    } finally {
      setTimeout(() => setIsCheckingOut(false), 800);
    }
  };

  const addAllShoppingListToCart = () => {
    let count = 0;
    shoppingItems.filter(i => i.checked).forEach(item => {
      const match = products.find(p => p.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 8)));
      if (match) {
        addToCart(match, 'auto');
        count++;
      }
    });
    navigateTo('cart');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-[820px] shadow-2xl rounded-3xl overflow-hidden border border-[#E1E9E4] flex flex-col relative text-[#17231D] select-none">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (BRAND LOGO + ADDRESS + NOTIFICATION) */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-[#E1E9E4] px-4 py-3 shrink-0 flex items-center justify-between gap-2 shadow-2xs z-30">
        {/* Left: Brand Logo + Location */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <button
            onClick={() => navigateTo('home')}
            className="w-10 h-10 rounded-2xl bg-[#00875A] flex items-center justify-center text-white shadow-xs shrink-0 hover:bg-[#006D48] transition-colors cursor-pointer"
            title="HatayMarket Ana Sayfa"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#00875A] text-base tracking-tight">HatayMarket</span>
            </div>
            <button
              onClick={() => setIsDistrictModalOpen(true)}
              className="flex items-center gap-1 text-[11px] text-[#68766E] hover:text-[#00875A] transition-colors truncate cursor-pointer text-left font-medium"
            >
              <MapPin className="w-3 h-3 text-[#E84B4B] shrink-0" />
              <span className="text-[#00875A] font-semibold">Teslimat:</span>
              <span className="font-bold text-[#17231D] truncate max-w-[120px]">{currentDistrictObj.name} Merkez</span>
              <span className="text-[#00875A] text-[10px]">▾</span>
            </button>
          </div>
        </div>

        {/* Right: Notification Bell, Price Alerts & Quick Cart */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => navigateTo('price_alerts')}
            className={`relative p-2 rounded-xl transition-colors cursor-pointer border ${
              activeScreen === 'price_alerts'
                ? 'bg-[#00875A] text-white border-[#00875A]'
                : 'text-[#17231D] hover:bg-[#E8F7EF] hover:text-[#00875A] border-[#E1E9E4]'
            }`}
            aria-label="Akıllı Fiyat Alarmlarım"
            title="Akıllı Fiyat Alarmlarım"
          >
            <Bell className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            {priceAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {priceAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigateTo('notifications')}
            className={`relative p-2 rounded-xl transition-colors cursor-pointer border ${
              activeScreen === 'notifications'
                ? 'bg-[#00875A] text-white border-[#00875A]'
                : 'text-[#17231D] hover:bg-[#E8F7EF] hover:text-[#00875A] border-[#E1E9E4]'
            }`}
            aria-label="Bildirimler"
            title="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute -top-1 -right-1 bg-[#E84B4B] text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          <button
            id="header-cart-btn"
            onClick={() => navigateTo('cart')}
            className="relative p-2 bg-[#00875A] hover:bg-[#006D48] rounded-xl text-white transition-colors cursor-pointer shadow-xs"
            aria-label="Sepeti Gör"
            title="Sepetim"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartItemCount > 0 && (
              <span
                data-cart-badge="true"
                className="absolute -top-1.5 -right-1.5 bg-[#E84B4B] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
              >
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN SCROLLABLE CONTENT BODY */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto bg-[#F7FAF8] pb-20">
        {/* ======================================================================= */}
        {/* VIEW 1: HOME (01_ana_sayfa_fd547398.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'home' && (
          <div className="p-3.5 space-y-4">
            {/* Search Input Bar with Filter Button */}
            <div className="flex items-center gap-2">
              <div
                onClick={() => navigateTo('search')}
                className="relative flex-1 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#68766E] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Ürün, marka veya kategori ara..."
                  value={searchQuery}
                  readOnly
                  className="w-full bg-white text-[#17231D] placeholder-[#68766E] text-xs pl-10 pr-9 py-2.5 rounded-2xl border border-[#E1E9E4] outline-none shadow-2xs transition-all cursor-pointer hover:border-[#00875A]"
                />
                {searchQuery && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="absolute right-3 top-2.5 text-[#68766E] hover:text-[#17231D]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`relative p-2.5 rounded-2xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  hasActiveFilters
                    ? 'bg-[#00875A] text-white border-[#00875A] shadow-xs'
                    : 'bg-white text-[#68766E] border-[#E1E9E4] hover:text-[#00875A] hover:bg-[#E8F7EF]'
                }`}
                title="Detaylı Filtrele ve Sırala"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute -top-1 -right-1 ring-2 ring-white" />
                )}
              </button>
            </div>

            {/* Hero Banner 1: Fresh Produce Banner (matching Figma) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#006D48] via-[#00875A] to-[#00A878] p-5 text-white shadow-md">
              <div className="relative z-10 max-w-[210px] space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold text-[#E8F7EF]">
                  Hatay Bereketli Topraklar
                </span>
                <h2 className="text-lg font-extrabold leading-tight tracking-tight">
                  Hatay'ın En Taze Ürünleri Sizinle!
                </h2>
                <button
                  onClick={() => {
                    setSelectedCategory('Meyve ve Sebze');
                    setQuickFilter('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#00875A] hover:bg-[#E8F7EF] font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <span>Alışverişe Başla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80"
                alt="Taze Sebze & Meyve"
                className="absolute -right-6 -bottom-6 w-36 h-36 object-cover rounded-full border-4 border-white/20 opacity-90 pointer-events-none"
              />
            </div>

            {/* Hero Banner 2: AI Chef "Bugün Ne Yapsam?" Banner (matching Figma) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00875A] to-[#005236] p-4 text-white shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Bugün Ne Yapsam?</h3>
                  <p className="text-[11px] text-[#E8F7EF] leading-snug">
                    Yapay zekâ ile sana özel yemek önerileri &amp; eksik malzeme tamamlama!
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigateTo('recipe_assistant')}
                className="px-3 py-2 bg-white text-[#00875A] font-bold text-xs rounded-xl shadow-xs hover:bg-[#E8F7EF] transition-all shrink-0 cursor-pointer whitespace-nowrap active:scale-95"
              >
                Hemen Keşfet
              </button>
            </div>

            {/* Mobile App & Google Play Quick Action Banner */}
            <div
              onClick={() => setIsMobileModalOpen(true)}
              className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-emerald-100 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00875A] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-[#17231D]">Mobil Uygulama &amp; Paylaş</span>
                    <span className="text-[9px] bg-[#00875A] text-white px-1.5 py-0.5 rounded font-bold">Google Play &amp; iOS</span>
                  </div>
                  <p className="text-[10px] text-[#68766E]">Telefona yükle, QR kod ile paylaş veya Google Play paketini indir</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#00875A] shrink-0" />
            </div>

            {/* 3D Mascot Membership Invitation Banner (for Guest users) */}
            {!isLoggedIn && (
              <div
                onClick={() => openAuthModal("HatayMarket ailesine katılıp ilk siparişinde %20 indirimden yararlan!")}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-[#00875A] to-teal-800 p-3.5 text-white shadow-md flex items-center justify-between gap-3 cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group border border-emerald-400/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/60 shrink-0 shadow-sm">
                    <img
                      src="/assets/mascot/mascot_default.jpg"
                      alt="HatayMarket Maskot Eren"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-white">HatayMarket Ailesine Katıl!</h4>
                      <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full font-black">
                        %20 İndirim
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-100 leading-tight mt-0.5">
                      Hızlı üyelik oluştur, sana özel sürpriz ve taze fırsatları hemen yakala.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white text-[#00875A] font-extrabold text-xs rounded-xl shadow-xs shrink-0 whitespace-nowrap group-hover:bg-emerald-50 transition-colors"
                >
                  Üye Ol
                </button>
              </div>
            )}

            {/* Categories Section (Horizontal cards with "Tümünü Gör >") */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#17231D]">Kategoriler</h3>
                <button
                  onClick={() => navigateTo('categories')}
                  className="text-xs font-bold text-[#00875A] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Tümünü Gör</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {activeCategories.slice(0, 8).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setQuickFilter('all');
                    }}
                    className={`flex flex-col items-center justify-center w-20 p-2.5 rounded-2xl border transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat.name
                        ? 'bg-[#E8F7EF] border-[#00875A] text-[#00875A] shadow-xs'
                        : 'bg-white border-[#E1E9E4] text-[#17231D] hover:border-[#00875A]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden mb-1.5 bg-[#F7FAF8] flex items-center justify-center">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => handleImageError(e, cat.name)}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-center leading-tight line-clamp-2">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* En Çok Tüketilen Ürünler Section (Horizontal Cards matching Figma) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#17231D]">En Çok Tüketilen Ürünler</h3>
                  <p className="text-[10px] text-[#68766E]">Hatay'da her evin vazgeçilmez temel ihtiyaçları</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('Tümü');
                    setQuickFilter('popular');
                  }}
                  className="text-xs font-bold text-[#00875A] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Tümünü Gör</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {popularStaples.map(product => {
                  const inCart = cart.find(c => c.product.id === product.id);
                  return (
                    <div
                      key={`staple-${product.id}`}
                      data-product-card="true"
                      className="w-32 bg-white border border-[#E1E9E4] rounded-2xl p-2 flex flex-col justify-between shrink-0 hover:shadow-md transition-shadow relative group"
                    >
                      <div
                        onClick={() => {
                          setSelectedProduct(product);
                          setDetailQuantity(1);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="w-full aspect-square bg-[#F7FAF8] rounded-xl overflow-hidden mb-1.5 relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => handleImageError(e, product.category)}
                          />
                          {product.originalPrice && (
                            <span className="absolute top-1 left-1 bg-[#E84B4B] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                              %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}
                            </span>
                          )}
                          <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPriceAlertModal(product);
                              }}
                              className={`p-1 rounded-full shadow-xs backdrop-blur-xs transition-transform active:scale-90 ${
                                getPriceAlertForProduct(product.id)
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-white/80 text-[#68766E] hover:text-amber-600'
                              }`}
                              title={
                                getPriceAlertForProduct(product.id)
                                  ? `Fiyat Alarmı Aktif: ${getPriceAlertForProduct(product.id)?.targetPrice.toFixed(2)} ₺`
                                  : 'Fiyat Alarmı Kur'
                              }
                            >
                              <Bell className={`w-3 h-3 ${getPriceAlertForProduct(product.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                              className={`p-1 rounded-full shadow-xs backdrop-blur-xs transition-transform active:scale-90 ${
                                isFavorite(product.id)
                                  ? 'bg-[#00875A] text-white'
                                  : 'bg-white/80 text-[#68766E] hover:text-[#00875A]'
                              }`}
                              title={isFavorite(product.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                            >
                              <Heart className={`w-3 h-3 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-[11px] font-bold text-[#17231D] line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-[9px] text-[#68766E] mt-0.5">{product.weight}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E1E9E4]">
                        <span className="text-xs font-extrabold text-[#17231D]">{product.price.toFixed(2)} ₺</span>
                        {product.stock <= 0 ? (
                          <span className="text-[10px] font-bold text-[#D9363E] bg-rose-50 px-1.5 py-0.5 rounded">
                            Tükendi
                          </span>
                        ) : inCart ? (
                          <div className="flex items-center gap-1 bg-[#E8F7EF] text-[#00875A] px-1 py-0.5 rounded-lg text-xs font-bold">
                            <button
                              onClick={() => updateCartQuantity(product.id, -1)}
                              className="hover:text-red-600"
                            >
                              -
                            </button>
                            <span>{inCart.quantity}</span>
                            <button
                              onClick={(e) => {
                                updateCartQuantity(product.id, 1);
                                if (triggerFlyToCart) triggerFlyToCart(product, e);
                              }}
                              className="hover:text-[#00875A]"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleAddToCartWith3D(product, e)}
                            className="w-6 h-6 rounded-lg bg-[#00875A] hover:bg-[#006D48] text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs"
                            title="Sepete Ekle"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Filter Chips: Tümü, Popüler, Favorilerim, Fırsatlar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2">
              <button
                onClick={() => setQuickFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  quickFilter === 'all'
                    ? 'bg-[#00875A] text-white shadow-xs'
                    : 'bg-white text-[#68766E] border border-[#E1E9E4] hover:bg-[#E8F7EF]'
                }`}
              >
                Tüm Ürünler
              </button>
              <button
                onClick={() => setQuickFilter('popular')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  quickFilter === 'popular'
                    ? 'bg-[#00875A] text-white shadow-xs'
                    : 'bg-white text-[#68766E] border border-[#E1E9E4] hover:bg-[#E8F7EF]'
                }`}
              >
                🔥 En Çok Tüketilen
              </button>
              <button
                onClick={() => setQuickFilter('favorites')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  quickFilter === 'favorites'
                    ? 'bg-[#00875A] text-white shadow-xs'
                    : 'bg-white text-[#00875A] border border-[#00875A]/30 hover:bg-[#E8F7EF]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-current' : ''}`} />
                <span>Favorilerim ({favorites.length})</span>
              </button>
              <button
                onClick={() => setQuickFilter('deals')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  quickFilter === 'deals'
                    ? 'bg-[#E84B4B] text-white shadow-xs'
                    : 'bg-white text-[#E84B4B] border border-[#E84B4B]/30 hover:bg-rose-50'
                }`}
              >
                🏷️ İndirimler
              </button>
            </div>

            {/* Product Grid (All or Filtered) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#68766E]">
                  {filteredProducts.length} Ürün Listeleniyor
                </span>
                {selectedCategory !== 'Tümü' && (
                  <button
                    onClick={() => setSelectedCategory('Tümü')}
                    className="text-[11px] font-bold text-[#00875A] hover:underline"
                  >
                    Filtreyi Temizle
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-[#E1E9E4]">
                  <Search className="w-8 h-8 text-[#68766E] mx-auto mb-2 opacity-50" />
                  <h4 className="font-bold text-sm text-[#17231D]">Ürün Bulunamadı</h4>
                  <p className="text-xs text-[#68766E] mt-1 max-w-xs mx-auto">
                    Arama kriterinize uygun ürün bulunamadı. Lütfen farklı bir anahtar kelime deneyin.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Tümü');
                      setQuickFilter('all');
                    }}
                    className="mt-3 px-4 py-2 bg-[#00875A] text-white rounded-xl text-xs font-bold"
                  >
                    Tüm Ürünleri Göster
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredProducts.map(product => {
                    const cartItem = cart.find(i => i.product.id === product.id);
                    const isOutOfStock = product.stock <= 0;

                    return (
                      <div
                        key={product.id}
                        data-product-card="true"
                        className="bg-white border border-[#E1E9E4] rounded-2xl p-2.5 flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                      >
                        <div
                          onClick={() => {
                            setSelectedProduct(product);
                            setDetailQuantity(1);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="relative w-full aspect-square bg-[#F7FAF8] rounded-xl overflow-hidden mb-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                              onError={(e) => handleImageError(e, product.category)}
                            />
                            {/* Action Buttons: Price Alert + Favorite Heart */}
                            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPriceAlertModal(product);
                                }}
                                className={`p-1.5 rounded-full shadow-xs backdrop-blur-xs transition-transform active:scale-90 ${
                                  getPriceAlertForProduct(product.id)
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-white/85 text-[#68766E] hover:text-amber-600'
                                }`}
                                title={
                                  getPriceAlertForProduct(product.id)
                                    ? `Fiyat Alarmı Aktif: ${getPriceAlertForProduct(product.id)?.targetPrice.toFixed(2)} ₺`
                                    : 'Fiyat Alarmı Kur'
                                }
                              >
                                <Bell className={`w-3.5 h-3.5 ${getPriceAlertForProduct(product.id) ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(product.id);
                                }}
                                className={`p-1.5 rounded-full shadow-xs backdrop-blur-xs transition-transform active:scale-90 ${
                                  isFavorite(product.id)
                                    ? 'bg-[#00875A] text-white'
                                    : 'bg-white/85 text-[#68766E] hover:text-[#00875A]'
                                }`}
                                title={isFavorite(product.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                              </button>
                            </div>

                            {product.originalPrice && (
                              <span className="absolute top-1.5 left-1.5 bg-[#E84B4B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}
                              </span>
                            )}
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-[#17231D]/60 flex items-center justify-center">
                                <span className="bg-[#D9363E] text-white text-[10px] font-bold px-2 py-1 rounded">
                                  Tükendi
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-[#68766E] font-bold uppercase truncate">
                            {product.brand}
                          </div>
                          <h4 className="text-xs font-bold text-[#17231D] line-clamp-2 leading-tight hover:text-[#00875A]">
                            {product.name}
                          </h4>
                          <div className="text-[10px] text-[#68766E] mt-0.5">{product.weight}</div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E1E9E4]">
                          <div>
                            <span className="text-sm font-extrabold text-[#17231D]">
                              {product.price.toFixed(2)} ₺
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-[#68766E] line-through block -mt-1">
                                {product.originalPrice.toFixed(2)} ₺
                              </span>
                            )}
                          </div>

                          {cartItem ? (
                            <div className="flex items-center gap-1.5 bg-[#E8F7EF] text-[#00875A] px-1.5 py-1 rounded-xl text-xs font-bold">
                              <button
                                onClick={() => updateCartQuantity(product.id, -1)}
                                className="w-5 h-5 flex items-center justify-center hover:bg-[#00875A] hover:text-white rounded"
                              >
                                -
                              </button>
                              <span>{cartItem.quantity}</span>
                              <button
                                onClick={(e) => {
                                  updateCartQuantity(product.id, 1);
                                  if (triggerFlyToCart) triggerFlyToCart(product, e);
                                }}
                                className="w-5 h-5 flex items-center justify-center hover:bg-[#00875A] hover:text-white rounded"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={isOutOfStock}
                              onClick={(e) => handleAddToCartWith3D(product, e)}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-xs ${
                                isOutOfStock ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#00875A] hover:bg-[#006D48]'
                              }`}
                              title="Sepete Ekle"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW: SEARCH SCREEN (3D Nav Ara) */}
        {/* ======================================================================= */}
        {activeScreen === 'search' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('home')}
                className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-[#17231D]">Ürün Ara</h2>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#00875A] absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                placeholder="Örn: Zeytinyağı, Süt, Domates, Ekmek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-sm pl-10 pr-9 py-2.5 rounded-2xl border-2 border-[#E1E9E4] outline-none focus:border-[#00875A] shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[#68766E] hover:text-[#17231D] text-sm p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Popular Quick Searches */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[#68766E] uppercase tracking-wider">Popüler Aramalar</div>
              <div className="flex flex-wrap gap-1.5">
                {['Zeytinyağı', 'Süt', 'Ekmek', 'Domates', 'Çilek', 'Peynir', 'Su', 'Çikolata', 'Bebek'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => setSearchQuery(keyword)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#E1E9E4] text-[#17231D] hover:border-[#00875A] hover:text-[#00875A] transition-colors cursor-pointer"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* Matching Products Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-extrabold text-[#17231D]">
                  {searchQuery ? `"${searchQuery}" Sonuçları` : 'Öne Çıkan Ürünler'}
                </h3>
                <span className="text-xs text-[#68766E]">
                  {activeProducts.filter(p =>
                    !searchQuery ||
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length} Ürün
                </span>
              </div>

              {activeProducts.filter(p =>
                !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E1E9E4] p-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#E8F7EF] flex items-center justify-center text-[#00875A]">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-[#17231D] text-sm">Ürün Bulunamadı</h4>
                  <p className="text-xs text-[#68766E] mt-1 max-w-xs mx-auto">
                    Aradığınız kelimeye uygun bir ürün bulunamadı. Lütfen farklı anahtar kelimelerle tekrar deneyin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activeProducts
                    .filter(p =>
                      !searchQuery ||
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((product) => {
                      const cartItem = cart.find(i => i.product.id === product.id);
                      const isOutOfStock = product.stock <= 0;
                      return (
                        <div
                          key={product.id}
                          className="bg-white border border-[#E1E9E4] rounded-2xl p-2.5 flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                        >
                          <div
                            onClick={() => setSelectedProduct(product)}
                            className="cursor-pointer"
                          >
                            <div className="w-full h-28 bg-[#F7FAF8] rounded-xl overflow-hidden mb-2 relative flex items-center justify-center">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                                onError={(e) => handleImageError(e, product.name)}
                              />
                              {product.originalPrice && (
                                <span className="absolute top-1.5 left-1.5 bg-[#E84B4B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                  %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}
                                </span>
                              )}
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-[#17231D]/60 flex items-center justify-center">
                                  <span className="bg-[#D9363E] text-white text-[10px] font-bold px-2 py-1 rounded">
                                    Tükendi
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="text-[10px] text-[#68766E] font-bold uppercase truncate">
                              {product.brand}
                            </div>
                            <h4 className="text-xs font-bold text-[#17231D] line-clamp-2 leading-tight hover:text-[#00875A]">
                              {product.name}
                            </h4>
                            <div className="text-[10px] text-[#68766E] mt-0.5">{product.weight}</div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E1E9E4]">
                            <div>
                              <span className="text-sm font-extrabold text-[#17231D]">
                                {product.price.toFixed(2)} ₺
                              </span>
                              {product.originalPrice && (
                                <span className="text-[10px] text-[#68766E] line-through block -mt-1">
                                  {product.originalPrice.toFixed(2)} ₺
                                </span>
                              )}
                            </div>

                            {cartItem ? (
                              <div className="flex items-center gap-1.5 bg-[#E8F7EF] text-[#00875A] px-1.5 py-1 rounded-xl text-xs font-bold">
                                <button
                                  onClick={() => updateCartQuantity(product.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center hover:bg-[#00875A] hover:text-white rounded"
                                >
                                  -
                                </button>
                                <span>{cartItem.quantity}</span>
                                <button
                                  onClick={(e) => {
                                    updateCartQuantity(product.id, 1);
                                    if (triggerFlyToCart) triggerFlyToCart(product, e);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center hover:bg-[#00875A] hover:text-white rounded"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={isOutOfStock}
                                onClick={(e) => handleAddToCartWith3D(product, e)}
                                className={`w-7 h-7 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-xs ${
                                  isOutOfStock ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#00875A] hover:bg-[#006D48]'
                                }`}
                                title="Sepete Ekle"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 2: CATEGORIES GRID (02_kategoriler_c11b9264.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'categories' && (
          <div className="p-4 space-y-3.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('home')}
                className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-[#17231D]">Tüm Kategoriler</h2>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#68766E] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Kategori veya ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E1E9E4] outline-none focus:border-[#00875A]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeCategories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setQuickFilter('all');
                    navigateTo('home');
                  }}
                  className="bg-white border border-[#E1E9E4] rounded-2xl p-3 flex flex-col items-center text-center hover:shadow-md hover:border-[#00875A] transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mb-2 bg-[#F7FAF8] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => handleImageError(e, cat.name)}
                    />
                  </div>
                  <h4 className="text-xs font-bold text-[#17231D] group-hover:text-[#00875A] leading-snug">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-[#68766E] mt-0.5">{cat.itemCount} Ürün</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 3: CART (04_sepet_a67dd514.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'cart' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('home')}
                  className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-extrabold text-[#17231D]">Sepetim</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-[#E84B4B] hover:underline cursor-pointer"
                >
                  Tümünü Sil
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#E1E9E4] p-6 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-[#E8F7EF] text-[#00875A] flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-[#17231D]">Sepetiniz Henüz Boş</h3>
                <p className="text-xs text-[#68766E] max-w-xs mx-auto">
                  Hatay'ın en taze ürünlerini hemen sepetinize ekleyip 15 dakikada kapınıza getirtebilirsiniz.
                </p>
                <button
                  onClick={() => navigateTo('home')}
                  className="mt-2 px-6 py-2.5 bg-[#00875A] hover:bg-[#006D48] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="space-y-2.5">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="bg-white border border-[#E1E9E4] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-xl bg-[#F7FAF8] shrink-0"
                          onError={(e) => handleImageError(e, item.product.category)}
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-[#17231D] truncate">{item.product.name}</h4>
                          <span className="text-[11px] font-extrabold text-[#00875A]">
                            {item.product.price.toFixed(2)} ₺
                          </span>
                          <span className="text-[10px] text-[#68766E] block">{item.product.weight}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl px-2 py-1 text-xs font-bold">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="text-[#68766E] hover:text-[#00875A]"
                          >
                            -
                          </button>
                          <span className="w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="text-[#68766E] hover:text-[#00875A]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#68766E] hover:text-[#E84B4B] p-1"
                          title="Ürünü Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="bg-white border border-[#E1E9E4] rounded-2xl p-3 space-y-2">
                  <span className="text-xs font-bold text-[#17231D]">Kupon Kodu</span>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Kupon kodunuzu girin (örn: HOSGELDIN50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#F7FAF8] text-xs px-3 py-2 rounded-xl border border-[#E1E9E4] outline-none focus:border-[#00875A]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#00875A] hover:bg-[#006D48] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Uygula
                    </button>
                  </form>
                  {couponFeedback && (
                    <p className={`text-[11px] font-bold ${couponFeedback.isError ? 'text-[#D9363E]' : 'text-[#00875A]'}`}>
                      {couponFeedback.msg}
                    </p>
                  )}
                  {activeCoupon && (
                    <div className="flex items-center justify-between text-xs bg-[#E8F7EF] text-[#00875A] p-2 rounded-xl font-bold">
                      <span>Aktif Kupon: {activeCoupon.code}</span>
                      <button onClick={removeCoupon} className="text-[#E84B4B] hover:underline text-[10px]">
                        Kaldır
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary Card */}
                <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#68766E]">
                    <span>Ara Toplam</span>
                    <span className="font-bold text-[#17231D]">{cartSubtotal.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex items-center justify-between text-[#68766E]">
                    <span>Teslimat Ücreti</span>
                    <span className="font-bold text-[#17231D]">
                      {deliveryFee === 0 ? <span className="text-[#00875A]">Ücretsiz</span> : `${deliveryFee.toFixed(2)} ₺`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-[#00875A] font-bold">
                      <span>İndirim</span>
                      <span>-{discountAmount.toFixed(2)} ₺</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#E1E9E4] flex items-center justify-between text-sm font-extrabold text-[#17231D]">
                    <span>Toplam</span>
                    <span className="text-base text-[#00875A]">{cartTotal.toFixed(2)} ₺</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => navigateTo('payment')}
                  className="w-full py-3.5 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Siparişi Tamamla</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 4: PAYMENT (09_odeme_22f2549e.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'payment' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('cart')}
                className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-[#17231D]">Ödeme Yöntemi</h2>
            </div>

            {/* Payment Methods List */}
            <div className="space-y-2.5">
              <label
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-[#E8F7EF] border-[#00875A] shadow-xs'
                    : 'bg-white border-[#E1E9E4] hover:bg-[#F7FAF8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-[#00875A] bg-[#00875A]' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'card' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#17231D]">Kredi / Banka Kartı</h4>
                    <p className="text-[10px] text-[#68766E]">Taksit ve tek çekim seçenekleri</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-[#E1E9E4]">
                  <span>VISA</span>
                  <span>·</span>
                  <span className="text-[#E84B4B]">MC</span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'bg-[#E8F7EF] border-[#00875A] shadow-xs'
                    : 'bg-white border-[#E1E9E4] hover:bg-[#F7FAF8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'wallet' ? 'border-[#00875A] bg-[#00875A]' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'wallet' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#17231D]">Banka Havalesi / FAST</h4>
                    <p className="text-[10px] text-[#68766E]">Tüm bankalardan anında onay</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </label>

              <label
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-[#E8F7EF] border-[#00875A] shadow-xs'
                    : 'bg-white border-[#E1E9E4] hover:bg-[#F7FAF8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'border-[#00875A] bg-[#00875A]' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'cash' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#17231D]">Kapıda Ödeme</h4>
                    <p className="text-[10px] text-[#68766E]">Nakit veya temassız POS ile kapıda</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </label>
            </div>

            {/* Card Details (if card selected) */}
            {paymentMethod === 'card' && (
              <div className="bg-white border border-[#E1E9E4] rounded-2xl p-4 space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-[#68766E] block mb-1">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00875A]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#68766E] block mb-1">Kart Numarası</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00875A] font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#68766E] block mb-1">Son Kullanma</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00875A]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#68766E] block mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00875A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Assurance Card (matching Figma) */}
            <div className="p-3.5 bg-[#E8F7EF] border border-[#00875A]/20 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00875A] shrink-0" />
              <div>
                <h5 className="font-extrabold text-xs text-[#00875A]">Güvenli Ödeme Altyapısı</h5>
                <p className="text-[10px] text-[#17231D] leading-tight mt-0.5">
                  Ödeme bilgileriniz 256-bit SSL ve PCI-DSS standartları ile banka seviyesinde korunmaktadır.
                </p>
              </div>
            </div>

            {/* Order Total Overview */}
            <div className="bg-white border border-[#E1E9E4] rounded-2xl p-3 flex items-center justify-between text-xs">
              <span className="font-bold text-[#68766E]">Ödenecek Tutar</span>
              <span className="text-base font-extrabold text-[#00875A]">{cartTotal.toFixed(2)} ₺</span>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleCheckoutSubmit}
              disabled={isCheckingOut}
              className={`w-full py-3.5 font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isCheckingOut
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#00875A] hover:bg-[#006D48] text-white active:scale-[0.99]'
              }`}
            >
              {isCheckingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Siparişiniz Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span>Ödemeyi Tamamla ve Siparişi Ver</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 5: ORDER TRACKING (08_siparis_takibi_59069193.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'orders' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('home')}
                  className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-extrabold text-[#17231D]">Sipariş Detayı</h2>
              </div>
              <span className="text-xs font-bold text-[#00875A] bg-[#E8F7EF] px-2.5 py-1 rounded-full">
                Canlı Takip
              </span>
            </div>

            {/* Order Stepper Card (matching Figma) */}
            <div className="bg-white border border-[#E1E9E4] rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E1E9E4]">
                <div>
                  <span className="text-sm font-extrabold text-[#17231D]">
                    {activeOrder ? `#${activeOrder.orderNumber}` : '#4587'}
                  </span>
                  <p className="text-[10px] text-[#68766E] mt-0.5">12 Kasım 2026 · 14:32</p>
                </div>
                <span className="text-xs font-bold text-[#00875A] bg-[#E8F7EF] px-2 py-0.5 rounded-lg">
                  15 dk İçinde Kapıda
                </span>
              </div>

              {/* Stepper Timeline */}
              <div className="relative pl-6 space-y-5 text-xs">
                {/* Vertical Line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#00875A]" />

                <div className="relative flex items-center justify-between">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#00875A] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[#17231D]">Sipariş Oluşturuldu</span>
                  <span className="text-[10px] text-[#68766E]">14:32</span>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#00875A] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[#17231D]">Market Onayladı</span>
                  <span className="text-[10px] text-[#68766E]">14:40</span>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#00875A] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[#17231D]">Hazırlanıyor</span>
                  <span className="text-[10px] text-[#68766E]">14:50</span>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#00875A] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[#17231D]">Kurye Atandı</span>
                  <span className="text-[10px] text-[#68766E]">15:05</span>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-[#00875A] text-white flex items-center justify-center ring-4 ring-[#E8F7EF] animate-pulse">
                    <Bike className="w-3 h-3" />
                  </div>
                  <span className="font-extrabold text-[#00875A]">Yolda</span>
                  <span className="text-[10px] font-bold text-[#00875A]">15:12</span>
                </div>

                <div className="relative flex items-center justify-between opacity-50">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-slate-200 border border-slate-300" />
                  <span className="font-medium text-[#68766E]">Teslim Edildi</span>
                  <span className="text-[10px] text-[#68766E]">-</span>
                </div>
              </div>
            </div>

            {/* Courier Info Card (matching Figma) */}
            <div className="bg-white border border-[#E1E9E4] rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F7EF] text-[#00875A] flex items-center justify-center overflow-hidden font-bold">
                  AY
                </div>
                <div>
                  <span className="text-[10px] text-[#68766E] font-bold uppercase tracking-wider block">Kurye Bilgileri</span>
                  <h4 className="font-extrabold text-sm text-[#17231D]">Ahmet Yılmaz</h4>
                  <p className="text-[11px] text-[#68766E]">Plaka: 31 ABC 123 · Honda Activa</p>
                </div>
              </div>
              <a
                href="tel:05329990003"
                className="w-10 h-10 rounded-2xl bg-[#00875A] text-white flex items-center justify-center hover:bg-[#006D48] transition-colors shadow-xs shrink-0"
                title="Kuryeyi Ara"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Reorder Toast Banner */}
            {reorderNotice && (
              <div className="bg-[#E8F7EF] border border-[#00875A]/30 text-[#00875A] p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00875A]" />
                  <span>{reorderNotice}</span>
                </div>
                <button
                  onClick={() => navigateTo('cart')}
                  className="px-2.5 py-1 bg-[#00875A] text-white rounded-lg text-[11px] font-extrabold hover:bg-[#006D48] transition-colors"
                >
                  Sepete Git
                </button>
              </div>
            )}

            {/* Past Orders Shortcut */}
            <div className="bg-white border border-[#E1E9E4] rounded-3xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#17231D]">Geçmiş Siparişlerim</h4>
              <div className="divide-y divide-[#E1E9E4]">
                {orders.map(ord => (
                  <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#17231D]">#{ord.orderNumber}</span>
                      <p className="text-[10px] text-[#68766E]">{ord.items.length} Ürün · {ord.totalAmount.toFixed(2)} ₺</p>
                    </div>
                    <button
                      onClick={() => {
                        reorderPastOrder(ord);
                        setReorderNotice(`#${ord.orderNumber} siparişindeki ürünler sepete eklendi.`);
                        setTimeout(() => setReorderNotice(null), 4000);
                      }}
                      className="px-3 py-1 bg-[#E8F7EF] text-[#00875A] font-bold rounded-lg hover:bg-[#00875A] hover:text-white transition-colors cursor-pointer text-[11px]"
                    >
                      Tekrarla
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 6: PROFILE (10_profil_destek_acae481a.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'profile' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#17231D]">Profilim</h2>
              <span className="text-[11px] font-bold text-[#00875A] bg-[#E8F7EF] px-2.5 py-0.5 rounded-full">
                {isLoggedIn ? 'Onaylı Üye' : 'Misafir Kullanıcı'}
              </span>
            </div>

            {/* User Profile Card (matching Figma) */}
            <div className="bg-white border border-[#E1E9E4] rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#00875A] text-white flex items-center justify-center font-extrabold text-lg shrink-0">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#17231D]">
                    {isLoggedIn ? currentUser.name : 'Misafir Müşteri'}
                  </h3>
                  <p className="text-[11px] text-[#68766E]">
                    {isLoggedIn ? (currentUser.phone || '+90 532 111 22 33') : 'Üye olmadan gezinme modu'}
                  </p>
                  <span className="text-[10px] text-[#00875A] font-bold">Müşteri Hesabı</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#68766E]" />
            </div>

            {/* Menu Links List (matching Figma) */}
            <div className="bg-white border border-[#E1E9E4] rounded-3xl divide-y divide-[#E1E9E4] overflow-hidden shadow-xs text-xs">
              {/* Mobil Uygulama & Google Play Paylaşım Kartı */}
              <button
                onClick={() => setIsMobileModalOpen(true)}
                className="w-full p-3.5 flex items-center justify-between bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00875A] text-white flex items-center justify-center shadow-xs shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#17231D] block">Mobil Uygulama &amp; Paylaş</span>
                    <span className="text-[10px] text-[#00875A] font-medium">Google Play (.AAB), iOS &amp; Android QR Paylaş</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-white bg-[#00875A] px-2 py-0.5 rounded-md">
                    Yükle &amp; Paylaş
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#68766E]" />
                </div>
              </button>

              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Adreslerim</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </button>

              <button
                onClick={() => navigateTo('orders')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Siparişlerim</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </button>

              <button
                onClick={() => navigateTo('favorites')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Favorilerim</span>
                </div>
                <span className="text-[11px] font-bold text-[#00875A] bg-[#E8F7EF] px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              </button>

              <button
                onClick={() => navigateTo('price_alerts')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <div>
                    <span className="font-bold text-[#17231D] block">Akıllı Fiyat Alarmlarım</span>
                    <span className="text-[10px] text-[#68766E]">Kahve, bebek bezi, temizlik, mama indirim takibi</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {priceAlerts.length}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#68766E]" />
                </div>
              </button>

              <button
                onClick={() => navigateTo('shopping_list')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Alışveriş Listem</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </button>

              <button
                onClick={() => navigateTo('product_comparison')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Ürün Karşılaştırma</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </button>

              <button
                onClick={() => {
                  applyCoupon('HOSGELDIN50');
                  navigateTo('cart');
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Kuponlarım</span>
                </div>
                <span className="text-[10px] text-[#00875A] font-bold bg-[#E8F7EF] px-2 py-0.5 rounded">
                  HOSGELDIN50
                </span>
              </button>

              <button
                onClick={() => navigateTo('support')}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Yardım &amp; Destek</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </button>

              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="w-full p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Ayarlar &amp; Şifre Değiştir</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </button>

              {isLoggedIn ? (
                <button
                  onClick={logout}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-rose-50 text-[#E84B4B] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4" />
                    <span className="font-bold">Çıkış Yap</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal("Hesabınızı yönetmek için lütfen üye girişi yapınız.")}
                  className="w-full p-3.5 flex items-center justify-between bg-[#00875A] text-white hover:bg-[#006D48] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    <span className="font-bold">Giriş Yap veya Kayıt Ol</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 7: FAVORITES (11_favoriler_82fed959.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'favorites' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('profile')}
                  className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-extrabold text-[#17231D]">Favorilerim</h2>
              </div>
              <span className="text-xs font-bold text-[#00875A] bg-[#E8F7EF] px-2.5 py-0.5 rounded-full">
                {favorites.length} Ürün
              </span>
            </div>

            {/* Tabs: Ürünler / Marketler */}
            <div className="flex p-1 bg-white border border-[#E1E9E4] rounded-2xl">
              <button
                onClick={() => setFavoritesTab('products')}
                className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  favoritesTab === 'products'
                    ? 'bg-[#00875A] text-white shadow-xs'
                    : 'text-[#68766E] hover:text-[#17231D]'
                }`}
              >
                Ürünler
              </button>
              <button
                onClick={() => setFavoritesTab('stores')}
                className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  favoritesTab === 'stores'
                    ? 'bg-[#00875A] text-white shadow-xs'
                    : 'text-[#68766E] hover:text-[#17231D]'
                }`}
              >
                Marketler
              </button>
            </div>

            {favoritesTab === 'products' && (
              <div>
                {favorites.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-3xl border border-[#E1E9E4] p-6 space-y-2">
                    <Heart className="w-12 h-12 text-[#68766E] mx-auto opacity-40" />
                    <h4 className="font-extrabold text-sm text-[#17231D]">Henüz Favoriniz Yok</h4>
                    <p className="text-xs text-[#68766E]">
                      Beğendiğiniz ürünlerin üzerindeki kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
                    </p>
                    <button
                      onClick={() => navigateTo('home')}
                      className="mt-3 px-4 py-2 bg-[#00875A] text-white text-xs font-bold rounded-xl"
                    >
                      Ürünleri İncele
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {products.filter(p => favorites.includes(p.id)).map(product => (
                      <div
                        key={`fav-${product.id}`}
                        className="bg-white border border-[#E1E9E4] rounded-2xl p-3 flex flex-col justify-between shadow-2xs"
                      >
                        <div className="relative w-full aspect-square bg-[#F7FAF8] rounded-xl overflow-hidden mb-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, product.category)}
                          />
                          <button
                            onClick={() => toggleFavorite(product.id)}
                            className="absolute top-1.5 right-1.5 p-1.5 bg-[#00875A] text-white rounded-full shadow-xs"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#17231D] truncate">{product.name}</h4>
                          <span className="text-xs font-extrabold text-[#00875A]">{product.price.toFixed(2)} ₺</span>
                        </div>
                        <button
                          onClick={() => addToCart(product, 'auto')}
                          className="w-full mt-2 py-2 bg-[#00875A] hover:bg-[#006D48] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {favoritesTab === 'stores' && (
              <div className="space-y-3">
                {stores.map(st => (
                  <div
                    key={st.id}
                    className="p-3.5 bg-white border border-[#E1E9E4] rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-extrabold text-xs text-[#17231D]">{st.name}</h4>
                      <p className="text-[11px] text-[#68766E]">{st.address}</p>
                      <span className="text-[10px] text-[#00875A] font-bold">15-20 dk Teslimat</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveStoreId(st.id);
                        navigateTo('home');
                      }}
                      className="px-3 py-1.5 bg-[#00875A] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Seç
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 7.5: SMART PRICE ALERTS (AKILLI FİYAT ALARMLARI) */}
        {/* ======================================================================= */}
        {activeScreen === 'price_alerts' && (
          <PriceAlertsView
            onBack={() => navigateTo('home')}
            onOpenProductDetail={(prod) => {
              setSelectedProduct(prod);
              setDetailQuantity(1);
            }}
            onOpenAlertModal={(prod) => openPriceAlertModal(prod)}
          />
        )}

        {/* ======================================================================= */}
        {/* VIEW 8: SHOPPING LIST (12_alisveris_listesi_d2be22dc.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'shopping_list' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('profile')}
                  className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-extrabold text-[#17231D]">Alışveriş Listem</h2>
              </div>
              <button
                onClick={() => {
                  const name = prompt('Yeni malzeme veya ürün adı giriniz:');
                  if (name) {
                    setShoppingItems(prev => [
                      ...prev,
                      { id: Date.now().toString(), name, checked: true, price: 25.00, unit: 'Adet' }
                    ]);
                  }
                }}
                className="text-xs font-bold text-[#00875A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Madde</span>
              </button>
            </div>

            {/* Checklist */}
            <div className="bg-white border border-[#E1E9E4] rounded-3xl divide-y divide-[#E1E9E4] overflow-hidden shadow-xs">
              {shoppingItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setShoppingItems(prev =>
                      prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i)
                    );
                  }}
                  className="p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      item.checked ? 'border-[#00875A] bg-[#00875A] text-white' : 'border-slate-300'
                    }`}>
                      {item.checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-bold ${item.checked ? 'text-[#17231D]' : 'text-[#68766E] line-through'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#00875A]">{item.price.toFixed(2)} ₺</span>
                </div>
              ))}
            </div>

            <button
              onClick={addAllShoppingListToCart}
              className="w-full py-3.5 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Seçilenleri Sepete Ekle</span>
            </button>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 9: PRODUCT COMPARISON (13_urun_karsilastirma_9426ff57.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'product_comparison' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('profile')}
                className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-[#17231D]">Ürün Karşılaştırma</h2>
            </div>

            {/* Filter Tabs matching Figma */}
            <div className="grid grid-cols-4 gap-1.5 bg-white p-1 rounded-2xl border border-[#E1E9E4] text-[11px] font-bold text-center">
              {(['price', 'unit_price', 'stock', 'delivery'] as const).map(met => (
                <button
                  key={met}
                  onClick={() => setComparisonMetric(met)}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    comparisonMetric === met
                      ? 'bg-[#00875A] text-white shadow-xs'
                      : 'text-[#68766E] hover:text-[#17231D]'
                  }`}
                >
                  {met === 'price' && 'Fiyat'}
                  {met === 'unit_price' && 'Birim Fiyat'}
                  {met === 'stock' && 'Stok'}
                  {met === 'delivery' && 'Teslimat'}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-[#17231D]">Domates (1 kg)</h4>
              <p className="text-[10px] text-[#68766E]">Hatay genelindeki depolar ve marketler arası anlık karşılaştırma</p>
            </div>

            {/* Store Comparison Cards matching Figma */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white border border-[#E1E9E4] rounded-2xl p-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <span className="font-extrabold text-xs text-[#00875A] block">Hatay Gross</span>
                  <span className="text-[10px] text-[#68766E]">Antakya Merkez</span>
                  <div className="text-sm font-extrabold text-[#17231D] mt-2">34,90 TL</div>
                  <div className="text-[10px] text-[#68766E]">(34,90 TL/kg)</div>
                  <div className="mt-2 text-[10px] font-bold text-[#00875A]">Stok: Var</div>
                  <div className="text-[10px] text-[#68766E]">Teslimat: 15 dk</div>
                </div>
                <button
                  onClick={() => {
                    const prod = products[0];
                    if (prod) addToCart(prod, 'auto');
                    navigateTo('cart');
                  }}
                  className="mt-3 py-1.5 bg-[#00875A] text-white font-bold rounded-xl text-xs hover:bg-[#006D48] transition-colors"
                >
                  Seç
                </button>
              </div>

              <div className="bg-white border-2 border-[#00875A] rounded-2xl p-3 flex flex-col justify-between shadow-xs relative">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#00875A] text-white text-[8px] font-bold px-2 py-0.2 rounded-full whitespace-nowrap">
                  En Uygun
                </span>
                <div>
                  <span className="font-extrabold text-xs text-[#00875A] block">Defne Express</span>
                  <span className="text-[10px] text-[#68766E]">Defne Depo</span>
                  <div className="text-sm font-extrabold text-[#00875A] mt-2">31,90 TL</div>
                  <div className="text-[10px] text-[#68766E]">(31,90 TL/kg)</div>
                  <div className="mt-2 text-[10px] font-bold text-[#00875A]">Stok: Var</div>
                  <div className="text-[10px] text-[#68766E]">Teslimat: 20 dk</div>
                </div>
                <button
                  onClick={() => {
                    const prod = products[0];
                    if (prod) addToCart(prod, 'auto');
                    navigateTo('cart');
                  }}
                  className="mt-3 py-1.5 bg-[#00875A] text-white font-bold rounded-xl text-xs hover:bg-[#006D48] transition-colors"
                >
                  Seç
                </button>
              </div>

              <div className="bg-white border border-[#E1E9E4] rounded-2xl p-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">Sahil Dağıtım</span>
                  <span className="text-[10px] text-[#68766E]">İskenderun</span>
                  <div className="text-sm font-extrabold text-[#17231D] mt-2">32,90 TL</div>
                  <div className="text-[10px] text-[#68766E]">(32,90 TL/kg)</div>
                  <div className="mt-2 text-[10px] font-bold text-[#00875A]">Stok: Var</div>
                  <div className="text-[10px] text-[#68766E]">Teslimat: 25 dk</div>
                </div>
                <button
                  onClick={() => {
                    const prod = products[0];
                    if (prod) addToCart(prod, 'auto');
                    navigateTo('cart');
                  }}
                  className="mt-3 py-1.5 bg-[#00875A] text-white font-bold rounded-xl text-xs hover:bg-[#006D48] transition-colors"
                >
                  Seç
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 10: NOTIFICATIONS (14_bildirimler_6d46704b.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'notifications' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('home')}
                  className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-extrabold text-[#17231D]">Bildirimler</h2>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs font-bold text-[#68766E] hover:text-[#E84B4B]"
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Tabs: Tümü / Sipariş / Kampanya / Sistem matching Figma */}
            <div className="flex gap-1.5 bg-white p-1 rounded-2xl border border-[#E1E9E4] text-xs font-bold text-center">
              {(['all', 'order', 'promo', 'system'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setNotifFilter(f)}
                  className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                    notifFilter === f
                      ? 'bg-[#00875A] text-white shadow-xs'
                      : 'text-[#68766E] hover:text-[#17231D]'
                  }`}
                >
                  {f === 'all' && 'Tümü'}
                  {f === 'order' && 'Sipariş'}
                  {f === 'promo' && 'Kampanya'}
                  {f === 'system' && 'Sistem'}
                </button>
              ))}
            </div>

            {/* Notifications List matching Figma */}
            <div className="space-y-2.5">
              {notifications
                .filter(n => notifFilter === 'all' || n.type === notifFilter)
                .map(item => (
                  <div
                    key={item.id}
                    onClick={() => markNotificationAsRead(item.id)}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer ${
                      item.isRead
                        ? 'bg-white border-[#E1E9E4] text-[#68766E]'
                        : 'bg-[#E8F7EF]/60 border-[#00875A]/40 text-[#17231D] shadow-2xs'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#00875A] text-white flex items-center justify-center shrink-0 mt-0.5">
                      {item.type === 'order' ? (
                        <Bike className="w-4 h-4" />
                      ) : item.type === 'promo' ? (
                        <Tag className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-xs text-[#17231D]">{item.title}</h4>
                        <span className="text-[10px] text-[#68766E] shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#68766E] mt-0.5 leading-relaxed">{item.message}</p>
                    </div>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#00875A] shrink-0 mt-2" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 11: SUPPORT (15_destek_merkezi_a5409312.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'support' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('profile')}
                className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold text-[#17231D]">Destek Merkezi</h2>
            </div>

            {/* Hero Green Card matching Figma */}
            <div className="p-5 bg-gradient-to-r from-[#006D48] to-[#00875A] text-white rounded-3xl space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold leading-tight">Size Nasıl Yardımcı Olabiliriz?</h3>
              <p className="text-xs text-[#E8F7EF]">
                Sorununuzu bize iletin, Hatay ekibimiz en kısa sürede dönüş yapsın.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => alert("Destek talebiniz oluşturuldu (#DT-326). Müşteri temsilcimiz 5 dakika içinde sizinle iletişime geçecektir.")}
                  className="flex-1 py-2 bg-white text-[#00875A] font-bold text-xs rounded-xl shadow-xs hover:bg-[#E8F7EF]"
                >
                  Yeni Talep Oluştur
                </button>
                <a
                  href="tel:03262140326"
                  className="flex-1 py-2 bg-[#005236] text-white font-bold text-xs rounded-xl text-center shadow-xs hover:bg-[#003d28]"
                >
                  Canlı Destek
                </a>
              </div>
            </div>

            {/* Menu List matching Figma */}
            <div className="bg-white border border-[#E1E9E4] rounded-3xl divide-y divide-[#E1E9E4] overflow-hidden text-xs shadow-xs">
              <div className="p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Sıkça Sorulan Sorular (SSS)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] cursor-pointer">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">İade ve Değişim Koşulları</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] cursor-pointer">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">Gizlilik ve KVKK Politikası</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] cursor-pointer">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#00875A]" />
                  <span className="font-bold text-[#17231D]">İletişim &amp; Adres Bilgileri</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#68766E]" />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 12: RECIPE ASSISTANT ("Bugün Ne Yapsam?" - 05_yapay_zeka_yemek_1ec61104.png) */}
        {/* ======================================================================= */}
        {activeScreen === 'recipe_assistant' && (
          <div className="p-3">
            <RecipeAssistantView
              onBackToStore={() => navigateTo('home')}
              onOpenCart={() => navigateTo('cart')}
            />
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 13: AI SHOPPING ASSISTANT */}
        {/* ======================================================================= */}
        {activeScreen === 'assistant' && (
          <div className="p-3">
            <AIShoppingAssistant
              onBackToStore={() => navigateTo('home')}
              onOpenCart={() => navigateTo('cart')}
            />
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. PRODUCT DETAIL MODAL (03_urun_detayi_a9acdb24.png) */}
      {/* ========================================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-[#17231D]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-3.5 border-b border-[#E1E9E4] flex items-center justify-between">
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-xl hover:bg-[#E8F7EF] text-[#00875A] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-xs text-[#68766E]">Ürün Detayı</span>
              <button
                onClick={() => toggleFavorite(selectedProduct.id)}
                className={`p-1.5 rounded-xl transition-colors ${
                  isFavorite(selectedProduct.id) ? 'text-[#00875A] bg-[#E8F7EF]' : 'text-[#68766E]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(selectedProduct.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Modal Scroll Content matching Figma */}
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="relative w-full aspect-square bg-[#F7FAF8] rounded-2xl overflow-hidden border border-[#E1E9E4]">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, selectedProduct.category)}
                />
                {selectedProduct.originalPrice && (
                  <span className="absolute top-2 left-2 bg-[#00875A] text-white text-xs font-extrabold px-2 py-0.5 rounded-lg shadow-xs">
                    %{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)} İndirim
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#17231D]">{selectedProduct.name}</h3>
                <p className="text-xs text-[#00875A] font-semibold mt-0.5">Taze ve doğal · Hatay üretimi</p>
                <div className="flex items-center gap-1.5 text-xs text-[#68766E] mt-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-[#17231D]">4.8</span>
                  <span>(124 değerlendirme)</span>
                </div>
              </div>

              {/* Price & Quantity Bar */}
              <div className="flex items-center justify-between p-3 bg-[#F7FAF8] border border-[#E1E9E4] rounded-2xl">
                <div>
                  <div className="text-lg font-extrabold text-[#00875A]">
                    {selectedProduct.price.toFixed(2)} ₺
                  </div>
                  {selectedProduct.originalPrice && (
                    <span className="text-xs text-[#68766E] line-through block">
                      {selectedProduct.originalPrice.toFixed(2)} ₺
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-white border border-[#E1E9E4] rounded-xl px-2.5 py-1 text-sm font-bold">
                  <button
                    onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                    className="text-[#68766E] hover:text-[#00875A]"
                  >
                    -
                  </button>
                  <span className="w-5 text-center">{detailQuantity}</span>
                  <button
                    onClick={() => {
                      if (selectedProduct.stock && detailQuantity >= selectedProduct.stock) return;
                      setDetailQuantity(detailQuantity + 1);
                    }}
                    disabled={selectedProduct.stock <= detailQuantity}
                    className="text-[#68766E] hover:text-[#00875A] disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Exact Stock & Delivery Status */}
              <div>
                {selectedProduct.stock > 0 ? (
                  <div className="flex items-center gap-2 p-2.5 bg-[#E8F7EF] border border-[#00875A]/20 rounded-2xl text-xs font-bold text-[#00875A]">
                    <CheckCircle2 className="w-4 h-4 text-[#00875A] shrink-0" />
                    <span>Depoda Mevcut ({selectedProduct.stock} {selectedProduct.unit || 'adet'}) · Hızlı Teslimat (15-20 dk)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-red-200 rounded-2xl text-xs font-bold text-[#E84B4B]">
                    <AlertCircle className="w-4 h-4 text-[#E84B4B] shrink-0" />
                    <span>Bu ürünün stoğu geçici olarak tükenmiştir.</span>
                  </div>
                )}
              </div>

              {/* Smart Price Alert Card in Product Detail */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 fill-amber-500/20" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-amber-950 block">Akıllı Fiyat Alarmı</span>
                    <span className="text-[10px] text-amber-800 truncate block">
                      {getPriceAlertForProduct(selectedProduct.id)
                        ? `Alarm Kurulu: ${getPriceAlertForProduct(selectedProduct.id)?.targetPrice.toFixed(2)} ₺ ve altı`
                        : 'Fiyat hedefinize düştüğünde bildirim alın'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openPriceAlertModal(selectedProduct)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  {getPriceAlertForProduct(selectedProduct.id) ? 'Alarmı Düzenle' : 'Alarm Kur'}
                </button>
              </div>

              {/* Nutrition & Authenticity Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl flex items-center gap-2">
                  <span className="text-base">🌿</span>
                  <div>
                    <span className="font-bold text-[#17231D] block">Doğal &amp; Katkısız</span>
                    <span className="text-[#68766E] text-[10px]">Hatay tarlalarından</span>
                  </div>
                </div>
                <div className="p-2 bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl flex items-center gap-2">
                  <span className="text-base">🛡️</span>
                  <div>
                    <span className="font-bold text-[#17231D] block">Güvenli Paket</span>
                    <span className="text-[#68766E] text-[10px]">Hijyenik ambalaj</span>
                  </div>
                </div>
              </div>

              {/* Description & Specs */}
              <div className="space-y-2 pt-2 border-t border-[#E1E9E4]">
                <h4 className="text-xs font-extrabold text-[#17231D]">Ürün Özellikleri &amp; Açıklama</h4>
                <p className="text-xs text-[#68766E] leading-relaxed">
                  {selectedProduct.description || 'Hatay bölgesinin verimli topraklarında geleneksel yöntemlerle üretilen, tazeliği ve lezzeti korunarak depomuzdan kapınıza getirilen tescilli market ürünü.'}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2 bg-[#F7FAF8] rounded-xl">
                    <span className="text-[#68766E] text-[10px] block">Marka</span>
                    <span className="font-bold text-[#17231D] truncate block">{selectedProduct.brand}</span>
                  </div>
                  <div className="p-2 bg-[#F7FAF8] rounded-xl">
                    <span className="text-[#68766E] text-[10px] block">Gramaj</span>
                    <span className="font-bold text-[#17231D] block">{selectedProduct.weight}</span>
                  </div>
                  <div className="p-2 bg-[#F7FAF8] rounded-xl">
                    <span className="text-[#68766E] text-[10px] block">Birim Fiyat</span>
                    <span className="font-bold text-[#17231D] block">{selectedProduct.price.toFixed(2)} ₺ / {selectedProduct.unit}</span>
                  </div>
                </div>
              </div>

              {/* Related / Substitute Suggestions */}
              {products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).length > 0 && (
                <div className="pt-2 border-t border-[#E1E9E4] space-y-2">
                  <h4 className="text-xs font-extrabold text-[#17231D]">Benzer Ürünler</h4>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {products
                      .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
                      .slice(0, 4)
                      .map(rel => (
                        <div
                          key={`rel-${rel.id}`}
                          onClick={() => {
                            setSelectedProduct(rel);
                            setDetailQuantity(1);
                          }}
                          className="w-24 bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl p-1.5 flex flex-col justify-between shrink-0 cursor-pointer hover:border-[#00875A] transition-all"
                        >
                          <img
                            src={rel.image}
                            alt={rel.name}
                            className="w-full aspect-square object-cover rounded-lg mb-1"
                            onError={(e) => handleImageError(e, rel.category)}
                          />
                          <span className="text-[10px] font-bold text-[#17231D] line-clamp-1">{rel.name}</span>
                          <span className="text-[10px] font-extrabold text-[#00875A] mt-0.5">{rel.price.toFixed(2)} ₺</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 border-t border-[#E1E9E4] bg-white">
              {selectedProduct.stock > 0 ? (
                <button
                  onClick={(e) => {
                    for (let i = 0; i < detailQuantity; i++) {
                      addToCart(selectedProduct, 'auto');
                    }
                    if (triggerFlyToCart) {
                      triggerFlyToCart(selectedProduct, e);
                    }
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3.5 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Sepete Ekle ({(selectedProduct.price * detailQuantity).toFixed(2)} ₺)</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 bg-slate-200 text-slate-500 font-extrabold text-sm rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Ürün Tükendi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.5. ADVANCED FILTER & SORT MODAL (AŞAMA 2) */}
      {/* ========================================================================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-[#17231D]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#E1E9E4] flex items-center justify-between bg-[#F7FAF8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F7EF] text-[#00875A] flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#17231D] text-sm">Filtrele ve Sırala</h3>
                  <p className="text-[10px] text-[#68766E]">Marka, fiyat aralığı ve sıralama seçenekleri</p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 text-[#68766E] hover:text-[#17231D] rounded-xl hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Sıralama */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#17231D]">Sıralama Ölçütü</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'default', label: 'Önerilen Sıralama' },
                    { id: 'price_asc', label: 'Fiyat: En Düşük' },
                    { id: 'price_desc', label: 'Fiyat: En Yüksek' },
                    { id: 'popular', label: 'En Çok Satanlar' },
                    { id: 'discount', label: 'İndirim Oranı' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSortBy(item.id as typeof sortBy)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        sortBy === item.id
                          ? 'bg-[#E8F7EF] text-[#00875A] border-[#00875A]'
                          : 'bg-white text-[#68766E] border-[#E1E9E4] hover:bg-[#F7FAF8]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sadece Stokta Olanlar */}
              <div className="p-3 bg-[#F7FAF8] border border-[#E1E9E4] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#17231D] block">Sadece Stokta Olanlar</span>
                  <span className="text-[10px] text-[#68766E]">Tükenmiş ürünleri listede gizle</span>
                </div>
                <button
                  type="button"
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    inStockOnly ? 'bg-[#00875A]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                      inStockOnly ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Fiyat Filtresi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#17231D]">Maksimum Fiyat</h4>
                  <span className="font-extrabold text-[#00875A] text-sm font-mono">{maxPrice} ₺</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#00875A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#68766E]">
                  <span>10 ₺</span>
                  <span>250 ₺</span>
                  <span>500 ₺</span>
                </div>
              </div>

              {/* Marka Filtresi */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#17231D]">Markaya Göre Filtrele</h4>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {availableBrands.map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedBrand === brand
                          ? 'bg-[#00875A] text-white shadow-xs'
                          : 'bg-white text-[#68766E] border border-[#E1E9E4] hover:bg-[#E8F7EF]'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#E1E9E4] bg-white flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('Tümü');
                  setMaxPrice(300);
                  setInStockOnly(false);
                  setSortBy('default');
                }}
                className="px-4 py-2.5 text-[#68766E] hover:text-[#17231D] text-xs font-bold underline cursor-pointer"
              >
                Filtreleri Temizle
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-6 py-2.5 bg-[#00875A] hover:bg-[#006D48] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Uygula ({filteredProducts.length} Ürün)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HATAY DISTRICT SELECTOR MODAL */}
      {/* ========================================================================= */}
      {isDistrictModalOpen && (
        <div className="fixed inset-0 bg-[#17231D]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#E1E9E4] flex items-center justify-between bg-[#F7FAF8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F7EF] text-[#00875A] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#17231D] text-sm">Hatay Teslimat Bölgesi</h3>
                  <p className="text-[10px] text-[#68766E]">8 aktif ilçe merkezine hızlı ve güvenli teslimat</p>
                </div>
              </div>
              <button
                onClick={() => setIsDistrictModalOpen(false)}
                className="p-1.5 text-[#68766E] hover:text-[#17231D] rounded-xl hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 text-xs divide-y divide-[#E1E9E4]">
              {HATAY_DISTRICTS.map((dist) => {
                const isCurrent = selectedDistrict === dist.id;
                return (
                  <button
                    key={dist.id}
                    onClick={() => {
                      setSelectedDistrict(dist.id);
                      setIsDistrictModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isCurrent
                        ? 'bg-[#E8F7EF] border-2 border-[#00875A] shadow-xs'
                        : 'hover:bg-[#F7FAF8] border border-[#E1E9E4]'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#17231D]">{dist.name}</span>
                        {isCurrent && (
                          <span className="bg-[#00875A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            Seçili Bölge
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#68766E] truncate">
                        Mahalleler: {dist.neighborhoods.join(', ')}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[#68766E] font-medium pt-1">
                        <span className="flex items-center gap-1 text-[#00875A] font-bold">
                          {dist.estimatedDeliveryMin} dk
                        </span>
                        <span>·</span>
                        <span>Min: {dist.minBasket} ₺</span>
                        <span>·</span>
                        <span>{dist.deliveryFee === 0 ? 'Ücretsiz Kurye' : `${dist.deliveryFee} ₺ Kurye`}</span>
                      </div>
                    </div>

                    <div className="shrink-0 self-center">
                      {isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-[#00875A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-[#E1E9E4] bg-[#F7FAF8] flex items-center justify-between text-[11px] text-[#68766E]">
              <span>Hatay genelinde 3 Dark Store depomuz aktiftir.</span>
              <button
                onClick={() => setIsDistrictModalOpen(false)}
                className="px-4 py-2 bg-[#00875A] text-white font-bold rounded-xl hover:bg-[#006D48]"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADDRESS & PASSWORD SETTINGS MODAL */}
      {/* ========================================================================= */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-[#17231D]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#E1E9E4] flex items-center justify-between bg-[#F7FAF8]">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#00875A]" />
                <h3 className="font-bold text-[#17231D] text-sm">Hesap &amp; Adres Yönetimi</h3>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1.5 text-[#68766E] hover:text-[#17231D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-[#17231D] mb-2">Kayıtlı Adresler</h4>
                <div className="space-y-2">
                  {currentUser?.addresses?.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => setDefaultAddress(addr.id)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-start justify-between ${
                        addr.isDefault ? 'bg-[#E8F7EF] border-[#00875A]' : 'bg-white border-[#E1E9E4]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#17231D]">{addr.title}</span>
                          {addr.isDefault && (
                            <span className="bg-[#00875A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#68766E] mt-0.5">
                          {addr.addressLine}, {addr.neighborhood}, {addr.district} / {addr.city}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUserAddress(addr.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password update */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPass.length < 6) {
                    setAccountFeedback({ msg: 'Yeni şifre en az 6 karakter olmalıdır.', isError: true });
                    return;
                  }
                  if (newPass !== confirmPass) {
                    setAccountFeedback({ msg: 'Şifreler eşleşmiyor.', isError: true });
                    return;
                  }
                  const res = updateUserPassword(currentUser.id, newPass);
                  setAccountFeedback({ msg: res.message, isError: !res.success });
                  setNewPass('');
                  setConfirmPass('');
                }}
                className="space-y-2.5 pt-3 border-t border-[#E1E9E4]"
              >
                <h4 className="font-bold text-[#17231D]">Güvenlik &amp; Şifre Değiştir</h4>
                {accountFeedback && (
                  <p className={`text-[11px] font-bold ${accountFeedback.isError ? 'text-red-600' : 'text-[#00875A]'}`}>
                    {accountFeedback.msg}
                  </p>
                )}
                <div>
                  <label className="text-[10px] text-[#68766E] block mb-1">Yeni Şifre</label>
                  <input
                    type="password"
                    placeholder="En az 6 karakter"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#68766E] block mb-1">Yeni Şifre Tekrar</label>
                  <input
                    type="password"
                    placeholder="Şifreyi tekrar girin"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-[#F7FAF8] border border-[#E1E9E4] rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00875A] text-white font-bold rounded-xl text-xs hover:bg-[#006D48]"
                >
                  Şifreyi Güncelle
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PREMIUM 3D ANIMATED BOTTOM NAVIGATION BAR */}
      {/* ========================================================================= */}
      <BottomNav3D
        activeScreen={activeScreen}
        onNavigate={navigateTo}
        cartItemCount={cartItemCount}
      />

      {/* Price Alert Modal */}
      <PriceAlertModal
        product={priceAlertTargetProduct}
        isOpen={isPriceAlertModalOpen}
        onClose={() => setIsPriceAlertModalOpen(false)}
      />
    </div>
  );
};

export const CustomerApp: React.FC = () => {
  return (
    <Cart3DProvider>
      <CustomerAppInner />
    </Cart3DProvider>
  );
};

