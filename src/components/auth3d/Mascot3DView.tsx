import React from 'react';

export type MascotPose = 'welcome' | 'pointing' | 'phone' | 'peek' | 'celebrate';

interface Mascot3DViewProps {
  pose: MascotPose;
  speechText?: string;
  isFocusedOnPassword?: boolean;
  className?: string;
}

export const Mascot3DView: React.FC<Mascot3DViewProps> = ({
  pose,
  speechText,
  isFocusedOnPassword = false,
  className = '',
}) => {
  // Select active mascot image based on state
  let imageSrc = '/assets/mascot/mascot_default.jpg';
  if (pose === 'celebrate') {
    imageSrc = '/assets/mascot/mascot_celebrate.jpg';
  } else if (pose === 'peek' || isFocusedOnPassword) {
    imageSrc = '/assets/mascot/mascot_peek.jpg';
  }

  // Determine speech bubble text if not overridden
  const defaultSpeech = () => {
    if (pose === 'celebrate') return 'Harika! HatayMarket ailene hoş geldin! 🎉';
    if (pose === 'peek' || isFocusedOnPassword) return 'Şifrene bakmıyorum, gizli tut! 🙈';
    if (pose === 'phone') return 'Telefonuna güvenli onay bildireceğiz 📱';
    if (pose === 'pointing') return 'Formu doldur, sana özel sürprizler hazır! ✨';
    return 'Merhaba! Hatay\'ın en taze lezzetleri seni bekliyor 🌿';
  };

  const bubbleText = speechText || defaultSpeech();

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech Balloon with bounce animation */}
      <div className="relative mb-2.5 z-20 animate-in fade-in zoom-in-95 duration-300">
        <div className="px-3.5 py-1.5 rounded-2xl bg-white text-[#17231D] text-xs font-bold shadow-lg border border-emerald-100 flex items-center gap-1.5 max-w-[260px] text-center">
          <span className="text-sm">
            {pose === 'celebrate' ? '🎉' : isFocusedOnPassword ? '🙈' : '🥑'}
          </span>
          <span className="leading-snug text-[11px] sm:text-xs">{bubbleText}</span>
        </div>
        {/* Balloon pointer tail */}
        <div className="w-3 h-3 bg-white border-r border-b border-emerald-100 transform rotate-45 mx-auto -mt-1.5 shadow-xs" />
      </div>

      {/* 3D Mascot Character Stage */}
      <div className="relative group cursor-pointer">
        {/* Soft Volumetric Glow Behind Mascot */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 to-lime-400/20 rounded-full blur-xl scale-110 pointer-events-none" />

        {/* 3D Character Avatar Container */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#00875A] via-[#10B981] to-[#E8F7EF] shadow-2xl border-2 border-white/80 transition-transform duration-500 ease-out hover:scale-105">
          <div className="w-full h-full rounded-full overflow-hidden bg-emerald-50 relative">
            <img
              src={imageSrc}
              alt="HatayMarket 3D Maskot Eren"
              className={`w-full h-full object-cover transition-all duration-300 ${
                pose === 'celebrate'
                  ? 'scale-105 animate-bounce-subtle'
                  : isFocusedOnPassword
                  ? 'scale-110'
                  : 'scale-100'
              }`}
            />
            {/* Shimmer Sheen Layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Floating 3D Badge on Mascot */}
        <div className="absolute -bottom-1 -right-1 z-10 px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-[#00875A] text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span>Eren · Market Asistanı</span>
        </div>

        {/* 3D Ground Shadow */}
        <div className="w-24 h-3 bg-black/15 rounded-full blur-xs mx-auto mt-2 transition-all duration-300 group-hover:scale-90 group-hover:opacity-60" />
      </div>

      <style>{`
        @keyframes bounceSubtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
