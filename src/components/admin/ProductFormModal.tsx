import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductVariation } from '../../types';
import {
  X,
  Camera,
  Upload,
  RotateCw,
  Crop,
  Trash2,
  Sparkles,
  Barcode,
  DollarSign,
  Boxes,
  Layers,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { handleImageError } from '../../utils/imageFallback';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { createProduct, editProduct, categories, stores, currentUser } = useApp();

  const isEditMode = !!productToEdit;

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Meyve ve Sebze');
  const [subcategory, setSubcategory] = useState('Sebzeler');
  const [brand, setBrand] = useState('HatayMarket');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState<number>(35.0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [costPrice, setCostPrice] = useState<number | undefined>(undefined);
  const [vatRate, setVatRate] = useState<number>(1);
  const [stock, setStock] = useState<number>(20);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [unit, setUnit] = useState<string>('adet');
  const [weight, setWeight] = useState<string>('1 adet');
  const [status, setStatus] = useState<'active' | 'passive'>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isCampaign, setIsCampaign] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(10);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');

  // Images State
  const [mainImage, setMainImage] = useState<string>('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  // Variations State
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState<number>(0);
  const [newVarStock, setNewVarStock] = useState<number>(10);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'stock' | 'media' | 'labels' | 'variations'>('general');

  // File Inputs
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset when productToEdit changes
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setCategory(productToEdit.category || 'Meyve ve Sebze');
      setSubcategory(productToEdit.subcategory || 'Genel');
      setBrand(productToEdit.brand || 'HatayMarket');
      setBarcode(productToEdit.barcode || '');
      setPrice(productToEdit.price || 0);
      setOriginalPrice(productToEdit.originalPrice);
      setCostPrice(productToEdit.costPrice);
      setVatRate(productToEdit.vatRate !== undefined ? productToEdit.vatRate : 1);
      setStock(productToEdit.stock || 0);
      setMinStockAlert(productToEdit.minStockAlert !== undefined ? productToEdit.minStockAlert : 5);
      setUnit(productToEdit.unit || 'adet');
      setWeight(productToEdit.weight || '1 adet');
      setStatus(productToEdit.status || 'active');
      setIsFeatured(!!(productToEdit.isFeatured || productToEdit.isPopular));
      setIsCampaign(!!productToEdit.isCampaign);
      setIsNew(!!productToEdit.isNew);
      setIsBestseller(!!productToEdit.isBestseller);
      setDisplayOrder(productToEdit.displayOrder || 10);
      setSelectedStoreId(productToEdit.storeId || 'all');
      setMainImage(productToEdit.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');
      setGalleryImages(productToEdit.galleryImages || []);
      setVariations(productToEdit.variations || []);
    } else {
      // Default new product values
      setName('');
      setDescription('');
      setCategory('Meyve ve Sebze');
      setSubcategory('Sebzeler');
      setBrand('HatayMarket');
      setBarcode(`869${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setPrice(35.0);
      setOriginalPrice(undefined);
      setCostPrice(undefined);
      setVatRate(1);
      setStock(20);
      setMinStockAlert(5);
      setUnit('adet');
      setWeight('1 adet');
      setStatus('active');
      setIsFeatured(false);
      setIsCampaign(false);
      setIsNew(true);
      setIsBestseller(false);
      setDisplayOrder(10);
      setSelectedStoreId('all');
      setMainImage('https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80');
      setGalleryImages([]);
      setVariations([]);
    }
    setImageRotation(0);
    setFeedback(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Selected category subcategories
  const currentCategoryObj = categories.find((c) => c.name === category);
  const availableSubcategories = currentCategoryObj?.subcategories || [
    'Genel',
    'Taze Ürünler',
    'Organik',
    'Yöresel',
  ];

  // Barcode generator
  const handleGenerateBarcode = () => {
    const randomEan = `869${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setBarcode(randomEan);
  };

  // Image Upload Handler (Permanent upload to server endpoint /api/upload-image)
  const handleUploadFile = async (file: File, isGallery: boolean = false) => {
    if (!file) return;

    // Check size (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      setFeedback({ msg: 'Görsel dosya boyutu 12MB sınırından küçük olmalıdır.', isError: true });
      return;
    }

    // Check format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setFeedback({ msg: 'Sadece JPG, JPEG, PNG veya WEBP formatları desteklenmektedir.', isError: true });
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(15);

    try {
      // Read as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Str = e.target?.result as string;
        setUploadProgress(50);

        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Str,
              filename: file.name,
              mimeType: file.type,
            }),
          });

          setUploadProgress(85);
          const data = await res.json();

          if (res.ok && data.url) {
            setUploadProgress(100);
            if (isGallery) {
              setGalleryImages((prev) => [...prev, data.url]);
            } else {
              setMainImage(data.url);
              setImageRotation(0);
            }
            setFeedback({ msg: 'Görsel başarıyla kalıcı olarak yüklendi.', isError: false });
          } else {
            // Fallback to client-side data URL if server fails
            if (isGallery) {
              setGalleryImages((prev) => [...prev, base64Str]);
            } else {
              setMainImage(base64Str);
            }
            setFeedback({ msg: 'Görsel yerel olarak eklendi.', isError: false });
          }
        } catch (err) {
          // Fallback
          if (isGallery) {
            setGalleryImages((prev) => [...prev, base64Str]);
          } else {
            setMainImage(base64Str);
          }
        } finally {
          setIsUploadingImage(false);
          setTimeout(() => setUploadProgress(0), 1000);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingImage(false);
      setFeedback({ msg: 'Görsel okunurken bir hata oluştu: ' + err.message, isError: true });
    }
  };

  // Rotate image by 90 degrees
  const handleRotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  // Add variation
  const handleAddVariation = () => {
    if (!newVarName.trim() || newVarPrice <= 0) {
      alert('Lütfen varyasyon adı ve geçerli fiyat giriniz.');
      return;
    }
    const newVar: ProductVariation = {
      id: `var-${Date.now()}`,
      name: newVarName.trim(),
      price: newVarPrice,
      stock: newVarStock,
    };
    setVariations((prev) => [...prev, newVar]);
    setNewVarName('');
    setNewVarPrice(price);
    setNewVarStock(10);
  };

  // Submit Product Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setActiveTab('general');
      setFeedback({ msg: 'Lütfen ürün adını doldurunuz.', isError: true });
      return;
    }

    if (price <= 0) {
      setActiveTab('pricing');
      setFeedback({ msg: 'Ürün fiyatı 0\'dan büyük olmalıdır.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const productPayload: Omit<Product, 'id'> = {
      name: name.trim(),
      description: description.trim() || `${brand} ${name.trim()}`,
      category,
      subcategory,
      brand: brand.trim(),
      barcode: barcode.trim() || `869${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      price: Number(price),
      originalPrice: originalPrice && originalPrice > price ? Number(originalPrice) : undefined,
      costPrice: costPrice && costPrice > 0 ? Number(costPrice) : undefined,
      vatRate: Number(vatRate),
      stock: Math.max(0, Number(stock)),
      minStockAlert: Number(minStockAlert),
      unit,
      weight: weight.trim(),
      image: mainImage,
      galleryImages,
      variations: variations.length > 0 ? variations : undefined,
      status,
      isPopular: isFeatured,
      isFeatured,
      isCampaign,
      isNew,
      isBestseller,
      displayOrder: Number(displayOrder),
      storeId: selectedStoreId !== 'all' ? selectedStoreId : undefined,
      storeIds: selectedStoreId !== 'all' ? [selectedStoreId] : stores.map((s) => s.id),
      tags: [category, brand, subcategory],
      createdAt: productToEdit?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    try {
      if (isEditMode && productToEdit) {
        const res = await editProduct(productToEdit.id, productPayload);
        if (res.success) {
          setFeedback({ msg: 'Ürün başarıyla güncellendi ve Firestore senkronize edildi.', isError: false });
          setTimeout(() => onClose(), 800);
        } else {
          setFeedback({ msg: res.message, isError: true });
        }
      } else {
        const res = await createProduct(productPayload);
        if (res.success) {
          setFeedback({ msg: 'Yeni ürün veritabanına kaydedildi ve mobil uygulamada satışa açıldı!', isError: false });
          setTimeout(() => onClose(), 800);
        } else {
          setFeedback({ msg: res.message, isError: true });
        }
      }
    } catch (err: any) {
      setFeedback({ msg: 'İşlem başarısız: ' + (err?.message || 'Bilinmeyen hata'), isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00875A] text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  {isEditMode ? `Ürünü Düzenle: ${productToEdit?.name}` : 'Yeni Market Ürünü Ekle'}
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {status === 'active' ? 'Satışta (Aktif)' : 'Gizli (Pasif)'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tüm değişiklikler anında Cloud Firestore'a kaydedilir ve mobil müşterilere canlı yansır.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-2 border-b border-slate-200 bg-white overflow-x-auto text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general' ? 'border-[#00875A] text-[#00875A]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            1. Temel Bilgiler
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pricing' ? 'border-[#00875A] text-[#00875A]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            2. Fiyat &amp; KDV
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stock' ? 'border-[#00875A] text-[#00875A]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            3. Stok &amp; Birim
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'media' ? 'border-[#00875A] text-[#00875A]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            4. Görseller &amp; Kamera
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('labels')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'labels' ? 'border-[#00875A] text-[#00875A]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            5. Etiket &amp; Market
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('variations')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'variations' ? 'border-[#00875A] text-[#00875A]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            6. Varyasyonlar ({variations.length})
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`mx-5 mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ürün Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Taze Salkım Domates, Erikli Su 1.5L, Çaykur Tiryaki Çay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ana Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      const catObj = categories.find((c) => c.name === e.target.value);
                      if (catObj && catObj.subcategories.length > 0) {
                        setSubcategory(catObj.subcategories[0]);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.iconEmoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alt Kategori
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs"
                  >
                    {availableSubcategories.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marka</label>
                  <input
                    type="text"
                    placeholder="Örn: Sütaş, Çaykur, Tat, Hatay Yöresel"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Barkod (EAN-13)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Örn: 8690123456789"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer shrink-0"
                      title="Yeni Rastgele Barkod Üret"
                    >
                      <Barcode className="w-4 h-4 inline mr-1" />
                      Üret
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ürün Açıklaması</label>
                <textarea
                  rows={3}
                  placeholder="Ürün içeriği, taze toplandığı bölge, saklama koşulları veya besin değerleri..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & VAT */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Satış Fiyatı (₺) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₺</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Müşterinin ödeyeceği güncel satış tutarı</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    İndirimsiz / Üstü Çizili Fiyat (₺)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Örn: 45.00"
                      value={originalPrice !== undefined ? originalPrice : ''}
                      onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-mono"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₺</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Satış fiyatından yüksekse indirim rozeti gösterilir</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alış / Tedarik Maliyeti (₺)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Örn: 22.50"
                      value={costPrice !== undefined ? costPrice : ''}
                      onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-mono"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₺</span>
                  </div>
                  {costPrice && costPrice > 0 && price > 0 && (
                    <div className="mt-1 text-[10px] font-bold text-emerald-700">
                      Tahmini Kâr: +{(price - costPrice).toFixed(2)} ₺ (%{(((price - costPrice) / costPrice) * 100).toFixed(0)} kâr marjı)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">KDV Oranı (%)</label>
                  <select
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-bold"
                  >
                    <option value={1}>%1 (Temel Gıda / Ekmek / Bakliyat / Sebze)</option>
                    <option value={10}>%10 (Gıda &amp; İçecek Genel)</option>
                    <option value={20}>%20 (Temizlik, Kişisel Bakım, Genel Ticari)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOCK & UNIT */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mevcut Depo Stoğu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Stok 0 olduğunda mobil uygulamada "Tükendi" görünür.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kritik Stok Uyarı Miktarı
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Stok bu sayının altına düştüğünde sarı uyarı verir.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ürün Birimi</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs"
                  >
                    <option value="adet">adet</option>
                    <option value="kg">kg (Kilogram)</option>
                    <option value="gram">gram</option>
                    <option value="litre">litre</option>
                    <option value="ml">ml (Mililitre)</option>
                    <option value="paket">paket</option>
                    <option value="koli">koli</option>
                    <option value="teneke">teneke</option>
                    <option value="kavanoz">kavanoz</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ağırlık / Hacim Metni
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: 1 kg, 500 gr, 6 x 1.5 Litre, 830 gr"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Müşterinin ürün kartında gördüğü gramaj ibaresi</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & CAMERA UPLOAD */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Main Photo Preview & Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="relative group shrink-0">
                  <img
                    src={mainImage}
                    alt={name || 'Önizleme'}
                    style={{ transform: `rotate(${imageRotation}deg)` }}
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-white shadow-md bg-white transition-transform duration-200"
                    onError={(e) => handleImageError(e, category)}
                  />
                  {imageRotation !== 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#00875A] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                      {imageRotation}°
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="font-extrabold text-sm text-slate-800">
                    Ana Ürün Görseli
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Telefon kamerasını açarak canlı fotoğraf çekebilir, galerinizden seçebilir veya bilgisayardan yükleyebilirsiniz.
                  </p>

                  {/* Upload Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                    {/* Camera Capture Button */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00875A] hover:bg-[#006D48] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Kamera ile Çek</span>
                    </button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadFile(e.target.files[0], false);
                        }
                      }}
                      className="hidden"
                    />

                    {/* Gallery / Desktop File Picker */}
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Galeri / Dosya Seç</span>
                    </button>
                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadFile(e.target.files[0], false);
                        }
                      }}
                      className="hidden"
                    />

                    {/* Rotate 90deg */}
                    <button
                      type="button"
                      onClick={handleRotateImage}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                      title="Fotoğrafı 90° Sağa Döndür"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Döndür</span>
                    </button>
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploadingImage && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#00875A] font-bold">
                        <span>Görsel Sunucuya Kaydediliyor...</span>
                        <span>%{uploadProgress}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00875A] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Image URL input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Veya Doğrudan Görsel Web Adresi (URL) Girin:
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-mono text-slate-700"
                />
              </div>

              {/* Gallery Images List */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    Ek Görseller / Ürün Galerisi ({galleryImages.length})
                  </span>
                  <label className="text-[11px] font-bold text-[#00875A] hover:underline cursor-pointer flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>Ek Görsel Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach((file) => handleUploadFile(file, true));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {galleryImages.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    Henüz ek galeri görseli yüklenmedi.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {galleryImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                        <img src={imgUrl} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LABELS & STORES */}
          {activeTab === 'labels' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ürün Satış Durumu</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      status === 'active'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Aktif (Satışta)</div>
                      <div className="text-[10px] text-slate-500 font-normal">Müşteriler ürünü görüp sepete ekleyebilir</div>
                    </div>
                    {status === 'active' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('passive')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      status === 'passive'
                        ? 'bg-slate-100 border-slate-400 text-slate-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Pasif (Gizli)</div>
                      <div className="text-[10px] text-slate-500 font-normal">Müşteri uygulamasından tamamen gizlenir</div>
                    </div>
                    {status === 'passive' && <Check className="w-4 h-4 text-slate-700" />}
                  </button>
                </div>
              </div>

              {/* Marketing Badges & Flags */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Pazarlama ve Öne Çıkarma Etiketleri</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-[#00875A] rounded"
                    />
                    <span className="font-bold text-xs text-slate-800">Öne Çıkan</span>
                  </label>

                  <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={isCampaign}
                      onChange={(e) => setIsCampaign(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="font-bold text-xs text-amber-900">Kampanyalı</span>
                  </label>

                  <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-bold text-xs text-blue-900">Yeni Ürün</span>
                  </label>

                  <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={(e) => setIsBestseller(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="font-bold text-xs text-purple-900">Çok Satan</span>
                  </label>
                </div>
              </div>

              {/* Target Store & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Satışa Sunulacağı Market Şubesi
                  </label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-semibold"
                  >
                    <option value="all">Tüm Hatay Şubeleri (Genel Katalog)</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sıralama Numarası (Öncelik)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Küçük sayılar kategoride en üstte gösterilir.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VARIATIONS */}
          {activeTab === 'variations' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="font-bold text-slate-800 block mb-1">
                  Yeni Varyasyon Ekle (Gramaj / Boyut)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Varyasyon adı (Örn: 500 gr, 2.5 kg)"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Fiyat (₺)"
                    value={newVarPrice || ''}
                    onChange={(e) => setNewVarPrice(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="px-3 py-2 bg-[#00875A] hover:bg-[#006D48] text-white rounded-xl font-bold transition-all cursor-pointer text-xs"
                  >
                    + Ekle
                  </button>
                </div>
              </div>

              {/* Variations list */}
              {variations.length === 0 ? (
                <p className="text-slate-400 italic text-center py-6">
                  Bu ürün için tanımlanmış ek varyasyon bulunmuyor.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[9px] font-bold">
                      <tr>
                        <th className="py-2 px-3">Varyasyon Adı</th>
                        <th className="py-2 px-3">Fiyat</th>
                        <th className="py-2 px-3">Stok</th>
                        <th className="py-2 px-3 text-right">Sil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {variations.map((v) => (
                        <tr key={v.id}>
                          <td className="py-2 px-3 font-bold text-slate-800">{v.name}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{v.price.toFixed(2)} ₺</td>
                          <td className="py-2 px-3 font-mono">{v.stock}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setVariations((prev) => prev.filter((item) => item.id !== v.id))}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Form Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:bg-slate-300"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Firestore'a Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditMode ? 'Değişiklikleri Kaydet' : 'Ürünü Satışa Aç & Kaydet'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
