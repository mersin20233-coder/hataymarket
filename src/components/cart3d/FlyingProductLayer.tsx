import React, { useEffect, useRef } from 'react';
import { FlyingParticle, CartImpactEffect } from './Cart3DTypes';
import { handleImageError } from '../../utils/imageFallback';

interface FlyingProductItemProps {
  particle: FlyingParticle;
  onComplete: (id: string, targetId: string, x: number, y: number) => void;
}

const FlyingProductItem: React.FC<FlyingProductItemProps> = ({ particle, onComplete }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Calculate delta coordinates
    const dx = particle.targetX - particle.startX;
    const dy = particle.targetY - particle.startY;

    // Curved arched trajectory control points
    // When dx is positive or negative, arch upwards (negative Y in screen coords)
    const arcHeight = Math.min(180, Math.max(90, Math.abs(dx) * 0.45));

    // 11 keyframe steps for ultra-smooth 3D flight
    const keyframes: Keyframe[] = [];
    const steps = 12;

    for (let i = 0; i <= steps; i++) {
      const p = i / steps; // 0 to 1

      // Ease along X (smooth start, steady flight)
      const currentX = particle.startX + dx * p;

      // Parabolic curve for Y + acceleration towards cart in second half
      // Arch equation: sin(p * PI) creates natural toss arc upwards
      const arcOffset = -Math.sin(p * Math.PI) * arcHeight;
      const progressY = p < 0.5 ? p * 0.8 : 0.4 + (p - 0.5) * 1.2; // accelerated pull towards cart
      const currentY = particle.startY + dy * progressY + arcOffset;

      // 3D Perspective Scale: Pops up first (1.15x), stays readable, then shrinks dramatically to enter cart opening
      let scale = 1.0;
      if (p <= 0.2) {
        scale = 1.0 + p * 0.9; // 1.0 -> 1.18
      } else if (p <= 0.6) {
        scale = 1.18 - (p - 0.2) * 0.4; // 1.18 -> 1.02
      } else if (p <= 0.85) {
        scale = 1.02 - (p - 0.6) * 2.5; // 1.02 -> 0.395
      } else {
        scale = Math.max(0.04, 0.395 - (p - 0.85) * 2.4); // 0.395 -> 0.04
      }

      // 3D Rotations
      // As it lifts off, tilts toward camera (rotateX, rotateY)
      // As it flies, spins slightly (rotateZ)
      const rotX = Math.sin(p * Math.PI) * 22; // 0 -> 22deg -> 0
      const rotY = Math.sin(p * Math.PI) * -28; // 0 -> -28deg -> 0
      const rotZ = p * 45 - 12; // -12deg -> 33deg

      // Opacity: Stays solid until final entry plunge
      const opacity = p > 0.9 ? Math.max(0, 1 - (p - 0.9) / 0.1) : 1;

      // Dynamic shadow depth: gets blurrier and deeper when high in air
      const shadowBlur = Math.round(10 + Math.sin(p * Math.PI) * 25);
      const shadowY = Math.round(5 + Math.sin(p * Math.PI) * 20);
      const shadowOpacity = (0.2 + Math.sin(p * Math.PI) * 0.25).toFixed(2);

      keyframes.push({
        transform: `translate3d(${currentX - particle.startWidth / 2}px, ${currentY - particle.startHeight / 2}px, 0) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
        opacity,
        boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(0, 87, 50, ${shadowOpacity}), 0 4px 10px rgba(0, 0, 0, 0.15)`,
        offset: p,
      });
    }

    const animation = el.animate(keyframes, {
      duration: 680,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      fill: 'forwards',
    });

    animation.onfinish = () => {
      onComplete(particle.id, particle.targetElementId, particle.targetX, particle.targetY);
    };

    return () => {
      animation.cancel();
    };
  }, [particle, onComplete]);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: `${particle.startWidth}px`,
        height: `${particle.startHeight}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '2px solid rgba(255, 255, 255, 0.9)',
        background: '#ffffff',
      }}
      className="shadow-2xl"
    >
      <img
        src={particle.image}
        alt={particle.productName}
        className="w-full h-full object-cover"
        onError={(e) => handleImageError(e, 'Ürün')}
      />
      {/* 3D Glass Light Sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
    </div>
  );
};

// Radiant Sparkle Impact Burst when product enters cart
const CartSparkleBurst: React.FC<{ impact: CartImpactEffect }> = ({ impact }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: `${impact.x}px`,
        top: `${impact.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9998,
        pointerEvents: 'none',
      }}
      className="flex items-center justify-center"
    >
      {/* Expanding Glow Shockwave */}
      <div className="absolute w-12 h-12 rounded-full border-2 border-emerald-400 bg-emerald-400/20 animate-ping" />
      <div className="absolute w-8 h-8 rounded-full bg-amber-400/30 blur-xs animate-pulse" />

      {/* 8 Radiant Star Sparkles */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
        const rad = (angle * Math.PI) / 180;
        const dist = 24;
        const sparkX = Math.cos(rad) * dist;
        const sparkY = Math.sin(rad) * dist;

        return (
          <span
            key={idx}
            style={{
              position: 'absolute',
              width: idx % 2 === 0 ? '6px' : '4px',
              height: idx % 2 === 0 ? '6px' : '4px',
              backgroundColor: idx % 2 === 0 ? '#10B981' : '#F59E0B',
              borderRadius: '50%',
              boxShadow: '0 0 8px #10B981',
              transform: `translate(${sparkX}px, ${sparkY}px)`,
              animation: 'sparklePop 450ms ease-out forwards',
            }}
          />
        );
      })}

      <style>{`
        @keyframes sparklePop {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1.4);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 20px), var(--ty, 20px)) scale(0.2);
          }
        }
      `}</style>
    </div>
  );
};

export const FlyingProductLayer: React.FC<{
  particles: FlyingParticle[];
  cartImpact: CartImpactEffect | null;
  onParticleComplete: (id: string, targetId: string, x: number, y: number) => void;
}> = ({ particles, cartImpact, onParticleComplete }) => {
  return (
    <>
      {particles.map((p) => (
        <FlyingProductItem key={p.id} particle={p} onComplete={onParticleComplete} />
      ))}
      {cartImpact && <CartSparkleBurst key={cartImpact.timestamp} impact={cartImpact} />}
    </>
  );
};
