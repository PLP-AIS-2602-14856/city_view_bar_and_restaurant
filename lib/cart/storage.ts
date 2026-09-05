import type { CartItem } from '@/lib/cart/types';

const STORAGE_KEY = 'cityview.cart.v1';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or inaccessible storage (private browsing, quota, etc.) — start fresh
    // rather than crashing the storefront over a cart that can't be read.
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — the cart still works for this page load
    // via in-memory state, it just won't survive a refresh.
  }
}
