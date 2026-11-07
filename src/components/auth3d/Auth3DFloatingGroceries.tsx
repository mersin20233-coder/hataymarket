import React from 'react';

export const Auth3DFloatingGroceries: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Floating Avocado */}
      <div
        className="absolute top-12 left-4 sm:left-10 text-3xl opacity-40 animate-float-slow"
        style={{ animationDelay: '0s' }}
        title="Taze Avokado"
      >
        🥑
      </div>

      {/* Floating Orange */}
      <div
        className="absolute top-24 right-4 sm:right-12 text-3xl opacity-40 animate-float-medium"
        style={{ animationDelay: '1.2s' }}
        title="Dörtyol Portakalı"
      >
        🍊
      </div>

      {/* Floating Tomato */}
      <div
        className="absolute bottom-28 left-6 sm:left-14 text-2xl opacity-35 animate-float-slow"
        style={{ animationDelay: '2.4s' }}
        title="Salkım Domates"
      >
        🍅
      </div>

      {/* Floating Shopping Cart */}
      <div
        className="absolute bottom-20 right-6 sm:right-16 text-3xl opacity-35 animate-float-medium"
        style={{ animationDelay: '0.8s' }}
        title="Market Arabası"
      >
        🛒
      </div>

      {/* Floating Strawberry */}
      <div
        className="absolute top-1/2 left-2 text-xl opacity-30 animate-float-slow hidden sm:block"
        style={{ animationDelay: '1.8s' }}
      >
        🍓
      </div>

      {/* Floating Olive */}
      <div
        className="absolute top-1/3 right-3 text-2xl opacity-30 animate-float-medium hidden sm:block"
        style={{ animationDelay: '3s' }}
      >
        🫒
      </div>

      {/* Background Soft Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

      <style>{`
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-14px) rotate(6deg);
          }
        }
        @keyframes floatMedium {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-18px) rotate(-8deg);
          }
        }
        .animate-float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: floatMedium 4.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow, .animate-float-medium {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
