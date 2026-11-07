import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Phone, Mail, ChevronLeft, ChevronRight, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onLogin,
}) => {
  const { brandingConfig } = useApp();
  const heroImage = brandingConfig.forgotPasswordHeroImage || '/assets/screens3d/hero_forgot_password.png';
  const title = brandingConfig.forgotPasswordTitle || 'Şifreni mi Unuttun?';
  const subtitle = brandingConfig.forgotPasswordSubtitle || 'Şifreni yenilemek için telefon numaranı veya e-posta adresini gir.';

  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Lütfen telefon numaranızı veya e-posta adresinizi giriniz.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(
        `Şifre sıfırlama talimatları ${identifier.trim()} adresine başarıyla gönderildi. Lütfen gelen kutunuzu ve SMS mesajlarınızı kontrol ediniz.`
      );
    }, 600);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[600px] flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] shadow-2xl border border-emerald-100 select-none animate-in fade-in duration-300">
      {/* 3D Green Lock & Golden Key Header */}
      <div className="relative w-full overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#E9FFE5] to-white">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-white flex items-center justify-center text-[#183321] hover:bg-[#E9FFE5] transition-colors cursor-pointer"
          aria-label="Geri Dön"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="w-full h-[180px] overflow-hidden flex items-center justify-center">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover animate-float-gentle"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-1 pb-6 flex-1 flex flex-col justify-between text-center">
        <div>
          <h2 className="text-xl font-black text-[#183321] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-[#183321]/70 mt-1.5 leading-relaxed font-medium">
            {subtitle}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 text-left animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#18B900] mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Identifier input */}
            <div className="relative">
              <Phone className="w-4 h-4 text-[#68766E] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Telefon veya E-Posta"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#F5F7F5] text-xs pl-10 pr-3 py-3 rounded-2xl border border-[#E1E9E4] outline-none focus:border-[#18B900] focus:bg-white text-[#183321] transition-all"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-xs shadow-[0_6px_20px_rgba(24,185,0,0.35)] hover:shadow-[0_8px_25px_rgba(24,185,0,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-btn-shine pointer-events-none" />
              <Key className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}</span>
            </button>
          </form>
        </div>

        {/* Footer: Giriş Sayfasına Dön */}
        <div className="pt-6">
          <button
            type="button"
            onClick={onLogin}
            className="text-xs font-bold text-[#087A25] hover:text-[#18B900] transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="underline">Giriş Sayfasına Dön</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
