'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { ShoppingCart } from 'lucide-react';

export function CartBadge() {
  const itemCount = useCartStore((state: { items: { id: string }[] }) => state.items.length);
  const total = useCartStore((state: { total: number }) => state.total);

  if (itemCount === 0) {
    return (
      <div className="relative inline-flex items-center text-gray-600">
        <ShoppingCart className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <ShoppingCart className="w-5 h-5 text-gray-700" />
      <span className="absolute -top-1 -right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-brand-500 rounded-full">
        {itemCount > 9 ? '9+' : itemCount}
      </span>
    </div>
  );
}