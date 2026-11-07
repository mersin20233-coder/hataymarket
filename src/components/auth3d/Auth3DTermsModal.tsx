import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface Auth3DTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'kvkk' | 'terms' | 'privacy';
}

export const Auth3DTermsModal: React.FC<Auth3DTermsModalProps> = ({
  isOpen,
  onClose,
  documentType,
}) => {
  if (!isOpen) return null;

  const contentMap = {
    kvkk: {
      title: 'KVKK Aydınlatma Metni',
      subtitle: '6698 sayılı Kişisel Verilerin Korunması Kanunu Kapsamında',
      body: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            HatayMarket Elektronik Ticaret A.Ş. olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla kişisel verilerinizi mevzuata uygun şekilde işlemekte ve korumaktayız.
          </p>
          <h4 className="font-bold text-slate-800 text-xs">1. İşlenen Kişisel Veriler</h4>
          <p>
            Ad, soyad, telefon numarası, e-posta adresi ve sipariş teslimat adresi bilgileriniz market siparişlerinizin hazırlanması ve kapınıza ulaştırılması amacıyla işlenmektedir.
          </p>
          <h4 className="font-bold text-slate-800 text-xs">2. Verilerin Aktarılması</h4>
          <p>
            Kişisel verileriniz, yalnızca siparişinizin teslimi için dark store depo personeli ve yetkili kuryeler ile paylaşılmaktadır. Üçüncü taraflara ticari amaçla satılmaz.
          </p>
          <h4 className="font-bold text-slate-800 text-xs">3. Veri Güvenliği ve Saklama</h4>
          <p>
            Verileriniz 256-bit SSL şifreleme ve Google Cloud Firestore veri merkezlerinde uluslararası güvenlik standartlarıyla saklanmaktadır.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Kullanıcı Sözleşmesi',
      subtitle: 'HatayMarket Hizmet ve Üyelik Koşulları',
      body: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            Bu sözleşme, HatayMarket mobil platformu üzerinden sunulan online market siparişi, ödeme ve kurye teslimatı hizmetlerinin kullanım kurallarını belirler.
          </p>
          <h4 className="font-bold text-slate-800 text-xs">1. Üyelik ve Hesap Güvenliği</h4>
          <p>
            Kullanıcı, kayıt sırasında verdiği iletişim ve adres bilgilerinin doğruluğundan sorumludur. Şifre güvenliği kullanıcıya aittir.
          </p>
          <h4 className="font-bold text-slate-800 text-xs">2. Sipariş ve Teslimat</h4>
          <p>
            Siparişler, kullanıcının seçtiği Hatay ilçe sınırları içerisindeki adreslere ortalama 15-20 dakika içinde teslim edilir. Stok durumuna göre alternatif ürün onayı talep edilebilir.
          </p>
          <h4 className="font-bold text-slate-800 text-xs">3. İptal ve İade</h4>
          <p>
            Müşteri teslimat esnasında hasarlı veya eksik ürün tespit ettiğinde koşulsuz iade talep etme hakkına sahiptir.
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'Gizlilik Politikası',
      subtitle: 'Kişisel Verilerinizin ve Ödeme Güvenliğinizin Korunması',
      body: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            HatayMarket kullanıcılarının gizliliğine en üst düzeyde önem verir. Kredi kartı bilgileriniz PCI-DSS uyumlu banka altyapısında şifreli olarak işlenir ve sunucularımızda asla saklanmaz.
          </p>
          <h4 className="font-bold text-slate-800 text-xs">1. Çerez ve Oturum Yönetimi</h4>
          <p>
            Uygulama deneyiminizi iyileştirmek ve sepetinizi korumak için güvenli oturum çerezleri kullanılır.
          </p>
          <h4 className="font-bold text-slate-800 text-xs">2. Konum Bilgisi</h4>
          <p>
            Konum bilginiz yalnızca size en yakın dark store şubesini seçmek ve kuryenin adresinize hızla ulaşması için kullanılır.
          </p>
        </div>
      ),
    },
  };

  const selected = contentMap[documentType];

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-emerald-100 flex flex-col max-h-[85vh] animate-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00875A] flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#17231D]">{selected.title}</h3>
              <p className="text-[10px] text-[#68766E]">{selected.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-1 pr-2 scrollbar-thin">
          {selected.body}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Okudum ve Anladım</span>
          </button>
        </div>
      </div>
    </div>
  );
};
