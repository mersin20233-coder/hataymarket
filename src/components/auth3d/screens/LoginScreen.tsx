import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  LogIn,
  AlertCircle,
} from 'lucide-react';

interface LoginScreenProps {
  onBack: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  onSubmit: (identifier: string, pass: string, remember: boolean) => Promise<{ success: boolean; message: string }>;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onRegister,
  onForgotPassword,
  onSubmit,
  onGoogleLogin,
  onAppleLogin,
}) => {
  const { brandingConfig } = useApp();
  const heroImage = brandingConfig.loginHeroImage || '/assets/screens3d/hero_login.png';
  const title = brandingConfig.loginTitle || 'Tekrar Hoş Geldin!';
  const subtitle = brandingConfig.loginSubtitle || 'Alışverişe kaldığın yerden devam et.';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Lütfen telefon numaranızı veya e-posta adresinizi giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit(identifier.trim(), password, rememberMe);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[600px] flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] shadow-2xl border border-emerald-100 select-none animate-in fade-in duration-300">
      {/* 3D Mascot Header with Back Button */}
      <div className="relative w-full overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#E9FFE5] to-white">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-white flex items-center justify-center text-[#183321] hover:bg-[#E9FFE5] transition-colors cursor-pointer"
          aria-label="Geri Dön"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="w-full h-[220px] overflow-hidden flex items-center justify-center">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover animate-float-gentle"
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="px-5 pt-1 pb-6 flex-1 flex flex-col justify-between">
        <div className="space-y-1 text-center mb-2">
          <h2 className="text-xl font-black text-[#183321] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-[#183321]/70 font-medium">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Telefon veya E-Posta */}
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

          {/* Şifre */}
          <div className="relative">
            <Lock className="w-4 h-4 text-[#68766E] absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F7F5] text-xs pl-10 pr-10 py-3 rounded-2xl border border-[#E1E9E4] outline-none focus:border-[#18B900] focus:bg-white text-[#183321] transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-[#68766E] hover:text-[#183321]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Beni Hatırla & Şifremi Unuttum */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <label className="flex items-center gap-1.5 text-[#183321]/80 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#E1E9E4] text-[#18B900] focus:ring-[#18B900] cursor-pointer"
              />
              <span>Beni Hatırla</span>
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[#087A25] font-bold hover:text-[#18B900] cursor-pointer"
            >
              Şifremi Unuttum?
            </button>
          </div>

          {/* Giriş Yap Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(24,185,0,0.35)] hover:shadow-[0_8px_25px_rgba(24,185,0,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-btn-shine pointer-events-none" />
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
          </button>
        </form>

        {/* Divider: veya */}
        <div className="relative my-2.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E1E9E4]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#68766E]">
            <span className="bg-white px-2">veya</span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full py-2 px-3 rounded-xl bg-white border border-[#E1E9E4] hover:bg-[#F5F7F5] text-xs font-bold text-[#183321] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google ile Giriş Yap</span>
          </button>

          <button
            type="button"
            onClick={onAppleLogin}
            className="w-full py-2 px-3 rounded-xl bg-white border border-[#E1E9E4] hover:bg-[#F5F7F5] text-xs font-bold text-[#183321] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 0.6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.04-.51 2.67-1.26" />
            </svg>
            <span>Apple ile Giriş Yap</span>
          </button>
        </div>

        {/* Footer Link: Hesabın yok mu? Üye Ol */}
        <div className="text-center pt-3 text-xs text-[#183321]/70">
          Hesabın yok mu?{' '}
          <button
            type="button"
            onClick={onRegister}
            className="text-[#087A25] font-black underline hover:text-[#18B900] cursor-pointer"
          >
            Üye Ol
          </button>
        </div>
      </div>
    </div>
  );
};
