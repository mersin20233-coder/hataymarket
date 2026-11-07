import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

interface BulkProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  rowNum: number;
  barcode: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  vatRate?: number;
  stock: number;
  minStockAlert?: number;
  unit: string;
  weight: string;
  image: string;
  status: 'active' | 'passive';
  description: string;
  isValid: boolean;
  errors: string[];
}

export const BulkProductImportModal: React.FC<BulkProductImportModalProps> = ({ isOpen, onClose }) => {
  const { bulkImportProducts, categories } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'invalid'>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  // 1. Download formatted Excel template (.xlsx)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Barkod': '8690123456701',
        'Urun_Adi': 'Hatay Taze Nar Ekşisi (Örnek)',
        'Kategori': 'Temel Gıda',
        'Alt_Kategori': 'Yöresel Hatay',
        'Marka': 'HatayMarket Yöresel',
        'Fiyat': 85.00,
        'Indirimli_Fiyat': 75.00,
        'Alis_Fiyati': 50.00,
        'KDV_Orani': 1,
        'Stok': 50,
        'Min_Stok_Uyari': 5,
        'Birim': 'şişe',
        'Agirlik_Gramaj': '350 ml',
        'Gorsel_URL': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
        'Durum': 'active',
        'Aciklama': '%100 doğal katkısız geleneksel Antakya nar ekşisi.',
      },
      {
        'Barkod': '8690123456702',
        'Urun_Adi': 'Antakya Sünme Peyniri (Örnek)',
        'Kategori': 'Süt ve Süt Ürünleri',
        'Alt_Kategori': 'Peynir',
        'Marka': 'Antakya Süt',
        'Fiyat': 120.00,
        'Indirimli_Fiyat': 110.00,
        'Alis_Fiyati': 80.00,
        'KDV_Orani': 1,
        'Stok': 30,
        'Min_Stok_Uyari': 5,
        'Birim': 'paket',
        'Agirlik_Gramaj': '500 gr',
        'Gorsel_URL': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
        'Durum': 'active',
        'Aciklama': 'Taze inek sütünden geleneksel yöntemlerle üretilmiş tuzsuz sünme peyniri.',
      },
      {
        'Barkod': '8690123456703',
        'Urun_Adi': 'Doğal Samandağ Biberi (Örnek)',
        'Kategori': 'Meyve ve Sebze',
        'Alt_Kategori': 'Sebzeler',
        'Marka': 'Samandağ Çiftliği',
        'Fiyat': 45.00,
        'Indirimli_Fiyat': '',
        'Alis_Fiyati': 25.00,
        'KDV_Orani': 1,
        'Stok': 40,
        'Min_Stok_Uyari': 10,
        'Birim': 'kg',
        'Agirlik_Gramaj': '1 kg',
        'Gorsel_URL': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80',
        'Durum': 'active',
        'Aciklama': 'Tescilli coğrafi işaretli acı Samandağ köy biberi.',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Urunler');

    // Auto column widths
    const colWidths = [
      { wch: 16 }, // Barkod
      { wch: 30 }, // Urun_Adi
      { wch: 22 }, // Kategori
      { wch: 18 }, // Alt_Kategori
      { wch: 20 }, // Marka
      { wch: 12 }, // Fiyat
      { wch: 15 }, // Indirimli_Fiyat
      { wch: 12 }, // Alis_Fiyati
      { wch: 10 }, // KDV_Orani
      { wch: 10 }, // Stok
      { wch: 14 }, // Min_Stok_Uyari
      { wch: 10 }, // Birim
      { wch: 15 }, // Agirlik_Gramaj
      { wch: 35 }, // Gorsel_URL
      { wch: 10 }, // Durum
      { wch: 35 }, // Aciklama
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, 'hataymarket_urun_yukleme_sablonu.xlsx');
  };

  // 2. Parse uploaded Excel or CSV file
  const handleFileProcess = (file: File) => {
    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('Seçilen dosyada ürün satırı bulunamadı.');
          return;
        }

        // Validate each row
        const validatedRows: ParsedRow[] = rawJson.map((row, index) => {
          const errors: string[] = [];

          // Column name fallbacks
          const name = String(row['Urun_Adi'] || row['Ürün Adı'] || row['UrunAdi'] || row['name'] || '').trim();
          const category = String(row['Kategori'] || row['category'] || 'Meyve ve Sebze').trim();
          const subcategory = String(row['Alt_Kategori'] || row['Alt Kategori'] || row['subcategory'] || 'Genel').trim();
          const brand = String(row['Marka'] || row['brand'] || 'HatayMarket').trim();
          const barcode = String(row['Barkod'] || row['barcode'] || '').trim();

          const priceNum = parseFloat(String(row['Fiyat'] || row['price'] || '0').replace(',', '.'));
          const origPriceNum = parseFloat(String(row['Indirimli_Fiyat'] || row['originalPrice'] || row['Eski Fiyat'] || '0').replace(',', '.'));
          const costPriceNum = parseFloat(String(row['Alis_Fiyati'] || row['costPrice'] || row['Maliyet'] || '0').replace(',', '.'));
          const vatNum = parseFloat(String(row['KDV_Orani'] || row['vatRate'] || row['KDV'] || '1').replace(',', '.'));
          const stockNum = parseInt(String(row['Stok'] || row['stock'] || '10'), 10);
          const minStockNum = parseInt(String(row['Min_Stok_Uyari'] || row['minStockAlert'] || '5'), 10);

          const unit = String(row['Birim'] || row['unit'] || 'adet').trim().toLowerCase();
          const weight = String(row['Agirlik_Gramaj'] || row['Gramaj'] || row['weight'] || '1 adet').trim();
          const image = String(row['Gorsel_URL'] || row['image'] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80').trim();
          const status = String(row['Durum'] || row['status'] || 'active').trim().toLowerCase() === 'passive' ? 'passive' : 'active';
          const description = String(row['Aciklama'] || row['Açıklama'] || row['description'] || `${brand} ${name}`).trim();

          // Validation rules
          if (!name) errors.push('Ürün adı boş olamaz');
          if (isNaN(priceNum) || priceNum <= 0) errors.push('Satış fiyatı 0\'dan büyük bir sayı olmalıdır');
          if (isNaN(stockNum) || stockNum < 0) errors.push('Stok negatif olamaz');
          if (!barcode) {
            // Optional warning, but barcode is recommended
          }

          return {
            rowNum: index + 2, // 1 is header
            barcode: barcode || `869${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            name,
            category,
            subcategory,
            brand,
            price: isNaN(priceNum) ? 0 : priceNum,
            originalPrice: !isNaN(origPriceNum) && origPriceNum > 0 ? origPriceNum : undefined,
            costPrice: !isNaN(costPriceNum) && costPriceNum > 0 ? costPriceNum : undefined,
            vatRate: isNaN(vatNum) ? 1 : vatNum,
            stock: isNaN(stockNum) ? 0 : stockNum,
            minStockAlert: isNaN(minStockNum) ? 5 : minStockNum,
            unit: unit || 'adet',
            weight: weight || '1 adet',
            image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
            status,
            description,
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedRows(validatedRows);
      } catch (err: any) {
        console.error('File parsing error:', err);
        alert('Dosya okunurken bir hata oluştu: ' + (err?.message || 'Geçersiz format'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const invalidRows = parsedRows.filter(r => !r.isValid);

  const displayedRows = filterView === 'all'
    ? parsedRows
    : filterView === 'valid'
      ? validRows
      : invalidRows;

  // 3. Confirm and commit valid products to Firestore
  const handleCommitImport = async () => {
    if (validRows.length === 0) {
      alert('Yüklenecek geçerli ürün bulunamadı. Lütfen hatalı satırları düzeltip tekrar deneyin.');
      return;
    }

    setIsImporting(true);
    try {
      const productsToCreate: Omit<Product, 'id'>[] = validRows.map(r => ({
        name: r.name,
        category: r.category,
        subcategory: r.subcategory,
        brand: r.brand,
        barcode: r.barcode,
        price: r.price,
        originalPrice: r.originalPrice,
        costPrice: r.costPrice,
        vatRate: r.vatRate,
        stock: r.stock,
        minStockAlert: r.minStockAlert,
        unit: r.unit,
        weight: r.weight,
        image: r.image,
        status: r.status,
        description: r.description,
        isPopular: false,
        tags: [r.category, r.brand],
      }));

      const res = await bulkImportProducts(productsToCreate);
      setImportResult({
        imported: res.importedCount,
        errors: res.errors,
      });

      if (res.errors.length === 0 && invalidRows.length === 0) {
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      alert('Yükleme sırasında hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#00875A] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Excel &amp; CSV ile Toplu Ürün Yükleme
              </h3>
              <p className="text-xs text-slate-500">
                Yüzlerce ürünü şablon ile tek tıkla veritabanına aktarın ve satışa açın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Örnek Excel Şablonunu İndir"
            >
              <Download className="w-3.5 h-3.5 text-[#00875A]" />
              <span>Örnek Şablonu İndir (.xlsx)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Top Banner on Mobile for Template Download */}
          <div className="sm:hidden flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#00875A]" />
              <span className="font-bold text-xs text-emerald-950">Örnek Excel Şablonu</span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-2.5 py-1 bg-[#00875A] text-white rounded-lg text-[11px] font-bold"
            >
              İndir (.xlsx)
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#00875A] bg-emerald-50/60 scale-[1.01]'
                : parsedRows.length > 0
                  ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#00875A] flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-800">
                {fileName ? fileName : 'Excel veya CSV dosyanızı buraya sürükleyin veya seçin'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Desteklenen formatlar: <b className="text-slate-700">.xlsx, .xls, .csv</b> (Maksimum 5.000 satır)
              </p>
            </div>
            {fileName && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-1">
                Yeniden dosya seçmek için tıklayın
              </span>
            )}
          </div>

          {/* Validation Summary Cards */}
          {parsedRows.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setFilterView('all')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  filterView === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Toplam Okunan Satır</div>
                <div className="text-xl font-extrabold mt-0.5">{parsedRows.length}</div>
              </div>

              <div
                onClick={() => setFilterView('valid')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  filterView === 'valid'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Hatasız / Geçerli</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl font-extrabold mt-0.5">{validRows.length}</div>
              </div>

              <div
                onClick={() => setFilterView('invalid')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  filterView === 'invalid'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Hatalı Satır</span>
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-xl font-extrabold mt-0.5">{invalidRows.length}</div>
              </div>
            </div>
          )}

          {/* Success / Result Feedback */}
          {importResult && (
            <div className={`p-4 rounded-2xl border ${
              importResult.errors.length === 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center gap-2 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{importResult.imported} adet ürün başarıyla Firestore veritabanına aktarıldı ve mobil uygulamada yayına alındı!</span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-2 text-xs text-rose-700 space-y-1">
                  <p className="font-bold">Bazı satırlar aktarılamadı:</p>
                  {importResult.errors.map((e, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <div className="font-bold text-slate-700">
                  Önizleme Listesi ({displayedRows.length} satır görüntüleniyor)
                </div>
                <div className="text-[11px] text-slate-500">
                  {invalidRows.length > 0 && (
                    <span className="text-rose-600 font-bold">
                      ⚠️ {invalidRows.length} hatalı satır aktarılmayacaktır.
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] font-extrabold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Satır</th>
                      <th className="py-2 px-3">Durum</th>
                      <th className="py-2 px-3">Barkod</th>
                      <th className="py-2 px-3">Ürün Adı</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3">Marka</th>
                      <th className="py-2 px-3 text-right">Fiyat</th>
                      <th className="py-2 px-3 text-right">Stok</th>
                      <th className="py-2 px-3">KDV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedRows.map((r) => (
                      <tr
                        key={r.rowNum}
                        className={!r.isValid ? 'bg-rose-50/70 text-rose-900' : 'hover:bg-slate-50'}
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-500">#{r.rowNum}</td>
                        <td className="py-2 px-3">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Geçerli</span>
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-200 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Hatalı</span>
                              </span>
                              <div className="text-[10px] text-rose-700 font-medium">
                                {r.errors.join(', ')}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono">{r.barcode}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{r.name}</td>
                        <td className="py-2 px-3 text-slate-600">{r.category}</td>
                        <td className="py-2 px-3 text-slate-500">{r.brand}</td>
                        <td className="py-2 px-3 font-mono font-bold text-right tabular-nums text-slate-900">
                          {r.price.toFixed(2)} ₺
                        </td>
                        <td className="py-2 px-3 font-mono text-right tabular-nums">
                          {r.stock} {r.unit}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">%{r.vatRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            {validRows.length > 0 ? (
              <span>
                <b className="text-emerald-700 font-extrabold">{validRows.length}</b> geçerli ürün Firestore buluta kaydedilmeye hazır.
              </span>
            ) : (
              'İçeri aktarmak için geçerli bir Excel veya CSV dosyası yükleyin.'
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs transition-colors cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              onClick={handleCommitImport}
              disabled={validRows.length === 0 || isImporting}
              className="px-5 py-2 bg-[#00875A] hover:bg-[#006D48] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Veritabanına Aktarılıyor...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>{validRows.length} Geçerli Ürünü İçe Aktar</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
