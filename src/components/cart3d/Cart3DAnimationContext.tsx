import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, Order } from '../../types';
import { Cart3DContextType, FlyingParticle, CartImpactEffect } from './Cart3DTypes';
import { FlyingProductLayer } from './FlyingProductLayer';
import { Cart3DOrderModal } from './Cart3DOrderModal';

const Cart3DContext = createContext<Cart3DContextType | undefined>(undefined);

export const Cart3DProvider: React.FC<{
  children: React.ReactNode;
  onTrackOrder?: (orderId: string) => void;
}> = ({ children, onTrackOrder }) => {
  const [activeParticles, setActiveParticles] = useState<FlyingParticle[]>([]);
  const [cartImpact, setCartImpact] = useState<CartImpactEffect | null>(null);

  // 3D Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [trackHandler, setTrackHandler] = useState<((orderId: string) => void) | null>(null);

  const registerTrackHandler = useCallback((fn: (orderId: string) => void) => {
    setTrackHandler(() => fn);
  }, []);

  const openOrderModal = useCallback((order: Order) => {
    setCompletedOrder(order);
    setIsOrderModalOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setIsOrderModalOpen(false);
    setCompletedOrder(null);
  }, []);

  const triggerFlyToCart = useCallback(
    (product: Product, eventOrElement?: React.MouseEvent | HTMLElement | null) => {
      // 1. Determine Starting Coordinates from DOM
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;
      let startWidth = 64;
      let startHeight = 64;

      if (eventOrElement) {
        let el: HTMLElement | null = null;
        if ('currentTarget' in eventOrElement && eventOrElement.currentTarget) {
          el = eventOrElement.currentTarget as HTMLElement;
        } else if (eventOrElement instanceof HTMLElement) {
          el = eventOrElement;
        }

        if (el) {
          // Look for an image inside the card container for perfect visual origin
          const cardContainer = el.closest('[data-product-card]') || el.closest('.group') || el.parentElement;
          const imgEl = cardContainer ? cardContainer.querySelector('img') : null;
          const sourceRect = (imgEl || el).getBoundingClientRect();

          if (sourceRect.width > 0 && sourceRect.height > 0) {
            startX = sourceRect.left + sourceRect.width / 2;
            startY = sourceRect.top + sourceRect.height / 2;
            startWidth = Math.min(84, Math.max(54, sourceRect.width));
            startHeight = Math.min(84, Math.max(54, sourceRect.height));
          }
        }
      }

      // 2. Dynamically Locate Target Cart Icon (Header or Bottom Bar)
      let targetElementId = 'header-cart-btn';
      let targetX = window.innerWidth - 32;
      let targetY = 28;

      // Check header cart button and bottom nav 3D cart button
      const headerCart = document.getElementById('header-cart-btn');
      const bottomNavCart = document.getElementById('bottom-nav-cart-btn');

      let chosenEl: HTMLElement | null = null;

      // Prioritize the 3D bottom nav cart when visible
      if (bottomNavCart) {
        const bRect = bottomNavCart.getBoundingClientRect();
        if (bRect.top >= 0 && bRect.bottom <= window.innerHeight + 80 && bRect.width > 0) {
          chosenEl = bottomNavCart;
          targetElementId = 'bottom-nav-cart-btn';
        }
      }

      // Fallback to header cart button
      if (!chosenEl && headerCart) {
        const hRect = headerCart.getBoundingClientRect();
        if (hRect.top >= 0 && hRect.bottom <= window.innerHeight && hRect.width > 0) {
          chosenEl = headerCart;
          targetElementId = 'header-cart-btn';
        }
      }

      if (chosenEl) {
        const rect = chosenEl.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      // 3. Create independent flying particle
      const particle: FlyingParticle = {
        id: `fly-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        image: product.image,
        productName: product.name,
        startX,
        startY,
        startWidth,
        startHeight,
        targetX,
        targetY,
        targetElementId,
        createdAt: Date.now(),
      };

      setActiveParticles((prev) => [...prev, particle]);
    },
    []
  );

  const handleParticleComplete = useCallback(
    (id: string, targetId: string, x: number, y: number) => {
      // Remove finished particle
      setActiveParticles((prev) => prev.filter((p) => p.id !== id));

      // Trigger 3D Cart Impact
      setCartImpact({
        targetId,
        timestamp: Date.now(),
        x,
        y,
      });

      // Apply 3D wiggle & elastic bounce class directly to target button
      const targetBtn = document.getElementById(targetId);
      if (targetBtn) {
        targetBtn.classList.remove('cart-3d-jump');
        // Force reflow
        void targetBtn.offsetWidth;
        targetBtn.classList.add('cart-3d-jump');
      }

      // Also bounce the badge
      const badge = targetBtn?.querySelector('[data-cart-badge="true"]');
      if (badge) {
        badge.classList.remove('cart-badge-bounce');
        void badge.clientWidth;
        badge.classList.add('cart-badge-bounce');
      }

      // Clear impact after animation finishes
      setTimeout(() => {
        setCartImpact(null);
      }, 550);
    },
    []
  );

  return (
    <Cart3DContext.Provider
      value={{
        triggerFlyToCart,
        cartImpact,
        activeParticles,
        isOrderModalOpen,
        completedOrder,
        openOrderModal,
        closeOrderModal,
        registerTrackHandler,
      }}
    >
      {children}

      {/* Independent 3D Flying Layer */}
      <FlyingProductLayer
        particles={activeParticles}
        cartImpact={cartImpact}
        onParticleComplete={handleParticleComplete}
      />

      {/* 3D Order Modal */}
      <Cart3DOrderModal
        isOpen={isOrderModalOpen}
        order={completedOrder}
        onClose={closeOrderModal}
        onTrackOrder={(orderId) => {
          if (trackHandler) {
            trackHandler(orderId);
          } else if (onTrackOrder) {
            onTrackOrder(orderId);
          }
        }}
      />
    </Cart3DContext.Provider>
  );
};

export const useCart3D = (): Cart3DContextType => {
  const context = useContext(Cart3DContext);
  if (!context) {
    throw new Error('useCart3D must be used within a Cart3DProvider');
  }
  return context;
};
