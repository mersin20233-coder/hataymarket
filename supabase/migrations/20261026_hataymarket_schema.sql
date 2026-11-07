-- ============================================================================
-- HATAYMARKET — SUPABASE / POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Version: 2026.10.26
-- Region: Hatay, Türkiye (Antakya, Defne, İskenderun, Samandağ, Kırıkhan, Dörtyol, Arsuz, Reyhanlı)
-- Includes: 27 Tables, Foreign Keys, Indexes, Row Level Security (RLS) & Seed Data
-- ============================================================================

-- 0. Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES (Kullanıcı Profilleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 2. USER_ROLES (Kullanıcı Rolleri & RBAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'store_owner', 'courier', 'admin', 'auditor')),
    assigned_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, role)
);

-- ============================================================================
-- 3. DISTRICTS (Hatay İlçe & Dağıtım Bölgeleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.districts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT DEFAULT 'Hatay',
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 19.90,
    min_basket_amount NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    estimated_delivery_time TEXT NOT NULL DEFAULT '15-20 dk',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 4. MARKETS / DARK STORES (Hatay Dark Store Dağıtım Depoları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.markets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    neighborhood TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_open BOOLEAN DEFAULT TRUE,
    base_delivery_fee NUMERIC(10, 2) DEFAULT 19.90,
    free_delivery_threshold NUMERIC(10, 2) DEFAULT 250.00,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 5. ADDRESSES (Müşteri Teslimat Adresleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Evim',
    address_line TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Hatay',
    building_no TEXT,
    floor TEXT,
    apartment_no TEXT,
    delivery_notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 6. CATEGORIES (Ürün Kategorileri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 7. PRODUCTS (Market Ürünleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    weight TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'adet',
    stock INT NOT NULL DEFAULT 0,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 8. INVENTORY (Dark Store Stok Durumları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_id TEXT NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(market_id, product_id)
);

-- ============================================================================
-- 9. COURIERS (Kuryeler)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.couriers (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Motosiklet',
    vehicle_plate TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    rating NUMERIC(3, 2) DEFAULT 4.90,
    total_deliveries INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 10. ORDERS (Siparişler)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_code TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    delivery_address TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('created', 'picking', 'picked', 'on_the_way', 'delivered', 'cancelled')),
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    tip NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'wallet', 'cash')),
    payment_status TEXT NOT NULL DEFAULT 'completed',
    courier_id TEXT REFERENCES public.couriers(id) ON DELETE SET NULL,
    courier_notes TEXT,
    estimated_delivery_time TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 11. ORDER_ITEMS (Sipariş Kalemleri & Muadil Tercihleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    substitute_preference TEXT DEFAULT 'contact' CHECK (substitute_preference IN ('contact', 'auto_equal', 'auto_premium', 'cancel')),
    substituted_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    is_picked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 12. DELIVERIES (Teslimat Detayları & Canlı Kurye Telemetrisi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    courier_id TEXT NOT NULL REFERENCES public.couriers(id) ON DELETE RESTRICT,
    pickup_time TIMESTAMPTZ,
    delivered_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'assigned',
    distance_km NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 13. PAYMENTS (Ödeme Kayıtları & Gateway Logları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    provider TEXT NOT NULL CHECK (provider IN ('iyzico', 'stripe', 'cash_on_delivery', 'wallet')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
    transaction_id TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 14. COUPONS (İndirim Kuponları & Kampanyalar)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_basket_amount NUMERIC(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 15. COUPON_USAGES (Kullanılan Kuponlar)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id TEXT NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 16. FAVORITES (Favori Ürünler)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, product_id)
);

-- ============================================================================
-- 17. NOTIFICATIONS (Kullanıcı Bildirimleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('order_status', 'coupon', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 18. AUDIT_LOGS (KVKK & Sistem Denetim Günlüğü)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 19. RECIPES (Bugün Ne Yapsam? Tarif Kataloğu)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    servings INT NOT NULL DEFAULT 4,
    prep_time_minutes INT NOT NULL DEFAULT 15,
    cook_time_minutes INT NOT NULL DEFAULT 30,
    dietary TEXT DEFAULT 'standard',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 20. RECIPE_INGREDIENTS (Tarif Malzemeleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id TEXT NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    matched_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 21. RECIPE_STEPS (Tarif Hazırlanış Adımları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recipe_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id TEXT NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(recipe_id, step_number)
);

-- ============================================================================
-- 22. SHOPPING_LISTS (Kullanıcı Alışveriş Listeleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 23. SHOPPING_LIST_ITEMS (Alışveriş Listesi Maddeleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    is_purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 24. STORE_APPLICATIONS (Market Ortaklık Başvuruları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.store_applications (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    tax_number TEXT NOT NULL,
    trade_registry_no TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 25. COURIER_APPLICATIONS (Kurye Başvuruları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.courier_applications (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    district TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    license_plate TEXT,
    driving_license_type TEXT NOT NULL,
    experience_years INT DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 26. SYSTEM_SETTINGS (Sistem Parametreleri)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 27. USER_WALLETS (Müşteri Dijital Cüzdanları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    currency TEXT DEFAULT 'TRY',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can view & update their own profile
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- 2. Addresses: Users can view & manage their own addresses
CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- 3. Orders: Customers can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Favorites: Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- 5. Notifications: Users can view and mark read their own notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 6. Wallets: Users can view their own wallet
CREATE POLICY "Users can view own wallet" ON public.user_wallets
    FOR SELECT USING (auth.uid() = user_id);

-- 7. Public Read Tables (Districts, Markets, Categories, Products, Recipes)
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read markets" ON public.markets FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (is_active = true);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read recipes" ON public.recipes FOR SELECT USING (true);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read recipe ingredients" ON public.recipe_ingredients FOR SELECT USING (true);

ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read recipe steps" ON public.recipe_steps FOR SELECT USING (true);

-- ============================================================================
-- SEED DATA (Hatay İlçeleri ve Temel Ayarlar)
-- ============================================================================
INSERT INTO public.districts (id, name, city, delivery_fee, min_basket_amount, estimated_delivery_time, is_active)
VALUES
    ('antakya', 'Antakya', 'Hatay', 0.00, 75.00, '15-20 dk', true),
    ('defne', 'Defne', 'Hatay', 0.00, 75.00, '15-20 dk', true),
    ('iskenderun', 'İskenderun', 'Hatay', 15.00, 100.00, '20-25 dk', true),
    ('samandag', 'Samandağ', 'Hatay', 25.00, 120.00, '30-35 dk', true),
    ('kirikhan', 'Kırıkhan', 'Hatay', 25.00, 120.00, '30-40 dk', true),
    ('dortyol', 'Dörtyol', 'Hatay', 30.00, 150.00, '35-45 dk', true),
    ('arsuz', 'Arsuz', 'Hatay', 20.00, 120.00, '25-30 dk', true),
    ('reyhanli', 'Reyhanlı', 'Hatay', 30.00, 150.00, '35-45 dk', true)
ON CONFLICT (id) DO UPDATE SET 
    delivery_fee = EXCLUDED.delivery_fee,
    min_basket_amount = EXCLUDED.min_basket_amount,
    estimated_delivery_time = EXCLUDED.estimated_delivery_time;

INSERT INTO public.markets (id, name, district_id, neighborhood, address, is_open, base_delivery_fee, free_delivery_threshold)
VALUES
    ('store-antakya', 'HatayMarket Antakya Merkez', 'antakya', 'Sümerler & Cebrail', 'Harbiye Cad. No: 14 Antakya / Hatay', true, 19.90, 250.00),
    ('store-defne', 'HatayMarket Defne Express', 'defne', 'Armutlu & Çekmece', 'Uğur Mumcu Bulvarı No: 28 Defne / Hatay', true, 19.90, 250.00),
    ('store-iskenderun', 'HatayMarket İskenderun Sahil Dağıtım', 'iskenderun', 'Çay Mahallesi & Sahil Kordonu', 'Atatürk Bulvarı No: 54 İskenderun / Hatay', true, 24.90, 300.00)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

INSERT INTO public.coupons (id, code, description, discount_type, discount_value, min_basket_amount, is_active)
VALUES
    ('c1', 'HOSGELDIN50', '250 TL üzeri siparişlerde anında 50 TL indirim!', 'fixed', 50, 250, true),
    ('c2', 'HATAY10', 'Tüm Hatay siparişlerinde geçerli %10 indirim!', 'percent', 10, 150, true)
ON CONFLICT (id) DO NOTHING;
