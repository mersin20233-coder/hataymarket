import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';
import { SplashScreen } from './auth3d/screens/SplashScreen';
import { WelcomeScreen } from './auth3d/screens/WelcomeScreen';
import { RegisterScreen } from './auth3d/screens/RegisterScreen';
import { LoginScreen } from './auth3d/screens/LoginScreen';
import { PhoneVerificationScreen } from './auth3d/screens/PhoneVerificationScreen';
import { EmailVerificationScreen } from './auth3d/screens/EmailVerificationScreen';
import { ForgotPasswordScreen } from './auth3d/screens/ForgotPasswordScreen';
import { RegistrationSuccessScreen } from './auth3d/screens/RegistrationSuccessScreen';
import { Auth3DTermsModal } from './auth3d/Auth3DTermsModal';

export type AuthScreenType =
  | 'splash'
  | 'welcome'
  | 'register'
  | 'login'
  | 'phone_verify'
  | 'email_verify'
  | 'forgot_password'
  | 'success';

interface AuthGateProps {
  onClose?: () => void;
  reasonMessage?: string;
  initialScreen?: 'welcome' | 'login' | 'register';
  isFullScreen?: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  onClose,
  reasonMessage,
  initialScreen = 'welcome',
  isFullScreen = false,
}) => {
  const { loginWithCredentials, registerUserWithApproval, setIsGuestBrowsing, brandingConfig } = useApp();

  // Determine starting screen:
  // If reasonMessage was provided (e.g. from app interaction), show login immediately.
  // Otherwise, start on 'splash' for onboarding experience, or 'welcome' if preferred.
  const [currentScreen, setCurrentScreen] = useState<AuthScreenType>(() => {
    if (reasonMessage) return 'login';
    if (initialScreen === 'login') return 'login';
    if (initialScreen === 'register') return 'register';
    return brandingConfig.defaultInitialScreen || 'splash';
  });

  // User details tracked during registration & verification
  const [registeredPhone, setRegisteredPhone] = useState('0532 000 00 00');
  const [registeredEmail, setRegisteredEmail] = useState('kullanici@hataymarket.com');
  const [registeredName, setRegisteredName] = useState('');

  // Legal Modal State
  const [legalDoc, setLegalDoc] = useState<'kvkk' | 'terms' | 'privacy'>('terms');
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  // Handle Guest Continue
  const handleGuestContinue = () => {
    setIsGuestBrowsing(true);
    if (onClose) onClose();
  };

  // Handle Register Form Submission
  const handleRegisterSubmit = (userData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    const fullName = `${userData.firstName} ${userData.lastName}`.trim();
    setRegisteredName(fullName);
    setRegisteredPhone(userData.phone);
    setRegisteredEmail(userData.email);

    // Register into existing AppContext database
    registerUserWithApproval({
      name: fullName,
      phone: userData.phone,
      email: userData.email,
      role: 'customer',
      password: userData.password,
      district: 'Antakya',
      addressLine: 'Hatay / Türkiye',
    });

    // Advance to 6-digit phone verification
    setCurrentScreen('phone_verify');
  };

  // Handle Login Submission
  const handleLoginSubmit = async (
    identifier: string,
    pass: string,
    _remember: boolean
  ): Promise<{ success: boolean; message: string }> => {
    const res = loginWithCredentials(identifier, pass);
    if (res.success && res.user) {
      setRegisteredName(res.user.name);
      setCurrentScreen('success');
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  // Social Login handler
  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    const res = loginWithCredentials('deniz', '123'); // Demo fast customer login
    if (res.success && res.user) {
      setRegisteredName(`${provider} Kullanıcısı (${res.user.name})`);
      setCurrentScreen('success');
    }
  };

  // Finish Onboarding & Enter Store
  const handleStartShopping = () => {
    if (onClose) {
      onClose();
    } else {
      setIsGuestBrowsing(true);
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Modal Close Button (if invoked as a dismissible overlay) */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 z-50 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* 1. SplashScreen (Açılış Ekranı - HatayMarket'e Hoş Geldin!) */}
      {currentScreen === 'splash' && (
        <SplashScreen
          onFinish={handleStartShopping}
          onRegister={() => setCurrentScreen('register')}
          onLogin={() => setCurrentScreen('login')}
        />
      )}

      {/* 2. WelcomeScreen (Hoş Geldiniz) */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onRegister={() => setCurrentScreen('register')}
          onLogin={() => setCurrentScreen('login')}
          onGuestContinue={handleGuestContinue}
        />
      )}

      {/* 3. RegisterScreen (Üyelik Ekranı) */}
      {currentScreen === 'register' && (
        <RegisterScreen
          onBack={() => setCurrentScreen('welcome')}
          onLogin={() => setCurrentScreen('login')}
          onSuccess={handleRegisterSubmit}
          onOpenLegal={(type) => {
            setLegalDoc(type);
            setIsLegalOpen(true);
          }}
        />
      )}

      {/* 4. LoginScreen (Giriş Ekranı) */}
      {currentScreen === 'login' && (
        <LoginScreen
          onBack={() => setCurrentScreen('welcome')}
          onRegister={() => setCurrentScreen('register')}
          onForgotPassword={() => setCurrentScreen('forgot_password')}
          onSubmit={handleLoginSubmit}
          onGoogleLogin={() => handleSocialLogin('Google')}
          onAppleLogin={() => handleSocialLogin('Apple')}
        />
      )}

      {/* 5. PhoneVerificationScreen (Telefon Doğrulama) */}
      {currentScreen === 'phone_verify' && (
        <PhoneVerificationScreen
          phoneNumber={registeredPhone}
          onBack={() => setCurrentScreen('register')}
          onSuccess={() => setCurrentScreen('email_verify')}
        />
      )}

      {/* 6. EmailVerificationScreen (E-Posta Doğrulama) */}
      {currentScreen === 'email_verify' && (
        <EmailVerificationScreen
          email={registeredEmail}
          onHome={() => setCurrentScreen('success')}
        />
      )}

      {/* 7. ForgotPasswordScreen (Şifremi Unuttum) */}
      {currentScreen === 'forgot_password' && (
        <ForgotPasswordScreen
          onBack={() => setCurrentScreen('login')}
          onLogin={() => setCurrentScreen('login')}
        />
      )}

      {/* 8. RegistrationSuccessScreen (Kayıt Başarılı) */}
      {currentScreen === 'success' && (
        <RegistrationSuccessScreen
          userName={registeredName}
          onStartShopping={handleStartShopping}
        />
      )}

      {/* Legal & Terms Modal */}
      <Auth3DTermsModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        documentType={legalDoc}
      />
    </div>
  );
};
