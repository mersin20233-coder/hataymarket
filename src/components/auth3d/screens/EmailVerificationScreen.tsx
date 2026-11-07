import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Mail, ChevronRight, Send, Check } from 'lucide-react';

interface EmailVerificationScreenProps {
  email: string;
  onHome: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onHome,
}) => {
  const { brandingConfig } = useApp();
  const heroImage = brandingConfig.emailVerifyHeroImage || '/assets/screens3d/hero_email_verify.png';
  const badgeImage = brandingConfig.emailVerifyBadgeImage || '/assets/screens3d/badge_email_verify.png';
  const title = brandingConfig.emailVerifyTitle || 'E-Posta Adresini Doğrula';
  const subtitle = brandingConfig.emailVerifySubtitle || 'E-posta adresine gönderilen bağlantıya tıklayarak hesabını doğrula.';

  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleResendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setResendStatus('Doğrulama bağlantısı e-posta adresinize tekrar iletildi.');
      setTimeout(() => setResendStatus(null), 4000);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[600px] flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] shadow-2xl border border-emerald-100 select-none animate-in fade-in duration-300">
      {/* 3D Envelope Header */}
      <div className="relative w-full overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#E9FFE5] to-white">
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
            <span className="font-bold text-[#087A25]">{email || 'E-posta adresinize'}</span> {subtitle.includes('bağlantıya') ? subtitle : 'gönderilen bağlantıya tıklayarak hesabını doğrula.'}
          </p>

          {resendStatus && (
            <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-[#18B900]" />
              <span>{resendStatus}</span>
            </div>
          )}

          {/* Middle 3D Envelope with @ card */}
          <div className="w-full h-[140px] overflow-hidden my-3 flex items-center justify-center">
            <img
              src={badgeImage}
              alt="E-Posta Zarfı"
              className="w-full h-full object-contain filter drop-shadow-md animate-pulse"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* E-Postayı Tekrar Gönder */}
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isSending}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(24,185,0,0.35)] hover:shadow-[0_8px_25px_rgba(24,185,0,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-btn-shine pointer-events-none" />
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Gönderiliyor...' : 'E-Postayı Tekrar Gönder'}</span>
          </button>

          {/* Ana Sayfaya Dön */}
          <button
            type="button"
            onClick={onHome}
            className="text-xs font-bold text-[#087A25] hover:text-[#18B900] transition-colors inline-flex items-center justify-center gap-1 pt-1 cursor-pointer"
          >
            <span className="underline">Ana Sayfaya Dön</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
