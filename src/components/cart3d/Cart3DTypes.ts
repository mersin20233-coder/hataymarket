import { Product, Order } from '../../types';

export interface FlyingParticle {
  id: string;
  image: string;
  productName: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  targetX: number;
  targetY: number;
  targetElementId: string;
  createdAt: number;
}

export interface CartImpactEffect {
  targetId: string;
  timestamp: number;
  x: number;
  y: number;
}

export interface Cart3DContextType {
  triggerFlyToCart: (product: Product, eventOrElement?: React.MouseEvent | HTMLElement | null) => void;
  cartImpact: CartImpactEffect | null;
  activeParticles: FlyingParticle[];
  isOrderModalOpen: boolean;
  completedOrder: Order | null;
  openOrderModal: (order: Order) => void;
  closeOrderModal: () => void;
  registerTrackHandler: (fn: (orderId: string) => void) => void;
}
