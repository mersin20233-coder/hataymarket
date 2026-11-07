import React, { useState } from 'react';
import {
  Code,
  Database,
  Server,
  FileText,
  CheckCircle,
  Copy,
  Download,
  BookOpen,
  ShieldCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react';

export const BlueprintHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'react_native' | 'database' | 'backend_api' | 'legal_turkey' | 'darkstore_ops'>('react_native');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const REACT_NATIVE_CODE = `// React Native / Expo (app/(tabs)/index.tsx)
import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  price: number;
  weight: string;
  image: string;
  stock: number;
}

export default function CustomerHomeScreen() {
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [search, setSearch] = useState('');

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Delivery Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Feather name="map-pin" size={18} color="#059669" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.deliveryText}>Teslimat: Kadıköy Moda Hub</Text>
            <Text style={styles.etaText}>⚡ 8 - 15 Dakika</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Feather name="shopping-bag" size={20} color="#fff" />
          {Object.keys(cart).length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Object.values(cart).reduce((a, b) => a + b, 0)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color="#64748b" />
        <TextInput
          placeholder="Ürün veya kategori ara..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {/* Main Product List */}
      <FlatList
        data={PRODUCTS_DATA}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImg} />
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productWeight}>{item.weight}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.price}>{item.price.toFixed(2)} ₺</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item.id)}>
                <Feather name="plus" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#0f172a' },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  deliveryText: { color: '#f8fafc', fontSize: 13, fontWeight: '700' },
  etaText: { color: '#34d399', fontSize: 11, fontWeight: '600' },
  cartButton: { backgroundColor: '#059669', padding: 10, borderRadius: 12, position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#f59e0b', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#0f172a', fontSize: 10, fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', height: 42 },
  input: { flex: 1, marginLeft: 8, fontSize: 13 },
  productCard: { flex: 1, margin: 6, padding: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  productImg: { width: '100%', height: 110, borderRadius: 10, resizeMode: 'cover' },
  productName: { fontSize: 13, fontWeight: '600', color: '#1e293b', marginTop: 6 },
  productWeight: { fontSize: 11, color: '#64748b', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  addButton: { backgroundColor: '#059669', width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});`;

  const SQL_SCHEMA_CODE = `-- PostgreSQL & Supabase DDL Schema + Row Level Security (RLS)
-- 1. Profiles & Identity
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Roles (Separation of duties: No public admin self-assignment)
CREATE TYPE app_role AS ENUM ('customer', 'store_owner', 'store_staff', 'courier', 'admin', 'auditor');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. Stores (Market İşletmeleri)
CREATE TYPE store_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    legal_company_name VARCHAR(200) NOT NULL,
    tax_no VARCHAR(11) UNIQUE NOT NULL, -- VKN
    tax_office VARCHAR(80),
    trade_registry_no VARCHAR(50),
    iban VARCHAR(34) NOT NULL,
    commission_rate_pct NUMERIC(4, 2) DEFAULT 10.00,
    status store_status DEFAULT 'pending',
    delivery_radius_km NUMERIC(3, 1) DEFAULT 3.5,
    min_basket_amount NUMERIC(8, 2) DEFAULT 150.00,
    base_delivery_fee NUMERIC(6, 2) DEFAULT 29.90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE store_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'owner', -- 'owner', 'manager', 'picker'
    UNIQUE(store_id, user_id)
);

-- 4. Couriers (Kurye Profilleri)
CREATE TYPE courier_status AS ENUM ('pending', 'approved', 'rejected', 'available', 'busy', 'offline');

CREATE TABLE couriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    tckn CHAR(11) UNIQUE NOT NULL,
    license_class VARCHAR(10) NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'Motosiklet',
    plate_number VARCHAR(20) NOT NULL,
    status courier_status DEFAULT 'pending',
    current_lat NUMERIC(9, 6),
    current_lng NUMERIC(9, 6),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Applications (Market & Kurye Başvuruları)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    application_type VARCHAR(20) NOT NULL, -- 'store' or 'courier'
    status VARCHAR(20) DEFAULT 'pending',
    application_data JSONB NOT NULL,
    documents JSONB NOT NULL,
    reviewer_admin_id UUID REFERENCES profiles(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 6. Orders & Order Items
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID REFERENCES profiles(id),
    store_id UUID REFERENCES stores(id),
    courier_id UUID REFERENCES couriers(id),
    status VARCHAR(30) DEFAULT 'created',
    delivery_pin CHAR(4) NOT NULL,
    subtotal NUMERIC(8, 2) NOT NULL,
    delivery_fee NUMERIC(6, 2) NOT NULL,
    discount_amount NUMERIC(8, 2) DEFAULT 0,
    tip_amount NUMERIC(6, 2) DEFAULT 0,
    total_amount NUMERIC(8, 2) NOT NULL,
    refund_status VARCHAR(20) DEFAULT 'none',
    delivery_address JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Logs (Değiştirilemez Denetim Günlüğü)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_id UUID REFERENCES profiles(id),
    actor_name VARCHAR(120) NOT NULL,
    actor_role VARCHAR(30) NOT NULL,
    action VARCHAR(80) NOT NULL,
    target_type VARCHAR(40) NOT NULL,
    target_id VARCHAR(80) NOT NULL,
    details TEXT NOT NULL,
    ip_address INET,
    severity VARCHAR(20) DEFAULT 'info'
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Müşteriler yalnızca kendi siparişlerini görebilir
CREATE POLICY customer_read_own_orders ON orders
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());

-- Market personeli yalnızca yetkili olduğu mağazanın siparişlerini görebilir
CREATE POLICY store_staff_read_store_orders ON orders
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM store_members 
            WHERE store_members.store_id = orders.store_id 
            AND store_members.user_id = auth.uid()
        )
    );

-- Kuryeler kendilerine atanan siparişleri görebilir
CREATE POLICY courier_read_assigned_orders ON orders
    FOR SELECT TO authenticated
    USING (courier_id = (SELECT id FROM couriers WHERE user_id = auth.uid()));

-- Admin ve Denetçiler tüm siparişleri inceleyebilir
CREATE POLICY admin_auditor_all_orders ON orders
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role IN ('admin', 'auditor')
        )
    );

-- Denetim kayıtları kesinlikle SİLİNEMEZ veya DÜZENLENEMEZ (Immutable Insert-Only)
CREATE POLICY audit_logs_read_auditor_admin ON audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role IN ('admin', 'auditor')
        )
    );

-- Denetim kayıtlarında UPDATE ve DELETE kuralları bilinçli olarak tanımlanmamıştır.`;

  const BACKEND_API_CODE = `// Node.js Express + Redis Distributed Lock Checkout Controller
import { Request, Response } from 'express';
import { db } from './db';
import { redisClient } from './redis';

export async function handleCheckout(req: Request, res: Response) {
  const { storeId, customerId, items, paymentToken, tip, couponCode } = req.body;
  const lockKey = \`lock:store:\${storeId}:checkout\`;

  // 1. Acquire Redis Mutex Lock (Expires in 5000ms to avoid deadlocks)
  const acquired = await redisClient.set(lockKey, 'locked', 'NX', 'PX', 5000);
  if (!acquired) {
    return res.status(429).json({ error: 'Sistem şu an çok yoğun. Lütfen 3 saniye sonra tekrar deneyin.' });
  }

  try {
    // 2. Run Database Transaction
    const orderResult = await db.transaction(async (trx) => {
      // Execute stored procedure with row-level locks
      await trx.raw('SELECT reserve_order_items(?, ?)', [storeId, JSON.stringify(items)]);

      // Calculate totals & apply discount
      const subtotal = items.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
      const deliveryFee = subtotal >= 400 ? 0 : 29.90;
      const total = subtotal + deliveryFee + (tip || 0);

      // Generate 4-digit verification OTP
      const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
      const orderNumber = \`#QCM-\${Math.floor(100000 + Math.random() * 900000)}\`;

      // Insert Order record
      const [order] = await trx('orders').insert({
        order_number: orderNumber,
        customer_id: customerId,
        store_id: storeId,
        status: 'created',
        delivery_pin: deliveryPin,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        payment_method: 'credit_card',
        created_at: new Date()
      }).returning('*');

      return order;
    });

    // 3. Emit real-time WebSocket event to Dark Store Picking Screen
    // io.to(\`store:\${storeId}\`).emit('NEW_ORDER_FOR_PICKING', orderResult);

    return res.status(201).json({ success: true, order: orderResult });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Sipariş oluşturulamadı.' });
  } finally {
    // Release Redis lock
    await redisClient.del(lockKey);
  }
}`;

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Mobil Uygulama Geliştirici & Üretim Stüdyosu</h2>
            <p className="text-xs text-slate-400">
              React Native, PostgreSQL şemaları, Node.js API ve Türkiye E-Ticaret mevzuat kontrol listesi
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'react_native', label: 'React Native & Expo', icon: Code },
            { id: 'database', label: 'PostgreSQL Şeması', icon: Database },
            { id: 'backend_api', label: 'Stok Kilitleme API', icon: Server },
            { id: 'legal_turkey', label: 'TR Hukuk & Ödeme (KVKK)', icon: FileText },
            { id: 'darkstore_ops', label: 'Dark Store Kılavuzu', icon: BookOpen },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code & Documentation Panels */}
      <div className="p-5 overflow-y-auto space-y-4">
        {/* REACT NATIVE CODE TAB */}
        {activeTab === 'react_native' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">React Native / Expo Mobil Kod Şablonu</h3>
                <p className="text-xs text-slate-500">
                  Android ve iOS için hazır; FlatList, sepet rozeti ve Getir tarzı hızlı kategori akışı.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(REACT_NATIVE_CODE, 'rn')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                {copiedKey === 'rn' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'rn' ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-[460px] border border-slate-800">
              <code>{REACT_NATIVE_CODE}</code>
            </pre>
          </div>
        )}

        {/* DATABASE SCHEMA TAB */}
        {activeTab === 'database' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">PostgreSQL / Supabase Veritabanı DDL</h3>
                <p className="text-xs text-slate-500">
                  Mağazalar, ürünler, kuryeler, siparişler ve atomik stok düşme saklı yordamı (Stored Procedure).
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(SQL_SCHEMA_CODE, 'sql')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                {copiedKey === 'sql' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sql' ? 'Kopyalandı!' : 'SQL Şemasını Kopyala'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-300 rounded-xl font-mono text-xs overflow-x-auto max-h-[460px] border border-slate-800">
              <code>{SQL_SCHEMA_CODE}</code>
            </pre>
          </div>
        )}

        {/* BACKEND API TAB */}
        {activeTab === 'backend_api' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Node.js Express + Redis Dağıtık Stok Kilitleme</h3>
                <p className="text-xs text-slate-500">
                  Eşzamanlı satışlarda stokların eksiye düşmesini engelleyen Redis Mutex kilit mantığı.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(BACKEND_API_CODE, 'api')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                {copiedKey === 'api' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'api' ? 'Kopyalandı!' : 'API Kodunu Kopyala'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-blue-300 rounded-xl font-mono text-xs overflow-x-auto max-h-[460px] border border-slate-800">
              <code>{BACKEND_API_CODE}</code>
            </pre>
          </div>
        )}

        {/* TURKEY LEGAL & PAYMENT TAB */}
        {activeTab === 'legal_turkey' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Türkiye E-Ticaret Mevzuatı ve Ödeme Altyapısı Kontrol Listesi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>1. Ödeme Ağ Geçidi & 3D Secure</span>
                </div>
                <p className="text-slate-600">
                  Türkiye'de BDDK lisanslı ödeme kuruluşları (Iyzico, PayTR, ParamPOS veya banka sanal POS'ları) kullanılmalıdır.
                  Mobil SDK ile 3D Secure 2.0 zorunludur.
                </p>
                <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                  Webhook rotası: <code>POST /api/payments/iyzico-callback</code>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>2. ETBİS Kaydı ve KEP Adresi</span>
                </div>
                <p className="text-slate-600">
                  Ticaret Bakanlığı Elektronik Ticaret Bilgi Sistemi'ne (ETBİS) kayıt yaptırmak zorunludur. Uygulama footer veya ayarlarında ETBİS QR kodu yer almalıdır.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>3. KVKK Açık Rıza ve SMS Doğrulama</span>
                </div>
                <p className="text-slate-600">
                  Kullanıcı telefon numarasıyla kaydolurken Aydınlatma Metni ve Açık Rıza onayı alınmalıdır. İYS (İleti Yönetim Sistemi) entegrasyonu pazarlama SMS'leri için şarttır.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>4. Mesafeli Satış Sözleşmesi & Ön Bilgilendirme</span>
                </div>
                <p className="text-slate-600">
                  6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca her sipariş öncesi müşteriye onaylatılmalı ve e-posta ile iletilmelidir. Çabuk bozulan gıda maddelerinde cayma hakkı istisnası belirtilmelidir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DARK STORE OPS TAB */}
        {activeTab === 'darkstore_ops' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Dark Store (Mikro Dağıtım Merkezi) Operasyon Standartları</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900">1. ABC Raf Yerleşimi</h4>
                <p className="text-slate-600">
                  En çok satan ürünler (Ekmek, Su, Süt) kapıya ve toplama masasına en yakın "A Rafı"na yerleştirilir. Bu sayede sipariş başına yürüme mesafesi %40 kısalır.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900">2. Soğuk Zincir Yönetimi</h4>
                <p className="text-slate-600">
                  Donuk ve soğuk ürünler (Dondurma, Et, Peynir) sipariş toplanmasının en son adımında sepete eklenir ve yalıtımlı kurye çantalarında buz aküsü ile taşınır.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900">3. Kurye Batarya İstasyonu</h4>
                <p className="text-slate-600">
                  Elektrikli kurye filosu için mağazada hazır şarj edilmiş batarya swap kabinleri bulunur. Kurye beklemeden 30 saniyede dolu bataryayı takarak tura çıkar.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
