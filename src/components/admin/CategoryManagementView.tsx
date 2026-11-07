import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryItem } from '../../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const CategoryManagementView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories, products } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [iconEmoji, setIconEmoji] = useState('🍎');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');

  // Sort categories by displayOrder
  const sortedCategories = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const handleOpenModal = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setIconEmoji(cat.iconEmoji || '📦');
      setImage(cat.image);
      setDisplayOrder(cat.displayOrder || 1);
      setIsActive(cat.isActive !== false);
      setSubcategories(cat.subcategories || []);
    } else {
      setEditingCategory(null);
      setName('');
      setIconEmoji('🛒');
      setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');
      setDisplayOrder(categories.length + 1);
      setIsActive(true);
      setSubcategories(['Genel']);
    }
    setNewSubcategoryInput('');
    setIsModalOpen(true);
  };

  const handleAddSubcategory = () => {
    if (!newSubcategoryInput.trim()) return;
    if (!subcategories.includes(newSubcategoryInput.trim())) {
      setSubcategories((prev) => [...prev, newSubcategoryInput.trim()]);
    }
    setNewSubcategoryInput('');
  };

  const handleRemoveSubcategory = (sub: string) => {
    setSubcategories((prev) => prev.filter((s) => s !== sub));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen kategori adını giriniz.');
      return;
    }

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: name.trim(),
        iconEmoji: iconEmoji.trim() || '📦',
        image: image.trim(),
        displayOrder: Number(displayOrder),
        isActive,
        subcategories,
      });
    } else {
      await addCategory({
        name: name.trim(),
        iconEmoji: iconEmoji.trim() || '📦',
        image: image.trim(),
        displayOrder: Number(displayOrder),
        isActive,
        subcategories,
        itemCount: 0,
      });
    }

    setIsModalOpen(false);
  };

  // Move category up
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const currentList = [...sortedCategories];
    const temp = currentList[index];
    currentList[index] = currentList[index - 1];
    currentList[index - 1] = temp;
    await reorderCategories(currentList.map((c) => c.id));
  };

  // Move category down
  const handleMoveDown = async (index: number) => {
    if (index === sortedCategories.length - 1) return;
    const currentList = [...sortedCategories];
    const temp = currentList[index];
    currentList[index] = currentList[index + 1];
    currentList[index + 1] = temp;
    await reorderCategories(currentList.map((c) => c.id));
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">
            Kategori ve Sıralama Yönetimi ({categories.length} Kategori)
          </h3>
          <p className="text-xs text-slate-500">
            Kategorilerin sırasını yukarı/aşağı butonlarıyla değiştirin; mobil uygulamanın ana sayfasında aynı sırayla gösterilir.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00875A] hover:bg-[#006D48] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Category List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center">Mobil Sıra</th>
                <th className="py-3 px-4">Kategori &amp; Görsel</th>
                <th className="py-3 px-3">Alt Kategoriler</th>
                <th className="py-3 px-3 text-center">Katalog Ürünü</th>
                <th className="py-3 px-3">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCategories.map((cat, index) => {
                const productCount = products.filter((p) => p.category === cat.name).length;

                return (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-mono font-black text-slate-500">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900">{cat.displayOrder || index + 1}</span>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === sortedCategories.length - 1}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 right-0 text-[10px] bg-white/90 px-0.5 rounded-tl">
                            {cat.iconEmoji}
                          </span>
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{cat.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(cat.subcategories || []).slice(0, 4).map((sub, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                        {(cat.subcategories || []).length > 4 && (
                          <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold">
                            +{(cat.subcategories || []).length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#00875A] border border-emerald-200 rounded-lg text-xs font-extrabold font-mono">
                        {productCount} ürün
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => updateCategory(cat.id, { isActive: !cat.isActive })}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          cat.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title="Aktif/Pasif Değiştir"
                      >
                        {cat.isActive !== false ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-500" />
                            <span>Gizli</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Düzenle</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`"${cat.name}" kategorisini silmek istediğinize emin misiniz?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-sm text-slate-900">
                {editingCategory ? `Kategoriyi Düzenle: ${editingCategory.name}` : 'Yeni Kategori Tanımla'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Meyve ve Sebze, Kişisel Bakım"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] focus:bg-white text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emoji / İkon</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={iconEmoji}
                    onChange={(e) => setIconEmoji(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] text-base text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ana Sayfa Sırası</label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Görsel URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] text-xs font-mono"
                />
              </div>

              {/* Subcategories tag management */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="block font-bold text-slate-700">Alt Kategoriler</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Yeni alt kategori (Örn: Domates, Elma)"
                    value={newSubcategoryInput}
                    onChange={(e) => setNewSubcategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00875A] text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    + Ekle
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                  {subcategories.map((sub, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(sub)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold rounded-xl transition-all shadow-xs"
                >
                  {editingCategory ? 'Kaydet' : 'Kategoriyi Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
