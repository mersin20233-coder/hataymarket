import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // Stream binary ZIP with explicit headers and no caching
  app.get('/api/download-android-project', (req, res) => {
    let zipPath = path.resolve(__dirname, 'public', 'hataymarket-android-studio-project.zip');
    let filename = 'hataymarket-android-studio-project.zip';
    if (!fs.existsSync(zipPath)) {
      zipPath = path.resolve(__dirname, 'public', 'qcommerce-android-studio-project.zip');
      filename = 'qcommerce-android-studio-project.zip';
    }
    if (!fs.existsSync(zipPath)) {
      return res.status(404).json({ error: 'Zip dosyası bulunamadı.' });
    }
    const stat = fs.statSync(zipPath);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
    });
    const stream = fs.createReadStream(zipPath);
    stream.pipe(res);
  });

  // Base64 download endpoint for safe client-side Blob generation (100% reliable inside iframes)
  app.get('/api/download-android-base64', (req, res) => {
    try {
      let zipPath = path.resolve(__dirname, 'public', 'hataymarket-android-studio-project.zip');
      let filename = 'hataymarket-android-studio-project.zip';
      if (!fs.existsSync(zipPath)) {
        zipPath = path.resolve(__dirname, 'public', 'qcommerce-android-studio-project.zip');
        filename = 'qcommerce-android-studio-project.zip';
      }
      if (!fs.existsSync(zipPath)) {
        return res.status(404).json({ error: 'Zip dosyası bulunamadı.' });
      }
      const buffer = fs.readFileSync(zipPath);
      res.json({
        filename,
        size: buffer.length,
        base64: buffer.toString('base64'),
        mimeType: 'application/zip',
      });
    } catch (err: any) {
      console.error('Base64 export error:', err);
      res.status(500).json({ error: 'Dosya okunurken hata oluştu.' });
    }
  });

  // Serve persistent uploads
  const uploadsDir = path.resolve(__dirname, 'public', 'uploads', 'products');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads')));

  // Permanent Product Image Upload Endpoint (Camera, Gallery, Drag & Drop)
  app.post('/api/upload-image', (req, res) => {
    try {
      const { imageBase64, filename, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Görsel verisi (imageBase64) zorunludur.' });
      }

      // Extract raw base64 data and determine extension
      let base64Data = imageBase64;
      let ext = 'webp';

      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        const mime = parts[0].split(':')[1] || '';
        base64Data = parts[1];
        if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
        else if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
      } else if (mimeType) {
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
        else if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('webp')) ext = 'webp';
      }

      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > 15 * 1024 * 1024) {
        return res.status(400).json({ error: 'Görsel boyutu 15MB sınırını aşamaz.' });
      }

      const safeUniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const safeFilename = filename
        ? `${path.parse(filename).name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${safeUniqueId}.${ext}`
        : `product_${safeUniqueId}.${ext}`;

      const targetPath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(targetPath, buffer);

      // Return public URL path
      const publicUrl = `/uploads/products/${safeFilename}`;
      return res.json({
        success: true,
        url: publicUrl,
        filename: safeFilename,
        size: buffer.length,
        format: ext,
      });
    } catch (err: any) {
      console.error('Image upload error:', err);
      return res.status(500).json({ error: err.message || 'Görsel kaydedilemedi.' });
    }
  });

  // Recipe to cart AI endpoint
  app.post('/api/ai/recipe-cart', async (req, res) => {
    try {
      const { prompt, products } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Sen bir Getir/Migros hızlı market akıllı sepet asistanısın.
Kullanıcı yemek veya sepet isteği: "${prompt}".
Mevcut market ürün listesi: ${JSON.stringify(products)}.

Lütfen JSON formatında aşağıdaki şemaya tam uygun yanıt ver:
{
  "recipeName": "Yemek veya Sepet Başlığı",
  "description": "Kısa 1-2 cümle açıklama",
  "prepTimeMinutes": 15,
  "servings": 2,
  "matchedProductIds": [
    { "productId": "id", "quantity": 1, "reason": "malzeme açıklaması" }
  ],
  "missingIngredients": []
}
Sadece geçerli JSON döndür, markdown veya ekstra metin ekleme.`,
        });

        const rawText = response.text || '';
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json(parsed);
      } else {
        // Fallback response handled in frontend service
        return res.status(503).json({ error: 'Gemini API key not configured' });
      }
    } catch (err: any) {
      console.error('Error generating recipe cart:', err);
      return res.status(500).json({ error: err.message || 'AI request failed' });
    }
  });
  // Comprehensive AI Shopping Assistant with real DB product matching & price comparison
  app.post('/api/ai/shopping-assistant', async (req, res) => {
    try {
      const { prompt, preference = 'cheapest', preferredStoreName, products = [] } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (ai) {
        const systemPrompt = `Sen "HatayMarket Yapay Zekâlı Alışveriş Asistanı"sın.
Kullanıcının doğal Türkçe talebini analiz et: "${prompt}".
Kullanıcı tercih kriteri: "${preference}" (cheapest: "En Uygun Fiyat - birim fiyata göre en ekonomik", fastest: "En Hızlı Teslimat", preferred_store: "Tercih Ettiğim Market: ${preferredStoreName || 'Antakya Merkez'}").

VERİTABANINDAKİ GERÇEK ÜRÜNLER (Fiyat, Stok ve Gramaj):
${JSON.stringify(products.map((p: any) => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  category: p.category,
  price: p.price,
  originalPrice: p.originalPrice,
  weight: p.weight,
  unit: p.unit,
  stock: p.stock
})))}

KURALLAR:
1. Yalnızca yukarıdaki gerçek ürün listesindeki ürünleri kullan. Asla ürün, marka veya fiyat uydurma.
2. Stokta olmayan veya stoğu 0 olan ürünleri varsayılan olarak seçme.
3. Talebe göre kişi sayısını ve yemek/ihtiyaç malzemelerini belirle.
4. Her malzeme için veritabanındaki eşdeğer veya muadil ürünleri karşılaştır:
   - Gramaj ve fiyat üzerinden birim fiyatı hesapla (TL/kg, TL/litre, TL/adet).
   - "cheapest" seçildiyse birim fiyatı en uygun olanı "selectedProductId" yap ve "isCheapest": true olarak işaretle.
   - Alternatif ürünleri "candidates" dizisinde listele ki müşteri istediğinde markayı değiştirebilsin.
5. Sadece ve sadece geçerli JSON döndür, hiçbir markdown (\`\`\`json vb.) veya ek metin ekleme.

JSON ŞEMASI:
{
  "recipeTitle": "Tarif veya Talep Başlığı",
  "servings": 4,
  "cookingTimeMinutes": 30,
  "summary": "Talebin kısa özeti ve tasarruf analizi",
  "preferenceApplied": "${preference}",
  "estimatedTotal": 0.00,
  "estimatedSavings": 0.00,
  "ingredients": [
    {
      "ingredientName": "Malzeme Adı (örn: Tavuk Kuşbaşı / Göğüs)",
      "requiredQuantity": "600-800 gr",
      "selectedProductId": "prod-...",
      "selectedProductQuantity": 1,
      "comparisonReason": "Birim fiyat karşılaştırması ve seçim gerekçesi",
      "candidates": [
        {
          "productId": "prod-...",
          "name": "...",
          "brand": "...",
          "weight": "...",
          "price": 0.00,
          "unitPriceDisplay": "0.00 ₺/kg",
          "isCheapest": true,
          "inStock": true
        }
      ]
    }
  ],
  "missingIngredients": [],
  "chefTips": "Hatay usulü pişirme önerisi veya püf noktası"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: systemPrompt,
        });

        const rawText = response.text || '';
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json(parsed);
      } else {
        return res.status(503).json({ error: 'Gemini API key not configured' });
      }
    } catch (err: any) {
      console.error('Error in shopping-assistant:', err);
      return res.status(500).json({ error: err.message || 'AI request failed' });
    }
  });

  // Bugün Ne Yapsam? - Yapay Zekâlı Yemek Asistanı Uç Noktası
  app.post('/api/ai/recipe-assistant', async (req, res) => {
    try {
      const {
        servings = 4,
        preference = 'all',
        maxTimeMinutes = 45,
        budgetLevel = 'standard',
        homeIngredients = '',
        catalogRecipes = [],
        products = [],
        userPrompt = ''
      } = req.body;

      if (ai) {
        const systemPrompt = `Sen "HatayMarket - Bugün Ne Yapsam? Akıllı Yemek Asistanı"sın.
Kullanıcının Yemek Kriterleri:
- Kişi Sayısı: ${servings} kişilik
- Yemek Tercihi: "${preference}" (ekonomik, hizli, sebzeli, etli, tavuklu, tatli veya all/tümü)
- Azami Hazırlık + Pişirme Süresi: ${maxTimeMinutes} dakika
- Bütçe Seviyesi: ${budgetLevel}
- Evde Bulunan Malzemeler: "${homeIngredients || 'Belirtilmedi'}"
- Ekstra Kullanıcı Notu/İsteği: "${userPrompt || 'Öneri bekliyor'}"

MEVCUT TARİF KATALOĞU (15 Klasik Türk Yemeği):
${JSON.stringify(catalogRecipes.map((r: any) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  prepTimeMinutes: r.prepTimeMinutes,
  cookTimeMinutes: r.cookTimeMinutes,
  dietary: r.dietary,
  ingredients: r.ingredients
})))}

MARKET GERÇEK ÜRÜNLERİ:
${JSON.stringify(products.map((p: any) => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  price: p.price,
  weight: p.weight,
  unit: p.unit,
  stock: p.stock
})))}

GÖREVLER:
1. Kullanıcının kriterlerine (kişi sayısı, evdeki malzemeler, süre, bütçe) en uygun tarifi katalogdan seç. Katalogda uygun olan yoksa yeni bir tarif öner.
2. Tüm malzeme miktarlarını tam ${servings} kişilik porsiyona göre ölçekle.
3. Evde bulunan malzemeleri ("${homeIngredients}") analiz et:
   - Kullanıcının evinde olan malzemeleri "isHaveAtHome": true olarak işaretle.
   - Eksik malzemeleri "isHaveAtHome": false olarak belirle ve marketteki gerçek ürünle (productId) eşleştir.
4. Asla gerçekte olmayan ürün veya fiyat uydurma.
5. Sadece ve sadece geçerli JSON döndür, hiçbir markdown veya ek metin ekleme.

JSON ŞEMASI:
{
  "selectedRecipeId": "rec-...",
  "recipeTitle": "Tarif Adı",
  "category": "Kategori",
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 25,
  "servings": ${servings},
  "recommendationReason": "Neden bu yemeğin önerildiğinin kısa açıklaması",
  "summary": "Tarifin lezzet özeti",
  "ingredientsAnalysis": [
    {
      "name": "Malzeme Adı",
      "requiredAmountDisplay": "Örn: 240 gr",
      "isHaveAtHome": false,
      "matchedProductId": "prod-...",
      "quantityToBuy": 1,
      "estimatedCost": 0.00
    }
  ],
  "homeIngredientsFound": ["Evde bulunan malzeme isimleri"],
  "missingIngredients": ["Satın alınması gereken eksik malzemeler"],
  "totalEstimatedCost": 0.00,
  "chefTip": "Hatay usulü pişirme püf noktası",
  "steps": ["Adım 1...", "Adım 2..."]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: systemPrompt,
        });

        const rawText = response.text || '';
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json(parsed);
      } else {
        return res.status(503).json({ error: 'Gemini API key not configured' });
      }
    } catch (err: any) {
      console.error('Error in recipe-assistant:', err);
      return res.status(500).json({ error: err.message || 'AI recipe assistant failed' });
    }
  });
  // Attach Vite middleware in dev or serve dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Q-Commerce Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
