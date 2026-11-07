import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface RegisterScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onSuccess: (userData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  }) => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBack,
  onLogin,
  onSuccess,
  onOpenLegal,
}) => {
  const { brandingConfig } = useApp();
  const heroImage = brandingConfig.registerHeroImage || '/assets/screens3d/hero_register.png';
  const title = brandingConfig.registerTitle || 'HatayMarket Ailesine Katıl!';
  const subtitle = brandingConfig.registerSubtitle || 'İlk alışverişine hazır mısın?';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Lütfen geçerli bir 10 haneli telefon numarası giriniz.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Şifreniz en az 4 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Girdiğiniz şifreler eşleşmiyor.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Devam etmek için Kullanım Koşulları ve Gizlilik Politikasını onaylamalısınız.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: cleanPhone,
        email: email.trim(),
        password,
      });
    }, 450);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[600px] flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] shadow-2xl border border-emerald-100 select-none animate-in fade-in duration-300">
      {/* Top Header with Back Button and 3D Gift Hero */}
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

      {/* Form Content */}
      <div className="px-5 pt-1 pb-6 flex-1 flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Adınız & Soyadınız */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <User className="w-4 h-4 text-[#68766E] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Adınız"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#F5F7F5] text-xs pl-9 pr-2 py-2.5 rounded-xl border border-[#E1E9E4] outline-none focus:border-[#18B900] focus:bg-white text-[#183321] transition-all"
                required
              />
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-[#68766E] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Soyadınız"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#F5F7F5] text-xs pl-9 pr-2 py-2.5 rounded-xl border border-[#E1E9E4] outline-none focus:border-[#18B900] focus:bg-white text-[#183321] transition-all"
                required
              />
            </div>
          </div>

          {/* E-Posta */}
          <div className="relative">
            <Mail className="w-4 h-4 text-[#68766E] absolute left-3 top-2.5" />
            <input
              type="email"
              placeholder="E-Posta Adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F5F7F5] text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E1E9E4] outline-none focus:border-[#18B900] focus:bg-white text-[#183321] transition-all"
              required
            />
          </div>

          {/* Telefon */}
          <div className="relative">
            <Phone className="w-4 h-4 text-[#68766E] absolute left-3 top-2.5" />
            <input
              type="tel"
              placeholder="Telefon Numaranız (05XX...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#F5F7F5] text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E1E9E4] outline-none focus:border-[#18B900] focus:bg-white text-[#183321] transition-all"
              required
            />
          </div>

          {/* Şifre */}
          <div className="relative">
            <Lock className="w-4 h-4 text-[#68766E] absolute left-3 top-2.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F7F5] text-xs pl-9 pr-9 py-2.5 rounded-xl border border-[#E1E9E4] outline-none focus:border-[#18B900] focus:bg-white text-[#183321] transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2.5 text-[#68766E] hover:text-[#183321]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Şifre Tekrarı */}
          <div className="relative">
            <Lock className="w-4 h-4 text-[#68766E] absolute left-3 top-2.5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Şifre Tekrarı"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#F5F7F5] text-xs pl-9 pr-9 py-2.5 rounded-xl border border-[#E1E9E4] outline-none focus:border-[#18B900] focus:bg-white text-[#183321] transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-2.5 text-[#68766E] hover:text-[#183321]"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2 pt-1 text-[11px] text-[#183321]/80">
            <input
              type="checkbox"
              id="reg-terms-check"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded border-[#E1E9E4] text-[#18B900] focus:ring-[#18B900] cursor-pointer"
            />
            <label htmlFor="reg-terms-check" className="cursor-pointer leading-tight">
              <button
                type="button"
                onClick={() => onOpenLegal('terms')}
                className="text-[#087A25] font-bold underline hover:text-[#18B900]"
              >
                Kullanım Koşullarını
              </button>{' '}
              ve{' '}
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="text-[#087A25] font-bold underline hover:text-[#18B900]"
              >
                Gizlilik Politikasını
              </button>{' '}
              okudum, kabul ediyorum.
            </label>
          </div>

          {/* Submit Button: Ücretsiz Üye Ol */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(24,185,0,0.35)] hover:shadow-[0_8px_25px_rgba(24,185,0,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-btn-shine pointer-events-none" />
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Kaydediliyor...' : 'Ücretsiz Üye Ol'}</span>
          </button>
        </form>

        {/* Footer Link: Zaten hesabın var mı? Giriş Yap */}
        <div className="text-center pt-3 text-xs text-[#183321]/70">
          Zaten hesabın var mı?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="text-[#087A25] font-black underline hover:text-[#18B900] cursor-pointer"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
};
