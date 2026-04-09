'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  category: string;
  href: string;
  colors: { label: string; hex: string }[];
  badge?: string | null;
  rating?: number;
  reviewCount?: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  toggleItem: (item: WishlistItem) => void;
  isWished: (id: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item]);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  }, []);

  const isWished = useCallback((id: number) => {
    return items.some(i => i.id === id);
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isWished }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}