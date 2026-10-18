import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("nexuscore_token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("nexuscore_token");
        set({ user: null, token: null });
      },
      isAdmin: () => get().user?.role === "admin",
      isStaff: () => get().user?.role === "admin" || get().user?.role === "staff",
    }),
    {
      name: "nexuscore-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
