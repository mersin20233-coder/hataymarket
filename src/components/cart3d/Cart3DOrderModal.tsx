import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Order } from '../../types';
import { ShoppingBag, ArrowRight, Clock, MapPin, Bike, Sparkles } from 'lucide-react';
import { handleImageError } from '../../utils/imageFallback';

interface Cart3DOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const Cart3DOrderModal: React.FC<Cart3DOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onTrackOrder,
}) => {
  const [stage, setStage] = useState<'cart_entering' | 'suction' | 'cart_spin_sweep' | 'success_reveal'>('cart_entering');

  useEffect(() => {
    if (!isOpen || !order) {
      setStage('cart_entering');
      return;
    }

    // Stage 1: Cart enters center (0 - 800ms)
    setStage('cart_entering');

    // Stage 2: Items get pulled in (800ms - 1700ms)
    const t1 = setTimeout(() => {
      setStage('suction');
    }, 800);

    // Stage 3: Cart spins, light sweep, lid closure (1700ms - 2600ms)
    const t2 = setTimeout(() => {
      setStage('cart_spin_sweep');
    }, 1700);

    // Stage 4: Checkmark draws, confetti explodes, summary appears (2600ms+)
    const t3 = setTimeout(() => {
      setStage('success_reveal');

      // Trigger Confetti Explosion
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.45 },
          colors: ['#00875A', '#10B981', '#F59E0B', '#E8F7EF', '#FFFFFF', '#FF5A5F'],
          disableForReducedMotion: true,
        });

        // Second wave
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0.15, y: 0.5 },
            colors: ['#00875A', '#10B981', '#F59E0B'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 0.85, y: 0.5 },
            colors: ['#00875A', '#10B981', '#F59E0B'],
          });
        }, 300);
      } catch (err) {
        console.error('Confetti error:', err);
      }
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1811]/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl overflow-hidden border border-emerald-100 flex flex-col items-center text-center">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00875A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* ======================================================================= */}
        {/* 3D ANIMATION STAGE CONTAINER (Stages 1-3) */}
        {/* ======================================================================= */}
        {stage !== 'success_reveal' && (
          <div className="relative w-56 h-56 flex items-center justify-center perspective-[1000px] my-4">
            {/* 3D Shopping Cart Model Wrapper */}
            <div
              className={`relative transition-all duration-700 ease-out transform-style-3d ${
                stage === 'cart_entering'
                  ? 'scale-100 rotate-x-12 -rotate-y-12 translate-y-0 opacity-100 animate-bounce-subtle'
                  : stage === 'suction'
                  ? 'scale-110 rotate-x-6 rotate-y-6 translate-y-[-10px]'
                  : 'scale-0 rotate-y-[360deg] rotate-x-45 opacity-0'
              }`}
            >
              {/* 3D Shopping Cart Visual Graphic */}
              <div className="relative w-36 h-36 bg-gradient-to-br from-[#00875A] to-[#005236] rounded-3xl shadow-2xl p-4 flex flex-col justify-between border-2 border-emerald-300/40 text-white">
                {/* Cart Metallic Handle */}
                <div className="w-16 h-3 bg-slate-200 rounded-full mx-auto shadow-md border border-slate-300 -mt-2" />

                {/* Shopping Bag Icon in 3D center */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shadow-inner">
                    <ShoppingBag className="w-9 h-9 text-white drop-shadow-md" />
                  </div>
                </div>

                {/* Metallic Cart Base & Wheels */}
                <div className="flex items-center justify-between px-2 pt-2 border-t border-white/20">
                  <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-300 shadow-md animate-spin-slow" />
                  <div className="h-1.5 flex-1 bg-white/40 mx-2 rounded-full" />
                  <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-300 shadow-md animate-spin-slow" />
                </div>

                {/* Diagonal Light Sweep Beam */}
                {stage === 'cart_spin_sweep' && (
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-30deg] animate-light-sweep" />
                  </div>
                )}
              </div>

              {/* 3D Realistic Ground Shadow */}
              <div
                className={`w-32 h-6 bg-black/30 rounded-full blur-md mx-auto mt-4 transition-all duration-500 ${
                  stage === 'suction' ? 'scale-75 opacity-40' : 'scale-100 opacity-60'
                }`}
              />
            </div>

            {/* Suction Particles: Mini product thumbnails flying into the cart */}
            {stage === 'suction' && (
              <div className="absolute inset-0 pointer-events-none">
                {order.items.slice(0, 4).map((item, idx) => {
                  const angles = [-135, -45, 135, 45];
                  const angle = angles[idx % angles.length];
                  const rad = (angle * Math.PI) / 180;
                  const startDist = 95;
                  const startX = Math.cos(rad) * startDist;
                  const startY = Math.sin(rad) * startDist;

                  return (
                    <div
                      key={item.product.id}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(${startX}px, ${startY}px) scale(1)`,
                        animation: `suctionPull 750ms cubic-bezier(0.4, 0, 0.2, 1) ${idx * 120}ms forwards`,
                      }}
                      className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-lg border border-emerald-200 overflow-hidden z-20"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => handleImageError(e, item.product.category)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* SUCCESS REVEAL STAGE (Stage 4) */}
        {/* ======================================================================= */}
        {stage === 'success_reveal' && (
          <div className="w-full space-y-4 my-2 animate-in zoom-in-75 fade-in duration-500">
            {/* Animated 3D Green Checkmark with SVG Dash animation */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              {/* Outer Ring Pulse */}
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-35" />
              <div className="relative w-22 h-22 rounded-full bg-gradient-to-tr from-[#00875A] to-[#10B981] p-1 shadow-xl flex items-center justify-center border-4 border-white">
                <svg className="w-12 h-12 text-white" viewBox="0 0 52 52">
                  <circle
                    className="checkmark__circle"
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="3"
                  />
                  <path
                    className="checkmark__check"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 27l8 8 16-17"
                  />
                </svg>
              </div>
            </div>

            {/* Title & Feedback Message */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#00875A] border border-emerald-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sipariş Başarıyla Alındı</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#17231D] tracking-tight">
                Siparişiniz Oluşturuldu!
              </h3>
              <p className="text-xs text-[#68766E] max-w-[260px] mx-auto">
                HatayMarket kuryesi siparişinizi hazırlamak ve kapınıza ulaştırmak için harekete geçti.
              </p>
            </div>

            {/* Order Brief Information Card */}
            <div className="bg-[#F7FAF8] border border-[#E1E9E4] rounded-2xl p-3.5 text-xs text-left space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E4]">
                <span className="text-[#68766E] font-medium">Sipariş No</span>
                <span className="font-extrabold text-[#17231D] font-mono">{order.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#68766E]">
                  <Clock className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>Tahmini Teslimat</span>
                </div>
                <span className="font-bold text-[#00875A]">12 - 18 Dakika</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#68766E]">
                  <MapPin className="w-3.5 h-3.5 text-[#E84B4B]" />
                  <span>Teslimat Adresi</span>
                </div>
                <span className="font-bold text-[#17231D] truncate max-w-[150px]">
                  {order.customer?.address || 'Antakya / Hatay'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#E1E9E4]">
                <span className="text-[#68766E] font-medium">Ödenen Tutar</span>
                <span className="text-sm font-extrabold text-[#00875A]">
                  {order.totalAmount.toFixed(2)} ₺
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  onTrackOrder(order.id);
                  onClose();
                }}
                className="w-full py-3.5 bg-[#00875A] hover:bg-[#006D48] text-white font-extrabold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Bike className="w-4 h-4" />
                <span>Siparişimi Canlı Takip Et</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-[#68766E] hover:text-[#17231D] font-bold cursor-pointer"
              >
                Alışverişe Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Loading Progress bar while preparing celebration */}
        {stage !== 'success_reveal' && (
          <div className="w-full space-y-2 mt-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#00875A]">
              <div className="w-3.5 h-3.5 border-2 border-[#00875A]/30 border-t-[#00875A] rounded-full animate-spin" />
              <span>
                {stage === 'cart_entering' && 'Sepet Hazırlanıyor...'}
                {stage === 'suction' && 'Ürünler Paketleniyor...'}
                {stage === 'cart_spin_sweep' && 'Sipariş Doğrulanıyor...'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00875A] transition-all duration-700 ease-linear rounded-full"
                style={{
                  width:
                    stage === 'cart_entering'
                      ? '30%'
                      : stage === 'suction'
                      ? '65%'
                      : '90%',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Embedded Styles for 3D Keyframe Animations */}
      <style>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }

        @keyframes suctionPull {
          0% {
            opacity: 1;
            transform: translate(var(--sx, 60px), var(--sy, 60px)) scale(1) rotate(0deg);
          }
          60% {
            opacity: 1;
            transform: translate(0, -10px) scale(0.6) rotate(120deg);
          }
          100% {
            opacity: 0;
            transform: translate(0, 20px) scale(0.1) rotate(240deg);
          }
        }

        @keyframes lightSweep {
          0% {
            transform: translateX(-150%) skewX(-30deg);
          }
          100% {
            transform: translateX(250%) skewX(-30deg);
          }
        }

        .animate-light-sweep {
          animation: lightSweep 650ms ease-in-out forwards;
        }

        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 450ms cubic-bezier(0.65, 0, 0.45, 1) 150ms forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
