import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct {
  id: number;
  slug?: string;
  name: string;
  price: string | number;
  stock: number;
  image_url?: string | null;
  quantity: number;
}

interface CartState {
  cart: CartProduct[];
  count: number;
  addToCart: (product: Omit<CartProduct, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const clamp = (qty: number, stock: number) => Math.max(1, Math.min(qty, Math.max(stock, 1)));

const countUnits = (cart: CartProduct[]) => cart.reduce((sum, item) => sum + item.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      count: 0,

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find((p) => p.id === product.id);
          let newCart: CartProduct[];

          if (existing) {
            newCart = state.cart.map((p) =>
              p.id === product.id
                ? { ...p, quantity: clamp(p.quantity + quantity, product.stock) }
                : p,
            );
          } else {
            newCart = [
              ...state.cart,
              { ...product, quantity: clamp(quantity, product.stock) },
            ];
          }

          return { cart: newCart, count: countUnits(newCart) };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const newCart = state.cart
            .map((p) =>
              p.id === productId ? { ...p, quantity: clamp(quantity, p.stock) } : p,
            )
            .filter((p) => p.quantity > 0);
          return { cart: newCart, count: countUnits(newCart) };
        }),

      removeFromCart: (productId) =>
        set((state) => {
          const newCart = state.cart.filter((p) => p.id !== productId);
          return { cart: newCart, count: countUnits(newCart) };
        }),

      clearCart: () => set({ cart: [], count: 0 }),
    }),
    {
      name: "nexuscore-cart",
      version: 1,
      // Migración: carritos guardados antes de tener cantidades
      migrate: (persisted) => {
        const state = persisted as { cart?: Array<Omit<CartProduct, "quantity">> };
        if (!state?.cart) return { cart: [], count: 0 };
        const cart = state.cart.map((item) => ({ ...item, quantity: 1 }));
        return { cart, count: countUnits(cart) };
      },
    },
  ),
);
