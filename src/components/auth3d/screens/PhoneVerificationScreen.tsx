import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { ChevronLeft, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface PhoneVerificationScreenProps {
  phoneNumber: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const PhoneVerificationScreen: React.FC<PhoneVerificationScreenProps> = ({
  phoneNumber,
  onBack,
  onSuccess,
}) => {
  const { brandingConfig } = useApp();
  const heroImage = brandingConfig.phoneVerifyHeroImage || '/assets/screens3d/hero_phone_verify.png';
  const badgeImage = brandingConfig.phoneVerifyBadgeImage || '/assets/screens3d/badge_phone_verify.png';
  const title = brandingConfig.phoneVerifyTitle || 'Telefonunu Doğrula';
  const subtitle = brandingConfig.phoneVerifySubtitle || 'Telefon numarana gönderilen doğrulama kodunu gir.';

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(58);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle digit change
  const handleChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto focus next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down (backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasteData[i] || '';
      }
      setDigits(newDigits);
      if (pasteData.length === 6) {
        inputRefs.current[5]?.focus();
      } else {
        inputRefs.current[pasteData.length]?.focus();
      }
    }
  };

  // Resend code
  const handleResend = () => {
    setCountdown(58);
    setCanResend(false);
    setDigits(['', '', '', '', '', '']);
    setErrorMsg(null);
    setToastMsg('Yeni 6 haneli doğrulama kodu SMS olarak iletildi: 123456');
    setTimeout(() => setToastMsg(null), 4000);
    inputRefs.current[0]?.focus();
  };

  // Fill demo code
  const fillDemoCode = () => {
    setDigits(['1', '2', '3', '4', '5', '6']);
    inputRefs.current[5]?.focus();
  };

  // Submit verification
  const handleVerify = () => {
    const code = digits.join('');
    if (code.length < 6) {
      setErrorMsg('Lütfen 6 haneli doğrulama kodunu eksiksiz giriniz.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Valid if user inputs 123456 or any 6 digit test code
      if (code === '123456' || code.length === 6) {
        onSuccess();
      } else {
        setErrorMsg('Girdiğiniz kod hatalıdır. Lütfen tekrar deneyin.');
      }
    }, 500);
  };

  const formattedTime = `00:${countdown < 10 ? `0${countdown}` : countdown}`;

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[600px] flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-b from-[#E9FFE5] via-white to-[#F5F7F5] shadow-2xl border border-emerald-100 select-none animate-in fade-in duration-300">
      {/* 3D Shield Header with Back Button */}
      <div className="relative w-full overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#E9FFE5] to-white">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-white flex items-center justify-center text-[#183321] hover:bg-[#E9FFE5] transition-colors cursor-pointer"
          aria-label="Geri Dön"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="w-full h-[170px] overflow-hidden flex items-center justify-center">
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
          <p className="text-xs text-[#183321]/70 mt-1 font-medium">
            <span className="font-bold text-[#087A25]">{phoneNumber || 'Telefon numaranıza'}</span> {subtitle.includes('numarana') ? subtitle : `gönderilen doğrulama kodunu gir.`}
          </p>

          {/* Quick Demo Code Pill */}
          <div className="my-2.5">
            <button
              type="button"
              onClick={fillDemoCode}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E9FFE5] hover:bg-emerald-100 border border-[#18B900]/30 rounded-full text-[11px] font-bold text-[#087A25] transition-all cursor-pointer shadow-2xs"
            >
              <span>Test Kodu: 123456</span>
              <span className="text-[10px] text-[#18B900] underline font-extrabold">(Doldur)</span>
            </button>
          </div>

          {toastMsg && (
            <div className="p-2 mb-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-in fade-in">
              {toastMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-2 mb-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 6 OTP Input Boxes */}
          <div className="flex items-center justify-center gap-2 my-3" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-10 h-12 text-center text-lg font-black rounded-xl border-2 outline-none transition-all ${
                  digit
                    ? 'border-[#18B900] bg-white text-[#183321] shadow-xs scale-105'
                    : 'border-[#E1E9E4] bg-[#F5F7F5] text-[#183321] focus:border-[#18B900] focus:bg-white'
                }`}
              />
            ))}
          </div>

          {/* Countdown & Resend */}
          <div className="text-xs text-[#183321]/70 font-semibold mb-4">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#087A25] font-black underline hover:text-[#18B900] flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kodu Tekrar Gönder</span>
              </button>
            ) : (
              <span>
                <strong className="text-[#087A25] font-black">{formattedTime}</strong> içinde yeniden gönder
              </span>
            )}
          </div>

          {/* Doğrula Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#18B900] to-[#087A25] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(24,185,0,0.35)] hover:shadow-[0_8px_25px_rgba(24,185,0,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-btn-shine pointer-events-none" />
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Doğrulanıyor...' : 'Doğrula'}</span>
          </button>
        </div>

        {/* Bottom 3D Security Shield Badge */}
        <div className="w-full h-[90px] overflow-hidden flex items-center justify-center -mb-2 opacity-90">
          <img
            src={badgeImage}
            alt="Güvenlik Kalkanı"
            className="w-full h-full object-contain filter drop-shadow-sm animate-pulse"
          />
        </div>
      </div>
    </div>
  );
};
