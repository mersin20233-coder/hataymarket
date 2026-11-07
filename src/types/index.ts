export type UserRole = 
  | 'customer'
  | 'store_owner'
  | 'courier'
  | 'admin'
  | 'auditor';

export type SystemMode = 
  | 'customer'
  | 'courier'
  | 'store_picking'
  | 'admin'
  | 'auditor'
  | 'merchant_portal'
  | 'courier_portal'
  | 'profile_security'
  | 'split_orchestrator'
  | 'algorithm_engine'
  | 'blueprint_hub';

export type SubstitutePreference = 'auto' | 'call' | 'cancel';

export type OrderStatus = 
  | 'created'
  | 'picking'
  | 'picked'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface UserAddress {
  id: string;
  title: string; // 'Evim', 'İş Yeri', 'Yazlık', vb.
  addressLine: string;
  neighborhood: string;
  district: string;
  city: string;
  buildingNo: string;
  floor: string;
  apartmentNo: string;
  notes?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  isVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  createdAt: number;
  status: 'active' | 'pending' | 'suspended';
  storeId?: string; // If store_owner
  courierId?: string; // If courier
  addresses: UserAddress[];
  registrationNotes?: string;
}

export interface StoreApplication {
  id: string;
  userId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  companyLegalName: string; // Ticari Unvan
  tradeName: string; // İşletme / Tabela Adı
  taxNo: string; // VKN
  taxOffice: string; // Vergi Dairesi
  tradeRegistryNo: string; // Ticaret Sicil No
  iban: string;
  category: string;
  city: string;
  district: string;
  address: string;
  documents: {
    taxCertificate: boolean; // Vergi Levhası
    signatureCircular: boolean; // İmza Sirküleri
    activityCertificate: boolean; // Faaliyet Belgesi
    storeContract: boolean; // Mağaza İş Ortaklığı Sözleşmesi
  };
  commissionRatePct: number;
  status: ApplicationStatus;
  rejectionReason?: string;
  appliedAt: number;
  reviewedAt?: number;
  reviewedByAdmin?: string;
}

export interface CourierApplication {
  id: string;
  userId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  tckn: string; // T.C. Kimlik No
  birthYear: number;
  licenseClass: 'A2' | 'B' | 'A1';
  vehicleType: string; // Motosiklet, Elektrikli Scooter, Hafif Ticari
  plateNumber: string;
  city: string;
  district: string;
  hasAdliSicilClean: boolean; // Adli Sicil Temiz mi?
  documents: {
    criminalRecordDoc: boolean; // Adli Sicil Belgesi (e-Devlet)
    driverLicenseDoc: boolean; // Ehliyet Belgesi
    vehicleRegistrationDoc: boolean; // Araç Ruhsatı
    courierContract: boolean; // Kurye Taşıma Sözleşmesi
  };
  status: ApplicationStatus;
  rejectionReason?: string;
  appliedAt: number;
  reviewedAt?: number;
  reviewedByAdmin?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'store' | 'courier' | 'order' | 'commission' | 'user' | 'system' | 'security';
  targetId: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'security_alert';
  isFlagged?: boolean;
}

export interface ProductVariation {
  id: string;
  name: string; // örn: '1 kg', '500 gr', '5 kg çuval'
  price: number;
  stock: number;
  barcode?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  costPrice?: number; // Alış Fiyatı
  vatRate?: number; // KDV %1, %10, %20
  weight: string;
  image: string;
  galleryImages?: string[]; // Birden fazla ürün görseli
  stock: number;
  minStockAlert?: number; // Minimum stok uyarı eşiği (varsayılan: 5)
  unit: string; // adet, kg, gram, litre, ml, paket, vb.
  barcode: string;
  brand: string;
  description: string;
  variations?: ProductVariation[]; // Ürün varyasyonları
  status?: 'active' | 'passive'; // Ürün durumu (aktif/pasif)
  isPopular?: boolean;
  isFeatured?: boolean; // Öne çıkan ürün
  isCampaign?: boolean; // Kampanyalı ürün
  isNew?: boolean; // Yeni ürün etiketi
  isBestseller?: boolean; // En çok satan etiketi
  displayOrder?: number; // Ürün sıralaması
  storeIds?: string[]; // Satışta olduğu marketler
  storeId?: string; // Ana market
  createdAt?: number; // Oluşturulma tarihi
  updatedAt?: number; // Güncellenme tarihi
  tags?: string[];
  substituteIds?: string[];
}

export interface StockMovementLog {
  id: string;
  productId: string;
  productName: string;
  productBarcode: string;
  adminId: string;
  adminName: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  reason: 'manual_adjustment' | 'purchase_delivery' | 'damaged_waste' | 'customer_return' | 'stock_count' | 'bulk_update' | 'order_deduction';
  reasonText: string;
  notes?: string;
  timestamp: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconEmoji: string;
  image: string;
  displayOrder: number;
  subcategories: string[];
  isActive: boolean;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  substitutePreference: SubstitutePreference;
}

export interface DarkStore {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  district: string;
  city: string;
  deliveryRadiusKm: number;
  minBasketAmount: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  activeCouriersCount: number;
  isOpen: boolean;
  capacityUtilizationPct: number;
  coordinates: { lat: number; lng: number };
  ownerUserId?: string;
  taxNo?: string;
  commissionRatePct?: number;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  photo: string;
  rating: number;
  completedDeliveries: number;
  status: 'available' | 'busy' | 'break' | 'pending';
  currentOrderId?: string;
  batteryOrFuelPct: number;
  location: { lat: number; lng: number };
  userId?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  substitutePreference: SubstitutePreference;
  picked?: boolean;
  substitutedProduct?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    neighborhood: string;
    buildingNo: string;
    floor: string;
    apartmentNo: string;
    notes?: string;
  };
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  tip: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: 'card' | 'wallet' | 'cash';
  status: OrderStatus;
  deliveryPin: string; // 4-digit OTP
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  createdAt: number;
  estimatedDeliveryMinutes: number;
  routeProgress: number; // 0 to 100%
  cancellationReason?: string;
  refundStatus?: 'none' | 'requested' | 'approved' | 'rejected';
  proofOfDeliveryNotes?: string;
  proofTimestamp?: number;
}

export interface Campaign {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBasketAmount: number;
  badge: string;
  validUntil: string;
}

export interface ConcurrencyLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  productId: string;
  productName: string;
  quantityRequested: number;
  stockBefore: number;
  stockAfter: number;
  status: 'SUCCESS_LOCKED' | 'FAILED_OUT_OF_STOCK' | 'CONCURRENCY_ABORT';
  latencyMs: number;
}

export interface RecipeIngredient {
  name: string;
  amountPerServing: number;
  unit: string; // 'gr', 'adet', 'yemek kaşığı', 'ml', 'su bardağı'
  matchedProductId?: string;
  categoryKey?: string;
  isPantryStaple?: boolean; // Tuz, karabiber, su vb.
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'Çorbalar' | 'Ana Yemekler' | 'Pilav & Makarnalar' | 'Sebze Yemekleri' | 'Salata & Meze' | 'Hamur İşi & Börek' | 'Tatlılar';
  defaultServings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  dietary: ('ekonomik' | 'hizli' | 'sebzeli' | 'etli' | 'tavuklu' | 'tatli')[];
  ingredients: RecipeIngredient[];
  steps: string[];
  image: string;
}

export interface ShoppingListItem {
  ingredientName: string;
  requiredAmountDisplay: string;
  matchedProductId?: string;
  matchedProduct?: Product;
  quantityToBuy: number;
  isHaveAtHome: boolean;
  isChecked: boolean;
  estimatedPrice: number;
}

export interface ShoppingList {
  id: string;
  recipeId: string;
  recipeName: string;
  servings: number;
  items: ShoppingListItem[];
  totalEstimatedPrice: number;
  createdAt: number;
}

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  productBrand: string;
  category: string;
  currentPrice: number;
  targetPrice: number;
  initialPrice: number;
  createdAt: number;
  isTriggered: boolean;
  triggeredAt?: number;
  triggeredPrice?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'order' | 'promo' | 'system' | 'price_alert';
  orderId?: string;
  productId?: string;
  targetPrice?: number;
  newPrice?: number;
}

export interface HatayDistrict {
  id: string;
  name: string;
  activeDarkStoreId: string;
  estimatedDeliveryMin: number;
  deliveryFee: number;
  minBasket: number;
  neighborhoods: string[];
}

export interface AppBrandingConfig {
  // Screens 3D Hero Images
  splashHeroImage: string;
  welcomeHeroImage: string;
  registerHeroImage: string;
  loginHeroImage: string;
  phoneVerifyHeroImage: string;
  phoneVerifyBadgeImage: string;
  emailVerifyHeroImage: string;
  emailVerifyBadgeImage: string;
  forgotPasswordHeroImage: string;
  successHeroImage: string;
  successCartBadgeImage: string;

  // Custom Titles & Subtitles
  splashTitle: string;
  splashSubtitle: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
  loginTitle: string;
  loginSubtitle: string;
  phoneVerifyTitle: string;
  phoneVerifySubtitle: string;
  emailVerifyTitle: string;
  emailVerifySubtitle: string;
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  successTitle: string;
  successSubtitle: string;

  // Initial Screen Selection
  defaultInitialScreen: 'splash' | 'welcome' | 'register' | 'login' | 'success';

  // Legacy fields for backward compatibility
  welcomeSceneImage?: string;
  registerSceneImage?: string;
  loginSceneImage?: string;
  bottomNavImage?: string;
  bottomNavStyle?: 'mascot_3d' | 'classic';
  welcomeSlogan?: string;
  welcomeGreeting?: string;
  showBottomMascotPeek?: boolean;
}



