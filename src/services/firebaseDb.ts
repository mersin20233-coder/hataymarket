import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { Product, Order, OrderStatus, UserProfile, UserAddress, DarkStore, AuditLogEntry, PriceAlert, CategoryItem, StockMovementLog } from '../types';

export const GOOGLE_CLOUD_METADATA = {
  projectId: 'gen-lang-client-0110978609',
  firestoreDatabaseId: 'ai-studio-qcommercestudiom-ff9f23c0-7f70-4cb8-8f46-f1265faf0b19',
  region: 'europe-west1',
  serviceAccount: 'ai-studio-qcommercestudiom@gen-lang-client-0110978609.iam.gserviceaccount.com',
  urls: {
    cloudConsole: 'https://console.cloud.google.com/home/dashboard?project=gen-lang-client-0110978609',
    firestoreData: 'https://console.cloud.google.com/firestore/databases/ai-studio-qcommercestudiom-ff9f23c0-7f70-4cb8-8f46-f1265faf0b19/data/panel?project=gen-lang-client-0110978609',
    firestoreIndexes: 'https://console.cloud.google.com/firestore/databases/ai-studio-qcommercestudiom-ff9f23c0-7f70-4cb8-8f46-f1265faf0b19/indexes?project=gen-lang-client-0110978609',
    firebaseOverview: 'https://console.firebase.google.com/project/gen-lang-client-0110978609/overview',
    firebaseAuth: 'https://console.firebase.google.com/project/gen-lang-client-0110978609/authentication',
  }
};

/**
 * Initialize anonymous Firebase Auth session if not already logged in
 */
export async function ensureAuthSession(): Promise<FirebaseUser | null> {
  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.info('Firebase auth session note:', err);
    return null;
  }
}

/**
 * Register a user with real Firebase Authentication and Firestore User Profile
 */
export async function registerWithFirebaseAuth(
  email: string,
  pass: string,
  profile: Partial<UserProfile>
): Promise<{ success: boolean; user?: UserProfile; message: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const uid = cred.user.uid;

    const initialAddresses: UserAddress[] = profile.addresses && profile.addresses.length > 0
      ? profile.addresses
      : [
          {
            id: `addr-${Date.now()}`,
            title: 'Evim',
            addressLine: 'Atatürk Cad. No: 12',
            neighborhood: 'Sümerler',
            district: 'Defne',
            city: 'Hatay',
            buildingNo: '12',
            floor: '3',
            apartmentNo: '6',
            isDefault: true,
          }
        ];

    const userProfile: UserProfile = {
      id: uid,
      name: profile.name || email.split('@')[0],
      email: email.trim().toLowerCase(),
      phone: profile.phone || '',
      role: profile.role || 'customer',
      isVerified: true,
      phoneVerified: true,
      status: 'active',
      createdAt: Date.now(),
      addresses: initialAddresses,
      registrationNotes: 'Firebase Authentication ile oluşturuldu',
    };

    // Save profile to Cloud Firestore /users/{uid}
    await setDoc(doc(db, 'users', uid), {
      ...userProfile,
      favorites: ['prod-1', 'prod-33', 'prod-36'],
      updatedAt: Date.now(),
    }, { merge: true });

    return {
      success: true,
      user: userProfile,
      message: 'Hesabınız Firebase Authentication ile başarıyla oluşturuldu!',
    };
  } catch (error: any) {
    console.warn('Firebase register error:', error);
    let msg = 'Kayıt sırasında hata oluştu.';
    if (error.code === 'auth/email-already-in-use') {
      msg = 'Bu e-posta adresi zaten kullanımda.';
    } else if (error.code === 'auth/weak-password') {
      msg = 'Şifre çok zayıf. En az 6 karakter giriniz.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Geçerli bir e-posta adresi giriniz.';
    }
    return { success: false, message: msg };
  }
}

/**
 * Login with real Firebase Authentication and fetch profile from Firestore
 */
export async function loginWithFirebaseAuth(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: UserProfile; message: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const uid = cred.user.uid;

    // Fetch user profile from Firestore /users/{uid}
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    let userProfile: UserProfile;
    if (userDoc.exists()) {
      userProfile = userDoc.data() as UserProfile;
    } else {
      // Create profile document if doesn't exist yet
      userProfile = {
        id: uid,
        name: cred.user.displayName || email.split('@')[0],
        email: email.trim().toLowerCase(),
        phone: cred.user.phoneNumber || '',
        role: email.includes('admin') ? 'admin' : 'customer',
        isVerified: true,
        phoneVerified: true,
        status: 'active',
        createdAt: Date.now(),
        addresses: [],
      };
      await setDoc(userDocRef, userProfile, { merge: true });
    }

    return {
      success: true,
      user: userProfile,
      message: `Giriş başarılı! Hoş geldiniz, ${userProfile.name}.`,
    };
  } catch (error: any) {
    console.warn('Firebase login error:', error);
    let msg = 'Giriş yapılamadı.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      msg = 'E-posta veya şifre hatalı.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Geçersiz e-posta formatı.';
    }
    return { success: false, message: msg };
  }
}

/**
 * Google Auth popup login
 */
export async function loginWithGoogleAuth(): Promise<{ success: boolean; user?: UserProfile; message: string }> {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const uid = cred.user.uid;
    const email = cred.user.email || '';

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    let userProfile: UserProfile;
    if (userDoc.exists()) {
      userProfile = userDoc.data() as UserProfile;
    } else {
      userProfile = {
        id: uid,
        name: cred.user.displayName || 'Google Kullanıcısı',
        email,
        phone: cred.user.phoneNumber || '',
        role: email.toLowerCase() === 'mersin20233@gmail.com' ? 'admin' : 'customer',
        isVerified: true,
        phoneVerified: true,
        avatar: cred.user.photoURL || undefined,
        status: 'active',
        createdAt: Date.now(),
        addresses: [],
      };
      await setDoc(userDocRef, userProfile, { merge: true });
    }

    return {
      success: true,
      user: userProfile,
      message: `Google ile giriş yapıldı! Hoş geldiniz, ${userProfile.name}.`,
    };
  } catch (error: any) {
    console.warn('Google Auth error:', error);
    return {
      success: false,
      message: error?.message || 'Google ile giriş başarısız oldu.',
    };
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFirebaseAuth(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signout note:', err);
  }
}

/**
 * Sync user profile changes to Cloud Firestore
 */
export async function syncUserProfileToCloud(userId: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const ref = doc(db, 'users', userId);
    await setDoc(ref, {
      ...data,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('User profile sync note:', err);
  }
}

/**
 * Sync user favorites to Cloud Firestore
 */
export async function syncUserFavoritesToCloud(userId: string, favorites: string[]): Promise<void> {
  try {
    const ref = doc(db, 'users', userId);
    await setDoc(ref, {
      favorites,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Favorites sync note:', err);
  }
}

/**
 * Fetch user favorites from Cloud Firestore
 */
export async function fetchUserFavoritesFromCloud(userId: string): Promise<string[] | null> {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.favorites)) {
        return data.favorites;
      }
    }
    return null;
  } catch (err) {
    console.warn('Fetch favorites note:', err);
    return null;
  }
}

/**
 * Sync user price alerts to Cloud Firestore
 */
export async function syncUserPriceAlertsToCloud(userId: string, priceAlerts: PriceAlert[]): Promise<void> {
  try {
    const ref = doc(db, 'users', userId);
    await setDoc(ref, {
      priceAlerts,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Price alerts sync note:', err);
  }
}

/**
 * Fetch user price alerts from Cloud Firestore
 */
export async function fetchUserPriceAlertsFromCloud(userId: string): Promise<PriceAlert[] | null> {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.priceAlerts)) {
        return data.priceAlerts;
      }
    }
    return null;
  } catch (err) {
    console.warn('Fetch price alerts note:', err);
    return null;
  }
}

/**
 * Test Google Cloud Firestore connectivity and latency
 */
export async function testCloudFirestoreConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  databaseId: string;
  projectId: string;
  error?: string;
}> {
  const start = performance.now();
  try {
    const testDoc = await getDoc(doc(db, 'products', 'prod-1'));
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: true,
      latencyMs,
      databaseId: GOOGLE_CLOUD_METADATA.firestoreDatabaseId,
      projectId: GOOGLE_CLOUD_METADATA.projectId,
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: false,
      latencyMs,
      databaseId: GOOGLE_CLOUD_METADATA.firestoreDatabaseId,
      projectId: GOOGLE_CLOUD_METADATA.projectId,
      error: error?.message || 'Bağlantı sağlanamadı',
    };
  }
}

/**
 * Fetch all products from Firestore collection /products
 */
export async function fetchProductsFromCloud(): Promise<Product[] | null> {
  try {
    const colRef = collection(db, 'products');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return null;
    }
    const products: Product[] = [];
    snapshot.forEach(docSnap => {
      products.push(docSnap.data() as Product);
    });
    return products;
  } catch (err) {
    console.warn('Cloud Firestore products read fallback:', err);
    return null;
  }
}

/**
 * Real-time listener for products
 */
export function subscribeToCloudProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, 'products');
    return onSnapshot(
      colRef,
      snapshot => {
        if (!snapshot.empty) {
          const prods: Product[] = [];
          snapshot.forEach(docSnap => {
            prods.push(docSnap.data() as Product);
          });
          onUpdate(prods);
        }
      },
      error => {
        console.warn('Cloud Firestore products subscription warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Failed to attach products snapshot listener:', err);
    return () => {};
  }
}

/**
 * Create a new product / listing in Cloud Firestore /products
 */
export async function createCloudProduct(product: Product): Promise<{ success: boolean; message: string }> {
  try {
    await ensureAuthSession();
    const ref = doc(db, 'products', product.id);
    await setDoc(ref, {
      ...product,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, { merge: true });
    return { success: true, message: 'Ürün Firestore bulut veritabanına kaydedildi.' };
  } catch (error: any) {
    console.error('Error creating product in Firestore:', error);
    return { success: false, message: error?.message || 'Ürün kaydedilemedi.' };
  }
}

/**
 * Update an existing product in Cloud Firestore /products
 */
export async function updateCloudProduct(
  productId: string,
  changes: Partial<Product>
): Promise<{ success: boolean; message: string }> {
  try {
    await ensureAuthSession();
    const ref = doc(db, 'products', productId);
    await updateDoc(ref, {
      ...changes,
      updatedAt: Date.now(),
    });
    return { success: true, message: 'Ürün güncellendi.' };
  } catch (error: any) {
    console.error('Error updating product in Firestore:', error);
    return { success: false, message: error?.message || 'Ürün güncellenemedi.' };
  }
}

/**
 * Delete a product from Cloud Firestore /products
 */
export async function deleteCloudProduct(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    await ensureAuthSession();
    const ref = doc(db, 'products', productId);
    await deleteDoc(ref);
    return { success: true, message: 'Ürün veritabanından silindi.' };
  } catch (error: any) {
    console.error('Error deleting product in Firestore:', error);
    return { success: false, message: error?.message || 'Ürün silinemedi.' };
  }
}

/**
 * Seed initial catalog to Google Cloud Firestore /products and /stores without overwriting existing
 */
export async function seedCatalogToGoogleCloud(
  initialProducts: Product[],
  initialStores: DarkStore[]
): Promise<{ success: boolean; seededCount: number; message: string }> {
  await ensureAuthSession();
  let seededCount = 0;
  try {
    for (const prod of initialProducts) {
      try {
        await setDoc(doc(db, 'products', prod.id), {
          ...prod,
          updatedAt: Date.now(),
        }, { merge: true });
        seededCount++;
      } catch (e) {
        console.warn(`Product seed note for ${prod.id}:`, e);
      }
    }

    for (const store of initialStores) {
      try {
        await setDoc(doc(db, 'stores', store.id), {
          ...store,
          updatedAt: Date.now(),
        }, { merge: true });
      } catch (e) {
        console.warn(`Store seed note for ${store.id}:`, e);
      }
    }

    return {
      success: true,
      seededCount,
      message: `${seededCount} adet ürün ve Hatay dark store'ları Google Cloud Firestore'a senkronize edildi.`,
    };
  } catch (err: any) {
    return {
      success: false,
      seededCount,
      message: err?.message || 'Google Cloud Firestore eşitleme sırasında hata oluştu.',
    };
  }
}

/**
 * Update stock in Google Cloud Firestore
 */
export async function syncProductStockToCloud(productId: string, newStock: number): Promise<void> {
  try {
    const ref = doc(db, 'products', productId);
    await updateDoc(ref, {
      stock: newStock,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Product stock cloud sync note:', err);
  }
}

/**
 * Update price in Google Cloud Firestore
 */
export async function syncProductPriceToCloud(productId: string, newPrice: number): Promise<void> {
  try {
    const ref = doc(db, 'products', productId);
    await updateDoc(ref, {
      price: newPrice,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Product price cloud sync note:', err);
  }
}

/**
 * Save new order to Google Cloud Firestore /orders
 */
export async function syncOrderToCloud(order: Order): Promise<void> {
  try {
    await ensureAuthSession();
    const currentUid = auth.currentUser?.uid;
    const ref = doc(db, 'orders', order.id);
    
    // Attach current auth uid if available so security rules permit read/update
    const cloudPayload = {
      ...order,
      customerId: currentUid || order.customerId,
      syncedToCloudAt: Date.now(),
    };
    await setDoc(ref, cloudPayload, { merge: true });
  } catch (err) {
    console.warn('Order cloud sync note:', err);
  }
}

/**
 * Real-time listener for orders
 */
export function subscribeToCloudOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, 'orders');
    return onSnapshot(
      colRef,
      snapshot => {
        if (!snapshot.empty) {
          const ordersList: Order[] = [];
          snapshot.forEach(docSnap => {
            ordersList.push(docSnap.data() as Order);
          });
          onUpdate(ordersList);
        }
      },
      error => {
        console.warn('Cloud Firestore orders subscription warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Failed to attach orders snapshot listener:', err);
    return () => {};
  }
}

/**
 * Update order status in Google Cloud Firestore
 */
export async function syncOrderStatusToCloud(
  orderId: string,
  status: OrderStatus,
  courierId?: string
): Promise<void> {
  try {
    const ref = doc(db, 'orders', orderId);
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: Date.now(),
    };
    if (courierId) updatePayload.courierId = courierId;
    await updateDoc(ref, updatePayload);
  } catch (err) {
    console.warn('Order status cloud sync note:', err);
  }
}

/**
 * Save audit log entry to Google Cloud Firestore /auditLogs
 */
export async function syncAuditLogToCloud(log: AuditLogEntry): Promise<void> {
  try {
    await ensureAuthSession();
    const ref = doc(db, 'auditLogs', log.id);
    await setDoc(ref, {
      ...log,
      cloudLoggedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Audit log cloud sync note:', err);
  }
}

/**
 * Save or update category in Google Cloud Firestore /categories
 */
export async function saveCategoryToCloud(category: CategoryItem): Promise<{ success: boolean; message: string }> {
  try {
    await ensureAuthSession();
    const ref = doc(db, 'categories', category.id);
    await setDoc(ref, {
      ...category,
      updatedAt: Date.now(),
    }, { merge: true });
    return { success: true, message: 'Kategori Firestore veritabanına kaydedildi.' };
  } catch (err: any) {
    console.warn('Category cloud sync note:', err);
    return { success: false, message: err?.message || 'Kategori kaydedilemedi.' };
  }
}

/**
 * Fetch all categories from Firestore /categories
 */
export async function fetchCategoriesFromCloud(): Promise<CategoryItem[] | null> {
  try {
    const colRef = collection(db, 'categories');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;
    const cats: CategoryItem[] = [];
    snapshot.forEach(docSnap => {
      cats.push(docSnap.data() as CategoryItem);
    });
    return cats.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (err) {
    console.warn('Categories cloud fetch note:', err);
    return null;
  }
}

/**
 * Delete category from Firestore /categories
 */
export async function deleteCategoryFromCloud(categoryId: string): Promise<boolean> {
  try {
    await ensureAuthSession();
    const ref = doc(db, 'categories', categoryId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.warn('Category delete note:', err);
    return false;
  }
}

/**
 * Save stock movement history log to Firestore /stockMovementLogs
 */
export async function saveStockMovementLogToCloud(log: StockMovementLog): Promise<void> {
  try {
    await ensureAuthSession();
    const ref = doc(db, 'stockMovementLogs', log.id);
    await setDoc(ref, {
      ...log,
      loggedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Stock movement log note:', err);
  }
}

/**
 * Fetch latest stock movement logs from Firestore /stockMovementLogs
 */
export async function fetchStockMovementLogsFromCloud(): Promise<StockMovementLog[] | null> {
  try {
    const colRef = collection(db, 'stockMovementLogs');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;
    const logs: StockMovementLog[] = [];
    snapshot.forEach(docSnap => {
      logs.push(docSnap.data() as StockMovementLog);
    });
    return logs.sort((a, b) => b.id.localeCompare(a.id));
  } catch (err) {
    console.warn('Stock movement fetch note:', err);
    return null;
  }
}

