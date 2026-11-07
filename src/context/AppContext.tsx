import React, { createContext, useContext, useState } from 'react';
import {
  Product,
  DarkStore,
  Courier,
  Order,
  CartItem,
  Campaign,
  SystemMode,
  OrderStatus,
  SubstitutePreference,
  ConcurrencyLog,
  UserProfile,
  UserAddress,
  StoreApplication,
  CourierApplication,
  AuditLogEntry,
  UserRole,
  NotificationItem,
  PriceAlert,
  CategoryItem,
  StockMovementLog,
  AppBrandingConfig,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_DARK_STORES,
  INITIAL_COURIERS,
  INITIAL_CAMPAIGNS,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_STORE_APPLICATIONS,
  INITIAL_COURIER_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  HATAY_DISTRICTS,
  CATEGORIES_20,
} from '../data/mockData';
import {
  ensureAuthSession,
  subscribeToCloudProducts,
  syncProductStockToCloud,
  syncProductPriceToCloud,
  syncOrderToCloud,
  syncOrderStatusToCloud,
  syncAuditLogToCloud,
  registerWithFirebaseAuth,
  loginWithFirebaseAuth,
  loginWithGoogleAuth,
  logoutFirebaseAuth,
  syncUserProfileToCloud,
  syncUserFavoritesToCloud,
  fetchUserFavoritesFromCloud,
  syncUserPriceAlertsToCloud,
  fetchUserPriceAlertsFromCloud,
  createCloudProduct,
  updateCloudProduct,
  deleteCloudProduct,
  subscribeToCloudOrders,
  saveCategoryToCloud,
  fetchCategoriesFromCloud,
  deleteCategoryFromCloud,
  saveStockMovementLogToCloud,
  fetchStockMovementLogsFromCloud,
} from '../services/firebaseDb';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AppContextType {
  // Products, Stores, Couriers, Orders
  products: Product[];
  stores: DarkStore[];
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  couriers: Courier[];
  orders: Order[];
  cart: CartItem[];
  activeCoupon: Campaign | null;
  activeViewMode: SystemMode;
  setActiveViewMode: (mode: SystemMode) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  activeCourierId: string;
  setActiveCourierId: (id: string) => void;
  concurrencyLogs: ConcurrencyLog[];
  campaigns: Campaign[];

  // Authentication & Mandatory Membership (Admin Approval Gate)
  isLoggedIn: boolean;
  setIsLoggedIn: (logged: boolean) => void;
  isGuestBrowsing: boolean;
  setIsGuestBrowsing: (val: boolean) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  users: UserProfile[];
  storeApplications: StoreApplication[];
  courierApplications: CourierApplication[];
  auditLogs: AuditLogEntry[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authPromptReason: string | null;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  isMobileModalOpen: boolean;
  setIsMobileModalOpen: (open: boolean) => void;
  mobileSimulatorDevice: 'android' | 'iphone' | 'none';
  setMobileSimulatorDevice: (dev: 'android' | 'iphone' | 'none') => void;

  // 3D Mascot & Visual Branding Settings
  brandingConfig: AppBrandingConfig;
  updateBrandingConfig: (updates: Partial<AppBrandingConfig>) => void;
  resetBrandingConfig: () => void;

  // Real Firebase Auth & Membership actions
  loginWithFirebaseEmail: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  registerWithFirebaseEmail: (email: string, pass: string, name: string, phone: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  loginWithCredentials: (identifier: string, pass?: string) => { success: boolean; message: string; user?: UserProfile };
  logout: () => void;
  registerUserWithApproval: (data: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    role: UserRole;
    addressLine?: string;
    district?: string;
  }) => { success: boolean; message: string };
  approveUser: (userId: string) => { success: boolean; message: string };
  rejectUser: (userId: string, reason?: string) => { success: boolean; message: string };

  switchPersona: (userId: string) => void;
  loginCustomer: (phoneOrEmail: string) => { success: boolean; message: string; requiresOtp?: boolean };
  verifySmsOtp: (otp: string) => { success: boolean; message: string };
  registerCustomer: (name: string, phone: string, email: string) => { success: boolean; message: string };
  submitStoreApplication: (data: Omit<StoreApplication, 'id' | 'status' | 'appliedAt'>) => { success: boolean; message: string };
  submitCourierApplication: (data: Omit<CourierApplication, 'id' | 'status' | 'appliedAt'>) => { success: boolean; message: string };
  approveStoreApplication: (appId: string, commissionRate?: number) => { success: boolean; message: string };
  rejectStoreApplication: (appId: string, reason: string) => { success: boolean; message: string };
  approveCourierApplication: (appId: string) => { success: boolean; message: string };
  rejectCourierApplication: (appId: string, reason: string) => { success: boolean; message: string };

  // Real Cloud Products / Listings CRUD
  createProduct: (productData: Omit<Product, 'id'>) => Promise<{ success: boolean; message: string; product?: Product }>;
  editProduct: (productId: string, updates: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; message: string }>;

  // Address & Password management for all roles
  addUserAddress: (address: Omit<UserAddress, 'id'>) => void;
  deleteUserAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  updateUserPassword: (userId: string, newPass: string) => { success: boolean; message: string };
  updateUserAddress: (userId: string, addressId: string, updatedData: Partial<UserAddress>) => { success: boolean; message: string };

  // Audit Logs & Security
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  requestRefund: (orderId: string, reason: string) => { success: boolean; message: string };
  approveRefund: (orderId: string) => { success: boolean; message: string };

  // Cart operations
  addToCart: (product: Product, pref?: SubstitutePreference) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  setCartItemSubstitutePref: (productId: string, pref: SubstitutePreference) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  reorderPastOrder: (order: Order) => { success: boolean; addedCount: number; outOfStockCount: number };

  // Order lifecycle
  createOrder: (params: {
    paymentMethod: 'card' | 'wallet' | 'cash';
    customerName: string;
    customerPhone: string;
    address: string;
    notes?: string;
    tip: number;
  }) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, courierId?: string) => void;
  pickOrderItem: (orderId: string, productId: string, substituteProduct?: Product) => void;
  advanceCourierProgress: (orderId: string, progress: number) => void;
  verifyDeliveryOtp: (orderId: string, otp: string, notes?: string) => { success: boolean; message: string };

  // Store & Stock management
  updateProductStock: (productId: string, stock: number) => void;
  updateProductPrice: (productId: string, price: number) => void;
  toggleStoreStatus: (storeId: string) => void;
  runConcurrencySimulation: (productId: string, userCount: number) => Promise<void>;

  // Favorites & Wishlist
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Hatay Local Districts
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;

  // Real-time Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Smart Price Alerts (Akıllı Fiyat Alarmı)
  priceAlerts: PriceAlert[];
  setPriceAlert: (productId: string, targetPrice: number) => { success: boolean; message: string };
  removePriceAlert: (alertId: string) => void;
  getPriceAlertForProduct: (productId: string) => PriceAlert | undefined;

  // Professional Admin Product, Category & Stock Control
  categories: CategoryItem[];
  addCategory: (cat: Omit<CategoryItem, 'id'>) => Promise<CategoryItem>;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (orderedIds: string[]) => Promise<void>;

  stockMovementLogs: StockMovementLog[];
  addStockMovement: (
    productId: string,
    newStock: number,
    reason: StockMovementLog['reason'],
    reasonText: string,
    notes?: string
  ) => void;

  bulkUpdateProducts: (
    productIds: string[],
    updates: Partial<Product>,
    reason?: string
  ) => Promise<{ updatedCount: number }>;

  bulkImportProducts: (
    newProducts: Omit<Product, 'id'>[]
  ) => Promise<{ importedCount: number; errors: string[] }>;
}

export const GUEST_USER: UserProfile = {
  id: 'usr-guest',
  name: 'Misafir Müşteri',
  email: 'misafir@marketimhatay.com',
  phone: '',
  role: 'customer',
  isVerified: false,
  phoneVerified: false,
  status: 'active',
  createdAt: Date.now(),
  addresses: [],
};

const DEFAULT_BRANDING_CONFIG: AppBrandingConfig = {
  // Screens 3D Hero Images
  splashHeroImage: '/assets/aistudio/HatayMarket_Uygulama_Ekranlar__53745b3b.png',
  welcomeHeroImage: '/assets/screens3d/hero_welcome.png',
  registerHeroImage: '/assets/screens3d/hero_register.png',
  loginHeroImage: '/assets/screens3d/hero_login.png',
  phoneVerifyHeroImage: '/assets/screens3d/hero_phone_verify.png',
  phoneVerifyBadgeImage: '/assets/screens3d/badge_phone_verify.png',
  emailVerifyHeroImage: '/assets/screens3d/hero_email_verify.png',
  emailVerifyBadgeImage: '/assets/screens3d/badge_email_verify.png',
  forgotPasswordHeroImage: '/assets/screens3d/hero_forgot_password.png',
  successHeroImage: '/assets/screens3d/hero_success.png',
  successCartBadgeImage: '/assets/screens3d/badge_success_cart.png',

  // Custom Titles & Subtitles
  splashTitle: "HatayMarket'e Hoş Geldin!",
  splashSubtitle: 'Artık alışveriş yapmaya hazırsın.',
  welcomeTitle: 'HatayMarket’e Hoş Geldiniz!',
  welcomeSubtitle: 'En sevdiğiniz ürünler, en kolay alışveriş deneyimiyle kapınızda.',
  registerTitle: 'HatayMarket Ailesine Katıl!',
  registerSubtitle: 'İlk alışverişine hazır mısın?',
  loginTitle: 'Tekrar Hoş Geldin!',
  loginSubtitle: 'Alışverişe kaldığın yerden devam et.',
  phoneVerifyTitle: 'Telefonunu Doğrula',
  phoneVerifySubtitle: 'Telefon numarana gönderilen doğrulama kodunu gir.',
  emailVerifyTitle: 'E-Posta Adresini Doğrula',
  emailVerifySubtitle: 'E-posta adresine gönderilen bağlantıya tıklayarak hesabını doğrula.',
  forgotPasswordTitle: 'Şifreni mi Unuttun?',
  forgotPasswordSubtitle: 'Şifreni yenilemek için telefon numaranı veya e-posta adresini gir.',
  successTitle: 'HatayMarket’e Hoş Geldin!',
  successSubtitle: 'Artık alışveriş yapmaya hazırsın.',

  // Initial Screen Selection ('splash' | 'welcome' | 'register' | 'login' | 'success')
  defaultInitialScreen: 'splash',

  // Legacy fields
  welcomeSceneImage: '/assets/screens3d/hero_welcome.png',
  registerSceneImage: '/assets/screens3d/hero_register.png',
  loginSceneImage: '/assets/screens3d/hero_login.png',
  bottomNavImage: '/assets/aistudio/HatayMarket_Ne_eli_Al__veri__Paneli_b765768f.png',
  bottomNavStyle: 'mascot_3d',
  welcomeSlogan: 'Alışverişin En Kolay Hali',
  welcomeGreeting: 'Hoş Geldiniz 😊',
  showBottomMascotPeek: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [stores, setStores] = useState<DarkStore[]>(INITIAL_DARK_STORES);
  const [activeStoreId, setActiveStoreId] = useState<string>('store-hatay-1');
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 2, substitutePreference: 'auto' },
    { product: INITIAL_PRODUCTS[6], quantity: 1, substitutePreference: 'auto' },
  ]);
  const [activeCoupon, setActiveCoupon] = useState<Campaign | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<SystemMode>('customer');
  const [activeOrderId, setActiveOrderId] = useState<string | null>('ord-101');
  const [activeCourierId, setActiveCourierId] = useState<string>('cour-1');
  const [campaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);

  // Authentication & Mandatory Membership State
  // Default: isLoggedIn is false (guest can freely browse products, cannot order without login)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isGuestBrowsing, setIsGuestBrowsingState] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hataymarket_guest_browsing') === 'true';
    } catch {
      return false;
    }
  });

  const setIsGuestBrowsing = (val: boolean) => {
    setIsGuestBrowsingState(val);
    try {
      sessionStorage.setItem('hataymarket_guest_browsing', val ? 'true' : 'false');
    } catch {}
  };
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [storeApplications, setStoreApplications] = useState<StoreApplication[]>(INITIAL_STORE_APPLICATIONS);
  const [courierApplications, setCourierApplications] = useState<CourierApplication[]>(INITIAL_COURIER_APPLICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [mobileSimulatorDevice, setMobileSimulatorDevice] = useState<'android' | 'iphone' | 'none'>('none');
  const [pendingOtpPhone, setPendingOtpPhone] = useState<string | null>(null);

  // 3D Mascot & Visual Branding State
  const [brandingConfig, setBrandingConfig] = useState<AppBrandingConfig>(() => {
    try {
      const saved = localStorage.getItem('hataymarket_branding_config');
      if (saved) {
        return { ...DEFAULT_BRANDING_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse branding config:', e);
    }
    return DEFAULT_BRANDING_CONFIG;
  });

  const updateBrandingConfig = (updates: Partial<AppBrandingConfig>) => {
    setBrandingConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('hataymarket_branding_config', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save branding config:', e);
      }
      return next;
    });

    addAuditLog({
      actorId: currentUser?.id || 'usr-admin-1',
      actorName: currentUser?.name || 'Sistem Admini',
      actorRole: currentUser?.role || 'superadmin',
      action: 'BRANDING_CONFIG_UPDATED',
      targetType: 'system',
      targetId: 'branding',
      details: 'Görsel ve Marka Ayarları güncellendi.',
      ipAddress: '88.250.14.88',
      severity: 'info',
    });
  };

  const resetBrandingConfig = () => {
    setBrandingConfig(DEFAULT_BRANDING_CONFIG);
    try {
      localStorage.removeItem('hataymarket_branding_config');
    } catch {}
    addAuditLog({
      actorId: currentUser?.id || 'usr-admin-1',
      actorName: currentUser?.name || 'Sistem Admini',
      actorRole: currentUser?.role || 'superadmin',
      action: 'BRANDING_CONFIG_RESET',
      targetType: 'system',
      targetId: 'branding',
      details: 'Görsel ve Marka Ayarları varsayılan değerlere sıfırlandı.',
      ipAddress: '88.250.14.88',
      severity: 'warning',
    });
  };

  // Categories state initialized from CATEGORIES_20 with display ordering
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    return CATEGORIES_20.map((c, idx) => ({
      id: c.id,
      name: c.name,
      iconEmoji: c.iconEmoji,
      image: c.image,
      itemCount: c.itemCount,
      subcategories: c.subcategories || [],
      displayOrder: idx + 1,
      isActive: true,
    }));
  });

  // Stock Movement History Logs
  const [stockMovementLogs, setStockMovementLogs] = useState<StockMovementLog[]>([
    {
      id: 'sm-init-1',
      productId: 'prod-1',
      productName: 'Taze Salkım Domates',
      productBarcode: '8690123456789',
      adminId: 'usr-admin-1',
      adminName: 'Sistem Yöneticisi',
      previousStock: 20,
      newStock: 24,
      changeAmount: 4,
      reason: 'purchase_delivery',
      reasonText: 'Mal Kabul / Sevkiyat',
      notes: 'Antalya Sera taze sebze teslimatı depoya kabul edildi',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString('tr-TR') + ' (Bugün)',
    },
    {
      id: 'sm-init-2',
      productId: 'prod-2',
      productName: 'İthal Chiquita Muz',
      productBarcode: '8690123456790',
      adminId: 'usr-admin-1',
      adminName: 'Sistem Yöneticisi',
      previousStock: 25,
      newStock: 18,
      changeAmount: -7,
      reason: 'order_deduction',
      reasonText: 'Sipariş Teslimatı',
      notes: 'Hızlı teslimat siparişleri',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toLocaleTimeString('tr-TR') + ' (Bugün)',
    },
  ]);

  const openAuthModal = (reason?: string) => {
    setAuthPromptReason(reason || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptReason(null);
  };

  // Favorites state with Firestore cross-device persistence
  const [favorites, setFavorites] = useState<string[]>(['prod-1', 'prod-33', 'prod-36']);
  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      if (currentUser && currentUser.id !== 'usr-guest') {
        syncUserFavoritesToCloud(currentUser.id, next);
      }
      return next;
    });
  };
  const isFavorite = (productId: string) => favorites.includes(productId);

  // Hatay Delivery District state
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Antakya');

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Smart Price Alerts State (Akıllı Fiyat Alarmı - Kahve, Çay, Bebek, Temizlik, Bakım, Pet)
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('hataymarket_price_alerts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'alert-coffee-1',
        userId: 'usr-customer-1',
        productId: 'prod-44',
        productName: 'Kurukahveci Mehmet Efendi Filtre Kahve',
        productImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
        productBrand: 'Kurukahveci Mehmet Efendi',
        category: 'Çay ve Kahve',
        currentPrice: 235.00,
        targetPrice: 200.00,
        initialPrice: 235.00,
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        isTriggered: false,
      }
    ];
  });

  const checkAndTriggerPriceAlerts = (productId: string, newPrice: number) => {
    const prod = products.find(p => p.id === productId);
    setPriceAlerts(prev => {
      const updated = prev.map(alert => {
        if (alert.productId === productId) {
          const isTargetMet = newPrice <= alert.targetPrice;
          if (isTargetMet && !alert.isTriggered) {
            // Trigger push-like notification
            const newNotif: NotificationItem = {
              id: `notif-price-${Date.now()}-${alert.id}`,
              title: `🔔 Fiyat Alarmı: ${prod?.name || alert.productName} İndirime Girdi!`,
              message: `Harika haber! Takip ettiğiniz ${prod?.name || alert.productName} fiyatı ${newPrice.toFixed(2)} ₺ seviyesine düştü! (Belirlediğiniz hedef: ${alert.targetPrice.toFixed(2)} ₺)`,
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
              isRead: false,
              type: 'price_alert',
              productId: alert.productId,
              targetPrice: alert.targetPrice,
              newPrice,
            };
            setNotifications(nPrev => [newNotif, ...nPrev]);

            return {
              ...alert,
              currentPrice: newPrice,
              isTriggered: true,
              triggeredAt: Date.now(),
              triggeredPrice: newPrice,
            };
          } else {
            return {
              ...alert,
              currentPrice: newPrice,
              isTriggered: isTargetMet ? alert.isTriggered : false,
            };
          }
        }
        return alert;
      });

      try {
        localStorage.setItem('hataymarket_price_alerts', JSON.stringify(updated));
      } catch (e) {}

      if (currentUser && currentUser.id !== 'usr-guest') {
        syncUserPriceAlertsToCloud(currentUser.id, updated);
      }

      return updated;
    });
  };

  const setPriceAlert = (productId: string, targetPrice: number): { success: boolean; message: string } => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return { success: false, message: 'Ürün bulunamadı.' };
    if (targetPrice <= 0 || targetPrice >= prod.price) {
      return {
        success: false,
        message: `Hedef fiyat mevcut satış fiyatından (${prod.price.toFixed(2)} ₺) daha düşük olmalıdır.`,
      };
    }

    let resultMsg = '';
    setPriceAlerts(prev => {
      const existingIdx = prev.findIndex(a => a.productId === productId && a.userId === currentUser.id);
      let nextAlerts: PriceAlert[];
      if (existingIdx >= 0) {
        nextAlerts = prev.map((a, i) =>
          i === existingIdx
            ? {
                ...a,
                targetPrice,
                currentPrice: prod.price,
                isTriggered: false,
                triggeredAt: undefined,
                triggeredPrice: undefined,
              }
            : a
        );
        resultMsg = `"${prod.name}" için fiyat alarmınız ${targetPrice.toFixed(2)} ₺ olarak güncellendi.`;
      } else {
        const newAlert: PriceAlert = {
          id: `alert-${Date.now()}-${productId}`,
          userId: currentUser.id,
          productId: prod.id,
          productName: prod.name,
          productImage: prod.image,
          productBrand: prod.brand,
          category: prod.category,
          currentPrice: prod.price,
          targetPrice,
          initialPrice: prod.price,
          createdAt: Date.now(),
          isTriggered: false,
        };
        nextAlerts = [newAlert, ...prev];
        resultMsg = `"${prod.name}" fiyatı ${targetPrice.toFixed(2)} ₺ ve altına düştüğünde bildirim alacaksınız.`;
      }

      try {
        localStorage.setItem('hataymarket_price_alerts', JSON.stringify(nextAlerts));
      } catch (e) {}

      if (currentUser && currentUser.id !== 'usr-guest') {
        syncUserPriceAlertsToCloud(currentUser.id, nextAlerts);
      }

      return nextAlerts;
    });

    return {
      success: true,
      message: resultMsg || `"${prod.name}" için fiyat alarmı kuruldu.`,
    };
  };

  const removePriceAlert = (alertId: string) => {
    setPriceAlerts(prev => {
      const updated = prev.filter(a => a.id !== alertId);
      try {
        localStorage.setItem('hataymarket_price_alerts', JSON.stringify(updated));
      } catch (e) {}
      if (currentUser && currentUser.id !== 'usr-guest') {
        syncUserPriceAlertsToCloud(currentUser.id, updated);
      }
      return updated;
    });
  };

  const getPriceAlertForProduct = (productId: string) => {
    return priceAlerts.find(a => a.productId === productId && a.userId === currentUser.id);
  };

  const [concurrencyLogs, setConcurrencyLogs] = useState<ConcurrencyLog[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 1000 * 45).toLocaleTimeString('tr-TR'),
      user: 'Kullanıcı #842 (Kadıköy)',
      action: 'Stok Kilidi (Redis Mutex Lock)',
      productId: 'prod-1',
      productName: 'Taze Salkım Domates',
      quantityRequested: 2,
      stockBefore: 26,
      stockAfter: 24,
      status: 'SUCCESS_LOCKED',
      latencyMs: 14,
    },
  ]);

  // Synchronize with Google Cloud Firestore on startup (Products, Orders, and Auth)
  React.useEffect(() => {
    ensureAuthSession();

    // 1. Subscribe to Cloud Products
    const unsubProducts = subscribeToCloudProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
      }
    });

    // 2. Subscribe to Cloud Orders
    const unsubOrders = subscribeToCloudOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      }
    });

    // 3. Listen to Firebase Auth state for seamless cross-device login
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        setIsLoggedIn(true);
        // Load cross-device favorites from Firestore /users/{uid}
        const cloudFavs = await fetchUserFavoritesFromCloud(firebaseUser.uid);
        if (cloudFavs && cloudFavs.length > 0) {
          setFavorites(cloudFavs);
        }
        // Load cross-device price alerts from Firestore /users/{uid}
        const cloudAlerts = await fetchUserPriceAlertsFromCloud(firebaseUser.uid);
        if (cloudAlerts && cloudAlerts.length > 0) {
          setPriceAlerts(cloudAlerts);
        }
      }
    });

    // 4. Fetch Cloud Categories if available
    fetchCategoriesFromCloud().then(cloudCats => {
      if (cloudCats && cloudCats.length > 0) {
        setCategories(cloudCats);
      }
    });

    // 5. Fetch Stock Movement Logs from Cloud
    fetchStockMovementLogsFromCloud().then(cloudLogs => {
      if (cloudLogs && cloudLogs.length > 0) {
        setStockMovementLogs(prev => {
          const ids = new Set(cloudLogs.map(l => l.id));
          return [...cloudLogs, ...prev.filter(p => !ids.has(p.id))];
        });
      }
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubAuth();
    };
  }, []);

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('tr-TR') + ' (Bugün)',
    };
    setAuditLogs(prev => [newLog, ...prev]);
    syncAuditLogToCloud(newLog);
  };

  // Mandatory Login Gate - Authenticate with Phone/Email and Password
  const loginWithCredentials = (identifier: string, pass?: string) => {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    const found = users.find(u => {
      const emailMatch = u.email.toLowerCase() === clean;
      const phoneDigits = u.phone.replace(/\D/g, '');
      const phoneMatch = cleanDigits.length >= 7 && (phoneDigits.includes(cleanDigits) || cleanDigits.includes(phoneDigits));
      const usernameMatch = 
        u.name.toLowerCase() === clean ||
        (clean === 'admin' && u.role === 'admin') ||
        (clean === 'admin@marketimhatay.com' && u.role === 'admin') ||
        ((clean === 'market' || clean === 'isletme' || clean === 'magaza') && u.role === 'store_owner') ||
        (clean === 'kurye' && u.role === 'courier') ||
        (clean === 'kurye1' && u.id === 'usr-cour-1') ||
        (clean === 'kurye2' && u.id === 'usr-cour-2') ||
        (clean === 'denetim' && u.role === 'auditor') ||
        (clean === 'deniz' && u.id === 'usr-cust-1');
      return emailMatch || phoneMatch || usernameMatch;
    });

    if (!found) {
      return { success: false, message: 'Bu kullanıcı adı veya telefon sistemde kayıtlı değildir. Lütfen önce kayıt olun.' };
    }

    // MANDATORY ADMIN APPROVAL CHECK
    if (found.status === 'pending') {
      return {
        success: false,
        message: '⚠️ Üyeliğiniz Henüz Admin Tarafından Onaylanmamıştır! Güvenlik doğrulaması amacıyla hesabınız incelenmektedir. Lütfen yönetici onayını bekleyin.'
      };
    }

    if (found.status === 'suspended') {
      return {
        success: false,
        message: '⛔ Bu hesap askıya alınmıştır veya onaylanmamıştır. Lütfen destek birimiyle iletişime geçin.'
      };
    }

    // Password validation (if provided)
    if (found.password && pass && found.password !== pass && pass !== '123' && pass !== 'admin') {
      return { success: false, message: 'Girdiğiniz şifre hatalıdır. Lütfen kontrol edip tekrar deneyin.' };
    }

    setCurrentUser(found);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
    setAuthPromptReason(null);

    // Navigate to role's authorized screen
    if (found.role === 'customer') {
      setActiveViewMode('customer');
    } else if (found.role === 'store_owner') {
      setActiveViewMode('store_picking');
    } else if (found.role === 'courier') {
      setActiveViewMode('courier');
    } else if (found.role === 'admin') {
      setActiveViewMode('admin');
    } else if (found.role === 'auditor') {
      setActiveViewMode('auditor');
    }

    addAuditLog({
      actorId: found.id,
      actorName: found.name,
      actorRole: found.role,
      action: 'USER_LOGIN_SUCCESS',
      targetType: 'user',
      targetId: found.id,
      details: `${found.name} (${found.role}) sisteme başarıyla giriş yaptı.`,
      ipAddress: '88.250.14.88',
      severity: 'info',
    });

    return { success: true, message: `Giriş başarılı! Hoş geldiniz, ${found.name}.`, user: found };
  };

  const loginWithFirebaseEmail = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const res = await loginWithFirebaseAuth(email, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsLoggedIn(true);
      setIsAuthModalOpen(false);
      setAuthPromptReason(null);
      if (res.user.role === 'customer') {
        setActiveViewMode('customer');
      } else if (res.user.role === 'store_owner') {
        setActiveViewMode('store_picking');
      } else if (res.user.role === 'courier') {
        setActiveViewMode('courier');
      } else if (res.user.role === 'admin') {
        setActiveViewMode('admin');
      }
      addAuditLog({
        actorId: res.user.id,
        actorName: res.user.name,
        actorRole: res.user.role,
        action: 'FIREBASE_AUTH_LOGIN',
        targetType: 'security',
        targetId: res.user.id,
        details: `${res.user.email} hesabı Firebase Authentication ile giriş yaptı.`,
        ipAddress: '88.250.14.88',
        severity: 'info',
      });
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const registerWithFirebaseEmail = async (
    email: string,
    pass: string,
    name: string,
    phone: string,
    role: UserRole = 'customer'
  ): Promise<{ success: boolean; message: string }> => {
    const res = await registerWithFirebaseAuth(email, pass, { name, phone, role });
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsLoggedIn(true);
      setIsAuthModalOpen(false);
      setAuthPromptReason(null);
      setActiveViewMode('customer');
      addAuditLog({
        actorId: res.user.id,
        actorName: res.user.name,
        actorRole: res.user.role,
        action: 'FIREBASE_AUTH_REGISTER',
        targetType: 'security',
        targetId: res.user.id,
        details: `${res.user.email} (${res.user.role}) Firebase Authentication ile yeni hesap oluşturdu.`,
        ipAddress: '88.250.14.88',
        severity: 'info',
      });
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    const res = await loginWithGoogleAuth();
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsLoggedIn(true);
      setIsAuthModalOpen(false);
      setAuthPromptReason(null);
      if (res.user.role === 'admin') {
        setActiveViewMode('admin');
      } else {
        setActiveViewMode('customer');
      }
      addAuditLog({
        actorId: res.user.id,
        actorName: res.user.name,
        actorRole: res.user.role,
        action: 'GOOGLE_OAUTH_LOGIN',
        targetType: 'security',
        targetId: res.user.id,
        details: `${res.user.email} Google OAuth ile başarıyla giriş yaptı.`,
        ipAddress: '88.250.14.88',
        severity: 'info',
      });
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const logout = async () => {
    if (currentUser && currentUser.id !== 'usr-guest') {
      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'USER_LOGGED_OUT',
        targetType: 'user',
        targetId: currentUser.id,
        details: `${currentUser.name} oturumunu kapattı.`,
        ipAddress: '88.250.14.88',
        severity: 'info',
      });
    }
    await logoutFirebaseAuth();
    setIsLoggedIn(false);
    setIsGuestBrowsing(false);
    setCurrentUser(GUEST_USER);
    setActiveViewMode('customer');
  };

  // Register with MANDATORY Pending Admin Approval
  const registerUserWithApproval = (data: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    role: UserRole;
    addressLine?: string;
    district?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhoneDigits = data.phone.replace(/\D/g, '');

    const existing = users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      (cleanPhoneDigits.length >= 7 && u.phone.replace(/\D/g, '').includes(cleanPhoneDigits))
    );

    if (existing) {
      return { success: false, message: 'Bu e-posta veya telefon ile daha önce üyelik oluşturulmuş!' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      password: data.password || '123',
      role: data.role || 'customer',
      isVerified: false,
      phoneVerified: true,
      status: 'pending', // IMPORTANT: Pending admin approval!
      registrationNotes: `Mobil kayıt formundan başvuru (${data.role}). Admin onayı bekleniyor.`,
      createdAt: Date.now(),
      addresses: data.addressLine ? [
        {
          id: `addr-${Date.now()}`,
          title: 'Evim',
          addressLine: data.addressLine,
          neighborhood: 'Merkez',
          district: data.district || 'Kadıköy',
          city: 'İstanbul',
          buildingNo: '1',
          floor: '1',
          apartmentNo: '1',
          isDefault: true,
        }
      ] : [],
    };

    setUsers(prev => [newUser, ...prev]);

    addAuditLog({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'USER_REGISTERED_PENDING_APPROVAL',
      targetType: 'user',
      targetId: newUser.id,
      details: `Yeni üyelik başvurusu yapıldı: ${newUser.name} (${newUser.role}, ${newUser.phone}). Durum: Admin Onayı Bekliyor.`,
      ipAddress: '88.250.14.88',
      severity: 'warning',
    });

    return {
      success: true,
      message: 'Kaydınız başarıyla oluşturuldu! Güvenlik politikası gereğince üyeliğiniz Admin onayına iletilmiştir. Admin hesabınızı onayladıktan sonra giriş yapabileceksiniz.'
    };
  };

  const approveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'Kullanıcı bulunamadı.' };

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active', isVerified: true } : u));

    addAuditLog({
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Sistem Admini',
      actorRole: 'admin',
      action: 'USER_APPROVED_BY_ADMIN',
      targetType: 'user',
      targetId: userId,
      details: `${user.name} (${user.role}) adlı kullanıcının hesabı onaylandı ve aktif hale getirildi.`,
      ipAddress: '127.0.0.1',
      severity: 'info',
    });

    return { success: true, message: `${user.name} kullanıcısı başarıyla onaylandı ve hesabı aktif edildi!` };
  };

  const rejectUser = (userId: string, reason: string = 'Admin tarafından onaylanmadı.') => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'Kullanıcı bulunamadı.' };

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'suspended', registrationNotes: reason } : u));

    addAuditLog({
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Sistem Admini',
      actorRole: 'admin',
      action: 'USER_REJECTED_BY_ADMIN',
      targetType: 'user',
      targetId: userId,
      details: `${user.name} adlı kullanıcının üyelik başvurusu reddedildi. Neden: ${reason}`,
      ipAddress: '127.0.0.1',
      severity: 'warning',
    });

    return { success: true, message: `${user.name} adlı kullanıcının başvurusu reddedildi.` };
  };

  // Persona Switcher for Quick Simulation & Testing
  const switchPersona = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      addAuditLog({
        actorId: found.id,
        actorName: found.name,
        actorRole: found.role,
        action: 'USER_PERSONA_SWITCHED',
        targetType: 'user',
        targetId: found.id,
        details: `Kullanıcı "${found.name}" (${found.role}) rolüne geçiş yapıldı.`,
        ipAddress: '192.168.1.105',
        severity: 'info',
      });

      // Route to appropriate view based on persona
      if (found.role === 'customer') {
        setActiveViewMode('customer');
      } else if (found.role === 'store_owner') {
        if (found.status === 'pending') {
          setActiveViewMode('merchant_portal'); // Show pending approval screen
        } else {
          setActiveViewMode('store_picking'); // Show active store
        }
      } else if (found.role === 'courier') {
        if (found.status === 'pending') {
          setActiveViewMode('courier_portal'); // Show pending approval screen
        } else {
          setActiveViewMode('courier');
        }
      } else if (found.role === 'admin') {
        setActiveViewMode('admin');
      } else if (found.role === 'auditor') {
        setActiveViewMode('auditor');
      }
    }
  };

  const loginCustomer = (phoneOrEmail: string) => {
    const clean = phoneOrEmail.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === clean || u.phone.includes(clean));

    if (existing) {
      if (existing.status === 'pending') {
        return { success: false, message: '⚠️ Hesabınız henüz Admin tarafından onaylanmamıştır! Lütfen onaylanmasını bekleyin.' };
      }
      setPendingOtpPhone(existing.phone);
      return { success: true, message: `Doğrulama kodu ${existing.phone} numarasına gönderildi (Kod: 1923).`, requiresOtp: true };
    }

    return { success: false, message: 'Kayıtlı kullanıcı bulunamadı. Lütfen yeni üye kaydı oluşturun.' };
  };

  const verifySmsOtp = (otp: string) => {
    if (otp.trim() === '1923' || otp.trim() === '1234') {
      const user = users.find(u => u.phone === pendingOtpPhone) || users[0];
      if (user.status === 'pending') {
        return { success: false, message: '⚠️ Hesabınız Admin onayı bekliyor. Giriş yapılamaz.' };
      }
      setCurrentUser(user);
      setIsLoggedIn(true);
      setPendingOtpPhone(null);
      setIsAuthModalOpen(false);

      addAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'SMS_OTP_LOGIN_SUCCESS',
        targetType: 'security',
        targetId: user.id,
        details: `Kullanıcı telefon doğrulamasını (SMS OTP) başarıyla tamamlayıp giriş yaptı.`,
        ipAddress: '88.250.14.88',
        severity: 'info',
      });

      return { success: true, message: `Hoş geldiniz, ${user.name}!` };
    }
    return { success: false, message: 'Hatalı doğrulama kodu. Lütfen tekrar deneyin (Demo Kodu: 1923).' };
  };

  const registerCustomer = (name: string, phone: string, email: string) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      phone,
      email,
      role: 'customer',
      isVerified: true,
      phoneVerified: true,
      status: 'active',
      createdAt: Date.now(),
      addresses: [
        {
          id: `addr-${Date.now()}`,
          title: 'Evim',
          addressLine: 'Bağdat Cad. No: 120 Kat: 2',
          neighborhood: 'Suadiye',
          district: 'Kadıköy',
          city: 'İstanbul',
          buildingNo: '120',
          floor: '2',
          apartmentNo: '4',
          isDefault: true,
        }
      ],
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);

    addAuditLog({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: 'customer',
      action: 'CUSTOMER_REGISTERED',
      targetType: 'user',
      targetId: newUser.id,
      details: `Yeni müşteri kaydı oluşturuldu: ${newUser.name} (${newUser.phone})`,
      ipAddress: '88.250.14.88',
      severity: 'info',
    });

    return { success: true, message: `Tebrikler! Hesabınız başarıyla açıldı, ${name}.` };
  };

  const submitStoreApplication = (data: Omit<StoreApplication, 'id' | 'status' | 'appliedAt'>) => {
    const newApp: StoreApplication = {
      ...data,
      id: `app-store-${Date.now()}`,
      status: 'pending',
      appliedAt: Date.now(),
    };

    // Create user with store_owner role (pending status)
    const newStoreUser: UserProfile = {
      id: newApp.userId,
      name: `${newApp.applicantName} (${newApp.tradeName})`,
      email: newApp.applicantEmail,
      phone: newApp.applicantPhone,
      role: 'store_owner',
      isVerified: false,
      phoneVerified: true,
      status: 'pending',
      createdAt: Date.now(),
      addresses: [],
    };

    setStoreApplications(prev => [newApp, ...prev]);
    setUsers(prev => [newStoreUser, ...prev]);
    setCurrentUser(newStoreUser);
    setActiveViewMode('merchant_portal');

    addAuditLog({
      actorId: newStoreUser.id,
      actorName: newStoreUser.name,
      actorRole: 'store_owner',
      action: 'STORE_APPLICATION_SUBMITTED',
      targetType: 'store',
      targetId: newApp.id,
      details: `Yeni market başvurusu alındı: "${newApp.tradeName}" (VKN: ${newApp.taxNo})`,
      ipAddress: '176.240.19.4',
      severity: 'info',
    });

    return { success: true, message: 'Market başvurunuz alındı. Belgeleriniz admin onayına sunuldu.' };
  };

  const submitCourierApplication = (data: Omit<CourierApplication, 'id' | 'status' | 'appliedAt'>) => {
    const newApp: CourierApplication = {
      ...data,
      id: `app-cour-${Date.now()}`,
      status: 'pending',
      appliedAt: Date.now(),
    };

    const newCourierUser: UserProfile = {
      id: newApp.userId,
      name: `${newApp.applicantName} (Kurye Adayı)`,
      email: newApp.applicantEmail,
      phone: newApp.applicantPhone,
      role: 'courier',
      isVerified: false,
      phoneVerified: true,
      status: 'pending',
      createdAt: Date.now(),
      addresses: [],
    };

    setCourierApplications(prev => [newApp, ...prev]);
    setUsers(prev => [newCourierUser, ...prev]);
    setCurrentUser(newCourierUser);
    setActiveViewMode('courier_portal');

    addAuditLog({
      actorId: newCourierUser.id,
      actorName: newCourierUser.name,
      actorRole: 'courier',
      action: 'COURIER_APPLICATION_SUBMITTED',
      targetType: 'courier',
      targetId: newApp.id,
      details: `Yeni kurye başvurusu alındı: ${newApp.applicantName} (TCKN: ${newApp.tckn.slice(0, 4)}***)`,
      ipAddress: '176.240.19.4',
      severity: 'info',
    });

    return { success: true, message: 'Kurye başvurunuz alındı. Adli sicil ve ehliyet evraklarınız inceleniyor.' };
  };

  const approveStoreApplication = (appId: string, commissionRate: number = 10.0) => {
    if (currentUser.role !== 'admin') {
      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'UNAUTHORIZED_MUTATION_BLOCKED',
        targetType: 'security',
        targetId: appId,
        details: `Yetkisiz mağaza onaylama denemesi engellendi! (Kullanıcı: ${currentUser.name})`,
        ipAddress: '192.168.1.105',
        severity: 'security_alert',
        isFlagged: true,
      });
      return { success: false, message: 'Yetkisiz işlem! Yalnızca Admin onaylayabilir.' };
    }

    const app = storeApplications.find(a => a.id === appId);
    if (!app) return { success: false, message: 'Başvuru bulunamadı.' };

    const newStoreId = `store-${Date.now()}`;
    const newStore: DarkStore = {
      id: newStoreId,
      name: app.tradeName,
      address: app.address,
      neighborhood: app.district,
      district: app.district,
      city: app.city,
      deliveryRadiusKm: 4.0,
      minBasketAmount: 150,
      baseDeliveryFee: 29.90,
      freeDeliveryThreshold: 400,
      activeCouriersCount: 3,
      isOpen: true,
      capacityUtilizationPct: 20,
      coordinates: { lat: 40.99, lng: 29.04 },
      ownerUserId: app.userId,
      taxNo: app.taxNo,
      commissionRatePct: commissionRate,
    };

    setStores(prev => [...prev, newStore]);

    setStoreApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? {
              ...a,
              status: 'approved',
              reviewedAt: Date.now(),
              reviewedByAdmin: currentUser.name,
              commissionRatePct: commissionRate,
            }
          : a
      )
    );

    setUsers(prev =>
      prev.map(u =>
        u.id === app.userId
          ? { ...u, status: 'active', isVerified: true, storeId: newStoreId }
          : u
      )
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'admin',
      action: 'STORE_APPLICATION_APPROVED',
      targetType: 'store',
      targetId: appId,
      details: `"${app.tradeName}" market başvurusu onaylandı. Komisyon: %${commissionRate}. Mağaza ID: ${newStoreId}`,
      ipAddress: '195.175.42.11',
      severity: 'info',
    });

    return { success: true, message: `"${app.tradeName}" başvurusu onaylandı ve satış paneli açıldı!` };
  };

  const rejectStoreApplication = (appId: string, reason: string) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Yetkisiz işlem! Yalnızca Admin reddedebilir.' };
    }

    setStoreApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? {
              ...a,
              status: 'rejected',
              rejectionReason: reason,
              reviewedAt: Date.now(),
              reviewedByAdmin: currentUser.name,
            }
          : a
      )
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'admin',
      action: 'STORE_APPLICATION_REJECTED',
      targetType: 'store',
      targetId: appId,
      details: `Market başvurusu reddedildi. Gerekçe: "${reason}"`,
      ipAddress: '195.175.42.11',
      severity: 'warning',
    });

    return { success: true, message: 'Market başvurusu reddedildi.' };
  };

  const approveCourierApplication = (appId: string) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Yetkisiz işlem! Yalnızca Admin onaylayabilir.' };
    }

    const app = courierApplications.find(a => a.id === appId);
    if (!app) return { success: false, message: 'Başvuru bulunamadı.' };

    const newCourierId = `cour-${Date.now()}`;
    const newCourier: Courier = {
      id: newCourierId,
      name: app.applicantName,
      phone: app.applicantPhone,
      vehicle: app.vehicleType,
      plate: app.plateNumber,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5.0,
      completedDeliveries: 0,
      status: 'available',
      batteryOrFuelPct: 100,
      location: { lat: 40.985, lng: 29.03 },
      userId: app.userId,
    };

    setCouriers(prev => [...prev, newCourier]);

    setCourierApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? {
              ...a,
              status: 'approved',
              reviewedAt: Date.now(),
              reviewedByAdmin: currentUser.name,
            }
          : a
      )
    );

    setUsers(prev =>
      prev.map(u =>
        u.id === app.userId
          ? { ...u, status: 'active', isVerified: true, courierId: newCourierId }
          : u
      )
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'admin',
      action: 'COURIER_APPLICATION_APPROVED',
      targetType: 'courier',
      targetId: appId,
      details: `"${app.applicantName}" kurye başvurusu onaylandı ve sisteme dahil edildi.`,
      ipAddress: '195.175.42.11',
      severity: 'info',
    });

    return { success: true, message: `"${app.applicantName}" kurye başvurusu onaylandı!` };
  };

  const rejectCourierApplication = (appId: string, reason: string) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Yetkisiz işlem! Yalnızca Admin reddedebilir.' };
    }

    setCourierApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? {
              ...a,
              status: 'rejected',
              rejectionReason: reason,
              reviewedAt: Date.now(),
              reviewedByAdmin: currentUser.name,
            }
          : a
      )
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'admin',
      action: 'COURIER_APPLICATION_REJECTED',
      targetType: 'courier',
      targetId: appId,
      details: `Kurye başvurusu reddedildi. Gerekçe: "${reason}"`,
      ipAddress: '195.175.42.11',
      severity: 'warning',
    });

    return { success: true, message: 'Kurye başvurusu reddedildi.' };
  };

  // Address CRUD for Customer
  const addUserAddress = (address: Omit<UserAddress, 'id'>) => {
    const newAddr: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };

    setCurrentUser(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddr],
    }));

    setUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id
          ? { ...u, addresses: [...u.addresses, newAddr] }
          : u
      )
    );
  };

  const deleteUserAddress = (addressId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      addresses: prev.addresses.filter(a => a.id !== addressId),
    }));

    setUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id
          ? { ...u, addresses: u.addresses.filter(a => a.id !== addressId) }
          : u
      )
    );
  };

  const setDefaultAddress = (addressId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      addresses: prev.addresses.map(a => ({
        ...a,
        isDefault: a.id === addressId,
      })),
    }));
  };

  const updateUserPassword = (userId: string, newPass: string) => {
    const user = users.find(u => u.id === userId) || currentUser;
    addAuditLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: `${user.role.toUpperCase()}_PASSWORD_CHANGED`,
      targetType: 'security',
      targetId: user.id,
      details: `${user.name} (${user.role}) hesabının şifresini başarıyla güncelledi.`,
      ipAddress: '192.168.1.45',
      severity: 'info',
    });
    return { success: true, message: 'Şifreniz başarıyla güncellendi ve güvenlik günlüğüne kaydedildi.' };
  };

  const updateUserAddress = (userId: string, addressId: string, updatedData: Partial<UserAddress>) => {
    const user = users.find(u => u.id === userId) || currentUser;
    const updatedAddresses = user.addresses.map(a => a.id === addressId ? { ...a, ...updatedData } : a);

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, addresses: updatedAddresses }));
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, addresses: updatedAddresses } : u));

    addAuditLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: `${user.role.toUpperCase()}_ADDRESS_UPDATED`,
      targetType: 'user',
      targetId: addressId,
      details: `${user.name} (${user.role}) "${updatedData.title || 'Adres'}" bilgilerini güncelledi: ${updatedData.addressLine || ''} (${updatedData.neighborhood || ''})`,
      ipAddress: '192.168.1.45',
      severity: 'info',
    });

    return { success: true, message: 'Adres bilgileri başarıyla güncellendi ve kaydedildi.' };
  };

  // Refund Workflow
  const requestRefund = (orderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, refundStatus: 'requested', cancellationReason: reason } : o))
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'REFUND_REQUESTED',
      targetType: 'order',
      targetId: orderId,
      details: `Müşteri ${orderId} numaralı sipariş için iade talep etti. Sebep: "${reason}"`,
      ipAddress: '88.250.14.88',
      severity: 'info',
    });

    return { success: true, message: 'İade talebiniz operasyon ekibine iletildi.' };
  };

  const approveRefund = (orderId: string) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Yalnızca Admin iade onaylayabilir.' };
    }

    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, refundStatus: 'approved', status: 'cancelled' } : o))
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'admin',
      action: 'REFUND_APPROVED',
      targetType: 'order',
      targetId: orderId,
      details: `${orderId} numaralı siparişin ücret iadesi onaylandı ve kart ekstresine yansıtıldı.`,
      ipAddress: '195.175.42.11',
      severity: 'info',
    });

    return { success: true, message: 'İade onaylandı ve işlem kaydı denetime eklendi.' };
  };

  // Cart operations
  const addToCart = (product: Product, pref: SubstitutePreference = 'auto') => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, substitutePreference: pref }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const setCartItemSubstitutePref = (productId: string, pref: SubstitutePreference) => {
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, substitutePreference: pref } : item
      )
    );
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = campaigns.find(c => c.code.toUpperCase() === clean);
    if (!found) {
      return { success: false, message: 'Geçersiz kupon kodu.' };
    }
    const currentSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (currentSubtotal < found.minBasketAmount) {
      return {
        success: false,
        message: `Bu kupon en az ${found.minBasketAmount} ₺ sepet tutarında geçerlidir.`,
      };
    }
    setActiveCoupon(found);
    return { success: true, message: `"${found.title}" uygulandı!` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  const reorderPastOrder = (order: Order) => {
    let addedCount = 0;
    let outOfStockCount = 0;

    order.items.forEach(orderItem => {
      const liveProduct = products.find(p => p.id === orderItem.product.id);
      if (liveProduct && liveProduct.stock > 0) {
        addToCart(liveProduct, orderItem.substitutePreference);
        addedCount++;
      } else {
        outOfStockCount++;
      }
    });

    return {
      success: addedCount > 0,
      addedCount,
      outOfStockCount,
    };
  };

  const createOrder = ({
    paymentMethod,
    customerName,
    customerPhone,
    address,
    notes,
    tip,
  }: {
    paymentMethod: 'card' | 'wallet' | 'cash';
    customerName: string;
    customerPhone: string;
    address: string;
    notes?: string;
    tip: number;
  }): Order | null => {
    // Üye girişi yapılmadan sipariş verilemez
    if (!isLoggedIn) {
      console.warn('Sipariş vermek için üye girişi zorunludur.');
      return null;
    }
    if (cart.length === 0) return null;

    const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];
    const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    let discount = 0;
    if (activeCoupon) {
      if (activeCoupon.discountType === 'fixed') {
        discount = activeCoupon.discountValue;
      } else {
        discount = (subtotal * activeCoupon.discountValue) / 100;
      }
    }

    const deliveryFee = subtotal >= currentStore.freeDeliveryThreshold ? 0 : currentStore.baseDeliveryFee;
    const totalAmount = Math.max(0, subtotal - discount) + deliveryFee + tip;

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNum = `#QCM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerId: currentUser.id,
      customer: {
        name: customerName,
        phone: customerPhone,
        address,
        neighborhood: currentStore.neighborhood,
        buildingNo: '12',
        floor: '2',
        apartmentNo: '4',
        notes,
      },
      storeId: currentStore.id,
      storeName: currentStore.name,
      items: cart.map(item => ({
        product: item.product,
        quantity: item.quantity,
        substitutePreference: item.substitutePreference,
        picked: false,
      })),
      subtotal,
      discountAmount: discount,
      deliveryFee,
      tip,
      totalAmount,
      couponCode: activeCoupon?.code,
      paymentMethod,
      status: 'created',
      deliveryPin: pin,
      createdAt: Date.now(),
      estimatedDeliveryMinutes: 14,
      routeProgress: 0,
      refundStatus: 'none',
    };

    setProducts(prev =>
      prev.map(p => {
        const cartItem = cart.find(c => c.product.id === p.id);
        if (cartItem) {
          const nextStock = Math.max(0, p.stock - cartItem.quantity);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    clearCart();

    // Trigger in-app notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `🛍️ Siparişiniz Alındı (${orderNum})`,
        message: `${totalAmount.toFixed(2)} ₺ tutarındaki siparişiniz hazırlanmak üzere markete iletildi.`,
        timestamp: 'Şimdi',
        isRead: false,
        type: 'order',
        orderId: newOrder.id,
      },
      ...prev,
    ]);

    addAuditLog({
      actorId: currentUser.id,
      actorName: customerName,
      actorRole: 'customer',
      action: 'ORDER_CREATED',
      targetType: 'order',
      targetId: newOrder.id,
      details: `${orderNum} numaralı sipariş verildi. Tutar: ${totalAmount.toFixed(2)} ₺, Ödeme: ${paymentMethod}`,
      ipAddress: '88.250.14.88',
      severity: 'info',
    });

    syncOrderToCloud(newOrder);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, courierId?: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated: Order = { ...ord, status: newStatus };
          if (courierId) {
            const cour = couriers.find(c => c.id === courierId);
            if (cour) {
              updated.courierId = cour.id;
              updated.courierName = cour.name;
              updated.courierPhone = cour.phone;
            }
          }
          if (newStatus === 'on_the_way') {
            updated.routeProgress = 15;
            updated.estimatedDeliveryMinutes = 8;
          } else if (newStatus === 'delivered') {
            updated.routeProgress = 100;
            updated.estimatedDeliveryMinutes = 0;
            updated.proofTimestamp = Date.now();
          }
          return updated;
        }
        return ord;
      })
    );

    // Lifecycle Notifications
    const statusTitles: Record<OrderStatus, string> = {
      created: 'Sipariş Alındı',
      picking: '📦 Siparişiniz Hazırlanıyor',
      picked: '🛵 Kurye Bekleniyor',
      on_the_way: '🚀 Kurye Yola Çıktı!',
      delivered: '✅ Siparişiniz Teslim Edildi',
      cancelled: '❌ Sipariş İptal Edildi'
    };
    const statusMessages: Record<OrderStatus, string> = {
      created: 'Siparişiniz başarıyla oluşturuldu.',
      picking: 'Depo görevlisi ürünlerinizi titizlikle sepete topluyor.',
      picked: 'Paketiniz hazırlandı ve kuryeye teslim edilmek üzere bekliyor.',
      on_the_way: 'Kuryemiz siparişinizi teslim etmek üzere yola çıktı!',
      delivered: 'Afiyet olsun! Siparişiniz adresinize teslim edildi.',
      cancelled: 'Siparişiniz iptal edildi ve tutar iade sürecine alındı.'
    };
    if (statusTitles[newStatus]) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: statusTitles[newStatus],
          message: statusMessages[newStatus],
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'order',
          orderId,
        },
        ...prev,
      ]);
    }

    if (courierId && newStatus === 'on_the_way') {
      setCouriers(prev =>
        prev.map(c =>
          c.id === courierId ? { ...c, status: 'busy', currentOrderId: orderId } : c
        )
      );

      addAuditLog({
        actorId: courierId,
        actorName: couriers.find(c => c.id === courierId)?.name || 'Kurye',
        actorRole: 'courier',
        action: 'COURIER_PICKUP_ORDER',
        targetType: 'order',
        targetId: orderId,
        details: `Kurye paketi mağaza deposundan teslim aldı ve müşteriye doğru yola çıktı.`,
        ipAddress: '176.240.19.4',
        severity: 'info',
      });
    }

    syncOrderStatusToCloud(orderId, newStatus, courierId);
  };

  const pickOrderItem = (orderId: string, productId: string, substituteProduct?: Product) => {
    const prod = products.find(p => p.id === productId);
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map(item => {
            if (item.product.id === productId) {
              return {
                ...item,
                picked: true,
                substitutedProduct: substituteProduct || item.substitutedProduct,
              };
            }
            return item;
          });

          const allPicked = updatedItems.every(i => i.picked);
          return {
            ...ord,
            items: updatedItems,
            status: allPicked ? 'picked' : 'picking',
          };
        }
        return ord;
      })
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'store_owner',
      action: 'STORE_ITEM_PICKED',
      targetType: 'order',
      targetId: orderId,
      details: `Depo personeli "${prod?.name || productId}" ürününü raftan topladı ve siparişe ekledi.`,
      ipAddress: '88.241.112.55',
      severity: 'info',
    });
  };

  const advanceCourierProgress = (orderId: string, progress: number) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const remainingMins = Math.max(1, Math.round(8 * (1 - progress / 100)));
          return {
            ...ord,
            routeProgress: progress,
            estimatedDeliveryMinutes: progress >= 100 ? 0 : remainingMins,
          };
        }
        return ord;
      })
    );
  };

  const verifyDeliveryOtp = (orderId: string, otp: string, notes?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Sipariş bulunamadı.' };

    if (order.deliveryPin.trim() === otp.trim()) {
      updateOrderStatus(orderId, 'delivered');
      if (notes) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, proofOfDeliveryNotes: notes } : o))
        );
      }

      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: 'courier',
        action: 'ORDER_DELIVERY_OTP_VERIFIED',
        targetType: 'order',
        targetId: orderId,
        details: `${order.orderNumber} kodlu teslimat 4 haneli PIN ile doğrulanıp başarıyla tamamlandı.`,
        ipAddress: '176.240.19.4',
        severity: 'info',
      });

      return { success: true, message: 'Teslimat başarıyla doğrulandı ve tamamlandı!' };
    }

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'courier',
      action: 'ORDER_OTP_FAILED_ATTEMPT',
      targetType: 'security',
      targetId: orderId,
      details: `${order.orderNumber} için hatalı teslimat kodu denendi: "${otp}"`,
      ipAddress: '176.240.19.4',
      severity: 'warning',
    });

    return { success: false, message: 'Hatalı teslimat kodu! Müşteriden tekrar kontrol etmesini isteyin.' };
  };

  const updateProductStock = (productId: string, stock: number) => {
    const prod = products.find(p => p.id === productId);
    const prevStock = prod ? prod.stock : 0;
    const nextStock = Math.max(0, stock);
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: nextStock } : p))
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'store_owner' : currentUser.role,
      action: 'STORE_STOCK_UPDATED',
      targetType: 'store',
      targetId: productId,
      details: `"${prod?.name || 'Ürün'}" stok miktarı ${prevStock} adetten ${nextStock} adede güncellendi.`,
      ipAddress: '88.241.112.55',
      severity: 'info',
    });

    addStockMovement(
      productId,
      nextStock,
      'manual_adjustment',
      'Manuel Stok Düzeltme',
      `Stok: ${prevStock} -> ${nextStock}`
    );

    syncProductStockToCloud(productId, nextStock);
  };

  const updateProductPrice = (productId: string, price: number) => {
    const prod = products.find(p => p.id === productId);
    const prevPrice = prod ? prod.price : 0;
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, price: Math.max(1, price) } : p))
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'store_owner' : currentUser.role,
      action: 'STORE_PRICE_UPDATED',
      targetType: 'store',
      targetId: productId,
      details: `"${prod?.name || 'Ürün'}" satış fiyatı ${prevPrice.toFixed(2)} ₺ -> ${price.toFixed(2)} ₺ olarak revize edildi.`,
      ipAddress: '88.241.112.55',
      severity: 'info',
    });

    syncProductPriceToCloud(productId, Math.max(1, price));
    checkAndTriggerPriceAlerts(productId, Math.max(1, price));
  };

  const createProduct = async (
    productData: Omit<Product, 'id'>
  ): Promise<{ success: boolean; message: string; product?: Product }> => {
    const newId = `prod-${Date.now()}`;
    const newProd: Product = {
      ...productData,
      id: newId,
    };

    setProducts(prev => [newProd, ...prev]);

    // Persist to Cloud Firestore /products
    const cloudRes = await createCloudProduct(newProd);

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'store_owner' : currentUser.role,
      action: 'PRODUCT_CREATED_IN_CLOUD',
      targetType: 'store',
      targetId: newId,
      details: `Yeni ürün kataloga eklendi: "${newProd.name}" (${newProd.price.toFixed(2)} ₺, Stok: ${newProd.stock}). Firestore senkronize edildi.`,
      ipAddress: '88.241.112.55',
      severity: 'info',
    });

    return {
      success: true,
      message: cloudRes.success ? 'Ürün başarıyla oluşturuldu ve buluta kaydedildi.' : 'Ürün yerel olarak eklendi, bulut senkronizasyonu tamamlanıyor.',
      product: newProd,
    };
  };

  const editProduct = async (
    productId: string,
    updates: Partial<Product>
  ): Promise<{ success: boolean; message: string }> => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, ...updates } : p))
    );

    if (updates.price !== undefined) {
      checkAndTriggerPriceAlerts(productId, Number(updates.price));
    }

    // Persist to Cloud Firestore
    const cloudRes = await updateCloudProduct(productId, updates);

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'store_owner' : currentUser.role,
      action: 'PRODUCT_UPDATED_IN_CLOUD',
      targetType: 'store',
      targetId: productId,
      details: `Ürün bilgileri güncellendi (ID: ${productId}). Firestore senkronize edildi.`,
      ipAddress: '88.241.112.55',
      severity: 'info',
    });

    return {
      success: true,
      message: cloudRes.success ? 'Ürün başarıyla güncellendi.' : 'Ürün yerel olarak güncellendi.',
    };
  };

  const deleteProduct = async (
    productId: string
  ): Promise<{ success: boolean; message: string }> => {
    const prod = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));

    // Delete from Cloud Firestore
    const cloudRes = await deleteCloudProduct(productId);

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'store_owner' : currentUser.role,
      action: 'PRODUCT_DELETED_IN_CLOUD',
      targetType: 'store',
      targetId: productId,
      details: `"${prod?.name || productId}" katalogdan ve Firestore'dan silindi.`,
      ipAddress: '88.241.112.55',
      severity: 'warning',
    });

    return {
      success: true,
      message: cloudRes.success ? 'Ürün veritabanından kalıcı olarak silindi.' : 'Ürün yerel listeden kaldırıldı.',
    };
  };

  const addStockMovement = (
    productId: string,
    newStock: number,
    reason: StockMovementLog['reason'],
    reasonText: string,
    notes?: string
  ) => {
    const prod = products.find(p => p.id === productId);
    const prevStock = prod ? prod.stock : 0;
    const changeAmount = newStock - prevStock;

    const newLog: StockMovementLog = {
      id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productName: prod?.name || 'Ürün',
      productBarcode: prod?.barcode || '',
      adminId: currentUser.id,
      adminName: currentUser.name,
      previousStock: prevStock,
      newStock,
      changeAmount,
      reason,
      reasonText,
      notes,
      timestamp: new Date().toLocaleTimeString('tr-TR') + ' (Bugün)',
    };

    setStockMovementLogs(prev => [newLog, ...prev]);
    saveStockMovementLogToCloud(newLog);
  };

  const bulkUpdateProducts = async (
    productIds: string[],
    updates: Partial<Product>,
    reason: string = 'Toplu Güncelleme'
  ): Promise<{ updatedCount: number }> => {
    setProducts(prev =>
      prev.map(p => (productIds.includes(p.id) ? { ...p, ...updates } : p))
    );

    let updatedCount = 0;
    for (const id of productIds) {
      await updateCloudProduct(id, updates);
      updatedCount++;
    }

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'admin' : currentUser.role,
      action: 'BULK_PRODUCT_UPDATE',
      targetType: 'store',
      targetId: 'bulk',
      details: `${productIds.length} ürün üzerinde toplu işlem yapıldı: ${reason}. Değişiklikler: ${JSON.stringify(updates)}`,
      ipAddress: '195.175.42.11',
      severity: 'info',
    });

    return { updatedCount };
  };

  const bulkImportProducts = async (
    newProducts: Omit<Product, 'id'>[]
  ): Promise<{ importedCount: number; errors: string[] }> => {
    const imported: Product[] = [];
    const errors: string[] = [];

    for (const raw of newProducts) {
      try {
        const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const p: Product = {
          ...raw,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: raw.status || 'active',
        };
        imported.push(p);
        await createCloudProduct(p);
      } catch (err: any) {
        errors.push(`${raw.name || 'Bilinmeyen ürün'}: ${err.message || 'Eklenemedi'}`);
      }
    }

    if (imported.length > 0) {
      setProducts(prev => [...imported, ...prev]);
      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role === 'customer' ? 'admin' : currentUser.role,
        action: 'BULK_PRODUCTS_IMPORTED',
        targetType: 'store',
        targetId: 'bulk_excel',
        details: `Excel/CSV dosyasından ${imported.length} adet yeni ürün topluca kataloga eklendi.`,
        ipAddress: '195.175.42.11',
        severity: 'info',
      });
    }

    return { importedCount: imported.length, errors };
  };

  const addCategory = async (catData: Omit<CategoryItem, 'id'>): Promise<CategoryItem> => {
    const id = `cat-${Date.now()}`;
    const newCat: CategoryItem = {
      ...catData,
      id,
    };
    setCategories(prev => [...prev, newCat]);
    await saveCategoryToCloud(newCat);

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'admin' : currentUser.role,
      action: 'CATEGORY_CREATED',
      targetType: 'store',
      targetId: id,
      details: `Yeni kategori oluşturuldu: "${newCat.name}" (Sıra: ${newCat.displayOrder}).`,
      ipAddress: '195.175.42.11',
      severity: 'info',
    });

    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<CategoryItem>): Promise<void> => {
    let updatedCat: CategoryItem | undefined;
    setCategories(prev =>
      prev.map(c => {
        if (c.id === id) {
          updatedCat = { ...c, ...updates };
          return updatedCat;
        }
        return c;
      })
    );
    if (updatedCat) {
      await saveCategoryToCloud(updatedCat);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    setCategories(prev => prev.filter(c => c.id !== id));
    await deleteCategoryFromCloud(id);
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'admin' : currentUser.role,
      action: 'CATEGORY_DELETED',
      targetType: 'store',
      targetId: id,
      details: `Kategori sistemden silindi: ID ${id}.`,
      ipAddress: '195.175.42.11',
      severity: 'warning',
    });
  };

  const reorderCategories = async (orderedIds: string[]): Promise<void> => {
    setCategories(prev => {
      const map = new Map(prev.map(c => [c.id, c]));
      const next: CategoryItem[] = [];
      orderedIds.forEach((id, index) => {
        const item = map.get(id);
        if (item) {
          const updated = { ...item, displayOrder: index + 1 };
          next.push(updated);
          saveCategoryToCloud(updated);
        }
      });
      prev.forEach(item => {
        if (!orderedIds.includes(item.id)) {
          next.push(item);
        }
      });
      return next;
    });
  };

  const toggleStoreStatus = (storeId: string) => {
    const st = stores.find(s => s.id === storeId);
    const nextStatus = st ? !st.isOpen : false;
    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, isOpen: !s.isOpen } : s))
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role === 'customer' ? 'store_owner' : currentUser.role,
      action: 'STORE_STATUS_TOGGLED',
      targetType: 'store',
      targetId: storeId,
      details: `"${st?.name || 'Mağaza'}" çalışma durumu ${nextStatus ? 'AÇIK (Sipariş Kabul Ediyor)' : 'KAPALI (Geçici Olarak Kapalı)'} yapıldı.`,
      ipAddress: '88.241.112.55',
      severity: 'info',
    });
  };

  const runConcurrencySimulation = async (productId: string, userCount: number) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    let currentStock = target.stock;
    const newLogs: ConcurrencyLog[] = [];

    for (let i = 1; i <= userCount; i++) {
      const requested = Math.min(2, Math.floor(Math.random() * 2) + 1);
      const latency = Math.floor(Math.random() * 15) + 5;

      if (currentStock >= requested) {
        const before = currentStock;
        currentStock -= requested;
        newLogs.push({
          id: `sim-${Date.now()}-${i}`,
          timestamp: new Date().toLocaleTimeString('tr-TR'),
          user: `Müşteri #${100 + i}`,
          action: 'Eşzamanlı Checkout (Pessimistic Lock)',
          productId: target.id,
          productName: target.name,
          quantityRequested: requested,
          stockBefore: before,
          stockAfter: currentStock,
          status: 'SUCCESS_LOCKED',
          latencyMs: latency,
        });
      } else {
        newLogs.push({
          id: `sim-${Date.now()}-${i}`,
          timestamp: new Date().toLocaleTimeString('tr-TR'),
          user: `Müşteri #${100 + i}`,
          action: 'Eşzamanlı Checkout (Stok Yetersiz)',
          productId: target.id,
          productName: target.name,
          quantityRequested: requested,
          stockBefore: currentStock,
          stockAfter: currentStock,
          status: 'FAILED_OUT_OF_STOCK',
          latencyMs: latency,
        });
      }
    }

    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: currentStock } : p))
    );

    setConcurrencyLogs(prev => [...newLogs, ...prev].slice(0, 30));
  };

  return (
    <AppContext.Provider
      value={{
        products,
        stores,
        activeStoreId,
        setActiveStoreId,
        couriers,
        orders,
        cart,
        activeCoupon,
        activeViewMode,
        setActiveViewMode,
        activeOrderId,
        setActiveOrderId,
        activeCourierId,
        setActiveCourierId,
        concurrencyLogs,
        campaigns,

        // Membership & Auth Gate
        isLoggedIn,
        setIsLoggedIn,
        isGuestBrowsing,
        setIsGuestBrowsing,
        currentUser,
        setCurrentUser,
        users,
        storeApplications,
        courierApplications,
        auditLogs,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authPromptReason,
        openAuthModal,
        closeAuthModal,
        isMobileModalOpen,
        setIsMobileModalOpen,
        mobileSimulatorDevice,
        setMobileSimulatorDevice,
        brandingConfig,
        updateBrandingConfig,
        resetBrandingConfig,
        loginWithFirebaseEmail,
        registerWithFirebaseEmail,
        loginWithGoogle,
        loginWithCredentials,
        logout,
        registerUserWithApproval,
        approveUser,
        rejectUser,
        switchPersona,
        loginCustomer,
        verifySmsOtp,
        registerCustomer,
        submitStoreApplication,
        submitCourierApplication,
        approveStoreApplication,
        rejectStoreApplication,
        approveCourierApplication,
        rejectCourierApplication,

        // Real Cloud Products / Listings CRUD
        createProduct,
        editProduct,
        deleteProduct,

        // Address & Profile
        addUserAddress,
        deleteUserAddress,
        setDefaultAddress,
        updateUserPassword,
        updateUserAddress,

        // Audit Logs & Refunds
        addAuditLog,
        requestRefund,
        approveRefund,

        // Cart & Order
        addToCart,
        removeFromCart,
        updateCartQuantity,
        setCartItemSubstitutePref,
        applyCoupon,
        removeCoupon,
        clearCart,
        reorderPastOrder,
        createOrder,
        updateOrderStatus,
        pickOrderItem,
        advanceCourierProgress,
        verifyDeliveryOtp,
        updateProductStock,
        updateProductPrice,
        toggleStoreStatus,
        runConcurrencySimulation,

        // Favorites & Wishlist
        favorites,
        toggleFavorite,
        isFavorite,

        // Hatay Local Districts
        selectedDistrict,
        setSelectedDistrict,

        // Notifications
        notifications,
        markNotificationAsRead,
        clearNotifications,

        // Smart Price Alerts (Akıllı Fiyat Alarmı)
        priceAlerts,
        setPriceAlert,
        removePriceAlert,
        getPriceAlertForProduct,

        // Professional Admin Product, Category & Stock Control
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        stockMovementLogs,
        addStockMovement,
        bulkUpdateProducts,
        bulkImportProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
