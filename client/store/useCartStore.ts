import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartProduct {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  image_url?: string | null;
}

interface CartState {
  cart: CartProduct[];
  count: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      count: 0,

      addToCart: (product) =>
        set((state) => {
          const newCart = [...state.cart, product];
          return { cart: newCart, count: newCart.length };
        }),

      removeFromCart: (productId) =>
        set((state) => {
          const newCart = state.cart.filter((p) => p.id !== productId);
          return { cart: newCart, count: newCart.length };
        }),

      clearCart: () => set({ cart: [], count: 0 }),
    }),
    {
      name: "nexuscore-cart",
    },
  ),
);
